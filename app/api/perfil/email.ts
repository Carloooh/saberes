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

export const sendAccountStatusNotification = async (
  email: string,
  name: string,
  status: string
) => {
  const isActive = status === "Activa";

  const message = {
    from: `Saberes El Quisco <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Cuenta ${
      isActive ? "Activada" : "Desactivada"
    } - Saberes El Quisco`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Estado de Cuenta Actualizado</h2>
        <p>Hola ${name},</p>
        ${
          isActive
            ? `<p>Nos complace informarte que tu cuenta en la plataforma Saberes El Quisco ha sido <strong>activada</strong>.</p>
             <p>Ya puedes acceder a la plataforma con tus credenciales.</p>`
            : `<p>Te informamos que tu cuenta en la plataforma Saberes El Quisco ha sido <strong>desactivada</strong>.</p>
             <p>Si crees que esto es un error, por favor contacta con el administrador del sistema.</p>`
        }
        <p>Saludos,<br>Equipo Saberes El Quisco</p>
      </div>
    `,
  };

  return transporter.sendMail(message);
};

export const sendAccountDeletionNotification = async (
  email: string,
  name: string
) => {
  const message = {
    from: `Saberes El Quisco <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Cuenta Eliminada - Saberes El Quisco`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Cuenta Eliminada</h2>
        <p>Hola ${name},</p>
        <p>Te informamos que tu cuenta en la plataforma Saberes El Quisco ha sido <strong>eliminada</strong>.</p>
        <p>Si crees que esto es un error o necesitas más información, por favor contacta con el administrador del sistema.</p>
        <p>Saludos,<br>Equipo Saberes El Quisco</p>
      </div>
    `,
  };

  return transporter.sendMail(message);
};

export const sendCourseChangeNotification = async (
  email: string,
  name: string,
  courseName: string
) => {
  const message = {
    from: `Saberes El Quisco <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Cambio de Curso - Saberes El Quisco`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Cambio de Curso</h2>
        <p>Hola ${name},</p>
        <p>Te informamos que has sido asignado al curso <strong>${courseName}</strong> en la plataforma Saberes El Quisco.</p>
        <p>Si tienes alguna pregunta sobre este cambio, por favor contacta con el administrador del sistema.</p>
        <p>Saludos,<br>Equipo Saberes El Quisco</p>
      </div>
    `,
  };

  return transporter.sendMail(message);
};

export const sendTeacherAssignmentNotification = async (
  email: string,
  name: string,
  courseDetails: { courseName: string; subjects: string[] }[]
) => {
  // Format the course and subject information
  let coursesList = "";

  if (courseDetails.length === 0) {
    coursesList =
      "<p>Se han eliminado todas tus asignaciones de cursos y asignaturas.</p>";
  } else {
    coursesList = '<ul style="list-style-type: disc; padding-left: 20px;">';
    courseDetails.forEach((course) => {
      coursesList += `<li><strong>${course.courseName}</strong>`;
      if (course.subjects.length > 0) {
        coursesList +=
          '<ul style="list-style-type: circle; padding-left: 20px;">';
        course.subjects.forEach((subject) => {
          coursesList += `<li>${subject}</li>`;
        });
        coursesList += "</ul>";
      }
      coursesList += "</li>";
    });
    coursesList += "</ul>";
  }

  const message = {
    from: `Saberes El Quisco <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `Actualización de Asignaciones - Saberes El Quisco`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Actualización de Asignaciones</h2>
        <p>Hola ${name},</p>
        <p>Te informamos que tus asignaciones de cursos y asignaturas han sido actualizadas en la plataforma Saberes El Quisco.</p>
        <p>Tus asignaciones actuales son:</p>
        ${coursesList}
        <p>Si tienes alguna pregunta sobre estos cambios, por favor contacta con el administrador del sistema.</p>
        <p>Saludos,<br>Equipo Saberes El Quisco</p>
      </div>
    `,
  };

  return transporter.sendMail(message);
};

export const sendSelfPasswordResetNotification = async (
  email: string,
  name: string,
  emailChanged: boolean = false,
  passwordChanged: boolean = false
) => {
  let changeDescription = "";
  const subject = "Actualización de Credenciales - Saberes El Quisco";

  if (emailChanged && passwordChanged) {
    changeDescription = "correo electrónico y contraseña";
  } else if (emailChanged) {
    changeDescription = "correo electrónico";
  } else if (passwordChanged) {
    changeDescription = "contraseña";
  } else {
    changeDescription = "credenciales";
  }

  const message = {
    from: `Saberes El Quisco <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Actualización de Credenciales</h2>
        <p>Hola ${name},</p>
        <p>Te informamos que tu ${changeDescription} ha sido actualizada exitosamente en la plataforma Saberes El Quisco.</p>
        <p>Si no has realizado este cambio, por favor contacta inmediatamente con el administrador del sistema.</p>
        <p>Saludos,<br>Equipo Saberes El Quisco</p>
        <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
          Este es un correo automático, por favor no respondas a este mensaje.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(message);
    console.log(
      `Notificación de actualización de credenciales enviada a ${email}`
    );
    return true;
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    throw error;
  }
};

export const sendSelfVerificationCode = async (
  email: string,
  code: string,
  name: string
) => {
  const mailOptions = {
    from: `Saberes El Quisco <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Código de Verificación - Actualización de Credenciales",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Código de Verificación</h2>
        <p>Hola ${name},</p>
        <p>Has solicitado actualizar tus credenciales en el sistema del Colegio Saberes. Para completar este proceso, utiliza el siguiente código de verificación:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p>Este código expirará en 15 minutos.</p>
        <p>Si no has solicitado este cambio, por favor ignora este correo o contacta al administrador del sistema.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
          Este es un correo automático, por favor no respondas a este mensaje.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Código de verificación enviado a ${email}`);
    return true;
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    throw error;
  }
};

export const sendPasswordResetCode = async (
  email: string,
  code: string,
  name: string
) => {
  const mailOptions = {
    from: `Saberes El Quisco <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Código de Verificación - Restablecimiento de Contraseña",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Restablecimiento de Contraseña</h2>
        <p>Hola ${name},</p>
        <p>Has solicitado restablecer tu contraseña en la plataforma Saberes El Quisco. Para completar este proceso, utiliza el siguiente código de verificación:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p>Este código expirará en 15 minutos.</p>
        <p>Si no has solicitado este cambio, por favor ignora este correo o contacta al administrador del sistema.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
          Este es un correo automático, por favor no respondas a este mensaje.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Código de restablecimiento enviado a ${email}`);
    return true;
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    throw error;
  }
};

export const sendPasswordResetConfirmation = async (
  email: string,
  name: string
) => {
  const mailOptions = {
    from: `Saberes El Quisco <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Contraseña Restablecida - Saberes El Quisco",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Contraseña Restablecida</h2>
        <p>Hola ${name},</p>
        <p>Te confirmamos que tu contraseña ha sido restablecida exitosamente en la plataforma Saberes El Quisco.</p>
        <p>Ya puedes acceder a tu cuenta con tu nueva contraseña.</p>
        <p>Si no has realizado este cambio, por favor contacta inmediatamente con el administrador del sistema.</p>
        <p>Saludos,<br>Equipo Saberes El Quisco</p>
        <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
          Este es un correo automático, por favor no respondas a este mensaje.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `Confirmación de restablecimiento de contraseña enviada a ${email}`
    );
    return true;
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    throw error;
  }
};

export const sendWelcomeEmail = async (
  email: string,
  name: string,
  rut: string,
  password: string
) => {
  const message = {
    from: `Saberes El Quisco <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Bienvenido a Saberes El Quisco - Credenciales de acceso",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Bienvenido a Saberes El Quisco</h2>
        <p>Hola ${name},</p>
        <p>Bienvenid@ a la nueva plataforma Web del programa Saberes.</p>
        <p>Puedes acceder mediante <a href="https://saberes.elquisco.cl">saberes.elquisco.cl</a> desde una red de internet local o desde <a href="https://saberes.elquisco.cl:8081">saberes.elquisco.cl:8081</a> desde una red de internet externa.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <p style="margin: 0; font-weight: bold;">Tus credenciales para acceder son:</p>
          <p style="margin: 10px 0 0 0;"><strong>RUT:</strong> ${rut}</p>
          <p style="margin: 5px 0 0 0;"><strong>Contraseña:</strong> ${password}</p>
        </div>
        
        <p><strong>Importante:</strong> La contraseña fue generada de forma automática, no olvides cambiarla por una que puedas recordar fácilmente.</p>
        
        <p>Si tienes alguna duda o problema para acceder, por favor contacta al administrador del sistema.</p>
        
        <p>Saludos,<br>Equipo Saberes El Quisco</p>
        
        <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
          Este es un correo automático, por favor no respondas a este mensaje.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(message);
    console.log(`Correo de bienvenida enviado a ${email}`);
    return true;
  } catch (error) {
    console.error("Error al enviar el correo de bienvenida:", error);
    throw error;
  }
};

export const sendGeneralMessage = async (
  email: string,
  name: string,
  subject: string,
  message: string
) => {
  const mailOptions = {
    from: `Saberes El Quisco <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">${subject}</h2>
        <p>Hola ${name},</p>
        <div style="margin: 20px 0;">
          ${message}
        </div>
        <p>Saludos,<br>Equipo Saberes El Quisco</p>
        <p style="margin-top: 30px; font-size: 12px; color: #777; text-align: center;">
          Este es un correo automático, por favor no respondas a este mensaje.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Mensaje general enviado a ${email}`);
    return true;
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    throw error;
  }
};
