export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};

    const prompt = body.prompt || "";
    const businessName = body.businessName || "";
    const email = body.email || "";
    const city = body.city || "";
    const topic = body.topic || "";
    const source = body.source || "";

    if (!prompt || !businessName || !email || !city || !topic) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🔥 Call OpenAI FIRST (important)
    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
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

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      return res.status(500).json({ error: errorText });
    }

    const data = await aiResponse.json();

    const result =
      data?.output?.[0]?.content?.[0]?.text ||
      "No response generated";

    // 🔥 Send EVERYTHING to GHL (single webhook = cleaner + safer)
    try {
      await fetch(
        "https://services.leadconnectorhq.com/hooks/gxwpEp79etg6vPPoErAO/webhook-trigger/db14b4fa-f291-4b9f-ac35-c48dd2391613",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            businessName,
            email,
            city,
            topic,
            source,
            ai_result: result,
            trigger: "tsb_ai_visibility_lead_engine"
          })
        }
      );
    } catch (err) {
      console.error("Webhook error:", err);
    }

    return res.status(200).json({
      success: true,
      result
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}
