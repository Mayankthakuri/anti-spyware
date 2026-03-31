#!/bin/bash

# AntiSpyware Background Server
# Runs the real-time server in background for mobile/web apps

SCRIPT_DIR="/Users/mayankchand/Public/Antispyware"
SERVER_PID_FILE="$SCRIPT_DIR/server.pid"
LOG_FILE="$SCRIPT_DIR/server-bg.log"

start_server() {
    cd "$SCRIPT_DIR"
    
    # Kill existing server if running
    if [ -f "$SERVER_PID_FILE" ]; then
        OLD_PID=$(cat "$SERVER_PID_FILE")
        kill -9 "$OLD_PID" 2>/dev/null
        rm -f "$SERVER_PID_FILE"
    fi
    
    # Start server in background
    nohup node realtime-server.js > "$LOG_FILE" 2>&1 &
    SERVER_PID=$!
    
    # Save PID
    echo "$SERVER_PID" > "$SERVER_PID_FILE"
    
    echo "🛡️ AntiSpyware Server started (PID: $SERVER_PID)"
    echo "📡 WebSocket: ws://localhost:3001"
    echo "📋 Logs: $LOG_FILE"
}

stop_server() {
    if [ -f "$SERVER_PID_FILE" ]; then
        PID=$(cat "$SERVER_PID_FILE")
        kill -9 "$PID" 2>/dev/null
        rm -f "$SERVER_PID_FILE"
        echo "🛑 AntiSpyware Server stopped"
    else
        echo "❌ Server not running"
    fi
}

status_server() {
    if [ -f "$SERVER_PID_FILE" ]; then
        PID=$(cat "$SERVER_PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo "✅ AntiSpyware Server running (PID: $PID)"
            echo "📡 WebSocket: ws://localhost:3001"
        else
            echo "❌ Server PID file exists but process not running"
            rm -f "$SERVER_PID_FILE"
        fi
    else
        echo "❌ AntiSpyware Server not running"
    fi
}

case "$1" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        stop_server
        sleep 1
        start_server
        ;;
    status)
        status_server
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac