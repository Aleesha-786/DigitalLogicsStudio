import { memo } from 'react';
import { CirclePlus } from 'lucide-react';

const KMapEmptyStateBase = () => (
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
);

export const KMapEmptyState = memo(KMapEmptyStateBase);
export default KMapEmptyState;
