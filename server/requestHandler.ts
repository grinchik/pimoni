import { IncomingMessage, ServerResponse } from 'http';
import { CircularBuffer } from './CircularBuffer.ts';
import type { Line } from './Line.ts';

export function requestHandler(
    lineCircularBuffer: CircularBuffer<Line>,
    clientSet: Set<ServerResponse>,
) {
    return (req: IncomingMessage, res: ServerResponse) => {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        const lines = lineCircularBuffer.toArray();
        // TODO: catch throws or false return from write
        // TODO: check res.destroyed to avoid writing to zombie connections
        for (const line of lines) {
            res.write(`data: ${line}\n\n`);
        }

        // Add client to active connections
        clientSet.add(res);

        // Clean up when client disconnects
        res.on('close', () => {
            clientSet.delete(res);
        });

        // Handle connection errors
        res.on('error', () => {
            clientSet.delete(res);
        });
    };
}
