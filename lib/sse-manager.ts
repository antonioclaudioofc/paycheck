export interface SSEClient {
  userId: string;
  controller: ReadableStreamDefaultController;
}

class SSEManager {
  private clients: Set<SSEClient>;

  constructor() {
    this.clients = new Set();
  }

  /**
   * Register a new client connection
   */
  public register(userId: string, controller: ReadableStreamDefaultController) {
    const client = { userId, controller };
    this.clients.add(client);

    // Send initial ping to establish connection
    this.sendToClient(client, "connected", { timestamp: Date.now() });

    return () => {
      this.clients.delete(client);
    };
  }

  /**
   * Send an event to all connected clients of a specific user
   */
  public sendToUser(userId: string, event: string, data: unknown) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    const encoder = new TextEncoder();

    for (const client of this.clients) {
      if (client.userId === userId) {
        try {
          client.controller.enqueue(encoder.encode(payload));
        } catch {
          // Client might have disconnected, clean up
          this.clients.delete(client);
        }
      }
    }
  }

  /**
   * Broadcast an event to all connected clients
   */
  public broadcast(event: string, data: unknown) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    const encoder = new TextEncoder();

    for (const client of this.clients) {
      try {
        client.controller.enqueue(encoder.encode(payload));
      } catch {
        this.clients.delete(client);
      }
    }
  }

  /**
   * Send event to a single client helper
   */
  private sendToClient(client: SSEClient, event: string, data: unknown) {
    try {
      const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      const encoder = new TextEncoder();
      client.controller.enqueue(encoder.encode(payload));
    } catch {
      this.clients.delete(client);
    }
  }
}

// Global registry instance (persists during hot reloads in development)
const globalForSSE = global as unknown as { sseManager: SSEManager };
export const sseManager = globalForSSE.sseManager || new SSEManager();
if (process.env.NODE_ENV !== "production") globalForSSE.sseManager = sseManager;

export default sseManager;
