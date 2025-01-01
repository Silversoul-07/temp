import os
os.environ['TF_ENABLE_ONEDNN_OPTS']='0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

import asyncio
import torch
import torch.nn as nn
from typing import Any, Optional
from transformers import CLIPModel, CLIPProcessor, CLIPTokenizerFast
from PIL import Image
import logging
import time
import pytorch_lightning as pl

class ModelManager:
    def __init__(self, idle_timeout: int = 300):
        self._models = {}
        self._idle_timeout = idle_timeout
        self._lock = asyncio.Lock()
        self._last_access = {}
        self._cleanup_task = asyncio.create_task(self._cleanup_idle_models())

    async def load(self, model_name: str, model_class):
        print(f"Loading {model_name}...")
        async with self._lock:
            if model_name not in self._models:
                try:
                    self._models[model_name] = await model_class.loader()
                    self._last_access[model_name] = time.time()
                except Exception as e:
                    logging.error(f"Error loading model {model_name}: {e}")
                    raise
            else:
                self._last_access[model_name] = time.time()
            print(f"Loaded {model_name}.")
            return self._models[model_name]

    async def unload(self, model_name: str):
        async with self._lock:
            if model_name in self._models:
                try:
                    del self._models[model_name]
                    del self._last_access[model_name]
                except Exception as e:
                    logging.error(f"Error unloading model {model_name}: {e}")
                    raise

    async def _cleanup_idle_models(self):
        while True:
            await asyncio.sleep(self._idle_timeout)
            current_time = time.time()
            async with self._lock:
                for model_name in list(self._models.keys()):
                    if current_time - self._last_access.get(model_name, 0) > self._idle_timeout:
                        await self.unload(model_name)


class ClipEmbedder:
    def __init__(self, model: CLIPModel, processor: CLIPProcessor, tokenizer: CLIPTokenizerFast):
        self.model = model
        self.processor = processor
        self.tokenizer = tokenizer

    @classmethod
    async def loader(cls):
        try:
            model = await asyncio.to_thread(CLIPModel.from_pretrained, "openai/clip-vit-large-patch14")
            processor = await asyncio.to_thread(CLIPProcessor.from_pretrained, "openai/clip-vit-large-patch14")
            tokenizer = await asyncio.to_thread(CLIPTokenizerFast.from_pretrained, "openai/clip-vit-large-patch14")
            return cls(model, processor, tokenizer)
        except Exception as e:
            logging.error(f"Error loading CLIP model: {e}")
            raise

    async def predict(self, text: str) -> Optional[torch.Tensor]:
        try:
            inputs = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True)
            with torch.no_grad():
                text_features = self.model.get_text_features(**inputs)
            return text_features / text_features.norm(dim=-1, keepdim=True)
        except Exception as e:
            logging.error(f"Error in predict: {e}")
            return None

    async def img2vec(self, image: Image.Image) -> Optional[torch.Tensor]:
        try:
            inputs = self.processor(images=image, return_tensors="pt")
            with torch.no_grad():
                image_features = self.model.get_image_features(**inputs)
            return image_features / image_features.norm(dim=-1, keepdim=True)
        except Exception as e:
            logging.error(f"Error in img2vec: {e}")
            return None


class MLP(pl.LightningModule):
    def __init__(self, input_size=768):
        super().__init__()
        self.input_size = input_size
        self.layers = nn.Sequential(
            nn.Linear(self.input_size, 1024),
            nn.Dropout(0.2),
            nn.Linear(1024, 128),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.Dropout(0.1),
            nn.Linear(64, 16),
            nn.Linear(16, 1)
        )

    def forward(self, x):
        return self.layers(x)
    
class AestheticScorer:
    def __init__(self):
        self.device = 'cpu'
        self.model_path = '/home/praveen/cloudforge/inference/state.pth'    
        self.model = MLP()
        try:
            state = torch.load(self.model_path, map_location=self.device)
            self.model.load_state_dict(state)
            self.model.to(self.device)
            self.model.eval()
        except Exception as e:
            logging.error(f"Error loading MLP model: {e}")
            raise

    @classmethod
    async def loader(cls):
        try:
            instance = cls()
            return instance
        except Exception as e:
            logging.error(f"Error in AestheticScorer.loader: {e}")
            raise

    async def predict(self, img, model_manager: ModelManager):
        try:
            # Load ClipEmbedder via ModelManager
            clip_embedder: ClipEmbedder = await model_manager.load("clip", ClipEmbedder)

            if isinstance(img, str):
                img = Image.open(img).convert("RGB")
            image_embedding = await clip_embedder.img2vec(img)
            if image_embedding is None:
                logging.error("Failed to generate image embedding.")
                return None

            # Ensure image_embedding is on the correct device and has the right datatype
            if isinstance(image_embedding, torch.Tensor):
                embedding = image_embedding.to(self.device)
            else:
                embedding = torch.tensor(image_embedding).to(self.device)

            with torch.no_grad():
                prediction = self.model(embedding)

            if self.device == "cuda":
                prediction = prediction.cpu()

            return prediction.item()
        except Exception as e:
            logging.error(f"Error in AestheticScorer.predict: {e}")
            return None

