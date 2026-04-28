import asyncio
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.config import settings

logger = logging.getLogger(__name__)


async def send_password_reset_email(to_email: str, reset_token: str) -> None:
    reset_url = f"{settings.app_url}/reset-password?token={reset_token}"

    if not settings.smtp_host:
        logger.info("[DEV] Password reset link for %s: %s", to_email, reset_url)
        return

    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _send_smtp, to_email, reset_url)


def _send_smtp(to_email: str, reset_url: str) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Reset your Onpdf password"
    msg["From"] = settings.smtp_from_email
    msg["To"] = to_email

    text_body = (
        f"Click the link below to reset your Onpdf password:\n\n"
        f"{reset_url}\n\n"
        f"This link expires in 1 hour. If you did not request a password reset, you can ignore this email."
    )
    html_body = f"""
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
  <h2 style="font-size: 20px; margin-bottom: 8px;">Reset your Onpdf password</h2>
  <p style="color: #555; margin-bottom: 24px;">
    Click the button below to choose a new password. This link is valid for 1 hour.
  </p>
  <a href="{reset_url}"
     style="display: inline-block; background: #2563EB; color: #fff; text-decoration: none;
            padding: 12px 24px; border-radius: 8px; font-weight: 600;">
    Reset Password
  </a>
  <p style="color: #999; font-size: 12px; margin-top: 24px;">
    If you did not request a password reset, you can safely ignore this email.
  </p>
</body>
</html>
"""

    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            if settings.smtp_tls:
                server.starttls()
            if settings.smtp_username and settings.smtp_password:
                server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(msg)
    except Exception:
        logger.exception("Failed to send password reset email to %s", to_email)
