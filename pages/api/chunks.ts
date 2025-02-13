import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const PROMETHEUS_URL = process.env.PROMETHEUS_URL || "http://localhost:9090";

async function queryPrometheus(query: string): Promise<{ metric: Chunk }[]> {
  const res = await axios.get(`${PROMETHEUS_URL}/api/v1/query?query=${query}`);
  return res.data.data.result;
}

interface Chunk {
  chunk_x: string;
  chunk_z: string;
  owner: string;
  color: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const result = await queryPrometheus("mc_chunk_ownership");
  const chunks = new Map();
  // only store unique pairs of chunk_x and chunk_z
  for (const { metric } of result) {
    const key = `${metric.chunk_x},${metric.chunk_z}`;
    if (!chunks.has(key)) {
      chunks.set(key, {
        chunk_x: parseInt(metric.chunk_x),
        chunk_z: parseInt(metric.chunk_z),
        owner: metric.owner,
      });
    }
  }
  res.json(Array.from(chunks.values()));
}
