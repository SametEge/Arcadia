<div align="center">

<img src="assets/icon.png" width="120" alt="Arcadia" />

# Arcadia

**Tüm oyunların tek bir şık kütüphanede.**

Arcadia bilgisayarındaki oyunları ve Steam, Epic, Xbox, GOG, EA ve Ubisoft Connect'te sahip olduklarını bulur,<br>
gerçek kapak görselleriyle gösterir ve hepsini tek tıkla açar ya da kurar.

[![Sürüm](https://img.shields.io/github/v/release/SametEge/Arcadia?color=8b5cff&label=s%C3%BCr%C3%BCm)](https://github.com/SametEge/Arcadia/releases/latest)
[![İndirme](https://img.shields.io/github/downloads/SametEge/Arcadia/total?color=0d9bf0&label=indirme)](https://github.com/SametEge/Arcadia/releases)
[![CI](https://github.com/SametEge/Arcadia/actions/workflows/ci.yml/badge.svg)](https://github.com/SametEge/Arcadia/actions/workflows/ci.yml)
![Platform](https://img.shields.io/badge/platform-Windows%2010%20%7C%2011-0d9bf0)
![Electron](https://img.shields.io/badge/Electron-42-47848f)
[![Lisans](https://img.shields.io/badge/lisans-MIT-8b5cff)](LICENSE)

### [⬇ Son sürümü indir](https://github.com/SametEge/Arcadia/releases/latest)

[English](README.md) · **Türkçe**

<img src="assets/screenshot.png" width="860" alt="Arcadia ekran görüntüsü" />

</div>

---

## İçindekiler

- [Özellikler](#-özellikler)
- [Desteklenen mağazalar](#-desteklenen-mağazalar)
- [Kurulum](#%EF%B8%8F-kurulum)
- [Gizlilik](#-gizlilik)
- [Kaynaktan derleme](#-kaynaktan-derleme)
- [Nasıl çalışır](#-nasıl-çalışır)
- [Proje yapısı](#%EF%B8%8F-proje-yapısı)
- [Katkıda bulunma](#-katkıda-bulunma)
- [Lisans](#-lisans)

## ✨ Özellikler

**Kütüphanen kendiliğinden toplanır**

- 🔍 **Otomatik tarama** — Steam, Epic Games, Xbox / Game Pass, GOG, EA app, Ubisoft Connect, Riot (VALORANT, League of Legends) ve masaüstü kısayolları; bir de eklediğin klasörler. Her açılışta sessizce yeniden tarar: yeni oyunlar eklenir, kaldırılanlar düşer, senin verilerin korunur.
- 🔗 **Mağaza hesaplarını bağla** — **Hesap Bağla**'ya bas, Steam, Epic, Xbox, GOG, EA ya da Ubisoft Connect'e giriş yap; *sahip olduğun ama kurmadığın* oyunlar da mağaza görselleriyle kütüphaneye gelir. Birden fazla mağazada görünen bir oyun tek kayıt olarak kalır.
- 🖼️ **Gerçek kapak görselleri** — Steam oyunları mağazanın kendi kapaklarıyla gelir, diğerleri **SteamGridDB**'den bulunur. Minecraft'a elle çizilmiş kapaklar, geriye kalan her şeye temiz bir markalı kapak. İstersen kendi görselini de seçebilirsin.

**Oyna ve kur**

- ▶️ **Tek tıkla başlat** — mağazanın kendi protokolüyle (overlay, bulut kayıtları ve DRM çalışmaya devam eder) ya da doğrudan `.exe` ile.
- ⬇️ **Arcadia'dan kur** — sahip olduğun bir oyuna tıkla; mağazanın kendi istemcisi kurmaya başlar, Arcadia'nın indirme paneli de canlı ilerlemeyi gösterir: Steam için yüzde, hız ve kalan süre. Kurulum bitince kart kendiliğinden oynanabilir olur.
- 🟢 **Çalışıyor göstergesi ve zorla kapatma** — açık olan oyun canlı işaretlenir; kırmızı **×** oyunu (ve birlikte açılan uygulamaları) anında kapatır.
- 🤝 **Birlikte aç** — Discord, FACEIT, overlay'ler… bir oyuna bağla, oyunla birlikte açılsınlar. Discord'un kenar çubuğunda kendi hızlı düğmesi var.

**Düzenle**

- 📚 **Listeler** — sürükle-bırak sıralamalı kendi listelerini oluştur. **Steam koleksiyonlarını** da içe aktarabilirsin; Arcadia'dan silinen bir koleksiyon Steam'de de silinir.
- ⭐ **Favoriler, kategoriler ve arama** — kurulu / kurulu değil, mağaza bazında görünümler; ada, eklenme tarihine, son oynanana ya da **Metacritic** puanına göre sıralama.
- 🎲 **Rastgele oyun** — karar veremiyor musun? Arcadia seçsin.

**Sana göre**

- 🎨 **Vurgu rengi ve logo** — logonun rengini, şeklini ve simgesini değiştir; Windows görev çubuğu simgesi anında güncellenir.
- 🌍 **6 dil** — Windows dilinden otomatik algılanır, istediğin an değiştirilebilir.
- 🗔 **Sistem tepsisi** — kapatınca arka planda çalışmaya devam eder, en çok oynadığın oyunlar bir sağ tık uzağında. İsteğe bağlı olarak Windows'la birlikte açılır.
- 🔄 **Otomatik güncelleme** — yeni sürümler arka planda iner, bir sonraki kapanışta kurulur (önce sorulsun istiyorsan **Ayarlar → Güncellemeler**).
- 🌙 **Sade, koyu arayüz** — kapak ızgarası, yumuşak geçişler, çerçevesiz pencere, ilk açılışta tanıtım turu.

## 🎮 Desteklenen mağazalar

| Mağaza | Kurulu oyunlar | Bağlı hesap | Arcadia'dan kurulum | İndirme ilerlemesi |
|---|:---:|:---:|:---:|---|
| **Steam** | ✅ | ✅ | ✅ | yüzde, hız, kalan süre |
| **Epic Games** | ✅ | ✅ | ✅ | boyut biliniyorsa yüzde, yoksa durum |
| **Xbox / Game Pass** | ✅ | ✅ PC oyunları | ✅ Microsoft Store üzerinden | bitince |
| **GOG** | ✅ | ✅ | ✅ GOG Galaxy üzerinden | bitince |
| **EA app** | ✅ | ✅ | ✅ | bitince |
| **Ubisoft Connect** | ✅ | ✅ en az bir kez oynananlar¹ | ✅ | bitince |
| **Riot Games** | ✅ | — | — | — |
| **Kısayollar, klasörler, elle eklenen** | ✅ | — | — | — |

¹ Ubisoft tam sahiplik listesini yalnızca kendi başlatıcısına açıyor; Arcadia'nın kullandığı web API'si başlattığın oyunları listeliyor.

Hiçbir mağaza başka bir uygulamanın oyun indirmesine izin veren bir API sunmuyor. Bu yüzden Arcadia kurulumu mağazanın kendi istemcisine yaptırır — Playnite'ın yaptığı devirle aynı — ve ilerlemeyi oradan takip eder.

## ⬇️ Kurulum

1. [Releases](https://github.com/SametEge/Arcadia/releases/latest) sayfasından en güncel **`Arcadia-Setup-<sürüm>.exe`** dosyasını indir.
2. Çalıştır (aşağıdaki SmartScreen notuna bak).
3. Kurulumu takip et — Arcadia Başlat menüsüne ve masaüstüne kısayol ekler, açılır ve oyunlarını tarar.

Release workflow'uyla derlenen sürümlerde bir de `SHA256SUMS.txt` bulunur; indirdiğin dosyayı onunla doğrulayabilirsin:

```powershell
Get-FileHash .\Arcadia-Setup-<sürüm>.exe -Algorithm SHA256
```

> Kaldırınca kütüphanen ve ayarların silinmez (`%APPDATA%\Arcadia` klasöründe dururlar).

<details>
<summary><b>⚠️ "Windows bilgisayarınızı korudu" (SmartScreen) uyarısı mı çıktı?</b></summary>

<br>

Bu uyarı **normal ve beklenen** bir durum — Arcadia'da bir sorun olduğu anlamına **gelmez**. Devam etmek için:

> **Ek bilgi → Yine de çalıştır**

Windows SmartScreen, **ücretli** bir kod imzalama sertifikasıyla imzalanmamış *her* kurulum dosyası için uyarı verir. Kod imzalamanın bir projenin açık kaynak olup olmamasıyla ilgisi yok — güvenilir birçok açık kaynak uygulama aynı uyarıyı gösterir.

Arcadia tamamen açık kaynak, yani kurulum dosyasına körü körüne güvenmek zorunda değilsin: kodu oku ve [kendin derle](#-kaynaktan-derleme). Yeni sürümler doğrudan etiketlenmiş kaynaktan [GitHub Actions](.github/workflows/release.yml) ile derleniyor. Microsoft tarafından imzalanan, hiç uyarı vermeyen bir Microsoft Store sürümü de yolda.

</details>

### Kapak görselleri (SteamGridDB)

Steam dışı oyunların kapakları, paylaşılan bir SteamGridDB anahtarıyla kutudan çıktığı gibi çalışır. Bu anahtar herkese açık ve bütün Arcadia kullanıcıları tarafından paylaşılıyor, yani istek sınırına takılabilir; kapakların sorunsuz gelmesi için kendi **ücretsiz** anahtarını ekle:

1. [steamgriddb.com](https://www.steamgriddb.com) → *Preferences → API* → anahtarını kopyala.
2. Arcadia → **Ayarlar → Kapak Görselleri (SteamGridDB)** → yapıştır ve yeniden tara.

Anahtarın yalnızca kendi bilgisayarında saklanır.

## 🔒 Gizlilik

**Arcadia'nın bir sunucusu yok. Telemetri, analiz ya da reklam yok.** Bildiği her şey senin bilgisayarında kalır. Doğrudan kullandığın mağazalarla, kapaklar için SteamGridDB'yle ve güncellemeler için GitHub'la konuşur — araya hiçbir sunucu girmez.

- Her mağazada **o mağazanın kendi sayfasında** giriş yaparsın — Arcadia şifreni asla görmez ve saklamaz.
- Mağaza oturumları `%APPDATA%\Arcadia\accounts.dat` dosyasında, Windows DPAPI ile şifrelenmiş olarak tutulur; yalnızca senin Windows hesabın okuyabilir.

Gizlilik politikasının tamamı [`PRIVACY.md`](PRIVACY.md) dosyasında (İngilizce).

## 🚀 Kaynaktan derleme

Gereksinimler: **Windows 10/11** ve [Node.js](https://nodejs.org) 18 ya da üstü. Testler Linux ve macOS'ta da çalışır.

```bash
git clone https://github.com/SametEge/Arcadia.git
cd Arcadia
npm install

npm start           # uygulamayı çalıştır
npm test            # arayüzsüz testler (i18n, kütüphane birleştirme, indirmeler, listeler, hesaplar, kapaklar…)
npm run test:login  # hesap giriş penceresi testi (gerçek pencereler açar)
npm run dist        # kurulum dosyasını dist/ içine derle
npm run dist:store  # Microsoft Store paketini derle (dist/Arcadia-<sürüm>-Store.appx)
```

### Sürüm yayınlama

Sürümler [`release`](.github/workflows/release.yml) workflow'uyla çıkar:

1. `package.json` içindeki `version`'ı artır ve [`CHANGELOG.md`](CHANGELOG.md) içindeki **Unreleased** notlarını yeni bir `## [x.y.z]` başlığının altına taşı.
2. Commit'le, sonra etiketleyip gönder: `git tag v1.1.0 && git push origin v1.1.0`.

Workflow testleri çalıştırır, kurulum dosyasını derler ve kurulum dosyası, `latest.yml` (otomatik güncelleyicinin okuduğu dosya), blockmap ve `SHA256SUMS.txt` ile bir GitHub release'i yayınlar. Release notları `CHANGELOG.md`'deki ilgili bölümden gelir.

`npm run release` hâlâ kendi bilgisayarından derleyip yükler (`GH_TOKEN` gerekir), ama tercih edilen yol workflow.

<details>
<summary><b>Microsoft Store derlemesi</b></summary>

<br>

Store paketi sertifikasyon sırasında Microsoft tarafından imzalanır; bu yüzden SmartScreen ya da Akıllı Uygulama Denetimi uyarısı olmadan kurulur — ücretli bir kod imzalama sertifikasıyla aynı etki, ücretsiz.

1. Store adı **Arcadia Launcher** (Store ID `9N22381XP9S9`); Partner Center kimliği `package.json` içindeki `build.appx`'te zaten var. Oradaki `displayName` tam olarak ayrılmış ad olarak kalmalı.
2. `npm run dist:store` bilgisayarda kurulu Windows SDK'yı kullanır (electron-builder'ın indirdiği araçlar ya Windows 11'de hata veriyor ya da Akıllı Uygulama Denetimi'ne takılıyor). Kutucuk görselleri `build/appx`'ten gelir, `npm run icon` ile yeniden üretilir.
3. `.appx`'i yükle. Mağaza metinleri, `runFullTrust` gerekçesi ve sertifikasyon notları [`store/LISTING.md`](store/LISTING.md) dosyasında hazır; gizlilik politikası [`PRIVACY.md`](PRIVACY.md).

Store sürümünde Arcadia'nın kendi güncelleyicisi kapalıdır — Store uygulamalarını Store günceller — ve Windows'la birlikte açılma Windows'a bırakılır.

</details>

<details>
<summary><b>Simgeyi yeniden üretmek</b></summary>

<br>

Logo `assets/logo.svg` dosyasında. PNG/ICO dosyalarını ve Store kutucuklarını yeniden üretmek için (Python + Pillow):

```bash
npm run icon   # ya da: py build/make_icon.py
```

</details>

## 🧩 Nasıl çalışır

| Kaynak | Nasıl bulunur | Nasıl açılır |
|--------|---------------|--------------|
| **Steam** | `libraryfolders.vdf` + `appmanifest_*.acf` | `steam://rungameid/<appid>` |
| **Epic** | `ProgramData\Epic\…\Manifests\*.item` | `com.epicgames.launcher://` derin bağlantısı |
| **Xbox** | `XboxGames\<Oyun>\Content\` altındaki ana `.exe` | `.exe` |
| **GOG** | `HKLM\…\GOG.com\Games` | GOG Galaxy ya da `.exe` (GOG oyunları DRM'siz) |
| **EA app** | `ProgramData\EA Desktop` / `Origin` altındaki `.mfst` dosyaları | `origin2://` |
| **Ubisoft Connect** | `HKLM\…\Ubisoft\Launcher\Installs` | `uplay://launch/<id>` |
| **Riot** | `ProgramData\Riot Games\RiotClientInstalls.json` | `--launch-product` ile Riot Client |
| **Kısayollar** | oyun istemcilerinin ve başlatıcıların masaüstü `.lnk` / `.exe`'leri | kısayol |
| **Klasörler** | eklediğin klasörlerdeki `.exe` dosyaları | `.exe` |
| **Elle** | **Oyun Ekle** ile seçtiğin `.exe` / `.lnk` / `.url` | dosyanın kendisi |

Bağlı hesaplar bunların üstüne sahip olduklarını ekler:

| Hesap | Kütüphane nereden gelir |
|-------|-------------------------|
| **Steam** | `IPlayerService/GetOwnedGames`, mağaza sayfasının oturumuna verdiği token ile — API anahtarı oluşturmana gerek yok |
| **Epic** | başlatıcının OAuth kütüphane API'si; DLC'ler ve film müzikleri ayıklanır |
| **Xbox** | `titlehub` oyun geçmişi, PC'de oynanabilenlerle sınırlı |
| **GOG** | gog.com hesap kütüphanesi, gog.com oturumun üzerinden |
| **EA** | EA app'in kendi GraphQL servisi, EA oturumundan alınan kısa ömürlü bir token ile |
| **Ubisoft** | Ubisoft Connect web uygulamasının oynanan oyunlar listesi |

Kütüphanen ve ayarların `%APPDATA%\Arcadia\library.json` içinde; mağaza oturumları ayrı ve şifreli `accounts.dat` dosyasında tutulur, `library.json`'a asla yazılmaz.

## 🗂️ Proje yapısı

```
Arcadia/
├── main.js                 # Electron ana süreci: pencere, IPC, tepsi, simge
├── preload.js              # Arayüz ile ana süreç arasındaki güvenli köprü
├── renderer/               # Arayüz (HTML / CSS / JS, kendi 6 dilli sözlüğüyle)
├── src/
│   ├── library.js          # Kütüphane ve ayar deposu (kurulu + sahip olunan birleştirme, listeler)
│   ├── launcher.js         # Oyun başlatma
│   ├── downloads.js        # Kurulumu mağazaya devretme + ilerleme takibi
│   ├── updater.js          # GitHub release'lerinden otomatik güncelleme
│   ├── ratings.js          # Metacritic puanları (önbellekli, arka planda çekilir)
│   ├── steamassets.js      # Steam kapak görselleri
│   ├── steamcollections.js # Steam koleksiyonları: okuma ve silme
│   ├── sgdb.js             # SteamGridDB kapak araması
│   ├── vdf.js              # Steam VDF/ACF ayrıştırıcı
│   ├── i18n.js             # Ana sürecin metinleri (dosya pencereleri, tepsi)
│   ├── accounts/           # steam, epic, xbox, gog, ea, ubisoft + şifreli token deposu
│   └── scanners/           # steam, epic, xbox, gog, ea, ubisoft, riot, kısayollar, klasörler
├── assets/                 # Logo, simgeler, ekran görüntüsü
├── build/
│   ├── appx/               # Microsoft Store kutucuk görselleri
│   ├── make_icon.py        # Uygulama simgesini logodan üretir
│   ├── dist-store.js       # Microsoft Store paket derlemesi
│   └── test_*.js           # Arayüzsüz testler (npm test)
├── store/LISTING.md        # Microsoft Store mağaza metni taslakları
└── .github/                # CI, release workflow'u, issue ve PR şablonları
```

Yeni bir mağaza eklemek, `src/accounts/` içinde `{ id, signIn, signOut, status, fetchLibrary }` döndüren bir dosya yazıp `src/accounts/index.js`'e eklemek ve `src/scanners/` içine bir tarayıcı koymak demek.

## 🤝 Katkıda bulunma

Hata bildirimleri, fikirler ve pull request'ler memnuniyetle karşılanır — [`CONTRIBUTING.md`](CONTRIBUTING.md) dosyasına bak. Bir güvenlik açığı mı buldun? Lütfen [`SECURITY.md`](SECURITY.md)'de anlatıldığı gibi gizli olarak bildir.

## 📄 Lisans

[MIT](LICENSE) © 2026 Samet Ege

Arcadia'nın Valve, Epic Games, Microsoft, CD PROJEKT, Electronic Arts, Ubisoft ya da Riot Games ile bir bağlantısı yoktur. Oyun adları, kapak görselleri ve mağaza logoları sahiplerine aittir.
