import React from 'react';
import { ConceptSection, SimpleExplanation, KeyTakeawayBox } from './ExplanationBlocks';

const DefaultExplanation = ({ problem, getExplanation, getKeyTakeaway }) => (
  <>
    <ConceptSection title="📖 Understanding the Problem">
      <SimpleExplanation>
        This problem deals with {(problem.category || '').toLowerCase()}. Let me break down the
        solution step by step.
      </SimpleExplanation>
    </ConceptSection>

    <ConceptSection title="✍️ Step-by-Step Solution">
      <SimpleExplanation>{problem.shortAnswer}</SimpleExplanation>
    </ConceptSection>

    <ConceptSection title="🔍 Detailed Breakdown">
      <SimpleExplanation>{getExplanation(problem.id)}</SimpleExplanation>
    </ConceptSection>

    <KeyTakeawayBox title="💡 Key Takeaway">
      <SimpleExplanation>{getKeyTakeaway(problem.id)}</SimpleExplanation>
    </KeyTakeawayBox>
  </>
);

export default DefaultExplanation;
