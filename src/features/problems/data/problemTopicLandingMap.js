const problemTopicLandingMap = {
  "boolean-algebra": {
    group: "Boolean Algebra",
    title: "Boolean Algebra Problems",
    description:
      "Practice identities, laws, consensus, SOP, POS, minterms, and maxterms with exam-oriented Boolean algebra questions.",
    links: [
      { to: "/boolean/overview", label: "Boolean algebra tutorial" },
      { to: "/boolean/minterms-maxterms", label: "Minterms and maxterms" },
      { to: "/standard-forms", label: "SOP and POS guide" },
    ],
  },
  "k-map": {
    group: "K-Map",
    title: "K-Map Problems",
    description:
      "Train on Karnaugh map grouping, SOP/POS simplification, don't-care conditions, and expression minimization with guided K-map practice.",
    links: [
      { to: "/kmapgenerator", label: "K-Map simplifier tool" },
      { to: "/boolean/minterms", label: "Minterms tutorial" },
      { to: "/boolean/maxterms", label: "Maxterms tutorial" },
      { to: "/boolean/laws", label: "Boolean laws reference" },
    ],
  },
  "number-systems": {
    group: "Number Systems",
    title: "Number System Problems",
    description:
      "Practice number conversion, 2's complement, signed representation, BCD, hexadecimal, and binary arithmetic across common base systems.",
    links: [
      { to: "/number-systems/calculator", label: "Number system calculator" },
      { to: "/number-systems/number-conversion", label: "Base conversion tutorial" },
      { to: "/arithmetic/complements", label: "2's complement guide" },
      { to: "/number-systems/bcd-notation", label: "BCD notation" },
    ],
  },
  "sequential-circuits": {
    group: "Sequential Circuits",
    title: "Sequential Circuit Problems",
    description:
      "Revise latches, flip-flops, state tables, SR/D/JK/T behavior, and sequence design with focused sequential-circuit practice.",
    links: [
      { to: "/sequential/intro", label: "Sequential circuits introduction" },
      { to: "/sequential/latches", label: "Latches tutorial" },
      { to: "/sequential/flip-flops", label: "Flip-flops tutorial" },
      { to: "/sequential/state-diagram", label: "State diagrams and tables" },
      { to: "/timing-diagrams", label: "Timing diagrams" },
    ],
  },
  "flip-flops": {
    group: "Sequential Circuits",
    title: "Flip-Flop Problems",
    description:
      "Review SR, JK, D, and T flip-flop truth tables, excitation behavior, and exam-style practice questions.",
    links: [
      { to: "/sequential/flip-flops", label: "Flip-flops tutorial" },
      { to: "/sequential/flip-flop-types", label: "Flip-flop types" },
      {
        to: "/problems/sequential-circuits",
        label: "Sequential circuit problems",
      },
    ],
  },
};

export default problemTopicLandingMap;
