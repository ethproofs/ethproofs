import { SITE_NAME, SITE_URL } from "@/lib/constants"

import { EMAIL_COLORS as COLORS } from "@/lib/server/email-colors"

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

interface BaseTemplateOptions {
  title: string
  preheader?: string
  body: string
}

function baseTemplate({ title, preheader, body }: BaseTemplateOptions): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.background};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  ${preheader ? `<span style="display:none;font-size:1px;color:${COLORS.background};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</span>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.background};">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:${COLORS.card};border:1px solid ${COLORS.border};border-radius:12px;">
          <tr>
            <td style="padding:40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <a href="${SITE_URL}" style="font-size:24px;font-weight:700;color:${COLORS.primary};text-decoration:none;letter-spacing:-0.5px;">${SITE_NAME}</a>
                  </td>
                </tr>
                <tr>
                  <td>
                    ${body}
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:24px;border-top:1px solid ${COLORS.border};text-align:center;">
                    <p style="color:${COLORS.mutedForeground};font-size:14px;line-height:1.6;margin:0 0 8px;">questions? reach out on <a href="https://x.com/eth_proofs" style="color:${COLORS.primary};text-decoration:none;">X</a> or <a href="https://t.me/ethproofs_community" style="color:${COLORS.primary};text-decoration:none;">Telegram</a></p>
                    <a href="${SITE_URL}" style="color:${COLORS.mutedForeground};font-size:14px;text-decoration:none;">ethproofs.org</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

interface EmailResult {
  subject: string
  html: string
}

interface TeamSignupPendingEmailOptions {
  teamName: string
}

export function teamSignupPendingEmail({
  teamName,
}: TeamSignupPendingEmailOptions): EmailResult {
  const safeTeamName = escapeHtml(teamName)
  const subject = `your ${SITE_NAME} signup is under review`

  const body = `
    <h1 style="color:${COLORS.foreground};font-size:24px;font-weight:600;margin:0 0 16px;line-height:1.3;">thanks for signing up!</h1>
    <p style="color:${COLORS.mutedForeground};font-size:16px;line-height:1.6;margin:0 0 16px;">We've received your request to sign up a new team on ${SITE_NAME}.</p>
    <p style="color:${COLORS.mutedForeground};font-size:16px;line-height:1.6;margin:0 0 16px;">We will review your application and you'll receive a follow-up email with further instructions once your account has been reviewed.</p>
  `

  return {
    subject,
    html: baseTemplate({
      title: subject,
      preheader: `we're reviewing your signup for ${safeTeamName}`,
      body,
    }),
  }
}

interface TeamRejectedEmailOptions {
  teamName: string
}

export function teamRejectedEmail({
  teamName,
}: TeamRejectedEmailOptions): EmailResult {
  const safeTeamName = escapeHtml(teamName)
  const subject = `update on your ${SITE_NAME} signup`

  const body = `
    <h1 style="color:${COLORS.foreground};font-size:24px;font-weight:600;margin:0 0 16px;line-height:1.3;">signup update</h1>
    <p style="color:${COLORS.mutedForeground};font-size:16px;line-height:1.6;margin:0 0 16px;">Thank you for your interest in ${SITE_NAME}. After reviewing your signup request, we're unable to approve your account at this time.</p>
    <p style="color:${COLORS.mutedForeground};font-size:16px;line-height:1.6;margin:0 0 16px;">We appreciate your understanding.</p>
  `

  return {
    subject,
    html: baseTemplate({
      title: subject,
      preheader: `update on your signup for ${safeTeamName}`,
      body,
    }),
  }
}

interface TeamApprovedEmailOptions {
  teamName: string
  apiKey: string
  dashboardUrl: string
}

export function teamApprovedEmail({
  teamName,
  apiKey,
  dashboardUrl,
}: TeamApprovedEmailOptions): EmailResult {
  const safeTeamName = escapeHtml(teamName)
  const safeApiKey = escapeHtml(apiKey)
  const safeDashboardUrl = escapeHtml(dashboardUrl)
  const subject = `your ${SITE_NAME} account has been approved`

  const body = `
    <h1 style="color:${COLORS.foreground};font-size:24px;font-weight:600;margin:0 0 16px;line-height:1.3;">welcome to ${SITE_NAME}!</h1>
    <p style="color:${COLORS.mutedForeground};font-size:16px;line-height:1.6;margin:0 0 16px;">Your team has been approved! You can now access your dashboard and start submitting proofs.</p>

    <p style="color:${COLORS.mutedForeground};font-size:16px;line-height:1.6;margin:0 0 8px;">Here's your API key:</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background-color:${COLORS.codeBackground};border:1px solid ${COLORS.border};border-radius:8px;padding:16px;font-family:'SF Mono',Monaco,'Andale Mono',monospace;font-size:14px;color:${COLORS.primary};word-break:break-all;">
          ${safeApiKey}
        </td>
      </tr>
    </table>
    <p style="color:${COLORS.mutedForeground};font-size:14px;line-height:1.6;margin:8px 0 24px;">Save this key securely — it won't be shown again.</p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
      <tr>
        <td align="center" style="background-color:${COLORS.primary};border-radius:8px;">
          <a href="${safeDashboardUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:${COLORS.primaryForeground};text-decoration:none;">go to dashboard</a>
        </td>
      </tr>
    </table>
  `

  return {
    subject,
    html: baseTemplate({
      title: subject,
      preheader: `your team ${safeTeamName} is now approved`,
      body,
    }),
  }
}
