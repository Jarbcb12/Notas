const prisma = require("../config/prisma");
const AppError = require("../utils/appError");
const { comparePassword, hashPassword, signToken } = require("../utils/auth");
const env = require("../config/env");
const { sendPasswordResetEmail } = require("../services/email.service");
const { createResetToken, hashToken } = require("../utils/tokens");

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

async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    throw new AppError("El correo es obligatorio");
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return res.json({
      message: "Si el correo existe, enviaremos instrucciones para recuperar el acceso."
    });
  }

  const { rawToken, hashedToken, expiresAt } = createResetToken();

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken: hashedToken,
      resetTokenExpiresAt: expiresAt
    }
  });

  const resetUrl = `${env.appUrl.replace(/\/$/, "")}/reset-password?token=${rawToken}`;
  const emailResult = await sendPasswordResetEmail({
    to: user.email,
    fullName: user.fullName,
    resetUrl
  });

  return res.json({
    message: "Si el correo existe, enviaremos instrucciones para recuperar el acceso.",
    ...(env.nodeEnv !== "production" && emailResult.resetUrl ? { debugResetUrl: emailResult.resetUrl } : {})
  });
}

async function resetPassword(req, res) {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new AppError("Token y contrasena son obligatorios");
  }

  if (password.length < 8) {
    throw new AppError("La contrasena debe tener al menos 8 caracteres");
  }

  const hashed = hashToken(token);

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashed,
      resetTokenExpiresAt: {
        gt: new Date()
      }
    }
  });

  if (!user) {
    throw new AppError("El enlace de recuperacion es invalido o ya expiro", 400);
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpiresAt: null
    }
  });

  return res.json({
    message: "Contrasena actualizada correctamente"
  });
}

module.exports = {
  register,
  login,
  profile,
  forgotPassword,
  resetPassword
};
