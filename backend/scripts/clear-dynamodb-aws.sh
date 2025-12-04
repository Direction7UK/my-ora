#!/bin/bash

# Script to clear all DynamoDB tables in AWS
# Usage: ./scripts/clear-dynamodb-aws.sh [stage]
# Example: ./scripts/clear-dynamodb-aws.sh dev

STAGE=${1:-dev}
REGION=${AWS_REGION:-us-east-1}

echo "Clearing DynamoDB tables for stage: $STAGE in region: $REGION"
echo "⚠️  WARNING: This will delete ALL data from the tables!"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 1
fi

TABLES=(
  "my-ora-backend-${STAGE}-UsersTable"
  "my-ora-backend-${STAGE}-MessagesTable"
  "my-ora-backend-${STAGE}-SymptomsTable"
  "my-ora-backend-${STAGE}-LifeScoreTable"
  "my-ora-backend-${STAGE}-LifestyleTable"
  "my-ora-backend-${STAGE}-PredictionsTable"
  "my-ora-backend-${STAGE}-NotificationsTable"
)

for table in "${TABLES[@]}"; do
  echo "Clearing table: $table..."
  
  # Check if table exists
  if ! aws dynamodb describe-table --table-name "$table" --region "$REGION" &>/dev/null; then
    echo "  Table $table does not exist, skipping..."
    continue
  fi
  
  # Scan and delete all items
  aws dynamodb scan \
    --table-name "$table" \
    --region "$REGION" \
    --output json \
    --query "Items[*].[userId.S,messageId.S,symptomId.S,predictionId.S,notificationId.S]" \
    | jq -r '.[] | @tsv' \
    | while IFS=$'\t' read -r userId messageId symptomId predictionId notificationId; do
        key=""
        if [ -n "$userId" ] && [ "$userId" != "null" ]; then
          key="{\"userId\":{\"S\":\"$userId\"}}"
        elif [ -n "$messageId" ] && [ "$messageId" != "null" ]; then
          key="{\"messageId\":{\"S\":\"$messageId\"}}"
        elif [ -n "$symptomId" ] && [ "$symptomId" != "null" ]; then
          key="{\"symptomId\":{\"S\":\"$symptomId\"}}"
        elif [ -n "$predictionId" ] && [ "$predictionId" != "null" ]; then
          key="{\"predictionId\":{\"S\":\"$predictionId\"}}"
        elif [ -n "$notificationId" ] && [ "$notificationId" != "null" ]; then
          key="{\"notificationId\":{\"S\":\"$notificationId\"}}"
        fi
        
        if [ -n "$key" ]; then
          aws dynamodb delete-item \
            --table-name "$table" \
            --key "$key" \
            --region "$REGION" \
            &>/dev/null
        fi
      done
  
  echo "  ✓ Cleared table: $table"
done

echo ""
echo "✓ DynamoDB cleanup complete!"

