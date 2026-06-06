# 🛡 StegoVault – AI-Powered Secure Password Vault

*Tagline:* 🔒 Secure your secrets by hiding them in everyday media.

---

## 📝 Overview

StegoVault is a password and secret manager that uses *steganography* and *encryption* to hide sensitive information inside media files such as images and audio. An AI module can optionally analyze media files to select the most secure carrier for your secrets.

- 🔐 Secrets are encrypted with *AES-256* before embedding.  
- 👀 Files appear normal to any observer, providing invisible security.  
- ☁ Optional cloud storage using *Azure* and metadata storage in *MongoDB*.

---

## ❗ Problem

- Traditional password managers are *centralized targets*, making them vulnerable to attacks.  
- Users often store sensitive information in *notes apps, chats, or cloud documents*, which can be compromised.  
- 🕵‍♂ Basic steganography techniques are detectable and fragile, offering limited protection.

---

## 💡 Solution

StegoVault addresses these challenges by providing:

- 🗂 *Secret Storage in Media Files:* Hide passwords, crypto keys, and notes inside images or audio files.  
- 🤖 *AI Carrier Selection:* Analyze media files and recommend the safest file for hiding secrets.  
- 🔐 *Encryption Layer:* AES-256 encryption ensures strong data protection before embedding.  
- 👻 *Invisible Security:* Media files appear normal, keeping secrets hidden from attackers.  
- ☁ *Optional Cloud Integration:* Azure for file storage and MongoDB for metadata management.

---

## ⚙ Features

- 🗝 *Secret Management:* Store and retrieve passwords, API keys, and notes.  
- 🤖 *AI Carrier Selection:* Evaluate media files for optimal security before embedding.  
- 🔒 *Encryption:* AES-256 symmetric encryption; optional RSA for public/private key.  
- 🖼 *Steganography:* Hide encrypted secrets inside images or audio.  
- ☁ *Cloud & Storage:* Optional integration with Azure and MongoDB for file and metadata storage.

---

## 🛠 Tech Stack

| Component       | Technology                          |
|-----------------|------------------------------------|
| 🖥 Frontend      | React.js                            |
| ⚙ Backend       | Django REST Framework               |
| 🔐 Encryption    | AES-256, optional RSA               |
| 🖼 Steganography | Python stegano library            |
| 🤖 AI Module     | Python (isolated carrier analysis)  |
| ☁ Cloud Storage | Azure Blob Storage (optional)       |
| 🗄 Database      | MongoDB (metadata only)             |

---

## ⚡ Getting Started

### Backend (Django)

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate --run-syncdb
python manage.py runserver
```

> On Windows PowerShell, use `.\start.bat` as a shortcut for the above steps.

Backend runs at `http://localhost:8000`.

### Frontend (React)

```powershell
cd frontend/stegovault-frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## 🚀 Usage

1. Open `http://localhost:5173` in your browser.
2. **Encode** — upload a carrier image, enter your secret and a master password. Download the stego image.
3. **Decode** — upload the stego image and enter the master password to recover the secret.
4. **AI Analyze** — upload multiple images; the AI scores each by entropy, chi-square, and noise variance to recommend the best carrier.

---

## 📂 Project Structure

```text
StegoVault/
├─ frontend/       # React application
├─ backend/        # Django REST Framework APIs
├─ utils/          # Crypto, stego, and AI modules
├─ models/         # Optional AI models
├─ media/          # Sample carrier files
├─ README.md
└─ requirements.txt

---

## 🔮 Future Enhancements

- 🎥 Support for videos and PDFs as carrier files.  
- 🤖 AI stego-optimizer for adaptive hiding strength.  
- 👥 Multi-user sharing with public/private key encryption.  
- 🌐 Browser extension for seamless steganography.

---

## 📄 License

This project is licensed under the *MIT License*.

---

✅ *StegoVault: Secure your secrets invisibly, with AI-powered steganography.*