export const getWorkspaceInvitationTemplate = ({
  inviterName,
  workspaceName,
  roleName,
  invitationUrl,
  expiresInDays,
}: {
  inviterName: string
  workspaceName: string
  roleName: string
  invitationUrl: string
  expiresInDays: number
}): string => {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f9fafb; padding: 40px 20px; color: #1f2937;">
      <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 10px; padding: 36px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">

        <h2 style="margin:0; color:#111827;">
          You're invited 🎉
        </h2>

        <p style="margin-top:20px; font-size:15px; line-height:1.7; color:#374151;">
          <strong>${inviterName}</strong> invited you to join
        </p>

        <h1 style="
          margin:12px 0 24px;
          font-size:28px;
          color:#111827;
          font-weight:700;
        ">
          ${workspaceName}
        </h1>

        <div style="
          background:#f9fafb;
          border:1px solid #e5e7eb;
          border-radius:8px;
          padding:16px;
          margin-bottom:28px;
        ">
          <div style="font-size:12px; color:#6b7280; text-transform:uppercase; letter-spacing:.08em;">
            Role
          </div>

          <div style="
            margin-top:6px;
            font-size:16px;
            font-weight:600;
            color:#111827;
          ">
            ${roleName}
          </div>
        </div>

        <div style="text-align:center; margin:32px 0;">
          <a
            href="${invitationUrl}"
            style="
              display:inline-block;
              background:#111827;
              color:#ffffff;
              text-decoration:none;
              padding:14px 28px;
              border-radius:8px;
              font-size:15px;
              font-weight:600;
            "
          >
            Accept Invitation
          </a>
        </div>

        <p style="font-size:13px; color:#6b7280; line-height:1.7;">
          This invitation expires in <strong>${expiresInDays} days</strong>.
        </p>

        <p style="font-size:13px; color:#6b7280; line-height:1.7;">
          If you already have an Orbit account, simply sign in after accepting the invitation.
          Otherwise, you'll be able to create a new account.
        </p>

        <hr style="border:none; border-top:1px solid #e5e7eb; margin:32px 0;" />

        <p style="font-size:12px; color:#9ca3af; line-height:1.6;">
          If you weren't expecting this invitation, you can safely ignore this email.
        </p>

        <p style="
          font-size:12px;
          color:#9ca3af;
          text-align:center;
          margin-top:28px;
        ">
          © ${new Date().getFullYear()} Orbit. All rights reserved.
        </p>

      </div>
    </div>
  `
}
