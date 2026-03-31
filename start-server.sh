#!/bin/bash

# AntiSpyware Pro Server Startup Script
echo "🛡️  Starting AntiSpyware Pro Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to project directory
cd "$(dirname "$0")"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Kill any existing processes on port 3001
echo "🔄 Checking for existing processes..."
lsof -ti:3001 | xargs kill -9 2>/dev/null || true

# Create required directories
echo "📁 Creating required directories..."
mkdir -p quarantine logs export agent

# Create default log file if it doesn't exist
if [ ! -f "logs/forensic.log" ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') [SYSTEM] AntiSpyware Pro initialized" > logs/forensic.log
fi

# Start the server
echo "🚀 Starting WebSocket server on port 3001..."
node realtime-server.js

echo "✅ Server started successfully!"
echo "🌐 WebSocket server running on ws://localhost:3001"
echo "📊 Connect your web app to http://localhost:3000"
echo "📱 Connect your mobile app to the same network"