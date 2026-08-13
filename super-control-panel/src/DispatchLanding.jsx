import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { createRun, getAllRuns } from "./utils/supabase";
import { colors } from "./utils/colors";

import { useHolos } from "./context/HolosProvider";
import { convertTimestamp } from "./utils/format";

import characters from "../../data/characters.json";
import BasicButton from "./components/BasicButton";
import DispatchProvider from "./context/DispatchProvider";

export default function DispatchLanding() {
  const navigate = useNavigate();
  const { runId } = useParams();

  const { runs, setRuns } = useHolos();
  const currentRun = useMemo(() => runs.find((run) => run.run_id == runId) , [runs, runId]);

  return (
    <DispatchProvider runId={runId}>
      <div style={styles.container}>
        <div style={styles.headerContainer}>
          <div 
            className="bg-expand" 
            style={styles.buttonContainer}
            onClick={() => {
              navigate("/");
            }}
          >
            <p style={styles.button}>🏠</p>
          </div>
          {currentRun && (
            <>
              <p>{currentRun?.name}</p>
              <p style={styles.secondary}>{currentRun?.model}</p>
              <p style={styles.secondary}>{convertTimestamp(currentRun?.created_at)}</p>
            </>
          )}
        </div>
        <div style={styles.contentContainer}>
          <div style={styles.content}>
            <Outlet />
          </div>
        </div>
      </div>
    </DispatchProvider>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: colors.bg
  },

  buttonContainer: {
    borderRadius: 20,

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    cursor: 'pointer',
    transition: '0.2s',
  },
  button: {
    fontSize: 24,
  },

  headerContainer: {
    width: '100%',
    padding: 25,
    height: 60,

    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',

    borderBottom: `1px solid ${colors.border}`,
  },

  contentContainer: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    display: "flex",
  },
  content: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    overflowY: 'auto',
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
  secondary: {
    color: colors.secondary,
  },

};
