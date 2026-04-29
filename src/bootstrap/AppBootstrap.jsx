import { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useConfig } from "../context/ConfigContext";
import { loadProjectConfig } from "../services/ConfigService";  

export default function AppBootstrap({ children }) {
  const { user, loading } = useAuth();
  const { config, setConfig } = useConfig();
  const [configLoading, setConfigLoading] = useState(true);
  const lastProjectId = useRef(null);

  useEffect(() => {
    if (loading) {
      return;
    }
    if (!user?.projectId) {
      setConfig(null);
      lastProjectId.current = null;
      setConfigLoading(false);
      return;
    }
    if (lastProjectId.current === user.projectId) {
      setConfigLoading(false);
      return;
    }
    async function initConfig() {
      setConfigLoading(true);
      lastProjectId.current = user.projectId;

      try {
        const currentLoadedConfig = await loadProjectConfig(user.projectId);
        if (!currentLoadedConfig) throw new Error("Invalid config");
        setConfig(currentLoadedConfig);
      } catch (err) {
        setConfig(null);
      } finally {
        setConfigLoading(false);
      }
    }
    initConfig();
  }, [user?.projectId, loading]); 

  if (loading || (user && configLoading)) {
    return <div>Initializing application...</div>;
  }
  return children;
}