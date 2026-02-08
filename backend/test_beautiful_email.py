import requests
import json

url = 'http://localhost:8000/api/auth/register/'
data = {
    'email': 'beautifultest@gmail.com',
    'password': 'TestPass123!',
    'password2': 'TestPass123!',
    'name': 'Beautiful Email Test'
}

print("📧 Testing beautiful email format...")
print(f"✉️  Sending to: {data['email']}")
print(f"👤 Name: {data['name']}")
print("\n⏳ Sending registration request...\n")

response = requests.post(url, json=data)

print(f"✅ Status: {response.status_code}")
response_data = response.json()
print(f"📦 Response: {json.dumps(response_data, indent=2)}")

if 'otp' in response_data:
    print(f"\n⚠️  Email failed, OTP in response: {response_data['otp']}")
else:
    print(f"\n✅ Email sent successfully!")
    print(f"📬 Check your inbox at: {data['email']}")
    print(f"\n🎨 The email should now have:")
    print(f"   • Beautiful gradient header")
    print(f"   • Large, clear OTP code box")
    print(f"   • Professional styling")
    print(f"   • Mobile responsive design")
