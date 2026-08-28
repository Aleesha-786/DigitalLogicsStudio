import React from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
} from "lucide-react";

export const ZoomWidget = ({
  zoom,
  setZoom,
  setPanOffset,
  fitToView 
}) => {

    return (
        <>
                  {/* ── Zoom (kept always visible — most-used control) ──────────── */}
            <div className="ribbon-group ribbon-group--zoom">
                <button className="ribbon-button ribbon-button--icon" onClick={() => setZoom(Math.min(3, zoom * 1.2))} title="Zoom In">
                    <ZoomIn size={16} strokeWidth={2} />
                </button>
                <span className="ribbon-zoom-level">{Math.round(zoom * 100)}%</span>
                <button className="ribbon-button ribbon-button--icon" onClick={() => setZoom(Math.max(0.1, zoom * 0.8))} title="Zoom Out">
                    <ZoomOut size={16} strokeWidth={2} />
                </button>
                <button
                className="ribbon-button ribbon-button--icon"
                onClick={() => {
                    setZoom(1);
                    setPanOffset({ x: 0, y: 0 });
                }}
                title="Reset Zoom"
                >
                <RotateCcw size={16} strokeWidth={2} />
                </button>
                <button className="ribbon-button ribbon-button--icon" onClick={fitToView} title="Fit all gates into view">
                <Maximize2 size={16} strokeWidth={2} />
                </button>
            </div>

        </>
    );   
}

