"use server"

import nodemailer from "nodemailer"

import { SITE_NAME } from "@/lib/constants"

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10)
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const EMAIL_FROM_ADDRESS = process.env.EMAIL_FROM || "noreply@ethproofs.org"

interface EmailOptions {
  to: string
  subject: string
  html: string
}

function createTransporter() {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const transporter = createTransporter()

  if (!transporter) {
    console.warn("email service not configured, skipping email send")
    return false
  }

  try {
    await transporter.sendMail({
      from: {
        name: SITE_NAME,
        address: EMAIL_FROM_ADDRESS,
      },
      to: options.to,
      subject: options.subject,
      html: options.html,
    })
    return true
  } catch (error) {
    console.error("failed to send email:", error)
    return false
  }
}
