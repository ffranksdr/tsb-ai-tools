export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { prompt, tool, topic, source, email } = req.body;

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
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt
      })
    });

    const data = await response.json();

    return res.status(200).json({
      success: true,
      result: data.output?.[0]?.content?.[0]?.text || JSON.stringify(data, null, 2)
    });

  } catch (error) {

    return res.status(500).json({
      error: "AI generation failed",
      details: error.message
    });

  }
}
