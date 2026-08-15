import React from "react";
import RegLayout from "./RegLayout";
import RegBox from "./components/RegBox";
import RegTable from "./components/RegTable";
import RegGrid from "./components/RegGrid";
import RegData from "./data/RegData";

const RegSyncBinaryCounters = () => (
  <RegLayout
    title="Synchronous Binary Counters"
    subtitle="All flip-flops share one clock — carry look-ahead logic eliminates ripple delay entirely, enabling fast, glitch-free counting at hundreds of megahertz."
  >
    <div className="reg-content-body">
      <RegBox data={RegData.syncBinaryCounters.box} />

      {/* ── The Big Idea ── */}
      <h2>Why Synchronous? Solving the Ripple Problem</h2>
      <p>
        Recall the ripple counter's fatal flaw: propagation delay accumulates.
        For a 4-bit counter at 10 ns per stage, you wait 40 ns for the output to
        settle — limiting you to ~25 MHz. A synchronous counter solves this by
        making <em>all flip-flops share the same clock edge</em>. The trick is{" "}
        <strong>carry look-ahead logic</strong>: we pre-compute each flip-flop's
        toggle condition using combinational gates, so every FF receives its
        enable signal <em>before</em> the clock edge arrives.
      </p>

      <div className="reg-analogy">
        <p className="reg-analogy-text">
          A synchronous counter is like a well-rehearsed marching band where
          every musician reads the same sheet music and makes their move exactly
          on the conductor's beat — nobody waits for the person next to them. A
          ripple counter is like the Mexican Wave — each person waits for their
          neighbour first.
        </p>
        <span className="reg-analogy-label">🎼 Analogy</span>
      </div>

      {/* ── Carry Look-Ahead ── */}
      <h2>Carry Propagation Logic — The Key Mechanism</h2>
      <p>
        In binary counting, a bit toggles only when all less-significant bits
        are 1. This logical rule directly maps to hardware:
      </p>

      <RegTable data={RegData.syncBinaryCounters.table} />

      <p>
        The AND gates that compute these conditions are the "look-ahead" logic.
        Because AND gates are fast combinational circuits, the enable signals
        reach all flip-flops almost simultaneously. The maximum path delay is
        just <code>1 AND-gate delay + 1 FF delay</code>, regardless of counter
        width.
      </p>

      <div className="reg-formula">
        t_max = t_AND + t_FF + t_setup (independent of n)
        <span className="reg-formula-label">
          vs. ripple: t_max = n × t_FF — synchronous wins by a factor of n
        </span>
      </div>

      {/* ── Control Inputs ── */}
      <h2>Control Inputs — Making Counters Programmable</h2>
      <p>
        Real-world synchronous counter ICs go far beyond just counting up. They
        include a rich set of control pins that make them flexible building
        blocks:
      </p>
      <ul>
        <li>
          <strong>LOAD (LD):</strong> When asserted, the counter ignores its
          current count and captures the parallel data inputs on the next clock
          edge. Essential for Mod-N counters — you load the "pre-set" value to
          skip forward in the count.
        </li>
        <li>
          <strong>Enable (ENP / ENT):</strong> Pauses counting without
          disturbing the stored value. ENP gates the counting logic; ENT
          additionally gates the terminal count output (RCO) for cascading.
        </li>
        <li>
          <strong>Clear (CLR):</strong> Resets all flip-flops to 0. A{" "}
          <em>synchronous</em> clear happens on the next clock edge (cleaner);
          an <em>asynchronous</em> clear happens immediately regardless of clock
          state (faster reset, but glitch-prone).
        </li>
        <li>
          <strong>RCO / TC (Terminal Count / Ripple Carry Out):</strong> Goes
          high when the counter reaches its maximum count (15 for 4-bit). Used
          to enable the next stage in a cascaded chain.
        </li>
      </ul>

      {/* ── ICs ── */}
      <h2>Common Synchronous Counter ICs</h2>
      <RegGrid data={RegData.syncBinaryCounters.grid} />

      {/* ── Cascading ── */}
      <h2>Cascading — Counting Beyond 4 Bits</h2>
      <p>
        A single 74HC163 gives you 4 bits (counts 0–15). To count 0–255 (8
        bits), cascade two ICs. Connect the <strong>RCO</strong> output of the
        lower chip to the <strong>ENP</strong> and <strong>ENT</strong> inputs
        of the upper chip. The lower chip counts freely; the upper chip only
        advances its count when the lower reaches 15 and RCO goes high.
      </p>
      <p>
        Because the enable inputs are combinational (not clocked), the
        synchronous nature of the design is preserved — all flip-flops across
        both ICs still respond to the same clock edge. This is{" "}
        <strong>true synchronous cascading</strong>.
      </p>

      <div className="reg-step-strip">
        <div className="reg-step">
          <span className="reg-step-num">CHIP 2</span>
          <span className="reg-step-val">0101</span>
          <span className="reg-step-label">bits 7–4</span>
        </div>
        <div className="reg-step reg-step--active">
          <span className="reg-step-num">RCO →</span>
          <span className="reg-step-val">EN</span>
          <span className="reg-step-label">cascade</span>
        </div>
        <div className="reg-step">
          <span className="reg-step-num">CHIP 1</span>
          <span className="reg-step-val">1111</span>
          <span className="reg-step-label">bits 3–0</span>
        </div>
      </div>

      {/* ── Mod-N using LOAD ── */}
      <h2>Building a Mod-N Synchronous Counter</h2>
      <p>
        To create a counter that cycles from 0 to N−1, decode the count N and
        use it to assert <code>LOAD</code> with the data inputs tied to 0000. On
        the next clock after reaching N, the counter loads zero and restarts.
        Because the LOAD is synchronous, the reset is glitch-free — a major
        advantage over the asynchronous clear trick used in ripple counters.
      </p>

      <div className="reg-callout reg-callout--success">
        <span className="reg-callout-icon">✅</span>
        <div className="reg-callout-body">
          <p className="reg-callout-title">Industry Best Practice</p>
          <p className="reg-callout-text">
            For any digital design targeting an FPGA or ASIC, always use
            synchronous counters with synchronous clear and synchronous load.
            This allows the synthesis tool to implement the design using
            dedicated fast-carry logic primitives (like Xilinx's CARRY4 chain),
            pushing performance well above 500 MHz on modern silicon.
          </p>
        </div>
      </div>
    </div>
  </RegLayout>
);

export default RegSyncBinaryCounters;
