#include <iostream>
#include <filesystem>
#include <string>
#include <fstream>
#include <ctime>

namespace fs = std::filesystem;

std::string get_current_time() {
    std::time_t now = std::time(nullptr);
    char buf[100];
    std::strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", std::localtime(&now));
    return buf;
}

int main(int argc, char* argv[]) {
    std::ofstream log_file("/Users/mayankchand/Public/Antispyware/logs/forensic.log", std::ios::app);
    if (!log_file.is_open()) {
        std::cout << "Error: Cannot open log file." << std::endl;
        return 1;
    }

    log_file << "[" << get_current_time() << "] Collector started." << std::endl;

    if (argc != 2) {
        std::cout << "Usage: " << argv[0] << " <directory_path>" << std::endl;
        log_file << "[" << get_current_time() << "] Error: Invalid arguments." << std::endl;
        log_file.close();
        return 1;
    }

    fs::path dir_path = argv[1];

    if (!fs::exists(dir_path) || !fs::is_directory(dir_path)) {
        std::cout << "Error: Provided path is not a valid directory." << std::endl;
        log_file << "[" << get_current_time() << "] Error: Invalid directory path: " << dir_path << std::endl;
        log_file.close();
        return 1;
    }

    std::cout << "Collecting files from directory: " << dir_path << std::endl;
    log_file << "[" << get_current_time() << "] Collecting files from directory: " << dir_path << std::endl;

    for (const auto& entry : fs::recursive_directory_iterator(dir_path)) {
        if (entry.is_regular_file()) {
            std::cout << "File: " << entry.path() << ", Size: " << entry.file_size() << " bytes" << std::endl;
            log_file << "[" << get_current_time() << "] File collected: " << entry.path() << ", Size: " << entry.file_size() << " bytes" << std::endl;
        }
    }

    std::cout << "Collection complete." << std::endl;
    log_file << "[" << get_current_time() << "] Collection complete." << std::endl;
    log_file.close();

    return 0;
}

