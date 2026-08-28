import React from 'react';
import { Plus, X } from 'lucide-react';

export const SheetTabs = ({
  sheets,
  activeSheetId,
  onSwitchSheet,
  onAddSheet,
  onRenameSheet,
  onDeleteSheet,
}) => {
  const handleRename = (id, currentName) => {
    const next = window.prompt('Rename sheet', currentName);
    if (next != null && next.trim()) onRenameSheet(id, next.trim());
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (sheets.length <= 1) return;
    onDeleteSheet(id);
  };

  return (
    <div className="sheet-tabs-wrapper sheet-tabs-wrapper--excel">
      {sheets.map((sheet) => (
        <div
          key={sheet.id}
          className={`sheet-tab${activeSheetId === sheet.id ? ' sheet-tab--active' : ''}`}
        >
          <button
            className="sheet-tab-btn"
            onClick={() => onSwitchSheet(sheet.id)}
            onDoubleClick={() => handleRename(sheet.id, sheet.name)}
            title="Double-click to rename"
          >
            {sheet.name}
          </button>

          {sheets.length > 1 && (
            <button
              className="sheet-tab-close"
              onClick={(e) => handleDelete(e, sheet.id)}
              title="Close sheet"
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          )}
        </div>
      ))}

      <button className="sheet-tab-add" onClick={() => onAddSheet()} title="Add New Sheet">
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
};
