import React from 'react';

/**
 * icon / decorationIcon are lucide-react components, passed in rather than
 * hardcoded, so this header can be reused for any chapter.
 */
const SolverHeader = ({ icon: Icon, decorationIcon: Decoration, title, subtitle }) => (
  <div className="solver-header">
    <div className="header-content">
      <div className="icon-container">
        <Icon size={56} />
      </div>
      <div className="header-text">
        <h1 className="main-title">{title}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>
    </div>
    <div className="binary-decoration">
      <Decoration size={40} />
    </div>
  </div>
);

export default SolverHeader;
