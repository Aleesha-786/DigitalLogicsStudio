import React from "react";

/**
 * RegGrid – renders a grid of info cards
 * data: { title?, items: [{ icon, label, description }] }
 */
const RegGrid = ({ data = {} }) => {
  const { title, items = [] } = data;
  return (
    <div className="reg-grid-wrap">
      {title && <h4 className="reg-grid-title">{title}</h4>}
      <div className="reg-grid">
        {items.map((item, i) => (
          <div key={i} className="reg-grid-card">
            {item.icon && <span className="reg-grid-card-icon">{item.icon}</span>}
            <strong className="reg-grid-card-label">{item.label}</strong>
            {item.description && (
              <p className="reg-grid-card-desc">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegGrid;
