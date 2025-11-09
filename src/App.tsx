import { Activity, ScrollText, Play, StopCircle, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

function isHostLocal(host: string) {
  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.startsWith("::1") ||
    host.startsWith("192.168") ||
    host.startsWith("10.") ||
    host.startsWith("172.")
  );
}

function getSocketURL() {
  const host = window.location.host.split(":")[0];
  const isLocal = isHostLocal(host);
  const socketURL = isLocal ? `http://${host}:3000` : "/";
  return socketURL;
}

const socket = io(getSocketURL());

function ConfigureProxiesAndAccountsView({ onClose }: { onClose: () => void }) {
  const [loadingConfiguration, setLoadingConfiguration] = useState(false);
  const [configuration, setConfiguration] = useState<string[]>(["", "", ""]);

  async function retrieveConfiguration(): Promise<string[]> {
    const response = await fetch(`http://localhost:3000/configuration`);
    const information = (await response.json()) as {
      proxies: string;
      uas: string;
      accounts: string;
    };

    const proxies = atob(information.proxies);
    const uas = atob(information.uas);
    const accounts = atob(information.accounts);

    return [proxies, uas, accounts];
  }

  useEffect(() => {
    if (!loadingConfiguration) {
      setLoadingConfiguration(true);
      retrieveConfiguration().then((config) => {
        setLoadingConfiguration(false);
        setConfiguration(config);
      });
    }
  }, []);

  function saveConfiguration() {
    const obj = {
      proxies: btoa(configuration[0]),
      uas: btoa(configuration[1]),
      accounts: btoa(configuration[2]),
    };

    const response = fetch(`http://localhost:3000/configuration`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(obj),
    });

    response.then(() => {
      alert("Configuration saved successfully!");
      window.location.reload();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-4xl p-8 mx-4 bg-white rounded-lg shadow-2xl">
        {loadingConfiguration ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-gray-600">Loading configuration files...</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Configuration</h2>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Proxies (proxies.txt)
              </label>
              <textarea
                value={configuration[0]}
                className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onChange={(e) =>
                  setConfiguration([e.target.value, configuration[1], configuration[2]])
                }
                placeholder="socks5://host:port&#10;http://user:pass@host:port"
              ></textarea>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                User Agents (uas.txt)
              </label>
              <textarea
                value={configuration[1]}
                className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onChange={(e) =>
                  setConfiguration([configuration[0], e.target.value, configuration[2]])
                }
                placeholder="Mozilla/5.0 (Windows NT 10.0; Win64; x64)..."
              ></textarea>
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Kick Accounts (accounts.json) - Optional
              </label>
              <textarea
                value={configuration[2]}
                className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                onChange={(e) =>
                  setConfiguration([configuration[0], configuration[1], e.target.value])
                }
                placeholder='[{"username":"user1","email":"user1@example.com","token":"...","isActive":true}]'
              ></textarea>
              <p className="mt-1 text-xs text-gray-500">
                Format: JSON array with username, email, token/password, and isActive
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={saveConfiguration}
                className="flex-1 px-6 py-3 text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Save Configuration
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-700 transition-colors bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  const [isTesting, setIsTesting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [channelUrl, setChannelUrl] = useState("");
  const [anonymousViewers, setAnonymousViewers] = useState(10);
  const [authenticatedViewers, setAuthenticatedViewers] = useState(0);
  const [duration, setDuration] = useState(60);
  const [stats, setStats] = useState({
    activeViewers: 0,
    totalConnections: 0,
    totalViewTime: 0,
    availableAccounts: 0,
  });
  const [hasAccounts, setHasAccounts] = useState(false);
  const [openedConfig, setOpenedConfig] = useState(false);

  useEffect(() => {
    // Check if accounts are available
    fetch("http://localhost:3000/configuration")
      .then((res) => res.json())
      .then((data) => {
        setHasAccounts(data.hasAccounts || false);
      })
      .catch(() => setHasAccounts(false));

    socket.on("viewerStats", (data) => {
      setStats((old) => ({
        activeViewers: data.activeViewers ?? old.activeViewers,
        totalConnections: data.totalConnections ?? old.totalConnections,
        totalViewTime: data.totalViewTime ?? old.totalViewTime,
        availableAccounts: data.availableAccounts ?? old.availableAccounts,
      }));
      if (data.log) addLog(data.log);
    });

    socket.on("testEnd", () => {
      setIsTesting(false);
    });

    return () => {
      socket.off("viewerStats");
      socket.off("testEnd");
    };
  }, []);

  const addLog = (message: string) => {
    setLogs((prev) => [message, ...prev].slice(0, 15));
  };

  const startTest = () => {
    if (!channelUrl.trim()) {
      alert("Please enter a Kick channel URL!");
      return;
    }

    setIsTesting(true);
    setLogs([]);
    setStats((old) => ({
      ...old,
      activeViewers: 0,
      totalViewTime: 0,
    }));

    socket.emit("startViewerTest", {
      channelUrl,
      anonymousViewers,
      authenticatedViewers,
      duration,
    });
  };

  const stopTest = () => {
    socket.emit("stopViewerTest");
    setIsTesting(false);
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="mb-2 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Kick Viewer Tester
          </h1>
          <p className="text-lg text-gray-600">
            Test concurrent viewer capacity for your Kick streams
          </p>
          <p className="mt-1 text-sm text-gray-500">
            For testing purposes only - Use on your own non-monetized channels
          </p>
        </div>

        {/* Main Card */}
        <div className="relative p-8 overflow-hidden bg-white shadow-xl rounded-2xl">
          {/* Configuration Section */}
          <div className="mb-8 space-y-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Kick Channel or Stream URL
              </label>
              <input
                type="text"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                placeholder="https://kick.com/channelname or https://kick.com/channelname/livestream/id"
                className="w-full px-4 py-3 transition-all border-2 border-gray-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                disabled={isTesting}
              />
              <p className="mt-1 text-xs text-gray-500">
                Works with channel URLs or specific livestream URLs
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Anonymous Viewers
                </label>
                <input
                  type="number"
                  value={anonymousViewers}
                  onChange={(e) =>
                    setAnonymousViewers(Math.min(50, Math.max(0, Number(e.target.value))))
                  }
                  className="w-full px-4 py-3 transition-all border-2 border-gray-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  disabled={isTesting}
                  min="0"
                  max="50"
                />
                <p className="mt-1 text-xs text-gray-500">Max: 50</p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Authenticated Viewers
                </label>
                <input
                  type="number"
                  value={authenticatedViewers}
                  onChange={(e) =>
                    setAuthenticatedViewers(Math.min(20, Math.max(0, Number(e.target.value))))
                  }
                  className="w-full px-4 py-3 transition-all border-2 border-gray-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
                  disabled={isTesting || !hasAccounts}
                  min="0"
                  max="20"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {hasAccounts ? "Max: 20" : "Configure accounts first"}
                </p>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-700">
                  Test Duration (seconds)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) =>
                    setDuration(Math.min(300, Math.max(10, Number(e.target.value))))
                  }
                  className="w-full px-4 py-3 transition-all border-2 border-gray-200 rounded-lg outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                  disabled={isTesting}
                  min="10"
                  max="300"
                />
                <p className="mt-1 text-xs text-gray-500">10-300 seconds</p>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => (isTesting ? stopTest() : startTest())}
                className={`
                  flex-1 px-8 py-4 rounded-lg font-semibold text-white transition-all shadow-lg
                  ${
                    isTesting
                      ? "bg-red-500 hover:bg-red-600 hover:shadow-red-200"
                      : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200"
                  }
                  flex items-center justify-center gap-3 text-lg
                `}
              >
                {isTesting ? (
                  <>
                    <StopCircle className="w-6 h-6" />
                    Stop Test
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6" />
                    Start Viewer Test
                  </>
                )}
              </button>

              <button
                onClick={() => setOpenedConfig(true)}
                className="px-6 py-4 text-gray-700 transition-all bg-gray-200 rounded-lg hover:bg-gray-300"
                title="Configure proxies and accounts"
              >
                <ScrollText className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
            <div className="p-5 transition-shadow bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl hover:shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-green-900">Active Viewers</span>
              </div>
              <div className="text-3xl font-bold text-green-700">
                {stats.activeViewers}
              </div>
            </div>

            <div className="p-5 transition-shadow bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl hover:shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">
                  Total Connections
                </span>
              </div>
              <div className="text-3xl font-bold text-blue-700">
                {stats.totalConnections}
              </div>
            </div>

            <div className="p-5 transition-shadow bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-purple-900">
                  Total View Time
                </span>
              </div>
              <div className="text-3xl font-bold text-purple-700">
                {Math.floor(stats.totalViewTime / 60)}m {stats.totalViewTime % 60}s
              </div>
            </div>

            <div className="p-5 transition-shadow bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl hover:shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-semibold text-amber-900">
                  Available Accounts
                </span>
              </div>
              <div className="text-3xl font-bold text-amber-700">
                {stats.availableAccounts}
              </div>
            </div>
          </div>

          {/* Logs Section */}
          <div className="p-5 font-mono text-sm bg-gray-900 rounded-xl">
            <div className="mb-3 text-base font-semibold text-gray-400">Activity Log</div>
            <div className="space-y-1 text-green-400">
              {logs.map((log, index) => (
                <div key={index} className="py-1 transition-opacity opacity-90 hover:opacity-100">
                  <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span>{" "}
                  {log}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="italic text-gray-600">
                  Waiting to start viewer test...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Made for testing purposes • Use responsibly on your own channels
          </p>
        </div>
      </div>

      {openedConfig && (
        <ConfigureProxiesAndAccountsView onClose={() => setOpenedConfig(false)} />
      )}
    </div>
  );
}

export default App;
