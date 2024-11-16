import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = "AIzaSyAmqSmM7vHcdlQ_DFfXDQ0TniuI28FGaks";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

async function run(prompt) {
  const chatSession = model.startChat({
      generationConfig,
      history: [],
  });

  const result = await chatSession.sendMessage(prompt);
  return result.response.text();
}

export const retryWithDelay = async (fn, retries = 3, delay = 2000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
      try {
          return await fn();
      } catch (error) {
          if (attempt < retries) {
              console.warn(`Retrying... (${attempt}/${retries})`);
              await new Promise((res) => setTimeout(res, delay));
          } else {
              throw error; // Throw error after max retries
          }
      }
  }
};

export default run;
