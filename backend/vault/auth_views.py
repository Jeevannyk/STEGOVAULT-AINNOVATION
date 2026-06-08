"""Token-based authentication for StegoVault.

User accounts are persisted in the SQLite database via Django's built-in
auth_user table. Each successful register/login issues a DRF auth token that
the SPA stores and sends in the Authorization header.
"""
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.decorators import (
    api_view, authentication_classes, permission_classes,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response


def _user_payload(user):
    name = user.first_name or (user.email or user.username).split('@')[0]
    return {
        'id': user.id,
        'email': user.email or user.username,
        'name': name,
        'initials': ''.join(p[0] for p in name.split()[:2]).upper() or name[:2].upper(),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    email = (request.data.get('email') or '').strip().lower()
    password = request.data.get('password') or ''
    name = (request.data.get('name') or '').strip()

    if not email or '@' not in email:
        return Response({'error': 'Enter a valid email address.'}, status=400)
    if len(password) < 8:
        return Response({'error': 'Password must be at least 8 characters.'}, status=400)
    if User.objects.filter(username=email).exists():
        return Response({'error': 'An account with this email already exists.'}, status=409)

    user = User.objects.create_user(username=email, email=email, password=password)
    if name:
        user.first_name = name
        user.save(update_fields=['first_name'])

    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'user': _user_payload(user)}, status=201)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = (request.data.get('email') or '').strip().lower()
    password = request.data.get('password') or ''

    user = authenticate(username=email, password=password)
    if user is None:
        return Response({'error': 'Invalid email or password.'}, status=401)

    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'user': _user_payload(user)})


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def me_view(request):
    return Response({'user': _user_payload(request.user)})


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def logout_view(request):
    Token.objects.filter(user=request.user).delete()
    return Response({'ok': True})
