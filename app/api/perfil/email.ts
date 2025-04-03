import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendVerificationCode = async (
  email: string,
  code: string,
  name: string
) => {
  const message = {
    from: `Saberes El Quisco <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Código de Verificación - Saberes El Quisco",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Código de Verificación</h2>
        <p>Hola ${name},</p>
        <p>Has solicitado un código de verificación para editar información de usuario. Tu código es:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; letter-spacing: 5px;">
          ${code}
        </div>
        <p>Este código expirará en 15 minutos.</p>
        <p>Si no has solicitado este código, por favor ignora este correo.</p>
        <p>Saludos,<br>Equipo Saberes El Quisco</p>
      </div>
    `,
  };

  return transporter.sendMail(message);
};

export const sendPasswordResetNotification = async (
  email: string,
  name: string
) => {
  const message = {
    from: `Saberes El Quisco <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Actualización de Credenciales - Saberes El Quisco",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Actualización de Credenciales</h2>
        <p>Hola ${name},</p>
        <p>Te informamos que tus credenciales de acceso han sido actualizadas por un administrador.</p>
        <p>Si no estabas al tanto de este cambio, por favor contacta inmediatamente con el administrador del sistema.</p>
        <p>Saludos,<br>Equipo Saberes El Quisco</p>
      </div>
    `,
  };

  return transporter.sendMail(message);
};

export const sendRegistrationNotification = async (
  email: string,
  name: string
) => {
  const message = {
    from: `Saberes El Quisco <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Solicitud de Registro - Saberes El Quisco",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Solicitud de Registro</h2>
        <p>Hola ${name},</p>
        <p>Tu solicitud de registro en la plataforma Saberes El Quisco ha sido recibida correctamente.</p>
        <p>Tu cuenta está pendiente de validación por un administrador. Recibirás una notificación cuando tu cuenta sea activada.</p>
        <p>Saludos,<br>Equipo Saberes El Quisco</p>
      </div>
    `,
  };

  return transporter.sendMail(message);
};
