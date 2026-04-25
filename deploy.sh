#!/bin/bash
set -e

# Install Docker
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  sudo apt-get update -y
  sudo apt-get install -y docker.io
  sudo systemctl enable docker
  sudo systemctl start docker
  sudo usermod -aG docker $USER
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
  echo "Installing Docker Compose..."
  sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
fi

# Fill in your real credentials in PharmaConnect-backend/.env before running this
echo "Building and starting containers..."
docker-compose down --remove-orphans
docker-compose build --no-cache
docker-compose up -d

echo ""
echo "✅ Deployed! App is running on http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
