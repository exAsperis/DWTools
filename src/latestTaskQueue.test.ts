import { describe, expect, it } from "vitest";
import { LatestTaskQueue } from "./latestTaskQueue";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolver) => {
    resolve = resolver;
  });
  return { promise, resolve };
}

describe("LatestTaskQueue", () => {
  it("discards a prepared result when a newer request arrives", async () => {
    const first = deferred<string>();
    const committed: string[] = [];
    const queue = new LatestTaskQueue(
      async (input: string) => input === "old" ? first.promise : input,
      async (prepared) => {
        committed.push(prepared);
      },
    );

    queue.schedule("old");
    queue.schedule("new");
    first.resolve("old");
    await queue.whenIdle();

    expect(committed).toEqual(["new"]);
  });

  it("serializes commits and eventually applies the latest request", async () => {
    const firstCommit = deferred<void>();
    const events: string[] = [];
    const queue = new LatestTaskQueue(
      async (input: string) => input,
      async (prepared) => {
        events.push(`start:${prepared}`);
        if (prepared === "first") await firstCommit.promise;
        events.push(`end:${prepared}`);
      },
    );

    queue.schedule("first");
    await Promise.resolve();
    queue.schedule("latest");
    firstCommit.resolve();
    await queue.whenIdle();

    expect(events).toEqual([
      "start:first",
      "end:first",
      "start:latest",
      "end:latest",
    ]);
  });
});
