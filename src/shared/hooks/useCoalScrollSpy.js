import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const DEFAULT_ROOT_MARGIN = "-30% 0px -55% 0px";

function useCoalScrollSpy(partIds, options = {}) {
  const { rootMargin = DEFAULT_ROOT_MARGIN } = options;
  const navigate = useNavigate();
  const location = useLocation();
  const activeRef = useRef(null);

  // Stabilize the array reference
  const partIdsKey = (partIds || []).join(",");
  const stablePartIds = useMemo(
    () => partIds,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [partIdsKey]
  );

  useEffect(() => {
    const elements = stablePartIds
      .map((id) => document.getElementById(`coal-part-${id}`))
      .filter(Boolean);

    if (elements.length === 0) {
      return () => {}; 
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const id = visible.target.id.replace("coal-part-", "");
        if (id === activeRef.current) return;
        activeRef.current = id;

        navigate(`${location.pathname}#coal-part-${id}`, { replace: true });
      },
      { rootMargin, threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [stablePartIds, navigate, location.pathname, rootMargin]);
}

export { useCoalScrollSpy };
