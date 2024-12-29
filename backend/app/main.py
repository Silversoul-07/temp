# from fastapi import FastAPI
# from fastapi.responses import RedirectResponse
# from fastapi.middleware.cors import CORSMiddleware

# from .database import Base, engine
# from .images.routes import router as image_router
# from .users.routes import router as user_router

# Base.metadata.create_all(bind=engine)

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
# app.include_router(user_router)
# app.include_router(image_router)

# @app.get("/")
# def redirect_to_docs():
#     return RedirectResponse(url="/docs")

# @app.get("/health")
# def get_health():
#     print("healthy")
#     return {"status": "ok"}

# @app.get("/api/health")
# def get_api_health():
#     return {"status": "ok"}
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from PIL import Image
import torch
import faiss
import numpy as np
from transformers import CLIPProcessor, CLIPModel
import timm
import urllib
from io import BytesIO
import os
import shutil

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
IMAGES_DIR = "images"
os.makedirs(IMAGES_DIR, exist_ok=True)
app.mount("/images", StaticFiles(directory=IMAGES_DIR), name="images")

siglip_model = timm.create_model(
    'vit_so400m_patch14_siglip_224',
    pretrained=True,
    num_classes=0,
)
siglip_model = siglip_model.eval()

# get model specific transforms (normalization, resize)
data_config = timm.data.resolve_model_data_config(siglip_model)
transforms = timm.data.create_transform(**data_config, is_training=False)


models = {
    "clip": {
        "model": CLIPModel.from_pretrained("openai/clip-vit-large-patch14"),
        "processor": CLIPProcessor.from_pretrained("openai/clip-vit-large-patch14")
    },
    "siglip": {
        "model": None,
        "processor": None
    },
    "dino": {
        "model": torch.hub.load('facebookresearch/dinov2', 'dinov2_vitl14'),
        "processor": None
    }
}


indices = {
    "clip": faiss.IndexFlatL2(768),
    "siglip": faiss.IndexFlatL2(1152),
    "dino": faiss.IndexFlatL2(1024)
}

image_paths = {
    "clip": [],
    "siglip": [],
    "dino": []
}

def process_image(image: Image, model_type: str):
    if model_type == "clip":
        inputs = models[model_type]["processor"](images=image, return_tensors="pt")
        features = models[model_type]["model"].get_image_features(**inputs)
        print(features.shape)
    elif model_type == "siglip":
        features = siglip_model(transforms(image).unsqueeze(0))  # output is (batch_size, num_features) shaped tensor
    else:  # dino
        image = image.resize((224, 224))
        image = torch.from_numpy(np.array(image)).permute(2, 0, 1).float() / 255.0
        image = image.unsqueeze(0)
        features = models[model_type]["model"](image)
    
    return features.detach().numpy()

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(IMAGES_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        image = Image.open(file_path).convert('RGB')
        for model_type in models.keys():
            features = process_image(image, model_type)
            indices[model_type].add(features)
            image_paths[model_type].append(file.filename)
            print(f"Image indexed successfully for {model_type}")
        
        return {"message": "Image indexed successfully for all models"}
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/visual-search")
async def visual_search(
    file: UploadFile = File(...),
    model_type: str = "clip",
    k: int = 5
):
    if model_type not in models:
        raise HTTPException(400, f"Invalid model type. Choose from: {list(models.keys())}")
    
    try:
        query_image = Image.open(BytesIO(await file.read())).convert('RGB')
        query_features = process_image(query_image, model_type)
        print('computed features')
        D, I = indices[model_type].search(query_features, k)
        print(len(D[0]), len(I[0]))
        print('computed search')
        base_url = "http://localhost:8000/files/"
        results = [
            {
                "filename": image_paths[model_type][i],
                "url": f"{base_url}{image_paths[model_type][i]}",
                "distance": float(d)
            }
            for d, i in zip(D[0], I[0])
        ]
        
        return {"results": results}
    except Exception as e:
        raise HTTPException(500, str(e))
