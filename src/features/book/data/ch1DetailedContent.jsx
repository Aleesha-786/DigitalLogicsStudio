import React from 'react';
import {
  ConceptSection,
  SimpleExplanation,
  ScenarioBox,
  WaveformBlock,
  ApplicationSteps,
  BinaryVisual,
  CalculationSteps,
  AnswerHighlight,
  FormulaBox,
  ReferenceTable,
  KeyTakeawayBox,
  KeyInsightBox,
} from '../components/ExplanationBlocks';

/** Problem 1-1: Wind Sensor */
const WindSensorExplanation = () => (
  <>
    <ConceptSection title="🎯 Understanding the Problem">
      <SimpleExplanation>
        Think of an anemometer like a pinwheel that spins faster when the wind blows harder. This
        pinwheel is connected to a special disk that's half clear (like glass) and half black
        (opaque).
      </SimpleExplanation>
      <SimpleExplanation>
        There's a light above the disk and a sensor (photodiode) below it. When the clear part is
        over the sensor, light passes through and the sensor outputs 3V. When the black part is
        over it, no light passes and it outputs 0V.
      </SimpleExplanation>
    </ConceptSection>

    <ConceptSection title="📊 Part (a): Voltage Waveforms">
      <ScenarioBox title="(1) Wind Calm (0 mph)">
        <SimpleExplanation>
          When there's no wind, the disk doesn't spin. It stays in one position.
        </SimpleExplanation>
        <WaveformBlock>{'3V ───────────────────\n  OR\n0V ───────────────────'}</WaveformBlock>
        <SimpleExplanation>
          The voltage is constant - either 3V or 0V depending on which part of the disk is over
          the sensor. There's NO up and down pattern because nothing is moving!
        </SimpleExplanation>
      </ScenarioBox>

      <ScenarioBox title="(2) Wind at 10 mph">
        <SimpleExplanation>
          Now the disk rotates slowly. As it spins, the sensor sees clear, then black, then clear
          again.
        </SimpleExplanation>
        <WaveformBlock>{`3V
──┐    ┌──┐   ┌──
  │    │  │   │
0V└────┘  └───┘  └──
  |--- T --|`}</WaveformBlock>
        <SimpleExplanation>
          This creates a square wave pattern. T is the period (time for one complete cycle). At 10
          mph, the disk spins slowly, so T is relatively long (maybe 0.2 seconds).
        </SimpleExplanation>
      </ScenarioBox>

      <ScenarioBox title="(3) Wind at 100 mph">
        <SimpleExplanation>
          The disk spins VERY fast! The pattern changes much more quickly.
        </SimpleExplanation>
        <WaveformBlock>{'3V ┐┐┐┐┐┐┐┐\n   ││││││││\n0V ┘└┘└┘└┘└\n   |T|'}</WaveformBlock>
        <SimpleExplanation>
          Same square wave, but now the changes happen much faster! T is very short (maybe 0.02
          seconds). The faster the wind, the faster the pattern repeats.
        </SimpleExplanation>
      </ScenarioBox>

      <KeyInsightBox>
        <strong>Key Point:</strong> Wind speed = Frequency of the wave. No wind = no frequency.
        Faster wind = higher frequency!
      </KeyInsightBox>
    </ConceptSection>

    <ConceptSection title="💻 Part (b): What the Computer Needs to Do">
      <ApplicationSteps
        steps={[
          <>
            <strong>Read the Signal:</strong> The computer needs to detect if the voltage is 3V
            (HIGH) or 0V (LOW). It uses a special circuit called an ADC (Analog-to-Digital
            Converter).
          </>,
          <>
            <strong>Count the Changes:</strong> Every time the signal goes from LOW to HIGH (or
            HIGH to LOW), that's one "edge". The computer counts how many edges happen in one
            second.
          </>,
          <>
            <strong>Calculate Frequency:</strong> If there are 100 edges in 1 second, and each
            rotation creates 2 edges, then frequency = 100/2 = 50 rotations per second (50 Hz).
          </>,
          <>
            <strong>Convert to Wind Speed:</strong> Use a formula like: Wind Speed (mph) =
            Frequency × Calibration Factor. For example: Wind Speed = 0.2 × 50 = 10 mph.
          </>,
          <>
            <strong>Convert to Binary:</strong> Finally, convert the wind speed number to binary
            so the computer can store it. Example: 10 mph = 1010₂ in binary.
          </>,
        ]}
      />
      <SimpleExplanation>
        <strong>Simple Summary:</strong> The computer counts how fast the disk is spinning, then
        uses math to figure out the wind speed, and saves it as a binary number!
      </SimpleExplanation>
    </ConceptSection>
  </>
);

/** Problem 1-6: Largest Binary Integer */
const LargestBinaryExplanation = () => (
  <>
    <ConceptSection title="🎯 What Does This Mean?">
      <SimpleExplanation>
        Imagine you have a row of light switches. Each switch can be either ON (1) or OFF (0). The
        question is: what's the biggest number you can make when ALL switches are turned ON?
      </SimpleExplanation>
      <SimpleExplanation>
        For example, with 3 switches: 111 (all ON) = 7, which is bigger than 110 (6), 101 (5), or
        any other combination.
      </SimpleExplanation>
    </ConceptSection>

    <ConceptSection title="🔢 The Magic Formula">
      <FormulaBox>Formula: Largest number with n bits = 2ⁿ - 1</FormulaBox>
      <SimpleExplanation>
        Why? Because with n bits, you can represent 2ⁿ different numbers (from 0 to 2ⁿ-1). The
        largest is 2ⁿ-1 because we start counting from 0!
      </SimpleExplanation>
      <SimpleExplanation>
        Example: With 3 bits, you can represent 2³ = 8 different numbers (0, 1, 2, 3, 4, 5, 6, 7).
        The largest is 7, which equals 2³ - 1.
      </SimpleExplanation>
    </ConceptSection>

    <ConceptSection title="📊 Part (a): 11 bits">
      <BinaryVisual label="All 11 switches ON:" value="11111111111" />

      <CalculationSteps
        title="Method 1 - Using the Formula:"
        steps={['2¹¹ - 1', '= 2,048 - 1', '= 2,047']}
      />

      <CalculationSteps
        title="Method 2 - Adding Place Values:"
        steps={[
          '2¹⁰ + 2⁹ + 2⁸ + 2⁷ + 2⁶ + 2⁵ + 2⁴ + 2³ + 2² + 2¹ + 2⁰',
          '= 1024 + 512 + 256 + 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1',
          '= 2,047',
        ]}
      />

      <AnswerHighlight>
        <code>2,047</code>
      </AnswerHighlight>

      <SimpleExplanation>
        This makes sense! With 11 bits, we can represent 2,048 different values (0 through 2,047).
        The largest is 2,047.
      </SimpleExplanation>
    </ConceptSection>

    <ConceptSection title="📊 Part (b): 25 bits">
      <BinaryVisual label="All 25 switches ON:" value="1111111111111111111111111" />

      <CalculationSteps
        title="Using the Formula:"
        steps={['2²⁵ - 1', '= 33,554,432 - 1', '= 33,554,431']}
      />

      <CalculationSteps
        title="Breaking down 2²⁵:"
        steps={['2²⁵ = 2²⁰ × 2⁵', '= 1,048,576 × 32', '= 33,554,432']}
      />

      <AnswerHighlight>
        <code>33,554,431</code>
      </AnswerHighlight>

      <SimpleExplanation>
        That's about 33.5 million! This could represent 33.5 million different memory addresses
        in a computer.
      </SimpleExplanation>
    </ConceptSection>

    <ConceptSection title="📌 Quick Reference">
      <ReferenceTable
        headers={['Bits', 'Largest Number', 'Formula']}
        rows={[
          ['8', '255', '2⁸ - 1'],
          ['16', '65,535', '2¹⁶ - 1'],
          ['32', '4,294,967,295', '2³² - 1'],
          ['64', '18,446,744,073,709,551,615', '2⁶⁴ - 1'],
        ]}
      />
    </ConceptSection>

    <KeyTakeawayBox title="💡 Remember This!">
      <SimpleExplanation>
        More bits = bigger numbers! That's why modern computers use 64-bit systems - they can
        handle MUCH larger numbers than old 32-bit systems.
      </SimpleExplanation>
      <SimpleExplanation>
        <strong>The Formula:</strong> Just calculate 2ⁿ - 1 where n is the number of bits. Easy!
      </SimpleExplanation>
    </KeyTakeawayBox>
  </>
);

const ch1DetailedContent = {
  '1-1': WindSensorExplanation,
  '1-6': LargestBinaryExplanation,
};

export default ch1DetailedContent;
