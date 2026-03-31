#include <iostream>
#include <fstream>
#include <string>
#include <filesystem>
#include <ctime>
#include <sstream>
#include <iomanip>

namespace fs = std::filesystem;

class QuarantineManager {
private:
    std::string quarantine_dir;
    std::string log_file;
    
    std::string generateSimpleHash(const std::string& filepath) {
        std::ifstream file(filepath, std::ios::binary);
        if (!file) return "";
        
        // Simple hash based on file size and name
        auto size = fs::file_size(filepath);
        auto name_hash = std::hash<std::string>{}(fs::path(filepath).filename().string());
        
        std::stringstream ss;
        ss << std::hex << (size + name_hash + std::time(nullptr));
        return ss.str();
    }
    
    void logAction(const std::string& action, const std::string& filepath, const std::string& result) {
        std::ofstream log(log_file, std::ios::app);
        auto now = std::time(nullptr);
        log << std::put_time(std::localtime(&now), "%Y-%m-%d %H:%M:%S") 
            << " [QUARANTINE] " << action << " " << filepath << " - " << result << std::endl;
    }

public:
    QuarantineManager(const std::string& qdir, const std::string& logfile) 
        : quarantine_dir(qdir), log_file(logfile) {
        fs::create_directories(quarantine_dir);
    }
    
    bool quarantineFile(const std::string& filepath) {
        try {
            if (!fs::exists(filepath)) {
                logAction("QUARANTINE_FAILED", filepath, "File not found");
                return false;
            }
            
            std::string hash = generateSimpleHash(filepath);
            std::string quarantine_path = quarantine_dir + "/" + hash + ".quar";
            
            fs::rename(filepath, quarantine_path);
            
            std::ofstream meta(quarantine_path + ".meta");
            meta << "original_path=" << filepath << std::endl;
            meta << "hash=" << hash << std::endl;
            meta << "quarantine_time=" << std::time(nullptr) << std::endl;
            meta << "size=" << fs::file_size(quarantine_path) << std::endl;
            
            logAction("QUARANTINE_SUCCESS", filepath, "Moved to " + quarantine_path);
            return true;
        } catch (const std::exception& e) {
            logAction("QUARANTINE_ERROR", filepath, e.what());
            return false;
        }
    }
    
    bool restoreFile(const std::string& hash) {
        try {
            std::string quarantine_path = quarantine_dir + "/" + hash + ".quar";
            std::string meta_path = quarantine_path + ".meta";
            
            if (!fs::exists(quarantine_path) || !fs::exists(meta_path)) {
                logAction("RESTORE_FAILED", hash, "Quarantined file not found");
                return false;
            }
            
            std::ifstream meta(meta_path);
            std::string line, original_path;
            while (std::getline(meta, line)) {
                if (line.find("original_path=") == 0) {
                    original_path = line.substr(14);
                    break;
                }
            }
            
            if (original_path.empty()) {
                logAction("RESTORE_FAILED", hash, "Original path not found");
                return false;
            }
            
            fs::rename(quarantine_path, original_path);
            fs::remove(meta_path);
            
            logAction("RESTORE_SUCCESS", original_path, "Restored from quarantine");
            return true;
        } catch (const std::exception& e) {
            logAction("RESTORE_ERROR", hash, e.what());
            return false;
        }
    }
    
    bool removeFile(const std::string& hash) {
        try {
            std::string quarantine_path = quarantine_dir + "/" + hash + ".quar";
            std::string meta_path = quarantine_path + ".meta";
            
            fs::remove(quarantine_path);
            fs::remove(meta_path);
            
            logAction("REMOVE_SUCCESS", hash, "Permanently deleted");
            return true;
        } catch (const std::exception& e) {
            logAction("REMOVE_ERROR", hash, e.what());
            return false;
        }
    }
    
    bool mitigateFile(const std::string& filepath, const std::string& mitigation_type) {
        try {
            if (mitigation_type == "isolate") {
                fs::permissions(filepath, fs::perms::owner_read | fs::perms::group_read);
                logAction("ISOLATE", filepath, "Removed execute permissions");
                return true;
            } else if (mitigation_type == "permissions") {
                fs::permissions(filepath, fs::perms::owner_read);
                logAction("PERMISSIONS", filepath, "Set restrictive permissions");
                return true;
            } else if (mitigation_type == "process") {
                std::string cmd = "pkill -f " + filepath + " 2>/dev/null || true";
                system(cmd.c_str());
                logAction("PROCESS", filepath, "Terminated processes");
                return true;
            }
            return false;
        } catch (const std::exception& e) {
            logAction("MITIGATION_ERROR", filepath, e.what());
            return false;
        }
    }
};

int main(int argc, char* argv[]) {
    if (argc < 3) {
        std::cout << "Usage: " << argv[0] << " <action> <filepath> [options]" << std::endl;
        return 1;
    }
    
    std::string action = argv[1];
    std::string filepath = argv[2];
    std::string quarantine_dir = "/Users/mayankchand/Public/Antispyware/quarantine";
    std::string log_file = "/Users/mayankchand/Public/Antispyware/logs/forensic.log";
    
    QuarantineManager qm(quarantine_dir, log_file);
    
    if (action == "quarantine") {
        bool success = qm.quarantineFile(filepath);
        std::cout << (success ? "SUCCESS" : "FAILED") << std::endl;
        return success ? 0 : 1;
    } else if (action == "restore") {
        bool success = qm.restoreFile(filepath);
        std::cout << (success ? "SUCCESS" : "FAILED") << std::endl;
        return success ? 0 : 1;
    } else if (action == "remove") {
        bool success = qm.removeFile(filepath);
        std::cout << (success ? "SUCCESS" : "FAILED") << std::endl;
        return success ? 0 : 1;
    } else if (action == "mitigate" && argc >= 4) {
        std::string mitigation_type = argv[3];
        bool success = qm.mitigateFile(filepath, mitigation_type);
        std::cout << (success ? "SUCCESS" : "FAILED") << std::endl;
        return success ? 0 : 1;
    }
    
    std::cout << "Invalid action" << std::endl;
    return 1;
}