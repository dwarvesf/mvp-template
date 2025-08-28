import * as React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Link,
  Button,
} from '@react-email/components';

interface ResetPasswordProps {
  url: string;
}

export default function ResetPassword({ url }: ResetPasswordProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your MVP Template password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Password Reset Request</Heading>
          <Text style={text}>
            You requested to reset your password. Click the button below to proceed:
          </Text>
          <Button style={button} href={url}>
            Reset Password
          </Button>
          <Text style={text}>
            Or copy and paste this URL into your browser: <Link href={url}>{url}</Link>
          </Text>
          <Text style={text}>
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f3f4f6',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px',
  borderRadius: '8px',
  maxWidth: '600px',
  marginTop: '40px',
};

const h1 = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
};

const text = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 10px',
};

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
  margin: '20px 0',
};
