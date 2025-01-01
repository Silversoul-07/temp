from minio import Minio
import os
import json

def get_minio_client():
    minio_endpoint = os.getenv('MINIO_ENDPOINT', 'minio:9000')
    minio_access_key = os.getenv('MINIO_ACCESS_KEY')
    minio_secret_key = os.getenv('MINIO_SECRET_KEY')
    return Minio(minio_endpoint, access_key=minio_access_key, secret_key=minio_secret_key, secure=False)

def set_bucket_policy(minio_client, bucket_name):
    policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {"AWS": ["*"]},
                "Action": ["s3:GetObject"],
                "Resource": [f"arn:aws:s3:::{bucket_name}/*"]
            }
        ]
    }
    policy_json = json.dumps(policy)
    minio_client.set_bucket_policy(bucket_name, policy_json)


def create_bucket(client, bucket_name):
    if not client.bucket_exists(bucket_name):
        client.make_bucket(bucket_name)
        set_bucket_policy(client, bucket_name)