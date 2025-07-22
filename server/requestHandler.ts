import { IncomingMessage, ServerResponse } from 'http';
import { CircularBuffer } from './CircularBuffer.ts';
import type { Line } from './Line.ts';

export function requestHandler(
    lineCircularBuffer: CircularBuffer<Line>
) {
    return (req: IncomingMessage, res: ServerResponse) => {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache'
        });

        const lines = lineCircularBuffer.toArray();
        for (const line of lines) {
            res.write(`data: ${line}\n\n`);
        }

        res.end();
    };
}
