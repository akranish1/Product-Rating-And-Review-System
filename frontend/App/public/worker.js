// public/worker.js
import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;
let classifier;

self.onmessage = async (event) => {
  const { text } = event.data;
  if (!text || text.length < 5) return;

  if (!classifier) {
    // Load the toxic-bert model for real-time content moderation
    classifier = await pipeline('text-classification', 'Xenova/toxic-bert');
  }

  const output = await classifier(text);
  self.postMessage({ result: output });
};