#!/bin/bash

# AntiSpyware Pro - Full System Startup Script
# Comprehensive real-time cybersecurity system with full scan capabilities

echo "🛡️  Starting AntiSpyware Pro - Full System Edition"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -ti:$1 >/dev/null 2>&1
}

# Function to kill processes on a port
kill_port() {
    if port_in_use $1; then
        echo -e "${YELLOW}Killing existing processes on port $1...${NC}"
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Check prerequisites
echo -e "${BLUE}Checking system prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm not found. Please install npm${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18+ required. Current: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Build C++ components
echo -e "${BLUE}Building C++ security components...${NC}"
if [ -f "Makefile" ]; then
    make clean >/dev/null 2>&1
    if make all; then
        echo -e "${GREEN}✅ C++ components built successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  C++ build failed, using simulation mode${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Makefile not found, using simulation mode${NC}"
fi

# Create necessary directories
echo -e "${BLUE}Setting up directory structure...${NC}"
mkdir -p quarantine logs export
touch logs/forensic.log

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing Node.js dependencies...${NC}"
    npm install
fi

# Install web app dependencies
if [ -d "web-app" ] && [ ! -d "web-app/node_modules" ]; then
    echo -e "${BLUE}Installing web app dependencies...${NC}"
    cd web-app && npm install && cd ..
fi

# Install mobile app dependencies (optional)
if [ -d "mobile-app" ] && [ ! -d "mobile-app/node_modules" ]; then
    echo -e "${BLUE}Installing mobile app dependencies...${NC}"
    cd mobile-app && npm install && cd ..
fi

# Clean up existing processes
echo -e "${BLUE}Cleaning up existing processes...${NC}"
kill_port 3001  # WebSocket server
kill_port 3000  # Web app
kill_port 19006 # Mobile app (Expo)

# Start WebSocket server
echo -e "${BLUE}Starting AntiSpyware Real-Time Server...${NC}"
node realtime-server.js &
SERVER_PID=$!
sleep 3

# Check if server started successfully
if port_in_use 3001; then
    echo -e "${GREEN}✅ Real-Time Server started on port 3001${NC}"
else
    echo -e "${RED}❌ Failed to start Real-Time Server${NC}"
    exit 1
fi

# Start web application
if [ -d "web-app" ]; then
    echo -e "${BLUE}Starting Web Application...${NC}"
    cd web-app
    npm start &
    WEB_PID=$!
    cd ..
    sleep 5
    
    if port_in_use 3000; then
        echo -e "${GREEN}✅ Web Application started on port 3000${NC}"
    else
        echo -e "${YELLOW}⚠️  Web Application may be starting...${NC}"
    fi
fi

# Start mobile application (optional)
if [ -d "mobile-app" ] && command_exists expo; then
    echo -e "${BLUE}Starting Mobile Application...${NC}"
    cd mobile-app
    expo start --web &
    MOBILE_PID=$!
    cd ..
    sleep 3
    echo -e "${GREEN}✅ Mobile Application started${NC}"
fi

# System status
echo ""
echo -e "${GREEN}🚀 AntiSpyware Pro Full System Started Successfully!${NC}"
echo "=================================================="
echo -e "${BLUE}📊 System Status:${NC}"
echo "  • Real-Time Server: ws://localhost:3001"
echo "  • Web Application: http://localhost:3000"
echo "  • Mobile App: Available via Expo (if installed)"
echo ""
echo -e "${BLUE}🔧 Available Scan Types:${NC}"
echo "  • Quick Scan: 500 files, 400ms intervals"
echo "  • Deep Scan: 1000 files, 1000ms intervals"
echo "  • Full System Scan: 2500 files, 1500ms intervals"
echo ""
echo -e "${BLUE}🛡️  Security Features:${NC}"
echo "  • Real-time threat monitoring"
echo "  • Advanced quarantine system"
echo "  • Threat mitigation capabilities"
echo "  • Comprehensive forensic logging"
echo "  • Cross-platform interfaces"
echo ""
echo -e "${BLUE}🎯 Access Points:${NC}"
echo "  • Web Interface: http://localhost:3000"
echo "  • WebSocket API: ws://localhost:3001"
echo "  • Mobile Interface: Expo DevTools"
echo ""

# Function to handle cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}🔄 Shutting down AntiSpyware Pro...${NC}"
    
    # Kill all spawned processes
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
    fi
    if [ ! -z "$WEB_PID" ]; then
        kill $WEB_PID 2>/dev/null || true
    fi
    if [ ! -z "$MOBILE_PID" ]; then
        kill $MOBILE_PID 2>/dev/null || true
    fi
    
    # Kill processes on ports
    kill_port 3001
    kill_port 3000
    kill_port 19006
    
    echo -e "${GREEN}✅ AntiSpyware Pro shutdown complete${NC}"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running and show live status
echo -e "${BLUE}📈 Live System Monitoring (Press Ctrl+C to stop):${NC}"
echo "=================================================="

while true; do
    # Show current time and basic status
    echo -n -e "\r${GREEN}$(date '+%H:%M:%S')${NC} - "
    
    if port_in_use 3001; then
        echo -n -e "${GREEN}Server: ✅${NC} "
    else
        echo -n -e "${RED}Server: ❌${NC} "
    fi
    
    if port_in_use 3000; then
        echo -n -e "${GREEN}Web: ✅${NC} "
    else
        echo -n -e "${YELLOW}Web: ⏳${NC} "
    fi
    
    # Count quarantine files
    QUARANTINE_COUNT=0
    if [ -d "quarantine" ]; then
        QUARANTINE_COUNT=$(ls quarantine/*.quar 2>/dev/null | wc -l | tr -d ' ')
    fi
    echo -n -e "${BLUE}Quarantine: ${QUARANTINE_COUNT}${NC} "
    
    # Show log count
    LOG_COUNT=0
    if [ -f "logs/forensic.log" ]; then
        LOG_COUNT=$(wc -l < logs/forensic.log 2>/dev/null || echo 0)
    fi
    echo -n -e "${BLUE}Logs: ${LOG_COUNT}${NC}"
    
    sleep 5
done