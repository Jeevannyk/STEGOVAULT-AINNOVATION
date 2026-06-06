import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes
from cryptography.exceptions import InvalidTag


def _derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=600_000,
    )
    return kdf.derive(password.encode('utf-8'))


def encrypt(plaintext: str, password: str) -> str:
    """AES-256-GCM encrypt. Returns base64(salt + nonce + ciphertext)."""
    salt = os.urandom(16)
    nonce = os.urandom(12)
    key = _derive_key(password, salt)
    aesgcm = AESGCM(key)
    ciphertext = aesgcm.encrypt(nonce, plaintext.encode('utf-8'), None)
    blob = salt + nonce + ciphertext
    return base64.b64encode(blob).decode('ascii')


def decrypt(token: str, password: str) -> str:
    """AES-256-GCM decrypt. Raises ValueError on bad password/tampered data."""
    try:
        blob = base64.b64decode(token.encode('ascii'))
        salt, nonce, ciphertext = blob[:16], blob[16:28], blob[28:]
        key = _derive_key(password, salt)
        aesgcm = AESGCM(key)
        plaintext = aesgcm.decrypt(nonce, ciphertext, None)
        return plaintext.decode('utf-8')
    except InvalidTag:
        raise ValueError("Wrong password or corrupted data.")
    except Exception:
        raise ValueError("Decryption failed — invalid token format.")
