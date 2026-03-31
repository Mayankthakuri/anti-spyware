#!/bin/bash

# Integration Script for AntiSpyware Pro
# Connects C++ backend operations with React frontend

AGENT_DIR="/Users/mayankchand/Public/Antispyware/agent"
WEB_APP_DIR="/Users/mayankchand/Public/Antispyware/web-app"
LOG_FILE="/Users/mayankchand/Public/Antispyware/logs/forensic.log"
QUARANTINE_DIR="/Users/mayankchand/Public/Antispyware/quarantine"

# Function to handle quarantine operations
handle_quarantine() {
    local action="$1"
    local target="$2"
    local result=""
    
    cd "$AGENT_DIR"
    
    case "$action" in
        "quarantine")
            result=$(./quarantine_manager quarantine "$target" 2>&1)
            ;;
        "restore")
            result=$(./quarantine_manager restore "$target" 2>&1)
            ;;
        "remove")
            result=$(./quarantine_manager remove "$target" 2>&1)
            ;;
        *)
            echo "ERROR: Invalid quarantine action"
            return 1
            ;;
    esac
    
    echo "$result"
    return $?
}

# Function to handle mitigation operations
handle_mitigation() {
    local filepath="$1"
    local mitigation_type="$2"
    local result=""
    
    cd "$AGENT_DIR"
    
    case "$mitigation_type" in
        "isolate"|"permissions"|"process")
            result=$(./quarantine_manager mitigate "$filepath" "$mitigation_type" 2>&1)
            ;;
        "patch")
            result=$(./vulnerability_patcher patch "$filepath" 2>&1)
            ;;
        *)
            echo "ERROR: Invalid mitigation type"
            return 1
            ;;
    esac
    
    echo "$result"
    return $?
}

# Function to generate file hash
generate_hash() {
    local filepath="$1"
    local hash_type="${2:-sha256}"
    
    cd "$AGENT_DIR"
    ./hash_generator "$hash_type" "$filepath" 2>/dev/null
}

# Function to update web app data
update_web_data() {
    local quarantine_count=$(find "$QUARANTINE_DIR" -name "*.quar" 2>/dev/null | wc -l | tr -d ' ')
    local total_files=$(find "/Users/mayankchand/Public/Antispyware" -type f 2>/dev/null | wc -l | tr -d ' ')
    local patches_applied=$(grep -c "PATCH.*Applied" "$LOG_FILE" 2>/dev/null || echo 0)
    
    # Create updated security status
    cat > "$WEB_APP_DIR/public/security-status.json" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "quarantineCount": $quarantine_count,
  "totalFiles": $total_files,
  "patchesApplied": $patches_applied,
  "systemHealth": "$([ $quarantine_count -eq 0 ] && echo 'excellent' || echo 'warning')",
  "lastUpdate": "$(date '+%Y-%m-%d %H:%M:%S')"
}
EOF

    # Generate threat list for web app
    cat > "$WEB_APP_DIR/public/threats.json" << EOF
{
  "threats": [
EOF
    
    local first=true
    for quar_file in "$QUARANTINE_DIR"/*.quar; do
        if [ -f "$quar_file" ]; then
            local meta_file="${quar_file}.meta"
            if [ -f "$meta_file" ]; then
                [ "$first" = false ] && echo "    ," >> "$WEB_APP_DIR/public/threats.json"
                first=false
                
                local original_path=$(grep "original_path=" "$meta_file" | cut -d'=' -f2)
                local hash=$(grep "hash=" "$meta_file" | cut -d'=' -f2)
                local size=$(grep "size=" "$meta_file" | cut -d'=' -f2)
                local qtime=$(grep "quarantine_time=" "$meta_file" | cut -d'=' -f2)
                
                cat >> "$WEB_APP_DIR/public/threats.json" << EOF
    {
      "id": "${hash:0:8}",
      "name": "$(basename "$original_path")",
      "type": "malware",
      "severity": "high",
      "path": "$original_path",
      "size": ${size:-0},
      "detected": "$(date -r $qtime -Iseconds 2>/dev/null || date -Iseconds)",
      "status": "quarantined",
      "hash": "$hash",
      "quarantineDate": "$(date -r $qtime -Iseconds 2>/dev/null || date -Iseconds)"
    }
EOF
            fi
        fi
    done
    
    cat >> "$WEB_APP_DIR/public/threats.json" << EOF

  ]
}
EOF
}

# Main command handler
case "$1" in
    "quarantine")
        handle_quarantine "$2" "$3"
        update_web_data
        ;;
    "mitigate")
        handle_mitigation "$2" "$3"
        update_web_data
        ;;
    "hash")
        generate_hash "$2" "$3"
        ;;
    "update-web")
        update_web_data
        echo "Web app data updated"
        ;;
    "status")
        echo "Quarantine files: $(find "$QUARANTINE_DIR" -name "*.quar" 2>/dev/null | wc -l | tr -d ' ')"
        echo "Log entries: $(wc -l < "$LOG_FILE" 2>/dev/null || echo 0)"
        echo "Last scan: $(tail -1 "$LOG_FILE" 2>/dev/null | cut -d' ' -f1-2 || echo 'Never')"
        ;;
    *)
        echo "Usage: $0 <command> [options]"
        echo "Commands:"
        echo "  quarantine <action> <target>  - quarantine, restore, or remove"
        echo "  mitigate <filepath> <type>    - apply mitigation"
        echo "  hash <filepath> [type]        - generate file hash"
        echo "  update-web                    - update web app data"
        echo "  status                        - show system status"
        exit 1
        ;;
esac