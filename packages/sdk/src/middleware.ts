import type { NexusClient } from "./client";

/**
 * Vercel AI SDK middleware factory.
 *
 * Usage:
 *   import { wrapLanguageModel } from "ai";
 *   const model = wrapLanguageModel({
 *     model: openai("gpt-4o-mini"),
 *     middleware: nexusMemoryMiddleware({ client, agentId, topK: 5 })
 *   });
 */
export function nexusMemoryMiddleware(opts: {
  client: NexusClient;
  agentId: string;
  topK?: number;
}): any {
  return {
    transformParams: async ({ params }: any) => {
      const messages = (params.prompt as any[]) || [];
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      if (!lastUser) return params;
      const query =
        typeof lastUser.content === "string"
          ? lastUser.content
          : (lastUser.content as any[]).map((p) => p.text ?? "").join(" ");

      const { results } = await opts.client.memories.search({
        query,
        agentId: opts.agentId,
        topK: opts.topK ?? 5
      });
      if (!results?.length) return params;

      const ctx = results
        .map(
          (r: any, i: number) =>
            `【Memory ${i + 1} · sim ${(r.score * 100).toFixed(1)}%】${r.content}`
        )
        .join("\n\n");

      return {
        ...params,
        prompt: [
          {
            role: "system",
            content: `Relevant memories from Walrus verifiable storage:\n${ctx}`
          },
          ...messages
        ]
      };
    },
    wrapGenerate: async ({ doGenerate, params }: any) => {
      const result = await doGenerate();
      try {
        await opts.client.memories.add({
          agentId: opts.agentId,
          content: typeof result.text === "string" ? result.text : "",
          metadata: { source: "assistant_response", model: params?.modelId }
        });
      } catch {}
      return result;
    }
  };
}
