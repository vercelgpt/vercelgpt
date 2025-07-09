export async function POST(req: Request) {
  try {
    const { messages, model = "gemini-1.5-pro" } = await req.json()

    const userText = Array.isArray(messages) && messages.length ? (messages[messages.length - 1]?.content ?? "") : ""

    // --- Gemini call ---
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=AIzaSyCUwVIXd6lsyvnIdxDbegqeCGKSuVzp9MA`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userText }] }],
        }),
      },
    )

    const json = await geminiRes.json()
    const fullText = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "Brak odpowiedzi"

    // --- stream plain text (no protocol codes, no JSON) ---
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const words = fullText.split(" ")
        let i = 0
        const interval = setInterval(() => {
          if (i < words.length) {
            const chunk = (i === 0 ? "" : " ") + words[i]
            controller.enqueue(encoder.encode(chunk))
            i++
          } else {
            clearInterval(interval)
            controller.close()
          }
        }, 40)
      },
    })

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch (err) {
    console.error("Gemini API error:", err)
    return new Response((err instanceof Error ? err.message : "Unknown error").toString(), {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    })
  }
}
