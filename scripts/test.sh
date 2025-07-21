#!/bin/sh

set -o errexit;

./node_modules/.bin/tsc \
&& \
node \
    --experimental-strip-types \
    --experimental-test-coverage \
    --test "**/*.test.ts" \
    ;
