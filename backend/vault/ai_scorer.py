"""
AI Carrier Scoring — analyzes images to pick the best steganography carrier.

Metrics used:
  1. Shannon entropy  — high entropy = pixel values are diverse = harder to detect changes
  2. LSB chi-square   — measures how uniform the existing LSBs are (lower = cleaner baseline)
  3. Noise estimate   — Laplacian variance; noisy images hide LSB changes better
  4. Capacity         — raw bytes the image can carry
"""
from io import BytesIO
import numpy as np
from PIL import Image


def _shannon_entropy(channel: np.ndarray) -> float:
    hist, _ = np.histogram(channel.flatten(), bins=256, range=(0, 256), density=True)
    hist = hist[hist > 0]
    return float(-np.sum(hist * np.log2(hist)))


def _lsb_chi_square(arr_flat: np.ndarray) -> float:
    """Chi-square test on LSB distribution. Values near 0 mean LSBs are already uniform."""
    lsbs = arr_flat & 1
    n = len(lsbs)
    observed_ones = int(np.sum(lsbs))
    expected = n / 2
    return float((observed_ones - expected) ** 2 / expected) if expected > 0 else 0.0


def _noise_estimate(arr: np.ndarray) -> float:
    """Laplacian variance as a proxy for image noise/texture richness."""
    gray = arr.mean(axis=2).astype(np.float32)
    kernel = np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]], dtype=np.float32)
    from scipy.signal import convolve2d
    laplacian = convolve2d(gray, kernel, mode='valid')
    return float(np.var(laplacian))


def analyze(image_bytes: bytes, filename: str = '') -> dict:
    img = Image.open(BytesIO(image_bytes)).convert('RGB')
    arr = np.array(img, dtype=np.uint8)
    flat = arr.flatten()

    entropies = [_shannon_entropy(arr[:, :, c]) for c in range(3)]
    avg_entropy = float(np.mean(entropies))
    chi_sq = _lsb_chi_square(flat)
    capacity_bytes = len(flat) // 8

    try:
        noise = _noise_estimate(arr)
    except ImportError:
        # scipy not available — fall back to std of pixel differences
        noise = float(np.std(np.diff(flat.astype(np.int16))))

    # Normalize each metric to 0–100 and compute weighted score
    entropy_score = (avg_entropy / 8.0) * 100          # max possible entropy is 8 bits
    chi_penalty   = min(chi_sq / 500.0, 30.0)          # high chi = already suspicious
    noise_score   = min(noise / 1000.0, 1.0) * 20      # up to 20 bonus points for texture

    score = max(0.0, min(100.0, entropy_score - chi_penalty + noise_score))

    if score >= 80:
        rating, recommendation = "Excellent", "Highly recommended — high entropy, rich texture."
    elif score >= 65:
        rating, recommendation = "Good", "Suitable carrier — decent hiding capacity."
    elif score >= 45:
        rating, recommendation = "Fair", "Usable, but detectable on close analysis."
    else:
        rating, recommendation = "Poor", "Avoid — low entropy images are easy to steganalyze."

    return {
        "filename": filename,
        "score": round(score, 1),
        "rating": rating,
        "recommendation": recommendation,
        "metrics": {
            "entropy": round(avg_entropy, 4),
            "chi_square": round(chi_sq, 4),
            "noise_variance": round(noise, 2),
        },
        "capacity": {
            "bytes": capacity_bytes,
            "chars": capacity_bytes,
            "kb": round(capacity_bytes / 1024, 1),
        },
        "dimensions": f"{img.width}x{img.height}",
        "pixels": img.width * img.height,
    }


def rank(analyses: list[dict]) -> list[dict]:
    return sorted(analyses, key=lambda x: x.get("score", 0), reverse=True)
