# app/main.py
from fastapi import FastAPI, File, UploadFile, Form, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from transformers import AutoProcessor, AutoModel
import torch
from PIL import Image
import io
from pymilvus import connections, Collection, utility, DataType
import numpy as np
from typing import Optional
import os

app = FastAPI()
templates = Jinja2Templates(directory="templates")
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize CLIP model and processor
processor = AutoProcessor.from_pretrained("google/siglip-so400m-patch14-384")
model = AutoModel.from_pretrained("google/siglip-so400m-patch14-384")
model.eval()
# Connect to Milvus
connections.connect(
    alias="default",
    host=os.getenv("MILVUS_HOST", "localhost"),
    port=os.getenv("MILVUS_PORT", "19530")
)

def create_collection_if_not_exists():
    collection_name = "image_embeddings"
    dim = 1152  # SIGLIP embedding dimension
    # utility.drop_collection(collection_name)
    if utility.has_collection(collection_name):
        return Collection(collection_name)
    
    from pymilvus import FieldSchema, CollectionSchema
    fields = [
        FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
        FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=dim),
        FieldSchema(name="image_path", dtype=DataType.VARCHAR, max_length=256)
    ]
    schema = CollectionSchema(fields=fields)
    collection = Collection(name=collection_name, schema=schema)
    
    # Create index
    index_params = {
        "metric_type": "COSINE",
        "index_type": "IVF_FLAT",
        "params": {"nlist": 128}
    }
    collection.create_index(field_name="embedding", index_params=index_params)
    return collection

collection = create_collection_if_not_exists()

def get_embedding(image):
    with torch.no_grad():
        inputs = processor(images=image, return_tensors="pt")
        image_features = model.get_image_features(**inputs)
    return image_features.cpu().detach().numpy()[0].astype(float).tolist()


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse(
        "index.html",
        {"request": request}
    )

@app.post("/index")
async def index_image(image: UploadFile = File(...)):
    # Read and process image
    contents = await image.read()
    pil_image = Image.open(io.BytesIO(contents))
    
    # Generate embedding
    embedding = get_embedding(pil_image)    
    # Save image to disk
    image_path = f"static/uploads/{image.filename}"
    os.makedirs("static/uploads", exist_ok=True)
    pil_image.save(image_path)
    
    # Insert into Milvus
    collection.insert([
        [embedding],      # Ensure embedding is a list of floats within a list
        [image_path]
    ])
    collection.flush()
    
    return {"status": "success", "message": "Image indexed successfully"}

@app.post("/search")
async def search(
    query_text: str = Form(None),
    query_image: Optional[UploadFile] = None
):
    if query_text:
        # Text-to-image search
        inputs = processor(text=query_text, return_tensors="pt", padding=True)
        with torch.no_grad():
            text_features = model.get_text_features(**inputs)
        query_vector = text_features[0].numpy()
    elif query_image:
        # Image-to-image search
        contents = await query_image.read()
        pil_image = Image.open(io.BytesIO(contents))
        query_vector = get_embedding(pil_image)
    else:
        return {"error": "Either query text or image must be provided"}

    # Search in Milvus
    collection.load()
    search_params = {"metric_type": "COSINE", "params": {"nprobe": 10}}
    results = collection.search(
        data=[query_vector.tolist()],
        anns_field="embedding",
        param=search_params,
        limit=5,
        output_fields=["image_path"]
    )

    # Format results
    search_results = []
    for hits in results:
        for hit in hits:
            search_results.append({
                "image_path": hit.entity.get("image_path"),
                "score": float(hit.score)
            })

    return {"results": search_results}