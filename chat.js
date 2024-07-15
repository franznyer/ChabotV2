const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const { query } = JSON.parse(event.body);

  // Requête au vector store pour récupérer des documents pertinents
  const vectorStoreResponse = await fetch('https://your-vector-store-endpoint.com/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.VECTOR_STORE_API_KEY}`
    },
    body: JSON.stringify({ query })
  });

  const relevantDocuments = await vectorStoreResponse.json();

  // Requête à l'API OpenAI avec les documents pertinents
  const openAIResponse = await fetch('https://api.openai.com/v1/engines/davinci-codex/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      prompt: `Assistant ID: ${process.env.OPENAI_ASSISTANT_ID}\nQuery: ${query}\nRelevant Documents: ${relevantDocuments.join('\n')}`,
      max_tokens: 150
    })
  });

  const aiResponse = await openAIResponse.json();

  return {
    statusCode: 200,
    body: JSON.stringify({ response: aiResponse.choices[0].text })
  };
};
