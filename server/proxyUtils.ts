import { Proxy, ProxyProtocol } from "./lib";

const DEFAULT_HTTP_PORT = 8080;
const DEFAULT_PROTOCOL: ProxyProtocol = "http";

const COMMON_PORTS: { [port: number]: ProxyProtocol } = {
  80: "http",
  443: "https",
  1080: "socks5",
  1081: "socks4",
  8080: "http",
  8443: "https",
};

// Kick viewer testing supports all proxy protocols
const SUPPORTED_PROTOCOLS: ProxyProtocol[] = ["http", "https", "socks4", "socks5"];

/**
 * Attempts to infer the protocol based on the port.
 */
function inferProtocol(port: number | undefined): ProxyProtocol {
  if (port !== undefined && COMMON_PORTS[port]) {
    return COMMON_PORTS[port];
  }
  return DEFAULT_PROTOCOL;
}

/**
 * Ensures a proxy object is safe and normalized by adding default values if missing.
 */
function normalizeProxy(proxy: Proxy): Proxy {
  const normalizedPort = proxy.port || DEFAULT_HTTP_PORT;
  const normalizedProtocol = proxy.protocol || inferProtocol(normalizedPort);

  return {
    ...proxy,
    port: normalizedPort,
    protocol: normalizedProtocol,
  };
}

/**
 * Filters and validates proxies for viewer testing.
 */
export function filterProxies(proxies: Proxy[]): Proxy[] {
  return proxies
    .map(normalizeProxy)
    .filter((proxy) => SUPPORTED_PROTOCOLS.includes(proxy.protocol));
}
