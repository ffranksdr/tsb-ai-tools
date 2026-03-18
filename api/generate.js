export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};

    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const tool = typeof body.tool === "string" ? body.tool.trim() : "";
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const source = typeof body.source === "string" ? body.source.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";

    console.log("TSB TOOL USAGE:", {
      tool,
      topic,
      source,
      email
    });

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API Error:", errorText);

      return res.status(500).json({
        error: "OpenAI request failed",
        details: errorText
      });
    }

    const data = await response.json();

    const result =
      data?.output?.[0]?.content?.[0]?.text ||
      JSON.stringify(data, null, 2);

    return res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    console.error("API Route Error:", error);

    return res.status(500).json({
      error: "AI generation failed",
      details: error.message
    });
  }
}
