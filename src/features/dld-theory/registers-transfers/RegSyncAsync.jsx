import React from "react";
import RegLayout from "./RegLayout";
import RegBox from "./components/RegBox";
import RegTable from "./components/RegTable";
import RegGrid from "./components/RegGrid";
import RegData from "./data/RegData";

const RegSyncAsync = () => (
  <RegLayout
    title="Synchronous vs Asynchronous"
    subtitle="Two fundamentally different clocking strategies — one prioritises correctness and speed, the other simplicity and power. Understanding both is essential for any digital designer."
  >
    <div className="reg-content-body">
      <RegBox data={RegData.syncAsync.box} />

      {/* ── The Core Idea ── */}
      <h2>The Central Question: Who Controls the Clock?</h2>
      <p>
        Every flip-flop needs a clock signal to decide <em>when</em> to capture
        its input. The fundamental design choice is: do <strong>all</strong>{" "}
        flip-flops share the same clock, or does each one get clocked by the
        output of the previous stage?
      </p>

      <div className="reg-compare">
        <div className="reg-compare-col reg-compare-col--a">
          <p className="reg-compare-title">⏱ Synchronous</p>
          <ul className="reg-compare-list">
            <li>One global clock drives every FF simultaneously</li>
            <li>All state changes happen at the exact same instant</li>
            <li>Predictable, glitch-free output</li>
            <li>Easy to analyse — just check setup/hold times</li>
            <li>Standard in all modern ASICs, FPGAs, CPUs</li>
          </ul>
        </div>
        <div className="reg-compare-col reg-compare-col--b">
          <p className="reg-compare-title">🌊 Asynchronous (Ripple)</p>
          <ul className="reg-compare-list">
            <li>Each FF clocked by Q output of the previous one</li>
            <li>Clock "ripples" through the chain like falling dominoes</li>
            <li>Transient glitches appear during counting</li>
            <li>Hard to verify — timing analysis is complex</li>
            <li>Useful in low-power discrete or legacy designs</li>
          </ul>
        </div>
      </div>

      {/* ── Synchronous Deep Dive ── */}
      <h2>Synchronous Operation — The Industry Standard</h2>
      <p>
        In a synchronous circuit, all flip-flops share a single{" "}
        <strong>global clock</strong>. Every state change occurs precisely on
        the active clock edge — all at once, with no ambiguity about timing
        order. This makes the designer's life dramatically easier: you simply
        ensure the data signals are stable before the edge (<em>setup time</em>)
        and remain stable briefly after (<em>hold time</em>).
      </p>

      <div className="reg-callout">
        <span className="reg-callout-icon">📐</span>
        <div className="reg-callout-body">
          <p className="reg-callout-title">The Maximum Clock Frequency Rule</p>
          <p className="reg-callout-text">
            In a synchronous system, the clock period must be longer than the
            longest combinational path between any two flip-flops plus setup
            time. This critical path determines the maximum operating frequency
            of the entire chip.
          </p>
        </div>
      </div>

      <div className="reg-formula">
        T_clk ≥ t_CQ (FF delay) + t_logic (combinational) + t_setup
        <span className="reg-formula-label">
          Minimum clock period for synchronous design
        </span>
      </div>

      {/* ── Asynchronous Deep Dive ── */}
      <h2>Asynchronous (Ripple) Operation — The Domino Effect</h2>
      <p>
        In an asynchronous counter, FF0 is clocked by the external signal. When
        FF0 toggles, its <code>Q</code> output triggers FF1, which in turn
        triggers FF2, and so on. The delay accumulates like toppling dominoes —
        each stage must wait for the previous one to settle before it can
        respond. For an <em>n</em>-stage chain, the worst-case delay is{" "}
        <code>n × t_FF</code>.
      </p>

      <div className="reg-analogy">
        <p className="reg-analogy-text">
          An asynchronous counter is like a game of telephone — by the time the
          message reaches the last person, valuable time has passed and the
          original signal is long gone. The longer the chain, the worse the
          delay.
        </p>
        <span className="reg-analogy-label">📡 Analogy</span>
      </div>

      {/* ── Comparison Table ── */}
      <RegTable data={RegData.syncAsync.table} />

      {/* ── Timing Parameters ── */}
      <h2>Critical Timing Parameters</h2>
      <p>
        Whether you're working with synchronous or asynchronous designs, four
        timing parameters govern every flip-flop in existence. Miss any of them
        and your circuit will fail unpredictably — the dreaded{" "}
        <strong>metastability</strong>.
      </p>
      <RegGrid data={RegData.syncAsync.grid} />

      <div className="reg-callout reg-callout--danger">
        <span className="reg-callout-icon">⚠️</span>
        <div className="reg-callout-body">
          <p className="reg-callout-title">Metastability Warning</p>
          <p className="reg-callout-text">
            If a D input changes too close to the clock edge (violating setup or
            hold time), the flip-flop enters a metastable state — neither 0 nor
            1. It will eventually resolve, but the resolution time is unbounded.
            This is the primary cause of silent, intermittent hardware bugs.
          </p>
        </div>
      </div>

      {/* ── Decision Guide ── */}
      <h2>Which Should You Use?</h2>
      <p>
        The answer for any serious digital project is almost always{" "}
        <strong>synchronous</strong>. Modern FPGA and ASIC toolchains are built
        around synchronous design — static timing analysis, automatic
        place-and-route, and timing closure all assume a synchronous
        methodology. The performance, reliability, and toolchain support
        advantages are overwhelming.
      </p>
      <p>
        Reserve <strong>asynchronous</strong> techniques for low-power discrete
        circuits, legacy repair work, or specific sub-circuits (like clock
        domain crossing synchronisers) where asynchronous behaviour is
        intentionally exploited.
      </p>

      <div className="reg-callout reg-callout--info">
        <span className="reg-callout-icon">🔬</span>
        <div className="reg-callout-body">
          <p className="reg-callout-title">
            Advanced: Globally Asynchronous, Locally Synchronous (GALS)
          </p>
          <p className="reg-callout-text">
            Modern SoCs often use multiple independent synchronous clock domains
            that communicate asynchronously — a GALS architecture. Each island
            is fully synchronous internally, with carefully designed clock
            domain crossing (CDC) circuits at the boundaries. This is the best
            of both worlds.
          </p>
        </div>
      </div>
    </div>
  </RegLayout>
);

export default RegSyncAsync;
