import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthLabel, weekdayLabels } from "../utils/problemsUtils";

/* Memoized: only re-renders when the visible month or the computed day
   matrix actually change — not on every ProblemsPage state update
   (search typing, filter clicks, etc). */
const CalendarWidget = React.memo(function CalendarWidget({
  month,
  setMonth,
  monthMatrix,
}) {
  const days = monthMatrix(month);
  const firstWeekday = new Date(days[0]?.date || month).getDay();
  const blanks = Array.from(
    { length: firstWeekday },
    (_, index) => `blank-${index}`,
  );

  return (
    <section className="problems-widget">
      <div className="problems-widget-head">
        <div>
          <span className="problems-widget-label">Activity</span>
          <h3>{monthLabel(month)}</h3>
        </div>
        <div className="calendar-nav">
          <button
            type="button"
            onClick={() =>
              setMonth(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
              )
            }
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() =>
              setMonth(
                (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
              )
            }
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="calendar-weekdays">
        {weekdayLabels.map((label, index) => (
          <span key={`${label}-${index}`}>{label}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {blanks.map((blank) => (
          <span key={blank} className="calendar-cell calendar-cell-blank" />
        ))}

        {days.map((day) => (
          <div
            key={day.date}
            className={`calendar-cell intensity-${day.intensity}`}
            title={`${day.date}: ${day.solved} solved, ${day.attempts} attempts, ${day.topicsCompleted} topics completed`}
          >
            {Number(day.date.slice(-2))}
          </div>
        ))}
      </div>

      <div className="calendar-legend">
        <span>Less</span>
        <div className="calendar-legend-scale">
          {[0, 1, 2, 3, 4].map((tone) => (
            <span key={tone} className={`calendar-cell intensity-${tone}`} />
          ))}
        </div>
        <span>More</span>
      </div>
    </section>
  );
});

export default CalendarWidget;
