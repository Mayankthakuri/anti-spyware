#include <iostream>
#include <filesystem>
#include <fstream>
#include <string>
#include <vector>
#include <ctime>

namespace fs = std::filesystem;

// Simple list of suspicious keywords (expand as needed)
const std::vector<std::string> suspicious_keywords = {
    "malware",
    "trojan",
    "virus",
    "spyware",
    "keylogger"
};

std::string get_current_time() {
    std::time_t now = std::time(nullptr);
    char buf[100];
    std::strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", std::localtime(&now));
    return buf;
}

bool contains_suspicious_content(const fs::path& file_path) {
    std::ifstream file(file_path, std::ios::binary);
    if (!file.is_open()) {
        return false;
    }

    std::string content((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());
    file.close();

    for (const auto& keyword : suspicious_keywords) {
        if (content.find(keyword) != std::string::npos) {
            return true;
        }
    }

    return false;
}

int main(int argc, char* argv[]) {
    std::ofstream log_file("/Users/mayankchand/Public/Antispyware/logs/forensic.log", std::ios::app);
    if (!log_file.is_open()) {
        std::cout << "Error: Cannot open log file." << std::endl;
        return 1;
    }

    log_file << "[" << get_current_time() << "] Exporter started." << std::endl;

    if (argc != 3) {
        std::cout << "Usage: " << argv[0] << " <directory_path> <output_file>" << std::endl;
        log_file << "[" << get_current_time() << "] Error: Invalid arguments." << std::endl;
        log_file.close();
        return 1;
    }

    fs::path dir_path = argv[1];
    std::string output_file = argv[2];

    if (!fs::exists(dir_path) || !fs::is_directory(dir_path)) {
        std::cout << "Error: Provided path is not a valid directory." << std::endl;
        log_file << "[" << get_current_time() << "] Error: Invalid directory path: " << dir_path << std::endl;
        log_file.close();
        return 1;
    }

    std::cout << "Exporting suspicious files from directory: " << dir_path << " to " << output_file << std::endl;
    log_file << "[" << get_current_time() << "] Exporting suspicious files from directory: " << dir_path << " to " << output_file << std::endl;

    std::ofstream out_file(output_file);
    if (!out_file.is_open()) {
        std::cout << "Error: Cannot open output file." << std::endl;
        log_file << "[" << get_current_time() << "] Error: Cannot open output file: " << output_file << std::endl;
        log_file.close();
        return 1;
    }

    out_file << "{\n";
    out_file << "  \"suspicious_files\": [\n";

    bool first = true;
    for (const auto& entry : fs::recursive_directory_iterator(dir_path)) {
        if (entry.is_regular_file()) {
            if (contains_suspicious_content(entry.path())) {
                if (!first) {
                    out_file << ",\n";
                }
                out_file << "    \"" << entry.path().string() << "\"";
                log_file << "[" << get_current_time() << "] Exported suspicious file: " << entry.path() << std::endl;
                first = false;
            }
        }
    }

    out_file << "\n  ]\n";
    out_file << "}\n";

    out_file.close();

    std::cout << "Export complete." << std::endl;
    log_file << "[" << get_current_time() << "] Export complete." << std::endl;
    log_file.close();

    return 0;
}