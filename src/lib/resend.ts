// Resend API Wrapper
// Docs: https://resend.com/api-docs

import type { SendCodeResult } from "./auth";

export interface ResendConfig {
  apiKey: string;
  fromEmail: string;
}

/**
 * Envia e-mail via Resend API
 */
export async function sendEmail({
  apiKey,
  fromEmail,
  to,
  subject,
  html,
}: {
  apiKey: string;
  fromEmail: string;
  to: string;
  subject: string;
  html: string;
}): Promise<SendCodeResult> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Resend API error: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  return { success: true };
}

export default sendEmail;