import React, { useEffect, useState, useCallback, useRef } from "react";
import "./LobbyList.css";
import { SERVER_ADDRESS_HTTP, GET_LOBBIES } from "../constants";

interface LobbyInfo {
  code: string;
  playerCount: number;
  maxPlayers: number;
  status: "waiting" | "playing";
}

interface LobbyListProps {
  /** Called when the user clicks on a lobby card – pass the lobby code back */
  onSelectLobby: (code: string) => void;
}

const POLL_INTERVAL_MS = 5000;

const LobbyList: React.FC<LobbyListProps> = ({ onSelectLobby }) => {
  const [lobbies, setLobbies] = useState<LobbyInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchLobbies = useCallback(async (manual = false) => {
    if (manual) setSpinning(true);
    try {
      const res = await fetch(SERVER_ADDRESS_HTTP + GET_LOBBIES);
      if (!res.ok) throw new Error("fetch failed");
      const data: LobbyInfo[] = await res.json();
      if (mountedRef.current) {
        setLobbies(data);
        setError(false);
      }
    } catch {
      if (mountedRef.current) setError(true);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        if (manual) {
          setTimeout(() => setSpinning(false), 700);
        }
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchLobbies();
    intervalRef.current = setInterval(() => fetchLobbies(), POLL_INTERVAL_MS);
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchLobbies]);

  const handleRefresh = () => {
    fetchLobbies(true);
  };

  return (
    <div className="lobby-list-section">
      <div className="lobby-list-header">
        <span className="lobby-list-title">Phòng Đang Hoạt Động</span>
        <button
          className={`lobby-list-refresh-btn${spinning ? " spinning" : ""}`}
          onClick={handleRefresh}
          aria-label="Làm mới danh sách phòng"
        >
          ↻ Làm mới
        </button>
      </div>

      {loading ? (
        <div className="lobby-list-skeleton">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      ) : error ? (
        <p className="lobby-list-empty">Không thể tải danh sách phòng.</p>
      ) : lobbies.length === 0 ? (
        <p className="lobby-list-empty">
          Chưa có phòng nào đang hoạt động. Hãy tạo phòng mới!
        </p>
      ) : (
        <div className="lobby-list-grid">
          {lobbies.map((lobby) => (
            <LobbyCard
              key={lobby.code}
              lobby={lobby}
              onSelect={onSelectLobby}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Single Room Card ──────────────────────────────────────── */

interface LobbyCardProps {
  lobby: LobbyInfo;
  onSelect: (code: string) => void;
}

const LobbyCard: React.FC<LobbyCardProps> = ({ lobby, onSelect }) => {
  const fillPercent = Math.round(
    (lobby.playerCount / lobby.maxPlayers) * 100
  );

  return (
    <button
      className={`lobby-card ${lobby.status}`}
      onClick={() => onSelect(lobby.code)}
      aria-label={`Tham gia phòng ${lobby.code}`}
      id={`lobby-card-${lobby.code}`}
    >
      <div className="lobby-card-code">{lobby.code}</div>

      <div className="lobby-card-info">
        <span className="lobby-card-players">
          <span className="lobby-card-players-icon">👤</span>
          {lobby.playerCount}/{lobby.maxPlayers}
        </span>
        <span className={`lobby-status-badge ${lobby.status}`}>
          {lobby.status === "waiting" ? "Đang chờ" : "Đang chơi"}
        </span>
      </div>

      <div className="lobby-card-player-bar">
        <div
          className="lobby-card-player-bar-fill"
          style={{ width: `${fillPercent}%` }}
        />
      </div>

      {lobby.status === "waiting" && (
        <p className="lobby-card-hint">Nhấn để điền mã →</p>
      )}
    </button>
  );
};

export default LobbyList;
