import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function sendNewSubmissionEmail(nodeId: string, authorName: string, contentExcerpt: string) {
  if (!resend || !process.env.ADMIN_EMAIL) {
    console.log('Email not configured - skipping notification')
    return
  }

  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
      to: process.env.ADMIN_EMAIL,
      subject: 'New Offsets Submission',
      html: `
        <h2>New Submission Awaiting Approval</h2>
        <p><strong>Author:</strong> ${authorName}</p>
        <p><strong>Node ID:</strong> ${nodeId}</p>
        <p><strong>Preview:</strong></p>
        <blockquote style="border-left: 3px solid #A091A4; padding-left: 1rem; color: #7C6174;">
          ${contentExcerpt.slice(0, 300)}${contentExcerpt.length > 300 ? '...' : ''}
        </blockquote>
        <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin" style="background-color: #7C6174; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.5rem; display: inline-block; margin-top: 1rem;">Review in Admin Panel</a></p>
      `,
    })

    console.log('Email notification sent successfully')
  } catch (error) {
    console.error('Failed to send email notification:', error)
  }
}
