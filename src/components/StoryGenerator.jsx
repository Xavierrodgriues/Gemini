import { useEffect, useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

const StoryGenerator = () => {
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generateStory = async () => {
      try {
        setLoading(true);
        const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = "Who is Iron man";
        const result = await model.generateContent([prompt]);

        setStory(result.response.text());
      } catch (error) {
        console.error("Error generating story:", error);
        setStory("Failed to generate story.");
      } finally {
        setLoading(false);
      }
    };

    generateStory();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Magic Backpack Story</h1>
      {loading ? <p>Loading story...</p> : <p>{story}</p>}
    </div>
  );
};

export default StoryGenerator;
