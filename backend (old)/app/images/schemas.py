from pydantic import BaseModel, HttpUrl, UUID4
from datetime import datetime
from .models import MediaType
from typing import Optional

class uploadMedia(BaseModel):
    title: str
    media: bytes|None
    url: HttpUrl|None

class MediaCreate(BaseModel):
    title: str
    url: str

class MediaResponse(MediaCreate):
    id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True

class MediaResponse2(MediaCreate):
    id: int
    numImages: int
    created_at: datetime

    class Config:
        from_attributes = True