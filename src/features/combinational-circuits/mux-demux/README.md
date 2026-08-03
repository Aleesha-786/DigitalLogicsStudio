# MultiplexersAndDemultiplexers

Modular React page set for the **Multiplexer** and **Demultiplexer** topics in Digital Logics Studio.

---

## Directory Structure

```
shared/
  theme.js                        ← Design tokens (same palette as EncoderAndDecoder)
  components/
    Section.jsx                   ← Titled glass-card wrapper
    Quiz.jsx                      ← Reusable quiz widget
    TipsPanel.jsx                 ← Floating tips pop-up
    TruthTable.jsx                ← Truth-table renderer

mux/
  muxData.js                      ← ALL static data: types, tips, quiz questions
  MuxPage.jsx                     ← Main page — thin orchestrator
  components/
    MuxTypeSelector.jsx           ← MUX type picker (2-to-1, 4-to-1, 8-to-1)
    MuxSimulator.jsx              ← Data/select toggles, output LED, equations, truth table
    CascadingMuxDemo.jsx          ← Build an 8-to-1 from two 4-to-1 + one 2-to-1 MUX
    BooleanFunctionMux.jsx        ← Implement any Boolean function using a 4-to-1 MUX

demux/
  demuxData.js                    ← ALL static data: types, tips, quiz questions
  DemuxPage.jsx                   ← Main page — thin orchestrator
  components/
    DemuxTypeSelector.jsx         ← DEMUX type picker (1-to-2, 1-to-4, 1-to-8)
    DemuxSimulator.jsx            ← D/select toggles, routed output highlight, equations
    DecoderVsDemux.jsx            ← Interactive side-by-side comparison
```

---

## Key Design Decisions

### 1. Data separated from UI
`muxData.js` and `demuxData.js` hold all configurations, Boolean equations, truth tables,
tips, and quiz questions. Adding a new MUX type requires editing only the data file.

### 2. Shared components are generic
`Quiz`, `TipsPanel`, `TruthTable`, and `Section` accept all content as **props** and
are shared between the MUX and DEMUX pages identically.

### 3. Main pages are thin orchestrators
`MuxPage.jsx` and `DemuxPage.jsx` own only top-level state (`selectedType`, input arrays)
and arrange `<Section>` blocks. No rendering logic lives in the page files.

### 4. Same theme as EncoderAndDecoder
`shared/theme.js` uses the same `COLORS`, `FONT`, and style-helper exports so both topic
groups share a consistent visual language.

---

## How to Add a New MUX Type

1. Open `mux/muxData.js`
2. Add a new key to `MUX_TYPES` following the existing pattern
3. Provide: `label`, `selectInputs`, `dataInputs`, `output`, `description`, `analogy`,
   `mux()`, `booleanEqs`, `truthHeaders`, `truthRows`
4. Done — `MuxTypeSelector` and `MuxSimulator` pick it up automatically

## How to Add a New Quiz Question

1. Open `mux/muxData.js` (or `demux/demuxData.js`)
2. Push a new object onto `MUX_QUIZ` (or `DEMUX_QUIZ`):
   ```js
   { q: "...", opts: ["A","B","C","D"], ans: 2, exp: "...", hint: "..." }
   ```
3. Done — `Quiz` renders all questions dynamically
