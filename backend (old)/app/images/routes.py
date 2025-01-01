from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from sqlalchemy.orm import Session
from ..database import get_db
from .schemas import MediaResponse, MediaResponse2
from .models import Image
from .utils import upload_media_to_minio, download_media, extract_color_histogram, search_images_by_color
from ..users.utils import validate_user
from random import randint
from uuid import UUID
from sqlalchemy.sql import func
from .crud import get_collection, get_collection_in_images, get_collections_by_user, create_collection, create_image, add_image_to_collection, get_collection_id, get_all_collections, add_follower_to_collection, remove_follower_from_collection

router = APIRouter(prefix="/api", tags=["images"])

@router.post("/upload", response_model=MediaResponse)
async def upload_media(
    title: str = Form(...),
    image: UploadFile = File(None),
    imageUrl: str = Form(None),
    collection: str = Form(None),
    download: bool = Form(True),
    user_id: str = Form(None),
    db: Session = Depends(get_db)
):
    if image:
        file_content = await image.read()
        media_url = upload_media_to_minio(file_content, image.filename)
    elif imageUrl and download:
        filename, content = download_media(imageUrl)
        media_url = upload_media_to_minio(content, filename)
    elif imageUrl:
        media_url = imageUrl
    else:
        raise HTTPException(status_code=400, detail="No media provided")
    
    # Create database entry with color histogram
    kwargs = {
        "title": title,
        "url": media_url
    }
    new_image = create_image(db, kwargs)
    collection_id = get_collection_id(db, collection)
    add_image_to_collection(db, new_image.id, collection_id)
    
    return new_image


@router.get("/media", response_model=list[MediaResponse])
async def fetch_media(db: Session = Depends(get_db)):
    # fetch random
    media_list = db.query(Image).order_by(func.random()).limit(100).all()
    return media_list

@router.get("/media/{media_id}", response_model=MediaResponse)
async def fetch_media(media_id: str, db: Session = Depends(get_db)):
    try:
        media_uuid = UUID(media_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid media ID format")

    media = db.query(Image).filter(Image.id == media_uuid).first()
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    return media

@router.get("/explore", response_model=list[MediaResponse2])
async def explore_media(db: Session = Depends(get_db)):
    media_list = db.query(Image).order_by(Image.created_at.desc()).limit(16).all()
    data = []
    for media in media_list:
        temp = media.__dict__
        temp['numImages'] = randint(1, 10)    
        data.append(temp) 
    return data

@router.get("/tags")
async def get_tags():
    return {"tags": [f"tags{i}" for i in range(1, 30)]}

@router.post("/search", response_model=None)
async def search_media(
    q: str = Form(None),
    i: UploadFile = File(None),
    c: str = Form(None),
    t: str = Form(None),
    cn: str = Form(None),
    u: str = Form(None),
    db: Session = Depends(get_db)
):
    '''
    params:
    q: query string
    i: image file
    c: color
    t: tag
    cn: collection name
    '''

    file_content = await i.read()
    target_histogram = extract_color_histogram(file_content)
    results = await search_images_by_color(db, target_histogram)
    return results

@router.get("/profile")
def search_media():
    return  {
  "id": "1",
  "username": "john_doe",
  "about": "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  "profileImage": "https://example.com/profile.jpg",
  "backgroundImage": "https://example.com/background.jpg",
  "followers": 150,
  "following": 75,
  "collections": ["1", "2", "3"],
  "favoriteTags": ["typescript", "react", "nodejs"],
  "owner": True,
}

@router.post("/collections", response_model=None)
async def create_dbcollection(title: str, 
                        description: str, 
                        tags: list[str], 
                        user_id:str,
                        thumbnail: UploadFile = File(None),
                        db: Session = Depends(get_db)):
    file = await thumbnail.read()
    url = upload_media_to_minio(file, thumbnail.filename)
    kwargs = {
        "title": title,
        "description": description,
        "tags": tags,
        "thumbnail": url,
        "user_id": user_id
    }
    collection = create_collection(db, kwargs)
    return collection

@router.get("/collections", response_model=None)
def get_collections(db: Session = Depends(get_db)):
    collections = get_all_collections(db)
    print(collections[0])
    return collections

@router.get("/collections/{title}", response_model=None)
def collection_info(title: str, user_id:str=Depends(validate_user), db: Session = Depends(get_db)):
    collection = get_collection(db, title, user_id)
    return collection

@router.get("/collections/{title}/images", response_model=None)
def collection_images(title: str, db: Session = Depends(get_db)):
    collection = get_collection_in_images(db, title)
    return collection

@router.get("/user/{username}/collections", response_model=None)
def get_collections(username: str, db: Session = Depends(get_db)):
    collections = get_collections_by_user(db, username)
    return collections

@router.post("/collections/{collection}/followers", response_model=None)
def follow_collection(collection: str,  db: Session = Depends(get_db), user_id:str = Depends(validate_user)):
    add_follower_to_collection(db, collection, user_id)
    return

@router.delete("/collections/{collection}/followers", response_model=None)
def unfollow_collection(collection: str,  db: Session = Depends(get_db), user_id:str = Depends(validate_user)):
    remove_follower_from_collection(db, collection, user_id)
    return