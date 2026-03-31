#!/bin/bash

# AntiSpyware Background Process
# Runs continuous security monitoring and threat detection

SCRIPT_DIR="/Users/mayankchand/Public/Antispyware"
PROCESS_PID_FILE="$SCRIPT_DIR/antispyware.pid"
LOG_FILE="$SCRIPT_DIR/logs/antispyware-bg.log"

run_foreground() {
    cd "$SCRIPT_DIR"

    while true; do
        echo "$(date) [ANTISPYWARE] Running security scan..." >> "$LOG_FILE"

        # Run detector
        if [ -f agent/detector ]; then
            ./agent/detector . >> "$LOG_FILE" 2>&1
        fi

        # Check for threats and auto-quarantine
        if [ -f agent/quarantine_manager ]; then
            find . -name "*.suspicious" -o -name "*.malware" 2>/dev/null | while read file; do
                if [ -f "$file" ]; then
                    echo "$(date) [QUARANTINE] Auto-quarantining: $file" >> "$LOG_FILE"
                    ./agent/quarantine_manager quarantine "$file" >> "$LOG_FILE" 2>&1
                fi
            done
        fi

        # Generate hash report
        if [ -f agent/hash_generator ]; then
            ./agent/hash_generator report . export/hash_report.txt >> "$LOG_FILE" 2>&1
        fi

        # Update system status
        echo "$(date) [STATUS] Protection active - $(find quarantine -name "*.quar" 2>/dev/null | wc -l | tr -d " ") threats quarantined" >> "$LOG_FILE"

        sleep 30
    done
}

start_process() {
    cd "$SCRIPT_DIR"
    
    # Kill existing process if running
    if [ -f "$PROCESS_PID_FILE" ]; then
        OLD_PID=$(cat "$PROCESS_PID_FILE")
        kill -9 "$OLD_PID" 2>/dev/null
        rm -f "$PROCESS_PID_FILE"
    fi
    
    # Start background process
    nohup bash -c '
        while true; do
            echo "$(date) [ANTISPYWARE] Running security scan..." >> "'$LOG_FILE'"
            
            # Run detector
            if [ -f agent/detector ]; then
                ./agent/detector . >> "'$LOG_FILE'" 2>&1
            fi
            
            # Check for threats and auto-quarantine
            if [ -f agent/quarantine_manager ]; then
                find . -name "*.suspicious" -o -name "*.malware" 2>/dev/null | while read file; do
                    if [ -f "$file" ]; then
                        echo "$(date) [QUARANTINE] Auto-quarantining: $file" >> "'$LOG_FILE'"
                        ./agent/quarantine_manager quarantine "$file" >> "'$LOG_FILE'" 2>&1
                    fi
                done
            fi
            
            # Generate hash report
            if [ -f agent/hash_generator ]; then
                ./agent/hash_generator report . export/hash_report.txt >> "'$LOG_FILE'" 2>&1
            fi
            
            # Update system status
            echo "$(date) [STATUS] Protection active - $(find quarantine -name "*.quar" 2>/dev/null | wc -l | tr -d " ") threats quarantined" >> "'$LOG_FILE'"
            
            sleep 30
        done
    ' &
    
    PROCESS_PID=$!
    echo "$PROCESS_PID" > "$PROCESS_PID_FILE"
    
    echo "🛡️ AntiSpyware Background Process started (PID: $PROCESS_PID)"
    echo "📋 Logs: $LOG_FILE"
}

stop_process() {
    if [ -f "$PROCESS_PID_FILE" ]; then
        PID=$(cat "$PROCESS_PID_FILE")
        kill -9 "$PID" 2>/dev/null
        rm -f "$PROCESS_PID_FILE"
        echo "🛑 AntiSpyware Background Process stopped"
    else
        echo "❌ Process not running"
    fi
}

status_process() {
    if [ -f "$PROCESS_PID_FILE" ]; then
        PID=$(cat "$PROCESS_PID_FILE")
        if kill -0 "$PID" 2>/dev/null; then
            echo "✅ AntiSpyware Background Process running (PID: $PID)"
            echo "📋 Logs: $LOG_FILE"
            echo "🔒 Quarantined: $(find quarantine -name "*.quar" 2>/dev/null | wc -l | tr -d " ") threats"
        else
            echo "❌ Process PID file exists but process not running"
            rm -f "$PROCESS_PID_FILE"
        fi
    else
        echo "❌ AntiSpyware Background Process not running"
    fi
}

case "$1" in
    start)
        start_process
        ;;
    run-foreground)
        run_foreground
        ;;
    stop)
        stop_process
        ;;
    restart)
        stop_process
        sleep 1
        start_process
        ;;
    status)
        status_process
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac