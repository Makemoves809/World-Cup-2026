import { useRef, useState } from "react";
import type { CSSProperties, TouchEvent } from "react";

/**
 * Drag-to-dismiss for the mobile bottom-sheet modals. On phones the modal can
 * be pulled down with a finger; past a threshold it slides away and closes.
 *
 * The drag only engages when the sheet is scrolled to the top and the pull is
 * downward, so normal scrolling of tall content is untouched. On tablet/desktop
 * (where the modal is a centred dialog) it's inert.
 */
export function useSheetDismiss(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const start = useRef<{ y: number; scroll: number } | null>(null);
  const dragging = useRef(false);
  const [dragY, setDragY] = useState(0);
  const [closing, setClosing] = useState(false);

  const isSheet = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 599px)").matches;

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (closing || !isSheet()) return;
    const t = e.touches[0];
    start.current = { y: t.clientY, scroll: ref.current?.scrollTop ?? 0 };
    dragging.current = false;
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!start.current) return;
    const dy = e.touches[0].clientY - start.current.y;
    if (!dragging.current) {
      // Engage only when pulling down from the very top of the sheet.
      if (dy > 6 && start.current.scroll <= 0) dragging.current = true;
      else return;
    }
    setDragY(dy > 0 ? dy : 0);
  };

  const onTouchEnd = () => {
    if (dragging.current && dragY > 120) {
      setClosing(true);
      window.setTimeout(onClose, 190);
    } else {
      setDragY(0);
    }
    start.current = null;
    dragging.current = false;
  };

  const style: CSSProperties = closing
    ? { transform: "translateY(100%)", transition: "transform 0.2s ease-in" }
    : dragY > 0
    ? { transform: `translateY(${dragY}px)`, transition: "none" }
    : {};

  return { ref, onTouchStart, onTouchMove, onTouchEnd, style };
}
