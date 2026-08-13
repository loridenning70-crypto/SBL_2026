import { useState } from 'react'

import characters from "./data/characters.json";
import passages from "./data/passages.json";

import BasicButton from './components/BasicButton'

import { sendQueryToClaude } from './utils/claude';
import { generate, nominal } from './utils/query';
import { incrementRun } from './utils/supabase';
import { worker } from './utils/worker';

export default function App() {
  const [display, setDisplay] = useState([]);
  const [failed, setFailed] = useState([]);

  const [chars, setChars] = useState(characters.characters.map((char) => char.char_code));
  // const chars = ["ADM", "EVE", "JAC"]
  const [phase, setPhase] = useState(1);
  const [promptCode, setPromptCode] = useState(1);
  const [model, setModel] = useState("claude-haiku-4-5");
  const PROMPT_CONCURRENCY = 5;

  const [running, setRunning] = useState(false);

  const getRefinedPassagesOfCharacter = (charCode) => {
    const refined = JSON.stringify(passages[charCode] || []).replace(/\s+/g, "");
    return refined;
  }
  
  const retrieveValidPrompts = () => {
    const prompts = [];
    for (const charCode of chars) {
      const passages = getRefinedPassagesOfCharacter(charCode);
      const character = characters.characters.find((char) => char.char_code === charCode);
      const query = generate(promptCode, character.name, passages);

      if (query && query.length > 0) {
        prompts.push({
          query,
          charCode,
          phase,
          promptCode,
        });
      }
    }
    return prompts;
  }

  const updateDisplay = (text) => {
    setDisplay(prev => [...prev, text]);
  }

  const handleClick = async () => {
    if (running) return;
    setDisplay([]);
    setFailed([]);
    setRunning(true);

    // TEMPORARY - increment run only for prompt 1
    if (promptCode === 1) await incrementRun();

    const prompts = retrieveValidPrompts();
    await Promise.all(
      Array.from({ length: PROMPT_CONCURRENCY }, () => worker(prompts, model, updateDisplay))
    );

    setRunning(false);
  }

  return (
    <div style={styles.container}>
      <div style={styles.main}>
        <div style={styles.selectContainer}>
          <p>Model: </p>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            <option value="claude-haiku-4-5">Claude Haiku 4.5</option>
            <option value="claude-sonnet-5">Claude Sonnet 5</option>
            <option value="claude-opus-4">Claude Opus 4</option>
          </select>
        </div>
        <div style={styles.selectContainer}>
          <p>Prompt Type: </p>
          <select
            value={promptCode}
            onChange={(e) => setPromptCode(Number(e.target.value))}
          >
            <option value={1}>Default - Prompt 1 - Phase 1</option>
            <option value={2}>Constrained - Prompt 2 - Phase 1</option>
            <option value={3}>Literary - Phase 2</option>
          </select>
        </div>
        <div style={styles.button}>
          <BasicButton 
            label='initiate workflow'
            onClick={handleClick}
            disabled={running}
          />
        </div>
        <p>{display.length} / {characters.characters.length} complete</p>
        <p>{display.length*5} / {characters.characters.length*5} prompts made</p>
      </div>
      <div style={styles.completedList}>
        <div style={styles.col}>
          {display.map((charCode, index) => (
            <div key={index} style={styles.completedItem}>
              <span>✅ {characters.characters.find((char) => char.char_code === charCode)?.name}</span>
            </div>
          ))}
        </div>
        <div style={styles.col}>
          {failed?.map((charCode, index) => (
            <div key={index} style={styles.completedItem}>
              <span>❌ {characters.characters.find((char) => char.char_code === charCode)?.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    minHeight: '100vh',

  },
  main: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 10,

    width: '100%',
    padding: '100px 0px 100px 30px',

    borderBottom: '1px solid #2e303a',
  },
  selectContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  button: {
    margin: '30px 0px',
  },

  completedList: {
    marginTop: 20,
    display: 'flex',
    flexDirection: 'row',

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
  }
}
