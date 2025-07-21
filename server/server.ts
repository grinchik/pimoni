import { createInterface } from 'readline';
import { CircularBuffer } from './CircularBuffer.ts';
import { main } from './main.ts';
import type { Line } from './Line.ts';

if (require.main === module) {
    const CAPACITY = Number(process.argv[2]);
    const lineCircularBuffer = new CircularBuffer<Line>(CAPACITY);

    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
    });

    main(lineCircularBuffer, rl);
}
