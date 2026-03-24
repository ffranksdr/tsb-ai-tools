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
    const platform = body.platform || "";
    const topic = body.topic || "";
    const details = body.details || "";
    const source = body.source || "direct_results_social_media_toolkit";

    if (!prompt || !businessName || !email || !city || !platform || !topic) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Call OpenAI first
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

    // Send the request + AI result to GoHighLevel
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
            platform,
            topic,
            details,
            source,
            ai_result: result,
            trigger: "direct_results_social_media_post_generator"
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
