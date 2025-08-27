import { Resend } from 'resend';
import ResetPassword from '@/emails/ResetPassword';

export async function POST(request: Request) {
  const { to, url } = await request.json();
  const resend = new Resend(process.env.RESEND_API_KEY);
  const resp = await resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: 'Reset your password',
    react: ResetPassword({ url }),
  });
  return Response.json(resp);
}
