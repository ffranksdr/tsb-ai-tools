export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};

    const prompt =
      typeof body.prompt === "string" ? body.prompt.trim() : "";
    const businessName =
      typeof body.businessName === "string" ? body.businessName.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim() : "";
    const city =
      typeof body.city === "string" ? body.city.trim() : "";
    const topic =
      typeof body.topic === "string" ? body.topic.trim() : "";
    const source =
      typeof body.source === "string" ? body.source.trim() : "";

    const timestamp = new Date().toISOString();

    console.log("TSB AI VISIBILITY LEAD:", {
      businessName,
      email,
      city,
      topic,
      source,
      timestamp
    });

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!businessName) {
      return res.status(400).json({ error: "Business name is required" });
    }

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!city) {
      return res.status(400).json({ error: "City is required" });
    }

    if (!topic) {
      return res.status(400).json({ error: "Business description is required" });
    }

    // 1) Send lead intake data to GoHighLevel webhook
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
            businessDescription: topic,
            source,
            submitted_at: timestamp,
            trigger: "tsb_ai_visibility_lead_engine"
          })
        }
      );
    } catch (webhookError) {
      console.error("GHL Lead Webhook Error:", webhookError);
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
      data?.output_text ||
      "No response generated";

    // 2) Send AI result to GoHighLevel webhook after result is generated
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
            businessDescription: topic,
            source,
            ai_result: result,
            submitted_at: timestamp,
            trigger: "tsb_ai_visibility_lead_engine_result"
          })
        }
      );
    } catch (webhookError) {
      console.error("GHL Result Webhook Error:", webhookError);
    }

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
