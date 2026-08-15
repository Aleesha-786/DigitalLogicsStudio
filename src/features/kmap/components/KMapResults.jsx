import { memo, useMemo, useState, useCallback } from 'react';
import { Plug } from 'lucide-react';
import { SimplifiedExpression } from './SimplifiedExpression';
import { KMapDisplay } from './KMapDisplay';
import { TruthTableDisplay } from './TruthTableDisplay';
import { GroupingGuide } from './GroupingGuide';
import { CircuitModal } from './CircuitModal';
import { getIntermediateTerms } from '../utils/getIntermediateTerms';

/**
 * Owns showGroupingGuide and showCircuitModal locally. Neither of those
 * ever needs to live in KmapGenerator — toggling them now only re-renders
 * this subtree, not the sidebar/InputControls, and not the parent page.
 */
const KMapResultsBase = ({
    grid,
    groups,
    expression,
    numVariables,
    variables,
    inputValue,
    dontCares,
    optimizationType,
    getColumnLabels,
    getRowLabels,
    isPending,
}) => {
    const [showGroupingGuide, setShowGroupingGuide] = useState(false);
    const [showCircuitModal, setShowCircuitModal] = useState(false);

    const intermediateTerms = useMemo(
        () => getIntermediateTerms(expression, optimizationType, variables),
        [expression, optimizationType, variables]
    );

    const toggleGroupingGuide = useCallback(() => setShowGroupingGuide((v) => !v), []);
    const openCircuitModal = useCallback(() => setShowCircuitModal(true), []);
    const closeCircuitModal = useCallback(() => setShowCircuitModal(false), []);

    return (
        <div
            className="kmap-results-stack"
            style={{ opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s ease' }}
        >
            <SimplifiedExpression expression={expression} />

            <KMapDisplay
                grid={grid}
                groups={groups}
                numVariables={numVariables}
                variables={variables}
                getColumnLabels={getColumnLabels}
                getRowLabels={getRowLabels}
                showGroupingGuide={showGroupingGuide}
                optimizationType={optimizationType}
            />

            <TruthTableDisplay
                numVariables={numVariables}
                variables={variables}
                inputValue={inputValue}
                dontCares={dontCares}
                optimizationType={optimizationType}
                intermediateTerms={intermediateTerms}
                expression={expression}
            />

            <div className="kmap-section-divider">
                <span />
            </div>

            <button
                className="kmap-btn kmap-btn-outline kmap-btn-full"
                onClick={toggleGroupingGuide}
                style={{ marginTop: 'var(--spacing-lg)' }}
            >
                {showGroupingGuide ? 'Hide' : 'Show'} Grouping Guide
            </button>

            {showGroupingGuide && (
                <GroupingGuide
                    groups={groups}
                    variables={variables}
                    numVariables={numVariables}
                    grid={grid}
                    getColumnLabels={getColumnLabels}
                    getRowLabels={getRowLabels}
                    optimizationType={optimizationType}
                />
            )}

            <button
                className="kmap-btn kmap-btn-circuit"
                onClick={openCircuitModal}
                title="Open the interactive circuit editor"
            >
                <Plug className="h-4 w-4" /> Experiment with Circuit
            </button>

            <CircuitModal
                isOpen={showCircuitModal}
                onClose={closeCircuitModal}
                expression={expression}
                variables={variables}
            />
        </div>
    );
};

export const KMapResults = memo(KMapResultsBase);
export default KMapResults;