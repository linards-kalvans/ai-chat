# 🚀 Cloud Deployment Guide

## Quick Start: Railway (Recommended)

### 1. Prepare Your Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Prepare for cloud deployment"
git push origin main
```

### 2. Deploy to Railway
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will automatically detect the Docker setup

### 3. Configure Environment Variables
In Railway dashboard, add these environment variables:
```
DATABASE_URL=postgresql://... (Railway provides this)
OPENAI_API_KEY=your_openai_api_key
XAI_API_KEY=your_xai_api_key
SECRET_KEY=your_random_secret_key
```

### 4. Deploy Frontend (Optional)
For a complete solution, also deploy the frontend:
1. Create another Railway project
2. Point to the same repository
3. Set build command: `cd frontend && npm install && npm run build`
4. Set start command: `cd frontend && npx serve -s build -l $PORT`

## Alternative: Render

### 1. Deploy Backend
1. Go to [Render.com](https://render.com)
2. Connect GitHub repository
3. Create "Web Service"
4. Build Command: `cd backend && pip install -r requirements.txt`
5. Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 2. Deploy Database
1. Create "PostgreSQL" service
2. Copy the connection string
3. Add as `DATABASE_URL` environment variable

### 3. Deploy Frontend
1. Create another "Web Service"
2. Build Command: `cd frontend && npm install && npm run build`
3. Start Command: `cd frontend && npx serve -s build -l $PORT`

## Alternative: Fly.io

### 1. Install Fly CLI
```bash
curl -L https://fly.io/install.sh | sh
fly auth signup
```

### 2. Deploy Backend
```bash
cd backend
fly launch
fly secrets set OPENAI_API_KEY=your_key
fly secrets set XAI_API_KEY=your_key
fly deploy
```

### 3. Deploy Frontend
```bash
cd frontend
fly launch
fly deploy
```

## Cost Comparison

| Platform | Backend | Database | Frontend | Total/Month |
|----------|---------|----------|----------|-------------|
| Railway  | $5      | $5       | $5       | $15         |
| Render   | $7      | $7       | $7       | $21         |
| Fly.io   | $2      | $0*      | $2       | $4          |
| DigitalOcean | $12   | $15      | $12      | $39         |

*Using Supabase free tier for database

## Environment Variables

### Required Variables
```bash
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# API Keys
OPENAI_API_KEY=sk-...
XAI_API_KEY=xai-...

# Security
SECRET_KEY=your_random_secret_key
```

### Optional Variables
```bash
# CORS (for production)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Logging
LOG_LEVEL=INFO
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check `DATABASE_URL` format
   - Ensure PostgreSQL is running
   - Verify network access

2. **API Keys Not Working**
   - Verify keys are valid
   - Check environment variable names
   - Ensure keys have proper permissions

3. **Build Failures**
   - Check Python/Node.js versions
   - Verify all dependencies are listed
   - Check build logs for specific errors

4. **CORS Errors**
   - Configure `CORS_ORIGINS` properly
   - Add your frontend domain to allowed origins

### Performance Optimization

1. **Database Indexing**
   ```sql
   CREATE INDEX idx_messages_chat_id ON messages(chat_id);
   CREATE INDEX idx_messages_created_at ON messages(created_at);
   ```

2. **Connection Pooling**
   ```python
   # In database.py
   engine = create_engine(DATABASE_URL, pool_size=10, max_overflow=20)
   ```

3. **Caching**
   - Consider Redis for session storage
   - Implement response caching for static content

## Security Considerations

1. **Environment Variables**
   - Never commit API keys to repository
   - Use platform-specific secret management
   - Rotate keys regularly

2. **CORS Configuration**
   - Restrict origins to your domains
   - Avoid using `*` in production

3. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Regular backups

4. **API Rate Limiting**
   - Implement rate limiting
   - Monitor usage patterns
   - Set up alerts for abuse

## Monitoring

### Health Checks
- Endpoint: `/health`
- Expected response: `{"status": "healthy"}`
- Set up monitoring to check every 30 seconds

### Logs
- Monitor application logs
- Set up error alerting
- Track API usage and costs

### Metrics
- Response times
- Error rates
- Database performance
- API key usage 