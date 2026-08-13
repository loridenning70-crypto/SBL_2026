export const convertTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString(); // Convert to local date and time string
}

export const formatPrice = (price) => {
  return `$${price.toFixed(3)}`;
}

export const response = `
  response_id, created_at, output_id, phase, model, loop_index, raw_output,
  character_id(char_code, name, book, char_type, reception_density, passages),
  prompt_id(prompt_id, full, min, prompt), run, 
  input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens
`