import { useEffect, useMemo, useState } from 'react'

import characters from "./data/characters.json";

import DispatchCharacterDropdown from './components/DispatchCharacterDropdown';
import BasicButton from './components/BasicButton'
import Dropdown from './components/Dropdown';

import { useDispatch } from './context/DispatchProvider';
import { useHolos } from './context/HolosProvider';

import { retrieveValidPrompts } from './utils/query';
import { calculatePrice } from './utils/claude';
import { incrementRun } from './utils/supabase';
import { formatPrice } from './utils/format';
import { useParams } from 'react-router-dom';
import { worker } from './utils/worker';
import { colors } from './utils/colors';

export default function Dispatch() {
  const { runId } = useParams();
  const { runs } = useHolos();
  const { dispatch, setDispatch } = useDispatch();
  const currentRun = useMemo(() => runs.find((run) => run.run_id == runId) , [runs, runId]);

  const [display, setDisplay] = useState([]);
  const [failed, setFailed] = useState([]);
  const [usage, setUsage] = useState({});

  const [chars, setChars] = useState(characters.characters.map((char) => char.char_code));
  // const chars = ["ADM", "EVE", "JAC"]
  const [phase, setPhase] = useState(1);
  const [promptCode, setPromptCode] = useState(1);
  const model = useMemo(() => currentRun?.model || "claude-haiku-4-5", [currentRun]);
  const PROMPT_CONCURRENCY = 5;

  const [running, setRunning] = useState(false);

  const expended = useMemo(() => {
    const expended = Object.values(usage).reduce((acc, curr) => {
      return acc + (curr?.totalPrice || 0);
    }, 0);

    return expended;
  }, [usage]);
  const tokens = useMemo(() => {
    const tokens = Object.values(usage).reduce((acc, curr) => {
      return {
        input_tokens: acc.input_tokens + (curr?.input_tokens || 0),
        output_tokens: acc.output_tokens + (curr?.output_tokens || 0),
        cache_creation_input_tokens: acc.cache_creation_input_tokens + (curr?.cache_creation_input_tokens || 0),
        cache_read_input_tokens: acc.cache_read_input_tokens + (curr?.cache_read_input_tokens || 0),
      };
    }, { input_tokens: 0, output_tokens: 0, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 });

    return tokens;
  }, [usage]);

  useEffect(() => {
    if (dispatch) {
      const focus = dispatch[`${promptCode}`] || [];
      tokenReview(focus);
      setDisplay(focus.reduce((acc, response) => {
        if (response.character_id?.char_code && response.raw_output !== "") {
          acc.push(response.character_id.char_code);
        }
        return acc;
      }, []) || []);
    }
  }, [dispatch, promptCode]);

  const onCompleteJob = (responses) => {
    setDispatch((prev) => {
      const next = { ...(prev || {}) };

      for (const response of responses) {
        const promptId = response?.prompt_id?.prompt_id;
        if (!promptId) continue;

        const existing = next[promptId] || [];
        next[promptId] = [...existing, response];
      }

      return next;
    });
  }

  const onFailJob = (charCode, error) => {
    // console.error("WWWEEEEE WOOOOOOO", charCode, error);
    setFailed((prev) => {
      if (!prev.includes(charCode)) {
        return [...prev, charCode];
      }
      return prev;
    });
  }

  const tokenReview = (responses) => {
    const usageByCharacter = {};

    for (const response of responses) {
      const charCode = response?.character_id?.char_code;
      if (!charCode) continue;

      if (!usageByCharacter[charCode]) {
        usageByCharacter[charCode] = {
          input_tokens: 0,
          output_tokens: 0,
          cache_creation_input_tokens: 0,
          cache_read_input_tokens: 0,
          totalPrice: 0,
        };
      }

      usageByCharacter[charCode].input_tokens += response?.usage?.input_tokens ?? response?.input_tokens ?? 0;
      usageByCharacter[charCode].output_tokens += response?.usage?.output_tokens ?? response?.output_tokens ?? 0;
      usageByCharacter[charCode].cache_creation_input_tokens += response?.usage?.cache_creation_input_tokens ?? response?.cache_creation_input_tokens ?? 0;
      usageByCharacter[charCode].cache_read_input_tokens += response?.usage?.cache_read_input_tokens ?? response?.cache_read_input_tokens ?? 0;
    }

    for (const charCode in usageByCharacter) {
      const totalTokens = usageByCharacter[charCode];
      const price = calculatePrice({
        input_tokens: totalTokens.input_tokens,
        output_tokens: totalTokens.output_tokens,
        cache_creation_input_tokens: totalTokens.cache_creation_input_tokens,
        cache_read_input_tokens: totalTokens.cache_read_input_tokens,
        model,
      });

      usageByCharacter[charCode].totalPrice = price;
    }

    setUsage(usageByCharacter);
  }

  const handleClick = async () => {
    if (running) return;
    setDisplay([]);
    setFailed([]);
    setRunning(true);

    // TEMPORARY - increment run only for prompt 1
    if (promptCode === 1) await incrementRun();

    const prompts = retrieveValidPrompts(chars, phase, promptCode);
    // console.log(prompts)
    await Promise.all(
      Array.from({ length: PROMPT_CONCURRENCY }, () => worker(prompts, runId, model, onCompleteJob, onFailJob))
    );

    setRunning(false);
  }

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <div 
          className="bg-hover"
          style={{
            ...styles.stepContainer,
            ...(promptCode === 1 ? { backgroundColor: colors.bg2 } : {})
          }}
          onClick={() => setPromptCode(1)}
        >
          <p>Default</p>
        </div>
        <div 
          className="bg-hover"
          style={{
            ...styles.stepContainer,
            ...(promptCode === 2 ? { backgroundColor: colors.bg2 } : {})
          }}
          onClick={() => setPromptCode(2)}
        >
          <p>Constrained</p>
        </div>
      </div>
      <div style={styles.contentContainer}>
        <div style={styles.content}>
          <div style={styles.main}>
            <p style={styles.mainTitle}>{promptCode === 1 ? "Default" : "Constrained"} - {promptCode === 1 ? "Without Passage" : "With Passage"}</p>
            {display.length < characters.characters.length && (
              <BasicButton 
                label='initiate workflow'
                onClick={handleClick}
                loading={running}
                disabled={running}
              />
            )}
            <div style={styles.runInformation}>
              <div style={styles.infoLeft}>
                <p style={styles.infoText}>{display.length/5} / {characters.characters.length} complete</p>
                <p style={styles.infoText}>{(dispatch[`${promptCode}`] || []).length} / {characters.characters.length*5} prompts made</p>
                <p style={styles.infoText}>expended: {formatPrice(expended)}</p> 
              </div>
              <div style={styles.infoRight}>
                <p style={styles.infoText}>input_tokens: {tokens.input_tokens}</p>
                <p style={styles.infoText}>output_tokens: {tokens.output_tokens}</p>
                <p style={styles.infoText}>cache_creation_input_tokens: {tokens.cache_creation_input_tokens}</p>
                <p style={styles.infoText}>cache_read_input_tokens: {tokens.cache_read_input_tokens}</p>
              </div>
            </div>
          </div>
          <div style={styles.completedList}>
            {characters.characters.map((char) => (
              <Dropdown 
                key={char.char_code}
                label={
                  <div key={char.char_code} style={styles.completedItem}>
                    <span style={styles.statusCell}>{
                      display.includes(char.char_code) 
                        ? display.filter((code) => code === char.char_code).length === 5
                          // ? `✅ ${display.filter((code) => code === char.char_code).length}/5` 
                          // : `🟡 ${display.filter((code) => code === char.char_code).length}/5`
                          ? "✅"
                          : "🟡"
                        : failed.includes(char.char_code)
                          ? "❌" 
                          : "💤"
                      }</span>
                    <span style={styles.nameCell}>{char.name}</span>
                    <span style={styles.usageCell}>usage: {formatPrice(usage[char.char_code]?.totalPrice ?? 0)}</span>
                  </div>
                }
                children={
                  <DispatchCharacterDropdown
                    char_code={char.char_code}
                    phase={phase}
                    promptCode={promptCode}

                    runId={runId}
                    model={model}
                    // responses={dispatch[`${promptCode}`]?.filter((response) => response.character_id?.char_code === char.char_code) || []}
                  />
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
  },

  leftPanel: {
    width: 300,
    borderRight: `1px solid ${colors.border}`,

    overflowY: 'auto',
    minHeight: 0,

    display: 'flex',
    flexDirection: 'column',
  },
  stepContainer: {
    padding: '5px 25px',
    cursor: 'pointer',
    transition: '0.2s',

    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  contentContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',

    overflowY: 'auto',
  },

  main: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',

    width: '100%',
    padding: '20px 0px 20px 30px',

    borderBottom: '1px solid #2e303a',
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  selectContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  runInformation: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  infoLeft: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: 5,
  },
  infoRight: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    gap: 5,
  },
  infoText: {
    margin: '10px 0',
  },

  completedList: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,

    padding: '30px 30px 100px 30px',
  },

  col: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 15,
  },

  completedItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    borderRadius: 8,
  },
  statusCell: {
    textAlign: 'center',

    color: colors.secondary,
  },
  nameCell: {
    display: 'flex',
    flex: 1,
    minWidth: 0,
    textAlign: 'left',
  },
  usageCell: {
    minWidth: 220,
    textAlign: 'left',
    whiteSpace: 'nowrap',
  }
}
