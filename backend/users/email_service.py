"""
Email service utility - supports multiple email providers
"""
from django.conf import settings
from django.core.mail import send_mail as django_send_mail
import os


def send_email(to_email, subject, message):
    """
    Send email using configured email service
    Supports: Django email backend, SendGrid API
    """
    email_service = getattr(settings, 'EMAIL_SERVICE', 'django')
    
    if email_service == 'sendgrid':
        return send_via_sendgrid(to_email, subject, message)
    else:
        # Use Django's default email backend
        return send_via_django(to_email, subject, message)


def send_via_django(to_email, subject, message):
    """Send email using Django's email backend"""
    try:
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@trueneed.com')
        django_send_mail(
            subject,
            message,
            from_email,
            [to_email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Django email failed: {str(e)}")
        return False


def send_via_sendgrid(to_email, subject, message):
    """Send email using SendGrid API"""
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail, Email, To, Content
        
        api_key = getattr(settings, 'SENDGRID_API_KEY', '')
        if not api_key:
            print("SendGrid API key not configured")
            return False
        
        from_email = Email(
            getattr(settings, 'SENDGRID_FROM_EMAIL', 'noreply@trueneed.com'),
            getattr(settings, 'SENDGRID_FROM_NAME', 'TrueNeed')
        )
        to_email_obj = To(to_email)
        content = Content("text/plain", message)
        
        mail = Mail(from_email, to_email_obj, subject, content)
        
        sg = SendGridAPIClient(api_key)
        response = sg.client.mail.send.post(request_body=mail.get())
        
        if response.status_code in [200, 201, 202]:
            print(f"SendGrid email sent successfully to {to_email}")
            return True
        else:
            print(f"SendGrid failed with status: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"SendGrid error: {str(e)}")
        return False


def send_via_twilio_sms(phone_number, message):
    """
    Send SMS using Twilio (optional - for SMS OTP)
    Requires: pip install twilio
    """
    try:
        from twilio.rest import Client
        
        account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', '')
        auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', '')
        from_number = getattr(settings, 'TWILIO_FROM_NUMBER', '')
        
        if not all([account_sid, auth_token, from_number]):
            print("Twilio credentials not configured")
            return False
        
        client = Client(account_sid, auth_token)
        message = client.messages.create(
            body=message,
            from_=from_number,
            to=phone_number
        )
        
        print(f"SMS sent successfully: {message.sid}")
        return True
        
    except Exception as e:
        print(f"Twilio SMS error: {str(e)}")
        return False
