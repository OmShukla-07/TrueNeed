import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.core.mail import send_mail
from django.conf import settings

print("=" * 50)
print("Testing Email Configuration")
print("=" * 50)
print(f"Backend: {settings.EMAIL_BACKEND}")
print(f"Host: {settings.EMAIL_HOST}")
print(f"Port: {settings.EMAIL_PORT}")
print(f"TLS: {settings.EMAIL_USE_TLS}")
print(f"User: {settings.EMAIL_HOST_USER}")
print(f"Password Length: {len(settings.EMAIL_HOST_PASSWORD)}")
print(f"From: {settings.DEFAULT_FROM_EMAIL}")
print("=" * 50)

try:
    print("\nSending test email...")
    send_mail(
        'Test Email from TrueNeed',
        'This is a test email. If you receive this, Gmail SMTP is working!',
        settings.DEFAULT_FROM_EMAIL,
        [settings.EMAIL_HOST_USER],  # Send to yourself
        fail_silently=False,
    )
    print("✅ Email sent successfully!")
    print("Check your inbox:", settings.EMAIL_HOST_USER)
except Exception as e:
    print(f"❌ Email failed: {type(e).__name__}")
    print(f"Error: {str(e)}")
