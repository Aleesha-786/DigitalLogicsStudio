import React from "react";
import RegLayout from "./RegLayout";
import RegBox from "./components/RegBox";
import RegTable from "./components/RegTable";
import RegGrid from "./components/RegGrid";
import RegData from "./data/RegData";

const RegRippleCounters = () => (
  <RegLayout
    title="Ripple Counters"
    subtitle="The simplest asynchronous counters — cheap and low-power, but with a critical weakness: glitches that can fool downstream logic into misfires."
  >
    <div className="reg-content-body">
      <RegBox data={RegData.rippleCounters.box} />

      {/* ── How it works ── */}
      <h2>The Domino Chain — How a Ripple Counter Operates</h2>
      <p>
        Connect four T flip-flops (or JK flip-flops wired to toggle) in series.
        The external clock feeds FF0. Each subsequent flip-flop is clocked by
        the <code>Q̄</code> (inverted Q) output of the previous stage. This means
        FF1 only toggles when FF0 transitions from 1 → 0, FF2 only when FF1
        transitions, and so on — creating the familiar binary counting sequence.
      </p>

      <div className="reg-analogy">
        <p className="reg-analogy-text">
          Think of a ripple counter like a mechanical odometer in a car — the
          first wheel spins freely, and only when it completes a full revolution
          does it nudge the next wheel. Each wheel has to wait for the previous
          one to finish.
        </p>
        <span className="reg-analogy-label">🚗 Analogy</span>
      </div>

      {/* ── State table ── */}
      <h2>4-Bit Count Sequence</h2>
      <p>
        The table below shows how a 4-bit ripple counter progresses through its
        16 states (0–15), then overflows back to 0. This "natural modulus-16"
        behaviour is what makes counters useful for frequency division — the MSB
        (Q3) toggles at exactly 1/16th of the input clock frequency.
      </p>

      <RegTable data={RegData.rippleCounters.table} />

      {/* ── Propagation delay ── */}
      <h2>The Propagation Delay Problem</h2>
      <p>
        Each flip-flop has a finite propagation delay <code>t_FF</code> — the
        time from its clock edge to when its Q output settles to a valid logic
        level. In a ripple counter, these delays stack up in series:
      </p>

      <div className="reg-formula">
        t_total = n × t_FF
        <span className="reg-formula-label">
          Worst-case settle time for an n-bit ripple counter (e.g. 4 × 10 ns =
          40 ns)
        </span>
      </div>

      <p>
        This means a 4-bit counter built from flip-flops with 10 ns propagation
        delay can't be clocked faster than about 25 MHz — and that's{" "}
        <em>before</em> counting any additional combinational logic. A
        synchronous counter with the same flip-flops might run at 100 MHz or
        more.
      </p>

      <div className="reg-callout reg-callout--danger">
        <span className="reg-callout-icon">👻</span>
        <div className="reg-callout-body">
          <p className="reg-callout-title">The Glitch Problem</p>
          <p className="reg-callout-text">
            Consider the transition from 7 (0111) to 8 (1000). Ideally these are
            simultaneous, but with ripple delay, the output passes through 0110
            → 0100 → 0000 → 1000 before settling. Any decoder watching the
            counter output will briefly see counts of 6, 4, and 0 — potentially
            triggering false outputs. This is why ripple counters are dangerous
            in decoded output circuits.
          </p>
        </div>
      </div>

      {/* ── Characteristics ── */}
      <h2>Ripple Counter Characteristics</h2>
      <RegGrid data={RegData.rippleCounters.grid} />

      {/* ── Mod-N ── */}
      <h2>Building a Mod-N Ripple Counter</h2>
      <p>
        To make the counter reset at any count N (instead of 2<sup>k</sup>), use
        the flip-flops' <strong>asynchronous clear (CLR)</strong> inputs. A NAND
        gate decodes when the counter reaches N, and its output immediately
        resets all flip-flops to zero. The counter spends only a few nanoseconds
        at count N before resetting — a narrow glitch that usually doesn't
        matter in practice.
      </p>
      <ul>
        <li>
          For Mod-10 (BCD decade counter): reset when Q3·Q1 = 1 (count 10 =
          1010).
        </li>
        <li>
          For Mod-6 (hours ones digit): reset when Q2·Q1 = 1 (count 6 = 0110).
        </li>
        <li>
          Classic IC: <code>74HC90</code> — a divide-by-2 and divide-by-5
          asynchronous counter combinable for ÷10.
        </li>
      </ul>

      <div className="reg-callout reg-callout--info">
        <span className="reg-callout-icon">🕐</span>
        <div className="reg-callout-body">
          <p className="reg-callout-title">Real-World Use: Digital Clocks</p>
          <p className="reg-callout-text">
            Classic digital clock chips (like the MM5387) used cascaded Mod-10
            and Mod-6 ripple counters to divide a 32.768 kHz crystal oscillator
            down to 1 Hz, then count seconds (Mod-60), minutes (Mod-60), and
            hours (Mod-12 or Mod-24). Ripple counters were perfect for this
            slow-speed application.
          </p>
        </div>
      </div>

      <h2>When to Use Ripple Counters Today</h2>
      <p>
        Be honest: for new designs on FPGAs or ASICs, you should almost always
        use a <strong>synchronous counter</strong>. However, ripple counters
        remain relevant in:
      </p>
      <ul>
        <li>
          Ultra-low-power discrete designs (the reduced switching activity saves
          energy).
        </li>
        <li>
          Simple clock division where the output only drives a slow,
          non-glitch-sensitive load (e.g., toggling an LED at a visible rate).
        </li>
        <li>
          Educational contexts — ripple counters clearly illustrate flip-flop
          cascade, propagation delay, and the origin of timing hazards.
        </li>
      </ul>
    </div>
  </RegLayout>
);

export default RegRippleCounters;
