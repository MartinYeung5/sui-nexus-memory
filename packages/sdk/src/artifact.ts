export interface ArtifactRecord {
  id: string;
  name: string;
  blobId: string;
  contentHash: string;
  size: number;
  mimeType: string;
  version: number;
  createdAt: string;
}

/** Helper: upload artifact file via multipart */
export async function uploadArtifact(
  baseUrl: string,
  file: File | Blob,
  opts: { name?: string; agentId?: string; spaceId?: string } = {},
  apiKey?: string
) {
  const fd = new FormData();
  fd.append("file", file);
  if (opts.name) fd.append("name", opts.name);
  if (opts.agentId) fd.append("agentId", opts.agentId);
  if (opts.spaceId) fd.append("spaceId", opts.spaceId);
  const r = await fetch(`${baseUrl}/api/artifacts`, {
    method: "POST",
    body: fd,
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined
  });
  if (!r.ok) throw new Error(`upload failed ${r.status}`);
  return r.json();
}
