from django.http import HttpResponse
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from .crypto import encrypt, decrypt
from .stego import encode as stego_encode, decode as stego_decode
from . import ai_scorer


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def encode_view(request):
    image_file = request.FILES.get('image')
    secret     = request.data.get('secret', '').strip()
    password   = request.data.get('password', '').strip()

    if not image_file:
        return Response({'error': 'No image uploaded.'}, status=400)
    if not secret:
        return Response({'error': 'Secret cannot be empty.'}, status=400)
    if not password:
        return Response({'error': 'Password cannot be empty.'}, status=400)

    try:
        image_bytes = image_file.read()
        encrypted   = encrypt(secret, password)
        stego_bytes = stego_encode(image_bytes, encrypted)
    except ValueError as e:
        return Response({'error': str(e)}, status=400)
    except Exception as e:
        return Response({'error': f'Encoding failed: {str(e)}'}, status=500)

    response = HttpResponse(stego_bytes, content_type='image/png')
    response['Content-Disposition'] = 'attachment; filename="stego_output.png"'
    response['Access-Control-Expose-Headers'] = 'Content-Disposition'
    return response


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def decode_view(request):
    image_file = request.FILES.get('image')
    password   = request.data.get('password', '').strip()

    if not image_file:
        return Response({'error': 'No image uploaded.'}, status=400)
    if not password:
        return Response({'error': 'Password cannot be empty.'}, status=400)

    try:
        image_bytes = image_file.read()
        encrypted   = stego_decode(image_bytes)
        secret      = decrypt(encrypted, password)
    except ValueError as e:
        return Response({'error': str(e)}, status=400)
    except Exception as e:
        return Response({'error': f'Decoding failed: {str(e)}'}, status=500)

    return Response({'secret': secret})


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def analyze_view(request):
    images = request.FILES.getlist('images')

    if not images:
        return Response({'error': 'Upload at least one image.'}, status=400)
    if len(images) > 10:
        return Response({'error': 'Maximum 10 images per request.'}, status=400)

    results = []
    for img_file in images:
        try:
            analysis = ai_scorer.analyze(img_file.read(), filename=img_file.name)
            results.append(analysis)
        except Exception as e:
            results.append({
                'filename': img_file.name,
                'error': str(e),
                'score': 0,
                'rating': 'Error',
            })

    ranked = ai_scorer.rank(results)
    best   = next((r for r in ranked if 'error' not in r), None)

    return Response({
        'results': ranked,
        'recommended': best,
        'total': len(ranked),
    })
