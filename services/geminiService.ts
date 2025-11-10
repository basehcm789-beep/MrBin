// ✅ Gemini service (fixed for Vite & Vercel build)
import { GoogleGenerativeAI } from "@google/generative-ai";

// 🔹 Sử dụng biến môi trường đúng chuẩn Vite
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

// 🔸 Kiểm tra khi chưa có API key
if (!apiKey) {
  console.warn("⚠️ Missing VITE_GEMINI_API_KEY in environment variables!");
}

// ✅ Khởi tạo Gemini client
const genAI = new GoogleGenerativeAI(apiKey || "");

export async function analyzeText(prompt: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);

    // ✅ response.text có thể undefined → fallback rỗng
    const response = await result.response;
    const text = response.text ?? "";

    return text.trim();
  } catch (error) {
    console.error("Gemini API error:", error);
    return "⚠️ Lỗi khi gọi API Gemini.";
  }
}

export async function analyzeImage(prompt: string, imageBase64: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/png",
          data: imageBase64,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text ?? "";

    return text.trim();
  } catch (error) {
    console.error("Gemini Vision API error:", error);
    return "⚠️ Lỗi khi xử lý hình ảnh.";
  }
}
