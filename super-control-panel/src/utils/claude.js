import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true
});

export const sendQueryToClaude = async (query, model) => {
  console.log("PARAMS: ", query, model);
  const msg = await client.messages.create({
    model,
    max_tokens: 10000,
    messages: [{
      role: "user",
      content: query
    }],
  });
  console.log(msg.usage);
  return msg;
}

export const calculatePrice = ({
  input_tokens = 0,
  output_tokens = 0,
  cache_creation_input_tokens = 0,
  cache_read_input_tokens = 0,
  model,
}) => {
  const modelPricing = {
    "claude-haiku-4-5": {
      input_tokens: 0.000001,
      output_tokens: 0.000005,
      cache_creation_input_tokens: 0.00000125,
      cache_read_input_tokens: 0.0000001,
    },
    "claude-sonnet-5": {
      input_tokens: 0.000002,
      output_tokens: 0.00001,
      cache_creation_input_tokens: 0.0000025,
      cache_read_input_tokens: 0.0000002,
    },
  };

  if (!modelPricing[model]) {
    console.warn(`Pricing for model ${model} not found. Using default pricing.`);
  }

  const pricing = modelPricing[model] || modelPricing["claude-haiku-4-5"];

  const totalCost =
    (input_tokens * pricing.input_tokens) +
    (output_tokens * pricing.output_tokens) +
    (cache_creation_input_tokens * pricing.cache_creation_input_tokens) +
    (cache_read_input_tokens * pricing.cache_read_input_tokens);

  return totalCost;
}
