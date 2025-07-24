import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { IncomingMessage, ServerResponse } from 'http';
import { ClientSet } from './ClientSet.ts';
import { requestHandler } from './requestHandler.ts';

describe('requestHandler', () => {
    test('returns handler function', () => {
        const clientSet = new ClientSet();
        const handler = requestHandler(clientSet);
        assert.equal(typeof handler, 'function');
    });

    test('handler function accepts req and res parameters', () => {
        const clientSet = new ClientSet();
        const handler = requestHandler(clientSet);
        assert.equal(handler.length, 2);
    });

    test('handler calls writeHead and write methods for SSE, keeps connection alive', () => {
        const clientSet = new ClientSet();
        const handler = requestHandler(clientSet);

        let writeHeadCalled = false;
        let endCalled = false;
        let statusCode = 0;
        let headers: Record <string, string> = {};
        let writeData: string[] = [];

        const mockRes = {
            writeHead: (code: number, hdrs: Record <string, string>) => {
                writeHeadCalled = true;
                statusCode = code;
                headers = hdrs;
            },
            on: () => {}
        };

        handler({} as IncomingMessage, mockRes as unknown as ServerResponse);

        assert.equal(writeHeadCalled, true);
        assert.equal(endCalled, false);
        assert.equal(statusCode, 200);
        assert.equal(headers['Content-Type'], 'text/event-stream');
        assert.equal(headers['Cache-Control'], 'no-cache');
        assert.equal(writeData.length, 0);
    });

    test('adds client to clientSet when handler is called', () => {
        const clientSet = new ClientSet();
        const handler = requestHandler(clientSet);

        const mockRes = {
            writeHead: () => {},
            on: () => {}
        } as unknown as ServerResponse;

        handler({} as IncomingMessage, mockRes);

        assert.equal(clientSet.clientSet.size, 1);
        assert.ok(clientSet.clientSet.has(mockRes));
    });

    test('removes client from clientSet on close event', () => {
        const clientSet = new ClientSet();
        const handler = requestHandler(clientSet);

        let closeHandler: () => void;
        const mockRes = {
            writeHead: () => {},
            on: (event: string, callback: () => void) => {
                if (event === 'close') {
                    closeHandler = callback;
                }
            }
        } as unknown as ServerResponse;

        handler({} as IncomingMessage, mockRes);
        assert.equal(clientSet.clientSet.size, 1);

        // Trigger close event
        closeHandler!();
        assert.equal(clientSet.clientSet.size, 0);
    });

    test('removes client from clientSet on error event', () => {
        const clientSet = new ClientSet();
        const handler = requestHandler(clientSet);

        let errorHandler: () => void;
        const mockRes = {
            writeHead: () => {},
            on: (event: string, callback: () => void) => {
                if (event === 'error') {
                    errorHandler = callback;
                }
            }
        } as unknown as ServerResponse;

        handler({} as IncomingMessage, mockRes);
        assert.equal(clientSet.clientSet.size, 1);

        // Trigger error event
        errorHandler!();
        assert.equal(clientSet.clientSet.size, 0);
    });
});
