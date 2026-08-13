import './KMapGenerator.css';
import React, { 
    useState, 
    useTransition, 
    useCallback, 
    useMemo 
} from 'react';
import { 
    InputControls, 
    KMapDisplay, 
    SimplifiedExpression, 
    GroupingGuide, 
    TruthTableDisplay 
} from './components';
import { useKMapLogic } from './hooks';
import Boolforge from '../boolforge/Boolforge';
import RelatedSeoLinks from '../../shared/seo/RelatedSeoLinks';
import { trackToolInteraction } from '../../shared/utils/analytics';
import Navbar from '../../shared/components/navbar';
import { useTheme } from '../../shared/context/ThemeContext';
import {
    CirclePlus, 
    X, 
    Plug,
} from 'lucide-react';

const KMapGenerator = () => {
    const { theme, toggle: toggleTheme } = useTheme();
    const [isPending, startTransition] = useTransition();

    // Single source of truth for the configuration.
    const [activeConfig, setActiveConfig] = useState({
        numVariables: 3,
        variables: ['A', 'B', 'C'],
        inputValue: '',
        dontCares: '',
        optimizationType: 'SOP'
    });

    const [showSolution, setShowSolution] = useState(false);
    const [showGroupingGuide, setShowGroupingGuide] = useState(false);
    const [showCircuitModal, setShowCircuitModal] = useState(false);

    const {
        numVariables,
        variables,
        inputValue,
        dontCares,
        optimizationType
    } = activeConfig;

    const {
        grid,
        expression,
        groups,
        getColumnLabels,
        getRowLabels
    } = useKMapLogic(
        numVariables, 
        variables, 
        inputValue, 
        dontCares, 
        optimizationType
    );

    const handleGenerate = useCallback((newConfig) => {
        trackToolInteraction('kmap_generator', 'generate_solution', {
            variable_count: newConfig.numVariables,
            optimization_type: newConfig.optimizationType,
        });
        startTransition(() => {
            setActiveConfig(newConfig);
            setShowSolution(true);
        });
    }, []);

    const handleExample = useCallback((newConfig) => {
        trackToolInteraction('kmap_generator', 'load_example', {
            variable_count: newConfig.numVariables,
        });
        startTransition(() => {
            setActiveConfig(newConfig);
            setShowSolution(false);
        });
    }, []);

    const handleReset = useCallback(() => {
        trackToolInteraction('kmap_generator', 'reset', {
            variable_count: activeConfig.numVariables,
        });
        startTransition(() => {
            setActiveConfig(prev => ({
                ...prev,
                inputValue: '',
                dontCares: '',
            }));
            setShowSolution(false);
            setShowGroupingGuide(false);
        });
    }, [activeConfig.numVariables]);

    const intermediateTerms = useMemo(() => {
        if (!expression || expression === '1' || expression === '0') return [];
        
        const cleanExpr = expression.includes('=') ? expression.split('=')[1].trim() : expression;
        
        let terms = [];
        if (optimizationType === 'SOP') {
            terms = cleanExpr.split('+').map(t => t.trim()).filter(Boolean);
        } else {
            const matches = cleanExpr.match(/\([^)]+\)/g);
            if (matches) {
                terms = matches.map(m => m.replace(/[()]/g, '').trim());
            }
        }
        return terms.filter(term => !variables.includes(term));
    }, [expression, optimizationType, variables]);

    return (
        <div className={`kmap-page theme-${theme}`}>
            <div className="grid-background" />
            <Navbar toggleTheme={toggleTheme} theme={theme} />

            <main className="kmap-page-main">
                <div className="kmap-workspace">
                    {/* LEFT SIDEBAR */}
                    <aside className="kmap-sidebar">
                        <div className="kmap-sidebar-inner">
                            <p className="kmap-sidebar-label">⚙ Configuration</p>
                            <InputControls
                                initialConfig={activeConfig}
                                isPending={isPending}
                                onGenerate={handleGenerate}
                                onExample={handleExample}
                                onReset={handleReset} 
                            />
                        </div>
                    </aside>

                    {/* RIGHT CANVAS */}
                    <div className="kmap-canvas">
                        <p className="kmap-sidebar-label">Karnaugh Map</p>
                        
                        {!showSolution && (
                            <div className="kmap-empty-state">
                                <div className="kmap-empty-icon">
                                    <CirclePlus className="h-5 w-5" />
                                </div>
                                <h2 className="kmap-empty-title">Your K-Map will appear here</h2>
                                <p className="kmap-empty-hint">
                                    Configure your variables and minterms in the panel on the left,
                                    then click <strong>Generate K-Map</strong>.
                                </p>
                            </div>
                        )}

                        {showSolution && (
                            <div className={`kmap-results-stack ${isPending ? 'kmap-results-pending' : ''}`}>
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
                                    onClick={() => setShowGroupingGuide(!showGroupingGuide)}
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
                                    onClick={() => setShowCircuitModal(true)}
                                    title="Open the interactive circuit editor"
                                >
                                    <Plug className="h-4 w-4" /> Experiment with Circuit
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Circuit Modal */}
                {showCircuitModal && (
                    <div
                        className="circuit-modal-overlay"
                        onClick={(e) => {
                            if (e.target.className === 'circuit-modal-overlay') {
                                setShowCircuitModal(false);
                            }
                        }}
                    >
                        <div className="circuit-modal-container">
                            <button
                                className="circuit-modal-close"
                                onClick={() => setShowCircuitModal(false)}
                                title="Close Circuit Editor"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <Boolforge
                                simplifiedExpression={expression}
                                variables={variables}
                                embedded={true}
                            />
                        </div>
                    </div>
                )}

                <RelatedSeoLinks />
            </main>
        </div>
    );
};

export default KMapGenerator;
