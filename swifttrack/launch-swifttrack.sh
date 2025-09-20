#!/bin/bash

# SwiftTrack Backend Launcher for Unix/Linux/macOS
# Single script to launch the complete SwiftTrack backend

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
log() {
    local type=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $type in
        "info")
            echo -e "${CYAN}🔍 [$timestamp] $message${NC}"
            ;;
        "success")
            echo -e "${GREEN}✅ [$timestamp] $message${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}⚠️ [$timestamp] $message${NC}"
            ;;
        "error")
            echo -e "${RED}❌ [$timestamp] $message${NC}"
            ;;
    esac
}

# Cleanup function
cleanup() {
    log "info" "Shutting down SwiftTrack backend..."
    
    # Kill background processes
    if [[ -n $API_GATEWAY_PID ]]; then
        kill $API_GATEWAY_PID 2>/dev/null || true
        log "info" "Stopped API Gateway"
    fi
    
    if [[ -n $ORDER_SERVICE_PID ]]; then
        kill $ORDER_SERVICE_PID 2>/dev/null || true
        log "info" "Stopped Order Service"
    fi
    
    # Stop Docker services
    log "info" "Stopping Docker infrastructure..."
    docker-compose down || true
    
    log "success" "SwiftTrack backend shutdown complete"
    exit 0
}

# Set up signal handlers
trap cleanup INT TERM

# Main execution
main() {
    clear
    echo "========================================"
    echo "🚀 SwiftTrack Backend Launcher"
    echo "========================================"
    echo ""
    
    # Change to script directory
    cd "$(dirname "$0")"
    
    # Check prerequisites
    log "info" "Checking prerequisites..."
    
    if ! command -v node &> /dev/null; then
        log "error" "Node.js is not installed or not in PATH"
        log "error" "Please install Node.js from https://nodejs.org/"
        exit 1
    fi
    log "success" "Node.js is installed"
    
    if ! command -v pnpm &> /dev/null; then
        log "warning" "pnpm is not installed. Installing..."
        npm install -g pnpm || {
            log "error" "Failed to install pnpm"
            exit 1
        }
    fi
    log "success" "pnpm is available"
    
    if ! docker info &> /dev/null; then
        log "error" "Docker is not running"
        log "error" "Please start Docker and try again"
        exit 1
    fi
    log "success" "Docker is running"
    
    if ! docker-compose --version &> /dev/null; then
        log "error" "Docker Compose is not installed"
        exit 1
    fi
    log "success" "Docker Compose is available"
    
    # Launch using Node.js launcher
    log "info" "Launching SwiftTrack Backend..."
    node launch-swifttrack.js
}

# Check if script is being sourced or executed
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi