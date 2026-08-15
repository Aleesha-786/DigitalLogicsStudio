import React from "react";
import RegLayout from "./RegLayout";
import RegBox from "./components/RegBox";
import RegTable from "./components/RegTable";
import RegGrid from "./components/RegGrid";
import RegData from "./data/RegData";

const RegSerialShift = () => (
  <RegLayout
    title="Serial Shift Registers"
    subtitle="Data enters and exits one bit at a time — minimal wiring overhead at the cost of multiple clock cycles per word."
  >
    <div className="reg-content-body">
      <RegBox data={RegData.serialShift.box} />

      <h2>Serial-In Serial-Out (SISO)</h2>
      <p>
        The simplest shift register configuration. The serial data stream enters at{" "}
        <code>D_in</code>; each clock moves every bit one position along the chain; the
        final bit exits at <code>Q_out</code>. For an <em>n</em>-bit register, the
        input-to-output delay is exactly <em>n</em> clock periods — making it a{" "}
        <strong>digital delay line</strong>.
      </p>

      <RegTable data={RegData.serialShift.table} />

      <h2>Linear Feedback Shift Registers (LFSR)</h2>
      <p>
        When the output (or XOR of certain taps) is fed back to the input, the register
        becomes an <strong>LFSR</strong>. Properly configured, an <em>n</em>-stage LFSR
        cycles through 2<sup>n</sup> − 1 unique states before repeating, producing a
        pseudo-random bit sequence used in cryptography, CRC generation, and built-in
        self-test (BIST).
      </p>

      <RegGrid data={RegData.serialShift.grid} />
    </div>
  </RegLayout>
);

export default RegSerialShift;
