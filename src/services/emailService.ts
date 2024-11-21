import nodemailer from 'nodemailer';
import { IGameToList } from '../interfaces/IGameToList';


export const sendEmail = async (gamesToSell: IGameToList[]) => {
    const emailPass = process.env.EMAIL_PASS;
    const formatedGames = gamesToSell.map(game => JSON.stringify(game, null, 2)).join('\n');


    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: 'joaovitormatosgouveia@gmail.com',
                pass: emailPass, // Senha de app. Em gmail.com clique no ícone de perfil -> Gerenciar sua conta do Google -> Segurança -> Verificação em duas etapas -> Senhas de app -> Escreva o nome do app e guarde a senha que será entregue
            },
        });

        const mailOptions = {
            from: 'joaovitormatosgouveia@gmail.com', // Remetente
            to: 'carcadeals@gmail.com', // Destinatário
            subject: `teste when to sell`, // Assunto
            text: `Olá, esses foram os jogos identificados para serem vendidos:\n ${formatedGames}`,
        };

        const sendMail = async (transporter: nodemailer.Transporter, mailOptions: nodemailer.SendMailOptions) => {
            try {
              await transporter.sendMail(mailOptions);
              // console.log(formatedGames);
              console.log('Email enviado.')
            } catch (error) {
              console.error(error);
            }
          }
          sendMail(transporter, mailOptions);
    } catch (error) {
      console.log(error);
    }
}