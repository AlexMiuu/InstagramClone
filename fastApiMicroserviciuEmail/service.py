import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from twilio.rest import Client

def send_ban_email(user_email: str):
    sender_email = ""       #to add
    sender_password = ""    #to add
    receiver_email = user_email

    subject = "Notificare Banare Cont"
    body = f"Salut! Contul tău asociat cu emailul {user_email} a fost banat."

    # Construim mesajul
    message = MIMEMultipart()
    message["From"] = sender_email
    message["To"] = receiver_email
    message["Subject"] = subject

    message.attach(MIMEText(body, "plain"))

    try:
        # Setăm conexiunea SMTP (Gmail exemplu)
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, receiver_email, message.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Eroare la trimiterea emailului: {e}")
        return False

def send_sms_notification(phone_number):
    # Datele contului tău Twilio
    account_sid = ''        #to add
    auth_token = ''         #to add
    from_phone = ''         #to add # Numărul Twilio primit la înregistrare

    client = Client(account_sid, auth_token)

    message = client.messages.create(
        body="Contul tău a fost banat. Contactează suportul pentru detalii.",
        from_=from_phone,
        to=phone_number
    )

    print(f"SMS trimis cu SID: {message.sid}")
