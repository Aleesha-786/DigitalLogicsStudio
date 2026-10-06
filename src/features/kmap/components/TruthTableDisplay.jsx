import '../KMapGenerator.css';
import React, { useState, memo, useMemo, useEffect, useCallback } from "react";
import { Maximize2, X } from 'lucide-react';
import { compile } from 'mathjs';

// Pre-transform boolean expression syntax into standard mathjs notation
const prepareExpression = (expression, variables) => {
    if (!expression) return null;
    let expr = expression;

    // Sort variable names by length descending to prevent replacing substrings prematurely
    const sortedVars = [...variables].map((v, i) => ({ v, i })).sort((a, b) => b.v.length - a.v.length);

    sortedVars.forEach(({ v }) => {
        // Convert complement notation (e.g., A' -> not(A))
        expr = expr.split(`${v}'`).join(` not(${v}) `);
    });

    expr = expr
        .replace(/·/g, ' and ')
        .replace(/\./g, ' and ')
        .replace(/\+/g, ' or ')
        .replace(/⊕/g, ' xor ')
        .replace(/&&/g, ' and ')
        .replace(/\|\|/g, ' or ')
        .replace(/!/g, ' not ')
        .replace(/(\d|\)|[a-zA-Z])(?=\(|\d|not\b|[a-zA-Z])/g, '$1 and ');

    try {
        return compile(expr);
    } catch (e) {
        return null;
    }
};

const TruthTableDisplayBase = ({ 
    numVariables, 
    variables, 
    inputValue, 
    dontCares, 
    optimizationType = 'SOP', 
    intermediateTerms = [], 
    expression = "" 
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Escape key modal close handler
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsModalOpen(false);
        };
        if (isModalOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen]);

    const isPOS = optimizationType === 'POS';

    // Memoize input minterm/maxterm sets
    const inputSet = useMemo(() => {
        return new Set(
            inputValue
                .split(',')
                .map((m) => m.trim())
                .filter((m) => m !== '')
                .map((m) => parseInt(m, 10))
                .filter((num) => !isNaN(num))
        );
    }, [inputValue]);

    const dontCareSet = useMemo(() => {
        return new Set(
            dontCares
                .split(',')
                .map((m) => m.trim())
                .filter((m) => m !== '')
                .map((m) => parseInt(m, 10))
                .filter((num) => !isNaN(num))
        );
    }, [dontCares]);

    const cleanExpression = useMemo(() => {
        const raw = expression.includes('=') ? expression.split('=')[1].trim() : expression;
        return prepareExpression(raw, variables);
    }, [expression, variables]);

    const compiledIntermediateTerms = useMemo(() => {
        return intermediateTerms.map((term) => ({
            raw: term,
            compiled: prepareExpression(term, variables)
        }));
    }, [intermediateTerms, variables]);

    const evaluateCompiled = useCallback((compiledCode, scope) => {
        if (!compiledCode) return '-';
        try {
            return compiledCode.evaluate(scope) ? 1 : 0;
        } catch {
            return '-';
        }
    }, []);

    const totalRows = useMemo(() => Math.pow(2, numVariables), [numVariables]);

    const renderTable = (showIntermediate) => (
        <table className="kmap-truth-table kmap-table-full">
            <thead>
                <tr>
                    <th>{isPOS ? 'Maxterm' : 'Minterm'}</th>
                    {variables.map((v, idx) => (
                        <th key={`var-${idx}`}>{v}</th>
                    ))}
                    {showIntermediate &&
                        compiledIntermediateTerms.map((item, idx) => (
                            <th key={`term-head-${idx}`}>{item.raw}</th>
                        ))}
                    <th>F</th>
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: totalRows }, (_, i) => {
                    const binary = i.toString(2).padStart(numVariables, '0');
                    
                    // Construct scope object for evaluation (e.g., { A: 1, B: 0 })
                    const scope = {};
                    variables.forEach((v, idx) => {
                        scope[v] = parseInt(binary[idx], 10);
                    });

                    let output;
                    if (dontCareSet.has(i)) {
                        output = (showIntermediate && cleanExpression) 
                            ? evaluateCompiled(cleanExpression, scope) 
                            : 'X';
                    } else if (isPOS) {
                        output = inputSet.has(i) ? 0 : 1;
                    } else {
                        output = inputSet.has(i) ? 1 : 0;
                    }

                    return (
                        <tr key={i}>
                            <td className="input-term-cell">{isPOS ? 'M' : 'm'}{i}</td>
                            {binary.split('').map((bit, idx) => (
                                <td key={`bit-${idx}`}>{bit}</td>
                            ))}
                            {showIntermediate &&
                                compiledIntermediateTerms.map((item, idx) => (
                                    <td key={`term-val-${idx}`} className="intermediate-cell">
                                        {evaluateCompiled(item.compiled, scope)}
                                    </td>
                                ))}
                            <td className={`output-cell ${output === 1 ? 'output-1' : output === 0 ? 'output-0' : 'output-x'}`}>
                                {output}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    );

    return (
        <>
            <div className="kmap-card">
                <div className="kmap-truth-table-header">
                    <h2 className="kmap-section-title kmap-mb-0">Truth Table</h2>
                    {intermediateTerms.length > 0 && (
                        <button 
                            className="tt-expand-btn"
                            onClick={() => setIsModalOpen(true)}
                            title="Expand to see step-by-step Truth Table"
                            aria-label="Expand Truth Table"
                        >
                            <Maximize2 className="h-5 w-5" />
                        </button>
                    )}
                </div>
                <div className="kmap-truth-table-wrap">{renderTable(false)}</div>
            </div>

            {isModalOpen && (
                <div 
                    className="circuit-modal-overlay tt-overlay-fixed" 
                    onClick={(e) => { 
                        if (e.target.classList.contains('circuit-modal-overlay')) setIsModalOpen(false); 
                    }}
                >
                    <div className="circuit-modal-container tt-modal-inner">
                        <button 
                            className="circuit-modal-close" 
                            onClick={() => setIsModalOpen(false)} 
                            title="Close Truth Table"
                            aria-label="Close Truth Table"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <div className="tt-modal-header">
                            <h2>Step-by-Step Truth Table</h2>
                        </div>
                        <div className="kmap-truth-table-wrap tt-modal-body">
                            {renderTable(true)}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export const TruthTableDisplay = memo(TruthTableDisplayBase);
