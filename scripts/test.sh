#!/bin/sh

set -o errexit;

node \
    --experimental-strip-types \
    --experimental-test-coverage \
    --test "**/*.test.ts" \
    ;
