#!/bin/sh

# Check if threshold parameter provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <threshold_celsius>"
    exit 1
fi

# Temperature thresholds
THRESHOLD_C=$1
THRESHOLD_K=$((THRESHOLD_C + 273))
THRESHOLD_MC=$((THRESHOLD_C * 1000))

integerByPath() { echo "$1" | jq --raw-output "$2" | cut --delimiter=. --fields=1; }

STDIN=$(cat)

[ "$(integerByPath "$STDIN" '.cpu_temp.value')" -gt "$THRESHOLD_MC" ] && poweroff
[ "$(integerByPath "$STDIN" '.vcgencmd_temp.value')" -gt "$THRESHOLD_C" ] && poweroff
[ "$(integerByPath "$STDIN" '.nvme0_temperature.value')" -gt "$THRESHOLD_K" ] && poweroff
[ "$(integerByPath "$STDIN" '.nvme1_temperature.value')" -gt "$THRESHOLD_K" ] && poweroff
