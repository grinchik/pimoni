import { IncomingMessage, ServerResponse } from 'http';
import { CircularBuffer } from './CircularBuffer.ts';
import type { Line } from './Line.ts';

export function requestHandler(
    lineCircularBuffer: CircularBuffer<Line>
) {
    return (req: IncomingMessage, res: ServerResponse) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(lineCircularBuffer.toArray().join('\n'));
    };
}
