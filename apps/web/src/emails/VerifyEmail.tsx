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

interface VerifyEmailProps {
  url: string;
}

export default function VerifyEmail({ url }: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your MVP Template email</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome to MVP Template!</Heading>
          <Text style={text}>Please verify your email address by clicking the button below:</Text>
          <Button style={button} href={url}>
            Verify Email
          </Button>
          <Text style={text}>
            Or copy and paste this URL into your browser: <Link href={url}>{url}</Link>
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
  backgroundColor: '#3b82f6',
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
