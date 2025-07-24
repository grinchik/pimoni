import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { ServerResponse } from 'http';
import { ClientSet } from './ClientSet.ts';
import { broadcastLine } from './broadcastLine.ts';

describe('broadcastLine', () => {
    test('broadcasts line to all clients in set', () => {
        const clientSet = new ClientSet();

        let client1Data: string[] = [];
        let client2Data: string[] = [];

        const mockClient1 = {
            write: (data: string) => {
                client1Data.push(data);
            }
        } as unknown as ServerResponse;

        const mockClient2 = {
            write: (data: string) => {
                client2Data.push(data);
            }
        } as unknown as ServerResponse;

        clientSet.add(mockClient1);
        clientSet.add(mockClient2);

        broadcastLine(clientSet, 'test message');

        assert.equal(client1Data.length, 1);
        assert.equal(client1Data[0], 'data: test message\n\n');
        assert.equal(client2Data.length, 1);
        assert.equal(client2Data[0], 'data: test message\n\n');
    });

    test('handles empty client set without error', () => {
        const clientSet = new ClientSet();

        // Should not throw any errors
        assert.doesNotThrow(() => {
            broadcastLine(clientSet, 'test message');
        });
    });

    test('broadcasts to single client', () => {
        const clientSet = new ClientSet();

        let clientData: string[] = [];
        const mockClient = {
            write: (data: string) => {
                clientData.push(data);
            }
        } as unknown as ServerResponse;

        clientSet.add(mockClient);

        broadcastLine(clientSet, 'single client test');

        assert.equal(clientData.length, 1);
        assert.equal(clientData[0], 'data: single client test\n\n');
    });

    test('formats line correctly for SSE', () => {
        const clientSet = new ClientSet();

        let receivedData: string = '';
        const mockClient = {
            write: (data: string) => {
                receivedData = data;
            }
        } as unknown as ServerResponse;

        clientSet.add(mockClient);

        broadcastLine(clientSet, 'formatted test');

        assert.equal(receivedData, 'data: formatted test\n\n');
    });
});
