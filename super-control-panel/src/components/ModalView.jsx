import { useEffect, useMemo, useState } from "react";
import { colors } from "../utils/colors";

export default function ModalView({ children, intendedToClose, handleModalReset }) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      animateModalClose();
    }
  }

  useEffect(() => {
    if (intendedToClose) {
      animateModalClose();
    }
  }, [intendedToClose]);

  const animateModalClose = () => {
    setIsAnimating(true);
    setTimeout(() => {
      handleModalReset();
    }, 200);
  }

  return (
    <div 
      className={`modal-backdrop ${isAnimating ? 'closing' : ''}`}
      style={styles.modalBackdrop}
      onClick={handleBackdropClick}
    >
      <div 
        className="modal-view"
        style={styles.modalContent}
      >
        {children}
      </div>
    </div>
  )
}

const styles = {
  modalBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: colors.bg,
    boxShadow: '0 0px 4px rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  }
}
