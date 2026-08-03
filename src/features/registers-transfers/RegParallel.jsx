import React from "react";
import RegLayout from "./RegLayout";
import RegBox from "./components/RegBox";
import RegTable from "./components/RegTable";
import RegGrid from "./components/RegGrid";
import RegData from "./data/RegData";

const RegParallel = () => (
  <RegLayout
    title="Parallel Registers"
    subtitle="All bits are loaded and output simultaneously — the workhorse of buses, CPU register files, and I/O ports."
  >
    <div className="reg-content-body">
      <RegBox data={RegData.parallelRegisters.box} />

      <h2>Parallel Register Architecture</h2>
      <p>
        A parallel register consists of <em>n</em> D flip-flops whose clock lines are tied
        together. All D inputs accept external data; all Q outputs drive the register bus.
        A <strong>LOAD</strong> or <strong>clock-enable</strong> signal controls when the
        data is latched, preventing unwanted updates when the register should hold its value.
      </p>

      <RegTable data={RegData.parallelRegisters.table} />

      <h2>Tri-State Outputs &amp; Bus Sharing</h2>
      <p>
        When multiple registers share a common data bus, each register's outputs must be
        individually enabled via <strong>tri-state buffers</strong>. Only one register
        drives the bus at a time; all others present a high-impedance (Z) state, preventing
        bus contention.
      </p>

      <RegGrid data={RegData.parallelRegisters.grid} />

      <h2>Register Transfer Operations</h2>
      <p>
        Parallel registers are the subjects of <strong>register transfer operations</strong>
        described in RTL:
      </p>
      <ul>
        <li><code>R1 ← R2</code> — copy R2 to R1 in one clock cycle.</li>
        <li><code>R1 ← R1 XOR R2</code> — bitwise XOR, one cycle.</li>
        <li><code>R1 ← 0</code> — clear R1 (synchronous reset).</li>
      </ul>
    </div>
  </RegLayout>
);

export default RegParallel;
