#!/bin/bash

# ----- Configuration -----
LOCAL_PROJECT_PATH="E:\MIssion404\Python\Facebook\facebook-clinet"
REMOTE_USER="ezbitlyc"
REMOTE_HOST="facebook-poster.ezbitly.com"
REMOTE_PROJECT_PATH="/home/ezbitlyc/facebook-poster.ezbitly.com"
NODE_SERVER_PORT=3000

# ----- Telegram Setup -----
TELEGRAM_BOT_TOKEN="7616661946:AAEIiPagre-1d1lZV4BJ78CJrDRpPUgAJCE"
TELEGRAM_CHAT_ID="-4730902381"  # গ্রুপ ID ব্যবহার করুন
# ---------------------------

# ----- Functions -----
send_telegram() {
  MESSAGE="$1"
  curl -s -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
    -d chat_id="$TELEGRAM_CHAT_ID" \
    -d text="$MESSAGE" \
    -d parse_mode="Markdown"
}

send_error() {
  ERROR_MESSAGE="$1"
  send_telegram "❌ *Error During Deployment!*\n\`\`\`\n$ERROR_MESSAGE\n\`\`\`"
}

# ----- Start Deployment -----
echo "🚀 Facebook Poster Starting Deployment..."
send_telegram "🚀 *Facebook Poster Deployment Started!*"

# Step 0: Remove previous build
echo "🧹 Facebook Poster: Removing old .next folder..."
rm -rf .next

# Step 1: Local Build
echo "🛠️ Facebook Poster: Building project locally..."
BUILD_START=$(date +%s)

if npm run build; then
  BUILD_END=$(date +%s)
  BUILD_TIME=$((BUILD_END - BUILD_START))
  echo "✅ Facebook Poster: Build successful."
  send_telegram "✅ *Facebook Poster: Local Build Successful!*\n🕒 Build Time: *${BUILD_TIME}s*"
else
  echo "❌ Facebook Poster: Build failed."
  ERROR=$(tail -n 30 npm-debug.log 2>/dev/null || echo "Build failed, no debug log found.")
  send_error "$ERROR"
  exit 1
fi

# Step 2: Upload Files
echo "📡 Facebook Poster: Uploading files to server..."
UPLOAD_START=$(date +%s)

if rsync -az --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.gitignore' \
  --exclude '.gitattributes' \
  --exclude '.vscode' \
  --exclude 'deployment.log' \
  --exclude '.htaccess'\
  "$LOCAL_PROJECT_PATH" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PROJECT_PATH"; then

  UPLOAD_END=$(date +%s)
  UPLOAD_TIME=$((UPLOAD_END - UPLOAD_START))
  UPLOAD_SIZE=$(du -sh "$LOCAL_PROJECT_PATH" | cut -f1)

  echo "✅ Facebook Poster: Upload successful."
  send_telegram "📡 *Facebook Poster: Files Uploaded Successfully!*\n🕒 Upload Time: *${UPLOAD_TIME}s*\n📦 Upload Size: *${UPLOAD_SIZE}*"
else
  echo "❌ Facebook Poster: Upload failed."
  send_error "Upload failed during rsync operation."
  exit 1
fi

# Step 3: Server Side Operations
echo "🔄 Facebook Poster: Restarting server..."
ssh "$REMOTE_USER@$REMOTE_HOST" << EOF
set -e

cd "$REMOTE_PROJECT_PATH"

# Check node_modules
if [ ! -d "node_modules" ]; then
  echo "📦 Facebook Poster: node_modules not found. Installing..."
  npm install
fi

# Kill old server if running (using netstat)
echo "🔎 Facebook Poster: Checking for running server on port $NODE_SERVER_PORT..."
PID=\$(netstat -tulnp 2>/dev/null | grep :$NODE_SERVER_PORT | awk '{print \$7}' | cut -d'/' -f1)

if [ ! -z "\$PID" ]; then
  echo "⚡ Killing process \$PID on port $NODE_SERVER_PORT..."
  kill -9 \$PID
  echo "✅ Facebook Poster: Old server killed."
else
  echo "ℹ️ Facebook Poster: No running server found on port $NODE_SERVER_PORT."
fi

# Restart Node.js App via Passenger
echo "♻️ Facebook Poster: Restarting Passenger app..."
mkdir -p tmp
touch tmp/restart.txt
echo "✅ Facebook Poster: Node.js app restarted successfully!"

EOF

if [ $? -eq 0 ]; then
  send_telegram "♻️ *Facebook Poster: Server Restarted Successfully!*"
else
  send_error "❌ Facebook Poster: Server restart failed!"
  exit 1
fi

# Step 4: Deployment Complete
echo "🏁 Facebook Poster: Deployment Completed Successfully!"
send_telegram "🏁 *Facebook Poster: Deployment Completed Successfully!*\n🔗 Visit: http://$REMOTE_HOST"

# Save deployment log
echo "📅 Facebook Poster: Deployment date: $(date)" >> deployment.log
echo "🚀 Facebook Poster: Deployment Completed Successfully!" >> deployment.log
