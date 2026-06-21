# SDK Usage

## Install

```bash
pnpm add @nexus-memory/sdk
```

## Basic example

```typescript
import { NexusClient } from "@nexus-memory/sdk";

const client = new NexusClient({
  baseUrl: "https://nexus-memory.app",
  apiKey: process.env.NEXUS_KEY
});

// Create an agent
const { agent } = await client.agents.create({
  owner: "0xowner",
  name: "research-bot",
  modelProvider: "openai",
  modelName: "gpt-4o-mini"
});

// Write a memory
await client.memories.add({
  agentId: agent._id,
  content: "Apple Q3 earnings beat expectations by 8%."
});

// Semantic search
const { results } = await client.memories.search({
  query: "How did Apple's earnings perform?",
  agentId: agent._id,
  topK: 5
});
```

## Vercel AI SDK middleware

```typescript
import { wrapLanguageModel, streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { NexusClient, nexusMemoryMiddleware } from "@nexus-memory/sdk";

const client = new NexusClient({ baseUrl: "http://localhost:3000" });

const model = wrapLanguageModel({
  model: openai("gpt-4o-mini"),
  middleware: nexusMemoryMiddleware({
    client,
    agentId: "AGENT_OBJECT_ID",
    topK: 5
  })
});

const result = await streamText({
  model,
  prompt: "Summarize last week's market notes."
});
```

The middleware:
- Injects the Top-K most relevant memories from Walrus into the system prompt before each generation.
- Persists the assistant's response back into the agent's memory after each generation, building a long-term knowledge trail.
