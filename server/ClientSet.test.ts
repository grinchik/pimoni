import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import { ServerResponse } from 'http';
import { ClientSet } from './ClientSet.ts';

describe('ClientSet', () => {
    test('emits client-added event when client is added', () => {
        const clientSet = new ClientSet();
        const mockClient = { id: 1 } as unknown as ServerResponse;
        let emittedClient: ServerResponse | undefined;

        clientSet.on('client-added', (client) => {
            emittedClient = client;
        });

        clientSet.add(mockClient);

        assert.equal(emittedClient, mockClient);
    });

    test('adds client to internal set', () => {
        const clientSet = new ClientSet();
        const mockClient = { id: 1 } as unknown as ServerResponse;

        clientSet.add(mockClient);

        // Check if client is in the set
        assert.equal(clientSet.clientSet.size, 1);
        assert.ok(clientSet.clientSet.has(mockClient));
    });

    test('deletes client from internal set', () => {
        const clientSet = new ClientSet();
        const mockClient = { id: 1 } as unknown as ServerResponse;

        clientSet.add(mockClient);
        const result = clientSet.delete(mockClient);

        assert.equal(result, true);
        assert.equal(clientSet.clientSet.size, 0);
    });

    test('delete returns false for non-existent client', () => {
        const clientSet = new ClientSet();
        const mockClient = { id: 1 } as unknown as ServerResponse;

        const result = clientSet.delete(mockClient);

        assert.equal(result, false);
    });

    test('provides access to internal set', () => {
        const clientSet = new ClientSet();
        const mockClient1 = { id: 1 } as unknown as ServerResponse;
        const mockClient2 = { id: 2 } as unknown as ServerResponse;

        clientSet.add(mockClient1);
        clientSet.add(mockClient2);

        assert.equal(clientSet.clientSet.size, 2);
        assert.ok(clientSet.clientSet.has(mockClient1));
        assert.ok(clientSet.clientSet.has(mockClient2));
    });
});
