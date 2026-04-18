exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  try {
    const body = JSON.parse(event.body);
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "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",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
