import { useMemo, useState } from "react";

import { colors } from "../utils/colors"
import { sendQueryToClaude } from "../utils/claude";
import { retrieveValidPrompts } from "../utils/query";

import { useDispatch } from "../context/DispatchProvider";
import { updateResponseWithNewClaudeResponse } from "../utils/supabase";

export default function DispatchCharacterDropdown({ char_code, promptCode }) {
  const { dispatch, setDispatch } = useDispatch();

  const [loading, setLoading] = useState([]);
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
        <span style={styles.responseText}>No responses for this character.</span>
      )}
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