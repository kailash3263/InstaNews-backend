const API_KEYS = [
  process.env.apiKey1,
  process.env.apiKey2,
  process.env.apiKey3,
  process.env.apiKey4,
  process.env.apiKey5,
]

async function fetchNewsWithRotation(buildUrl) {
  let lastError;

  for (const key of API_KEYS) {
    try {
      const response = await fetch(buildUrl(key));

      if (response.status === 429) {
        lastError = new Error('Rate limited');
        continue; // try next key
      }

      if (!response.ok) {
        lastError = new Error(`Request failed: ${response.status}`);
        continue;
      }

      return await response.json();
    } catch (err) {
      lastError = err;
      continue;
    }
  }

  throw lastError || new Error('All API keys exhausted');
}

module.exports = fetchNewsWithRotation;