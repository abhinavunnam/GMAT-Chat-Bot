import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Get a response from Gemini AI
 * @param {Array} messages - Array of message objects with userMessage or aiResponse properties
 * @param {File} image - Optional image file to be included in the request
 * @param {string} systemPrompt - System prompt to guide the AI's behavior
 * @returns {Promise<string>} - The AI response text
 */
export const getGeminiResponse = async (messages, image = null, systemPrompt = "") => {
  try {
    // Initialize the Gemini API client with the correct API key
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

    // Get the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Process image file if it exists
    let imageData = null;
    if (image) {
      const reader = new FileReader();
      imageData = await new Promise((resolve) => {
        reader.onload = (e) => {
          // Extract the base64 data without the prefix
          const base64Data = e.target.result.split(",")[1];
          resolve(base64Data);
        };
        reader.readAsDataURL(image);
      });
    }

    // Create contents array for the API request
    const contents = [];

    // Add system prompt as the first message
    contents.push({
      role: "model",
      parts: [{ text: systemPrompt }],
    });

    // Add user messages and AI responses in sequence
    for (const msg of messages) {
      if (msg.userMessage) {
        contents.push({
          role: "user",
          parts: [{ text: msg.userMessage }],
        });
      } else if (msg.aiResponse) {
        contents.push({
          role: "model",
          parts: [{ text: msg.aiResponse }],
        });
      }
    }

    // If there's an image, add it to the last user message or create a new one
    if (imageData) {
      // Find the last user message in contents or create a new one
      const lastUserMessageIndex = contents.findLastIndex(
        (item) => item.role === "user"
      );

      if (lastUserMessageIndex !== -1) {
        // Add image to existing last user message
        contents[lastUserMessageIndex].parts.push({
          inlineData: {
            mimeType: image.type || "image/jpeg",
            data: imageData,
          },
        });
      } else {
        // Create a new user message with the image
        contents.push({
          role: "user",
          parts: [
            { text: "" },
            {
              inlineData: {
                mimeType: image.type || "image/jpeg",
                data: imageData,
              },
            },
          ],
        });
      }
    }

    // Call the Gemini API
    const result = await model.generateContent({
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    });

    // Extract and return the response text
    return result.response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(
      `Failed to get response from Gemini AI: ${error.message}`
    );
  }
};