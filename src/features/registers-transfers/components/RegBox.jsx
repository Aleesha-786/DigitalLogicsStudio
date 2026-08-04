import React from "react";

/**
 * RegBox – coloured definition/intro box
 * data: { icon, title, description, variant }
 * variant: "primary" | "warning" | "success" | "info"
 */
const RegBox = ({ data = {} }) => {
  const { icon = "📦", title = "", description = "", variant = "primary" } = data;
  return (
    <div className={`reg-box reg-box--${variant}`}>
      <div className="reg-box-icon">{icon}</div>
      <div className="reg-box-body">
        {title && <h3 className="reg-box-title">{title}</h3>}
        {description && <p className="reg-box-desc">{description}</p>}
      </div>
    </div>
  );
};

export default RegBox;
