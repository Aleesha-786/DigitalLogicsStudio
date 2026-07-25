import { coalCourseParts } from "../data/coalCourseOutline.js";

export const SITE_NAME = "Boolforge";
export const SITE_URL = (
  process.env.REACT_APP_SITE_URL ||
  process.env.SITE_URL ||
  "https://circuits.quantumlogicslimited.com"
).replace(/\/+$/, "");
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
export const TWITTER_HANDLE = "@Boolforge";
export const BRAND_ALTERNATE_NAMES = [
  "Boolforge Boolean Algebra",
  "Boolforge Digital Logic",
  "Boolforge Computer Engineering",
  "Boolforge K-Map Solver",
];
export const BRAND_TOPICS = [
  "Boolforge",
  "Boolean Algebra",
  "Digital Logic Design",
  "Logic Gates",
  "Karnaugh Maps",
  "K-Maps",
  "Number Systems",
  "Computer Architecture",
  "Computer Engineering",
  "FPGA",
  "Embedded Systems",
];

const buildRoute = ({
  path,
  title,
  description,
  keywords = [],
  type = "LearningResource",
  section = "Learn",
  category,
  breadcrumbLabel,
  relatedLinks = [],
  faq = [],
  noindex = false,
  ogImage = DEFAULT_OG_IMAGE,
}) => ({
  path,
  title: title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`,
  description,
  keywords,
  type,
  section,
  category,
  breadcrumbLabel: breadcrumbLabel || title,
  relatedLinks,
  faq,
  noindex,
  ogImage,
});

const topicPages = (category, section, pages, defaults = {}) =>
  pages.map((page) =>
    buildRoute({
      path: page.path,
      title: `${page.label} ${defaults.titleSuffix || "| Boolforge"}`,
      description: page.description,
      category,
      section,
      type: defaults.type || "LearningResource",
      keywords: [...(defaults.keywords || []), ...(page.keywords || [])],
      relatedLinks: page.relatedLinks || defaults.relatedLinks || [],
    }),
  );

const booleanPages = [
  {
    path: "/boolean/overview",
    label: "Boolean Algebra Tutorial",
    description:
      "Learn Boolean algebra from first principles with digital-logic explanations, examples, and exam-ready foundations.",
    keywords: [
      "boolean algebra tutorial",
      "boolean algebra basics",
      "digital logic design tutorial",
    ],
    relatedLinks: [
      { to: "/boolean/identities", label: "Boolean identities" },
      { to: "/boolean/laws", label: "Boolean laws" },
      { to: "/standard-forms", label: "SOP and POS forms" },
      { to: "/problems/boolean-algebra", label: "Boolean algebra problems" },
    ],
  },
  {
    path: "/boolean/identities",
    label: "Boolean Identities",
    description:
      "Study the core Boolean identities used in logic simplification, circuit reduction, and computer engineering exams.",
    keywords: ["boolean identities", "boolean algebra identities"],
  },
  {
    path: "/boolean/laws",
    label: "Boolean Laws",
    description:
      "Master Boolean laws including distributive, associative, absorption, and De Morgan transformations for simplification.",
    keywords: ["boolean laws", "de morgan laws boolean algebra"],
  },
  {
    path: "/boolean/complement",
    label: "Boolean Complement",
    description:
      "Understand complements in Boolean algebra and how complementation affects variables, expressions, and logic gates.",
    keywords: ["boolean complement", "complement laws boolean algebra"],
  },
  {
    path: "/boolean/duality",
    label: "Duality Principle",
    description:
      "Learn the Boolean duality principle and how to derive dual expressions used in proofs and circuit reasoning.",
    keywords: ["duality principle boolean algebra"],
  },
  {
    path: "/boolean/consensus",
    label: "Consensus Theorem",
    description:
      "Use the consensus theorem to remove redundant terms and simplify logic expressions for efficient digital circuits.",
    keywords: ["consensus theorem boolean algebra"],
  },
  {
    path: "/boolean/minterms",
    label: "Minterms Explained",
    description:
      "Learn how minterms map truth-table rows to canonical SOP expressions for Boolean algebra and K-map workflows.",
    keywords: ["minterms", "canonical sop", "sum of products boolean algebra"],
    relatedLinks: [
      { to: "/boolean/maxterms", label: "Maxterms explained" },
      { to: "/standard-forms", label: "Standard forms" },
      { to: "/kmapgenerator", label: "Karnaugh map solver" },
      { to: "/problems/k-map", label: "K-map problems" },
    ],
  },
  {
    path: "/boolean/maxterms",
    label: "Maxterms Explained",
    description:
      "Understand maxterms, canonical POS expressions, and how product-of-sums representations support logic design.",
    keywords: ["maxterms", "canonical pos", "product of sums boolean algebra"],
  },
  {
    path: "/boolean/minterms-maxterms",
    label: "Minterms and Maxterms",
    description:
      "Compare minterms and maxterms, connect SOP and POS forms, and prepare for K-map simplification workflows.",
    keywords: [
      "minterms and maxterms",
      "sop and pos",
      "standard forms boolean algebra",
    ],
    relatedLinks: [
      { to: "/standard-forms", label: "Standard forms tutorial" },
      { to: "/kmapgenerator", label: "K-map simplifier online" },
      { to: "/boolforge", label: "Boolean algebra calculator" },
      { to: "/problems/boolean-algebra", label: "Boolean algebra practice" },
    ],
  },
  {
    path: "/boolean/significant-digits",
    label: "Significant Digits",
    description:
      "Review significant digits, MSD, and LSD concepts used across number representation and digital systems problems.",
    keywords: ["significant digits digital logic"],
  },
];

const numberPages = [
  {
    path: "/number-systems/binary-representation",
    label: "Binary Representation",
    description:
      "Understand binary representation, signed and unsigned values, and how computers store numbers at the bit level.",
    keywords: ["binary representation", "binary numbers tutorial"],
  },
  {
    path: "/number-systems/number-conversion",
    label: "Number System Converter",
    description:
      "Convert numbers between binary, octal, decimal, and hexadecimal with explanations for exam preparation and self-study.",
    keywords: ["number system converter", "binary to decimal converter"],
    relatedLinks: [
      { to: "/number-systems/calculator", label: "Number system calculator" },
      { to: "/number-systems/bit-converter", label: "Bit converter" },
      { to: "/problems/number-systems", label: "Number system problems" },
    ],
  },
  {
    path: "/number-systems/bit-extension",
    label: "Bit Extension",
    description:
      "Learn sign extension, zero extension, and width expansion rules for digital arithmetic and data representation.",
    keywords: ["sign extension", "zero extension"],
  },
  {
    path: "/number-systems/bcd-notation",
    label: "BCD Notation",
    description:
      "Explore Binary Coded Decimal notation and how decimal digits are encoded for digital displays and systems.",
    keywords: ["bcd notation", "binary coded decimal"],
  },
  {
    path: "/number-systems/ascii-notation",
    label: "ASCII Notation",
    description:
      "Learn ASCII notation, binary character encoding, and the role of text representation in digital systems.",
    keywords: ["ascii notation", "ascii binary representation"],
  },
  {
    path: "/number-systems/bit-converter",
    label: "Bit Converter",
    description:
      "Use a guided bit converter for binary, decimal, hexadecimal, and octal translation with clear output formatting.",
    keywords: ["bit converter", "binary converter"],
  },
  {
    path: "/number-systems/calculator",
    label: "Number System Calculator",
    description:
      "Solve arithmetic across binary, octal, decimal, and hexadecimal systems with step-by-step educational output.",
    keywords: [
      "number system calculator",
      "binary arithmetic calculator",
      "number base calculator",
    ],
    relatedLinks: [
      { to: "/arithmetic/complements", label: "2's complement calculator" },
      { to: "/number-systems/number-conversion", label: "Base conversion tutorial" },
      { to: "/problems/number-systems", label: "Number system practice" },
    ],
  },
];

const arithmeticPages = [
  {
    path: "/arithmetic/binary-adders",
    label: "Binary Adders",
    description:
      "Learn half adders, full adders, and binary addition workflows with truth tables and digital logic explanations.",
    keywords: ["full adder truth table", "binary adder", "half adder"],
    relatedLinks: [
      { to: "/problems", label: "Adder practice problems" },
      { to: "/arithmetic/binary-add-subtractor", label: "Adder subtractor" },
      { to: "/encoder", label: "Encoder tutorial" },
    ],
  },
  {
    path: "/arithmetic/binary-subtractor",
    label: "Binary Subtractor",
    description:
      "Study half subtractors, full subtractors, borrow logic, and binary subtraction for digital design courses.",
    keywords: ["binary subtractor", "full subtractor truth table"],
  },
  {
    path: "/arithmetic/binary-add-subtractor",
    label: "Binary Adder Subtractor",
    description:
      "Understand combined adder-subtractor circuits, mode control, and two's complement arithmetic design.",
    keywords: ["adder subtractor circuit", "binary adder subtractor"],
  },
  {
    path: "/arithmetic/binary-multipliers",
    label: "Binary Multipliers",
    description:
      "Learn binary multiplier design, partial products, and arithmetic logic techniques used in processor datapaths.",
    keywords: ["binary multiplier", "digital logic multiplier"],
  },
  {
    path: "/arithmetic/code-conversion",
    label: "Code Conversion",
    description:
      "Convert between common digital codes and understand representation schemes used in practical logic design.",
    keywords: ["code conversion digital logic"],
  },
  {
    path: "/arithmetic/magnitude-comparator",
    label: "Magnitude Comparator",
    description:
      "Study magnitude comparators, comparison logic, and the design of greater-than, less-than, and equality outputs.",
    keywords: ["magnitude comparator", "digital comparator tutorial"],
  },
  {
    path: "/arithmetic/parity-generators",
    label: "Parity Generators",
    description:
      "Explore parity generators and parity checkers for error detection in digital communication and storage.",
    keywords: ["parity generator", "parity checker"],
  },
  {
    path: "/arithmetic/design-applications",
    label: "Arithmetic Design Applications",
    description:
      "Connect arithmetic functions to real HDL-style design applications used in digital systems engineering.",
    keywords: ["digital logic design applications", "hdl arithmetic tutorial"],
  },
  {
    path: "/arithmetic/complements",
    label: "1's and 2's Complement Calculator",
    description:
      "Practice 1's complement and 2's complement conversion, signed binary arithmetic, and overflow-ready representation.",
    keywords: ["2's complement calculator", "1's complement calculator"],
    relatedLinks: [
      { to: "/number-systems/calculator", label: "Number system calculator" },
      { to: "/arithmetic/signed-unsigned", label: "Signed and unsigned arithmetic" },
      { to: "/problems/number-systems", label: "Complement practice problems" },
    ],
  },
  {
    path: "/arithmetic/signed-unsigned",
    label: "Signed and Unsigned Arithmetic",
    description:
      "Learn signed and unsigned arithmetic, overflow rules, and binary interpretation for exams and digital design.",
    keywords: ["signed binary arithmetic", "unsigned arithmetic digital logic"],
  },
];

const combinationalPages = [
  {
    path: "/encoder",
    label: "Encoder Tutorial",
    description:
      "Learn encoder circuits, priority encoding, and truth-table compression in a digital logic design workflow.",
    keywords: ["encoder decoder tutorial", "encoder circuit tutorial"],
  },
  {
    path: "/decoder",
    label: "Decoder Tutorial",
    description:
      "Study decoder truth tables, minterm generation, addressing, and one-hot outputs for digital systems.",
    keywords: ["decoder tutorial", "decoder truth table"],
  },
  {
    path: "/mux",
    label: "Multiplexer Tutorial",
    description:
      "Understand multiplexers, select-line behavior, and Boolean function implementation using MUX logic.",
    keywords: ["multiplexer tutorial", "mux truth table"],
  },
  {
    path: "/demux",
    label: "Demultiplexer Tutorial",
    description:
      "Learn demultiplexers, routing logic, and the relationship between DEMUX and decoder circuits.",
    keywords: ["demultiplexer tutorial", "demux truth table"],
  },
];

const sequentialPages = [
  {
    path: "/sequential/intro",
    label: "Sequential Circuits Introduction",
    description:
      "Start sequential circuits with state, memory, clocks, and the core differences from combinational logic.",
    keywords: ["sequential circuits tutorial", "sequential logic basics"],
  },
  {
    path: "/sequential/latches",
    label: "Latches",
    description:
      "Learn SR and gated latches, memory behavior, and the fundamentals of state storage in digital logic.",
    keywords: ["latches digital logic", "sr latch tutorial"],
  },
  {
    path: "/sequential/flip-flops",
    label: "Flip-Flops",
    description:
      "Study flip-flop fundamentals, edge-triggered storage, and timing-aware state control in sequential circuits.",
    keywords: ["flip flop truth table", "flip flop tutorial"],
    relatedLinks: [
      { to: "/sequential/flip-flop-types", label: "Flip-flop types" },
      { to: "/timing-diagrams", label: "Timing diagrams" },
      { to: "/problems/flip-flops", label: "Flip-flop practice" },
    ],
  },
  {
    path: "/sequential/flip-flop-types",
    label: "Flip-Flop Types",
    description:
      "Compare SR, JK, D, and T flip-flops with truth tables, excitation behavior, and exam-focused notes.",
    keywords: ["jk flip flop truth table", "d flip flop", "t flip flop"],
  },
  {
    path: "/sequential/analysis",
    label: "Sequential Circuit Analysis",
    description:
      "Analyze sequential circuits using present state, next state, outputs, and transition logic.",
    keywords: ["sequential circuit analysis"],
  },
  {
    path: "/sequential/design-procedures",
    label: "Sequential Design Procedures",
    description:
      "Follow structured sequential-circuit design procedures from state definition to implementation.",
    keywords: ["sequential circuit design procedure"],
  },
  {
    path: "/sequential/state-diagram",
    label: "State Diagrams and Tables",
    description:
      "Build and interpret state diagrams and state tables for sequential circuit design and exam preparation.",
    keywords: ["state diagram sequential circuits", "state table"],
  },
  {
    path: "/sequential/state-reduction",
    label: "State Reduction",
    description:
      "Learn state reduction and excitation table methods for optimizing sequential logic implementations.",
    keywords: ["state reduction digital logic", "excitation table"],
  },
];

const registerPages = [
  {
    path: "/registers/intro",
    label: "Registers",
    description:
      "Learn what registers are, how digital systems store temporary values, and how transfer operations are organized.",
    keywords: ["registers digital logic", "register transfer tutorial"],
  },
  {
    path: "/registers/counters",
    label: "Counters",
    description:
      "Study counters, count sequences, and binary progression circuits used throughout digital systems.",
    keywords: ["counters digital logic", "binary counter tutorial"],
  },
  {
    path: "/registers/sync-async",
    label: "Synchronous and Asynchronous",
    description:
      "Compare synchronous and asynchronous behavior in counters and control-oriented register systems.",
    keywords: ["synchronous asynchronous counters"],
  },
  {
    path: "/registers/shift-registers",
    label: "Shift Registers",
    description:
      "Learn shift registers, serial-parallel data movement, and storage transfer operations for digital systems.",
    keywords: ["shift register tutorial"],
  },
  {
    path: "/registers/serial-shift",
    label: "Serial Shift Registers",
    description:
      "Understand serial shifting, bit-by-bit transfer, and timing flow in shift register structures.",
    keywords: ["serial shift register"],
  },
  {
    path: "/registers/loading",
    label: "Loading Registers",
    description:
      "Study the loading of registers, enable control, and conditional data acceptance in RTL workflows.",
    keywords: ["loading registers", "register load control"],
  },
  {
    path: "/registers/parallel",
    label: "Parallel Registers",
    description:
      "Learn parallel register operations and the design of wider data-transfer structures in digital systems.",
    keywords: ["parallel registers"],
  },
  {
    path: "/registers/ripple-counters",
    label: "Ripple Counters",
    description:
      "Explore ripple counters, asynchronous propagation, and delay-sensitive counting behavior.",
    keywords: ["ripple counter tutorial"],
  },
  {
    path: "/registers/sync-binary-counters",
    label: "Synchronous Binary Counters",
    description:
      "Study synchronous binary counters and coordinated clocked counting structures for efficient design.",
    keywords: ["synchronous binary counter"],
  },
];

const memoryPages = [
  {
    path: "/memory/basics",
    label: "Memory Basics",
    description:
      "Learn digital memory basics, volatile versus non-volatile storage, and addressable organization.",
    keywords: ["memory basics digital logic"],
  },
  {
    path: "/memory/read-only-memories",
    label: "Read-Only Memories",
    description:
      "Study ROM, PROM, EPROM, EEPROM, and flash concepts used in digital electronics and computer systems.",
    keywords: ["read only memory tutorial", "rom types"],
  },
  {
    path: "/memory/programmable-logic-array",
    label: "Programmable Logic Array",
    description:
      "Understand programmable logic arrays and how AND/OR planes implement multiple Boolean functions efficiently.",
    keywords: ["programmable logic array", "pla tutorial"],
  },
  {
    path: "/memory/random-access-memory",
    label: "Random Access Memory",
    description:
      "Learn RAM organization, read/write behavior, control signals, and access concepts in digital systems.",
    keywords: ["random access memory tutorial", "ram digital logic"],
  },
  {
    path: "/memory/static-dynamic-ram",
    label: "Static and Dynamic RAM",
    description:
      "Compare SRAM and DRAM, refresh behavior, storage cells, and design tradeoffs in memory systems.",
    keywords: ["sram vs dram", "static dynamic ram"],
  },
  {
    path: "/memory/array-of-ram-ics",
    label: "Array of RAM ICs",
    description:
      "Build larger memory systems from RAM IC arrays with address expansion and word-length scaling.",
    keywords: ["array of ram ics", "memory expansion"],
  },
  {
    path: "/memory/memory-construction-ram",
    label: "Memory Construction",
    description:
      "Learn memory construction using RAM ICs, decoders, chip selection, and practical word/address organization.",
    keywords: ["memory construction ram", "memory system design"],
  },
];

export const SEO_ROUTES = [
  buildRoute({
    path: "/",
    title: "Boolforge | Interactive Digital Logic Design Learning Platform",
    description:
      "Master Boolean algebra, Karnaugh maps, number systems, flip-flops, arithmetic circuits, and digital logic exam preparation with interactive tools and tutorials.",
    keywords: [
      "Boolforge",
      "Boolforge digital logic",
      "Boolforge boolean algebra",
      "Boolforge computer engineering",
      "digital logic design tutorial",
      "boolean algebra calculator",
      "karnaugh map solver",
      "digital logic exam preparation",
    ],
    type: "WebSite",
    section: "Home",
    category: "Platform",
    relatedLinks: [
      { to: "/kmapgenerator", label: "K-map simplifier online" },
      { to: "/boolforge", label: "Boolean algebra simplification tool" },
      { to: "/problems", label: "Digital logic problems" },
    ],
  }),
  buildRoute({
    path: "/boolforge",
    title: "Boolean Algebra Calculator and Circuit Builder | Boolforge",
    description:
      "Use Boolforge as a Boolean algebra calculator and circuit builder to simplify expressions, test logic gates, and study digital logic design interactively.",
    keywords: [
      "Boolforge",
      "Boolforge Boolean Algebra",
      "Boolforge Digital Logic",
      "boolean algebra calculator",
      "boolean algebra simplification",
      "logic gate simulator",
    ],
    type: "SoftwareApplication",
    section: "Featured Tool",
    category: "SoftwareApplication",
    relatedLinks: [
      { to: "/boolean/overview", label: "Boolean algebra tutorial" },
      { to: "/kmapgenerator", label: "K-map solver" },
      { to: "/standard-forms", label: "Standard forms guide" },
    ],
  }),
  buildRoute({
    path: "/kmapgenerator",
    title: "Karnaugh Map Solver and K-Map Simplifier Online | Boolforge",
    description:
      "Solve Karnaugh maps online with a visual K-map simplifier for SOP and POS minimization, Boolean expression reduction, and digital logic practice.",
    keywords: [
      "karnaugh map solver",
      "k map simplifier online",
      "kmap generator",
    ],
    type: "SoftwareApplication",
    section: "Featured Tool",
    category: "SoftwareApplication",
    relatedLinks: [
      { to: "/boolean/minterms", label: "Minterms tutorial" },
      { to: "/boolean/maxterms", label: "Maxterms tutorial" },
      { to: "/standard-forms", label: "SOP and POS guide" },
      { to: "/problems/k-map", label: "K-map practice problems" },
    ],
  }),
  buildRoute({
    path: "/standard-forms",
    title: "Standard Forms in Boolean Algebra | SOP and POS Guide",
    description:
      "Learn standard forms in Boolean algebra, convert between SOP and POS, and verify logic expressions with truth-table support.",
    keywords: ["sop and pos", "standard forms boolean algebra"],
    type: "LearningResource",
    section: "Boolean Algebra",
    category: "Boolean Algebra",
    relatedLinks: [
      { to: "/boolean/minterms-maxterms", label: "Minterms and maxterms" },
      { to: "/kmapgenerator", label: "K-map simplifier" },
      { to: "/problems/boolean-algebra", label: "Boolean algebra problems" },
    ],
  }),
  buildRoute({
    path: "/paritybitcalculator",
    title: "Parity Bit Calculator | Boolforge",
    description:
      "Calculate parity bits and understand error-detection logic with an interactive parity bit calculator for digital systems.",
    keywords: ["parity bit calculator", "parity generator calculator"],
    type: "SoftwareApplication",
    section: "Featured Tool",
    category: "Arithmetic Functions",
  }),
  buildRoute({
    path: "/problems",
    title: "Practice Problems — Digital Logic & COAL | Boolforge",
    description:
      "Practice digital logic design and computer organization & assembly language (COAL) problems in one place — Boolean algebra, K-maps, number systems, sequential circuits, x86 assembly, cache & memory, and more.",
    keywords: [
      "digital logic problems",
      "coal practice problems",
      "digital logic exam preparation",
      "boolean algebra problems",
      "assembly programming practice",
      "computer organization questions",
    ],
    type: "FAQPage",
    section: "Practice",
    category: "Problems",
    relatedLinks: [
      { to: "/problems/boolean-algebra", label: "Boolean algebra problems" },
      { to: "/problems/k-map", label: "K-map problems" },
      { to: "/problems/number-systems", label: "Number system problems" },
      { to: "/problems?course=coal", label: "COAL practice problems" },
    ],
    faq: [
      {
        question: "What kinds of digital logic problems can I practice on Boolforge?",
        answer:
          "Boolforge includes practice across Boolean algebra, combinational circuits, sequential circuits, number systems, memory systems, and arithmetic logic topics.",
      },
      {
        question: "Are the Boolforge problems useful for university exam preparation?",
        answer:
          "Yes. The problem sets are organized around common digital logic topics and are designed to help with revision, conceptual understanding, and exam-style practice.",
      },
      {
        question: "Can I practice COAL problems on the same page?",
        answer:
          "Yes. The Problems page has a course toggle — switch to the COAL tab to practice number representation, x86 assembly, ISA & registers, cache & memory, and I/O & interrupt questions without leaving the page.",
      },
    ],
  }),
  buildRoute({
    path: "/problems/boolean-algebra",
    title: "Boolean Algebra Problems and Practice Questions | Boolforge",
    description:
      "Practice Boolean algebra problems covering identities, laws, consensus, minterms, maxterms, SOP, POS, and simplification.",
    keywords: ["boolean algebra problems", "boolean algebra practice questions"],
    type: "FAQPage",
    section: "Practice",
    category: "Boolean Algebra",
    faq: [
      {
        question: "What do Boolean algebra practice questions usually cover?",
        answer:
          "They commonly cover identities, simplification, canonical forms, De Morgan transformations, consensus theorem, and expression conversion.",
      },
    ],
  }),
  buildRoute({
    path: "/problems/k-map",
    title: "K-Map Problems and Karnaugh Map Practice | Boolforge",
    description:
      "Practice Karnaugh map problems for SOP and POS minimization, grouping strategy, and Boolean simplification.",
    keywords: ["k map problems", "karnaugh map practice"],
    type: "FAQPage",
    section: "Practice",
    category: "K-Maps",
  }),
  buildRoute({
    path: "/problems/number-systems",
    title: "Number System Problems and Conversion Practice | Boolforge",
    description:
      "Solve number system problems for binary, octal, decimal, hexadecimal, complements, and signed representation.",
    keywords: ["number system problems", "binary conversion practice"],
    type: "FAQPage",
    section: "Practice",
    category: "Number Systems",
  }),
  buildRoute({
    path: "/problems/sequential-circuits",
    title: "Sequential Circuit Problems and FSM Practice | Boolforge",
    description:
      "Practice sequential circuit problems covering latches, flip-flops, state tables, state diagrams, and sequential design.",
    keywords: ["sequential circuit problems", "flip flop practice questions"],
    type: "FAQPage",
    section: "Practice",
    category: "Sequential Circuits",
  }),
  buildRoute({
    path: "/problems/flip-flops",
    title: "Flip-Flop Problems and Truth Table Practice | Boolforge",
    description:
      "Review flip-flop truth tables and practice questions for SR, JK, D, and T flip-flops with exam-focused preparation.",
    keywords: ["flip flop problems", "flip flop truth table practice"],
    type: "FAQPage",
    section: "Practice",
    category: "Sequential Circuits",
  }),
  buildRoute({
    path: "/book",
    title: "Digital Logic Practice Set Chapter 1 | Boolforge",
    description:
      "Work through chapter-based digital logic practice problems for guided revision and self-assessment.",
    keywords: ["digital logic chapter 1 problems"],
    type: "LearningResource",
    section: "Practice",
    category: "Problems",
  }),
  buildRoute({
    path: "/book/ch2",
    title: "Digital Logic Practice Set Chapter 2 | Boolforge",
    description:
      "Continue chapter-based digital logic practice for university revision, worked exercises, and concept reinforcement.",
    keywords: ["digital logic chapter 2 problems"],
    type: "LearningResource",
    section: "Practice",
    category: "Problems",
  }),
  buildRoute({
    path: "/timing-diagrams",
    title: "Timing Diagrams and Gate Delay | Boolforge",
    description:
      "Learn timing diagrams, propagation delay, and waveform interpretation for digital logic circuits and sequential systems.",
    keywords: ["timing diagrams digital logic", "gate delay"],
    type: "LearningResource",
    section: "Advanced Logic",
    category: "Advanced Logic",
  }),
  buildRoute({
    path: "/trainer-board",
    title: "Digital Logic Trainer Board | Boolforge",
    description:
      "Explore a digital logic trainer board interface for hands-on circuit experimentation and educational demonstrations.",
    keywords: ["digital logic trainer board"],
    type: "SoftwareApplication",
    section: "Featured Tool",
    category: "SoftwareApplication",
  }),
  buildRoute({
    path: "/login",
    title: "Log In | Boolforge",
    description: "Log in to Boolforge to sync progress, saved problems, and learning activity.",
    noindex: true,
    type: "WebPage",
    section: "Account",
    category: "Authentication",
  }),
  buildRoute({
    path: "/signup",
    title: "Sign Up | Boolforge",
    description: "Create a Boolforge account to save progress and track digital logic learning.",
    noindex: true,
    type: "WebPage",
    section: "Account",
    category: "Authentication",
  }),
  buildRoute({
    path: "/profile",
    title: "Profile | Boolforge",
    description: "Manage your Boolforge profile, learning progress, and practice history.",
    noindex: true,
    type: "WebPage",
    section: "Account",
    category: "Authentication",
  }),
  ...topicPages("Boolean Algebra", "Learn", booleanPages, {
    titleSuffix: "| Boolforge",
    keywords: ["boolean algebra", "digital logic tutorial"],
  }),
  ...topicPages("Number Systems", "Learn", numberPages, {
    titleSuffix: "| Boolforge",
    keywords: ["number systems", "digital electronics"],
  }),
  ...topicPages("Arithmetic Functions", "Learn", arithmeticPages, {
    titleSuffix: "| Boolforge",
    keywords: ["arithmetic functions", "digital logic design"],
  }),
  ...topicPages("Combinational Circuits", "Learn", combinationalPages, {
    titleSuffix: "| Boolforge",
    keywords: ["combinational circuits", "digital logic design"],
  }),
  ...topicPages("Sequential Circuits", "Learn", sequentialPages, {
    titleSuffix: "| Boolforge",
    keywords: ["sequential circuits", "digital logic design"],
  }),
  ...topicPages("Registers and Transfers", "Learn", registerPages, {
    titleSuffix: "| Boolforge",
    keywords: ["register transfer", "digital logic design"],
  }),
  ...topicPages("Memory Systems", "Learn", memoryPages, {
    titleSuffix: "| Boolforge",
    keywords: ["memory systems", "digital logic design"],
  }),
  buildRoute({
    path: "/circuit-cost",
    title: "Circuit Cost Analysis | Boolforge",
    description:
      "Analyze literal cost and gate-input cost to compare Boolean expression implementations and design tradeoffs.",
    keywords: ["circuit cost analysis", "boolean expression cost"],
    type: "LearningResource",
    section: "Advanced Logic",
    category: "Advanced Logic",
  }),
  buildRoute({
    path: "/gates",
    title: "Logic Gates Explained | Boolforge",
    description:
      "Review logic gate symbols, truth behavior, and intuition for AND, OR, NOT, NAND, NOR, XOR, XNOR, and buffer gates.",
    keywords: ["logic gates explained", "logic gate symbols", "logic gate truth table"],
    type: "LearningResource",
    section: "Advanced Logic",
    category: "Advanced Logic",
  }),
  buildRoute({
    path: "/resources",
    title: "Computer Engineering & Digital Design Learning Resources | Boolforge",
    description:
      "Access interactive simulators, calculators, study guides, and custom practice sets for Digital Logic Design (DLD) and Computer Organization & Assembly Language (COAL).",
    keywords: [
      "digital logic design",
      "computer organization",
      "assembly language",
      "computer engineering resources",
      "dld track",
      "coal track"
    ],
    type: "LearningResource",
    section: "Resources",
    category: "Learning Guides",
    relatedLinks: [
      { to: "/resources/dld", label: "DLD resources" },
      { to: "/resources/coal", label: "COAL resources" },
      { to: "/problems", label: "DLD practice" },
      { to: "/problems?course=coal", label: "COAL practice" }
    ]
  }),
  buildRoute({
    path: "/resources/dld",
    title: "Digital Logic Design (DLD) Learning Resources | Boolforge",
    description:
      "Master digital logic design with our structured resource hub. Includes Boolean algebra simplifiers, K-map generators, and practice sets.",
    keywords: [
      "dld study guide",
      "digital logic design tutorial",
      "logic gates calculator",
      "karnaugh map solver"
    ],
    type: "LearningResource",
    section: "Resources",
    category: "Digital Logic",
    relatedLinks: [
      { to: "/boolean/overview", label: "Boolean algebra tutorial" },
      { to: "/kmapgenerator", label: "K-map solver" },
      { to: "/book", label: "Solved practice exercises" }
    ]
  }),
  buildRoute({
    path: "/resources/coal",
    title: "Computer Organization & Assembly Language (COAL) Hub | Boolforge",
    description:
      "Forge mastery in computer organization and assembly language. Learn CPU internals, positional number systems, x86 assembly, and execute instruction cycles visually.",
    keywords: [
      "computer organization and assembly language",
      "coal tutorial",
      "x86 assembly tutorial",
      "cpu architecture",
      "assembly drills"
    ],
    type: "LearningResource",
    section: "COAL",
    category: "Computer Organization",
    relatedLinks: [
      { to: "/resources/coal/theory", label: "COAL course syllabus" },
      { to: "/resources/coal/practical", label: "Interactive assembly simulators" },
      { to: "/problems?course=coal", label: "COAL practice problems" }
    ]
  }),
  buildRoute({
    path: "/resources/coal/theory",
    title: "COAL Theory Syllabus & Learning Path | Boolforge",
    description:
      "Navigate the complete theoretical roadmap of Computer Organization & Assembly Language, from hardware gates up to pipelined instruction execution.",
    keywords: [
      "coal theory syllabus",
      "computer organization lectures",
      "assembly language lessons",
      "x86 CPU design"
    ],
    type: "LearningResource",
    section: "COAL",
    category: "Computer Organization",
    relatedLinks: [
      { to: "/resources/coal", label: "COAL track landing" },
      { to: "/resources/coal/practical", label: "Interactive labs" },
      { to: "/problems?course=coal", label: "COAL practice problems" }
    ]
  }),
  buildRoute({
    path: "/resources/coal/practical",
    title: "COAL Practical Labs and x86 Simulators | Boolforge",
    description:
      "Interactive tools for learning assembly language: trace x86 CPU fetch-decode-execute cycle, visualize stack memory frames, and practice coding drills.",
    keywords: [
      "x86 simulation tools",
      "assembly compiler online",
      "stack simulator",
      "cpu register trace",
      "addressing mode calculator"
    ],
    type: "SoftwareApplication",
    section: "COAL",
    category: "SoftwareApplication",
    relatedLinks: [
      { to: "/resources/coal/practical/instruction-trace-lab", label: "Instruction Trace Lab" },
      { to: "/resources/coal/practical/stack-memory-simulator", label: "Stack Memory Simulator" },
      { to: "/resources/coal/practical/assembly-drills", label: "Assembly Coding Drills" },
      { to: "/resources/coal/practical/addressing-mode-playground", label: "Addressing Mode Playground" },
      { to: "/resources/coal/practical/instruction-laboratory", label: "Instruction Laboratory" }
    ]
  }),
  buildRoute({
    path: "/resources/coal/practical/instruction-trace-lab",
    title: "Instruction Trace Lab & CPU Datapath Simulator | Boolforge",
    description:
      "Step through the fetch, decode, and execute phases of assembly instructions in our interactive CPU register and bus visualizer.",
    keywords: [
      "instruction trace simulator",
      "cpu datapath visualizer",
      "fetch decode execute steps",
      "register transfer simulator"
    ],
    type: "SoftwareApplication",
    section: "COAL",
    category: "SoftwareApplication",
    relatedLinks: [
      { to: "/resources/coal/practical", label: "All practical labs" },
      { to: "/resources/coal/practical/stack-memory-simulator", label: "Stack simulator" },
      { to: "/coal/instruction-cycle", label: "Instruction cycle theory" }
    ]
  }),
  buildRoute({
    path: "/resources/coal/practical/alu-flags-simulator",
    title: "ALU & Flags Simulator | Boolforge",
    description:
      "Practice arithmetic operations and see how ZF, CF, OF, and SF change in real time. Interactive x86 ALU simulator with flag visualisation.",
    keywords: [
      "alu flags simulator",
      "x86 arithmetic flags",
      "ZF CF OF SF",
      "flag register simulation",
      "assembly flags practice"
    ],
    type: "SoftwareApplication",
    section: "COAL",
    category: "SoftwareApplication",
    relatedLinks: [
      { to: "/resources/coal/practical", label: "All practical labs" },
      { to: "/resources/coal/practical/instruction-laboratory", label: "Instruction laboratory" },
      { to: "/coal/register-flags", label: "Flags & condition codes theory" }
    ]
  }),
  buildRoute({
    path: "/resources/coal/practical/stack-memory-simulator",
    title: "x86 Stack Memory Simulator and Visualizer | Boolforge",
    description:
      "Visualize how the stack grows and shrinks in memory with push, pop, call, and ret instructions. Track ESP, EBP and stack variables dynamically.",
    keywords: [
      "x86 stack simulator",
      "stack memory visualizer",
      "esp and ebp visualization",
      "push pop stack frame"
    ],
    type: "SoftwareApplication",
    section: "COAL",
    category: "SoftwareApplication",
    relatedLinks: [
      { to: "/resources/coal/practical", label: "All practical labs" },
      { to: "/resources/coal/practical/instruction-laboratory", label: "Instruction laboratory" },
      { to: "/coal/procedures-stack", label: "Stack & procedures theory" }
    ]
  }),
  buildRoute({
    path: "/resources/coal/practical/assembly-drills",
    title: "x86 Assembly Programming Drills & Exercises | Boolforge",
    description:
      "Strengthen your coding skills with interactive assembly drills. Solve registry transfer, arithmetic, loops, and conditional problems in MASM style.",
    keywords: [
      "assembly drills",
      "x86 coding exercises",
      "assembly practice problems",
      "learn x86 programming"
    ],
    type: "SoftwareApplication",
    section: "COAL",
    category: "SoftwareApplication",
    relatedLinks: [
      { to: "/resources/coal/practical", label: "All practical labs" },
      { to: "/problems?course=coal", label: "COAL exam questions" },
      { to: "/coal/coal-syntax", label: "Assembly syntax guide" }
    ]
  }),
  buildRoute({
    path: "/resources/coal/practical/addressing-mode-playground",
    title: "CPU Addressing Modes Interactive Playground | Boolforge",
    description:
      "Compute effective addresses for immediate, direct, indirect, indexed, and scaled-indexed addressing modes visually.",
    keywords: [
      "addressing modes playground",
      "effective address calculator",
      "assembly addressing modes",
      "x86 direct and indirect addressing"
    ],
    type: "SoftwareApplication",
    section: "COAL",
    category: "SoftwareApplication",
    relatedLinks: [
      { to: "/resources/coal/practical", label: "All practical labs" },
      { to: "/coal/addressing-modes", label: "Addressing modes theory" }
    ]
  }),
  buildRoute({
    path: "/resources/coal/practical/instruction-laboratory",
    title: "Intel x86 Instruction Laboratory | Boolforge",
    description:
      "Write and run assembly code, view memory registers, and study data movement and control flow instruction execution interactively.",
    keywords: [
      "x86 instruction simulator",
      "intel assembly sandbox",
      "assembly code runner online",
      "learn instruction sets"
    ],
    type: "SoftwareApplication",
    section: "COAL",
    category: "SoftwareApplication",
    relatedLinks: [
      { to: "/resources/coal/practical", label: "All practical labs" },
      { to: "/resources/coal/practical/instruction-trace-lab", label: "Instruction trace lab" }
    ]
  }),
  buildRoute({
    path: "/forgot-password",
    title: "Forgot Password | Recover Account | Boolforge",
    description: "Reset your Boolforge account password to recover your study progress and solved problems.",
    noindex: true,
    type: "WebPage",
    section: "Account",
    category: "Authentication",
  }),
  buildRoute({
    path: "/settings",
    title: "Settings | Manage Account | Boolforge",
    description: "Manage your Boolforge account settings and study preferences.",
    noindex: true,
    type: "WebPage",
    section: "Account",
    category: "Authentication",
  }),
  ...coalCourseParts.flatMap((part) =>
    part.modules.map((module) => {
      const description = `Study ${module.title} on Boolforge. Outcomes: ${module.outcomes.slice(0, 2).join(", ")}. Part of the Computer Organization & Assembly Language (COAL) track.`;
      return buildRoute({
        path: `/coal/${module.slug}`,
        title: `${module.title} | COAL Tutorial | Boolforge`,
        description,
        category: `COAL ${part.title}`,
        section: "COAL",
        type: "LearningResource",
        keywords: [
          module.slug.replace(/-/g, " "),
          module.title.toLowerCase(),
          "coal tutorial",
          "assembly language",
          "computer organization",
          ...module.outcomes.map(o => o.toLowerCase().slice(0, 30))
        ],
        relatedLinks: [
          { to: "/resources/coal/theory", label: "COAL Syllabus & Modules" },
          { to: "/resources/coal/practical", label: "COAL Assembly Labs" },
          { to: "/problems?course=coal", label: "COAL Practice Problems" }
        ]
      });
    })
  )
];

export const SEO_ROUTE_MAP = Object.fromEntries(
  SEO_ROUTES.map((route) => [route.path, route]),
);
