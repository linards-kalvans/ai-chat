# 🚁 Fly.io Deployment Troubleshooting Guide

## Common Errors & Solutions

### **1. "Failed to bind to port 8000"**
**Error**: `Error: Failed to bind to port 8000`
**Cause**: Port configuration mismatch
**Solution**:
```bash
# Check your fly.toml configuration
cat backend/fly.toml

# Ensure internal_port matches your app
[http_service]
  internal_port = 8000
```

### **2. "Database connection failed"**
**Error**: `sqlalchemy.exc.OperationalError: (psycopg2.OperationalError)`
**Cause**: Missing or incorrect DATABASE_URL
**Solution**:
```bash
# Set database URL
fly secrets set DATABASE_URL="postgresql://user:pass@host:port/db"

# Or use SQLite for testing
fly secrets set DATABASE_URL="sqlite:///./data/chat_history.db"
```

### **3. "Module not found"**
**Error**: `ModuleNotFoundError: No module named 'app'`
**Cause**: Python path or import issues
**Solution**:
```bash
# Check your directory structure
ls -la backend/

# Ensure app directory exists
ls -la backend/app/
```

### **4. "API key not configured"**
**Error**: `OpenAI API key not configured`
**Cause**: Missing environment variables
**Solution**:
```bash
# Set API keys
fly secrets set OPENAI_API_KEY="sk-your-key-here"
fly secrets set XAI_API_KEY="xai-your-key-here"
```

### **5. "Build failed"**
**Error**: `Build failed: exit code 1`
**Cause**: Dependency or build issues
**Solution**:
```bash
# Check build logs
fly logs

# Test build locally
cd backend
docker build -t test-app .
```

### **6. "Health check failed"**
**Error**: `Health check failed`
**Cause**: Application not responding
**Solution**:
```bash
# Check if app is running
fly status

# View logs
fly logs

# Check health endpoint
curl https://your-app.fly.dev/health
```

## Step-by-Step Deployment

### **1. Install Fly CLI**
```bash
curl -L https://fly.io/install.sh | sh
export PATH="$HOME/.fly/bin:$PATH"
```

### **2. Authenticate**
```bash
fly auth login
```

### **3. Initialize App (if needed)**
```bash
cd backend
fly launch --no-deploy
```

### **4. Set Environment Variables**
```bash
# Required variables
fly secrets set OPENAI_API_KEY="your_openai_key"
fly secrets set XAI_API_KEY="your_xai_key"

# Optional: Set database URL
fly secrets set DATABASE_URL="your_database_url"
```

### **5. Deploy**
```bash
fly deploy
```

### **6. Check Status**
```bash
fly status
fly logs
```

## Debugging Commands

### **Check App Status**
```bash
fly status
fly info
```

### **View Logs**
```bash
# Recent logs
fly logs

# Follow logs
fly logs --tail

# Specific app
fly logs --app your-app-name
```

### **SSH into App**
```bash
fly ssh console
```

### **Check Environment Variables**
```bash
fly secrets list
```

### **Restart App**
```bash
fly apps restart
```

## Configuration Files

### **fly.toml (Backend)**
```toml
app = 'your-app-name'
primary_region = 'arn'

[env]
  PORT = "8000"

[http_service]
  internal_port = 8000
  force_https = true
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0
  processes = ['app']

  [[http_service.checks]]
    grace_period = "10s"
    interval = "30s"
    method = "GET"
    timeout = "5s"
    path = "/health"

[[vm]]
  memory = '1gb'
  cpu_kind = 'shared'
  cpus = 1

[processes]
  app = "uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT"
```

### **Dockerfile (Backend)**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Copy project files
COPY pyproject.toml ./
COPY uv.lock* ./

# Install dependencies
RUN uv sync

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["sh", "-c", "uv run uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
```

## Performance Optimization

### **1. Memory Optimization**
```toml
[[vm]]
  memory = '512mb'  # Reduce if possible
  cpu_kind = 'shared'
  cpus = 1
```

### **2. Auto-scaling**
```toml
[http_service]
  auto_stop_machines = 'stop'
  auto_start_machines = true
  min_machines_running = 0
```

### **3. Health Checks**
```toml
[[http_service.checks]]
  grace_period = "10s"
  interval = "30s"
  method = "GET"
  timeout = "5s"
  path = "/health"
```

## Cost Optimization

### **1. Use Free Tier**
- 3 shared-cpu VMs
- 3GB persistent volume
- 160GB outbound data transfer

### **2. Auto-stop Machines**
```toml
auto_stop_machines = 'stop'
min_machines_running = 0
```

### **3. Monitor Usage**
```bash
fly billing
fly usage
```

## Common Issues & Workarounds

### **1. Cold Starts**
**Issue**: 30-60 second startup time
**Workaround**: Keep at least 1 machine running
```toml
min_machines_running = 1
```

### **2. Memory Limits**
**Issue**: Out of memory errors
**Workaround**: Increase memory allocation
```toml
[[vm]]
  memory = '1gb'
```

### **3. Database Connection**
**Issue**: Connection timeouts
**Workaround**: Use connection pooling
```python
engine = create_engine(DATABASE_URL, pool_size=10, max_overflow=20)
```

## Support Resources

- **Fly.io Docs**: https://fly.io/docs/
- **Community**: https://community.fly.io/
- **Status Page**: https://status.fly.io/
- **CLI Reference**: https://fly.io/docs/flyctl/ 