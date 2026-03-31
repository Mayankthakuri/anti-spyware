#!/bin/bash

echo "🚀 Starting AntiSpyware Pro System..."

# Kill any existing processes
pkill -f "realtime-server|react-scripts|expo" 2>/dev/null
sleep 2

# Start WebSocket server
cd /Users/mayankchand/Public/Antispyware
echo "📡 Starting WebSocket server on port 3001..."
node realtime-server.js &
SERVER_PID=$!
sleep 3

# Start React web app
cd web-app
echo "🌐 Starting web app on port 3000..."
npm start &
WEB_PID=$!
sleep 5

# Start mobile web app
cd ../mobile-app
echo "📱 Starting mobile app on port 19006..."
npx expo start --web &
MOBILE_PID=$!

echo "✅ All services started!"
echo "📱 Web App: http://localhost:3000"
echo "📱 Mobile Web: http://localhost:19006"
echo "🔌 WebSocket: ws://localhost:3001"

# Keep script running
wait