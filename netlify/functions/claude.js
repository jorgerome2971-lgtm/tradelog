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
