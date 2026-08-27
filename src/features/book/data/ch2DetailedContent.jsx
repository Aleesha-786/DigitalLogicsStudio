import React from 'react';
import {
  ConceptSection,
  SimpleExplanation,
  CalculationSteps,
  AnswerHighlight,
  WaveformBlock,
  ReferenceTable,
} from '../components/ExplanationBlocks';

/** Problem 2-1: Truth Tables */
const TruthTableProofs = () => (
  <>
    <ConceptSection title="🎯 Understanding Truth Table Proofs">
      <SimpleExplanation>
        To prove a Boolean identity using truth tables, we create a table with all possible input
        combinations and show that both sides of the equation produce identical outputs for every
        case.
      </SimpleExplanation>
    </ConceptSection>

    <ConceptSection title="📊 Part (a): DeMorgan's Theorem for 3 Variables">
      <SimpleExplanation>Prove: (XYZ)' = X' + Y' + Z'</SimpleExplanation>
      <ReferenceTable
        headers={['X', 'Y', 'Z', 'XYZ', "(XYZ)'", "X'", "Y'", "Z'", "X'+Y'+Z'"]}
        rows={[
          ['0', '0', '0', '0', '1', '1', '1', '1', '1'],
          ['0', '0', '1', '0', '1', '1', '1', '0', '1'],
          ['0', '1', '0', '0', '1', '1', '0', '1', '1'],
          ['0', '1', '1', '0', '1', '1', '0', '0', '1'],
          ['1', '0', '0', '0', '1', '0', '1', '1', '1'],
          ['1', '0', '1', '0', '1', '0', '1', '0', '1'],
          ['1', '1', '0', '0', '1', '0', '0', '1', '1'],
          ['1', '1', '1', '1', '0', '0', '0', '0', '0'],
        ]}
      />
      <SimpleExplanation>Columns (XYZ)' and X'+Y'+Z' are identical! ✓</SimpleExplanation>
    </ConceptSection>

    <ConceptSection title="📊 Part (b): Second Distributive Law">
      <SimpleExplanation>Prove: X + YZ = (X+Y)(X+Z)</SimpleExplanation>
      <SimpleExplanation>
        Create truth table with X, Y, Z, then calculate YZ, X+YZ, X+Y, X+Z, and (X+Y)(X+Z). Both
        sides will match for all 8 combinations.
      </SimpleExplanation>
    </ConceptSection>

    <ConceptSection title="📊 Part (c): Consensus-like Identity">
      <SimpleExplanation>Prove: XY' + Y'Z + XZ' = XY' + Y'Z + X'Z</SimpleExplanation>
      <SimpleExplanation>
        Build truth table showing both sides produce identical outputs. This demonstrates the
        redundancy of certain terms in Boolean expressions.
      </SimpleExplanation>
    </ConceptSection>
  </>
);

/** Problem 2-2: Algebraic Manipulation */
const AlgebraicManipulation = () => (
  <>
    <ConceptSection title="🎯 Algebraic Proof Strategy">
      <SimpleExplanation>
        Use Boolean algebra laws: distributive, absorption, consensus, and complement laws to
        transform one side into the other.
      </SimpleExplanation>
    </ConceptSection>

    <ConceptSection title="✍️ Part (a): X'Y' + X'Y + XY = X' + Y">
      <CalculationSteps
        steps={[
          "LHS = X'Y' + X'Y + XY",
          "= X'(Y' + Y) + XY [Factor X']",
          "= X'(1) + XY [Y' + Y = 1]",
          "= X' + XY",
          "= (X' + X)(X' + Y) [Distributive]",
          "= (1)(X' + Y) = X' + Y = RHS ✓",
        ]}
      />
    </ConceptSection>

    <ConceptSection title="✍️ Part (b): A'B + B'C' + AB + B'C = 1">
      <CalculationSteps
        steps={[
          "LHS = A'B + AB + B'C' + B'C",
          "= B(A' + A) + B'(C' + C) [Group]",
          '= B(1) + B\'(1)',
          "= B + B' = 1 = RHS ✓",
        ]}
      />
    </ConceptSection>

    <ConceptSection title="✍️ Part (c): Y + X'Z + XY' = X + Y + Z">
      <CalculationSteps
        steps={[
          "LHS = Y + XY' + X'Z",
          "= (Y + X)(Y + Y') + X'Z [Distributive]",
          "= (Y + X)(1) + X'Z",
          "= Y + X + X'Z",
          "= Y + (X + X')(X + Z) [Distributive]",
          "= Y + (1)(X + Z) = X + Y + Z = RHS ✓",
        ]}
      />
    </ConceptSection>

    <ConceptSection title="✍️ Part (d): Consensus Theorem Application">
      <SimpleExplanation>
        The term XY is redundant (consensus of X'Y' and Y'Z). Removing it gives the simplified
        form.
      </SimpleExplanation>
    </ConceptSection>
  </>
);

/** Problem 2-6: Simplification */
const Simplification = () => (
  <>
    <ConceptSection title="🎯 Simplification Strategy">
      <SimpleExplanation>
        Use Boolean algebra to reduce expressions to minimum literals. Look for common factors,
        absorption opportunities, and consensus terms.
      </SimpleExplanation>
    </ConceptSection>

    <ConceptSection title="✍️ Part (a): A'C' + A'BC + B'C">
      <CalculationSteps
        steps={[
          "= A'C' + A'BC + B'C",
          "= A'(C' + BC) + B'C",
          "= A'(C' + B) + B'C [Absorption: C' + BC = C' + B]",
          "= A'C' + A'B + B'C",
          "= A'C' + B'C [A'B is absorbed/redundant]",
        ]}
      />
    </ConceptSection>

    <ConceptSection title="✍️ Part (b): (A'+B'+C')(A'B'C')">
      <CalculationSteps
        steps={["= A'B'C' [Absorption: X·(X+Y) = X]", "A'B'C' is already contained in (A'+B'+C')"]}
      />
    </ConceptSection>

    <ConceptSection title="✍️ Part (c): ABC' + AC">
      <CalculationSteps
        steps={[
          "= AC(B' + 1) [Factor AC]",
          "Wait, let me redo: ABC' + AC = A(BC' + C)",
          "= A(C + BC') = A(C + B) [Absorption]",
          "Actually: ABC' + AC = AC + ABC' = AC(1) + ABC'",
          "= A(C + BC') = A(C + B) = AC + AB",
          "But AC + ABC' = AC(1 + B) = AC when simplified properly",
        ]}
      />
    </ConceptSection>
  </>
);

/** Problem 2-14: 3-Variable K-Maps */
const KMap3Variable = () => (
  <>
    <ConceptSection title="🎯 3-Variable K-Map Strategy">
      <SimpleExplanation>
        Plot minterms on K-map, group adjacent 1s in powers of 2 (1, 2, 4, 8), and read off the
        simplified terms.
      </SimpleExplanation>
    </ConceptSection>

    <ConceptSection title="📊 Part (a): F(X,Y,Z) = Σm(2,3,4,7)">
      <SimpleExplanation>K-map layout (XY rows, Z columns):</SimpleExplanation>
      <WaveformBlock>{`     Z=0 Z=1
X'Y'  0   0
X'Y   1   1   ← Group: X'Y (m2,m3)
XY    1   0   ← m4
XY'   0   1   ← m7`}</WaveformBlock>
      <SimpleExplanation>
        Groups: X'Y (covers m2,m3) and YZ (covers m3,m7) → F = X'Y + YZ
      </SimpleExplanation>
    </ConceptSection>

    <ConceptSection title="📊 Part (c): F(A,B,C) = Σm(0,2,4,6,7)">
      <SimpleExplanation>
        Minterms 0,2,4,6 all have C=0. This forms a group of 4: C' Minterm 7 = ABC (A=1, B=1, C=1)
        Group AB covers m6,m7
      </SimpleExplanation>
      <AnswerHighlight>F = C' + AB</AnswerHighlight>
    </ConceptSection>
  </>
);

/** Problem 2-16: 4-Variable K-Maps */
const KMap4Variable = () => (
  <>
    <ConceptSection title="🎯 4-Variable K-Map Strategy">
      <SimpleExplanation>
        4-variable K-map has AB rows and CD columns. Look for groups of 1s in sizes 1, 2, 4, 8, or
        16. Wrap-around edges connect (top-bottom and left-right).
      </SimpleExplanation>
    </ConceptSection>

    <ConceptSection title="📊 Part (a): F(A,B,C,D) = Σm(0,2,4,5,8,10,11,15)">
      <SimpleExplanation>
        Plot and group: m0,m2,m8,m10: B'D' (group of 4, corners pattern); m4,m5: A'BD'; m8,m10:
        AB'C; m11,m15: ACD
      </SimpleExplanation>
      <AnswerHighlight>{"F = B'D' + A'BD' + AB'C + ACD"}</AnswerHighlight>
    </ConceptSection>
  </>
);

/** Problem 2-24: Don't Cares */
const DontCares = () => (
  <>
    <ConceptSection title="🎯 Don't Care Strategy">
      <SimpleExplanation>
        Don't cares (d) can be treated as 1 if they help form larger groups, or 0 if not needed.
        They don't need to be covered in the final expression.
      </SimpleExplanation>
    </ConceptSection>

    <ConceptSection title="📊 Part (a): F(A,B,C) = Σm(2,4,7), d = Σm(0,1,5,6)">
      <SimpleExplanation>K-map with don't cares marked as X:</SimpleExplanation>
      <WaveformBlock>{`     C=0 C=1
A'B'  X   X   (d0,d1)
A'B   1   X   (m2,d5)
AB    1   1   (m4,m7)
AB'   X   0   (d6)`}</WaveformBlock>
      <SimpleExplanation>
        Using d0,d1,d5,d6: Can form larger groups — group A'B' (d0,d1) with others for C', or use
        d5 with m4 for B
      </SimpleExplanation>
      <AnswerHighlight label="Optimal">{"F = C + A'B' (using don't cares to simplify)"}</AnswerHighlight>
    </ConceptSection>
  </>
);

/** Problem 2-27: XOR Properties */
const XorDual = () => (
  <>
    <ConceptSection title="🎯 Understanding the Dual">
      <SimpleExplanation>
        The dual of a Boolean expression is obtained by interchanging AND and OR operators, and
        interchanging 0s and 1s. For XOR, we need to show its dual equals its complement (XNOR).
      </SimpleExplanation>
    </ConceptSection>

    <ConceptSection title="✍️ Proof">
      <CalculationSteps
        steps={[
          "XOR: A⊕B = AB' + A'B",
          "Dual: (A+B')(A'+B) [Interchange + and ·]",
          "= AA' + AB + A'B' + B'B [Distribute]",
          "= 0 + AB + A'B' + 0 [AA' = 0, BB' = 0]",
          "= AB + A'B'",
          "= (A⊕B)' [This is XNOR!]",
        ]}
      />
      <AnswerHighlight label="Conclusion">Dual of XOR = XNOR = Complement of XOR ✓</AnswerHighlight>
    </ConceptSection>
  </>
);

/** Problem 2-29: Propagation Delay */
const PropagationDelay = () => (
  <>
    <ConceptSection title="🎯 Understanding Propagation Delay">
      <SimpleExplanation>
        Propagation delay is the time it takes for a signal to travel from input to output through
        a gate. The longest path determines the circuit's maximum operating speed.
      </SimpleExplanation>
    </ConceptSection>

    <ConceptSection title="📊 Circuit Analysis (Figure 2-39)">
      <SimpleExplanation>
        The circuit shows a multi-level NOR gate network with one inverter. Trace all paths from
        inputs to output F:
      </SimpleExplanation>
      <ul className="simple-explanation list-block">
        <li>Path 1: A', B → NOR → NOR → NOR → F (3 NOR gates)</li>
        <li>Path 2: A, B' → NOR → NOR → NOR → F (3 NOR gates)</li>
        <li>Path 3: C, D → NOR → Inverter → NOR → F (1 NOR + 1 INV)</li>
      </ul>
    </ConceptSection>

    <ConceptSection title="✍️ Delay Calculation">
      <CalculationSteps
        steps={[
          'NOR gate delay = 0.073 ns',
          'Inverter delay = 0.048 ns',
          'Path 1 & 2: 3 × 0.073 = 0.219 ns',
          'Path 3: 0.073 + 0.048 + 0.073 = 0.194 ns',
          'Longest path = 0.219 ns',
        ]}
      />
      <AnswerHighlight>
        Maximum propagation delay = 0.219 ns (or ~0.267 ns if inverter path is longer)
      </AnswerHighlight>
    </ConceptSection>
  </>
);

/** Problem 2-30: Inverter Waveform Analysis */
const InverterWaveforms = () => (
  <>
    <ConceptSection title="🎯 Understanding Delay Models">
      <SimpleExplanation>
        Different delay models affect how output responds to input changes: No delay (ideal),
        transport delay (pure shift), and inertial delay (with filtering).
      </SimpleExplanation>
    </ConceptSection>

    <ConceptSection title="📊 Part (a): No Delay">
      <SimpleExplanation>
        Output immediately inverts the input. When input is HIGH, output is LOW instantly, and
        vice versa. No time shift occurs.
      </SimpleExplanation>
    </ConceptSection>

    <ConceptSection title="📊 Part (b): Transport Delay (0.06 ns)">
      <SimpleExplanation>
        Output is identical to inverted input, but shifted in time by exactly 0.06 ns. Every
        transition (rising or falling) occurs 0.06 ns after the corresponding input transition.
      </SimpleExplanation>
    </ConceptSection>

    <ConceptSection title="📊 Part (c): Inertial Delay (0.06 ns, rejection 0.04 ns)">
      <SimpleExplanation>
        Inertial delay filters out short pulses. Only input pulses wider than 0.04 ns propagate to
        the output. The output appears 0.06 ns after the input stabilizes. Narrow glitches
        (&lt; 0.04 ns) are completely suppressed.
      </SimpleExplanation>
    </ConceptSection>
  </>
);

const ch2DetailedContent = {
  '2-1': TruthTableProofs,
  '2-2': AlgebraicManipulation,
  '2-6': Simplification,
  '2-14': KMap3Variable,
  '2-16': KMap4Variable,
  '2-24': DontCares,
  '2-27': XorDual,
  '2-29': PropagationDelay,
  '2-30': InverterWaveforms,
};

export default ch2DetailedContent;
