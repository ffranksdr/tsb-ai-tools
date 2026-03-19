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

    console.log("TSB AI VISIBILITY LEAD:", {
      businessName,
      email,
      city,
      topic,
      source
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

    // Send lead data to GoHighLevel webhook
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
            trigger: "tsb_ai_visibility_lead_engine"
          })
        }
      );
    } catch (webhookError) {
      console.error("GHL Webhook Error:", webhookError);
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
      data?.output?.[0]?.content?.[0]?.text || "No response generated";

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
