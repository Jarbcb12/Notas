const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const { comparePassword, hashPassword, signToken } = require("../utils/auth");

async function register(req, res) {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    throw new AppError("Nombre, correo y contrasena son obligatorios");
  }

  if (password.length < 8) {
    throw new AppError("La contrasena debe tener al menos 8 caracteres");
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new AppError("Ya existe una cuenta con este correo");
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: { fullName, email, passwordHash }
  });

  const token = signToken(user);

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email
    }
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Correo y contrasena son obligatorios");
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError("Credenciales invalidas", 401);
  }

  const isValid = await comparePassword(password, user.passwordHash);

  if (!isValid) {
    throw new AppError("Credenciales invalidas", 401);
  }

  const token = signToken(user);

  return res.json({
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email
    }
  });
}

async function profile(req, res) {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { id: true, fullName: true, email: true, createdAt: true }
  });

  return res.json(user);
}

module.exports = {
  register,
  login,
  profile
};
