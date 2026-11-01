import { DatabaseSync } from 'node:sqlite';
import { chmodSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import type { BusinessStorage } from '../electron/security/businessHost';

// Keep the validated business snapshot format; SQLite supplies durable atomic commits.
// This is one shared server database, never browser localStorage or a client-selected file.
export class WebStorage implements BusinessStorage {
    private db: DatabaseSync;
    constructor(directory: string) {
        mkdirSync(directory, { recursive: true, mode: 0o700 });
        const file = join(directory, 'htt.sqlite');
        this.db = new DatabaseSync(file);
        chmodSync(file, 0o600);
        this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;
            CREATE TABLE IF NOT EXISTS documents (name TEXT PRIMARY KEY, body TEXT NOT NULL) STRICT;`);
    }
    read(path: string): string | undefined {
        const row = this.db.prepare('SELECT body FROM documents WHERE name = ?').get(basename(path));
        return row?.body as string | undefined;
    }
    write(path: string, value: unknown): void {
        this.db.prepare('INSERT INTO documents(name, body) VALUES (?, ?) ON CONFLICT(name) DO UPDATE SET body = excluded.body')
            .run(basename(path), JSON.stringify(value));
    }
    close(): void { this.db.close(); }
}
