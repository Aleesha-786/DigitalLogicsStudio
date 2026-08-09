import React from "react";
import RegLayout from "./RegLayout";
import RegBox from "./components/RegBox";
import RegTable from "./components/RegTable";
import RegGrid from "./components/RegGrid";
import RegData from "./data/RegData";

const RegIntro = () => (
  <RegLayout
    title="Registers"
    subtitle="Groups of flip-flops that store multi-bit binary words — the fundamental building blocks of digital data storage inside every processor on the planet."
  >
    <div className="reg-content-body">
      <RegBox data={RegData.registers.box} />

      {/* ── What is a Register? ── */}
      <h2>What is a Register?</h2>
      <p>
        Imagine you're doing mental arithmetic. Before you can add two big
        numbers, you hold each one in your short-term memory for a split second.
        A <strong>register</strong> is the digital equivalent of that short-term
        memory — a tiny, ultra-fast storage cell that lives <em>inside</em> the
        processor.
      </p>

      <div className="reg-analogy">
        <p className="reg-analogy-text">
          A register is to a CPU what a whiteboard is to a mathematician — not
          where results are permanently stored, but where you scribble the
          current working values so you can act on them instantly.
        </p>
        <span className="reg-analogy-label">📐 Analogy</span>
      </div>

      <p>
        Technically, an <em>n</em>-bit register is nothing more than <em>n</em>{" "}
        D-type flip-flops sharing a single common clock line. On every rising
        (or falling) clock edge, each flip-flop captures the logic level present
        at its <code>D</code> input and holds it stable on its <code>Q</code>{" "}
        output until the next active edge. This one-bit "snapshot" behaviour is
        what makes registers reliable in high-speed logic.
      </p>

      <div className="reg-callout">
        <span className="reg-callout-icon">💡</span>
        <div className="reg-callout-body">
          <p className="reg-callout-title">Key Insight</p>
          <p className="reg-callout-text">
            A modern x86-64 CPU has 16 general-purpose 64-bit registers plus
            dozens of special-purpose ones (flags, SIMD, segment). Every single
            instruction you run touches at least one of them.
          </p>
        </div>
      </div>

      {/* ── Register vs Memory ── */}
      <h2>Register vs. Memory — Why Both?</h2>
      <p>
        If registers are so fast, why not make all memory register-based?
        Because flip-flops are <strong>expensive</strong> — each one requires
        6–20 transistors, whereas a modern DRAM cell uses just{" "}
        <em>1 transistor + 1 capacitor</em>. A 64-bit register costs about the
        same silicon area as thousands of DRAM bits. The hierarchy is a
        cost-speed trade-off by design.
      </p>

      <RegTable data={RegData.registers.table} />

      {/* ── Structure ── */}
      <h2>Inside a 4-Bit Register</h2>
      <p>
        At the circuit level, four D flip-flops are wired in parallel. Their
        clock pins are tied together — this is the "common clock" that makes the
        register synchronous. When you assert the <code>LOAD</code> signal and
        the clock ticks, all four bits are captured simultaneously. The result?
        A complete 4-bit word stored in a single clock cycle.
      </p>

      {/* Shift demo */}
      <div className="reg-step-strip">
        <div className="reg-step">
          <span className="reg-step-num">FF3</span>
          <span className="reg-step-val">1</span>
          <span className="reg-step-label">MSB</span>
        </div>
        <div className="reg-step reg-step--active">
          <span className="reg-step-num">FF2</span>
          <span className="reg-step-val">0</span>
          <span className="reg-step-label">bit 2</span>
        </div>
        <div className="reg-step">
          <span className="reg-step-num">FF1</span>
          <span className="reg-step-val">1</span>
          <span className="reg-step-label">bit 1</span>
        </div>
        <div className="reg-step">
          <span className="reg-step-num">FF0</span>
          <span className="reg-step-val">1</span>
          <span className="reg-step-label">LSB</span>
        </div>
      </div>

      <p>
        The diagram above shows the word <code>1011</code> (decimal 11) stored
        across 4 flip-flops. FF3 holds the most-significant bit; FF0 holds the
        least-significant. Every D input is driven by external logic; every Q
        output feeds the data bus.
      </p>

      {/* ── Types ── */}
      <h2>Types of Registers</h2>
      <RegGrid data={RegData.registers.grid} />

      {/* ── RTL ── */}
      <h2>Register Transfer Language (RTL)</h2>
      <p>
        Hardware designers need a concise notation to describe what happens to
        data on each clock cycle.{" "}
        <strong>Register Transfer Language (RTL)</strong> is that notation —
        think of it as pseudocode for hardware.
      </p>
      <ul>
        <li>
          <code>R1 ← R2</code> — copy the contents of R2 into R1 (one clock).
        </li>
        <li>
          <code>R1 ← R1 + R2</code> — add R1 and R2, store the result back in
          R1.
        </li>
        <li>
          <code>if (K1 = 1) then R2 ← R1</code> — conditional transfer
          (multiplexer in hardware).
        </li>
        <li>
          <code>R1 ← shl(R1)</code> — shift R1 left by one bit (equivalent to
          ×2).
        </li>
      </ul>
      <p>
        RTL is not just academic notation — it is the conceptual foundation of
        hardware description languages like <strong>VHDL</strong> and{" "}
        <strong>Verilog</strong>. When you write <code>reg &lt;= reg + 1;</code>{" "}
        in Verilog, you are writing RTL.
      </p>

      <div className="reg-callout reg-callout--success">
        <span className="reg-callout-icon">🎓</span>
        <div className="reg-callout-body">
          <p className="reg-callout-title">Real-World Connection</p>
          <p className="reg-callout-text">
            When a compiler generates machine code like <em>ADD R0, R1, R2</em>,
            the CPU is executing RTL: <code>R0 ← R1 + R2</code>. You have been
            "doing RTL" every time you've used a high-level language — the
            compiler just hides it from you.
          </p>
        </div>
      </div>
    </div>
  </RegLayout>
);

export default RegIntro;
