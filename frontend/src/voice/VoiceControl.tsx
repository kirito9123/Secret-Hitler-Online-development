import React, { useState } from "react";
import "./VoiceControl.css";
import { VoiceChatControls, VoiceChatState } from "./useVoiceChat";

interface VoiceControlProps {
  state: VoiceChatState;
  controls: VoiceChatControls;
  /** Names of all other players currently in the room */
  peers: string[];
}

/**
 * Floating voice chat control bar.
 *
 * Features:
 *  - Toggle panel open/closed (collapsed to a mic icon)
 *  - Big mic button: enable/disable mic
 *  - Mode toggle: Push-to-Talk (hold V) vs Open Mic
 *  - Mic device selector
 *  - Speaking indicators for each peer
 *  - PTT hint when in PTT mode
 */
const VoiceControl: React.FC<VoiceControlProps> = ({ state, controls, peers }) => {
  const [expanded, setExpanded] = useState(false);

  const {
    isEnabled,
    isMicActive,
    mode,
    micDevices,
    selectedMicId,
    isTalking,
    speakingPeers,
    permissionDenied,
  } = state;

  const {
    toggleMic,
    setMode,
    setMicDevice,
  } = controls;

  // ─── Derived labels ──────────────────────────────────────────────────────────

  const getMicIcon = () => {
    if (!isEnabled) return "🎙️";
    if (!isMicActive) return "🔇";
    if (isTalking) return "🎙️";
    return "🎙️";
  };

  const getMicBtnClass = () => {
    let cls = "voice-mic-btn";
    if (!isEnabled) return cls;
    if (!isMicActive) return cls + " muted";
    if (isTalking) return cls + " talking";
    return cls + " active";
  };

  const getStatusLabel = () => {
    if (!isEnabled) return "Tắt Voice Chat";
    if (permissionDenied) return "Bị từ chối quyền mic";
    if (!isMicActive) return "Mic đang tắt";
    if (isTalking) return "Đang nói...";
    if (mode === "ptt") return "Giữ V để nói";
    return "Mic mở";
  };

  const getStatusSublabel = () => {
    if (!isEnabled) return "Nhấn để bật";
    if (mode === "ptt") return "Chế độ Push-to-Talk";
    return "Chế độ mở mic";
  };

  // ─── Collapsed toggle button ──────────────────────────────────────────────────

  const collapsedBtn = (
    <button
      className={`voice-toggle-btn${isEnabled ? " enabled" : ""}${isTalking ? " talking" : ""}`}
      onClick={() => setExpanded(true)}
      title="Mở điều khiển giọng nói"
      id="voice-toggle-btn"
      aria-label="Mở bảng điều khiển giọng nói"
    >
      {getMicIcon()}
    </button>
  );

  // ─── Expanded panel ───────────────────────────────────────────────────────────

  const expandedPanel = (
    <div className={`voice-panel${!isEnabled ? " disabled" : ""}`}>
      {/* Header */}
      <div className="voice-panel-header">
        <span className="voice-panel-title">🎙 VOICE CHAT</span>
        <button
          className="voice-list-refresh-btn"
          onClick={() => setExpanded(false)}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "8px",
            color: "rgba(255,255,255,0.45)",
            fontSize: "0.75rem",
            padding: "3px 9px",
            cursor: "pointer",
          }}
          aria-label="Thu gọn bảng voice"
        >
          ✕
        </button>
      </div>

      {/* Main row: mic button + status */}
      <div className="voice-main-row">
        <button
          className={getMicBtnClass()}
          onClick={toggleMic}
          id="voice-mic-toggle-btn"
          aria-label={isMicActive ? "Tắt mic" : "Bật mic"}
          title={isMicActive ? "Tắt mic" : "Bật mic"}
        >
          {getMicIcon()}
        </button>
        <div className="voice-status-text">
          <div className="voice-status-label">{getStatusLabel()}</div>
          <div className="voice-status-sublabel">{getStatusSublabel()}</div>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="voice-mode-toggle">
        <button
          id="voice-mode-ptt"
          className={`voice-mode-btn${mode === "ptt" ? " selected" : ""}`}
          onClick={() => setMode("ptt")}
          aria-pressed={mode === "ptt"}
        >
          ⌨ Giữ V (PTT)
        </button>
        <button
          id="voice-mode-open"
          className={`voice-mode-btn${mode === "open" ? " selected" : ""}`}
          onClick={() => setMode("open")}
          aria-pressed={mode === "open"}
        >
          📡 Mở mic
        </button>
      </div>

      {/* PTT hint */}
      {mode === "ptt" && isEnabled && (
        <p className="voice-ptt-hint">
          Giữ <kbd>V</kbd> để nói
        </p>
      )}

      {/* Device selector */}
      {micDevices.length > 0 && (
        <div className="voice-device-row">
          <span className="voice-device-icon">🎤</span>
          <select
            className="voice-device-select"
            value={selectedMicId}
            onChange={(e) => setMicDevice(e.target.value)}
            id="voice-device-select"
            aria-label="Chọn thiết bị microphone"
          >
            {micDevices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Mic ${d.deviceId.slice(0, 6)}`}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Permission denied warning */}
      {permissionDenied && (
        <p className="voice-permission-denied">
          ⚠ Bị từ chối quyền truy cập mic. Vui lòng cho phép trong cài đặt trình duyệt.
        </p>
      )}

      {/* Peer speaking list */}
      {isEnabled && peers.length > 0 && (
        <div className="voice-peers-row">
          {peers.map((peer) => (
            <div
              key={peer}
              className={`voice-peer-chip${speakingPeers[peer] ? " speaking" : ""}`}
            >
              <span className="voice-peer-dot" />
              {peer}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="voice-control-bar">
      {expanded ? expandedPanel : collapsedBtn}
    </div>
  );
};

export default VoiceControl;
