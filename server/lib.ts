export type ProxyProtocol = "http" | "https" | "socks4" | "socks5" | string;

export interface Proxy {
  username?: string;
  password?: string;
  protocol: ProxyProtocol;
  host: string;
  port: number;
}

export type ViewerMode = "anonymous" | "authenticated";

export type StreamPlatform = "kick";

export interface KickAccount {
  username: string;
  email: string;
  token?: string;
  password?: string;
  lastUsed?: number;
  isActive: boolean;
}

export interface ViewerTestConfig {
  channelUrl: string;
  anonymousViewers: number;
  authenticatedViewers: number;
  duration: number;
  accounts?: KickAccount[];
}
