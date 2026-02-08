"""
Quick Firebase Setup Verification Script
Run this to check if Firebase is configured correctly
"""
import os
import json

print("🔥 Firebase Configuration Checker\n")

# Check backend credentials
backend_creds = "d:/FSOCIETY/TrueNeed/backend/firebase-credentials.json"
if os.path.exists(backend_creds):
    print("✅ Backend: firebase-credentials.json found")
    try:
        with open(backend_creds) as f:
            data = json.load(f)
            print(f"   Project ID: {data.get('project_id', 'Not found')}")
    except:
        print("⚠️  Warning: File exists but couldn't read JSON")
else:
    print("❌ Backend: firebase-credentials.json NOT found")
    print("   → Download from Firebase Console → Project Settings → Service Accounts")
    print("   → Save to: backend/firebase-credentials.json")

print()

# Check frontend config
frontend_config = "d:/FSOCIETY/TrueNeed/src/firebase.js"
if os.path.exists(frontend_config):
    print("✅ Frontend: firebase.js found")
    with open(frontend_config) as f:
        content = f.read()
        if "YOUR_API_KEY" in content:
            print("⚠️  Warning: Still contains placeholder 'YOUR_API_KEY'")
            print("   → Update with real config from Firebase Console")
        elif "apiKey:" in content:
            print("   Config appears to be updated ✓")
else:
    print("❌ Frontend: firebase.js NOT found")

print()

# Check .gitignore
gitignore = "d:/FSOCIETY/TrueNeed/backend/.gitignore"
if os.path.exists(gitignore):
    with open(gitignore) as f:
        content = f.read()
        if "firebase-credentials.json" in content:
            print("✅ Security: firebase-credentials.json in .gitignore")
        else:
            print("⚠️  Security: Add 'firebase-credentials.json' to .gitignore!")
else:
    print("⚠️  .gitignore not found")

print()

# Check PhoneAuth component
phone_auth = "d:/FSOCIETY/TrueNeed/src/PhoneAuth.jsx"
if os.path.exists(phone_auth):
    print("✅ Component: PhoneAuth.jsx exists")
else:
    print("❌ Component: PhoneAuth.jsx NOT found")

print("\n" + "="*50)
print("📋 Next Steps:")
print("="*50)
if not os.path.exists(backend_creds):
    print("1. Go to Firebase Console")
    print("2. Project Settings → Service Accounts")
    print("3. Generate new private key")
    print("4. Save as: backend/firebase-credentials.json")
else:
    print("✓ Backend credentials ready!")
    
with open(frontend_config) as f:
    if "YOUR_API_KEY" in f.read():
        print("\n1. Go to Firebase Console")
        print("2. Project Settings → Your apps → Web app")
        print("3. Copy firebaseConfig object")
        print("4. Update src/firebase.js with your config")
    else:
        print("✓ Frontend config ready!")

print("\n5. Restart Django: python manage.py runserver")
print("6. Start frontend: npm run dev")
print("7. Test phone login!")
