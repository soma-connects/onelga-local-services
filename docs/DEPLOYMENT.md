# Deployment Guide

This guide covers deploying the Onelga Local Services application to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Migration](#database-migration)
- [AWS Deployment](#aws-deployment)
- [Docker Deployment](#docker-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Services

- **AWS Account** with appropriate permissions
- **Domain Name** (e.g., onelga-services.gov.ng)
- **SSL Certificate**
- **SMTP Service** (SendGrid recommended)
- **Payment Gateway** (Paystack/Flutterwave)

### Required Tools

- **AWS CLI** configured
- **Docker** and **Docker Compose**
- **Node.js** 18+
- **PostgreSQL** client tools

## Environment Setup

### Production Environment Variables

Create a `.env.production` file:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://onelga-services.gov.ng

# Database
DATABASE_URL="postgresql://username:password@your-db-host:5432/onelga_services?schema=public"

# Security
JWT_SECRET="your-super-secure-jwt-secret-here"
JWT_EXPIRES_IN=7d

# Email Service (SendGrid)
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@onelga-services.gov.ng"
FROM_NAME="Onelga Local Services"

# Payment Gateway
PAYSTACK_SECRET_KEY="your-paystack-secret-key"
PAYSTACK_PUBLIC_KEY="your-paystack-public-key"

# File Storage
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="onelga-services-uploads"

# Monitoring
LOG_LEVEL=info
```

## Database Migration

### 1. Database Setup

```bash
# Create production database
createdb -h your-db-host -U username onelga_services

# Run migrations
cd backend
npx prisma migrate deploy

# Seed initial data (optional)
npx prisma db seed
```

### 2. Database Backup Strategy

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h your-db-host -U username onelga_services > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
```

## AWS Deployment

### 1. Infrastructure Setup

#### EC2 Instance

```bash
# Launch EC2 instance (recommended: t3.medium or larger)
aws ec2 run-instances \
  --image-id ami-0abcdef1234567890 \
  --count 1 \
  --instance-type t3.medium \
  --key-name your-key-pair \
  --security-group-ids sg-12345678 \
  --subnet-id subnet-12345678

# Install Docker
sudo yum update -y
sudo amazon-linux-extras install docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### RDS Database

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier onelga-services-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username onelga_admin \
  --master-user-password your-secure-password \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-12345678
```

#### S3 Bucket

```bash
# Create S3 bucket for file uploads
aws s3 mb s3://onelga-services-uploads
aws s3 mb s3://onelga-services-backups

# Set bucket policy
aws s3api put-bucket-policy \
  --bucket onelga-services-uploads \
  --policy file://s3-policy.json
```

### 2. Application Deployment

#### Using Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    ports:
      - "5000:5000"
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      - REACT_APP_API_URL=https://api.onelga-services.gov.ng/api
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - backend
      - frontend
    restart: unless-stopped
```

#### Deployment Script

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting deployment..."

# Pull latest code
git pull origin main

# Build and deploy
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

echo "✅ Deployment completed!"
```

### 3. Load Balancer Setup

```bash
# Create Application Load Balancer
aws elbv2 create-load-balancer \
  --name onelga-services-alb \
  --subnets subnet-12345678 subnet-87654321 \
  --security-groups sg-12345678

# Create target group
aws elbv2 create-target-group \
  --name onelga-services-targets \
  --protocol HTTP \
  --port 80 \
  --vpc-id vpc-12345678
```

## Docker Deployment

### Production Dockerfiles

#### Backend Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

RUN npx prisma generate

EXPOSE 5000
CMD ["npm", "start"]
```

#### Frontend Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Monitoring & Maintenance

### 1. Health Checks

```bash
# Health check script
#!/bin/bash
curl -f http://localhost:5000/health || exit 1
curl -f http://localhost:3000 || exit 1
```

### 2. Log Management

```bash
# Log rotation configuration
/var/log/onelga-services/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
```

### 3. Monitoring Setup

#### CloudWatch Alarms

```bash
# CPU utilization alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "Onelga-Services-CPU-High" \
  --alarm-description "High CPU utilization" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

### 4. Backup Strategy

```bash
# Automated backup script
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
pg_dump -h $DB_HOST -U $DB_USER $DB_NAME | gzip > db_backup_$DATE.sql.gz
aws s3 cp db_backup_$DATE.sql.gz s3://onelga-services-backups/

# File uploads backup
aws s3 sync /app/uploads s3://onelga-services-backups/uploads/

# Keep only last 30 days of backups
find /backups -name "*.gz" -mtime +30 -delete
```

## SSL Certificate

### Let's Encrypt Setup

```bash
# Install Certbot
sudo yum install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d onelga-services.gov.ng -d api.onelga-services.gov.ng

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

## Performance Optimization

### 1. Nginx Configuration

```nginx
# nginx.conf
server {
    listen 80;
    server_name onelga-services.gov.ng;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name onelga-services.gov.ng;
    
    ssl_certificate /etc/ssl/certs/fullchain.pem;
    ssl_certificate_key /etc/ssl/private/privkey.pem;
    
    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }
    
    # API
    location /api {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

### 2. Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_applications_status ON identification_letters(status);
CREATE INDEX idx_applications_created_at ON identification_letters(created_at);
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database connectivity
   psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1;"
   ```

2. **Memory Issues**
   ```bash
   # Monitor memory usage
   free -h
   docker stats
   ```

3. **SSL Certificate Issues**
   ```bash
   # Check certificate expiry
   openssl x509 -in /etc/ssl/certs/fullchain.pem -text -noout | grep "Not After"
   ```

### Log Analysis

```bash
# Backend logs
docker-compose logs backend

# Database logs
sudo tail -f /var/log/postgresql/postgresql.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Security Checklist

- [ ] SSL certificate installed and auto-renewal configured
- [ ] Database credentials secured
- [ ] API rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers configured in Nginx
- [ ] File upload restrictions in place
- [ ] Regular security updates scheduled
- [ ] Backup encryption enabled
- [ ] Access logs monitored

## Rollback Procedure

```bash
#!/bin/bash
# rollback.sh

PREVIOUS_VERSION=$1

echo "Rolling back to version: $PREVIOUS_VERSION"

# Stop current services
docker-compose -f docker-compose.prod.yml down

# Checkout previous version
git checkout $PREVIOUS_VERSION

# Deploy previous version
docker-compose -f docker-compose.prod.yml up -d

echo "Rollback completed!"
```

## Support

For deployment support, contact:
- **DevOps Team**: devops@onelga-services.gov.ng
- **Emergency**: +234-xxx-xxx-xxxx

---

**Important**: Always test deployments in a staging environment before deploying to production!
