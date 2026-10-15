import { beforeEach, describe, expect, it, vi } from "vitest";
import { canWriteMockRepository, readMockRepository, writeMockRepository } from "./mockRepositoryStorage";

const isStrings = (value: unknown): value is string[] =>
    Array.isArray(value) && value.every(item => typeof item === "string");

beforeEach(() => {
    const entries = new Map<string, string>();
    vi.stubGlobal("window", { localStorage: {
        getItem: (key: string) => entries.get(key) ?? null,
        setItem: (key: string, value: string) => { entries.set(key, value); },
    } });
});

describe("versioned Mock repository storage", () => {
    it("roundtrips validated data", () => {
        expect(writeMockRepository("example", ["A"])).toBe(true);
        expect(readMockRepository("example", isStrings)).toMatchObject({ status: "ok", data: ["A"] });
    });
    it("rejects invalid saved schema without overwriting", () => {
        window.localStorage.setItem("example", JSON.stringify({ schemaVersion: 99, data: [] }));
        expect(readMockRepository("example", isStrings).status).toBe("invalid");
        expect(canWriteMockRepository("example")).toBe(false);
    });
    it("rejects malformed saved data", () => {
        window.localStorage.setItem("example", "{");
        expect(readMockRepository("example", isStrings).status).toBe("invalid");
        expect(canWriteMockRepository("example")).toBe(false);
    });
    it("does not accept wrong data shapes", () => {
        window.localStorage.setItem("example", JSON.stringify({ schemaVersion: 1, savedAt: "now", data: [3] }));
        expect(readMockRepository("example", isStrings).status).toBe("invalid");
    });
});
