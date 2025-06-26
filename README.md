# NextAuth + Auth0 + Next.js 14 Kimlik Doğrulama ve Yetkilendirme Sistemi

Bu proje, **Next.js 14** ve **NextAuth.js** kullanılarak, **Auth0** ile OAuth tabanlı kimlik doğrulama ve JWT tabanlı oturum yönetimi sağlayan, SOLID prensiplerine ve 12Factor App ilkelerine uygun, rol bazlı yetkilendirme içeren bir örnek uygulamadır.

## Özellikler
- **Auth0 ile OAuth Entegrasyonu**
- **NextAuth.js ile Kimlik Doğrulama**
- **JWT tabanlı oturum yönetimi**
- **Next.js Middleware ile sayfa koruma**
- **Rol bazlı yetkilendirme (admin, user)**
- **SOLID prensiplerine uygun servis mimarisi**
- **12Factor App uyumlu yapılandırma (.env)**
- **TypeScript ile güçlü tip kontrolü**
- **TailwindCSS ile modern arayüz**
- **Docker ile kolay dağıtım**
- **Birlikte ve entegrasyon testleri (Jest)**

## Kullanılan Teknolojiler
- Next.js 14 (App Router)
- NextAuth.js
- Auth0 OAuth Provider
- JWT (JSON Web Token)
- TypeScript
- TailwindCSS
- Docker
- Jest (test altyapısı)

## Kurulum
1. **Repository'i klonlayın:**
   ```bash
   git clone https://github.com/<kendi-kullanici-adiniz>/next-auth.git
   cd next-auth/kayra-task-app
   ```
2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   # veya
yarn install
   ```
3. **.env dosyasını oluşturun:**
   `.env.local` dosyasını oluşturup aşağıdaki değişkenleri doldurun:
   ```env
   AUTH0_CLIENT_ID=xxx
   AUTH0_CLIENT_SECRET=xxx
   AUTH0_ISSUER_BASE_URL=https://<your-tenant>.auth0.com
   AUTH0_SECRET=xxx
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=xxx
   ```
4. **Geliştirme sunucusunu başlatın:**
   ```bash
   npm run dev
   ```
   Uygulama [http://localhost:3000](http://localhost:3000) adresinde çalışacaktır.

## Docker ile Çalıştırma
```bash
docker build -t next-auth-app .
docker run -p 3000:3000 --env-file .env.local next-auth-app
```

## Temel Mimarî
- **src/services/**: Auth, yetkilendirme, middleware ve logger servisleri
- **src/app/api/auth/[...nextauth]/**: NextAuth.js ve Auth0 entegrasyonu
- **src/middleware.ts**: Next.js middleware ile route koruma
- **src/components/**: Arayüz bileşenleri (rol gösterimi dahil)
- **src/hooks/**: Kimlik ve yetkilendirme hook'ları
- **src/types/**: Genişletilmiş NextAuth tipleri (rol desteği)
- **Testler**: `src/__tests__`, `src/services/__tests__`, `src/components/__tests__`

## Testler
```bash
npm run test
```

## Branch Yönetimi
- Tüm geliştirmeler `dev/v1.0.0` branch'inde yapılır.
- Bitince `prod/v1.0.0` branch'ine pull request açılır ve merge edilir.

## Katkı ve Lisans
Pull request'ler ve katkılar memnuniyetle karşılanır!

---

> Bu proje, modern kimlik doğrulama ve yetkilendirme sistemlerinin Next.js ile nasıl kurulacağını göstermek için hazırlanmıştır.
