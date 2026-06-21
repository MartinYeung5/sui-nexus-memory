import crypto from "crypto";

const PUBLISHER  = process.env.WALRUS_PUBLISHER!;
const AGGREGATOR = process.env.WALRUS_AGGREGATOR!;
const EPOCHS     = Number(process.env.WALRUS_EPOCHS ?? 5);
const ENC_KEY    = Buffer.from(process.env.APP_ENCRYPTION_KEY || "", "base64");

/** AES-256-GCM encrypt. Output layout: [iv(12) | tag(16) | ciphertext] */
export function encrypt(plaintext: Buffer | string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENC_KEY, iv);
  const buf = Buffer.isBuffer(plaintext) ? plaintext : Buffer.from(plaintext, "utf-8");
  const enc = Buffer.concat([cipher.update(buf), cipher.final()]);
  const tag = cipher.getAuthTag();
  return { ciphertext: Buffer.concat([iv, tag, enc]), iv, tag };
}

/** AES-256-GCM decrypt. Expects the layout produced by encrypt(). */
export function decrypt(blob: Buffer) {
  const iv = blob.subarray(0, 12);
  const tag = blob.subarray(12, 28);
  const enc = blob.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENC_KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]);
}

/** SHA-256 hex digest helper. */
export function sha256(buf: Buffer | string) {
  return crypto
    .createHash("sha256")
    .update(typeof buf === "string" ? Buffer.from(buf) : buf)
    .digest("hex");
}

/** Upload a blob to Walrus and return blobId + an integrity proof envelope. */
export async function walrusPut(data: Buffer): Promise<{
  blobId: string;
  contentHash: string;
  integrityProof: string;
}> {
  const url = `${PUBLISHER}/v1/blobs?epochs=${EPOCHS}`;
  const res = await fetch(url, { method: "PUT", body: data });
  if (!res.ok) throw new Error(`Walrus PUT failed: ${res.status}`);
  const json: any = await res.json();
  const obj = json.newlyCreated?.blobObject ?? json.alreadyCertified;
  const blobId: string = obj?.blobId ?? obj?.blob_id ?? obj?.id;
  const contentHash = sha256(data);
  return {
    blobId,
    contentHash,
    integrityProof: JSON.stringify({
      blobId,
      contentHash,
      epochs: EPOCHS,
      certifiedAt: new Date().toISOString()
    })
  };
}

/** Fetch a blob from the Walrus aggregator. */
export async function walrusGet(blobId: string): Promise<Buffer> {
  const url = `${AGGREGATOR}/v1/blobs/${blobId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Walrus GET failed: ${res.status}`);
  const arr = await res.arrayBuffer();
  return Buffer.from(arr);
}

/** Verify that the blob fetched from Walrus matches the expected SHA-256 hash. */
export async function verifyBlob(blobId: string, expectedHash: string): Promise<boolean> {
  const buf = await walrusGet(blobId);
  return sha256(buf) === expectedHash;
}
