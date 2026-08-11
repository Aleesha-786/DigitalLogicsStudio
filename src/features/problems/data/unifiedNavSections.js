import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  Flame,
  FolderHeart,
  GraduationCap,
  LibraryBig,
  Lock,
  Search,
  Sparkles,
  Trophy,
  Cpu,
  Grid,
  Binary,
  Layers,
  Tv,
  Activity,
  Coins,
  Calculator,
  Info,
  Award,
} from "lucide-react";

const unifiedNavSections = [
  {
    title: "Practice Arenas",
    items: [
      {
        label: "Problems Library",
        icon: LibraryBig,
        panel: {
          description:
            "All problems — DLD and COAL together. Combinational, sequential, number systems, assembly, cache and more.",
          links: [
            { label: "All Problems", action: "navigate", value: "/problems" },
            { label: "Easy problems", action: "filter", value: "Easy" },
            { label: "Medium problems", action: "filter", value: "Medium" },
            { label: "Hard problems", action: "filter", value: "Hard" },
            { label: "Combinational (DLD)", action: "topic", value: "Combinational Circuits" },
            { label: "Sequential (DLD)", action: "topic", value: "Sequential Circuits" },
            { label: "Assembly (COAL)", action: "topic", value: "Assembly Programming" },
            { label: "Cache & Memory (COAL)", action: "topic", value: "Cache & Memory" },
          ],
        },
      },
      {
        label: "K-Map Arena",
        icon: Layers,
        topicSlug: "k-map",
        badge: "Core",
        panel: {
          description: "Karnaugh map simplification — SOP, POS, don't-cares, 2 to 4 variables.",
          links: [
            { label: "K-Map Problems", action: "navigate", value: "/problems/k-map" },
            { label: "K-Map Simplifier Tool", action: "navigate", value: "/kmapgenerator" },
            { label: "Minterms Tutorial", action: "navigate", value: "/boolean/minterms" },
            { label: "Maxterms Tutorial", action: "navigate", value: "/boolean/maxterms" },
            { label: "Boolean Laws", action: "navigate", value: "/boolean/laws" },
          ],
        },
      },
      {
        label: "Sequential Arena",
        icon: Sparkles,
        topicSlug: "sequential-circuits",
        panel: {
          description: "Latches, flip-flops, state diagrams and sequential circuit design.",
          links: [
            { label: "Sequential Problems", action: "navigate", value: "/problems/sequential-circuits" },
            { label: "Latches", action: "navigate", value: "/sequential/latches" },
            { label: "Flip-Flops", action: "navigate", value: "/sequential/flip-flops" },
            { label: "State Diagrams", action: "navigate", value: "/sequential/state-diagram" },
            { label: "Timing Diagrams", action: "navigate", value: "/timing-diagrams" },
          ],
        },
      },
      {
        label: "Number Arena",
        icon: Binary,
        topicSlug: "number-systems",
        panel: {
          description: "Binary, hex, BCD, 2's complement, signed arithmetic and base conversions.",
          links: [
            { label: "Number Problems", action: "navigate", value: "/problems/number-systems" },
            { label: "Base Converter", action: "navigate", value: "/number-systems/number-conversion" },
            { label: "Binary Visualizer", action: "navigate", value: "/number-systems/binary-representation" },
            { label: "BCD Notation", action: "navigate", value: "/number-systems/bcd-notation" },
            { label: "2's Complement", action: "navigate", value: "/arithmetic/complements" },
          ],
        },
      },
      {
        label: "Assembly Lab",
        icon: Cpu,
        topicSlug: "assembly",
        badge: "Interactive",
        panel: {
          description:
            "Step-by-step assembly instruction execution and register visualization.",
          links: [
            { label: "Trace Simulator", action: "navigate", value: "/resources/coal/practical/instruction-trace-lab" },
            { label: "Assembly Syntax", action: "navigate", value: "/coal/coal-syntax" },
            { label: "Stack & Procedures", action: "navigate", value: "/coal/procedures-stack" },
          ],
        },
      },
    ],
  },
  {
    title: "Interactive Labs",
    items: [
      { label: "Circuit Forge", icon: Cpu, path: "/boolforge" },
      { label: "K-Map Studio", icon: Grid, path: "/kmapgenerator" },
      {
        label: "DLD Trainer Board",
        icon: Tv,
        path: "/trainer-board",
        badge: "Live",
      },
      { label: "Timing Diagrams", icon: Activity, path: "/timing-diagrams" },
    ],
  },
  {
    title: "Design Utilities",
    items: [
      { label: "Circuit Cost Calc", icon: Coins, path: "/circuit-cost" },
      {
        label: "Parity Calculator",
        icon: Calculator,
        path: "/paritybitcalculator",
      },
      {
        label: "Universal Gates Lab",
        icon: FolderHeart,
        path: "/universal-gates",
      },
      { label: "Standard Forms", icon: GraduationCap, path: "/standard-forms" },
    ],
  },
  {
    title: "Arithmetic Circuits",
    items: [
      {
        label: "Adders & Subtractors",
        icon: Cpu,
        path: "/arithmetic/binary-add-subtractor",
      },
      {
        label: "Binary Multipliers",
        icon: Cpu,
        path: "/arithmetic/binary-multipliers",
      },
      {
        label: "Magnitude Comparators",
        icon: Cpu,
        path: "/arithmetic/magnitude-comparator",
      },
      {
        label: "Signed Numbers",
        icon: Binary,
        path: "/arithmetic/signed-unsigned",
      },
    ],
  },
  {
    title: "Combinational Logic",
    items: [
      { label: "Encoder Studio", icon: Layers, path: "/encoder" },
      { label: "Decoder Studio", icon: Layers, path: "/decoder" },
      { label: "Multiplexers (MUX)", icon: Grid, path: "/mux" },
      { label: "Demultiplexers (DEMUX)", icon: Grid, path: "/demux" },
    ],
  },
  {
    title: "Sequential & Storage",
    items: [
      {
        label: "Latches & Flip-Flops",
        icon: Sparkles,
        path: "/sequential/flip-flops",
      },
      {
        label: "Registers & Loading",
        icon: Layers,
        path: "/registers/shift-registers",
      },
      {
        label: "Ripple Counters",
        icon: Binary,
        path: "/registers/ripple-counters",
      },
      { label: "State Analysis", icon: Compass, path: "/sequential/analysis" },
    ],
  },
  {
    title: "Memory Systems",
    items: [
      { label: "Memory Basics", icon: BookOpen, path: "/memory/basics" },
      {
        label: "Programmable PLA",
        icon: Cpu,
        path: "/memory/programmable-logic-array",
      },
      {
        label: "Random Access Memory",
        icon: Lock,
        path: "/memory/random-access-memory",
      },
    ],
  },
  {
    title: "Learning & Reference",
    items: [
      { label: "Chapter Solvers", icon: BookOpen, path: "/book" },
      { label: "Logic Gate Guide", icon: Info, path: "/gates" },
      {
        label: "Boolean Identities",
        icon: GraduationCap,
        path: "/boolean/identities",
      },
      { label: "Boolean Laws", icon: BookOpen, path: "/boolean/laws" },
    ],
  },
  {
    title: "COAL Syllabus Parts",
    items: [
      { label: "Part 1: Foundations", icon: Info, actionGroup: "Foundations" },
      { label: "Part 2: Number Systems", icon: Binary, actionGroup: "Number Systems" },
      { label: "Part 3: ISA & Registers", icon: Award, actionGroup: "ISA & Registers" },
      { label: "Part 4: Assembly Coding", icon: Cpu, actionGroup: "Assembly Programming" },
      { label: "Part 5: Cache & Memory", icon: Grid, actionGroup: "Cache & Memory" },
      { label: "Part 6: I/O & Interrupts", icon: Activity, actionGroup: "I/O & Interrupts" },
    ],
  },
];

export default unifiedNavSections;
