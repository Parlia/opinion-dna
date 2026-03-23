import https from "node:https";

/**
 * Shared Claude API streaming utility.
 * Extracts the streaming call from the report generation route
 * so both individual and comparison reports can reuse it.
 *
 * Flow:
 *   systemPrompt + userPrompt
 *       │
 *       ▼
 *   HTTPS POST to api.anthropic.com/v1/messages
 *       │
 *       ▼
 *   SSE stream → accumulate content_block_delta → return full text
 */
export function streamClaude(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  options?: { maxTokens?: number; model?: string }
): Promise<string> {
  const { maxTokens = 16000, model = "claude-opus-4-6" } = options ?? {};

  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model,
      max_tokens: maxTokens,
      stream: true,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    });

    const req = https.request(
      {
        hostname: "api.anthropic.com",
        path: "/v1/messages",
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-length": Buffer.byteLength(body),
        },
      },
      (res) => {
        if (res.statusCode !== 200) {
          let errorData = "";
          res.on("data", (chunk) => (errorData += chunk));
          res.on("end", () => {
            reject(new Error(`Anthropic API error ${res.statusCode}: ${errorData}`));
          });
          return;
        }

        let fullText = "";
        let buffer = "";

        res.on("data", (chunk) => {
          buffer += chunk.toString();

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const event = JSON.parse(data);
              if (event.type === "content_block_delta" && event.delta?.text) {
                fullText += event.delta.text;
              }
            } catch {
              // Skip unparseable SSE lines
            }
          }
        });

        res.on("end", () => {
          resolve(fullText);
        });
      }
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}
