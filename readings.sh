#!/bin/sh

# Timestamp
TIMESTAMP=$(date +%s)

# CPU Frequency
CPU_CORE0_FREQ=$(cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq)
CPU_CORE1_FREQ=$(cat /sys/devices/system/cpu/cpu1/cpufreq/scaling_cur_freq)
CPU_CORE2_FREQ=$(cat /sys/devices/system/cpu/cpu2/cpufreq/scaling_cur_freq)
CPU_CORE3_FREQ=$(cat /sys/devices/system/cpu/cpu3/cpufreq/scaling_cur_freq)
VCGENCMD_ARM_FREQ=$(vcgencmd measure_clock arm | cut -d'=' -f2)

# CPU Temperature
CPU_TEMP=$(cat /sys/class/thermal/thermal_zone0/temp)
VCGENCMD_TEMP=$(vcgencmd measure_temp | cut -d'=' -f2 | cut -d"'" -f1)

# Storage
NVME0_SMART_LOG=$(nvme smart-log /dev/nvme0 --output-format json)
NVME1_SMART_LOG=$(nvme smart-log /dev/nvme1 --output-format json)

# Storage Temperature
NVME0_TEMPERATURE=$(echo "${NVME0_SMART_LOG}" | jq .temperature)
NVME1_TEMPERATURE=$(echo "${NVME1_SMART_LOG}" | jq .temperature)

jq \
    --null-input \
    --compact-output \
    --argjson CPU_CORE0_FREQ "${CPU_CORE0_FREQ}" \
    --argjson CPU_CORE1_FREQ "${CPU_CORE1_FREQ}" \
    --argjson CPU_CORE2_FREQ "${CPU_CORE2_FREQ}" \
    --argjson CPU_CORE3_FREQ "${CPU_CORE3_FREQ}" \
    --argjson CPU_TEMP "${CPU_TEMP}" \
    --argjson VCGENCMD_TEMP "${VCGENCMD_TEMP}" \
    --argjson VCGENCMD_ARM_FREQ "${VCGENCMD_ARM_FREQ}" \
    --argjson NVME0_TEMPERATURE "${NVME0_TEMPERATURE}" \
    --argjson NVME1_TEMPERATURE "${NVME1_TEMPERATURE}" \
    --argjson TIMESTAMP "${TIMESTAMP}" \
    '{
        timestamp: { value: $TIMESTAMP, unit: "s" },
        cpu_core0_freq: { value: $CPU_CORE0_FREQ, unit: "kHz" },
        cpu_core1_freq: { value: $CPU_CORE1_FREQ, unit: "kHz" },
        cpu_core2_freq: { value: $CPU_CORE2_FREQ, unit: "kHz" },
        cpu_core3_freq: { value: $CPU_CORE3_FREQ, unit: "kHz" },
        cpu_temp: { value: $CPU_TEMP, unit: "mC" },
        vcgencmd_temp: { value: $VCGENCMD_TEMP, unit: "C" },
        vcgencmd_arm_freq: { value: $VCGENCMD_ARM_FREQ, unit: "Hz" },
        nvme0_temperature: { value: $NVME0_TEMPERATURE, unit: "K" },
        nvme1_temperature: { value: $NVME1_TEMPERATURE, unit: "K" }
    }' \
;
