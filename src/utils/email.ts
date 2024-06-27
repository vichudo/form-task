import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export async function sendPasswordResetEmail(toEmail: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset?token=${resetToken}`;

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: toEmail,
        subject: 'FormTask - Restablecimiento de Contraseña',
        text: `
Hola,

Has solicitado restablecer tu contraseña para Formtask. 
Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:

${resetUrl}

Este enlace expirará en 15min.

Si no solicitaste restablecer tu contraseña, por favor ignora este correo.

Por favor, no respondas a este correo electrónico. Este buzón no está monitoreado y no recibirás una respuesta.

Saludos cordiales,
El Equipo de Tu Aplicación
    `,
        html: `
<h2>Restablecimiento de Contraseña FormTask</h2>
<p>Hola,</p>
<p>Has solicitado restablecer tu contraseña FormTask.</p>
<p>Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:</p>
<p><a href="${resetUrl}">${resetUrl}</a></p>
<p>Este enlace expirará en 15min.</p>
<p>Si no solicitaste restablecer tu contraseña, por favor ignora este correo.</p>
<p><strong>Por favor, no respondas a este correo electrónico. Este buzón no está monitoreado y no recibirás una respuesta.</strong></p>
<p>Saludos cordiales,<br>El Equipo de FormTask</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);

    } catch (error) {
        throw new Error('No se pudo enviar el correo de restablecimiento de contraseña');
    }
}