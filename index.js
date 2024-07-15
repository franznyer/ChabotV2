const express = require('express');
const path = require('path');
const fetch = require('node-fetch');
const app = express();
const port = 5000;

app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve the React app for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// API endpoint for chat
app.post('/api/chat', async (req, res) => {
  const { query } = req.body;

  try {
    // Request to vector store for relevant documents
    const vectorStoreResponse = await fetch('https://your-vector-store-endpoint.com/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VECTOR_STORE_API_KEY}`
      },
      body: JSON.stringify({ query })
    });

    const relevantDocuments = await vectorStoreResponse.json();

    // Request to OpenAI API with relevant documents
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

    res.json({ response: aiResponse.choices[0].text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
