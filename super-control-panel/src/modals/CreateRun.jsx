import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import BasicButton from "../components/BasicButton";
import { useModal } from "../context/ModalProvider";
import { createRun } from "../utils/supabase";
import { useHolos } from "../context/HolosProvider";
import { colors } from "../utils/colors";

export default function CreateRun() {
  const navigate = useNavigate();  

  const { handleModalClose } = useModal();
  const { setRuns } = useHolos();

  const [name, setName] = useState("");
  const [model, setModel] = useState("claude-sonnet-5");
  const [creatingRun, setCreatingRun] = useState(false);

  const handleCreateNewRun = async () => {
    setCreatingRun(true);
    const { data, error } = await createRun(name, model);
    setCreatingRun(false);
    handleModalClose();
    if (!error) {
      setRuns((prevRuns) => [data, ...prevRuns]);
    }

    navigate(`/dispatch/${data.run_id}`);
  }

  const buttonDisabled = useMemo(() => {
    return name.trim() === "";
  }, [name]);

  return (
    <div style={styles.container}>
      <input
        type="text"
        placeholder="name: e.g. 'silly old run'"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={styles.input}
      />
      <select
        value={model}
        onChange={(e) => setModel(e.target.value)}
        style={styles.input}
      >
        <option value="claude-haiku-4-5">Claude Haiku 4.5</option>
        <option value="claude-sonnet-5">Claude Sonnet 5</option>
        {/* <option value="claude-opus-4">Claude Opus 4</option> */}
      </select>
      <BasicButton
        label="Create"
        loading={creatingRun}
        onClick={handleCreateNewRun}
        disabled={buttonDisabled}
      />

    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,

    width: 400,
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.bg,
  },

  input: {
    width: '100%',
    height: 50,
    padding: 15,
    borderRadius: 10,
    border: `1px solid ${colors.border}`,

    backgroundColor: colors.bg,
    fontSize: 16,
    color: colors.primary,
  },
}