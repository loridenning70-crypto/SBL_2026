import { createContext, useContext, useState } from 'react';
import ModalView from '../components/ModalView';

const ModalContext = createContext();

export const useModal = () => {
  return useContext(ModalContext);
}

export default function DashboardProvider({ children }) {
  const [modalContent, setModalContent] = useState(null);
  const [intendedToClose, setIntendedToClose] = useState(false);

  const handleModalOpen = ({ content }) => {
    setModalContent(content);
  }

  const handleModalClose = () => {
    setIntendedToClose(true);
  }

  const handleModalReset = () => {
    setModalContent(null);
    setIntendedToClose(false);
  }

  return (
    <ModalContext.Provider 
      value={{ 
        handleModalOpen,
        handleModalClose,
        handleModalReset
      }}
    >
      {children}
      {modalContent && (
        <ModalView 
          intendedToClose={intendedToClose} 
          handleModalReset={handleModalReset}
        >
          {modalContent}
        </ModalView> 
      )}
    </ModalContext.Provider>
  );
}