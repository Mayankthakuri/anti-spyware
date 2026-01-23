CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra
# Uncomment the following lines to enable TensorFlow AI features
# CXXFLAGS += -DUSE_TENSORFLOW
# LDFLAGS = -ltensorflow
TARGETS = agent/collector agent/detector agent/exporter

all: $(TARGETS)

agent/collector: agent/collector.cpp
	$(CXX) $(CXXFLAGS) -o $@ $<

agent/detector: agent/detector.cpp
	$(CXX) $(CXXFLAGS) $(LDFLAGS) -o $@ $<

agent/exporter: agent/exporter.cpp
	$(CXX) $(CXXFLAGS) -o $@ $<

clean:
	rm -f $(TARGETS)

.PHONY: all clean