from sqlalchemy import Column, String, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4
from ..database import Base
from sqlalchemy import Table, Column, Integer

collection_followers = Table(
    'collection_followers',
    Base.metadata,
    Column('user_id', UUID(as_uuid=False), ForeignKey('users.id'), primary_key=True),
    Column('collection_id', Integer, ForeignKey('collections.id'), primary_key=True),
        extend_existing=True

)

class Follow(Base):
    __tablename__ = "follows"
    
    follower_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), primary_key=True)
    followed_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=False), primary_key=True, default=uuid4)
    name = Column(String(50), nullable=False)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    avatar = Column(String(512), nullable=True)
    bio = Column(String(300), nullable=True)  # Added bio field
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    collections = relationship("Collection", back_populates="owner")
    followed_collections = relationship("Collection", secondary=collection_followers, back_populates="followers")
    followers = relationship(
        "User",
        secondary="follows",
        primaryjoin=id == Follow.followed_id,
        secondaryjoin=id == Follow.follower_id,
        backref="following"
    )
