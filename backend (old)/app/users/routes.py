from fastapi import APIRouter, Depends, HTTPException, status, Form, File, UploadFile
from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import timedelta
from . import schemas
from .utils import get_db, authenticate_user, create_access_token, upload_media_to_minio, validate_user
from .crud import create_user, get_user_by_username, get_user_by_id, add_follower, remove_follower, get_profile
from uuid import UUID
from ..images.crud import create_collection

router = APIRouter(prefix="/api", tags=["users"])

    
@router.get("/users/{username}", response_model=None, tags=["users"])
async def get_user_profile(
    username: str,
    owner_id: str = Depends(validate_user),
    db: Session = Depends(get_db),
):
    """Get user profile."""
    profile = await get_profile(db, username, owner_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return profile

@router.post("/users", tags=["users"])
async def create_dbuser(
    name: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    bio: str = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Create a new user with profile picture."""
    # Check if email already exists
    if await get_user_by_username(db, username=username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Save profile picture to data folder
    pic_data = await image.read()
    filename = f"{name.replace(' ', '_')}.png"
    img_url = await upload_media_to_minio(pic_data, filename)

    user = schemas.UserCreate(
        name=name,
        username=username,
        password=password,
        avatar=img_url,
        bio=bio
    )
    
    new_user = await create_user(db, user)
    kwargs = {
        "title": f"Saved",
        "description": None,
        "tags": None,
        "thumbnail": None,
        "user_id": new_user.id
    }
    create_collection(db, kwargs)
        
    return new_user

@router.post("/auth", response_model=schemas.Token, tags=["users"])
async def login_for_access_token(
    form_data: schemas.AuthForm,
    db: Session = Depends(get_db),
):
    """Authenticate user and return access token."""
    user = await authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = await create_access_token(
        data={"sub": str(user.id)},
        expires_delta=timedelta(days=30)
    )

    userData = {
        "uid": user.id,
        "name": user.name,
        "username": user.username,
        "avatar": user.avatar
    }    

    return {"access_token": access_token, "token_type": "bearer", "user": userData}

@router.get("/session", response_model=None, tags=["users"])
async def get_current_user(
    user_id: str = Depends(validate_user),
    db: Session = Depends(get_db)
):
    """Get current user."""
    print(user_id)
    if not user_id:
        return None
    user_id = UUID(user_id)
    return await get_user_by_id(db, user_id)

@router.post("/users/{username}/followers", status_code=201)
async def follow_user(
    username: str,
    uid: str = Depends(validate_user),
    db: Session = Depends(get_db),
):
    try:
        fid = (await get_user_by_username(db, username=username)).id
        await add_follower(db, fid, uid)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/users/{username}/followers", status_code=204)
async def unfollow_user(
    username: str,
    uid: str = Depends(validate_user),
    db: Session = Depends(get_db),
):
    try:
        fid = (await get_user_by_username(db, username=username)).id
        await remove_follower(db, fid, uid)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
