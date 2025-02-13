"use client";

import { useState, useEffect } from "react";
import { MapContainer, Rectangle, Tooltip, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CRS } from "leaflet";

import axios from "axios";

const chunkSize = 1; // Minecraft chunk size

interface ChunkData {
  chunk_x: number;
  chunk_z: number;
  owner: string;
  color: string;
}

interface PlayerData {
  name: string;
  chunk_x: number;
  chunk_z: number;
  server_name: string;
}

const MapComponent: React.FC = () => {
  const [chunks, setChunks] = useState<ChunkData[]>([]);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [isRealTime, setIsRealTime] = useState(true);
  const [updateInterval, setUpdateInterval] = useState(1000);

  // Fetch chunk ownership
  const fetchChunks = async () => {
    const response = await axios.get("/api/chunks");
    setChunks(response.data);
  };

  // Fetch player locations
  const fetchPlayers = async () => {
    const response = await axios.get("/api/players");
    setPlayers(response.data);
  };

  useEffect(() => {
    fetchChunks();
    fetchPlayers();
    if (isRealTime) {
      const interval = setInterval(() => {
        fetchChunks();
        fetchPlayers();
      }, updateInterval);
      return () => clearInterval(interval);
    }
  }, [isRealTime, updateInterval]);

  return (
    <div>
      <MapContainer
        center={[0, 0]}
        zoom={1}
        style={{ height: "90vh", width: "100%", background: "white" }}
        crs={CRS.Simple}
      >
        {/* <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        /> */}
        {/* Chunks */}
        {chunks.map(({ chunk_x, chunk_z, owner }) => {
          const xStart = chunk_x * chunkSize;
          const xEnd = (chunk_x + 1) * chunkSize;
          const zStart = chunk_z * chunkSize;
          const zEnd = (chunk_z + 1) * chunkSize;
          const color = `#${(
            parseInt(owner.replace(/\D/g, ""), 10) % 16777215
          ).toString(16)}`;

          return (
            <Rectangle
              key={`${chunk_x}-${chunk_z}`}
              bounds={[
                [zStart, xStart],
                [zEnd, xEnd],
              ]}
              pathOptions={{ color, weight: 1 }}
            >
              <Tooltip>
                <div>
                  <strong>Owner:</strong> {owner} <br />
                  <strong>Chunk:</strong> ({chunk_x}, {chunk_z})
                </div>
              </Tooltip>
            </Rectangle>
          );
        })}

        {/* Players */}
        {players.map(({ name, chunk_x, chunk_z, server_name }) => {
          const color = `#${(
            parseInt(server_name.replace(/\D/g, ""), 10) % 16777215
          ).toString(16)}`;

          return (
            <CircleMarker
              key={name}
              center={[
                chunk_z * chunkSize + chunkSize / 2,
                chunk_x * chunkSize + chunkSize / 2,
              ]}
              radius={10}
              color={color}
            >
              <Tooltip>
                <div>
                  <strong>Player:</strong> {name} <br />
                  <strong>Server:</strong> {server_name} <br />
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Controls */}
      <div>
        <button onClick={() => setIsRealTime(!isRealTime)}>
          {isRealTime ? "Pause Realtime" : "Resume Realtime"}
        </button>
        <label>
          Update Interval:
          <input
            type="number"
            value={updateInterval}
            onChange={(e) => setUpdateInterval(Number(e.target.value))}
            step={1000}
            min={1000}
          />{" "}
          ms
        </label>
      </div>
    </div>
  );
};

export default MapComponent;
