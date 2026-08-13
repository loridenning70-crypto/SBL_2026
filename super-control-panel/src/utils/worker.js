import { getCharacterIdFromCharCode, getCurrentRun, postResponses } from "./supabase";
import { sendQueryToClaude } from "./claude";
import { getModelCode, nominal } from "./query";

const RESPONSES_PER_PROMPT = 5;

export const processPrompt = async (prompt, model) => {
  const responses = [];

  // Warm the cache with one sequential request
  while (responses.length < 1) {
    const result = await sendQueryToClaude(prompt, model);
    if (isValid(result)) {
      responses.push(result);
    } else {
      console.log("Retrying failed request...");
    }
  }

  while (responses.length < RESPONSES_PER_PROMPT) {
    const remaining = RESPONSES_PER_PROMPT - responses.length;

    const results = await Promise.allSettled(
      Array.from({ length: remaining }, () => sendQueryToClaude(prompt, model))
    );

    for (const result of results) {
      if (result.status === "fulfilled" && isValid(result.value)) {
        responses.push(result.value);
      } else {
        console.log("Retrying failed request...");
      }
    }
  }

  return { responses, error: null };
}

const isValid = (response) => {
  return (
    response &&
    response.content &&
    response.content.length > 0
  );
}

const PROMPT_CONCURRENCY = 5;
let nextPrompt = 0;

export const worker = async (prompts, run, model, onCompleteJob, onFailJob) => {
  // MOVE RUN TO APP.JSX file to avoid rerun
  while (nextPrompt < prompts.length) {
    const prompt = prompts[nextPrompt++];
    const data = await processPrompt(prompt.query, model);

    // Save the 5 successful responses
    const characterId = await getCharacterIdFromCharCode(prompt.charCode);
    const responses = await postResponses(data.responses.map((response, index) => ({
      output_id: getOutputId(prompt, model, run),
      phase: prompt.phase,
      run: run,
      loop_index: index,
      model: model,
      character_id: characterId,
      raw_output: response?.content?.reduce((acc, curr) => acc + (curr?.text || ""), ""),
      prompt_id: prompt.promptCode,

      input_tokens: response?.usage?.input_tokens || 0,
      output_tokens: response?.usage?.output_tokens || 0,
      cache_creation_input_tokens: response?.usage?.cache_creation_input_tokens || 0,
      cache_read_input_tokens: response?.usage?.cache_read_input_tokens || 0,
    })));

    if (onCompleteJob) onCompleteJob(responses);
    if (onFailJob && responses.length < RESPONSES_PER_PROMPT) onFailJob(prompt.charCode, `Failed to generate ${RESPONSES_PER_PROMPT} responses for prompt ${prompt.promptCode}. Only generated ${responses.length} responses.`);
  }
}

const getOutputId = (prompt, model, run) => {
  // [CHAR_CODE]-[MODEL]-[PROMPT_TYPE]-[RUN]
  const modelCode = getModelCode(model);
  return `${prompt.charCode}_${modelCode}_${nominal[prompt.phase].min}_${run}`;
}
