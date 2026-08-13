import { Outlet, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import { getAllRuns } from "./utils/supabase";
import { colors } from "./utils/colors";

import { useHolos } from "./context/HolosProvider";
import { convertTimestamp } from "./utils/format";

import characters from "../../data/characters.json";
import BasicButton from "./components/BasicButton";

export default function Landing() {
  const navigate = useNavigate();
  const { runId, characterId } = useParams();
  console.log("params: ", runId, characterId);

  const { runs } = useHolos();
  const currentRun = runs.find((run) => run.run_id == runId);

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <div style={styles.mainHeaderContent}>
          <div 
            className="bg-expand" 
            style={styles.buttonContainer}
            onClick={() => {
              navigate("/");
            }}
          >
            <p style={styles.button}>🏠</p>
          </div>
          <p>{currentRun?.name}</p>
          <p style={styles.secondary}>{currentRun?.model}</p>
          <p style={styles.secondary}>{convertTimestamp(currentRun?.created_at)}</p>
        </div>
        <BasicButton
          label="View Dispatch"
          style={styles.button}
          color={colors.border}
          onClick={() => {
            navigate(`/dispatch/${runId}`);
          }}
        />
      </div>
      <div style={styles.contentContainer}>
        <div style={styles.otFiguresContainer}>
          <div style={{...styles.headerContainer, position: 'sticky', top: 0, zIndex: 1, backgroundColor: colors.bg}}>
            <p>OT Figures</p>
          </div>
          {characters.characters.map((character) => (
            <div 
              key={character.char_code}
              style={{ 
                ...styles.characterContainer, 
                ...(character.char_code === characterId ? { backgroundColor: colors.bg2 } : {})
              }}
              className="bg-hover"
              onClick={() => {
                navigate(`/run/${runId}/${character.char_code}`);
              }}
            >
              <p>{character.name}</p>
            </div>
          ))}
        </div>
        <div style={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
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

  headerContainer: {
    width: '100%',
    padding: 25,
    height: 60,

    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottom: `1px solid ${colors.border}`,
  },
  mainHeaderContent: {
    display: 'flex',
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },

  contentContainer: {
    flex: 1,
    width: '100%',
    minHeight: 0,
    display: "flex",
  },
  otFiguresContainer: {
    width: '300px',
    borderLeft: `1px solid ${colors.border}`,
    borderRight: `1px solid ${colors.border}`,

    overflowY: 'auto',
    minHeight: 0,
  },
  content: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    display: 'flex',
    overflowY: 'auto',
  },

  characterContainer: {
    padding: '5px 25px',
    cursor: 'pointer',
    transition: '0.2s',

    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  secondary: {
    color: colors.secondary,
  },
};
