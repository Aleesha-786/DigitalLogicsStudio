import { useState } from 'react';
import { calculateXOR3, calculateParity, generateOddFunctionTruthTable } from '../utils/logicHelpers';

/**
 * Encapsulates the A/B/C toggle state for the Odd Function page and derives
 * the XOR / parity outputs plus the static truth table used by
 * InteractiveDemo.
 */
export function useOddFunction() {
  const [inputValues, setInputValues] = useState({
    A: false,
    B: false,
    C: false,
  });

  const handleInputChange = (newInputs) => {
    setInputValues(newInputs);
  };

  const xorOutput = calculateXOR3(inputValues);
  const parityOutput = calculateParity(inputValues);
  const truthTableData = generateOddFunctionTruthTable();

  return {
    inputValues,
    handleInputChange,
    xorOutput,
    parityOutput,
    truthTableData,
  };
}
