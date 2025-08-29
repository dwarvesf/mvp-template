#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:4000"

echo -e "${YELLOW}=== Email Service Test Script ===${NC}\n"

# Test 1: Password Reset Email
echo -e "${GREEN}Test 1: Password Reset Email${NC}"
echo "Sending password reset request for mvp@example.com..."
curl -s -X POST "$API_URL/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"mvp@example.com"}' | jq '.'

echo -e "\n${YELLOW}Check the console logs for the Mock Email Provider output${NC}"
echo -e "You should see:"
echo "- Email subject: Reset Your Password"
echo "- Reset link with token"
echo "- HTML and text content"

echo -e "\n-------------------\n"

# Test 2: Member Invitation Email
echo -e "${GREEN}Test 2: Member Invitation Email${NC}"
echo "First, getting auth token..."

# Login to get token
RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"mvp@example.com","password":"Pwd123!"}')

TOKEN=$(echo $RESPONSE | jq -r '.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo -e "${RED}Failed to get auth token. Response:${NC}"
    echo $RESPONSE | jq '.'
    echo -e "\n${YELLOW}Make sure the database is seeded with: make db-seed${NC}"
    exit 1
fi

echo "Got token: ${TOKEN:0:20}..."

# Get user's organizations
echo "Getting user organizations..."
ORGS=$(curl -s -X GET "$API_URL/organizations" \
  -H "Authorization: Bearer $TOKEN")

ORG_ID=$(echo $ORGS | jq -r '.organizations[0].id')

if [ "$ORG_ID" = "null" ] || [ -z "$ORG_ID" ]; then
    echo -e "${RED}No organizations found for user${NC}"
    echo $ORGS | jq '.'
    exit 1
fi

echo "Using organization ID: $ORG_ID"

# Send invitation
echo "Sending invitation to newuser@example.com..."
INVITE=$(curl -s -X POST "$API_URL/organizations/$ORG_ID/invitations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "roleId": "member"
  }')

echo $INVITE | jq '.'

echo -e "\n${YELLOW}Check the console logs for the Mock Email Provider output${NC}"
echo -e "You should see:"
echo "- Email subject: You're invited to join [Organization Name]"
echo "- Invitation link with token"
echo "- Inviter name and role"

echo -e "\n-------------------\n"

# Test 3: Check Email Provider Configuration
echo -e "${GREEN}Test 3: Email Provider Configuration${NC}"
echo "Current EMAIL_PROVIDER setting: ${EMAIL_PROVIDER:-mock}"
echo "To switch providers, set EMAIL_PROVIDER environment variable:"
echo "  - mock (default for development)"
echo "  - resend (requires RESEND_API_KEY)"
echo "  - sendgrid (requires SENDGRID_API_KEY)"

echo -e "\n${GREEN}✅ Email testing complete!${NC}"
echo -e "${YELLOW}Check your API console for the mock email outputs${NC}"