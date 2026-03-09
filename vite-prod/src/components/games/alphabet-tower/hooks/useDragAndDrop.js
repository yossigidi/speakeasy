import { useCallback, useRef, useState } from 'react';

/**
 * @typedef {Object} ActiveDrag
 * @property {string} id - The ID of the dragged item
 * @property {number} x - Current pointer X position (viewport coords)
 * @property {number} y - Current pointer Y position (viewport coords)
 */

/**
 * @typedef {Object} UseDragAndDropOptions
 * @property {(itemId: string, zoneId: string) => void} onDrop - Called when an item is dropped on a valid drop zone
 * @property {(itemId: string) => void} onMiss - Called when an item is dropped outside any drop zone
 * @property {boolean} [enabled=true] - Whether drag is currently enabled (disable during animations)
 */

/**
 * @typedef {Object} UseDragAndDropReturn
 * @property {{ onPointerDown: (e: PointerEvent, itemId: string) => void }} dragHandlers - Spread on draggable elements
 * @property {ActiveDrag|null} activeDrag - Currently dragged item info, or null
 * @property {(zoneId: string, ref: HTMLElement|null) => void} dropZoneRef - Callback to register a drop zone
 */

/**
 * Custom hook for touch-friendly drag-and-drop using the Pointer Events API.
 *
 * Designed for kids on iPads: large touch targets, prevents iOS scroll/rubber-banding,
 * smooth tracking, and snap-to-zone or return-to-origin behavior.
 *
 * The hook does NOT move DOM elements. It only tracks pointer position via `activeDrag`.
 * The consuming component renders the dragged item at `{ activeDrag.x, activeDrag.y }`
 * using CSS `transform: translate(...)`.
 *
 * @param {UseDragAndDropOptions} options
 * @returns {UseDragAndDropReturn}
 *
 * @example
 * const { dragHandlers, activeDrag, dropZoneRef } = useDragAndDrop({
 *   onDrop: (itemId, zoneId) => handlePlace(itemId, zoneId),
 *   onMiss: (itemId) => handleMiss(itemId),
 *   enabled: !isAnimating,
 * });
 *
 * // On a draggable cube:
 * <div onPointerDown={(e) => dragHandlers.onPointerDown(e, cubeId)} />
 *
 * // On a drop zone:
 * <div ref={(el) => dropZoneRef('zone-1', el)} />
 *
 * // Render drag overlay:
 * {activeDrag && (
 *   <div style={{ transform: `translate(${activeDrag.x}px, ${activeDrag.y}px)` }}>
 *     ...
 *   </div>
 * )}
 */
export default function useDragAndDrop({ onDrop, onMiss, enabled = true }) {
  const [activeDrag, setActiveDrag] = useState(null);

  /** @type {React.MutableRefObject<Map<string, HTMLElement>>} */
  const dropZonesRef = useRef(new Map());

  /**
   * Tracks whether a drag is in progress. We use a ref in addition to state
   * so that the window-level pointer listeners (which close over stale state)
   * can reliably check the current drag status.
   * @type {React.MutableRefObject<string|null>}
   */
  const dragIdRef = useRef(null);

  /**
   * Stores the original `touch-action` and `user-select` styles so we can
   * restore them when the drag ends.
   */
  const savedStylesRef = useRef(null);

  // ─── helpers ───────────────────────────────────────────────────────

  /**
   * Lock the page so iOS doesn't scroll or rubber-band while dragging.
   * Sets `touch-action: none` and `user-select: none` on `document.body`.
   */
  const lockPage = useCallback(() => {
    const { body } = document;
    savedStylesRef.current = {
      touchAction: body.style.touchAction,
      userSelect: body.style.userSelect,
      webkitUserSelect: body.style.webkitUserSelect,
    };
    body.style.touchAction = 'none';
    body.style.userSelect = 'none';
    body.style.webkitUserSelect = 'none';
  }, []);

  /**
   * Restore the original body styles after a drag ends.
   */
  const unlockPage = useCallback(() => {
    if (savedStylesRef.current) {
      const { body } = document;
      body.style.touchAction = savedStylesRef.current.touchAction;
      body.style.userSelect = savedStylesRef.current.userSelect;
      body.style.webkitUserSelect = savedStylesRef.current.webkitUserSelect;
      savedStylesRef.current = null;
    }
  }, []);

  /**
   * Check whether a point (viewport coords) falls inside any registered
   * drop zone. Returns the zoneId or null.
   * @param {number} x
   * @param {number} y
   * @returns {string|null}
   */
  const hitTestDropZones = useCallback((x, y) => {
    for (const [zoneId, el] of dropZonesRef.current.entries()) {
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return zoneId;
      }
    }
    return null;
  }, []);

  // ─── window-level listeners (attached on drag start) ──────────────

  /**
   * Refs to the bound listeners so we can remove them on drag end.
   */
  const listenersRef = useRef({ move: null, up: null });

  /**
   * End the current drag: clean up listeners, restore styles, fire callbacks.
   * @param {PointerEvent} e
   */
  const endDrag = useCallback(
    (e) => {
      const itemId = dragIdRef.current;
      if (!itemId) return;

      // Release pointer capture if still held
      try {
        if (e.target && typeof e.target.releasePointerCapture === 'function') {
          e.target.releasePointerCapture(e.pointerId);
        }
      } catch {
        // ignore — capture may have already been released
      }

      // Remove window listeners
      if (listenersRef.current.move) {
        window.removeEventListener('pointermove', listenersRef.current.move);
      }
      if (listenersRef.current.up) {
        window.removeEventListener('pointerup', listenersRef.current.up);
      }
      listenersRef.current = { move: null, up: null };

      // Reset drag state
      dragIdRef.current = null;
      setActiveDrag(null);
      unlockPage();

      // Hit-test drop zones
      const zoneId = hitTestDropZones(e.clientX, e.clientY);
      if (zoneId) {
        onDrop(itemId, zoneId);
      } else {
        onMiss(itemId);
      }
    },
    [onDrop, onMiss, unlockPage, hitTestDropZones],
  );

  /**
   * Track pointer movement and update activeDrag position.
   * @param {PointerEvent} e
   */
  const moveDrag = useCallback((e) => {
    if (!dragIdRef.current) return;
    e.preventDefault();
    setActiveDrag((prev) =>
      prev ? { ...prev, x: e.clientX, y: e.clientY } : prev,
    );
  }, []);

  // ─── public API ───────────────────────────────────────────────────

  /**
   * Pointer-down handler to attach to each draggable element.
   * Call as `onPointerDown={(e) => dragHandlers.onPointerDown(e, itemId)}`.
   *
   * @param {PointerEvent} e - The pointer event from React
   * @param {string} itemId - Unique identifier for the dragged item
   */
  const onPointerDown = useCallback(
    (e, itemId) => {
      if (!enabled) return;
      // Only respond to primary button / single touch
      if (e.button !== 0) return;
      // Prevent default to stop iOS from scrolling / long-press menu
      e.preventDefault();
      e.stopPropagation();

      // Capture pointer on the target element for reliable tracking
      try {
        e.target.setPointerCapture(e.pointerId);
      } catch {
        // setPointerCapture can throw if element is removed; non-critical
      }

      dragIdRef.current = itemId;
      setActiveDrag({ id: itemId, x: e.clientX, y: e.clientY });
      lockPage();

      // Attach move/up to window so drag continues outside the element
      const boundMove = (ev) => moveDrag(ev);
      const boundUp = (ev) => endDrag(ev);
      listenersRef.current = { move: boundMove, up: boundUp };
      window.addEventListener('pointermove', boundMove);
      window.addEventListener('pointerup', boundUp);
    },
    [enabled, lockPage, moveDrag, endDrag],
  );

  /**
   * Callback ref to register (or unregister) a drop zone element.
   *
   * Usage: `<div ref={(el) => dropZoneRef('zone-1', el)} />`
   *
   * When the element unmounts React calls the ref with `null`, which
   * removes it from the internal Map.
   *
   * @param {string} zoneId - Unique identifier for the drop zone
   * @param {HTMLElement|null} el - The DOM element, or null on unmount
   */
  const dropZoneRef = useCallback((zoneId, el) => {
    if (el) {
      dropZonesRef.current.set(zoneId, el);
    } else {
      dropZonesRef.current.delete(zoneId);
    }
  }, []);

  return {
    dragHandlers: { onPointerDown },
    activeDrag,
    dropZoneRef,
  };
}
