// src/services/aiService.ts
import axios from "axios";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL;
if (!AI_SERVICE_URL) throw new Error("AI_SERVICE_URL not set");

export type AiResult = {
  resultType: string;
  confidence: number;
  fields: Record<string, any>;
  raw_text?: string;
  extraction_debug?: any;
};

// Accept either a public file URL or Buffer path depending on usage
export async function processFileByUrl(fileUrl: string): Promise<AiResult> {
  const res = await axios.post(`${AI_SERVICE_URL}/process`, { file_url: fileUrl }, { timeout: 60000 });
  return res.data as AiResult;
}
