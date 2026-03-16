// public/worker.js
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.0';

env.allowLocalModels = false;
let classifier;

self.onmessage = async (event) => {
  const { text } = event.data;
  if (!text || text.length < 5) return;

  if (!classifier) {
    classifier = await pipeline('text-classification', 'Xenova/toxic-bert');
  }

  const output = await classifier(text);
  self.postMessage({ result: output });
};