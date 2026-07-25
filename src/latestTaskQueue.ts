export class LatestTaskQueue<Input, Prepared> {
  private revision = 0;
  private appliedRevision = 0;
  private latestInput: Input | undefined;
  private running = false;
  private idleResolvers: Array<() => void> = [];

  constructor(
    private readonly prepare: (input: Input) => Promise<Prepared>,
    private readonly commit: (prepared: Prepared) => Promise<void>,
    private readonly onError: (error: unknown) => void = console.error,
  ) {}

  schedule(input: Input): number {
    this.latestInput = input;
    this.revision += 1;
    if (!this.running) void this.drain();
    return this.revision;
  }

  whenIdle(): Promise<void> {
    if (!this.running && this.appliedRevision === this.revision) return Promise.resolve();
    return new Promise((resolve) => this.idleResolvers.push(resolve));
  }

  private async drain(): Promise<void> {
    this.running = true;
    try {
      while (this.appliedRevision < this.revision) {
        const revision = this.revision;
        const input = this.latestInput;
        if (input === undefined) {
          this.appliedRevision = revision;
          continue;
        }
        try {
          const prepared = await this.prepare(input);
          if (revision !== this.revision) continue;
          await this.commit(prepared);
        } catch (error) {
          this.onError(error);
        }
        if (revision === this.revision) this.appliedRevision = revision;
      }
    } finally {
      this.running = false;
      for (const resolve of this.idleResolvers.splice(0)) resolve();
      if (this.appliedRevision < this.revision) void this.drain();
    }
  }
}

