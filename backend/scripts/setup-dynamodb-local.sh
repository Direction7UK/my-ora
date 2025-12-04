#!/bin/bash

# Setup script for DynamoDB Local
# This script downloads and sets up DynamoDB Local for local development

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DYNAMODB_DIR="$BACKEND_DIR/.dynamodb-local"
DYNAMODB_JAR="$DYNAMODB_DIR/DynamoDBLocal.jar"

echo "🚀 Setting up DynamoDB Local..."

# Create directory for DynamoDB Local
mkdir -p "$DYNAMODB_DIR"

# Check if DynamoDB Local is already downloaded
if [ ! -f "$DYNAMODB_JAR" ]; then
  echo "📥 Downloading DynamoDB Local..."
  
  # Download DynamoDB Local
  cd "$DYNAMODB_DIR"
  
  # For macOS (Intel)
  if [[ $(uname -m) == "x86_64" ]]; then
    curl -O https://s3-us-west-2.amazonaws.com/dynamodb-local/dynamodb_local_latest.tar.gz
  # For macOS (Apple Silicon)
  elif [[ $(uname -m) == "arm64" ]]; then
    echo "⚠️  Apple Silicon detected. Please download DynamoDB Local manually:"
    echo "   1. Visit: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html"
    echo "   2. Download the latest version"
    echo "   3. Extract to: $DYNAMODB_DIR"
    echo "   4. Run this script again"
    exit 1
  fi
  
  # Extract
  tar -xzf dynamodb_local_latest.tar.gz
  rm dynamodb_local_latest.tar.gz
  
  echo "✅ DynamoDB Local downloaded successfully"
else
  echo "✅ DynamoDB Local already downloaded"
fi

# Check if DynamoDB Local is running
if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
  echo "✅ DynamoDB Local is already running on port 8000"
else
  echo "🚀 Starting DynamoDB Local..."
  cd "$DYNAMODB_DIR"
  java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb -port 8000 > /dev/null 2>&1 &
  echo $! > "$DYNAMODB_DIR/dynamodb.pid"
  echo "✅ DynamoDB Local started (PID: $(cat "$DYNAMODB_DIR/dynamodb.pid"))"
  echo "   Access it at: http://localhost:8000"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To stop DynamoDB Local, run:"
echo "  kill \$(cat $DYNAMODB_DIR/dynamodb.pid)"
echo ""
echo "Or use: npm run dynamodb:stop (if configured)"

