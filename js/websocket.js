const DEFAULT_ENDPOINT = "ws://127.0.0.1:8080/";
const MIN_RETRY_DELAY_MS = 1000;
const MAX_RETRY_DELAY_MS = 15000;

function toPositiveInt(value) {
  const amount = Math.floor(Number(value));
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

export function parseSpawnPayload(rawPayload) {
  const payload = typeof rawPayload === "string"
    ? safeParseJson(rawPayload)
    : rawPayload;

  if (!payload || typeof payload !== "object") {
    return null;
  }

  if (payload.request === "ExecuteScript" && payload.name === "SpawnBits") {
    const amount = toPositiveInt(payload.args?.amount);

    if (!amount) {
      return null;
    }

    const { username = "", message = "" } = payload.args ?? {};
    return { amount, meta: { username, message } };
  }

  if (payload.type === "spawnBits") {
    const amount = toPositiveInt(payload.bits);

    if (!amount) {
      return null;
    }

    const { username = "", message = "" } = payload;
    return { amount, meta: { username, message } };
  }

  return null;
}

function safeParseJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function connectStreamerBotSocket({ endpoint = DEFAULT_ENDPOINT, onSpawn, onStatusChange } = {}) {
  const socketUrl = String(endpoint || DEFAULT_ENDPOINT);

  if (!/^wss?:\/\//i.test(socketUrl)) {
    onStatusChange?.("error", `Invalid WebSocket endpoint: ${socketUrl}`);
    return {
      endpoint: socketUrl,
      disconnect: () => {},
      reconnect: () => {},
      getStatus: () => "error"
    };
  }

  let ws = null;
  let retryAttempt = 0;
  let reconnectTimer = null;
  let isStopped = false;
  let status = "disconnected";

  const setStatus = (next, detail = "") => {
    status = next;
    onStatusChange?.(next, detail);
  };

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const scheduleReconnect = (reason = "Connection lost") => {
    if (isStopped) {
      return;
    }

    clearReconnectTimer();
    retryAttempt += 1;

    const delay = Math.min(
      MAX_RETRY_DELAY_MS,
      MIN_RETRY_DELAY_MS * (2 ** (retryAttempt - 1))
    );

    setStatus("reconnecting", `${reason}. Retrying in ${Math.round(delay / 1000)}s`);

    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, delay);
  };

  const connect = () => {
    if (isStopped) {
      return;
    }

    clearReconnectTimer();
    setStatus("connecting", `Connecting to ${socketUrl}`);

    try {
      ws = new WebSocket(socketUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create WebSocket";
      setStatus("error", message);
      scheduleReconnect("WebSocket setup failed");
      return;
    }

    ws.addEventListener("open", () => {
      retryAttempt = 0;
      setStatus("connected", `Connected to ${socketUrl}`);
    });

    ws.addEventListener("message", (event) => {
      const parsed = parseSpawnPayload(event.data);

      if (!parsed) {
        return;
      }

      onSpawn?.(parsed.amount, parsed.meta);
    });

    ws.addEventListener("error", () => {
      setStatus("error", "Connection error");
    });

    ws.addEventListener("close", (event) => {
      ws = null;

      if (isStopped) {
        setStatus("disconnected", "Socket stopped");
        return;
      }

      const reason = event.code === 1000
        ? "Socket closed"
        : `Socket closed (${event.code})`;

      scheduleReconnect(reason);
    });
  };

  const disconnect = () => {
    isStopped = true;
    clearReconnectTimer();

    if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
      ws.close(1000, "Overlay stopped");
    }

    ws = null;
    setStatus("disconnected", "Socket stopped");
  };

  const reconnect = () => {
    isStopped = false;
    retryAttempt = 0;
    connect();
  };

  connect();

  return {
    endpoint: socketUrl,
    disconnect,
    reconnect,
    getStatus: () => status
  };
}
