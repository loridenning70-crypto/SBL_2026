import { useMemo, useState } from "react";

import { colors } from "../utils/colors"
import { sendQueryToClaude } from "../utils/claude";
import { retrieveValidPrompts } from "../utils/query";

import { useDispatch } from "../context/DispatchProvider";
import { updateResponseWithNewClaudeResponse } from "../utils/supabase";
import { worker } from "../utils/worker";

export default function DispatchCharacterDropdown({ char_code, phase, promptCode, runId, model }) {
  const { dispatch, setDispatch } = useDispatch();

  const [loading, setLoading] = useState([]);
  const [running, setRunning] = useState(false);

  const responses = useMemo(() => {
    return dispatch[`${promptCode}`]?.filter((response) => response.character_id?.char_code === char_code) || [];
  }, [dispatch, char_code, promptCode]);
  
  const handleRefreshResponse = async (responseId) => {
    if (loading.includes(responseId)) return;
    setLoading((prevLoading) => [...prevLoading, responseId]);

    // get prompt from responseId
    const response = responses.find((resp) => resp.response_id === responseId);
    const prompt = retrieveValidPrompts([response.character_id.char_code], response.phase, response.prompt_id.prompt_id)[0];

    // send api req to claude
    // TODO: Remove the model each response. Get that info from the run instead.
    const claudeResponse = await sendQueryToClaude(prompt.query, response.model);

    // update the response in the database
    const { update } = await updateResponseWithNewClaudeResponse(prompt, response.model, response.run, response.loop_index, responseId, claudeResponse);

    // update local state
    setDispatch((prevDispatch) => {
      const promptId = update?.prompt_id?.prompt_id;
      if (!promptId) return prevDispatch;

      const existing = prevDispatch[promptId] || [];
      prevDispatch[promptId] = [...existing, update];
      return { ...prevDispatch };
    });

    // undo the loading thing
    setLoading((prevLoading) => prevLoading.filter((id) => id !== responseId));
  }

  const handleRunOneCharacter = async () => {
    if (running) return;
    setRunning(true);
    const prompts = retrieveValidPrompts([char_code], phase, promptCode);
    await worker(prompts, runId, model, (responses) => {
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
    }, () => {
      alert('Failed to run the job for this character. Try refreshing the page then trying again.');
    });
    setRunning(false);
  }

  return (
    <div className="dispatch-response-list" style={styles.container}>
      {responses.map((response) => (
        <div key={response.response_id} className="dispatch-response-row" style={styles.responseRow}>
          <div style={{
            ...styles.responseRowContent,
            opacity: loading.includes(response.response_id) ? 0.2 : 1,
          }}>
            {response.raw_output && response.raw_output.trim() !== '' ? (
              <span style={styles.responseText}>✅</span>
            ) : (
              <span style={styles.responseText}>❌</span>
            )}
            <div 
              style={styles.responseRowActions}
              onClick={() => handleRefreshResponse(response.response_id)}
            >
              <span className='bg-expand'>🔄</span>
            </div>
            <span style={styles.responseText}>{response.response_id}</span>
            <span style={styles.responseText}>{loading.includes(response.response_id) ? `loading...` : `stop_reason: ${response.stop_reason ?? 'N/A'}`}</span>
          </div>
        </div>
      ))}
      {responses.length === 0 && (
        <div style={{
          ...styles.responseRowContent,
          opacity: running ? 0.2 : 1,
        }}>
          <div 
            style={styles.responseRowActions}
            onClick={handleRunOneCharacter}
          >
            <span className='bg-expand'>🚀</span>
          </div>
          <span style={styles.responseText}>No responses ... yet. Press the rocket to run!</span>
        </div>
      )}
        {/* <span style={styles.responseText}>No responses for this character.</span> */}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--dispatch-row-gap)',
    padding: '10px 5px 10px 26px',
  },
  responseRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: '4px',
  },
  responseText: {
    fontSize: 16,
    color: colors.primary,
  },
  responseRowContent: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    gap: 20,
    paddingLeft: 10,
    paddingRight: 10,
  },
  responseRowActions: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  }
}