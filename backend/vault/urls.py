from django.urls import path
from . import views
from . import auth_views

urlpatterns = [
    path('encode/', views.encode_view,  name='encode'),
    path('decode/', views.decode_view,  name='decode'),
    path('analyze/', views.analyze_view, name='analyze'),
    path('auth/register/', auth_views.register_view, name='register'),
    path('auth/login/',    auth_views.login_view,    name='login'),
    path('auth/logout/',   auth_views.logout_view,   name='logout'),
    path('auth/me/',       auth_views.me_view,        name='me'),
]
