/**
 * useVoiceChat – WebRTC P2P mesh voice chat hook
 *
 * Connects every player in the same lobby together via WebRTC.
 * Signaling is done over the existing game WebSocket connection (the server
 * simply relays offer / answer / ICE messages between peers).
 *
 * Features:
 *  - Automatic peer connection management (add/remove peers as users join/leave)
 *  - Push-to-talk (hold V) or open-mic mode
 *  - Mic device selection
 *  - Speaking detection per peer (via Web Audio API analyser)
 */

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type MicMode = "ptt" | "open";

export interface PeerState {
  name: string;
  speaking: boolean;
}

export interface VoiceChatState {
  /** Is the local mic currently unmuted / transmitting? */
  isMicActive: boolean;
  /** Is voice chat enabled at all? */
  isEnabled: boolean;
  /** Current mic mode */
  mode: MicMode;
  /** List of available microphone devices */
  micDevices: MediaDeviceInfo[];
  /** Currently selected device ID */
  selectedMicId: string;
  /** Are we currently transmitting (either open-mic or PTT held) */
  isTalking: boolean;
  /** Which peers are speaking right now */
  speakingPeers: Record<string, boolean>;
  /** Whether mic permission was denied */
  permissionDenied: boolean;
}

export interface VoiceChatControls {
  enable: () => void;
  disable: () => void;
  toggleMic: () => void;
  setMode: (mode: MicMode) => void;
  setMicDevice: (deviceId: string) => void;
  handlePttKeyDown: () => void;
  handlePttKeyUp: () => void;
  /** Called by App when a WebRTC signaling message arrives from the server */
  handleSignalingMessage: (type: string, from: string, payload: any) => void;
  /** Call when a new peer joins (to initiate connection as the "caller") */
  onPeerJoined: (peerName: string) => void;
  /** Call when a peer leaves */
  onPeerLeft: (peerName: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STUN_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

const SPEAKING_THRESHOLD = 12; // RMS threshold for speech detection (0-255)
const SPEAKING_POLL_MS = 80;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useVoiceChat(
  /** Called to send a WebRTC signaling message over the game WebSocket */
  sendSignal: (command: string, targetName: string | null, payload: any) => void,
  /** The current player's own name */
  myName: string
): [VoiceChatState, VoiceChatControls] {
  // ---- refs (never trigger re-render) ----
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  // Map: peerName → RTCPeerConnection
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  // Map: peerName → remote audio element
  const audioElemsRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  // Map: peerName → AnalyserNode (for speaking detection)
  const analysersRef = useRef<Map<string, AnalyserNode>>(new Map());
  const speakingPollRef = useRef<NodeJS.Timeout | null>(null);
  const pttHeldRef = useRef(false);
  const gainNodeRef = useRef<GainNode | null>(null);

  // ---- state ----
  const [isEnabled, setIsEnabled] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false); // mic unmuted
  const [mode, setModeState] = useState<MicMode>("ptt");
  const [isTalking, setIsTalking] = useState(false);
  const [micDevices, setMicDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMicId, setSelectedMicId] = useState<string>("");
  const [speakingPeers, setSpeakingPeers] = useState<Record<string, boolean>>({});
  const [permissionDenied, setPermissionDenied] = useState(false);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  /** Mute / unmute the local audio track to the peers */
  const setLocalTrackEnabled = useCallback((enabled: boolean) => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = enabled;
      });
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = enabled ? 1 : 0;
    }
    setIsTalking(enabled);
  }, []);

  /** Enumerate audio input devices */
  const refreshDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter((d) => d.kind === "audioinput");
      setMicDevices(mics);
      if (mics.length > 0 && !selectedMicId) {
        setSelectedMicId(mics[0].deviceId);
      }
    } catch {
      // ignore
    }
  }, [selectedMicId]);

  /** Start speaking-detection poll */
  const startSpeakingPoll = useCallback(() => {
    if (speakingPollRef.current) return;
    speakingPollRef.current = setInterval(() => {
      const result: Record<string, boolean> = {};
      analysersRef.current.forEach((analyser, name) => {
        const data = new Uint8Array(analyser.fftSize);
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = data[i] - 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        result[name] = rms > SPEAKING_THRESHOLD;
      });
      setSpeakingPeers(result);
    }, SPEAKING_POLL_MS);
  }, []);

  const stopSpeakingPoll = useCallback(() => {
    if (speakingPollRef.current) {
      clearInterval(speakingPollRef.current);
      speakingPollRef.current = null;
    }
  }, []);

  // ─── Get User Media ──────────────────────────────────────────────────────────

  const acquireLocalStream = useCallback(
    async (deviceId?: string): Promise<MediaStream | null> => {
      try {
        const constraints: MediaStreamConstraints = {
          audio: deviceId
            ? { deviceId: { exact: deviceId }, echoCancellation: true, noiseSuppression: true }
            : { echoCancellation: true, noiseSuppression: true },
          video: false,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setPermissionDenied(false);
        await refreshDevices();
        return stream;
      } catch (err) {
        const e = err as { name?: string };
        if (e.name === "NotAllowedError") setPermissionDenied(true);
        return null;
      }
    },
    [refreshDevices]
  );

  // ─── Peer Connection Factory ──────────────────────────────────────────────────

  const createPeerConnection = useCallback(
    (peerName: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS });

      // Add local tracks
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) =>
          pc.addTrack(t, localStreamRef.current!)
        );
      }

      // ICE candidates → send via signaling
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendSignal("webrtc-ice", peerName, event.candidate.toJSON());
        }
      };

      // Remote track → create audio element for playback
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        if (!remoteStream) return;

        // Create/reuse audio element
        let audio = audioElemsRef.current.get(peerName);
        if (!audio) {
          audio = new Audio();
          audio.autoplay = true;
          audioElemsRef.current.set(peerName, audio);
        }
        audio.srcObject = remoteStream;

        // Set up analyser for speaking detection
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        const ctx = audioContextRef.current;
        const src = ctx.createMediaStreamSource(remoteStream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        src.connect(analyser);
        analysersRef.current.set(peerName, analyser);
        startSpeakingPoll();
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "closed"
        ) {
          peersRef.current.delete(peerName);
        }
      };

      peersRef.current.set(peerName, pc);
      return pc;
    },
    [sendSignal, startSpeakingPoll]
  );

  // ─── Signaling ───────────────────────────────────────────────────────────────

  const handleSignalingMessage = useCallback(
    async (type: string, from: string, payload: any) => {
      if (!isEnabled) return;
      switch (type) {
        case "webrtc-offer": {
          const pc = createPeerConnection(from);
          await pc.setRemoteDescription(new RTCSessionDescription(payload));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal("webrtc-answer", from, answer);
          break;
        }
        case "webrtc-answer": {
          const pc = peersRef.current.get(from);
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(payload));
          }
          break;
        }
        case "webrtc-ice": {
          const pc = peersRef.current.get(from);
          if (pc && payload) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(payload));
            } catch {
              // candidate arrived early, ignore
            }
          }
          break;
        }
        case "webrtc-leave": {
          const pc = peersRef.current.get(from);
          if (pc) {
            pc.close();
            peersRef.current.delete(from);
          }
          const audio = audioElemsRef.current.get(from);
          if (audio) {
            audio.srcObject = null;
            audioElemsRef.current.delete(from);
          }
          analysersRef.current.delete(from);
          break;
        }
        default:
          break;
      }
    },
    [isEnabled, createPeerConnection, sendSignal]
  );

  // ─── Peer join/leave ─────────────────────────────────────────────────────────

  /** Called by App when a NEW peer appears in the player list */
  const onPeerJoined = useCallback(
    async (peerName: string) => {
      if (!isEnabled || peerName === myName) return;
      if (peersRef.current.has(peerName)) return; // already connected

      const pc = createPeerConnection(peerName);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignal("webrtc-offer", peerName, offer);
    },
    [isEnabled, myName, createPeerConnection, sendSignal]
  );

  const onPeerLeft = useCallback(
    (peerName: string) => {
      const pc = peersRef.current.get(peerName);
      if (pc) {
        pc.close();
        peersRef.current.delete(peerName);
      }
      const audio = audioElemsRef.current.get(peerName);
      if (audio) {
        audio.srcObject = null;
        audioElemsRef.current.delete(peerName);
      }
      analysersRef.current.delete(peerName);
      setSpeakingPeers((prev) => {
        const next = { ...prev };
        delete next[peerName];
        return next;
      });
    },
    []
  );

  // ─── Enable / Disable ─────────────────────────────────────────────────────────

  const enable = useCallback(async () => {
    const stream = await acquireLocalStream(selectedMicId || undefined);
    if (!stream) return;
    localStreamRef.current = stream;

    // Set up gain node for muting without stopping tracks
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;
    const src = ctx.createMediaStreamSource(stream);
    const gain = ctx.createGain();
    gain.gain.value = mode === "open" ? 1 : 0;
    src.connect(gain);
    gainNodeRef.current = gain;

    // Start muted (PTT default) or unmuted (open mic)
    stream.getAudioTracks().forEach((t) => {
      t.enabled = mode === "open";
    });

    setIsEnabled(true);
    setIsMicActive(true);
    setIsTalking(mode === "open");
  }, [acquireLocalStream, selectedMicId, mode]);

  const disable = useCallback(() => {
    // Notify peers we're leaving
    sendSignal("webrtc-leave", null, null);

    // Close all peer connections
    peersRef.current.forEach((pc) => pc.close());
    peersRef.current.clear();

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    // Clean up audio elements
    audioElemsRef.current.forEach((a) => { a.srcObject = null; });
    audioElemsRef.current.clear();
    analysersRef.current.clear();
    stopSpeakingPoll();

    setIsEnabled(false);
    setIsMicActive(false);
    setIsTalking(false);
  }, [sendSignal, stopSpeakingPoll]);

  // ─── Mic Toggle ──────────────────────────────────────────────────────────────

  const toggleMic = useCallback(() => {
    if (!isEnabled) {
      enable();
      return;
    }
    const next = !isMicActive;
    setIsMicActive(next);
    if (!next) {
      setLocalTrackEnabled(false);
    } else if (mode === "open") {
      setLocalTrackEnabled(true);
    }
    // If PTT, track will only transmit while key held
  }, [isEnabled, isMicActive, mode, enable, setLocalTrackEnabled]);

  // ─── Mode change ─────────────────────────────────────────────────────────────

  const setMode = useCallback(
    (newMode: MicMode) => {
      setModeState(newMode);
      if (isEnabled && isMicActive) {
        setLocalTrackEnabled(newMode === "open");
      }
    },
    [isEnabled, isMicActive, setLocalTrackEnabled]
  );

  // ─── PTT ─────────────────────────────────────────────────────────────────────

  const handlePttKeyDown = useCallback(() => {
    if (mode !== "ptt" || pttHeldRef.current) return;
    pttHeldRef.current = true;
    if (isEnabled && isMicActive) setLocalTrackEnabled(true);
  }, [mode, isEnabled, isMicActive, setLocalTrackEnabled]);

  const handlePttKeyUp = useCallback(() => {
    if (mode !== "ptt") return;
    pttHeldRef.current = false;
    setLocalTrackEnabled(false);
  }, [mode, setLocalTrackEnabled]);

  // ─── Global PTT key listener ──────────────────────────────────────────────────

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "KeyV" &&
        !e.repeat &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          (e.target as HTMLElement)?.tagName ?? ""
        )
      ) {
        handlePttKeyDown();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyV") handlePttKeyUp();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [handlePttKeyDown, handlePttKeyUp]);

  // ─── Mic device change ────────────────────────────────────────────────────────

  const setMicDevice = useCallback(
    async (deviceId: string) => {
      setSelectedMicId(deviceId);
      if (isEnabled) {
        // Restart with new device
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((t) => t.stop());
        }
        const stream = await acquireLocalStream(deviceId);
        if (!stream) return;
        localStreamRef.current = stream;

        // Replace tracks in all peer connections
        const newTrack = stream.getAudioTracks()[0];
        peersRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "audio");
          if (sender && newTrack) {
            sender.replaceTrack(newTrack);
          }
        });

        // Restore mute state
        newTrack.enabled = mode === "open" && isMicActive;
      }
    },
    [isEnabled, acquireLocalStream, mode, isMicActive]
  );

  // ─── Cleanup on unmount ───────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (isEnabled) disable();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Initial device load ──────────────────────────────────────────────────────

  useEffect(() => {
    refreshDevices();
    navigator.mediaDevices?.addEventListener?.("devicechange", refreshDevices);
    return () => {
      navigator.mediaDevices?.removeEventListener?.("devicechange", refreshDevices);
    };
  }, [refreshDevices]);

  // ─── Return ───────────────────────────────────────────────────────────────────

  const state: VoiceChatState = {
    isEnabled,
    isMicActive,
    mode,
    micDevices,
    selectedMicId,
    isTalking,
    speakingPeers,
    permissionDenied,
  };

  const controls: VoiceChatControls = {
    enable,
    disable,
    toggleMic,
    setMode,
    setMicDevice,
    handlePttKeyDown,
    handlePttKeyUp,
    handleSignalingMessage,
    onPeerJoined,
    onPeerLeft,
  };

  return [state, controls];
}
