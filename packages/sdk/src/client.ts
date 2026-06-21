export interface NexusClientOptions {
  baseUrl: string;
  apiKey?: string;
}

export class NexusClient {
  constructor(public opts: NexusClientOptions) {}

  private async req(path: string, init?: RequestInit) {
    const r = await fetch(`${this.opts.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(this.opts.apiKey ? { Authorization: `Bearer ${this.opts.apiKey}` } : {}),
        ...(init?.headers || {})
      }
    });
    if (!r.ok) throw new Error(`Nexus ${path} ${r.status}`);
    return r.json();
  }

  agents = {
    create: (body: any) =>
      this.req("/api/agents", { method: "POST", body: JSON.stringify(body) }),
    list: (owner: string) => this.req(`/api/agents?owner=${owner}`)
  };
  memories = {
    add: (body: any) =>
      this.req("/api/memories", { method: "POST", body: JSON.stringify(body) }),
    search: (body: any) =>
      this.req("/api/memories/search", { method: "POST", body: JSON.stringify(body) })
  };
  spaces = {
    create: (body: any) =>
      this.req("/api/spaces", { method: "POST", body: JSON.stringify(body) }),
    list: (owner?: string) => this.req(`/api/spaces${owner ? `?owner=${owner}` : ""}`)
  };
  audit = {
    list: (actor?: string) => this.req(`/api/audit${actor ? `?actor=${actor}` : ""}`)
  };
}
