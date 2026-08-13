export const generate = (
  prompt,
  character,
  passage
) => {
  switch (prompt) {
    case 1:
      return prompt1(character, passage);
    case 2:
      return prompt2(character, passage);
    case 3:
      return prompt3(character, passage);
    default:
      return null;
  }
}

export const prompt1 = (
  character,
) => `Why did ${character} do what he/she did in the Old Testament? What kind of person was the character? Answer in 2-3 paragraphs. OMIT FORMATTING. ONLY RETURN TEXT`;

export const prompt2 = (
  character,
  passage,
) => [
  {
    "type": "text",
    "text": "Based only on the passage below, what actions are attributed to the character? Do not infer motivations unless explicitly stated. If the text leaves something unstated, note the gap but do not fill it. Answer in 2-3 paragraphs. OMIT FORMATTING. ONLY RETURN TEXT. #Json property naming conventions - f: reference - h: hebrew - w: words - s: surface - g: gloss - m: morphology - p: Part of Speech - o: Part of Speech (display/predicate category) - v: Verbal Stem (Binyan, etc) - t: Verb Tense / Conjugation - d: Gender m f c (common) - n: Number (sg,du,pl) - r: person (1,2,3) - a: state (absolute,construct,determined)",
    "cache_control": {"type": "ephemeral"}
  },
  {
    "type": "text",
    "text": `character: ${character}, passage: ${passage}`,
    "cache_control": {"type": "ephemeral"}
  },
]

export const prompt3 = (
  character,
  passage,
) => `Analyze ${character} using only narrative structure and actions as stated in ${passage}. Do not infer motivation or psychological states. Answer in 2-3 paragraphs. OMIT FORMATTING`


export const nominal = {
  '1': {
    min: 'D',
    full: 'Default'
  },
  '2': {
    min: 'C',
    full: 'Constrained'
  },
  '3': {
    min: 'L',
    full: 'Literary'
  }
}

export const getModelCode = (model) => {
  if (model.startsWith("claude")) {
    return "CLD";
  } else if (model.startsWith("gpt")) {
    return "GPT";
  } else if (model.startsWith("gemini")) {
    return "GEM";
  } else {
    return "UNK"; // Unknown
  }
}