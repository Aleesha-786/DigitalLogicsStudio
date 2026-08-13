import './KMapGenerator.css';
import { InputControls, KMapEmptyState, KMapResults } from './components';
import { useKMapLogic, useKMapConfig } from './hooks';
import RelatedSeoLinks from '../../shared/seo/RelatedSeoLinks';
import Navbar from '../../shared/components/navbar';
import { useTheme } from '../../shared/context/ThemeContext';

/**
 * KmapGenerator is pure composition:
 * This component itself only re-renders on theme toggle or on a committed
 * config change (Generate/Example/Reset) — never on a keystroke, and never
 * because of unrelated UI toggles further down the tree.
 */
const KMapGenerator = () => {
    const { theme, toggle: toggleTheme } = useTheme();

    const {
        activeConfig,
        showSolution,
        isPending,
        handleGenerate,
        handleExample,
        handleReset,
    } = useKMapConfig();

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

                        {!showSolution && <KMapEmptyState />}

                        {showSolution && (
                            <KMapResults
                                grid={grid}
                                groups={groups}
                                expression={expression}
                                numVariables={numVariables}
                                variables={variables}
                                inputValue={inputValue}
                                dontCares={dontCares}
                                optimizationType={optimizationType}
                                getColumnLabels={getColumnLabels}
                                getRowLabels={getRowLabels}
                                isPending={isPending}
                            />
                        )}
                    </div>
                </div>

                <RelatedSeoLinks />
            </main>
        </div>
    );
};

export default KMapGenerator;
