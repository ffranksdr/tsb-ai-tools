async function generate() {
  const tool = document.getElementById("tool").value;
  const topic = document.getElementById("topic").value.trim();
  const email = document.getElementById("email")?.value.trim() || "marketinginfodoc@gmail.com";

  const results = document.getElementById("results");
  const copyBtn = document.getElementById("copyBtn");

  if (!topic) {
    results.style.display = "block";
    results.innerHTML = "Please enter a topic first.";
    copyBtn.style.display = "none";
    return;
  }

  if (!email) {
    results.style.display = "block";
    results.innerHTML = "Please enter your email first.";
    copyBtn.style.display = "none";
    return;
  }

  let prompt = "";
  const baseInstruction = `You are an expert digital marketing strategist helping small local businesses grow online.

Write clear, practical marketing content that a small business owner can immediately use.
Use current marketing best practices and evergreen SEO principles.
Do not include specific years such as 2023, 2024, or 2025.`;

  if (tool === "youtube") {
    prompt = `${baseInstruction}

Create an evergreen YouTube SEO package for this topic: ${topic}.

Return:
1. Three engaging YouTube titles
2. One SEO-optimized video description
3. Ten YouTube tags in a comma-separated list`;
  }

  if (tool === "blog") {
    prompt = `${baseInstruction}

Write an SEO-optimized blog post about this topic: ${topic}.

Return:
1. A strong blog title
2. An engaging introduction
3. Clear section headings
4. Helpful body content
5. A persuasive call to action`;
  }

  if (tool === "gmb") {
    prompt = `${baseInstruction}

Create a Google Business Profile post for this business topic: ${topic}.

Return:
1. A strong attention-grabbing headline
2. A 100-150 word Google Business Profile post
3. A call-to-action encouraging customers to contact or visit
4. 3 relevant hashtags`;
  }

  if (tool === "social") {
    prompt = `${baseInstruction}

Create social media marketing content for this topic: ${topic}.

Return:
1. 3 engaging social media captions
2. 1 short promotional version
3. 5 relevant hashtags
4. A clear call-to-action`;
  }

  if (tool === "keywords") {
    prompt = `${baseInstruction}

Generate local SEO content ideas and keyword assets for this topic: ${topic}.

Return:
1. 20 local SEO keywords
2. 10 long-tail keyword phrases
3. 5 content topic ideas based on those keywords`;
  }

  results.style.display = "block";
  results.innerHTML = "⚡ TSB AI is generating optimized marketing content for you. This may take a few seconds...";
  copyBtn.style.display = "none";

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt: prompt,
        tool: tool,
        topic: topic,
        source: "tsb_ai_toolkit",
        email: email
      })
    });

    const data = await response.json();

    results.innerHTML =
      data.result?.content ||
      data.result ||
      data.content ||
      JSON.stringify(data, null, 2);

    copyBtn.style.display = "inline-block";

  } catch (error) {
    results.innerHTML = "Error: " + error.message;
    copyBtn.style.display = "none";
  }
}
