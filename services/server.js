import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

app.get("/users", async (req, res) => {
  if (req.query) {
    const userRet = await prisma.user.findFirst({
      where: {
        name: req.query.name,
        age: req.query.age,
        email: req.query.email,
      },
    });
    const isValid = !!userRet;
    res.json({ success: isValid });
  }
});

app.post("/users", async (req, res) => {
  await prisma.user.create({
    data: {
      email: req.body.email,
      password: req.body.password,
    },
  });
  res.status(201).json({ message: "Registro atualizado com sucesso!" });
});

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

/*
  Get
*/
