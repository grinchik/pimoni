import { EventEmitter } from 'events';
import { ServerResponse } from 'http';

export class ClientSet extends EventEmitter {
    private set = new Set<ServerResponse>();

    add (client: ServerResponse): void {
        this.set.add(client);
        this.emit('client-added', client);
    }

    delete (client: ServerResponse): boolean {
        return this.set.delete(client);
    }

    get clientSet(): Set <ServerResponse> {
        return this.set;
    }
}
