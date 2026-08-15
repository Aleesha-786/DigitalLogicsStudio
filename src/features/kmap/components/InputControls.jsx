import '../KMapGenerator.css';
import React, { memo, useState } from 'react';
import { Cpu, FileCode, RotateCcw } from 'lucide-react';

export const InputControls = memo(({
    initialConfig,
    isPending = false,
    onGenerate,
    onExample,
    onReset,
}) => {
    const [numVariables, setNumVariables] = useState(initialConfig?.numVariables || 3);
    const [variables, setVariables] = useState(initialConfig?.variables || ['A', 'B', 'C']);
    const [inputValue, setInputValue] = useState(initialConfig?.inputValue || '');
    const [dontCares, setDontCares] = useState(initialConfig?.dontCares || '');
    const [optimizationType, setOptimizationType] = useState(initialConfig?.optimizationType || 'SOP');

    const handleNumVariablesChange = (value) => {
        const num = parseInt(value, 10);
        setNumVariables(num);
        const defaultVars = ['A', 'B', 'C', 'D'];
        setVariables(defaultVars.slice(0, num));
    };

    const handleVariableNameChange = (index, value) => {
        const newVars = [...variables];
        newVars[index] = value.toUpperCase().charAt(0) || '';
        setVariables(newVars);
    };

    const maxTermValue = Math.pow(2, numVariables) - 1;

    const sanitizeTermInput = (value) => {
        let cleaned = value.replace(/,+/g, ',').replace(/^,/, '');
        const hasTrailingComma = cleaned.endsWith(',');
        const validTokens = cleaned
            .split(',')
            .map((token) => token.trim())
            .filter((token) => {
                if (token === '') return false;
                const num = parseInt(token, 10);
                return !isNaN(num) && num >= 0 && num <= maxTermValue;
            });
        return validTokens.join(',') + (hasTrailingComma && validTokens.length > 0 ? ',' : '');
    };

    const handleLocalGenerate = () => {
        onGenerate({ numVariables, variables, inputValue, dontCares, optimizationType });
    };

    const handleLocalExample = () => {
        let exampleInput, exampleDontCares;
        if (numVariables === 3) {
            exampleInput = '0,1,2,5,6,7';
            exampleDontCares = '3,4';
        } else if (numVariables === 4) {
            exampleInput = '0,1,2,5,6,7,8,9,10,14';
            exampleDontCares = '3,11,12,13,15';
        } else {
            exampleInput = '0,2,3';
            exampleDontCares = '1';
        }
        
        setInputValue(exampleInput);
        setDontCares(exampleDontCares);
        
        onExample({
            numVariables,
            variables,
            inputValue: exampleInput,
            dontCares: exampleDontCares,
            optimizationType
        });
    };

    const handleLocalReset = () => {
        setInputValue('');
        setDontCares('');
        onReset();
    };

    const isSOP = optimizationType === "SOP";
    const termLabel = isSOP ? "Minterms" : "Maxterms";
    const examplePlaceholder = isSOP ? "e.g., 0,1,2,5,6,7" : "e.g., 3,4,8,11";

    return (
        <div className="kmap-card">
            <h2 className="kmap-section-title">Configuration</h2>

            <div className="kmap-controls-grid">
                <div className="kmap-control-group">
                    <label className="kmap-label">Number of Variables</label>
                    <select
                        className="kmap-input"
                        value={numVariables}
                        onChange={(e) => handleNumVariablesChange(e.target.value)}
                    >
                        <option value="2">2 Variables</option>
                        <option value="3">3 Variables</option>
                        <option value="4">4 Variables</option>
                    </select>
                </div>

                <div className="kmap-control-group">
                    <label className="kmap-label" title="Select SOP (Sum of Products) or POS (Product of Sums)">
                        Optimization
                    </label>
                    <select
                        className="kmap-input"
                        value={optimizationType}
                        onChange={(e) => setOptimizationType(e.target.value)}
                    >
                        <option value="SOP">Sum of Products (SOP)</option>
                        <option value="POS">Product of Sums (POS)</option>
                    </select>
                </div>

                <div className="kmap-control-group">
                    <label className="kmap-label">Variable Names</label>
                    <div className="kmap-var-inputs">
                        {variables.map((variable, index) => (
                            <input
                                key={index}
                                type="text"
                                className="kmap-input kmap-var-input"
                                value={variable}
                                onChange={(e) => handleVariableNameChange(index, e.target.value)}
                                maxLength="1"
                            />
                        ))}
                    </div>
                </div>

                <div className="kmap-control-group">
                    <label className="kmap-label" title={`Enter ${termLabel.toLowerCase()} (comma separated)`}>
                        {termLabel}
                    </label>
                    <input
                        type="text"
                        className="kmap-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(sanitizeTermInput(e.target.value))}
                        placeholder={examplePlaceholder}
                    />
                    <p className="kmap-helper-text">
                        Decimal numbers 0–{maxTermValue}
                    </p>
                </div>

                <div className="kmap-control-group">
                    <label className="kmap-label" title="Optional: terms that can be 0 or 1">
                        Don't Cares
                    </label>
                    <input
                        type="text"
                        className="kmap-input"
                        value={dontCares}
                        onChange={(e) => setDontCares(sanitizeTermInput(e.target.value))}
                        placeholder="e.g., 3,4,12"
                    />
                </div>

                {/* Core Action Button Row */}
                <div className="kmap-btn-row">
                    <button
                        className="kmap-btn kmap-btn-primary"
                        onClick={handleLocalGenerate}
                        disabled={isPending}
                        title="Solve the KMap"
                    >
                        <Cpu className="h-5 w-5" /> 
                        {isPending ? 'GENERATING...' : 'GENERATE'}
                    </button>
                    <button
                        className="kmap-btn kmap-btn-secondary"
                        onClick={handleLocalExample}
                        disabled={isPending}
                        title="Load a prefilled example"
                    >
                        <FileCode className="h-5 w-5" /> 
                        EXAMPLE
                    </button>
                    <button
                        className="kmap-btn kmap-btn-outline"
                        onClick={handleLocalReset}
                        disabled={isPending}
                        title="Clear all inputs"
                    >
                        <RotateCcw className="h-5 w-5" /> 
                        RESET
                    </button>
                </div>
            </div>
        </div>
    );
});
