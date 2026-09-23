# Arcadia Privacy Policy

_Last updated: September 23, 2026_

Arcadia is a game library and launcher for Windows. It is open source
([github.com/SametEge/Arcadia](https://github.com/SametEge/Arcadia)), so everything
described here can be checked in the code.

**In short: Arcadia has no server. The developer collects nothing. There is no
telemetry, no analytics and no advertising.** Everything Arcadia knows about you
stays on your PC, and the only services it talks to are the game stores you
choose to use.

## What Arcadia stores on your PC

- **Your game library** — games found on your PC or in accounts you linked, with
  the cover art, favorites, lists, play counts and settings you set. Kept in
  Arcadia's local data folder (`%APPDATA%\Arcadia`, or the package's private
  folder for the Microsoft Store version).
- **Store sessions for linked accounts** — when you link Steam, Epic Games,
  Xbox, GOG, EA or Ubisoft Connect, the sign-in token or session that store
  returns is kept on your PC, encrypted with Windows Data Protection (DPAPI) so
  that only your Windows account can read it. **You type your password on the
  store's own sign-in page; Arcadia never sees or stores it.**
- **Caches** — cover-image addresses and Metacritic scores, so they don't have
  to be looked up again.

None of this is sent to the developer or to anyone else.

## Who Arcadia talks to, and why

Requests go directly from your PC to these services — never through a server
of ours:

| Service | When | What is sent |
|---|---|---|
| Steam (Valve) | Always, if Steam is used | Game IDs, to fetch cover art and Metacritic scores; your library, if you linked your account |
| Epic Games, Microsoft/Xbox, GOG, EA, Ubisoft | Only after you link that account | Your session with that store, to read the games you own |
| SteamGridDB | For games without store artwork | The game's title, to find cover art |
| GitHub | Only in the version downloaded from GitHub, not the Microsoft Store version | A check for a newer Arcadia release |

Each of these services handles that data under its own privacy policy.

## What Arcadia reads and changes on your PC

To find your games, Arcadia reads the install records other launchers keep on
your PC (for example Steam's library folders and Epic's install manifests). It
does not change them — with one exception you trigger yourself: if you delete a
Steam collection from Arcadia, Arcadia marks that collection deleted in Steam's
own local file, the same way Steam does, after making a backup. It only does
this while Steam is closed.

## Your control

- **Sign out** of a linked account in *Link Account* to delete its stored
  session immediately.
- **Uninstalling** Arcadia removes its data. For the GitHub version you can
  also delete the `%APPDATA%\Arcadia` folder yourself.

## Children

Arcadia is not directed at children under 13 and does not knowingly process
their data.

## Changes and contact

Changes to this policy will be published in this file, with a new date above.
Questions: open an issue at
[github.com/SametEge/Arcadia/issues](https://github.com/SametEge/Arcadia/issues).

---

# Arcadia Gizlilik Politikası (Türkçe)

**Kısaca: Arcadia'nın sunucusu yok. Geliştirici hiçbir veri toplamaz. Telemetri,
analiz ve reklam yoktur.** Arcadia'nın senin hakkında bildiği her şey
bilgisayarında kalır; yalnızca kullanmayı seçtiğin oyun mağazalarıyla konuşur.

- **Bilgisayarında tutulanlar:** oyun kütüphanen, favorilerin, listelerin ve
  ayarların; bağladığın hesapların oturum bilgileri (Windows veri koruması/DPAPI
  ile şifreli). **Şifreni mağazanın kendi giriş sayfasına yazarsın; Arcadia onu
  hiçbir zaman görmez ve saklamaz.**
- **Bağlanılan servisler:** Steam (kapak ve Metacritic puanı için oyun
  kimlikleri), bağladığın mağazalar (sahip olduğun oyunları okumak için),
  SteamGridDB (kapak bulmak için oyun adı), GitHub (yalnızca GitHub sürümünde,
  güncelleme kontrolü). İstekler doğrudan bilgisayarından bu servislere gider.
- **Bilgisayarındaki dosyalar:** oyunları bulmak için diğer başlatıcıların kurulum
  kayıtları okunur, değiştirilmez. Tek istisna senin tetiklediğin işlem: Arcadia'dan
  bir Steam koleksiyonunu silersen, Steam kapalıyken ve önce yedek alınarak
  Steam'in kendi dosyasında silindi olarak işaretlenir.
- **Kontrol sende:** *Hesap Bağla* ekranından çıkış yapınca o hesabın oturumu hemen
  silinir. Arcadia'yı kaldırmak verilerini de siler.

Sorular için: [github.com/SametEge/Arcadia/issues](https://github.com/SametEge/Arcadia/issues)
