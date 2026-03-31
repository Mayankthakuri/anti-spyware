#include <iostream>
#include <fstream>
#include <string>
#include <iomanip>
#include <sstream>
#include <filesystem>

namespace fs = std::filesystem;

class HashGenerator {
public:
    static std::string generateSimpleHash(const std::string& filepath) {
        std::ifstream file(filepath, std::ios::binary);
        if (!file.is_open()) {
            return "";
        }
        
        // Simple hash based on file content, size, and name
        auto size = fs::file_size(filepath);
        auto name_hash = std::hash<std::string>{}(fs::path(filepath).filename().string());
        
        // Read first and last 1KB for content hash
        std::string content;
        char buffer[1024];
        file.read(buffer, sizeof(buffer));
        content.append(buffer, file.gcount());
        
        file.seekg(-std::min(1024L, (long)size), std::ios::end);
        file.read(buffer, sizeof(buffer));
        content.append(buffer, file.gcount());
        
        auto content_hash = std::hash<std::string>{}(content);
        
        std::stringstream ss;
        ss << std::hex << (size + name_hash + content_hash);
        return ss.str();
    }
    
    static bool verifyFileIntegrity(const std::string& filepath, const std::string& expected_hash) {
        std::string current_hash = generateSimpleHash(filepath);
        return current_hash == expected_hash;
    }
    
    static void generateHashReport(const std::string& directory, const std::string& output_file) {
        std::ofstream report(output_file);
        report << "File Hash Report - Generated: " << std::time(nullptr) << std::endl;
        report << "Directory: " << directory << std::endl;
        report << "Format: filepath|hash|size" << std::endl;
        report << "----------------------------------------" << std::endl;
        
        for (const auto& entry : fs::recursive_directory_iterator(directory)) {
            if (entry.is_regular_file()) {
                std::string filepath = entry.path().string();
                std::string hash = generateSimpleHash(filepath);
                uintmax_t size = fs::file_size(entry);
                
                report << filepath << "|" << hash << "|" << size << std::endl;
            }
        }
    }
};

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cout << "Usage: " << argv[0] << " <action> [options]" << std::endl;
        std::cout << "Actions:" << std::endl;
        std::cout << "  hash <filepath>                   - Generate hash" << std::endl;
        std::cout << "  verify <filepath> <expected_hash> - Verify file integrity" << std::endl;
        std::cout << "  report <directory> <output_file>  - Generate hash report" << std::endl;
        return 1;
    }
    
    std::string action = argv[1];
    
    if (action == "hash" && argc >= 3) {
        std::string hash = HashGenerator::generateSimpleHash(argv[2]);
        if (hash.empty()) {
            std::cout << "ERROR: Could not read file" << std::endl;
            return 1;
        }
        std::cout << hash << std::endl;
    } else if (action == "verify" && argc >= 4) {
        bool valid = HashGenerator::verifyFileIntegrity(argv[2], argv[3]);
        std::cout << (valid ? "VALID" : "INVALID") << std::endl;
        return valid ? 0 : 1;
    } else if (action == "report" && argc >= 4) {
        HashGenerator::generateHashReport(argv[2], argv[3]);
        std::cout << "Hash report generated: " << argv[3] << std::endl;
    } else {
        std::cout << "Invalid action or missing parameters" << std::endl;
        return 1;
    }
    
    return 0;
}