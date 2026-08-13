export const colors = {
  bg: "#16171d",
  bg2: "#1e1f28",
  border: "#2e303a",

  primary: "#f5f5f5",
  secondary: "#a0a0a0",

  accent: "#ff6b6b",
  accent2: "#4ecdc4",
}

export const darkenColor = (col, amt) => {
  let usePound = false;

  if (col[0] === "#") {
  col = col.slice(1);
  usePound = true;
  }

  let num = parseInt(col, 16);

  let r = (num >> 16) + amt;
  if (r > 255) r = 255;
  else if (r < 0) r = 0;

  let g = ((num >> 8) & 0x00ff) + amt;
  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  let b = (num & 0x0000ff) + amt;
  if (b > 255) b = 255;
  else if (b < 0) b = 0;

  return (
  (usePound ? "#" : "") +
  (r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0"))
  );
}
