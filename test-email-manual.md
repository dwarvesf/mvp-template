# Email Service Testing Guide

## How to Test the Email Service

The email service has been configured with a provider-agnostic architecture. By default, it uses the **Mock Provider** which logs emails to the console instead of sending them.

### 1. Test Password Reset Email

```bash
# Send password reset request
curl -X POST http://localhost:4000/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"mvp@example.com"}'
```

**Expected Console Output:**
```
========================================
📧 MOCK EMAIL PROVIDER - Email Sent
========================================
ID: mock-[timestamp]
From: noreply@mvp-template.local
To: mvp@example.com
Subject: Reset Your Password
--- HTML Content Preview ---
Password Reset Request Hi MVP User, You requested to reset your password...
========================================
```

### 2. Test Member Invitation Email

First, get an auth token:
```bash
# Login
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mvp@example.com","password":"Pwd123!"}' | jq -r '.accessToken')

echo $TOKEN
```

Get organization ID:
```bash
# Get organizations
ORG_ID=$(curl -s http://localhost:4000/organizations \
  -H "Authorization: Bearer $TOKEN" | jq -r '.organizations[0].id')

echo $ORG_ID
```

Send invitation:
```bash
# Send invitation (use a valid role ID from your database)
curl -X POST "http://localhost:4000/organizations/$ORG_ID/invitations" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "roleId": "cmevk7139000jruk0mgs3jwqb"
  }'
```

**Expected Console Output:**
```
========================================
📧 MOCK EMAIL PROVIDER - Email Sent
========================================
ID: mock-[timestamp]
From: noreply@mvp-template.local
To: newuser@example.com
Subject: You're invited to join MVP User's Workspace
--- HTML Content Preview ---
Team Invitation Hi there, MVP User has invited you to join MVP User's Workspace as a owner...
========================================
```

## Switching Email Providers

### Development (Mock Provider - Default)
```bash
EMAIL_PROVIDER=mock
```
- Emails are logged to console
- No actual emails sent
- Perfect for development and testing

### Production with Resend
```bash
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_actual_api_key
EMAIL_FROM=noreply@yourdomain.com
```
- Real emails sent via Resend
- Requires valid Resend API key
- Configure your domain in Resend dashboard

### Production with SendGrid
```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_actual_api_key
EMAIL_FROM=noreply@yourdomain.com
```
- Real emails sent via SendGrid
- Requires valid SendGrid API key
- Note: SendGrid provider is a template, install @sendgrid/mail package

## Troubleshooting

### If emails aren't showing in console:

1. **Check if EMAIL_PROVIDER is set to mock:**
   ```bash
   grep EMAIL_PROVIDER apps/api/.env
   ```

2. **Restart the API server:**
   ```bash
   # Stop current server (Ctrl+C)
   pnpm --filter api dev
   ```

3. **Check API logs for initialization:**
   Look for: `Email service initialized with Mock provider`

4. **Verify MailService is working:**
   The password reset should at least show the dev mode log even if email fails

### Common Issues:

- **"Invalid role" error**: Use a valid roleId from your database
- **No console output**: Check if EMAIL_PROVIDER env var is set correctly
- **Auth errors**: Make sure database is seeded (`make db-seed`)

## Email Templates

The system supports these email templates:
- **PASSWORD_RESET**: Password reset with expiring link
- **MEMBER_INVITATION**: Team invitation with role info
- **EMAIL_VERIFICATION**: Email verification for new users
- **WELCOME**: Welcome email for new users

Each template has both HTML and plain text versions.