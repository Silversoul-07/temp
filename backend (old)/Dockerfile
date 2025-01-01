FROM python:3.11-slim

RUN apt-get update && apt-get install -y curl
RUN apt-get install python3-opencv -y

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Set the environment variable (default to production)
ENV APP_ENV=production

# Conditional CMD based on the environment
# CMD ["sh", "-c", "if [ \"$APP_ENV\" = \"development\" ]; then \
#     uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload; \
#     else \
#     uvicorn app.main:app --host 0.0.0.0 --port 8000; \
#     fi"]

# --reload
CMD ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]

