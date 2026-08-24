import React from "react";

// Map search keywords to lazy-loaded route components. These paths mirror the lazy imports used in App.js.
// The map isn't exhaustive of every possible keyword; it uses a set of common keywords per route.
// Add or edit entries as needed for better matching.

export const SEARCH_PREVIEW_MAP = [
  // ─────────────────────────────────────────────────────────────────────
  // Boolean Algebra (dld-theory)
  // ─────────────────────────────────────────────────────────────────────
  {
    keywords: [
      "boolean algebra", "boolean overview", "boolean", "boolean algebra overview",
      "intro to boolean algebra", "digital logic algebra", "logic algebra basics",
    ],
    title: "Boolean Algebra Overview",
    route: "/boolean/overview",
    Component: React.lazy(() => import("../../features/dld-theory/boolean-algebra/BooleanAlgebraOverview")),
  },
  {
    keywords: [
      "boolean identities", "identities", "idempotent", "domination law",
      "complementarity", "boolean identity laws",
    ],
    title: "Boolean Identities",
    route: "/boolean/identities",
    Component: React.lazy(() => import("../../features/dld-theory/boolean-algebra/BooleanIdentities")),
  },
  {
    keywords: [
      "boolean laws", "laws", "commutative law", "associative law", "distributive law",
      "absorption law", "de morgan", "demorgan", "de morgan's theorem",
    ],
    title: "Boolean Laws",
    route: "/boolean/laws",
    Component: React.lazy(() => import("../../features/dld-theory/boolean-algebra/BooleanLaws")),
  },
  {
    keywords: [
      "complement", "boolean complement", "complementing expressions",
      "complement of a variable", "complement of a function",
    ],
    title: "Complement",
    route: "/boolean/complement",
    Component: React.lazy(() => import("../../features/dld-theory/boolean-algebra/ComplementPage")),
  },
  {
    keywords: [
      "duality", "duality principle", "dual of an expression", "boolean duality",
    ],
    title: "Duality Principle",
    route: "/boolean/duality",
    Component: React.lazy(() => import("../../features/dld-theory/boolean-algebra/DualityPrinciple")),
  },
  {
    keywords: [
      "consensus", "consensus theorem", "redundant terms", "eliminate redundant terms",
    ],
    title: "Consensus Theorem",
    route: "/boolean/consensus",
    Component: React.lazy(() => import("../../features/dld-theory/boolean-algebra/ConsensusTheorem")),
  },
  {
    keywords: [
      "minterms", "minterms page", "sum of products", "sop", "minterm expansion",
    ],
    title: "Minterms",
    route: "/boolean/minterms",
    Component: React.lazy(() => import("../../features/dld-theory/boolean-algebra/MintermsPage")),
  },
  {
    keywords: [
      "maxterms", "maxterms page", "product of sums", "pos", "maxterm expansion",
    ],
    title: "Maxterms",
    route: "/boolean/maxterms",
    Component: React.lazy(() => import("../../features/dld-theory/boolean-algebra/MaxtermsPage")),
  },
  {
    keywords: [
      "minterms and maxterms", "minterms maxterms relation", "minterm maxterm relation",
      "sop pos relation", "relation between minterms and maxterms",
    ],
    title: "Minterms & Maxterms Relation",
    route: "/boolean/minterms-maxterms",
    Component: React.lazy(() => import("../../features/dld-theory/boolean-algebra/MintermsMaxtermsRelation")),
  },
  {
    keywords: [
      "significant digits", "significant figures", "msd", "lsd",
      "most significant digit", "least significant digit",
    ],
    title: "Significant Digits",
    route: "/boolean/significant-digits",
    Component: React.lazy(() => import("../../features/dld-theory/boolean-algebra/SignificantDigits")),
  },
  {
    keywords: [
      "standard forms", "standard-forms", "canonical forms", "sop pos standard forms",
    ],
    title: "Standard Forms",
    route: "/standard-forms",
    Component: React.lazy(() => import("../../features/dld-theory/boolean-algebra/StandardForms")),
  },

  // ─────────────────────────────────────────────────────────────────────
  // Logic Gates (dld-theory)
  // ─────────────────────────────────────────────────────────────────────
  {
    keywords: [
      "circuit cost", "cost", "literal cost", "gate input cost", "implementation cost",
    ],
    title: "Circuit Cost",
    route: "/circuit-cost",
    Component: React.lazy(() => import("../../features/dld-theory/boolean-algebra/CircuitCost")),
  },
  {
    keywords: [
      "universal gates", "universal", "nand gate", "nor gate", "nand only", "nor only",
      "universal logic gates",
    ],
    title: "Universal Gates",
    route: "/universal-gates",
    Component: React.lazy(() => import("../../features/dld-theory/logic-gates/pages/UniversalGates")),
  },
  {
    keywords: [
      "gates", "logic gates", "and gate", "or gate", "not gate", "xor gate", "xnor gate",
      "gate explanations", "gate symbols", "gate truth tables",
    ],
    title: "Logic Gates",
    route: "/gates",
    Component: React.lazy(() => import("../../features/dld-theory/logic-gates/pages/GateExplanation")),
  },
  {
    keywords: [
      "odd function", "3-variable xor", "three variable xor", "parity function",
      "odd function logic gates",
    ],
    title: "Odd Function",
    route: "/odd-function",
    Component: React.lazy(() => import("../../features/dld-theory/logic-gates/pages/OddFunction")),
  },
  {
    keywords: ["timing diagrams", "timing"],
    title: "Timing Diagrams",
    route: "/timing-diagrams",
    Component: React.lazy(() => import("../../features/TimeDiagrams/TimeDiagrams")),
  },

  // ─────────────────────────────────────────────────────────────────────
  // Number Systems (dld-theory)
  // ─────────────────────────────────────────────────────────────────────
  {
    keywords: [
      "binary representation", "number systems", "number system", "how numbers are stored",
      "signed magnitude", "twos complement representation",
    ],
    title: "Binary Representation",
    route: "/number-systems/binary-representation",
    Component: React.lazy(() => import("../../features/dld-theory/number-systems/BinaryRepresentation")),
  },
  {
    keywords: [
      "number conversion", "number converter", "convert binary decimal hex octal",
      "base conversion", "number base converter",
    ],
    title: "Number Conversion",
    route: "/number-systems/number-conversion",
    Component: React.lazy(() => import("../../features/dld-theory/number-systems/NumberConversation")),
  },
  {
    keywords: [
      "bit extension", "sign extension", "zero extension", "extend bit width",
    ],
    title: "Bit Extension",
    route: "/number-systems/bit-extension",
    Component: React.lazy(() => import("../../features/dld-theory/number-systems/BitExtension")),
  },
  {
    keywords: [
      "bcd notation", "bcd", "binary coded decimal", "bcd encoding",
    ],
    title: "BCD Notation",
    route: "/number-systems/bcd-notation",
    Component: React.lazy(() => import("../../features/dld-theory/number-systems/BCDNotation")),
  },
  {
    keywords: [
      "ascii notation", "ascii", "ascii table", "character encoding", "7-bit ascii",
    ],
    title: "ASCII Notation",
    route: "/number-systems/ascii-notation",
    Component: React.lazy(() => import("../../features/dld-theory/number-systems/ASCIINotation")),
  },
  {
    keywords: [
      "bit converter", "byte converter", "storage unit converter", "bits bytes kb mb gb",
    ],
    title: "Bit Converter",
    route: "/number-systems/bit-converter",
    Component: React.lazy(() => import("../../features/dld-theory/number-systems/Bitconverter")),
  },
  {
    keywords: [
      "number system calculator", "calculator", "arithmetic across bases",
      "add subtract multiply divide binary hex",
    ],
    title: "Number System Calculator",
    route: "/number-systems/calculator",
    Component: React.lazy(() => import("../../features/dld-theory/number-systems/NumberSystemCalculator")),
  },

  // ─────────────────────────────────────────────────────────────────────
  // Karnaugh Map
  // ─────────────────────────────────────────────────────────────────────
  {
    keywords: ["kmap", "k-map", "k map", "karnaugh map", "boolean minimization"],
    title: "Karnaugh Map Generator",
    route: "/kmapgenerator",
    Component: React.lazy(() => import("../../features/kmap/KmapGenerator")),
  },

  // ─────────────────────────────────────────────────────────────────────
  // Arithmetic Functions & HDLs (dld-theory)
  // ─────────────────────────────────────────────────────────────────────
  {
    keywords: [
      "binary adders", "adders", "half adder", "full adder", "ripple carry adder",
      "carry look-ahead adder",
    ],
    title: "Binary Adders",
    route: "/arithmetic/binary-adders",
    Component: React.lazy(() => import("../../features/dld-theory/arithmetic-hdl/BinaryAdders")),
  },
  {
    keywords: [
      "binary subtractor", "subtractor", "borrow", "twos complement subtraction",
    ],
    title: "Binary Subtractor",
    route: "/arithmetic/binary-subtractor",
    Component: React.lazy(() => import("../../features/dld-theory/arithmetic-hdl/BinarySubtractor")),
  },
  {
    keywords: [
      "binary add subtractor", "adder subtractor", "combined adder subtractor",
      "add sub circuit",
    ],
    title: "Adder / Subtractor",
    route: "/arithmetic/binary-add-subtractor",
    Component: React.lazy(() => import("../../features/dld-theory/arithmetic-hdl/BinaryAddSubtractor")),
  },
  {
    keywords: [
      "binary multipliers", "multiplier", "shift and add multiplication", "partial products",
    ],
    title: "Binary Multipliers",
    route: "/arithmetic/binary-multipliers",
    Component: React.lazy(() => import("../../features/dld-theory/arithmetic-hdl/BinaryMultipliers")),
  },
  {
    keywords: [
      "code conversion", "binary to decimal", "binary to hex", "code converter",
    ],
    title: "Code Conversion",
    route: "/arithmetic/code-conversion",
    Component: React.lazy(() => import("../../features/dld-theory/arithmetic-hdl/CodeConversion")),
  },
  {
    keywords: [
      "magnitude comparator", "comparator", "greater than less than equal", "compare a b",
    ],
    title: "Magnitude Comparator",
    route: "/arithmetic/magnitude-comparator",
    Component: React.lazy(() => import("../../features/dld-theory/arithmetic-hdl/MagnitudeComparator")),
  },
  {
    keywords: [
      "parity generators", "parity generator", "even parity", "odd parity", "error detection",
    ],
    title: "Parity Generators",
    route: "/arithmetic/parity-generators",
    Component: React.lazy(() => import("../../features/dld-theory/arithmetic-hdl/ParityGenerators")),
  },
  {
    keywords: [
      "parity", "parity bit", "parity bit calculator", "compute parity bit",
    ],
    title: "Parity Bit Calculator",
    route: "/paritybitcalculator",
    Component: React.lazy(() => import("../../features/dld-theory/arithmetic-hdl/ParityBitCalculator")),
  },
  {
    keywords: [
      "complements", "1s complement", "2s complement", "ones complement", "twos complement",
      "signed arithmetic complements",
    ],
    title: "Complements",
    route: "/arithmetic/complements",
    Component: React.lazy(() => import("../../features/dld-theory/arithmetic-hdl/Complements")),
  },
  {
    keywords: [
      "signed unsigned", "signed and unsigned arithmetic", "interpreting bits",
      "signed numbers", "unsigned numbers",
    ],
    title: "Signed & Unsigned Arithmetic",
    route: "/arithmetic/signed-unsigned",
    Component: React.lazy(() => import("../../features/dld-theory/arithmetic-hdl/SignedUnsignedArithmetic")),
  },
  {
    keywords: [
      "design applications", "arithmetic design applications", "real digital systems",
      "applying arithmetic building blocks",
    ],
    title: "Design Applications",
    route: "/arithmetic/design-applications",
    Component: React.lazy(() => import("../../features/dld-theory/arithmetic-hdl/DesignApplications")),
  },

  // ─────────────────────────────────────────────────────────────────────
  // Combinational Circuits (dld-theory)
  // ─────────────────────────────────────────────────────────────────────
  {
    keywords: [
      "encoder", "priority encoder", "encoder circuit", "binary encoder",
    ],
    title: "Encoder",
    route: "/encoder",
    Component: React.lazy(() => import("../../features/dld-theory/combinational-circuits/encoder-decoder/encoder/EncoderPage")),
  },
  {
    keywords: [
      "decoder", "binary decoder", "one-hot decoder", "decoder circuit",
    ],
    title: "Decoder",
    route: "/decoder",
    Component: React.lazy(() => import("../../features/dld-theory/combinational-circuits/encoder-decoder/decoder/DecoderPage")),
  },
  {
    keywords: [
      "mux", "multiplexer", "mux circuit", "data selector",
    ],
    title: "Multiplexer",
    route: "/mux",
    Component: React.lazy(() => import("../../features/dld-theory/combinational-circuits/mux-demux/mux/MuxPage")),
  },
  {
    keywords: [
      "demux", "demultiplexer", "demux circuit", "signal distributor",
    ],
    title: "Demultiplexer",
    route: "/demux",
    Component: React.lazy(() => import("../../features/dld-theory/combinational-circuits/mux-demux/demux/DemuxPage")),
  },

  // ─────────────────────────────────────────────────────────────────────
  // Sequential Circuits (dld-theory)
  // ─────────────────────────────────────────────────────────────────────
  {
    keywords: [
      "sequential", "sequential circuits", "sequential circuits intro", "memory in circuits",
    ],
    title: "Sequential Circuits Intro",
    route: "/sequential/intro",
    Component: React.lazy(() => import("../../features/dld-theory/sequential-circuits/SeqIntro")),
  },
  {
    keywords: [
      "latches", "sr latch", "gated latch", "state holding elements",
    ],
    title: "Latches",
    route: "/sequential/latches",
    Component: React.lazy(() => import("../../features/dld-theory/sequential-circuits/SeqLatches")),
  },
  {
    keywords: [
      "flip-flops", "flip flop", "ff", "edge-triggered memory", "flip flop timing",
    ],
    title: "Flip-Flops",
    route: "/sequential/flip-flops",
    Component: React.lazy(() => import("../../features/dld-theory/sequential-circuits/SeqFlipFlops")),
  },
  {
    keywords: [
      "flip-flop types", "sr flip flop", "jk flip flop", "d flip flop", "t flip flop",
      "compare flip flops",
    ],
    title: "Flip-Flop Types",
    route: "/sequential/flip-flop-types",
    Component: React.lazy(() => import("../../features/dld-theory/sequential-circuits/SeqFlipFlopTypes")),
  },
  {
    keywords: [
      "sequential analysis", "state behavior", "excitation table", "state transitions",
    ],
    title: "Sequential Analysis",
    route: "/sequential/analysis",
    Component: React.lazy(() => import("../../features/dld-theory/sequential-circuits/SeqAnalysis")),
  },
  {
    keywords: [
      "design procedures", "sequential design procedures", "designing sequential systems",
    ],
    title: "Design Procedures",
    route: "/sequential/design-procedures",
    Component: React.lazy(() => import("../../features/dld-theory/sequential-circuits/SeqDesignProcedures")),
  },
  {
    keywords: [
      "state diagram", "state diagrams", "sequential state diagram", "state table",
    ],
    title: "State Diagrams",
    route: "/sequential/state-diagram",
    Component: React.lazy(() => import("../../features/dld-theory/sequential-circuits/SeqStateDiagram")),
  },
  {
    keywords: [
      "state reduction", "minimize states", "state minimization", "excitation requirements",
    ],
    title: "State Reduction",
    route: "/sequential/state-reduction",
    Component: React.lazy(() => import("../../features/dld-theory/sequential-circuits/SeqStateReduction")),
  },

  // ─────────────────────────────────────────────────────────────────────
  // Registers & Register Transfers (dld-theory)
  // ─────────────────────────────────────────────────────────────────────
  {
    keywords: [
      "registers", "counters", "shift register", "registers intro", "register fundamentals",
    ],
    title: "Registers & Transfers",
    route: "/registers/intro",
    Component: React.lazy(() => import("../../features/dld-theory/registers-transfers/RegIntro")),
  },
  {
    keywords: [
      "counters", "counting circuits", "binary counters", "counter sequences",
    ],
    title: "Counters",
    route: "/registers/counters",
    Component: React.lazy(() => import("../../features/dld-theory/registers-transfers/RegCounters")),
  },
  {
    keywords: [
      "synchronous asynchronous", "sync async", "clocked vs unclocked", "async transitions",
    ],
    title: "Synchronous / Asynchronous",
    route: "/registers/sync-async",
    Component: React.lazy(() => import("../../features/dld-theory/registers-transfers/RegSyncAsync")),
  },
  {
    keywords: [
      "shift registers", "shift register", "serial parallel shift", "bit shifting",
    ],
    title: "Shift Registers",
    route: "/registers/shift-registers",
    Component: React.lazy(() => import("../../features/dld-theory/registers-transfers/RegShiftRegisters")),
  },
  {
    keywords: [
      "serial shift registers", "serial loading", "serial shift", "sisi siso",
    ],
    title: "Serial Shift Registers",
    route: "/registers/serial-shift",
    Component: React.lazy(() => import("../../features/dld-theory/registers-transfers/RegSerialShift")),
  },
  {
    keywords: [
      "loading registers", "register loading", "load enable", "clean data entry",
    ],
    title: "Loading Registers",
    route: "/registers/loading",
    Component: React.lazy(() => import("../../features/dld-theory/registers-transfers/RegLoading")),
  },
  {
    keywords: [
      "parallel registers", "parallel transfer", "parallel load", "wide data movement",
    ],
    title: "Parallel Registers",
    route: "/registers/parallel",
    Component: React.lazy(() => import("../../features/dld-theory/registers-transfers/RegParallel")),
  },
  {
    keywords: [
      "ripple counters", "asynchronous counters", "ripple counter propagation delay",
    ],
    title: "Ripple Counters",
    route: "/registers/ripple-counters",
    Component: React.lazy(() => import("../../features/dld-theory/registers-transfers/RegRippleCounters")),
  },
  {
    keywords: [
      "synchronous binary counters", "sync binary counters", "clocked counter design",
    ],
    title: "Synchronous Binary Counters",
    route: "/registers/sync-binary-counters",
    Component: React.lazy(() => import("../../features/dld-theory/registers-transfers/RegSyncBinaryCounters")),
  },

  // ─────────────────────────────────────────────────────────────────────
  // Memory (dld-theory)
  // ─────────────────────────────────────────────────────────────────────
  {
    keywords: [
      "memory", "ram", "rom", "memory basics", "volatile non-volatile memory",
      "bits bytes address spaces",
    ],
    title: "Memory Basics",
    route: "/memory/basics",
    Component: React.lazy(() => import("../../features/dld-theory/memory/MemoryBasics")),
  },
  {
    keywords: [
      "read-only memories", "rom types", "mask rom", "prom", "eprom", "eeprom", "flash memory",
    ],
    title: "Read-Only Memories",
    route: "/memory/read-only-memories",
    Component: React.lazy(() => import("../../features/dld-theory/memory/ReadOnlyMemories")),
  },
  {
    keywords: [
      "programmable logic array", "pla", "and-or programmable plane", "combinational logic array",
    ],
    title: "Programmable Logic Array",
    route: "/memory/programmable-logic-array",
    Component: React.lazy(() => import("../../features/dld-theory/memory/ProgrammableLogicArray")),
  },
  {
    keywords: [
      "random access memory", "ram basics", "read write memory", "ram access cycles",
    ],
    title: "Random Access Memory",
    route: "/memory/random-access-memory",
    Component: React.lazy(() => import("../../features/dld-theory/memory/RandomAccessMemory")),
  },
  {
    keywords: [
      "static dynamic ram", "sram", "dram", "capacitor storage", "flip-flop storage", "ram refresh",
    ],
    title: "Static & Dynamic RAM",
    route: "/memory/static-dynamic-ram",
    Component: React.lazy(() => import("../../features/dld-theory/memory/StaticDynamicRAM")),
  },
  {
    keywords: [
      "array of ram ics", "ram arrays", "word length expansion", "address expansion",
    ],
    title: "Array of RAM ICs",
    route: "/memory/array-of-ram-ics",
    Component: React.lazy(() => import("../../features/dld-theory/memory/ArrayOfRAMICs")),
  },
  {
    keywords: [
      "memory construction", "build memory from ram ics", "memory construction ram",
      "decoders and buses",
    ],
    title: "Memory Construction",
    route: "/memory/memory-construction-ram",
    Component: React.lazy(() => import("../../features/dld-theory/memory/MemoryConstructionRAM")),
  },

  // ─────────────────────────────────────────────────────────────────────
  // COAL (Computer Organization & Assembly Language)
  // ─────────────────────────────────────────────────────────────────────
  {
    keywords: [
      "coal", "resources coal", "computer organization", "assembly language",
      "computer organization and assembly language", "coal home", "coal resources",
    ],
    title: "COAL Resources",
    route: "/resources/coal",
    Component: React.lazy(() => import("../../features/coal/CoalHomeRoute")),
  },
  {
    keywords: [
      "coal theory", "coal course path", "coal modules", "coal parts", "coal lessons",
      "computer organization theory", "assembly language theory",
    ],
    title: "COAL Theory",
    route: "/resources/coal/theory",
    Component: React.lazy(() => import("../../features/coal/CoalTheoryPage")),
  },
  {
    keywords: [
      "coal practical", "coal labs", "coal simulators", "coal exercises",
      "hands-on coal", "assembly practicals",
    ],
    title: "COAL Practical Labs",
    route: "/resources/coal/practical",
    Component: React.lazy(() => import("../../features/coal/CoalPracticalPage")),
  },
  {
    keywords: [
      "instruction trace lab", "fetch decode execute", "trace instructions",
      "step through program", "cpu explorer",
    ],
    title: "Instruction Trace Lab",
    route: "/resources/coal/practical/instruction-trace-lab",
    Component: React.lazy(() => import("../../features/coal/practical-playgrounds/InstructionTraceLabPage")),
  },
  {
    keywords: [
      "alu flags simulator", "alu", "flags register", "zf cf of sf",
      "zero flag carry flag overflow flag sign flag",
    ],
    title: "ALU & Flags Simulator",
    route: "/resources/coal/practical/alu-flags-simulator",
    Component: React.lazy(() => import("../../features/coal/practical-playgrounds/AluFlagsSimulatorPage")),
  },
  {
    keywords: [
      "stack memory simulator", "stack simulator", "push pop call ret", "stack diagrams",
    ],
    title: "Stack & Memory Simulator",
    route: "/resources/coal/practical/stack-memory-simulator",
    Component: React.lazy(() => import("../../features/coal/practical-playgrounds/StackMemorySimulatorPage")),
  },
  {
    keywords: [
      "assembly drills", "masm", "assembly programs", "guided assembly exercises",
    ],
    title: "Assembly Drills",
    route: "/resources/coal/practical/assembly-drills",
    Component: React.lazy(() => import("../../features/coal/practical-playgrounds/AssemblyDrillsPage")),
  },
  {
    keywords: [
      "addressing mode playground", "addressing modes", "effective address calculation",
      "x86 addressing modes",
    ],
    title: "Addressing Mode Playground",
    route: "/resources/coal/practical/addressing-mode-playground",
    Component: React.lazy(() => import("../../features/coal/practical-playgrounds/AddressingModePlaygroundPage")),
  },
  {
    keywords: [
      "instruction laboratory", "x86 instructions", "instruction database",
      "live execution sandbox", "x86 architecture reference",
    ],
    title: "Instruction Laboratory",
    route: "/resources/coal/practical/instruction-laboratory",
    Component: React.lazy(() => import("../../features/coal/practical-playgrounds/InstructionLaboratoryPage")),
  },

  // ─────────────────────────────────────────────────────────────────────
  // Tools
  // ─────────────────────────────────────────────────────────────────────
  {
    keywords: ["boolforge", "boolforge tool", "logic circuit builder", "gate simulator"],
    title: "Boolforge",
    route: "/boolforge",
    Component: React.lazy(() => import("../../features/boolforge/Boolforge")),
  },
  // Add more entries as needed; this list follows the routes defined in App.js
];

export default SEARCH_PREVIEW_MAP;
