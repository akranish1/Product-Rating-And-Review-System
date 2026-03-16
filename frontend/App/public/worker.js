// public/worker.js
// Use CDN import with specific version
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@2.17.2/dist/transformers.min.js';

env.allowLocalModels = false;
let classifier;
let isInitializing = false;

self.onmessage = async (event) => {
  const { text } = event.data;
  if (!text || text.length < 5) return;

  try {
    if (!classifier && !isInitializing) {
      isInitializing = true;
      // Load the toxic-bert model for real-time content moderation
      classifier = await pipeline('text-classification', 'Xenova/toxic-bert');
      isInitializing = false;
    }

    if (classifier) {
      const output = await classifier(text);
      self.postMessage({ result: output });
    }
  } catch (error) {
    console.error('Worker error:', error);
    self.postMessage({ error: error.message });
  }
};