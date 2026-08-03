import React from "react";
import RegLayout from "./RegLayout";
import RegBox from "./components/RegBox";
import RegTable from "./components/RegTable";
import RegGrid from "./components/RegGrid";
import RegData from "./data/RegData";

const RegShiftRegisters = () => (
  <RegLayout
    title="Shift Registers"
    subtitle="Registers that move their bit pattern one position left or right each clock — the secret engine behind serial communication, cryptography, and signal processing."
  >
    <div className="reg-content-body">
      <RegBox data={RegData.shiftRegisters.box} />

      {/* ── What is shifting? ── */}
      <h2>Understanding Bit-Shifting</h2>
      <p>
        Imagine a conveyor belt. Each item on the belt represents a bit. Every
        clock pulse moves every item one slot forward. New items can enter at
        one end; items exit at the other. This is exactly how a shift register
        operates — the "belt" is a chain of flip-flops, each one passing its
        stored bit to the next stage on every clock edge.
      </p>

      <div className="reg-analogy">
        <p className="reg-analogy-text">
          A shift register is a digital queue. Add a bit at the back, and every
          existing bit moves one step closer to the front. The oldest bit falls
          off the end — or gets captured as parallel output — after exactly n
          clocks.
        </p>
        <span className="reg-analogy-label">🏭 Analogy</span>
      </div>

      <p>
        At the hardware level, this is trivially simple: connect the{" "}
        <code>Q</code> output of each flip-flop to the <code>D</code> input of
        the next. Add a clock, and you have a shift register. The elegance is in
        how much useful work such a simple circuit can accomplish.
      </p>

      {/* ── Modes ── */}
      <h2>The Four Operating Modes</h2>
      <p>
        Shift registers are classified by how data enters and exits the chain.
        The two access methods — <em>serial</em> (one bit at a time) and{" "}
        <em>parallel</em> (all bits simultaneously) — combine into four possible
        configurations:
      </p>

      <RegTable data={RegData.shiftRegisters.table} />

      <div className="reg-callout">
        <span className="reg-callout-icon">🔌</span>
        <div className="reg-callout-body">
          <p className="reg-callout-title">Why Does SIPO Matter?</p>
          <p className="reg-callout-text">
            Every time your microcontroller communicates over SPI or I²C, it
            shifts bytes out serially. On the receiving end, a SIPO register
            reassembles those bits into a full byte for the processor. Without
            SIPO shift registers, every peripheral would need 8 separate data
            lines — a wiring nightmare.
          </p>
        </div>
      </div>

      {/* ── Visual SIPO demo ── */}
      <h2>Visualising SIPO: Deserialising the Byte 10110100</h2>
      <p>
        The data stream enters bit-by-bit at the serial input (MSB first). After
        8 clocks, the full byte is available in parallel across all Q outputs
        simultaneously:
      </p>

      <div className="reg-step-strip">
        {["1", "0", "1", "1", "0", "1", "0", "0"].map((bit, i) => (
          <div
            key={i}
            className={`reg-step${bit === "1" ? " reg-step--active" : ""}`}
          >
            <span className="reg-step-num">Q{7 - i}</span>
            <span className="reg-step-val">{bit}</span>
            <span className="reg-step-label">bit {7 - i}</span>
          </div>
        ))}
      </div>

      <p>
        After clock 8, all 8 flip-flops hold the complete byte <code>0xB4</code>{" "}
        (180 decimal). The processor can now read all 8 bits in a single cycle
        via the parallel outputs — this is serial-to-parallel conversion.
      </p>

      {/* ── PISO ── */}
      <h2>PISO: The Transmitter's Best Friend</h2>
      <p>
        The reverse process — <strong>Parallel-In Serial-Out</strong> — is how a
        device transmits data serially. You load all 8 bits in parallel on one
        clock edge (by asserting the <code>LOAD</code> signal), then shift them
        out one at a time over 8 clock pulses. This is exactly what happens
        inside every SPI transmitter and UART.
      </p>

      <div className="reg-formula">
        Pin count saved = (n − 1) wires
        <span className="reg-formula-label">
          For an 8-bit word, PISO reduces 8 data wires to just 1 serial wire (+
          clock)
        </span>
      </div>

      {/* ── Applications ── */}
      <h2>Applications of Shift Registers</h2>
      <RegGrid data={RegData.shiftRegisters.grid} />

      {/* ── Bidirectional ── */}
      <h2>Bidirectional Shift Registers</h2>
      <p>
        A <strong>bidirectional</strong> shift register adds a direction-control
        input (often called <code>S/L̄</code> or <code>DIR</code>). When DIR = 1,
        bits shift left; when DIR = 0, bits shift right. This single control
        signal unlocks powerful arithmetic capabilities:
      </p>
      <ul>
        <li>
          <strong>Left shift by 1</strong> = multiply by 2 (in unsigned binary).
          Left shift by n = multiply by 2<sup>n</sup>. This is how hardware
          multipliers work at their core.
        </li>
        <li>
          <strong>Right shift by 1</strong> = divide by 2 (truncating division).
          For signed numbers, use <em>arithmetic right shift</em> (sign-extend
          from MSB).
        </li>
      </ul>

      <div className="reg-callout reg-callout--success">
        <span className="reg-callout-icon">🏆</span>
        <div className="reg-callout-body">
          <p className="reg-callout-title">Classic IC: 74HC595</p>
          <p className="reg-callout-text">
            The 74HC595 is one of the most widely used ICs in electronics. It's
            an 8-bit SIPO shift register with a storage latch — you clock in 8
            bits serially, then latch them to the parallel outputs all at once.
            Chain multiple 595s together with just 3 wires to drive 16, 24, or
            32 LEDs from a single microcontroller. It's the backbone of
            countless DIY and commercial LED displays.
          </p>
        </div>
      </div>
    </div>
  </RegLayout>
);

export default RegShiftRegisters;
