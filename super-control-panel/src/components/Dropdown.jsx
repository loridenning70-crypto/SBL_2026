import { useState } from "react";
import { colors } from "../utils/colors";

export default function Dropdown({ label, children }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={styles.dropdown}>
      <button
        style={styles.dropdownHeader}
        onClick={() => setOpen(!open)}
      >
        <span style={{ ...styles.triangle, ...(open ? styles.triangleOpen : {}) }}>▶</span>
        <span style={styles.label}>{label}</span>
      </button>

      <div style={{ ...styles.dropdownContent, ...(open ? styles.dropdownContentOpen : {}) }}>
        <div style={styles.dropdownInner}>
          {children}
        </div>
      </div>
    </div>
  );
}

const styles = {
  dropdown: {
    width: '100%',
  },

  dropdownHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',

    background: 'none',
    border: 'none',
    cursor: 'pointer',

    fontSize: '16px',
    padding: '8px 0',
  },

  triangle: {
    display: 'inline-block',
    transition: 'transform 0.25s ease',
    color: colors.primary,
  },

  triangleOpen: {
    transform: 'rotate(90deg)',
  },

  dropdownContent: {
    display: 'grid',
    gridTemplateRows: '0fr',
    transition: 'grid-template-rows 0.25s ease',
  },

  dropdownContentOpen: {
    gridTemplateRows: '1fr',
  },

  dropdownInner: {
    overflow: 'hidden',
    paddingLeft: '20px',
  },
  label: {
    display: 'flex',
    flex: 1,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'left',
  },
}
