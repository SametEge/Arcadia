# Microsoft Store submission — Arcadia

Copy-paste material for Partner Center. Everything here is a draft for the
publisher to review; fields marked **(you decide)** need an answer only you can give.

## Product

- **Store name (reserved):** Arcadia Launcher — "Arcadia" on its own was already
  taken in the Store. Inside the app the name stays Arcadia, but the package's
  `DisplayName` (`build.appx.displayName`) must stay exactly `Arcadia Launcher`.
- **Store ID:** 9N22381XP9S9 — https://apps.microsoft.com/detail/9N22381XP9S9
  (works once the app is published)
- **Package identity:** `SametEge.ArcadiaLauncher`, already set in `build.appx`.
- **Deadline:** the name was reserved on 23 September 2026 and is released again
  unless the first submission is made within three months — by 23 December 2026.

---

## Pricing and availability

- **Price:** Free
- **Markets:** All markets
- **Visibility:** Public

## Properties

- **Category:** Utilities & tools **(you decide — "Entertainment" also fits)**
- **Privacy policy URL:** https://github.com/SametEge/Arcadia/blob/main/PRIVACY.md
- **Website:** https://github.com/SametEge/Arcadia
- **Support contact:** https://github.com/SametEge/Arcadia/issues

## Age ratings

Answer the IARC questionnaire honestly **(you decide)**. For reference, Arcadia
itself has no violence, no user-to-user chat or content sharing, no in-app
purchases and no ads. It displays the cover art of games already in the user's
own library, and it opens a web browser window only for the stores' own sign-in
pages.

---

## Submission options → Restricted capabilities

Partner Center asks why the app needs **runFullTrust**. Suggested answer:

> Arcadia is a desktop game library built with Electron and packaged with the
> Desktop Bridge. It needs full trust to do its core job: find games installed
> by other launchers (reading their install records in the registry and on
> disk), start those games and the launchers' own clients, show whether a game
> is running and close it on request. These are standard Win32 operations that
> the sandboxed app model does not provide.

## Notes for certification

> Arcadia is a launcher: it lists games installed on the PC (Steam, Epic Games,
> Xbox, GOG, EA app, Ubisoft Connect, desktop shortcuts) and starts them.
> No account or test credentials are needed — on a machine without any game
> launchers the library is simply empty, and a game can be added manually with
> "Add Game" to try launching. Linking store accounts (Link Account) is
> optional and signs in on each store's own web page.

---

## Store listing — English (en-US)

**Description**

Arcadia puts every game you own in one clean, fast library — no matter which store it came from.

It finds the games installed on your PC automatically: Steam, Epic Games, Xbox / Game Pass, GOG, EA app, Ubisoft Connect, Riot and desktop shortcuts. Link your store accounts and the games you own but haven't installed show up too, with their real cover art. Click a game to play it; click one you don't have installed and the store starts installing it while Arcadia shows the progress.

Games bought on Steam that also appear in your EA or Ubisoft library stay one game, not two. Your Steam collections come across as lists, and you can make your own lists across every store. Can't decide? Let Arcadia pick a random game for you.

Arcadia is free, open source and private: it has no server, collects nothing, and your store passwords are only ever typed on the stores' own sign-in pages.

**Short description**

All your games from Steam, Epic, Xbox, GOG, EA and Ubisoft in one beautiful library.

**Product features**

- One library for Steam, Epic Games, Xbox / Game Pass, GOG, EA app and Ubisoft Connect
- Finds installed games automatically, no setup
- Link store accounts to see games you own but haven't installed
- Install from Arcadia and follow the download progress
- Real cover art and Metacritic scores
- Your Steam collections as lists, plus your own lists across every store
- No duplicates when the same game appears in more than one store
- "What should I play?" random game picker
- Favorites, search and sorting by name, recently played or rating
- Six languages; minimalist dark design
- Free, open source, no ads and no data collection

**Search terms** (up to 7)

game launcher · game library · steam · epic games · xbox · gog · ubisoft

**Copyright and trademark info**

© 2026 Samet Ege

**Additional license terms**

Arcadia is open-source software released under the MIT License:
https://github.com/SametEge/Arcadia/blob/main/LICENSE

---

## Store listing — Türkçe (tr-TR)

**Açıklama**

Arcadia, sahip olduğun tüm oyunları — hangi mağazadan alınmış olursa olsun — tek, sade ve hızlı bir kütüphanede toplar.

Bilgisayarında kurulu oyunları kendiliğinden bulur: Steam, Epic Games, Xbox / Game Pass, GOG, EA app, Ubisoft Connect, Riot ve masaüstü kısayolları. Mağaza hesaplarını bağladığında sahip olup kurmadığın oyunlar da gerçek kapak görselleriyle görünür. Bir oyuna tıklarsan açılır; kurulu olmayana tıklarsan mağaza kurmaya başlar, Arcadia da ilerlemeyi gösterir.

Steam'den alıp EA ya da Ubisoft kütüphanende de görünen oyunlar iki kez değil, tek oyun olarak kalır. Steam koleksiyonların liste olarak gelir; tüm mağazalardan oyunlarla kendi listelerini de oluşturabilirsin. Kararsız mı kaldın? Arcadia senin için rastgele bir oyun seçsin.

Arcadia ücretsiz, açık kaynak ve gizliliğine saygılıdır: sunucusu yoktur, hiçbir veri toplamaz; mağaza şifreni yalnızca mağazanın kendi giriş sayfasına yazarsın.

**Kısa açıklama**

Steam, Epic, Xbox, GOG, EA ve Ubisoft oyunların tek bir şık kütüphanede.

**Ürün özellikleri**

- Steam, Epic Games, Xbox / Game Pass, GOG, EA app ve Ubisoft Connect için tek kütüphane
- Kurulu oyunları kendiliğinden bulur, ayar gerektirmez
- Mağaza hesaplarını bağla, sahip olup kurmadığın oyunları da gör
- Arcadia'dan kur, indirme ilerlemesini takip et
- Gerçek kapak görselleri ve Metacritic puanları
- Steam koleksiyonların liste olarak; tüm mağazalardan kendi listelerin
- Aynı oyun birden fazla mağazada olsa bile tek kart
- "Ne oynasam?" rastgele oyun seçici
- Favoriler, arama; ada, son oynamaya ya da puana göre sıralama
- Altı dil; sade, koyu tasarım
- Ücretsiz, açık kaynak, reklamsız ve veri toplamaz

**Arama terimleri** (en fazla 7)

oyun başlatıcı · oyun kütüphanesi · steam · epic games · xbox · gog · ubisoft
