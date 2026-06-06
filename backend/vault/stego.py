from PIL import Image
import numpy as np

_DELIMITER = "<<STEGO_END>>"


def _text_to_bits(text: str) -> list[int]:
    bits = []
    for byte in text.encode('utf-8'):
        for i in range(7, -1, -1):
            bits.append((byte >> i) & 1)
    return bits


def _bits_to_text(bits: list[int]) -> str:
    chars = []
    for i in range(0, len(bits) - 7, 8):
        byte = 0
        for b in bits[i:i + 8]:
            byte = (byte << 1) | b
        chars.append(chr(byte))
    return ''.join(chars)


def encode(image_bytes: bytes, secret: str) -> bytes:
    """Embed secret string into image bytes via LSB. Returns PNG bytes."""
    from io import BytesIO

    img = Image.open(BytesIO(image_bytes)).convert('RGB')
    arr = np.array(img, dtype=np.uint8)

    payload = secret + _DELIMITER
    bits = _text_to_bits(payload)

    capacity = arr.size  # one bit per channel value
    if len(bits) > capacity:
        raise ValueError(
            f"Secret is too large ({len(bits)} bits needed, {capacity} available). "
            "Use a bigger image or a shorter secret."
        )

    flat = arr.flatten()
    for i, bit in enumerate(bits):
        flat[i] = (flat[i] & 0xFE) | bit

    result_arr = flat.reshape(arr.shape)
    result_img = Image.fromarray(result_arr)

    out = BytesIO()
    result_img.save(out, format='PNG')
    return out.getvalue()


def decode(image_bytes: bytes) -> str:
    """Extract hidden secret from LSB-encoded image bytes."""
    from io import BytesIO

    img = Image.open(BytesIO(image_bytes)).convert('RGB')
    arr = np.array(img, dtype=np.uint8).flatten()

    bits = [int(v & 1) for v in arr]
    text = _bits_to_text(bits)

    if _DELIMITER not in text:
        raise ValueError("No hidden message found in this image.")

    return text[:text.index(_DELIMITER)]
