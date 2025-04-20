from app.utils.emailer import send_mail

async def notify_user_login(email: str):
    await send_mail(
        to=email,
        subject="🔐 Login Notification - Secure E‑Voting",
        html="""
        <h2>Login Alert</h2>
        <p>You have successfully logged into the Secure E‑Voting system.</p>
        <p>If this wasn't you, please contact an administrator.</p>
        """
    )

async def notify_user_vote(email: str, receipt: str):
    await send_mail(
        to=email,
        subject="🗳️ Vote Confirmation - Secure E‑Voting",
        html=f"""
        <h2>Vote Confirmed</h2>
        <p>Your vote has been successfully recorded.</p>
        <p><strong>Receipt Code:</strong> <code>{receipt}</code></p>
        <p>Please do not share this code with anyone.</p>
        """
    )
