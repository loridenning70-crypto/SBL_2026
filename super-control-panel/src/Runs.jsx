import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { convertTimestamp } from "./utils/format";
import { getAllRuns } from "./utils/supabase";
import { colors } from "./utils/colors";

import { useHolos } from "./context/HolosProvider";
import { useModal } from "./context/ModalProvider";
import BasicButton from "./components/BasicButton";
import CreateRun from "./modals/CreateRun";

export default function Runs() {
  const navigate = useNavigate();  

  const { runs } = useHolos();
  const { handleModalOpen } = useModal();

  const [searchText, setSearchText] = useState("");

  const displayed = useMemo(() => {
    return runs.filter(run => 
      run.name.toLowerCase().includes(searchText.toLowerCase()) ||
      run.model.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [runs, searchText]);

  const handleNewRun = () => {
    handleModalOpen({
      content: <CreateRun />
    })
    // navigate("/dispatch");
  }

  return (
    <div style={styles.container}>
      <p style={styles.title}>Welcome, Dr Denning</p>
      <p style={styles.subtitle}>please select a run to continue</p>

      <div style={styles.utility}>
        <div style={styles.inputContainer}>
          <input
            type="text"
            placeholder="Search runs..."
            style={styles.input}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <BasicButton
          label="New Run"
          onClick={handleNewRun}
        />
        {/* <div 
          className="bg-hover" 
          style={styles.createButton}
          onClick={handleNewRun}
        >
          <p>new run</p>
        </div> */}
      </div>

      <div style={styles.content}>
        {displayed.map((run) => (
          <div 
            key={run.run_id} 
            className="bg-hover" 
            style={styles.runItem}
            onClick={() => {
              navigate(`/run/${run.run_id}`);
            }}
          >
            <p style={styles.runName}>{run.name}</p>
            <div style={styles.secondaryInfo}>
              <p style={styles.secondaryText}>{run.model}</p>
              <p style={styles.secondaryText}>{convertTimestamp(run.created_at)}</p>
            </div>
          </div>
        ))}
        {displayed.length === 0 && (
          <p style={styles.subtitle}>
            {searchText !== "" ? `No runs found for "${searchText}"` : "No runs available"}
          </p>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: colors.bg,

    padding: '150px 0px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '0px',
  },
  subtitle: {
    fontSize: '16px',
    color: colors.secondary,

    marginTop: 10,
    marginBottom: '20px',
  },

  utility: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,

    width: 500,
    margin: '20px 0px 40px 0px',
  },
  inputContainer: {
    flex: 1,
  },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 15,
    border: `1px solid ${colors.border}`,
    fontSize: 16,
    backgroundColor: colors.bg,
    color: colors.primary,
  },
  createButton: {
    padding: '0px 20px',
    margin: '20px 0px',
    color: colors.secondary,
    fontWeight: 'bold',
    cursor: 'pointer',

    border: `1px solid ${colors.border}`,
    borderRadius: 15,
  },

  content: {
    display: 'flex',
    flexDirection: 'column',

    gap: '10px',
  },
  runItem: {
    width: 500,
    padding: 20,
    border: `1px solid ${colors.border}`,
    borderRadius: '15px',
    cursor: 'pointer',

    flexDirection: 'column',
    display: 'flex',
    gap: '10px',
  },
  runName: {
    fontWeight: 'bold',
    margin: 0,
  },
  secondaryInfo: {
    display: 'flex',
    flexDirection: 'row',
    gap: 15,
  },
  secondaryText: {
    color: colors.secondary,
    margin: 0,
  },
};