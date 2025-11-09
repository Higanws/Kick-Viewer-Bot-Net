import axios from "axios";
import net from "net";
import { SocksProxyAgent } from "socks-proxy-agent";

// Misc
export function createAgent(proxy) {
  if (proxy.protocol !== "socks4" && proxy.protocol !== "socks5") {
    throw new Error("Unsupported proxy protocol for agent: " + proxy.protocol);
  }

  const uri = `${proxy.protocol}://${
    proxy.username && proxy.password
      ? `${proxy.username}:${proxy.password}@`
      : ""
  }${proxy.host}:${proxy.port}`;

  return new SocksProxyAgent(uri);
}

// HTTP Client
export function createMimicHttpClient(proxy, userAgent) {
  return createHttpClient({
    headers: { "User-Agent": userAgent },
    proxy,
    timeout: 5000,
    validateStatus: (status) => {
      return status < 500;
    },
    maxRedirects: 3,
  });
}

export function createHttpClient(
  clientConfig = {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
    },
    timeout: 5000,
    validateStatus: (status) => {
      return status < 500;
    },
    maxRedirects: 0,
    proxy: {},
  }
) {
  const config = { ...clientConfig };
  const proxy = config.proxy;

  if (proxy.protocol == "http" || proxy.protocol == "https") {
    config.proxy = {
      host: proxy.host,
      port: proxy.port,
      auth: proxy.username ? { username: proxy.username } : null,
    };
  } else if (proxy.protocol == "socks4" || proxy.protocol == "socks5") {
    const agent = createAgent(proxy);
    config.proxy = false;
    config.httpAgent = agent;
    config.httpsAgent = agent;
  } else {
    throw new Error(
      "Unsupported proxy protocol for HTTP client: " + proxy.protocol
    );
  }

  const client = axios.create(config);
  return client;
}

// Kick Client
export function createKickClient(proxy, userAgent, cookies) {
  const headers = {
    "User-Agent": userAgent,
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
  };

  if (cookies) {
    headers.Cookie = cookies;
  }

  return createHttpClient({
    headers,
    proxy,
    timeout: 10000,
    validateStatus: (status) => {
      return status < 500;
    },
    maxRedirects: 5,
  });
}

// TCP Client
const DEFAULT_SOCKET_CONFIG = {
  host: "127.0.0.1",
  port: 1080,
  timeout: 5000,
};

export function createTcpClient(
  proxy,
  socketConfig = DEFAULT_SOCKET_CONFIG,
  callback
) {
  if (proxy.protocol !== "socks4" && proxy.protocol !== "socks5") {
    throw new Error(
      "Unsupported proxy protocol for TCP client: " + proxy.protocol
    );
  }

  const socket = new net.Socket();
  const proxyAgent = createAgent(proxy);
  const config = { ...DEFAULT_SOCKET_CONFIG, ...socketConfig };

  socket.setTimeout(config.timeout);

  socket.connect(
    { host: config.host, port: config.port, agent: proxyAgent },
    () => {
      if (callback) callback(socket);
      socket["open"] = true;
    }
  );

  socket.on("close", () => {
    socket["open"] = false;
  });

  socket.on("timeout", () => {
    socket.destroy();
    socket["open"] = false;
  });

  return socket;
}
