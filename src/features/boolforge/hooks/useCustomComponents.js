import { useState, useEffect, useCallback } from "react";
import apiClient from "../../../shared/services/apiClient";

// Loads the current user's saved custom components once, and exposes
// create/delete. Consumers merge `components` into IC_META/IC_TYPES so
// they render and simulate exactly like built-in ICs.
export function useCustomComponents() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/custom-components");
      setComponents(data.components || []);
    } catch (err) {
      console.warn("[useCustomComponents] failed to load:", err?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createComponent = useCallback(async ({ name, inputs, outputs, gates, wires }) => {
    const { data } = await apiClient.post("/custom-components", { name, inputs, outputs, gates, wires });
    setComponents((prev) => [data.component, ...prev]);
    return data.component;
  }, []);

  const deleteComponent = useCallback(async (id) => {
    await apiClient.delete(`/custom-components/${id}`);
    setComponents((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return { components, loading, refresh, createComponent, deleteComponent };
}