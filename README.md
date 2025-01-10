# Book-Recommendation-Service

# Literacy Cafe
Sistem rekomendasi buku yang dipersonalisasi yang menggabungkan pengalaman kedai kopi dengan literatur. Sistem ini memberikan rekomendasi buku berdasarkan preferensi pengguna dan pesanan kafe mereka saat ini.

# Deployment      : Front End https://literacy-cafe.vercel.app/ 
                  Back end https://literacy-cafe-production.up.railway.app/
# Dokumen Laporan : https://docs.google.com/document/d/19WHGTOGocNdMWWPOQ7TLZvNDuclsBEbexcVrWGHwyrs/edit?tab=t.0

# Fitur
1. Sistem autentikasi pengguna
2. Rekomendasi buku yang dipersonalisasi
3. Integrasi dengan layanan chatbot AI
4. Desain web responsif
5. Containerisasi menggunakan Docker
 
# Tech Stack
## Frontend
- HTML5/CSS3/JavaScript
- Desain responsif dengan CSS kustom
- Integrasi widget chatbot eksternal
## Backend
- FastAPI (Python)
- Autentikasi JWT
- Database Supabase
- Containerisasi menggunakan Docker

# Getting Started
# Prerequisites

Docker and Docker Compose
Node.js
Python 3.8+

# Installation

1. Clone the repository
```
git clone https://github.com/yourusername/literacy-cafe.git
cd literacy-cafe
```

2. Buat file .env di direktori backend:
```
PROJECT_NAME=Literacy Cafe API  
VERSION=1.0.0  
API_V1_STR=/api/v1  
SECRET_KEY=your-secret-key  
ALGORITHM=HS256  
ACCESS_TOKEN_EXPIRE_MINUTES=30  
SUPABASE_URL=your-supabase-url  
SUPABASE_KEY=your-supabase-key  
```

3. Jalankan dengan Docker Compose
```
docker-compose up --build
```

Aplikasi akan tersedia di:

- Frontend: http://localhost:80
- Backend: http://localhost:8080

# Dokumentasi API
## Endpoint Autentikasi
- POST /api/v1/auth/register
Daftarkan pengguna baru:
```
{
  "email": "user@example.com",
  "password": "string",
  "full_name": "string",
  "reading_preferences": ["Fiction", "Non-Fiction"]
}

```
- POST /api/v1/auth/login
Login pengguna:
```
{
  "username": "user@example.com",
  "password": "string"
}
```

## Endpoint Rekomendasi
- POST /api/v1/recommendations/books
Dapatkan rekomendasi buku:
```
{
  "drink": "Coffee",
  "drink_type": "Latte",
  "food": "Croissant",
  "food_category": "Light"
}
```

# Integrasi Layanan Eksternal
Aplikasi ini terintegrasi dengan layanan chatbot AI melalui widget. Chatbot menyediakan dukungan pelanggan dan meningkatkan pengalaman pengguna.

### Detail integrasi:

- URL Layanan: https://spotify-bot.azurewebsites.net
- Konfigurasi API Key di frontend
- Penyuntikan widget di HTML

# Contributing

1. Fork the repository
2. Create feature branch (git checkout -b feature/AmazingFeature)
3. Commit changes (git commit -m 'Add some AmazingFeature')
4. Push to branch (git push origin feature/AmazingFeature)
5. Open Pull Request

# License
This project is licensed under the MIT License - see the LICENSE file for details.