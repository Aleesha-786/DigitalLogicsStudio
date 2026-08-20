import { IC_META, IC_TYPES } from "../../../shared/data/gates";

export const computeGateOutput = (gate, inputs, outputIndex = 0) => {
  const ci = inputs.filter((v) => v !== undefined);
  switch (gate.type) {
    case "INPUT":
      return gate.inputValues[0] || false;
    // ... [PASTE AAP KA BAAQI POORA SWITCH CASE YAHAN] ...
    default:
      return false;
  }
};