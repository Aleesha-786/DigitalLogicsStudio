import React from "react";

/**
 * RegTable – renders a table from data
 * data: { title?, headers: string[], rows: string[][] }
 */
const RegTable = ({ data = {} }) => {
  const { title, headers = [], rows = [] } = data;
  return (
    <div className="reg-table-wrap">
      {title && <h4 className="reg-table-title">{title}</h4>}
      <table className="reg-table">
        {headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((h, i) => <th key={i}>{h}</th>)}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => <td key={ci}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RegTable;
