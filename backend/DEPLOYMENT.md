# Fly.io Deployment Guide

## Prerequisites

1. **Fly CLI installed**: `curl -L https://fly.io/install.sh | sh`
2. **Fly.io account**: Sign up at https://fly.io
3. **OpenAI API Key**: Get from https://platform.openai.com/api-keys

## Quick Deployment

1. **Login to Fly.io**:
   ```bash
   fly auth login
   ```

2. **Run the deployment script**:
   ```bash
   cd backend
   ./deploy.sh
   ```

3. **Update the script with your OpenAI API key** before running.

## Manual Deployment Steps

### 1. Create PostgreSQL Database

```bash
fly postgres create --name ai-chat-db --region arn
```

### 2. Attach Database to App

```bash
fly postgres attach --app backend-little-lake-3172 ai-chat-db
```

### 3. Set Environment Variables

```bash
fly secrets set OPENAI_API_KEY="your-actual-openai-api-key"
```

### 4. Deploy the App

```bash
fly deploy
```

## Environment Variables

The app uses these environment variables:

- `DATABASE_URL`: Automatically set by Fly.io when you attach PostgreSQL
- `OPENAI_API_KEY`: Your OpenAI API key
- `PORT`: Port to run on (default: 8000)

## Troubleshooting

### Database Connection Issues

If you see "unable to open database file" errors:

1. **Check if PostgreSQL is attached**:
   ```bash
   fly postgres list
   ```

2. **Reattach the database**:
   ```bash
   fly postgres attach --app backend-little-lake-3172 ai-chat-db
   ```

3. **Check the DATABASE_URL**:
   ```bash
   fly ssh console
   echo $DATABASE_URL
   ```

### App Not Starting

1. **Check logs**:
   ```bash
   fly logs -a backend-little-lake-3172
   ```

2. **Check app status**:
   ```bash
   fly status -a backend-little-lake-3172
   ```

3. **Restart the app**:
   ```bash
   fly apps restart backend-little-lake-3172
   ```

## Local Development

For local development, the app will use SQLite by default. Set the environment variable:

```bash
export DATABASE_URL="sqlite:///./chat.db"
```

## Production Considerations

1. **CORS**: Update `allowed_origins` in `app/core/config.py` with your frontend domain
2. **Security**: Use environment variables for all sensitive data
3. **Monitoring**: Set up Fly.io monitoring and alerts
4. **Backups**: Enable PostgreSQL backups in Fly.io dashboard 