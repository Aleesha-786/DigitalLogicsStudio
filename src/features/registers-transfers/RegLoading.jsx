import React from "react";
import RegLayout from "./RegLayout";
import RegBox from "./components/RegBox";
import RegTable from "./components/RegTable";
import RegGrid from "./components/RegGrid";
import RegData from "./data/RegData";

const RegLoading = () => (
  <RegLayout
    title="Loading Registers"
    subtitle="How data is written into a register — serially over multiple clocks, or in parallel in a single clock cycle."
  >
    <div className="reg-content-body">
      <RegBox data={RegData.loadingRegisters.box} />

      <h2>Serial Loading</h2>
      <p>
        Serial loading shifts new data in one bit per clock. For an <em>n</em>-bit register,
        loading takes <em>n</em> clock cycles. The advantage is minimal pin count — only one
        data input is needed regardless of word width. This is used in SPI/I²C peripherals
        and display drivers.
      </p>

      <h2>Parallel Loading</h2>
      <p>
        Parallel loading presents all <em>n</em> bits simultaneously to the D inputs of the
        flip-flops. On the active clock edge (when <code>LOAD</code> is asserted), the
        entire word is captured in a single cycle. This is the standard approach for CPU
        registers, ALU operand latching, and high-speed data capture.
      </p>

      <RegTable data={RegData.loadingRegisters.table} />

      <h2>Control Signals</h2>
      <RegGrid data={RegData.loadingRegisters.grid} />

      <h2>Clock Enable vs Gated Clock</h2>
      <p>
        Modern FPGAs and ASICs prefer a <strong>clock enable (CE)</strong> input rather than
        gating the clock directly. Clock gating introduces skew and glitch risks; a CE pin
        achieved inside the flip-flop is both cleaner and more power-efficient.
      </p>
    </div>
  </RegLayout>
);

export default RegLoading;
