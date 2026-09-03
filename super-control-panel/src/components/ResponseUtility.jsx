import { useModal } from "../context/ModalProvider";
import ResponseInformationModal from "../modals/ResponseInformationModal";
import { colors } from "../utils/colors";

export default function ResponseUtility({ response }) {
  const { handleModalOpen } = useModal();
  
  const handleReponseInspect = () => {
    handleModalOpen({
      content: <ResponseInformationModal response={response} />,
    })
  }

  return (
    <div onClick={handleReponseInspect}>
      <p style={styles.response} className='hover-underline'>See Response Details</p>
    </div>
  );
}

const styles = {
  response: {
    color: colors.secondary,
  },
};