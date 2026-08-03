import React from "react";
import PremiumLearningShell from "../../../shared/components/topics/PremiumLearningShell";
import { afhdlPages } from "../afhdlConfig";

const PATH_TO_SUBTOPIC_ID = {
  "/arithmetic/binary-adders": "binary-adders",
  "/arithmetic/binary-subtractor": "binary-subtractor",
  "/arithmetic/binary-add-subtractor": "adder-subtractor",
  "/arithmetic/binary-multipliers": "binary-multipliers",
  "/arithmetic/code-conversion": "code-conversion",
  "/arithmetic/magnitude-comparator": "magnitude-comparator",
  "/arithmetic/parity-generators": "parity-generators",
  "/arithmetic/complements": "complements",
  "/arithmetic/signed-unsigned": "signed-unsigned",
  "/arithmetic/design-applications": "design-applications",
};

const AFHDL_TOPIC = {
  id: "arithmetic-functions-and-hdls",
  title: "ARITHMETIC FUNCTIONS AND HDLs",
  links: Object.values(PATH_TO_SUBTOPIC_ID).map((id) => ({ id })),
};

const AFHDLLayout = ({ title, subtitle, intro, highlights = [], children }) => (
  <PremiumLearningShell
    title={title}
    subtitle={subtitle}
    intro={intro}
    highlights={highlights}
    pages={afhdlPages}
    topicLabel="Arithmetic & HDLs"
    sidebarTitle="Arithmetic Toolkit"
    sidebarCopy="Learn one operation at a time, then connect ideas to hardware design."
    heroKicker="Arithmetic Functions and HDLs"
    progressVerb="complete"
    tracking={{
      topic: AFHDL_TOPIC,
      pathToSubtopicId: PATH_TO_SUBTOPIC_ID,
    }}
  >
    {children}
  </PremiumLearningShell>
);

export default AFHDLLayout;
