import { useState } from 'react';
import { gateImplementations } from '../data/universalGatesData';

/**
 * Encapsulates which universal gate (NAND/NOR) is currently selected on the
 * Universal Gates page, and resolves the corresponding data record.
 */
export function useUniversalGate(initialGate = 'NAND') {
  const [selectedGate, setSelectedGate] = useState(initialGate);
  const currentGate = gateImplementations[selectedGate];

  return { selectedGate, setSelectedGate, currentGate };
}
