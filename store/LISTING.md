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
- **Languages:** the package declares all six UI languages (en-US, tr-TR, de-DE,
  ja-JP, ko-KR, es-ES), so the Store shows them all — and every one of them
  needs its own listing below. Screenshots for each come from
  `electron . --store-shots` (`dist/store-screenshots/<lang>-*.png`).
- **Search terms** are generic on purpose: other companies' trademarks (Steam,
  Xbox…) are named in the descriptions, where they say what Arcadia works
  with, but not used as keywords.
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

game launcher · game library · games · launcher · game collection · pc games · game organizer

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

oyun başlatıcı · oyun kütüphanesi · oyunlar · başlatıcı · oyun koleksiyonu · pc oyunları · oyun düzenleyici

**Ek lisans koşulları**

Arcadia, MIT Lisansı ile yayımlanan açık kaynaklı bir yazılımdır: https://github.com/SametEge/Arcadia/blob/main/LICENSE

---

## Store listing — Deutsch (de-DE)

**Beschreibung**

Arcadia bringt alle deine Spiele in eine übersichtliche, schnelle Bibliothek – ganz gleich, in welchem Store du sie gekauft hast.

Arcadia findet die auf deinem PC installierten Spiele automatisch: Steam, Epic Games, Xbox / Game Pass, GOG, EA app, Ubisoft Connect, Riot und Desktop-Verknüpfungen. Verknüpfe deine Store-Konten, und auch Spiele, die du besitzt, aber nicht installiert hast, erscheinen – mit ihren echten Covern. Klicke auf ein Spiel, um es zu starten; klickst du auf ein nicht installiertes, beginnt der Store mit der Installation, und Arcadia zeigt dir den Fortschritt.

Auf Steam gekaufte Spiele, die auch in deiner EA- oder Ubisoft-Bibliothek auftauchen, bleiben ein Spiel statt zwei. Deine Steam-Sammlungen werden zu Listen, und du kannst eigene Listen über alle Stores hinweg anlegen. Unentschlossen? Lass Arcadia ein zufälliges Spiel für dich auswählen.

Arcadia ist kostenlos, Open Source und respektiert deine Privatsphäre: Es gibt keinen Server, es werden keine Daten gesammelt, und deine Store-Passwörter gibst du nur auf den Anmeldeseiten der Stores selbst ein.

**Kurzbeschreibung**

Alle deine Spiele von Steam, Epic, Xbox, GOG, EA und Ubisoft in einer schönen Bibliothek.

**Produktfunktionen**

- Eine Bibliothek für Steam, Epic Games, Xbox / Game Pass, GOG, EA app und Ubisoft Connect
- Findet installierte Spiele automatisch, ohne Einrichtung
- Store-Konten verknüpfen und auch Spiele sehen, die du besitzt, aber nicht installiert hast
- Aus Arcadia installieren und den Download-Fortschritt verfolgen
- Echte Cover und Metacritic-Wertungen
- Deine Steam-Sammlungen als Listen, dazu eigene Listen über alle Stores hinweg
- Keine Duplikate, wenn ein Spiel in mehreren Stores vorkommt
- „Was soll ich spielen?“ – Zufallsauswahl
- Favoriten, Suche und Sortierung nach Name, zuletzt gespielt oder Wertung
- Sechs Sprachen; minimalistisches dunkles Design
- Kostenlos, Open Source, ohne Werbung und ohne Datensammlung

**Suchbegriffe**

spiele launcher · spielebibliothek · spiele · launcher · spielesammlung · pc spiele · spiele organisieren

**Zusätzliche Lizenzbedingungen**

Arcadia ist Open-Source-Software unter der MIT-Lizenz: https://github.com/SametEge/Arcadia/blob/main/LICENSE

---

## Store listing — 日本語 (ja-JP)

**説明**

Arcadia は、どのストアで購入したゲームでも、すべてをひとつのすっきりとした高速なライブラリにまとめます。

PC にインストールされているゲームを自動で見つけます：Steam、Epic Games、Xbox / Game Pass、GOG、EA app、Ubisoft Connect、Riot、デスクトップのショートカット。ストアのアカウントを連携すると、所有していてもインストールしていないゲームも、本物のカバーアート付きで表示されます。ゲームをクリックすればすぐにプレイ。インストールしていないゲームをクリックするとストアがインストールを始め、Arcadia が進行状況を表示します。

Steam で購入し、EA や Ubisoft のライブラリにも表示されるゲームは、2 つではなく 1 つのゲームとして扱われます。Steam のコレクションはリストとして取り込まれ、すべてのストアをまたいで自分のリストも作れます。迷ったときは、Arcadia がランダムにゲームを選びます。

Arcadia は無料のオープンソースで、プライバシーを尊重します。サーバーはなく、データを一切収集しません。ストアのパスワードは、各ストアのサインインページにのみ入力します。

**短い説明**

Steam、Epic、Xbox、GOG、EA、Ubisoft のゲームをひとつの美しいライブラリに。

**製品の機能**

- Steam、Epic Games、Xbox / Game Pass、GOG、EA app、Ubisoft Connect をひとつのライブラリに
- インストール済みのゲームを自動で検出、設定は不要
- ストアのアカウントを連携して、インストールしていない所有ゲームも表示
- Arcadia からインストールして、ダウンロードの進行状況を確認
- 本物のカバーアートと Metacritic スコア
- Steam のコレクションをリストに。すべてのストアで使える自分のリストも
- 同じゲームが複数のストアにあっても重複しない
- 「何をプレイする？」ランダム選択
- お気に入り、検索、名前・最近のプレイ・評価での並べ替え
- 6 言語に対応、ミニマルなダークデザイン
- 無料、オープンソース、広告なし、データ収集なし

**検索語句**

ゲームランチャー · ゲームライブラリ · ゲーム · ランチャー · ゲームコレクション · PCゲーム · ゲーム管理

**追加のライセンス条項**

Arcadia は MIT ライセンスで公開されているオープンソース ソフトウェアです: https://github.com/SametEge/Arcadia/blob/main/LICENSE

---

## Store listing — 한국어 (ko-KR)

**설명**

Arcadia는 어느 스토어에서 구매했든 보유한 모든 게임을 깔끔하고 빠른 하나의 라이브러리에 모아 줍니다.

PC에 설치된 게임을 자동으로 찾아냅니다: Steam, Epic Games, Xbox / Game Pass, GOG, EA app, Ubisoft Connect, Riot 및 바탕 화면 바로 가기. 스토어 계정을 연결하면 보유했지만 설치하지 않은 게임도 실제 커버 아트와 함께 표시됩니다. 게임을 클릭하면 바로 실행되고, 설치되지 않은 게임을 클릭하면 스토어가 설치를 시작하며 Arcadia가 진행 상황을 보여 줍니다.

Steam에서 구매했는데 EA나 Ubisoft 라이브러리에도 나타나는 게임은 두 개가 아닌 하나의 게임으로 유지됩니다. Steam 컬렉션은 목록으로 가져오고, 모든 스토어의 게임으로 나만의 목록도 만들 수 있습니다. 고민될 때는 Arcadia가 무작위로 게임을 골라 드립니다.

Arcadia는 무료 오픈 소스이며 개인정보를 존중합니다. 서버가 없고 어떤 데이터도 수집하지 않으며, 스토어 비밀번호는 각 스토어의 로그인 페이지에만 입력합니다.

**간단한 설명**

Steam, Epic, Xbox, GOG, EA, Ubisoft 게임을 하나의 멋진 라이브러리에.

**제품 기능**

- Steam, Epic Games, Xbox / Game Pass, GOG, EA app, Ubisoft Connect를 하나의 라이브러리로
- 설치된 게임을 자동으로 찾아 주며 설정이 필요 없음
- 스토어 계정을 연결해 설치하지 않은 보유 게임도 확인
- Arcadia에서 설치하고 다운로드 진행 상황 확인
- 실제 커버 아트와 Metacritic 점수
- Steam 컬렉션을 목록으로, 모든 스토어를 아우르는 나만의 목록
- 같은 게임이 여러 스토어에 있어도 중복 없음
- "뭘 할까?" 무작위 게임 선택
- 즐겨찾기, 검색, 이름·최근 플레이·평점순 정렬
- 6개 언어 지원, 미니멀한 다크 디자인
- 무료, 오픈 소스, 광고 없음, 데이터 수집 없음

**검색어**

게임 런처 · 게임 라이브러리 · 게임 · 런처 · 게임 컬렉션 · PC 게임 · 게임 관리

**추가 라이선스 조건**

Arcadia는 MIT 라이선스로 배포되는 오픈 소스 소프트웨어입니다: https://github.com/SametEge/Arcadia/blob/main/LICENSE

---

## Store listing — Español (es-ES)

**Descripción**

Arcadia reúne todos tus juegos en una biblioteca limpia y rápida, sin importar en qué tienda los compraste.

Encuentra automáticamente los juegos instalados en tu PC: Steam, Epic Games, Xbox / Game Pass, GOG, EA app, Ubisoft Connect, Riot y los accesos directos del escritorio. Vincula tus cuentas de las tiendas y también aparecerán los juegos que tienes pero no has instalado, con sus portadas reales. Haz clic en un juego para jugar; si haces clic en uno que no está instalado, la tienda empieza a instalarlo mientras Arcadia te muestra el progreso.

Los juegos comprados en Steam que también aparecen en tu biblioteca de EA o Ubisoft se quedan como un solo juego, no dos. Tus colecciones de Steam llegan como listas y puedes crear tus propias listas con juegos de todas las tiendas. ¿No te decides? Deja que Arcadia elija un juego al azar por ti.

Arcadia es gratuito, de código abierto y respeta tu privacidad: no tiene servidor, no recopila nada y tus contraseñas de las tiendas solo se escriben en las páginas de inicio de sesión de cada tienda.

**Descripción breve**

Todos tus juegos de Steam, Epic, Xbox, GOG, EA y Ubisoft en una sola biblioteca preciosa.

**Características del producto**

- Una sola biblioteca para Steam, Epic Games, Xbox / Game Pass, GOG, EA app y Ubisoft Connect
- Encuentra los juegos instalados automáticamente, sin configuración
- Vincula tus cuentas para ver también los juegos que tienes sin instalar
- Instala desde Arcadia y sigue el progreso de la descarga
- Portadas reales y puntuaciones de Metacritic
- Tus colecciones de Steam como listas, y listas propias con juegos de todas las tiendas
- Sin duplicados cuando un juego aparece en varias tiendas
- Selector aleatorio «¿A qué juego?»
- Favoritos, búsqueda y orden por nombre, jugados recientemente o puntuación
- Seis idiomas; diseño oscuro y minimalista
- Gratis, de código abierto, sin anuncios y sin recopilación de datos

**Términos de búsqueda**

lanzador de juegos · biblioteca de juegos · juegos · lanzador · colección de juegos · juegos de pc · organizador de juegos

**Términos de licencia adicionales**

Arcadia es software de código abierto publicado bajo la licencia MIT: https://github.com/SametEge/Arcadia/blob/main/LICENSE
