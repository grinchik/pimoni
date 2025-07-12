#!/bin/sh

if [ $# -lt 2 ]; then
    echo "Usage: $0 <interval_seconds> <command>"
    exit 1
fi

INTERVAL=$1
shift
COMMAND="$*"

while true; do
    eval "$COMMAND"
    sleep "$INTERVAL" || exit 1
done
