from sqlalchemy import Column, String, DateTime, Integer, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from uuid import uuid4
from enum import Enum
from ..database import Base

class MediaType(str, Enum):
    image = "image"
    video = "video"
    audio = "audio"


# Association table for many-to-many relationship between Images and Collections
image_collection_association = Table(
    'image_collection_association',
    Base.metadata,
    Column('image_id', UUID(as_uuid=False), ForeignKey('images.id'), primary_key=True),
    Column('collection_id', Integer, ForeignKey('collections.id'), primary_key=True)
)

collection_followers = Table(
    'collection_followers',
    Base.metadata,
    Column('user_id', UUID(as_uuid=False), ForeignKey('users.id'), primary_key=True),
    Column('collection_id', Integer, ForeignKey('collections.id'), primary_key=True),
        extend_existing=True
)


class Image(Base):
    __tablename__ = "images"

    id = Column(UUID(as_uuid=False), primary_key=True, index=True, default=uuid4)
    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    collections = relationship("Collection", secondary=image_collection_association, back_populates="images")

class Collection(Base):
    __tablename__ = "collections"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    tags = Column(ARRAY(String), nullable=True)
    thumbnail = Column(String, nullable=True)
    user_id = Column(UUID(as_uuid=False), ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="collections")
    images = relationship("Image", secondary=image_collection_association, back_populates="collections")
    followers = relationship("User", secondary=collection_followers, back_populates="followed_collections")
