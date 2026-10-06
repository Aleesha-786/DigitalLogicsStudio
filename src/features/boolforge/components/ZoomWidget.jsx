import React from "react";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from "lucide-react";

export const ZoomWidget = ({ zoom, setZoom, setPanOffset, fitToView }) => (
  <div
    className="canvas-zoom-widget"
    onMouseDown={(e) => e.stopPropagation()}
    onTouchStart={(e) => e.stopPropagation()}
  >
    <button className="ribbon-button ribbon-button--icon" onClick={() => setZoom(Math.min(3, zoom * 1.2))} title="Zoom In">
      <ZoomIn size={16} strokeWidth={2} />
    </button>
    <span className="ribbon-zoom-level">{Math.round(zoom * 100)}%</span>
    <button className="ribbon-button ribbon-button--icon" onClick={() => setZoom(Math.max(0.1, zoom * 0.8))} title="Zoom Out">
      <ZoomOut size={16} strokeWidth={2} />
    </button>
    <button
      className="ribbon-button ribbon-button--icon"
      onClick={() => { setZoom(1); setPanOffset({ x: 0, y: 0 }); }}
      title="Reset Zoom"
    >
      <RotateCcw size={16} strokeWidth={2} />
    </button>
    <button className="ribbon-button ribbon-button--icon" onClick={fitToView} title="Fit all gates into view">
      <Maximize2 size={16} strokeWidth={2} />
    </button>
  </div>
);
