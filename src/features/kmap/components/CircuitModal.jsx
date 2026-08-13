import { memo, useEffect } from 'react';
import { X } from 'lucide-react';
import Boolforge from '../../boolforge/Boolforge';

/**
 * isOpen/onClose are controlled by the parent (KMapResults) so this stays a
 * pure presentational component. Escape-key close was missing before —
 * added here since TruthTableDisplay's modal already sets that precedent.
 */
const CircuitModalBase = ({ isOpen, onClose, expression, variables }) => {
    useEffect(() => {
        if (!isOpen) return undefined;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="circuit-modal-overlay"
            onClick={(e) => {
                if (e.target.className === 'circuit-modal-overlay') {
                    onClose();
                }
            }}
        >
            <div className="circuit-modal-container">
                <button
                    className="circuit-modal-close"
                    onClick={onClose}
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
    );
};

export const CircuitModal = memo(CircuitModalBase);
export default CircuitModal;