import TheoryTopicPage from "../../shared/layouts/TheoryTopicPage";
import { TRACKS } from "../../shared/layouts/tracks";
import { CoalDiagram } from "./data/CoalDiagrams";
import AluFlagsSimulator from "./components/AluFlagsSimulator";
import AssemblyStackSimulator from "./components/AssemblyStackSimulator";

// COAL-specific widgets embedded inline within theory content (e.g. a
// flags-register topic that includes a live ALU flags simulator). These
// stay in features/coal since they're COAL's own practical components —
// the generic theory renderer just knows how to slot them in wherever
// content data references them by key.
const widgetRegistry = {
  "alu-flags-simulator": AluFlagsSimulator,
  "assembly-stack-simulator": AssemblyStackSimulator,
};

export default function CoalTopicPageRoute() {
  return (
    <TheoryTopicPage track={TRACKS.coal} widgetRegistry={widgetRegistry} diagramRenderer={CoalDiagram} />
  );
}
