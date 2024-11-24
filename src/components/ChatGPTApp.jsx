import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { useEffect, useState } from "react";
import "@fontsource/caveat";

const RecipeApp = () => {
  const [messages, setMessages] = useState([]); // Stores chat history
  const [userInput, setUserInput] = useState(""); // User's current input
  const [loading, setLoading] = useState(false); // Loading state

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = styles.scrollbarStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  

  const fetchResponse = async () => {
    if (!userInput.trim()) return;

    const newMessage = { sender: "user", text: userInput };
    setMessages((prev) => [...prev, newMessage]);

    try {
      setLoading(true);
      const api = import.meta.env.VITE_API_KEY;
      const genAI = new GoogleGenerativeAI(api);

      const schema = {
        description: "List of recipes based on leftover food items",
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            recipeName: { type: SchemaType.STRING },
            ingredients: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
            instructions: { type: SchemaType.STRING },
          },
          required: ["recipeName", "ingredients", "instructions"],
        },
      };

      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });

      const result = await model.generateContent(
        `List some recipes that can be made with the following ingredients: ${userInput}`
      );

      const recipes = result.response.text();

      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: formatRecipes(recipes) },
      ]);
    } catch (error) {
      console.error("Error generating response:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Sorry, I couldn't generate a recipe." },
      ]);
    } finally {
      setLoading(false);
      setUserInput("");
    }
  };

  const formatRecipes = (recipesText) => {
    try {
      const recipes = JSON.parse(recipesText);
      return recipes
        .map(
          (recipe) =>
            `<strong>${recipe.recipeName}</strong><br />Ingredients: ${recipe.ingredients.join(
              ", "
            )}<br />Instructions: ${recipe.instructions}<br /><br />`
        )
        .join("");
    } catch (error) {
      return "Could not parse recipe data: " + error;
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Leftover Food Recipe Generator</h1>
      <div style={styles.chatWindow}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              ...styles.message,
              ...(message.sender === "user" ? styles.userMessage : styles.aiMessage),
            }}
            dangerouslySetInnerHTML={{ __html: message.text }}
          />
        ))}
        {loading && <div style={styles.loading}>AI is typing...</div>}
      </div>
      <div style={styles.inputContainer}>
        <input
          type="text"
          style={styles.input}
          placeholder="Type your leftover food items..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !loading && fetchResponse()}
        />
        <button style={styles.button} onClick={fetchResponse} disabled={loading}>
          {loading ? "..." : "Get Recipes"}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundImage: "url('https://img.freepik.com/free-vector/flat-design-food-illustration-background_23-2149130944.jpg')",
    backgroundSize: "cover",
    padding: "20px",
    fontFamily: "'Caveat', cursive",
  },
  header: {
    fontSize: "2.5rem",
    marginBottom: "20px",
    color: "#A0522D",
    fontWeight: "bold",
  },
  chatWindow: {
    width: "90%",
    maxWidth: "600px",
    height: "70%",
    backgroundColor: "#3E2723",
    borderRadius: "10px",
    overflowY: "auto",
    padding: "10px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  message: {
    maxWidth: "70%",
    padding: "15px",
    borderRadius: "10px",
    wordWrap: "break-word",
    fontSize: "0.9rem", // Increased font size
    lineHeight: "1.8", // Adjust line height for readability
    fontFamily: "'Comic Sans MS', sans-serif", // Comic Sans font
    color: "#FFFFFF", // White text
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#6D4C41",
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#8D6E63",
  },
  loading: {
    alignSelf: "flex-start",
    fontStyle: "italic",
    color: "#888",
  },
  inputContainer: {
    width: "90%",
    maxWidth: "600px",
    display: "flex",
    gap: "10px",
    marginTop: "10px",
  },
  input: {
    flex: 1,
    padding: "10px",
    fontSize: "1rem",
    borderRadius: "5px",
    backgroundColor: "#333",
    color: "#fff",
    outline: "none",
  },
  button: {
    padding: "10px 20px",
    fontSize: "1rem",
    backgroundColor: "#FF8C00",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  },
  buttonHover: `
    button:hover {
      background-color: #FF7043;
      transform: scale(1.05);
    }
  `,
  // Custom scrollbar styles
  scrollbarStyles: `
    /* Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    /* Track */
    ::-webkit-scrollbar-track {
      background: #3E2723; /* Dark background for track */
      border-radius: 10px;
    }

    /* Handle (the draggable part of the scrollbar) */
    ::-webkit-scrollbar-thumb {
      background-color: #6D4C41; /* Same as user message background */
      border-radius: 10px;
    }

    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
      background-color: #8D6E63; /* Hover effect with AI message background */
    }
  `,
};

export default RecipeApp;