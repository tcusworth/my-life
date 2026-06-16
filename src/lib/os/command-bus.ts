export type Command = {
  type: string;
  payload?: any;
  meta?: {
    source?: string;
    timestamp?: number;
    correlationId?: string;
  };
};

class CommandBus {
  private history: Command[] = [];

  dispatch(command: Command) {
    const enriched: Command = {
      ...command,
      meta: {
        ...command.meta,
        timestamp: Date.now(),
        correlationId:
          command.meta?.correlationId ??
          Math.random().toString(36).substring(2),
      },
    };

    this.history.push(enriched);

    console.log("[COMMAND BUS]", enriched);

    return enriched;
  }

  getHistory() {
    return this.history;
  }

  clear() {
    this.history = [];
  }
}

export const commandBus = new CommandBus();