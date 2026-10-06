import { useEffect } from "react";

export const useKeyboardShortcuts = ({
  undo,
  redo,
  gates,
  selectedGateIds,
  setSelectedGateIds,
  selectedWireIds = [],
  setSelectedWireIds,
  deleteGate,
  setWires,
  saveToHistory,
  copySelectedGates,
  pasteGates,
  duplicateSelectedGates,
  setConnectingFrom,
  setConnectCursor,
}) => {
  useEffect(() => {
    const handler = (e) => {
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA"
      )
        return;

      if (e.ctrlKey && e.shiftKey && e.key === "Z") {
        e.preventDefault();
        redo();
      } else if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.key === "a") {
        e.preventDefault();
        setSelectedGateIds(gates.map((g) => g.id));
      } else if (e.ctrlKey && e.key === "c") {
        e.preventDefault();
        copySelectedGates();
      } else if (e.ctrlKey && e.key === "v") {
        e.preventDefault();
        pasteGates();
      } else if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        duplicateSelectedGates();
      } else if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedWireIds.length > 0
      ) {
        e.preventDefault();
        setWires?.((prev) => prev.filter((w) => !selectedWireIds.includes(w.id)));
        setSelectedWireIds?.([]);
        saveToHistory?.();
      } else if (
        (e.key === "Delete" || e.key === "Backspace") &&
        selectedGateIds.length > 0
      ) {
        e.preventDefault();
        deleteGate();
      } else if (e.key === "Escape") {
        setConnectingFrom(null);
        setConnectCursor(null);
        setSelectedGateIds([]);
        setSelectedWireIds?.([]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    undo,
    redo,
    gates,
    selectedGateIds,
    setSelectedGateIds,
    selectedWireIds,
    setSelectedWireIds,
    deleteGate,
    setWires,
    saveToHistory,
    copySelectedGates,
    pasteGates,
    duplicateSelectedGates,
    setConnectingFrom,
    setConnectCursor,
  ]);
};
