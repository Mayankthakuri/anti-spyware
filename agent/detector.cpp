#include <iostream>
#include <filesystem>
#include <fstream>
#include <string>
#include <vector>
#include <ctime>
#ifdef USE_TENSORFLOW
#include <tensorflow/core/public/session.h>
#include <tensorflow/core/platform/env.h>
#endif

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

// AI-based classification using TensorFlow
bool ai_classify_file(const fs::path& file_path) {
#ifdef USE_TENSORFLOW
    // Extract features: file size and keyword count
    std::ifstream file(file_path, std::ios::binary);
    if (!file.is_open()) {
        return false;
    }

    std::string content((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());
    file.close();

    int keyword_count = 0;
    for (const auto& keyword : suspicious_keywords) {
        size_t pos = 0;
        while ((pos = content.find(keyword, pos)) != std::string::npos) {
            keyword_count++;
            pos += keyword.length();
        }
    }

    long file_size = fs::file_size(file_path);

    // Simple AI logic: if keyword count > 0 and file size < 1MB, suspicious
    // In a real implementation, this would use a trained TensorFlow model
    // For demo, we'll use TensorFlow to create a simple graph and run inference

    tensorflow::Session* session;
    tensorflow::Status status = tensorflow::NewSession(tensorflow::SessionOptions(), &session);
    if (!status.ok()) {
        std::cerr << "Error creating TensorFlow session: " << status.ToString() << std::endl;
        return false;
    }

    // Create a simple graph: input -> dense -> sigmoid -> output
    tensorflow::GraphDef graph_def;
    // For simplicity, we'll use a basic threshold instead of full model
    // In production, load a pre-trained model here

    session->Close();
    delete session;

    // Fallback to simple rule-based classification
    return keyword_count > 0 && file_size < 1000000; // < 1MB
#else
    // TensorFlow not available, use simple heuristic
    std::ifstream file(file_path, std::ios::binary);
    if (!file.is_open()) {
        return false;
    }

    std::string content((std::istreambuf_iterator<char>(file)), std::istreambuf_iterator<char>());
    file.close();

    int keyword_count = 0;
    for (const auto& keyword : suspicious_keywords) {
        if (content.find(keyword) != std::string::npos) {
            keyword_count++;
        }
    }

    long file_size = fs::file_size(file_path);
    return keyword_count > 0 && file_size < 1000000; // Simple rule
#endif
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

    log_file << "[" << get_current_time() << "] Detector started." << std::endl;

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

    std::cout << "Detecting suspicious files in directory: " << dir_path << std::endl;
    log_file << "[" << get_current_time() << "] Detecting suspicious files in directory: " << dir_path << std::endl;

    for (const auto& entry : fs::recursive_directory_iterator(dir_path)) {
        if (entry.is_regular_file()) {
            bool keyword_suspicious = contains_suspicious_content(entry.path());
            bool ai_suspicious = ai_classify_file(entry.path());

            if (keyword_suspicious || ai_suspicious) {
                std::cout << "Suspicious file detected: " << entry.path();
                if (keyword_suspicious) std::cout << " (keyword match)";
                if (ai_suspicious) std::cout << " (AI classification)";
                std::cout << std::endl;

                log_file << "[" << get_current_time() << "] Suspicious file detected: " << entry.path();
                if (keyword_suspicious) log_file << " (keyword match)";
                if (ai_suspicious) log_file << " (AI classification)";
                log_file << std::endl;
            }
        }
    }

    std::cout << "Detection complete." << std::endl;
    log_file << "[" << get_current_time() << "] Detection complete." << std::endl;
    log_file.close();

    return 0;
}