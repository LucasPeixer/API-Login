import express from "express";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
//import authenticateToken from "./auth.js";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use(cors());

app.get("/cards", async (req, res) => {
  try {
    const { email } = req.user;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const cards = await prisma.card.findMany({
      where: {
        authorId: user.id, // Filtra os cards pelo ID do usuário
      },
    });

    res.status(200).json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar os cards" });
  }
});

app.post("/cards", async (req, res) => {
  try {
    const { email } = req.user;
    const { todo } = req.body;

    console.log({ email });

    // Encontre o usuário baseado no email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // Crie um novo card associado ao usuário
    const newCard = await prisma.card.create({
      data: {
        todo,
        authorId: user.id, // Associe o card ao usuário logado
      },
    });

    res.status(201).json(newCard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar o card" });
  }
});

app.delete("/cards", async (req, res) => {
  try {
    const { email } = req.user;
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    const card = await prisma.card.findUnique({
      where: { id },
    });

    if (!card || card.authorId !== user.id) {
      return res
        .status(403)
        .json({ message: "Acesso negado ou Card não encontrado" });
    }

    // Deletar o Card
    await prisma.card.delete({
      where: { id },
    });

    res.status(200).json({ message: "Card deletado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao deletar o card" });
  }
});
// =========================== USER===========================
app.post("/users", async (req, res) => {
  await prisma.user.create({
    data: {
      email: req.body.email,
      password: req.body.password,
    },
  });
  res.status(201).json({ message: "Registro atualizado com sucesso!" });
});

app.delete("/users", async (req, res) => {
  await prisma.user.delete({
    where: {
      id: req.params.id,
    },
  });
  res.status(200).json({ message: "Usuario deletado com sucesso!" });
});
// ==============================Login=============================
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
  }
  try {
    const user = await prisma.user.findUnique({
      where: { email: email },
    });
    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado " });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    res.status(200).json({ message: "Login realizado com sucesso", user });
  } catch (error) {
    res.status(500).json({ error: "Erro no servidor" });
  }
});

app.listen(3000);
