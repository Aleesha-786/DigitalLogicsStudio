import React from 'react';

/**
 * stats: [{ icon: LucideIcon, label: string }]
 */
const StatsBar = ({ stats = [] }) => (
  <div className="stats-bar">
    {stats.map(({ icon: Icon, label }, index) => (
      <div className="stat-item" key={index}>
        <Icon size={20} />
        <span>{label}</span>
      </div>
    ))}
  </div>
);

export default StatsBar;
