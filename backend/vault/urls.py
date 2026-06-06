from django.urls import path
from . import views

urlpatterns = [
    path('encode/', views.encode_view,  name='encode'),
    path('decode/', views.decode_view,  name='decode'),
    path('analyze/', views.analyze_view, name='analyze'),
]
