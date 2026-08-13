import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function HighlightableText({ id, text, color }) {
  const containerRef = useRef(null);

  const selectionRef = useRef(null);

  const [highlights, setHighlights] = useState([]);
  const [toolbar, setToolbar] = useState(null);

  const canEdit = useRef(false);

  useEffect(() => {
    function handleSelectionChange() {
      const selection = window.getSelection();

      if (!selection || selection.isCollapsed) {
        setToolbar((t) => (t?.mode === "add" ? null : t));
        selectionRef.current = null;
      }
    }

    document.addEventListener(
      "selectionchange",
      handleSelectionChange
    );

    return () =>
      document.removeEventListener(
        "selectionchange",
        handleSelectionChange
      );
  }, []);

  // ------------------------
  // Load / Save
  // ------------------------

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem(`highlight-${id}`) || "[]"
    );

    setHighlights(saved);
    setTimeout(() => {
      canEdit.current = true;
    }, 1000);
  }, [id]);

  useEffect(() => {
    if (canEdit.current) {
      localStorage.setItem(
        `highlight-${id}`,
        JSON.stringify(highlights)
      );
    }
  }, [highlights, id]);

  // ------------------------
  // Build React nodes
  // ------------------------

  const nodes = useMemo(() => {
    const sorted = [...highlights].sort((a, b) => a.start - b.start);

    const output = [];

    let cursor = 0;

    sorted.forEach((h, i) => {
      if (cursor < h.start) {
        output.push(text.slice(cursor, h.start));
      }

      output.push(
        <mark
          key={i}
          data-start={h.start}
          data-end={h.end}
          style={{
            background: color || "#B3E561",
            cursor: "pointer",
          }}
        >
          {text.slice(h.start, h.end)}
        </mark>
      );

      cursor = h.end;
    });

    if (cursor < text.length) {
      output.push(text.slice(cursor));
    }

    return output;
  }, [text, highlights]);

  // ------------------------
  // Selection
  // ------------------------

  function handleMouseUp() {
    const selection = window.getSelection();

    if (!selection || selection.isCollapsed) return;

    if (!containerRef.current.contains(selection.anchorNode)) return;

    const range = selection.getRangeAt(0);

    selectionRef.current = range.cloneRange();

    const rect = range.getBoundingClientRect();

    const before = range.cloneRange();

    before.selectNodeContents(containerRef.current);

    before.setEnd(range.startContainer, range.startOffset);

    const start = before.toString().length;
    const end = start + range.toString().length;

    setToolbar({
      mode: "add",
      start,
      end,
      x: rect.left + rect.width / 2 + window.scrollX,
      y: rect.top + window.scrollY - 40,
    });
  }

  // ------------------------
  // Click existing highlight
  // ------------------------

  function handleClick(e) {
    const mark = e.target.closest("mark");

    if (!mark) return;

    const rect = mark.getBoundingClientRect();

    setToolbar({
      mode: "remove",
      start: Number(mark.dataset.start),
      end: Number(mark.dataset.end),
      x: rect.left + rect.width / 2 + window.scrollX,
      y: rect.top + window.scrollY - 40,
    });
  }

  // ------------------------
  // Highlight
  // ------------------------

  function addHighlight() {
    if (!toolbar) return;

    let next = [
      ...highlights,
      {
        start: toolbar.start,
        end: toolbar.end,
      },
    ];

    // merge overlaps

    next.sort((a, b) => a.start - b.start);

    const merged = [];

    for (const h of next) {
      if (
        merged.length &&
        h.start <= merged[merged.length - 1].end
      ) {
        merged[merged.length - 1].end = Math.max(
          merged[merged.length - 1].end,
          h.end
        );
      } else {
        merged.push({ ...h });
      }
    }

    setHighlights(merged);

    window.getSelection()?.removeAllRanges();

    selectionRef.current = null;

    setToolbar(null);
  }

  function removeHighlight() {
    if (!toolbar) return;

    setHighlights((prev) =>
      prev.filter(
        (h) =>
          !(
            h.start === toolbar.start &&
            h.end === toolbar.end
          )
      )
    );

    setToolbar(null);
  }

  // ------------------------
  // Toolbar
  // ------------------------

  const floatingToolbar =
    toolbar &&
    createPortal(
      <button
        style={{
          position: "absolute",
          left: toolbar.x,
          top: toolbar.y,
          transform: "translateX(-50%)",
          zIndex: 99999,
          padding: "6px 12px",
        }}
        onMouseDown={(e) => e.preventDefault()}
        onClick={
          toolbar.mode === "add"
            ? addHighlight
            : removeHighlight
        }
      >
        {toolbar.mode === "add"
          ? "Highlight"
          : "Remove Highlight"}
      </button>,
      document.body
    );

  return (
    <>
      {floatingToolbar}

      <p
        ref={containerRef}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        style={{
          whiteSpace: "pre-wrap",
          lineHeight: 1.7,
        }}
      >
        {nodes}
      </p>
    </>
  );
}