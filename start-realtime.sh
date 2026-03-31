#!/bin/bash

# AntiSpyware Pro Real-Time System Startup Script

echo "🚀 Starting AntiSpyware Pro Real-Time System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_DIR="/Users/mayankchand/Public/Antispyware"

# Function to check if a process is running
check_process() {
    if pgrep -f "$1" > /dev/null; then
        echo -e "${GREEN}✓${NC} $2 is running"
        return 0
    else
        echo -e "${RED}✗${NC} $2 is not running"
        return 1
    fi
}

# Function to start a process in background
start_process() {
    echo -e "${BLUE}Starting $2...${NC}"
    cd "$1" && $3 > /dev/null 2>&1 &
    sleep 2
    if check_process "$4" "$2"; then
        echo -e "${GREEN}✓${NC} $2 started successfully"
    else
        echo -e "${RED}✗${NC} Failed to start $2"
    fi
}

echo -e "${YELLOW}📋 Checking system status...${NC}"

# Check if directories exist
if [ ! -d "$BASE_DIR" ]; then
    echo -e "${RED}✗${NC} Base directory not found: $BASE_DIR"
    exit 1
fi

# Create necessary directories
mkdir -p "$BASE_DIR/quarantine"
mkdir -p "$BASE_DIR/logs"
mkdir -p "$BASE_DIR/export"

echo -e "${YELLOW}🔧 Building C++ components...${NC}"
cd "$BASE_DIR"
make clean > /dev/null 2>&1
make all > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} C++ components built successfully"
else
    echo -e "${RED}✗${NC} Failed to build C++ components"
    exit 1
fi

echo -e "${YELLOW}🌐 Installing Node.js dependencies...${NC}"
if [ ! -f "$BASE_DIR/package.json" ]; then
    echo -e "${RED}✗${NC} package.json not found"
    exit 1
fi

cd "$BASE_DIR"
npm install > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Node.js dependencies installed"
else
    echo -e "${RED}✗${NC} Failed to install Node.js dependencies"
    exit 1
fi

echo -e "${YELLOW}🚀 Starting real-time services...${NC}"

# Start WebSocket server
start_process "$BASE_DIR" "Real-Time WebSocket Server" "node realtime-server.js" "realtime-server.js"

# Start web application
echo -e "${BLUE}Starting Web Application...${NC}"
cd "$BASE_DIR/web-app"
if [ ! -d "node_modules" ]; then
    npm install > /dev/null 2>&1
fi
npm start > /dev/null 2>&1 &
sleep 5
if check_process "react-scripts start" "Web Application"; then
    echo -e "${GREEN}✓${NC} Web Application started on http://localhost:3000"
else
    echo -e "${RED}✗${NC} Failed to start Web Application"
fi

# Start mobile app (if Expo is available)
if command -v expo &> /dev/null; then
    echo -e "${BLUE}Starting Mobile Application...${NC}"
    cd "$BASE_DIR/mobile-app"
    if [ ! -d "node_modules" ]; then
        npm install > /dev/null 2>&1
    fi
    expo start > /dev/null 2>&1 &
    sleep 3
    if check_process "expo start" "Mobile Application"; then
        echo -e "${GREEN}✓${NC} Mobile Application started"
    else
        echo -e "${RED}✗${NC} Failed to start Mobile Application"
    fi
else
    echo -e "${YELLOW}⚠${NC} Expo CLI not found, skipping mobile app"
fi

# Start daemon for continuous monitoring
echo -e "${BLUE}Starting Background Daemon...${NC}"
cd "$BASE_DIR"
chmod +x daemon/antispyware_daemon.sh
./daemon/antispyware_daemon.sh &
sleep 2
echo -e "${GREEN}✓${NC} Background daemon started"

echo ""
echo -e "${GREEN}🎉 AntiSpyware Pro Real-Time System is now running!${NC}"
echo ""
echo -e "${BLUE}📱 Access Points:${NC}"
echo -e "   Web App:     ${GREEN}http://localhost:3000${NC}"
echo -e "   WebSocket:   ${GREEN}ws://localhost:3001${NC}"
echo -e "   Mobile App:  ${GREEN}Expo DevTools (if available)${NC}"
echo ""
echo -e "${BLUE}🔧 Management Commands:${NC}"
echo -e "   Stop all:    ${YELLOW}pkill -f 'realtime-server\\|react-scripts\\|expo'${NC}"
echo -e "   View logs:   ${YELLOW}tail -f $BASE_DIR/logs/forensic.log${NC}"
echo -e "   Status:      ${YELLOW}./integration.sh status${NC}"
echo ""
echo -e "${YELLOW}📊 System will now provide real-time updates for:${NC}"
echo -e "   • Threat detection and quarantine"
echo -e "   • File system monitoring"
echo -e "   • Security event logging"
echo -e "   • System health metrics"
echo ""
echo -e "${GREEN}✨ Real-time cybersecurity monitoring is active!${NC}"