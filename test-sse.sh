#!/bin/bash

# Test SSE server with curl
# Usage: ./test-sse.sh [port]

PORT=${1:-3000}
URL="http://localhost:${PORT}"

echo "Testing SSE server at ${URL}"
echo "Press Ctrl+C to stop"
echo "========================"

curl -N -H "Accept: text/event-stream" "${URL}"