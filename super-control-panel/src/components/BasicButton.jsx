import { useMemo, useState } from "react"
import { darkenColor } from "../../../prompt-dispatch/src/utils/colors";
import { colors } from "../utils/colors";

export default function BasicButton({ 
  label, 
  color="#4983d9",
  onClick,
  style,
  loading=false,
  disabled=false
}) {
  const [isPressed, setIsPressed] = useState(false);
  
  const colors = useMemo(() => {
    const darkered = darkenColor(color, 0.2);
    return {
      backgroundColor: darkered,
      borderColor: color
    }
  })

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  }

  return (
    <div 
      className='bg-opacity'
      style={{
        ...styles.button,  
        backgroundColor: colors.backgroundColor,
        border: `1px solid ${colors.borderColor}`,
        ...(isPressed && !disabled ? styles.pressed : {}),
        ...(disabled ? { cursor: 'not-allowed', opacity: 0.6 } : {}),
        ...(style || {}),
      }}
      onMouseDown={() => setIsPressed(true)} // Set pressed state on mouse down
      onMouseUp={() => setIsPressed(false)} // Reset pressed state on mouse up
      onMouseLeave={() => setIsPressed(false)} // Reset if mouse leaves the button

      onClick={handleClick}
    >
      {loading ? (
        <p>Running...</p>
      ) : (
        <p>{label}</p>
      )}
    </div>
  )
}

const styles = {
  button: {
    padding: '0px 20px',
    margin: '20px 0px',
    color: colors.primary,
    fontWeight: 'bold',
    cursor: 'pointer',

    borderRadius: 15,
  },
}