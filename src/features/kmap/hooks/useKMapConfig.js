import { useState, useCallback, useTransition } from 'react';
import { trackToolInteraction } from '../../../shared/utils/analytics';

const DEFAULT_CONFIG = {
    numVariables: 3,
    variables: ['A', 'B', 'C'],
    inputValue: '',
    dontCares: '',
    optimizationType: 'SOP'
};

/**
 * Owns everything related to the *committed* K-map configuration:
 * - activeConfig: the last config the user actually generated/loaded
 * - showSolution: whether a result set exists yet
 * - isPending: whether a commit (Generate/Example/Reset) is still resolving
 *
 * InputControls keeps its own draft state and only calls into this hook's
 * handlers on button click, so nothing here reacts to keystrokes — only to
 * committed actions.
 */
export const useKMapConfig = (initialConfig = DEFAULT_CONFIG) => {
    const [isPending, startTransition] = useTransition();
    const [activeConfig, setActiveConfig] = useState(initialConfig);
    const [showSolution, setShowSolution] = useState(false);

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
            setActiveConfig((prev) => ({
                ...prev,
                inputValue: '',
                dontCares: '',
            }));
            setShowSolution(false);
        });
    }, [activeConfig.numVariables]);

    return {
        activeConfig,
        showSolution,
        isPending,
        handleGenerate,
        handleExample,
        handleReset,
    };
};

export default useKMapConfig;
