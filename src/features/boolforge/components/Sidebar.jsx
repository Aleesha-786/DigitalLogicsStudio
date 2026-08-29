import React, { useState, useMemo } from "react";
import { Search, Boxes, GitMerge, GitBranch, ArrowRightCircle, ArrowLeftCircle, Plus, Minus, Package } from "lucide-react";

const PALETTE_SECTIONS = [
  {
    title: "Logic Gates",
    icon: Boxes,
    items: ["INPUT", "OUTPUT", "AND", "OR", "NOT", "NAND", "NOR", "XOR", "XNOR", "BUFFER"].map((type) => ({
      type,
      label: type,
    })),
  },
  {
    title: "Multiplexers",
    icon: GitMerge,
    ic: true,
    items: [
      { type: "MUX2", label: "MUX 2:1" },
      { type: "MUX4", label: "MUX 4:1" },
      { type: "MUX8", label: "MUX 8:1" },
    ],
  },
  {
    title: "Demultiplexers",
    icon: GitBranch,
    ic: true,
    items: [
      { type: "DEMUX2", label: "DEMUX 1:2" },
      { type: "DEMUX4", label: "DEMUX 1:4" },
      { type: "DEMUX8", label: "DEMUX 1:8" },
    ],
  },
  {
    title: "Encoders",
    icon: ArrowRightCircle,
    ic: true,
    items: [
      { type: "ENC4", label: "ENC 4:2" },
      { type: "ENC8", label: "ENC 8:3" },
    ],
  },
  {
    title: "Decoders",
    icon: ArrowLeftCircle,
    ic: true,
    items: [
      { type: "DEC4", label: "DEC 2:4" },
      { type: "DEC8", label: "DEC 3:8" },
    ],
  },
  {
    title: "Adders",
    icon: Plus,
    ic: true,
    items: [
      { type: "HALF_ADDER", label: "Half Adder" },
      { type: "FULL_ADDER", label: "Full Adder" },
      { type: "ADD4", label: "4-bit Adder" },
      { type: "CLADD4", label: "Carry LA 4" },
    ],
  },
  {
    title: "Subtractors",
    icon: Minus,
    ic: true,
    items: [
      { type: "HALF_SUBTRACTOR", label: "Half Sub" },
      { type: "FULL_SUBTRACTOR", label: "Full Sub" },
    ],
  },
];

export const Sidebar = ({
  selectionToolActive,
  setSelectionToolActive,
  simplifiedExpression,
  addGate,
  customComponents = [],
  onDeleteComponent,
}) => {
  const [query, setQuery] = useState("");

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PALETTE_SECTIONS;
    return PALETTE_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => item.label.toLowerCase().includes(q) || item.type.toLowerCase().includes(q)
      ),
    })).filter((section) => section.items.length > 0);
  }, [query]);

    const filteredCustomComponents = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customComponents;
    return customComponents.filter((c) => c.name.toLowerCase().includes(q));
  }, [customComponents, query]);

  return (
    <div className="sidebar sidebar--compact">
      <h2>Circuit Forge</h2>

      <button
        onClick={() => setSelectionToolActive((v) => !v)}
        className={`toggle-selection-btn${selectionToolActive ? " active" : ""}`}
      >
        <span className="icon">{selectionToolActive ? "✦" : "⬚"}</span>
        {selectionToolActive ? "Selection ON" : "Selection OFF"}
      </button>

      {simplifiedExpression && (
        <div className="simplified-expression-display">
          <h3>📐 K-Map Simplified Expression</h3>
          <div className="expression-content">{simplifiedExpression}</div>
          <p className="expression-hint">Circuit auto-generated below! ✨</p>
        </div>
      )}

      <div className="sidebar-search">
        <Search size={13} strokeWidth={2} className="sidebar-search-icon" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search components…"
        />
      </div>

      {filteredSections.length === 0 && filteredCustomComponents.length === 0 && (
        <div className="sidebar-empty-state">No components match "{query}"</div>
      )}

      {filteredSections.map((section) => {
        const SectionIcon = section.icon;
        return (
          <div className="palette-section" key={section.title}>
            <div className="palette-section-title">
              <SectionIcon size={12} strokeWidth={2.25} />
              <span>{section.title}</span>
            </div>
            <div className="gate-palette">
              {section.items.map(({ type, label }) => (
                <button
                  key={type}
                  className={`gate-btn${section.ic ? " gate-btn--ic" : ""}`}
                  onClick={() => addGate(type)}
                  title={label}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {filteredCustomComponents.length > 0 && (
        <div className="palette-section">
          <div className="palette-section-title">
            <Package size={12} strokeWidth={2.25} />
            <span>My Components</span>
          </div>
          <div className="gate-palette">
            {filteredCustomComponents.map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <button
                  className="gate-btn gate-btn--ic"
                  style={{ flex: 1 }}
                  onClick={() => addGate(`CUSTOM_${c.id}`)}
                  title={`${c.inputs.length} input(s), ${c.outputs.length} output(s)`}
                >
                  {c.name}
                </button>
                {onDeleteComponent && (
                  <button
                    className="gate-btn"
                    style={{ padding: "4px 8px", flex: "0 0 auto" }}
                    title="Delete this component"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete "${c.name}"? This can't be undone.`)) {
                        onDeleteComponent(c.id);
                      }
                    }}
                  >
                    🗑
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="sidebar-help-hint">
        Need controls &amp; shortcuts? Check the <strong>Help</strong> menu in the toolbar above.
      </p>
    </div>
  );
};
