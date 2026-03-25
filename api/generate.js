export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};

    const businessName = body.businessName || "";
    const email = body.email || "";
    const city = body.city || "";
    const topic = body.topic || "";
    const platform = body.platform || "";
    const details = body.details || "";
    const source = body.source || "direct_results_social_media_toolkit";

    if (!businessName || !email || !city || !topic || !platform) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const prompt = `
You are a social media marketing assistant for local businesses.

Create 3 social media post options for the following business.

Business Name: ${businessName}
City: ${city}
Platform: ${platform}
Topic to Promote: ${topic}
Extra Details or Offer: ${details}

Instructions:
- Write specifically for ${platform}
- Keep the tone professional, engaging, and clear
- Make the content practical for a local business
- Include a call to action
- Do not use hashtags unless they fit naturally
- Format the response clearly as:
Post 1:
Post 2:
Post 3:
`.trim();

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

    const rawText = await aiResponse.text();

    if (!aiResponse.ok) {
      return res.status(aiResponse.status).json({
        error: "OpenAI request failed",
        details: rawText
      });
    }

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      return res.status(500).json({
        error: "OpenAI returned non-JSON content",
        details: rawText
      });
    }

    const result =
      data?.output?.[0]?.content?.[0]?.text ||
      "No response generated";

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
            platform,
            details,
            source,
            ai_result: result,
            trigger: "direct_results_social_media_generator"
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
      error: "Server error",
      details: error.message
    });
  }
}
