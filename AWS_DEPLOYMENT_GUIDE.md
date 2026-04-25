# PharmaConnect - AWS Deployment Guide (EC2 + S3)

## 🚀 AWS Architecture

- **Backend**: EC2 Instance (Node.js)
- **Frontend**: S3 + CloudFront (Static Hosting)
- **Database**: MongoDB Atlas (Already configured)
- **SSL**: Let's Encrypt (Free SSL)

---

## 📦 Part 1: Backend Deployment on EC2

### Step 1: Launch EC2 Instance

1. **Login to AWS Console**
   - Go to [AWS Console](https://console.aws.amazon.com)
   - Navigate to EC2 Dashboard

2. **Launch Instance**
   ```
   Name: PharmaConnect-Backend
   AMI: Ubuntu Server 22.04 LTS (Free tier eligible)
   Instance Type: t2.micro (Free tier)
   Key Pair: Create new key pair (Download .pem file)
   Security Group: Create new
   Storage: 8 GB (Free tier)
   ```

3. **Configure Security Group**
   - Click "Edit inbound rules"
   - Add these rules:
   ```
   Type: SSH, Port: 22, Source: My IP
   Type: HTTP, Port: 80, Source: Anywhere (0.0.0.0/0)
   Type: HTTPS, Port: 443, Source: Anywhere (0.0.0.0/0)
   Type: Custom TCP, Port: 5000, Source: Anywhere (0.0.0.0/0)
   ```

4. **Launch Instance**
   - Click "Launch Instance"
   - Wait for instance to be running
   - Note down Public IPv4 address

### Step 2: Connect to EC2 Instance

**Windows (Using PuTTY):**
```bash
# Convert .pem to .ppk using PuTTYgen
# Then connect using PuTTY with:
Host: ubuntu@your-ec2-public-ip
Port: 22
Auth: Select your .ppk file
```

**Mac/Linux:**
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

### Step 3: Setup Server Environment

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version

# Install PM2 (Process Manager)
sudo npm install -g pm2

# Install Nginx (Reverse Proxy)
sudo apt install -y nginx

# Install Git
sudo apt install -y git
```

### Step 4: Clone and Setup Backend

```bash
# Create app directory
cd /home/ubuntu
mkdir pharmaconnect
cd pharmaconnect

# Clone your repository (or upload files)
git clone https://github.com/your-username/pharmaconnect.git .

# Navigate to backend
cd PharmaConnect-backend

# Install dependencies
npm install

# Create .env file
nano .env
```

**Paste your environment variables:**
```env
MONGO_URI=mongodb+srv://userYash:yashrohilla@cluster0.g0oklpu.mongodb.net/pharmaconnect?retryWrites=true&w=majority
UPSTASH_REDIS_REST_URL=https://grateful-cat-74504.upstash.io
UPSTASH_REDIS_REST_TOKEN=gQAAAAAAASMIAAIncDFiNGI3NDU5OTc0MTk0MGQ0YTA4NTQ3MDAyZDQ4NTE5MnAxNzQ1MDQ
JWT_SECRET=fbd40000893f2ae8c1ee202ae679deaf2761a4ae2e8e4f8f01a41680f995620b7df2d79e6f8f1b414c1e0c9efa965b1e60254273f25ca684254547e7badbfb6b
JWT_EXPIRES_IN=7d
EMAIL_USER=pharmaConnect31029@gmail.com
EMAIL_PASS=nkwufbpncxthbxkc
CLOUDINARY_CLOUD_NAME=ddkxksjhx
CLOUDINARY_API_KEY=253667985853856
CLOUDINARY_API_SECRET=PpP9EOWD36Cq3FfJA9QxVl9XJYU
GEMINI_API_KEY=AIzaSyAroE3rm3cRJMk8Jkp1fJUbMwiF_C1aMwk
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=http://your-s3-bucket.s3-website-region.amazonaws.com
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

### Step 5: Start Backend with PM2

```bash
# Start application
pm2 start src/app.js --name pharmaconnect-backend

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command it shows

# Check status
pm2 status
pm2 logs pharmaconnect-backend
```

### Step 6: Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/pharmaconnect
```

**Paste this configuration:**
```nginx
server {
    listen 80;
    server_name your-ec2-public-ip;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Save and enable:**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/pharmaconnect /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx on boot
sudo systemctl enable nginx
```

### Step 7: Test Backend

```bash
# Test locally
curl http://localhost:5000

# Test via Nginx
curl http://your-ec2-public-ip
```

**Your backend is now live at:** `http://your-ec2-public-ip`

---

## 🎨 Part 2: Frontend Deployment on S3

### Step 1: Build Frontend

**On your local machine:**
```bash
cd PharmaConnect-frontend

# Create production environment file
echo "VITE_API_URL=http://your-ec2-public-ip" > .env.production

# Build for production
npm run build
```

This creates a `dist` folder with optimized files.

### Step 2: Create S3 Bucket

1. **Go to S3 Console**
   - Navigate to S3 in AWS Console
   - Click "Create bucket"

2. **Configure Bucket**
   ```
   Bucket name: pharmaconnect-frontend (must be unique globally)
   Region: us-east-1 (or your preferred region)
   
   ⚠️ UNCHECK "Block all public access"
   ✅ Check "I acknowledge that the current settings..."
   
   Click "Create bucket"
   ```

### Step 3: Upload Frontend Files

1. **Open your bucket**
   - Click on bucket name

2. **Upload files**
   - Click "Upload"
   - Drag and drop ALL files from `dist` folder
   - Click "Upload"

### Step 4: Enable Static Website Hosting

1. **Go to Properties tab**
   - Scroll to "Static website hosting"
   - Click "Edit"

2. **Configure**
   ```
   Static website hosting: Enable
   Hosting type: Host a static website
   Index document: index.html
   Error document: index.html
   ```

3. **Save changes**
   - Note the "Bucket website endpoint" URL

### Step 5: Set Bucket Policy (Make Public)

1. **Go to Permissions tab**
   - Scroll to "Bucket policy"
   - Click "Edit"

2. **Paste this policy** (Replace YOUR-BUCKET-NAME):
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

3. **Save changes**

**Your frontend is now live at:** `http://your-bucket-name.s3-website-region.amazonaws.com`

---

## 🔧 Part 3: Connect Frontend to Backend

### Update Backend CORS

**SSH into EC2:**
```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
cd /home/ubuntu/pharmaconnect/PharmaConnect-backend
nano .env
```

**Update ALLOWED_ORIGINS:**
```env
ALLOWED_ORIGINS=http://your-bucket-name.s3-website-region.amazonaws.com,http://localhost:5173
```

**Restart backend:**
```bash
pm2 restart pharmaconnect-backend
```

---

## 🌐 Part 4: Setup Custom Domain (Optional)

### Option A: Using Route 53

1. **Buy domain in Route 53**
   - Go to Route 53 → Register domain

2. **Create Hosted Zone**
   - Route 53 → Hosted zones → Create

3. **Add Records**
   ```
   Type: A
   Name: api.yourdomain.com
   Value: Your EC2 Public IP
   
   Type: CNAME
   Name: www.yourdomain.com
   Value: your-bucket-name.s3-website-region.amazonaws.com
   ```

### Option B: Using Existing Domain

1. **Add DNS Records in your domain provider**
   ```
   A Record: api.yourdomain.com → EC2 IP
   CNAME: www.yourdomain.com → S3 endpoint
   ```

---

## 🔒 Part 5: Setup SSL (HTTPS) - Optional but Recommended

### For Backend (EC2):

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### For Frontend (S3):

Use **CloudFront** for HTTPS:

1. **Create CloudFront Distribution**
   - Go to CloudFront → Create distribution
   - Origin domain: Select your S3 bucket
   - Viewer protocol policy: Redirect HTTP to HTTPS
   - Default root object: index.html

2. **Wait for deployment** (15-20 minutes)

3. **Use CloudFront URL** instead of S3 URL

---

## 📊 Monitoring & Maintenance

### Backend Monitoring

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs pharmaconnect-backend

# Restart app
pm2 restart pharmaconnect-backend

# Monitor resources
pm2 monit
```

### Update Backend Code

```bash
cd /home/ubuntu/pharmaconnect/PharmaConnect-backend
git pull origin main
npm install
pm2 restart pharmaconnect-backend
```

### Update Frontend

```bash
# On local machine
npm run build

# Upload new dist files to S3
# Or use AWS CLI:
aws s3 sync dist/ s3://your-bucket-name --delete
```

---

## 💰 AWS Cost Estimate (Free Tier)

- **EC2 t2.micro**: Free for 12 months (750 hours/month)
- **S3 Storage**: 5 GB free
- **S3 Requests**: 20,000 GET, 2,000 PUT free
- **Data Transfer**: 100 GB free outbound
- **CloudFront**: 1 TB free for 12 months

**After free tier:** ~$10-15/month

---

## ✅ Deployment Checklist

### Backend (EC2)
- [ ] EC2 instance launched
- [ ] Security groups configured
- [ ] Node.js installed
- [ ] Backend code deployed
- [ ] Environment variables set
- [ ] PM2 running
- [ ] Nginx configured
- [ ] Backend accessible via public IP

### Frontend (S3)
- [ ] S3 bucket created
- [ ] Static hosting enabled
- [ ] Files uploaded
- [ ] Bucket policy set (public)
- [ ] Frontend accessible via S3 URL

### Integration
- [ ] CORS updated with S3 URL
- [ ] Frontend API URL updated
- [ ] Test login functionality
- [ ] Test all features

---

## 🆘 Troubleshooting

### Backend Issues

**Can't connect to EC2:**
```bash
# Check security group allows SSH (port 22)
# Verify key permissions: chmod 400 your-key.pem
```

**Backend not starting:**
```bash
pm2 logs pharmaconnect-backend
# Check for errors in logs
```

**502 Bad Gateway:**
```bash
# Check if backend is running
pm2 status

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
```

### Frontend Issues

**403 Forbidden:**
- Check bucket policy is set correctly
- Verify "Block public access" is OFF

**404 on routes:**
- Ensure error document is set to `index.html`

**CORS errors:**
- Update ALLOWED_ORIGINS in backend .env
- Restart backend: `pm2 restart pharmaconnect-backend`

---

## 🎉 Your App is Live!

**Backend API:** `http://your-ec2-public-ip`
**Frontend:** `http://your-bucket-name.s3-website-region.amazonaws.com`

**Test URLs:**
- Backend: `http://your-ec2-ip/`
- Login: `http://your-s3-url/login`

---

## 📝 Quick Commands Reference

```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# PM2 Commands
pm2 status
pm2 logs pharmaconnect-backend
pm2 restart pharmaconnect-backend
pm2 stop pharmaconnect-backend

# Nginx Commands
sudo systemctl status nginx
sudo systemctl restart nginx
sudo nginx -t

# View logs
pm2 logs
sudo tail -f /var/log/nginx/error.log

# Update code
cd /home/ubuntu/pharmaconnect/PharmaConnect-backend
git pull
npm install
pm2 restart pharmaconnect-backend
```

---

## 🚀 Next Steps

1. Setup custom domain
2. Enable HTTPS with SSL
3. Setup CloudFront for frontend
4. Configure auto-scaling (if needed)
5. Setup CloudWatch monitoring
6. Configure automated backups

Bhai ab tera PharmaConnect AWS pe live hai! 🔥💚
