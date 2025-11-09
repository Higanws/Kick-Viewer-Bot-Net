import { parentPort, workerData } from "worker_threads";
import { createKickClient } from "../utils/clientUtils.js";

function parseChannelUrl(url) {
  try {
    let channelName = url;
    
    if (url.includes("kick.com/")) {
      const parts = url.split("kick.com/");
      channelName = parts[1] || parts[0];
    }
    
    // Extraer solo el nombre del canal, ignorando /livestream/id o cualquier path adicional
    // Ejemplos:
    // xqc -> xqc
    // xqc/livestream/123 -> xqc
    // xqc?some=param -> xqc
    const pathParts = channelName.split("/");
    channelName = pathParts[0].split("?")[0].trim();
    
    if (!channelName) {
      throw new Error("Could not extract channel name from URL");
    }
    
    return channelName;
  } catch (error) {
    throw new Error(`Invalid Kick channel URL: ${url}`);
  }
}

const startViewing = async () => {
  const { channelUrl, viewerMode, proxy, userAgent, duration, account } = workerData;
  
  let channelName;
  try {
    channelName = parseChannelUrl(channelUrl);
  } catch (error) {
    parentPort.postMessage({
      log: `❌ ${error.message}`,
    });
    process.exit(1);
  }
  
  const kickUrl = `https://kick.com/${channelName}`;
  const apiUrl = `https://kick.com/api/v2/channels/${channelName}`;
  
  try {
    const cookies = account?.token ? `token=${account.token}` : null;
    const client = createKickClient(proxy, userAgent, cookies);
    
    parentPort.postMessage({
      log: `🔗 Connecting to ${kickUrl} (${viewerMode} mode) from ${proxy.host}`,
    });
    
    const channelResponse = await client.get(apiUrl);
    
    if (!channelResponse.data) {
      throw new Error("Channel not found or not live");
    }
    
    const channelData = channelResponse.data;
    const isLive = channelData.livestream !== null;
    
    parentPort.postMessage({
      log: `✅ Connected to ${channelName} - ${isLive ? 'LIVE' : 'OFFLINE'} ${viewerMode === 'authenticated' ? '(authenticated)' : '(anonymous)'}`,
      totalViewers: 1,
    });
    
    await client.get(kickUrl);
    
    let heartbeatCount = 0;
    const heartbeatInterval = setInterval(async () => {
      try {
        heartbeatCount++;
        await client.get(apiUrl);
        
        parentPort.postMessage({
          log: `💓 Heartbeat #${heartbeatCount} from ${proxy.host} (${channelName})`,
        });
      } catch (error) {
        parentPort.postMessage({
          log: `⚠️ Heartbeat failed from ${proxy.host}: ${error.message}`,
        });
      }
    }, 30000);
    
    setTimeout(() => {
      clearInterval(heartbeatInterval);
      
      const totalMinutes = Math.floor(duration / 60);
      parentPort.postMessage({
        log: `⏹️ Viewer session ended for ${channelName} (${totalMinutes} min, ${heartbeatCount} heartbeats)`,
        totalViewers: -1,
      });
      
      process.exit(0);
    }, duration * 1000);
    
  } catch (error) {
    parentPort.postMessage({
      log: `❌ Failed to connect from ${proxy.host}: ${error.message}`,
      totalViewers: -1,
    });
    process.exit(1);
  }
};

if (workerData) {
  startViewing();
}
