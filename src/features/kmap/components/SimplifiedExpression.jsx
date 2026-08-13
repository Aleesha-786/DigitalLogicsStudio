import '../KMapGenerator.css';
import React from 'react';
import { memo } from 'react';

const SimplifiedExpressionBase = ({ expression, showGroupingGuide, onToggleGuide }) => {
    return (
        <div className="kmap-card">
            <h2 className="kmap-section-title">Simplified Expression</h2>
            <div className="kmap-expression-box">
                <div className="kmap-expression">
                    {expression}
                </div>
            </div>
        </div>
    );
};

export const SimplifiedExpression = memo(SimplifiedExpressionBase);
