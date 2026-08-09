// ============================================================
// RegData.js  –  All data for the Registers & Transfers section
// ============================================================

const RegData = {

  // ── Registers (Intro) ──────────────────────────────────────
  registers: {
    box: {
      icon: "🗂️",
      title: "What is a Register?",
      description:
        "A register is a group of flip-flops that stores a multi-bit binary word. An n-bit register contains n flip-flops and can hold any binary value from 0 to 2ⁿ − 1.",
      variant: "primary",
    },
    table: {
      title: "Register vs Memory",
      headers: ["Feature", "Register", "Memory (RAM)"],
      rows: [
        ["Location",   "Inside the CPU / chip",  "External to CPU"],
        ["Speed",      "Fastest",                 "Slower"],
        ["Capacity",   "Few bits – a few KB",     "Gigabytes"],
        ["Access",     "Direct (wire)",            "Address bus"],
        ["Volatility", "Volatile",                 "Volatile (DRAM)"],
      ],
    },
    grid: {
      title: "Types of Registers",
      items: [
        { icon: "📥", label: "Storage Register",   description: "Holds a binary word temporarily." },
        { icon: "➡️", label: "Shift Register",      description: "Shifts bits left or right each clock." },
        { icon: "🔢", label: "Counter Register",    description: "Increments or decrements its stored value." },
        { icon: "⟺",  label: "Buffer Register",    description: "Bridges speed differences between components." },
      ],
    },
  },

  // ── Counters ───────────────────────────────────────────────
  counters: {
    box: {
      icon: "🔢",
      title: "Counters",
      description:
        "A counter is a register whose contents advance through a predefined sequence of states upon each clock pulse. Counters are fundamental to timing, sequencing, and frequency division.",
      variant: "primary",
    },
    table: {
      title: "Counter Classification",
      headers: ["Property", "Synchronous", "Asynchronous"],
      rows: [
        ["Clock", "Single shared clock", "Ripple (cascaded)"],
        ["Speed", "Fast",               "Limited by propagation"],
        ["Power", "Higher",             "Lower"],
        ["Design complexity", "Moderate", "Simple"],
      ],
    },
    grid: {
      title: "Common Counter Types",
      items: [
        { icon: "⬆️", label: "Up Counter",         description: "Counts 0 → 1 → 2 → … → 2ⁿ−1 → 0" },
        { icon: "⬇️", label: "Down Counter",        description: "Counts 2ⁿ−1 → … → 1 → 0 → 2ⁿ−1" },
        { icon: "↕️", label: "Up/Down Counter",     description: "Direction controlled by a mode input." },
        { icon: "🔄", label: "Modulo-N Counter",    description: "Resets after N states (e.g. mod-10 BCD)." },
        { icon: "💍", label: "Ring Counter",        description: "Circulates a single 1 through n flip-flops." },
        { icon: "🐍", label: "Johnson Counter",     description: "Twisted ring — 2n unique states for n bits." },
      ],
    },
  },

  // ── Synchronous / Asynchronous ─────────────────────────────
  syncAsync: {
    box: {
      icon: "⏱️",
      title: "Synchronous vs Asynchronous",
      description:
        "The key distinction is whether every flip-flop shares the same clock signal (synchronous) or each flip-flop is triggered by the output of the previous one (asynchronous / ripple).",
      variant: "info",
    },
    table: {
      title: "Side-by-Side Comparison",
      headers: ["Criterion", "Synchronous", "Asynchronous"],
      rows: [
        ["Clock source",    "Global shared clock",     "Ripple from previous FF"],
        ["Propagation delay","Fixed (one clock period)","Accumulates per stage"],
        ["Hazards",         "Fewer glitches",          "Prone to glitches"],
        ["Design",          "Easier to analyse",       "Harder to verify"],
        ["Power",           "Higher (all FF switch)",  "Lower (fewer transitions)"],
        ["Example",         "74HC163",                 "74HC93"],
      ],
    },
    grid: {
      title: "Key Concepts",
      items: [
        { icon: "📐", label: "Setup Time",    description: "Data must be stable before the clock edge." },
        { icon: "📏", label: "Hold Time",     description: "Data must stay stable after the clock edge." },
        { icon: "⚡", label: "Propagation Δ", description: "Delay from clock edge to stable Q output." },
        { icon: "🔒", label: "Clock Skew",   description: "Difference in clock arrival times across FFs." },
      ],
    },
  },

  // ── Shift Registers ────────────────────────────────────────
  shiftRegisters: {
    box: {
      icon: "➡️",
      title: "Shift Registers",
      description:
        "A shift register moves (shifts) its stored bit pattern one position left or right on every clock pulse. They are used in serial-to-parallel conversion, delay lines, and pseudo-random number generation.",
      variant: "primary",
    },
    table: {
      title: "Shift Register Modes",
      headers: ["Mode", "Input", "Output", "Use Case"],
      rows: [
        ["SISO", "Serial", "Serial",   "Delay line"],
        ["SIPO", "Serial", "Parallel", "Serial → parallel conversion"],
        ["PISO", "Parallel","Serial",  "Parallel → serial conversion"],
        ["PIPO", "Parallel","Parallel","Buffer / temporary store"],
      ],
    },
    grid: {
      title: "Applications",
      items: [
        { icon: "🔌", label: "Serial Communication", description: "UART, SPI, I²C data framing." },
        { icon: "⏳", label: "Delay Line",            description: "Delays a signal by n clock cycles." },
        { icon: "🎲", label: "PRNG",                  description: "LFSR generates pseudo-random sequences." },
        { icon: "🖥️", label: "Display Drivers",      description: "Drives LED/LCD columns serially." },
      ],
    },
  },

  // ── Serial Shift Registers ─────────────────────────────────
  serialShift: {
    box: {
      icon: "📡",
      title: "Serial Shift Registers",
      description:
        "In serial operation, data enters and/or leaves one bit at a time. A 4-bit SISO register takes 4 clock pulses to fully load or unload data.",
      variant: "warning",
    },
    table: {
      title: "SISO Timing Example (4-bit, data = 1011)",
      headers: ["Clock", "D_in", "Q3", "Q2", "Q1", "Q0 (out)"],
      rows: [
        ["0 (init)", "–", "0","0","0","0"],
        ["1",        "1", "1","0","0","0"],
        ["2",        "0", "0","1","0","0"],
        ["3",        "1", "1","0","1","0"],
        ["4",        "1", "1","1","0","1"],
      ],
    },
    grid: {
      title: "Serial Shift Register Variants",
      items: [
        { icon: "➡️", label: "SISO",  description: "Serial In, Serial Out — simplest form." },
        { icon: "📤", label: "SIPO",  description: "Serial In, Parallel Out — deserialiser." },
        { icon: "🔁", label: "LFSR",  description: "Linear Feedback Shift Register for PRNG." },
        { icon: "💍", label: "Ring",  description: "Output fed back to input — circulation." },
      ],
    },
  },

  // ── Loading Registers ──────────────────────────────────────
  loadingRegisters: {
    box: {
      icon: "📥",
      title: "Loading Registers",
      description:
        "Loading is the process of writing a new value into a register. It can occur serially (one bit per clock) or in parallel (all bits simultaneously on one clock edge).",
      variant: "success",
    },
    table: {
      title: "Serial vs Parallel Load",
      headers: ["Property", "Serial Load", "Parallel Load"],
      rows: [
        ["Clocks needed", "n (for n-bit)", "1"],
        ["Pin count",     "Low (1 data pin)", "High (n data pins)"],
        ["Speed",         "Slower",         "Fast"],
        ["Example IC",   "74HC164",         "74HC374"],
      ],
    },
    grid: {
      title: "Load Control Signals",
      items: [
        { icon: "🔓", label: "LOAD / LD",   description: "Asserted to latch parallel data on clock edge." },
        { icon: "🔒", label: "ENABLE / EN", description: "Gates the clock to prevent unwanted loads." },
        { icon: "♻️", label: "CLR / RESET", description: "Asynchronously clears all bits to 0." },
        { icon: "📋", label: "Preset",       description: "Asynchronously sets all bits to 1." },
      ],
    },
  },

  // ── Parallel Registers ─────────────────────────────────────
  parallelRegisters: {
    box: {
      icon: "⟺",
      title: "Parallel Registers",
      description:
        "A parallel register loads or outputs all n bits simultaneously on a single clock edge. They are the building block of CPU registers, buses, and latched I/O ports.",
      variant: "primary",
    },
    table: {
      title: "Common 8-bit Parallel Register ICs",
      headers: ["IC", "Type", "Outputs", "Notable Feature"],
      rows: [
        ["74HC374", "D-FF",  "Tri-state", "Output enable pin"],
        ["74HC273", "D-FF",  "Totem-pole","Master reset"],
        ["74HC573", "D-Latch","Tri-state","Transparent latch"],
        ["74HC377", "D-FF",  "Totem-pole","Clock enable"],
      ],
    },
    grid: {
      title: "Parallel Register Operations",
      items: [
        { icon: "📥", label: "Parallel Load",   description: "n bits written simultaneously." },
        { icon: "📤", label: "Parallel Read",   description: "n bits output at once to a bus." },
        { icon: "🔌", label: "Bus Interface",   description: "Tri-state outputs for shared buses." },
        { icon: "🔄", label: "Register Transfer",description: "RTL: R2 ← R1 on one clock." },
      ],
    },
  },

  // ── Ripple Counters ────────────────────────────────────────
  rippleCounters: {
    box: {
      icon: "🌊",
      title: "Ripple Counters",
      description:
        "In a ripple (asynchronous) counter, the output of each flip-flop clocks the next. The clock signal 'ripples' through the chain, causing cumulative propagation delay.",
      variant: "warning",
    },
    table: {
      title: "4-bit Ripple Counter State Sequence",
      headers: ["Clock", "Q3", "Q2", "Q1", "Q0", "Decimal"],
      rows: [
        ["0","0","0","0","0","0"],
        ["1","0","0","0","1","1"],
        ["2","0","0","1","0","2"],
        ["3","0","0","1","1","3"],
        ["4","0","1","0","0","4"],
        ["8","1","0","0","0","8"],
        ["15","1","1","1","1","15"],
        ["16","0","0","0","0","0 (overflow)"],
      ],
    },
    grid: {
      title: "Ripple Counter Characteristics",
      items: [
        { icon: "⚠️", label: "Propagation Delay", description: "Total delay = n × t_FF for n-bit counter." },
        { icon: "👻", label: "Glitches",           description: "Intermediate states appear briefly." },
        { icon: "⚡", label: "Low Power",          description: "Fewer simultaneous transitions vs sync." },
        { icon: "🔧", label: "IC: 74HC93",         description: "Classic 4-bit asynchronous binary counter." },
      ],
    },
  },

  // ── Synchronous Binary Counters ────────────────────────────
  syncBinaryCounters: {
    box: {
      icon: "⚙️",
      title: "Synchronous Binary Counters",
      description:
        "All flip-flops share the same clock. Carry logic ensures each FF toggles at exactly the right moment, eliminating ripple delay and glitch states.",
      variant: "success",
    },
    table: {
      title: "Toggle Conditions (4-bit sync counter)",
      headers: ["Flip-Flop", "Toggles When"],
      rows: [
        ["Q0 (LSB)", "Every clock"],
        ["Q1",       "Q0 = 1"],
        ["Q2",       "Q0 · Q1 = 1"],
        ["Q3 (MSB)", "Q0 · Q1 · Q2 = 1"],
      ],
    },
    grid: {
      title: "Common Synchronous Counter ICs",
      items: [
        { icon: "🔧", label: "74HC163", description: "4-bit sync binary counter, synchronous clear." },
        { icon: "🔧", label: "74HC161", description: "4-bit sync binary counter, asynchronous clear." },
        { icon: "🔧", label: "74HC169", description: "4-bit up/down sync counter." },
        { icon: "📐", label: "Cascading", description: "RCO / TC output links counters for wider range." },
      ],
    },
  },

};

export default RegData;
