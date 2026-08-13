import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
  dangerouslyAllowBrowser: true
});

export const sendQueryToClaude = async (query, model) => {
  const msg = await client.messages.create({
    model,
    max_tokens: 1024,
    messages: [{
      role: "user",
      content: query
    }],
  });
  console.log(msg.usage);

  return msg;
}
