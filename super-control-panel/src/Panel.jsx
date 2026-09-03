import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Loading from './components/Loading';
import { getResponsesForRunAndCharacter } from "./utils/supabase";

import characters from "../../data/characters.json";
import { useMemo } from "react";
import Dropdown from "./components/Dropdown";
import HighlightText from "./components/HighlightText";
import BHSAPassage from "./components/BHSAPassage";
import ResponseUtility from "./components/ResponseUtility";

export default function Panel() {
  const { runId, characterId } = useParams();

  const [responses, setResponses] = useState(null);
  const character = useMemo(() => {
    return characters.characters.find((char) => char.char_code === characterId);
  }, [characterId]);
  
  const formatPrompt = (prompt) => {
    if (!character || !prompt) return prompt;
    return prompt
      .replace(/%%%character%%%/g, character.name)
      .replace(/%%%passage%%%/g, JSON.stringify(character.passages))
      .replace('OMIT FORMATTING. ONLY RETURN TEXT', '')
      .replace('#Json property naming conventions - f: reference - h: hebrew - w: words - s: surface - g: gloss - m: morphology - p: Part of Speech - o: Part of Speech (display/predicate category) - v: Verbal Stem (Binyan, etc) - t: Verb Tense / Conjugation - d: Gender m f c (common) - n: Number (sg,du,pl) - r: person (1,2,3) - a: state (absolute,construct,determined)', '');
  }
  
  useEffect(() => {
    const init = async () => {
      const { data } = await getResponsesForRunAndCharacter(runId, characterId);
      setResponses(data);
    }

    setResponses(null);
    init()
  }, [runId, characterId]);

  if (!responses) {
    return (
      <div style={styles.container}>
        <Loading />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* <p>Run ID: {runId}</p>
      <p>Character ID: {characterId}</p> */}
        <div style={styles.panelContent}>
          <div style={styles.panelCol}>
            <div style={styles.responsesContainer}>
              <p style={styles.panelTitle}>P1 - Default</p>
              <p>{formatPrompt(responses.find(response => response.prompt_id.min === 'D')?.prompt_id?.prompt)}</p>

              <div style={styles.responsesContent}>
                {responses.filter(response => response.prompt_id.min === 'D').map((response, index) => (
                  <Dropdown key={index} label={`Response ${index + 1}`}>
                    {/* <p>{response.response_id}</p> */}
                    {/* <p>{response.raw_output}</p> */}
                    <HighlightText
                      id={response.response_id}
                      text={response.raw_output}
                      color="#f19837"
                    />
                    <ResponseUtility response={response} />
                  </Dropdown>
                ))}
              </div>
            </div>

          </div>
          <div style={styles.panelCol}>
            <div style={styles.responsesContainer}>
              <p style={styles.panelTitle}>P2 - Constrained</p>
              <p>{formatPrompt(responses.find(response => response.prompt_id.min === 'C')?.prompt_id?.prompt)}</p>
              <BHSAPassage charCode={characterId} />
              <div style={styles.responsesContent}>
                {responses.filter(response => response.prompt_id.min === 'C').map((response, index) => (
                  <Dropdown key={index} label={`Response ${index + 1}`}>
                    {/* <p>{response.response_id}</p> */}
                    <HighlightText
                      id={response.response_id}
                      text={response.raw_output}
                      color="#B3E561"
                    />
                    <ResponseUtility response={response} />
                  </Dropdown>
                ))}
              </div>

            </div>
          </div>

        </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',

    alignItems: 'center',
    justifyContent: 'center',

    width: '100%',
    height: '100%',
  },

  panelContent: {
    display: 'flex',
    width: '100%',
    gap: 20,
    flexDirection: 'row',

    minHeight: '100%',
  },
  panelCol: {
    flex: 1,
    padding: 10,

    overflowY: 'auto',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    margin: 0,
  },
  responsesContainer: {
    padding: 20,
  },
}
