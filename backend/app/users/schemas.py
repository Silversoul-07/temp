from pydantic import BaseModel, UUID4
from typing import Optional

class UserBase(BaseModel):
    name: str
    username: str
    avatar: Optional[str] = None

class UserData(BaseModel):
    uid: UUID4
    name: str
    username: str
    avatar: Optional[str] = None

class UserCreate(BaseModel):
    name: str
    username: str
    password: str
    bio: Optional[str] = None
    avatar: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserData

class AuthForm(BaseModel):
    username: str
    password: str
