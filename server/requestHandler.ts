import { IncomingMessage, ServerResponse } from 'http';
import { ClientSet } from './ClientSet.ts';

export function requestHandler(
    clientSet: ClientSet,
) {
    return (req: IncomingMessage, res: ServerResponse) => {
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

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
