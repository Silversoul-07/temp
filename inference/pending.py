from pymilvus import connections, Collection, DataType, CollectionSchema, FieldSchema
import logging
import numpy as np
from typing import Optional, Dict
from deepface import DeepFace


def create_embedding_collection():
    fields = [
        FieldSchema(name="id", dtype=DataType.VARCHAR, max_length=255, is_primary=True),
        FieldSchema(name="image_embedding", dtype=DataType.FLOAT_VECTOR, dim=768),
        FieldSchema(name="text_embedding", dtype=DataType.FLOAT_VECTOR, dim=768)
    ]
    schema = CollectionSchema(fields=fields)
    collection = Collection("Embeddings", schema)
    
    index_params = {"index_type": "IVF_FLAT", "metric_type": "IP", "params": {"nlist": 1024}}
    collection.create_index("image_embedding", index_params)
    collection.create_index("text_embedding", index_params)
    return collection

def create_face_collection():
    fields = [
        FieldSchema(name="id", dtype=DataType.VARCHAR, max_length=255, is_primary=True),
        FieldSchema(name="face_embed", dtype=DataType.FLOAT_VECTOR, dim=512)
    ]
    schema = CollectionSchema(fields=fields)
    collection = Collection("FaceRecognition", schema)
    
    index_params = {"index_type": "IVF_FLAT", "metric_type": "IP", "params": {"nlist": 1024}}
    collection.create_index("face_embed", index_params)
    return collection

def initialize():
    connections.connect("default", uri="http://localhost:19530")
    create_embedding_collection()
    create_face_collection()




class FaceRecognizer:
    def __init__(
        self,
        uri: str = "http://localhost:19530",
        model_name: str = "Facenet512",
        detector_backend: str = "retinaface",
        similarity_threshold: float = 0.9
    ):
        self.model_name = model_name
        self.detector_backend = detector_backend
        self.embedding_dim = 512
        self.similarity_threshold = similarity_threshold
        self._initialize_connection(uri)

    def _initialize_connection(self, uri: str) -> None:
        connections.connect("default", uri=uri)
        self.collection = Collection("FaceRecognition")
        self.collection.load()

    def _get_embedding(self, image: str) -> list[float]:
        result = DeepFace.represent(
            img_path=image,
            model_name=self.model_name,
            detector_backend=self.detector_backend
        )
        embedding = np.array(result[0]["embedding"]).astype("float32")
        norm = np.linalg.norm(embedding)
        if norm > 0:
            embedding = embedding / norm
        return embedding.tolist()

    def add_face(self, image: str, identity: str) -> bool:
        try:
            embedding = self._get_embedding(image)
            data = {
                "id": [identity],
                "face_embed": [embedding]
            }
            self.collection.insert(data)
            self.collection.flush()
            return True
        except Exception as e:
            logging.error(f"Face addition failed - {identity}: {str(e)}")
            return False

    def predict(self, image: str) -> Optional[str]:
        try:
            embedding = self._get_embedding(image)
            
            results = self.collection.search(
                data=[embedding],
                anns_field="face_embed",
                param={"metric_type": "IP", "params": {"nprobe": 10}},
                limit=1
            )

            if not results[0]:
                return None

            match = results[0][0]
            if match.score < self.similarity_threshold:
                return None

            return match.id

        except Exception as e:
            logging.error(f"Prediction failed: {str(e)}")
            return None

    def __del__(self):
        try:
            connections.disconnect("default")
        except:
            pass