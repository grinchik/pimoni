import { createInterface } from 'readline';
import { createServer } from 'http';
import { CircularBuffer } from './CircularBuffer.ts';
import { main } from './main.ts';
import type { Line } from './Line.ts';

if (import.meta.url === `file://${process.argv[1]}`) {
    const CAPACITY = Number(process.argv[2]);
    const lineCircularBuffer = new CircularBuffer<Line>(CAPACITY);

    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false,
    });

    const server = createServer();

    main(lineCircularBuffer, rl, server);

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
