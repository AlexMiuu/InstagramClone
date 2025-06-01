from fastapi import FastAPI

from service import send_ban_email, send_sms_notification

app = FastAPI()

# Funcție pentru trimiterea emailului

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/ban/{email}/{phoneNumber}")
async def ban(email: str, phoneNumber: str):
    # Aici ai putea adăuga logica de banare în DB etc.
    email_sent = send_ban_email(email)
    send_sms_notification(phoneNumber)
    if email_sent:
        return {"message": f"User cu email {email} a fost banat și notificat."}
    else:
        return {"message": "Eroare la trimiterea notificării de banare."}