import React from "react";
import RegLayout from "./RegLayout";
import RegBox from "./components/RegBox";
import RegTable from "./components/RegTable";
import RegGrid from "./components/RegGrid";
import RegData from "./data/RegData";

const RegCounters = () => (
  <RegLayout
    title="Counters"
    subtitle="Registers that cycle through a defined sequence of states on each clock pulse — essential for timing, sequencing, and frequency division."
  >
    <div className="reg-content-body">
      <RegBox data={RegData.counters.box} />

      <h2>How Counters Work</h2>
      <p>
        A counter is a register whose next state is determined solely by its current state —
        no external data input is needed. The flip-flops are wired so that their collective
        output advances through a predetermined binary (or non-binary) sequence every time
        the clock edge arrives.
      </p>

      <RegTable data={RegData.counters.table} />

      <h2>Counter Types</h2>
      <RegGrid data={RegData.counters.grid} />

      <h2>Modulus and Frequency Division</h2>
      <p>
        A counter with <em>n</em> flip-flops has a natural modulus of 2<sup>n</sup>. By
        adding feedback logic or a reset condition, any modulus <em>M</em> (where
        M ≤ 2<sup>n</sup>) can be realised. Because the MSB output divides the input
        clock by M, counters are widely used as <strong>frequency dividers</strong> in
        clock generation circuits.
      </p>
    </div>
  </RegLayout>
);

export default RegCounters;
