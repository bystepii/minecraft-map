import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const PROMETHEUS_URL = process.env.PROMETHEUS_URL || "http://localhost:9090";

async function queryPrometheus(query: string) {
  const res = await axios.get(`${PROMETHEUS_URL}/api/v1/query?query=${query}`);
  return res.data.data.result;
}

interface Player {
  name: string;
  chunk_x: string;
  chunk_z: string;
  server_name: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const result = await queryPrometheus("mc_player_location");
  const players = result.map(({ metric }: { metric: Player }) => ({
    name: metric.name,
    chunk_x: parseInt(metric.chunk_x),
    chunk_z: parseInt(metric.chunk_z),
    server_name: metric.server_name,
  }));
  res.json(players);
}
