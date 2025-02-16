#!/bin/bash

# Exit on any error
set -e

# Configuration
IMAGE_NAME="javimosch/event-user-confirm"
TAG="latest"

echo "🔨 Building Docker image..."
docker build -t $IMAGE_NAME:$TAG . --no-cache

echo "🔑 Logging in to Docker Hub..."
# You'll need to be logged in: docker login
# Or set DOCKER_USERNAME and DOCKER_PASSWORD environment variables
if [ -n "$DOCKER_USERNAME" ] && [ -n "$DOCKER_PASSWORD" ]; then
    echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
fi

echo "⬆️ Pushing image to Docker Hub..."
docker push $IMAGE_NAME:$TAG

echo "✅ Successfully published $IMAGE_NAME:$TAG to Docker Hub"

echo "
🚀 To run the container:
docker run -d \\
    -p 3000:3000 \\
    -e MONGO_URI=mongodb://your-mongodb:27017/eventDB \\
    $IMAGE_NAME:$TAG

📝 Note: Make sure to:
1. Have MongoDB running and accessible
2. Replace 'your-mongodb' with your MongoDB host
3. Adjust other environment variables as needed
"
