import express from "express";
import cors from "cors";
import Groq from "groq-sdk";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5001;
const groq = new Groq({ 
  apiKey: "" 
});

async function getGroqChatCompletion(message) {
  return await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: message,
      },
    ],
    model: "openai/gpt-oss-20b",
  });
}

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Mensagem não fornecida!" });
  }

  try {
    const responseGroq = await getGroqChatCompletion(message);
    return res.json({ response: responseGroq.choices[0]?.message?.content || "" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao consultar a API da Groq." });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});