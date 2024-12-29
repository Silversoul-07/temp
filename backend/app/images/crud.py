from sqlalchemy.orm import Session
from .models import Collection, Image
from ..users.models import User
from uuid import UUID
from .models import Image, Collection, image_collection_association
from sqlalchemy.sql import func

def get_all_collections(db: Session, skip: int = 0, limit: int = 100):
    results = db.query(
        Collection,
        func.count(Image.id).label('image_count')
    )\
    .outerjoin(Collection.images)\
    .group_by(Collection.id)\
    .order_by(Collection.created_at.desc())\
    .offset(skip)\
    .limit(limit)\
    .all()

    return [
        {
            **collection.__dict__,
            'image_count': count,
            '_sa_instance_state': None
        } 
        for collection, count in results
    ]
# ...existing code...
def get_collection(db:Session, title: str, user_id: str):
    collection = db.query(Collection).filter(Collection.title == title).first()
    user = db.query(User).filter(User.id == collection.user_id).first()
    is_owner = user.id == user_id
    if is_owner:
        is_following = None
    else:
        print(user_id)
        is_following = db.query(Collection).filter(Collection.id == collection.id).filter(Collection.followers.any(User.id == user_id)).first() is not None
    return {
        "title": collection.title,
        "description": collection.description,
        "tags": collection.tags,
        "user": user.username,
        "count": len(collection.images),
        "followers": len(collection.followers),
        "is_following": is_following,
        "is_owner": is_owner
    }

def add_follower_to_collection(db: Session, collection: str, user_id: str):
    collection_obj = db.query(Collection).filter(Collection.title == collection).first()
    if not collection_obj:
        raise ValueError("Collection not found")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")
    
    collection_obj.followers.append(user)
    db.commit()
    db.refresh(collection_obj)
    return collection_obj
def remove_follower_from_collection(db: Session, collection: str, user_id: str):
    collection_obj = db.query(Collection).filter(Collection.title == collection).first()
    if not collection_obj:
        raise ValueError("Collection not found")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError("User not found")
    
    collection_obj.followers.remove(user)
    db.commit()
    db.refresh(collection_obj)
    return collection_obj

def get_collection_in_images(db: Session, title: str):
    collection = db.query(Collection).filter(Collection.title == title).first()
    if not collection:
        raise ValueError("Collection not found")
    return collection.images



def create_collection(db: Session, collection_data: dict):
    owner_id = collection_data.pop("user_id")
    user = db.query(User).filter(User.id == owner_id).first()
    if not user:
        raise ValueError("User not found.")
    is_exist = db.query(Collection).filter(Collection.title == collection_data["title"]).first() is not None
    if is_exist:
        raise ValueError("Collection already exists.")
    collection = Collection(**collection_data)
    user.collections.append(collection)  # Establish relationship
    db.add(collection)
    db.commit()
    db.refresh(collection)
    return collection

def get_collections_by_user(db: Session, username: int):
    user:User = db.query(User).filter(User.username == username).first()
    if not user:
        return None
    results = db.query(Collection, func.count(Image.id).label('image_count'))\
        .filter(Collection.user_id == user.id)\
        .outerjoin(Collection.images)\
        .group_by(Collection.id)\
        .all()


    return [
        {
            **collection.__dict__,
            'image_count': count,
            '_sa_instance_state': None
        } 
        for collection, count in results
    ]

def create_image(db: Session, image_data: dict):
    image = Image(**image_data)
    db.add(image)
    db.commit()
    db.refresh(image)
    return image


def add_image_to_collection(db: Session, image_id: UUID, collection_id: int):
    collection = db.query(Collection).filter(Collection.id == collection_id).first()
    image = db.query(Image).filter(Image.id == image_id).first()
    
    if not collection or not image:
        raise ValueError("Collection or Image not found")
    
    collection.images.append(image)
    db.commit()
    db.refresh(collection)
    
    return collection

def get_collection_id(db: Session, title: str):
    collection = db.query(Collection).filter(Collection.title == title).first()
    return collection.id