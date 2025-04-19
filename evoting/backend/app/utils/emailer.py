# backend/app/utils/emailer.py
import aiosmtplib
from email.message import EmailMessage
from app.core.config import settings

async def send_mail(to: str, subject: str, html: str):
    msg = EmailMessage()
    msg["From"] = settings.EMAIL_FROM
    msg["To"] = to
    msg["Subject"] = subject
    msg.set_content(html, subtype="html")
    await aiosmtplib.send(
        msg,
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        start_tls=True,
        username=settings.SMTP_USER,
        password=settings.SMTP_PASS,
    )