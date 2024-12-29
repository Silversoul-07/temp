import requests
import uuid
import io
import cv2
import numpy as np
import mimetypes
from sqlalchemy.orm import Session
from fake_useragent import UserAgent
from .models import Image, MediaType
from ..minio import get_minio_client, create_bucket

import io
import uuid
import mimetypes
import requests
from typing import Optional, Tuple
from fake_useragent import UserAgent

def download_media(url: str, max_size_mb: int = 100) -> Tuple[Optional[str], Optional[bytes]]:
    ua = UserAgent()
    headers = {
        "User-Agent": ua.random
    }
    
    try:
        # Stream the download to check content length and prevent large downloads
        response = requests.get(url, headers=headers, stream=True)
        
        # Check for successful response
        response.raise_for_status()
        
        # Check content length before downloading
        content_length = response.headers.get('content-length')
        if content_length:
            size_mb = int(content_length) / (1024 * 1024)
            if size_mb > max_size_mb:
                print(f"File size {size_mb:.2f}MB exceeds maximum limit of {max_size_mb}MB")
                return None, None
        
        # Determine file extension from URL or Content-Type
        file_ext = url.split('.')[-1]
        content_type = response.headers.get('content-type', '').split(';')[0]
        
        # Validate file extension for media types
        valid_media_extensions = [
            'mp4', 'avi', 'mov', 'mkv',  # Video
            'jpg', 'jpeg', 'png', 'gif',  # Image
            'mp3', 'wav', 'flac'  # Audio
        ]
        
        if file_ext.lower() not in valid_media_extensions:
            print(f"Unsupported file extension: {file_ext}")
            return None, None
        
        # Download the full content
        content = response.content
        
        # Generate a secure filename
        filename = f"{uuid.uuid4()}.{file_ext}"
        
        return filename, content
    
    except requests.RequestException as e:
        print(f"Error downloading media: {e}")
        return None, None

def upload_media_to_minio(
    file_content: bytes, 
    filename: str, 
    bucket_name: str = "media"
) -> Optional[str]:
    try:
        # Get MinIO client
        minio_client = get_minio_client()
        
        # Ensure bucket exists
        create_bucket(minio_client, bucket_name)
        
        # Prepare file-like object
        file_like_object = io.BytesIO(file_content)
        
        # Detect content type
        content_type, _ = mimetypes.guess_type(filename)
        if content_type is None:
            # Fallback to smart content type detection
            if filename.lower().endswith(('.mp4', '.avi', '.mov', '.mkv')):
                content_type = 'video/mp4'
            elif filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                content_type = 'image/jpeg'
            elif filename.lower().endswith(('.mp3', '.wav', '.flac')):
                content_type = 'audio/mpeg'
            else:
                content_type = 'application/octet-stream'
        
        # Upload to MinIO
        minio_client.put_object(
            bucket_name, 
            filename, 
            file_like_object, 
            length=len(file_content),
            content_type=content_type
        )
        
        # Generate and return public URL
        return f"http://minio:9000/{bucket_name}/{filename}"
    
    except Exception as e:
        print(f"Error uploading to MinIO: {e}")
        return None


# def download_media(url: str):
#     ua = UserAgent()
#     headers = {
#         "User-Agent": ua.random
#     }
#     response = requests.get(url, headers=headers)
#     if response.status_code == 200:
#         file_ext = url.split('.')[-1]
#         filename = f"{uuid.uuid4()}.{file_ext}"
#         return filename, response.content
#     return None, None

# def upload_media_to_minio(file_content:bytes, filename:str):
#     minio_client = get_minio_client()
#     bucket_name = "media"
    
#     create_bucket(minio_client, bucket_name)
    
#     file_like_object = io.BytesIO(file_content)

#     content_type, _ = mimetypes.guess_type(filename)
#     if content_type is None:
#         content_type = 'application/octet-stream'
    
#     minio_client.put_object(
#         bucket_name, 
#         filename, 
#         file_like_object, 
#         length=len(file_content),
#         content_type=content_type
#     )
    
#     return f"http://localhost:9000/{bucket_name}/{filename}"

def create_media_entry(db: Session, media_data: dict):
    db_media = Image(**media_data)
    db.add(db_media)
    db.commit()
    db.refresh(db_media)
    return db_media


def extract_color_histogram(image_bytes):
    # Convert bytes to numpy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Convert to HSV color space
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # Calculate histogram
    hist = cv2.calcHist([hsv], [0, 1], None, [8, 8], [0, 180, 0, 256])
    
    # Normalize and flatten
    hist = cv2.normalize(hist, hist).flatten()
    return hist.tolist()

def calculate_histogram_similarity(hist1, hist2):
    return cv2.compareHist(
        np.array(hist1, dtype=np.float32).reshape(-1, 1),
        np.array(hist2, dtype=np.float32).reshape(-1, 1),
        cv2.HISTCMP_CORREL
    )

async def search_images_by_color(db:Session, target_histogram, limit=100):
    media_list = db.query(Media).filter(Media.color.isnot(None)).all()
    results = []
    for media in media_list:
        similarity = calculate_histogram_similarity(target_histogram, media.color)
        results.append((media, similarity))
    results.sort(key=lambda x: x[1], reverse=True)
    new_results = []
    for result in results:
        new_results.append(result[0])
    return new_results[:limit]

