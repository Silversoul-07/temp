from . import models, schemas
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def get_user_by_id(db: Session, user_id:UUID) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

async def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    """Get user by email address."""
    return db.query(models.User).filter(models.User.username == username.lower()).first()

async def get_user_by_id(db: Session, user_id: UUID) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()

async def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """Create a new user."""
    db_user = models.User(
        name=user.name,
        username=user.username,
        password=pwd_context.hash(user.password),
        avatar=user.avatar,
        bio=user.bio
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

async def add_follower(db: Session, follower_id: str, followed_id: str):
    if follower_id == followed_id:
        raise ValueError("Users cannot follow themselves.")
    follow = db.query(models.Follow).filter_by(follower_id=follower_id, followed_id=followed_id).first()
    if not follow:
        new_follow = models.Follow(follower_id=follower_id, followed_id=followed_id)
        db.add(new_follow)
        db.commit()
        db.refresh(new_follow)
    return

async def remove_follower(db: Session, follower_id: str, followed_id: str):
    follow = db.query(models.Follow).filter_by(follower_id=follower_id, followed_id=followed_id).first()
    if follow:
        db.delete(follow)
        db.commit()
    return

async def get_profile(db: Session, username: str, owner_id: str):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        return None
    
    is_following = db.query(models.Follow).filter_by(follower_id=user.id, followed_id=owner_id).first() is not None
    is_owner = owner_id == user.id
    follower_count = db.query(models.Follow).filter(models.Follow.follower_id == user.id).count()
    profile = {
        "id": user.id,
        "name": user.name,
        "username": user.username,
        "avatar": user.avatar,
        "bio": user.bio,
        "created_at": user.created_at,
        "follower_count": follower_count,
        "is_following": is_following,
        "is_owner": is_owner
    }
    
    return profile