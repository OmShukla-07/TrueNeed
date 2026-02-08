from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, VerifyOTPView, ResendOTPView,
    LoginView, LogoutView, UserDetailView, UpdateProfileView, DeleteAccountView,
    ForgotPasswordView, ResetPasswordView, OAuthLoginView, OAuthCallbackView,
    PhoneRegisterView, PhoneLoginView, PhoneVerifyOTPView, FirebasePhoneAuthView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('profile/', UpdateProfileView.as_view(), name='update-profile'),
    path('account/', DeleteAccountView.as_view(), name='delete-account'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('oauth/<str:provider>/', OAuthLoginView.as_view(), name='oauth-login'),
    path('oauth/<str:provider>/callback/', OAuthCallbackView.as_view(), name='oauth-callback'),
    
    # Phone authentication
    path('phone/register/', PhoneRegisterView.as_view(), name='phone-register'),
    path('phone/login/', PhoneLoginView.as_view(), name='phone-login'),
    path('phone/verify-otp/', PhoneVerifyOTPView.as_view(), name='phone-verify-otp'),
    
    # Firebase phone authentication (client-side)
    path('firebase/phone/', FirebasePhoneAuthView.as_view(), name='firebase-phone-auth'),
]
