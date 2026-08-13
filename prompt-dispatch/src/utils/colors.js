export const darkenColor = (col, amt) => {
  let usePound = false;

  if (col[0] === "#") {
  col = col.slice(1);
  usePound = true;
  }

  let num = parseInt(col, 16);
  const delta = Math.abs(amt) <= 1 ? Math.round(amt * 255) : Math.round(amt);
  const clampChannel = (value) => Math.max(0, Math.min(255, Math.round(value)));

  let r = clampChannel((num >> 16) - delta);
  let g = clampChannel(((num >> 8) & 0x00ff) - delta);
  let b = clampChannel((num & 0x0000ff) - delta);

  return (
  (usePound ? "#" : "") +
  (r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0"))
  );
}