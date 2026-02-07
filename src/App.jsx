import { useState, useEffect } from "react";
import loadTransgressions, {
  clearTransgressionsCache,
} from "./components/loadData";
import TransgressionMap from "./components/TransgressionMap";
import "./App.css";

function App() {
  const [transgressions, setTransgressions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load once on mount with module level cache
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    loadTransgressions()
      .then((data) => {
        if (!mounted) return;
        setTransgressions(data);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Force a fresh fetch (bypasses the cached promise)
  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await loadTransgressions({ force: true });
      setTransgressions(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Alternative: clear the module cache and then load (same effect as force)
  const handleClearCacheAndRefresh = async () => {
    clearTransgressionsCache();
    await handleRefresh();
  };

  return (
    <>
      <header style={{ padding: 12 }}>
        <button onClick={handleRefresh} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
        <button
          onClick={handleClearCacheAndRefresh}
          disabled={loading}
          style={{ marginLeft: 8 }}
        >
          Clear Cache & Refresh
        </button>
        {error && (
          <p style={{ color: "red", marginLeft: 12 }}>Error: {String(error)}</p>
        )}
      </header>

      <main style={{ height: "calc(100vh - 56px)" }}>
        <TransgressionMap transgressions={transgressions} />
      </main>
    </>
  );
}

export default App;
