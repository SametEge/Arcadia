'use strict';

const api = window.arcadia;
const APP_VERSION = '1.0.0';

/* ------------------------------ i18n ----------------------------------- */
const I18N = {
  tr: {
    scan: 'Tara', addGame: 'Oyun Ekle', settings: 'Ayarlar', by: 'Geliştiren',
    searchPlaceholder: 'Oyun ara…', sortTitle: 'A → Z', sortRecent: 'Son eklenen', sortPlayed: 'Son oynanan',
    emptyTitle: 'Henüz oyun yok', emptyText: 'Bilgisayarındaki oyunları bulmak için taramayı başlat.', emptyScan: 'Oyunları Tara',
    allGames: 'Tüm Oyunlar', favorites: 'Favoriler', sourcesSection: 'Kaynaklar',
    src_steam: 'Steam', src_epic: 'Epic Games', src_xbox: 'Xbox', src_shortcut: 'Kısayollar', src_folder: 'Klasör', src_manual: 'Eklenenler',
    gamesCount: '{n} oyun', noGamesInView: 'Bu görünümde oyun yok.',
    scanning: 'Oyunlar taranıyor…', scanningSource: '{s} taranıyor…', foundGames: '{n} oyun bulundu', scanError: 'Tarama hatası: {e}',
    launch: 'Başlat', addFav: 'Favorilere ekle', removeFav: 'Favoriden çıkar', rename: 'Yeniden adlandır',
    changeCover: 'Kapak değiştir…', openFolder: 'Klasörü aç', hide: 'Gizle', removeFromLib: 'Kütüphaneden sil', remove: 'Kaldır',
    launching: '{t} başlatılıyor…', launchFailed: 'Başlatılamadı: {e}', addedToast: 'Eklendi: {t}', hiddenToast: '{t} gizlendi', removedToast: '{t} silindi',
    renamePrompt: 'Yeni ad:', openingDiscord: 'Discord açılıyor…', discordFailed: 'Discord açılamadı',
    closeDiscordTip: "Discord'u kapat", discordClosed: 'Discord kapatıldı',
    launchWith: 'Birlikte aç…', companionTitle: 'Birlikte Aç', save: 'Kaydet',
    companionHint: 'Bu oyunu açtığında seçtiklerin de açılır.', companionSearch: 'Uygulama ara…',
    closeGameTip: 'Oyunu kapat', gameClosed: '{t} kapatıldı',
    settingsSources: 'Tarama Kaynakları', optFolders: 'Özel klasörler', settingsFolders: 'Özel Oyun Klasörleri',
    noFolders: 'Henüz klasör eklenmedi. Tek tek .exe oyunların olduğu bir klasör ekle.', addFolderBtn: 'Klasör Ekle',
    settingsAccent: 'Vurgu Rengi', settingsLogo: 'Logo Rengi', settingsLogoShape: 'Logo Şekli', settingsLogoSymbol: 'Logo Simgesi', settingsLanguage: 'Dil', rescanNow: 'Şimdi Yeniden Tara',
    coverHint: 'Steam oyunları otomatik kapakla gelir. Diğerlerinde sağ tık → Kapak değiştir ile kendi görselini koyabilirsin.',
    settingsAbout: 'Hakkında', aboutSub: 'Oyun kütüphanen · Geliştiren Samet Ege',
    settingsCovers: 'Kapak Görselleri (SteamGridDB)', sgdbPlaceholder: 'SteamGridDB API anahtarı',
    sgdbHint: 'Steam dışı oyunlara (Minecraft, FACEIT, LoL…) otomatik kapak getirir. Ücretsiz anahtar: steamgriddb.com → Preferences → API. Yapıştırıp yeniden tara.',
    startupTitle: 'Başlangıçta aç', startupQuestion: 'Arcadia, bilgisayar açıldığında otomatik başlasın mı?', startYes: 'Evet, başlat', startNo: 'Hayır',
    settingsStartup: 'Başlangıç', autostartLabel: 'Bilgisayar açılınca başlat', bgNotice: 'Arcadia arka planda çalışmaya devam ediyor',
    onbNext: 'İleri', onbDone: 'Başla', onbSkip: 'Geç',
    onbScanT: 'Oyunlarını tara', onbScanD: 'Steam, Epic, Xbox ve masaüstü oyunlarını otomatik bulur.',
    onbCardT: 'Tıkla ve oyna', onbCardD: 'Karta tıkla, oyun açılır. Sağ tık ile favori, kapak değiştir, birlikte aç ve daha fazlası.',
    onbDiscordT: 'Hızlı Discord', onbDiscordD: "Buradan Discord'u tek tıkla aç; açıkken yeşil yanar, × ile kapatırsın.",
    onbSettingsT: 'Ayarlar', onbSettingsD: 'Dil, renk, kapak görselleri, klasörler ve başlangıç ayarları burada.',
  },
  en: {
    scan: 'Scan', addGame: 'Add Game', settings: 'Settings', by: 'by',
    searchPlaceholder: 'Search games…', sortTitle: 'A → Z', sortRecent: 'Recently added', sortPlayed: 'Recently played',
    emptyTitle: 'No games yet', emptyText: 'Scan to find the games installed on your PC.', emptyScan: 'Scan for Games',
    allGames: 'All Games', favorites: 'Favorites', sourcesSection: 'Sources',
    src_steam: 'Steam', src_epic: 'Epic Games', src_xbox: 'Xbox', src_shortcut: 'Shortcuts', src_folder: 'Folder', src_manual: 'Added',
    gamesCount: '{n} games', noGamesInView: 'No games in this view.',
    scanning: 'Scanning games…', scanningSource: 'Scanning {s}…', foundGames: '{n} games found', scanError: 'Scan error: {e}',
    launch: 'Launch', addFav: 'Add to favorites', removeFav: 'Remove from favorites', rename: 'Rename',
    changeCover: 'Change cover…', openFolder: 'Open folder', hide: 'Hide', removeFromLib: 'Remove from library', remove: 'Remove',
    launching: 'Launching {t}…', launchFailed: "Couldn't launch: {e}", addedToast: 'Added: {t}', hiddenToast: '{t} hidden', removedToast: '{t} removed',
    renamePrompt: 'New name:', openingDiscord: 'Opening Discord…', discordFailed: "Couldn't open Discord",
    closeDiscordTip: 'Close Discord', discordClosed: 'Discord closed',
    launchWith: 'Launch together…', companionTitle: 'Launch Together', save: 'Save',
    companionHint: 'When you launch this game, the selected apps open too.', companionSearch: 'Search apps…',
    closeGameTip: 'Close game', gameClosed: '{t} closed',
    settingsSources: 'Scan Sources', optFolders: 'Custom folders', settingsFolders: 'Custom Game Folders',
    noFolders: 'No folders yet. Add a folder that contains standalone .exe games.', addFolderBtn: 'Add Folder',
    settingsAccent: 'Accent Color', settingsLogo: 'Logo Color', settingsLogoShape: 'Logo Shape', settingsLogoSymbol: 'Logo Symbol', settingsLanguage: 'Language', rescanNow: 'Rescan Now',
    coverHint: 'Steam games come with automatic covers. For others, right-click → Change cover to set your own image.',
    settingsAbout: 'About', aboutSub: 'Your game library · by Samet Ege',
    settingsCovers: 'Cover Art (SteamGridDB)', sgdbPlaceholder: 'SteamGridDB API key',
    sgdbHint: 'Fetches covers for non-Steam games (Minecraft, FACEIT, LoL…). Free key: steamgriddb.com → Preferences → API. Paste it and rescan.',
    startupTitle: 'Launch at startup', startupQuestion: 'Should Arcadia start automatically when your PC turns on?', startYes: 'Yes, start it', startNo: 'No',
    settingsStartup: 'Startup', autostartLabel: 'Launch when PC starts', bgNotice: 'Arcadia keeps running in the background',
    onbNext: 'Next', onbDone: 'Get started', onbSkip: 'Skip',
    onbScanT: 'Scan your games', onbScanD: 'Automatically finds your Steam, Epic, Xbox and desktop games.',
    onbCardT: 'Click to play', onbCardD: 'Click a card to launch. Right-click for favorite, change cover, launch together and more.',
    onbDiscordT: 'Quick Discord', onbDiscordD: 'Open Discord with one click; it glows green when running, close it with ×.',
    onbSettingsT: 'Settings', onbSettingsD: 'Language, color, cover art, folders and startup options are here.',
  },
  de: {
    scan: 'Scannen', addGame: 'Spiel hinzufügen', settings: 'Einstellungen', by: 'von',
    searchPlaceholder: 'Spiele suchen…', sortTitle: 'A → Z', sortRecent: 'Zuletzt hinzugefügt', sortPlayed: 'Zuletzt gespielt',
    emptyTitle: 'Noch keine Spiele', emptyText: 'Starte den Scan, um installierte Spiele zu finden.', emptyScan: 'Spiele scannen',
    allGames: 'Alle Spiele', favorites: 'Favoriten', sourcesSection: 'Quellen',
    src_steam: 'Steam', src_epic: 'Epic Games', src_xbox: 'Xbox', src_shortcut: 'Verknüpfungen', src_folder: 'Ordner', src_manual: 'Hinzugefügt',
    gamesCount: '{n} Spiele', noGamesInView: 'Keine Spiele in dieser Ansicht.',
    scanning: 'Spiele werden gescannt…', scanningSource: '{s} wird gescannt…', foundGames: '{n} Spiele gefunden', scanError: 'Scan-Fehler: {e}',
    launch: 'Starten', addFav: 'Zu Favoriten', removeFav: 'Aus Favoriten entfernen', rename: 'Umbenennen',
    changeCover: 'Cover ändern…', openFolder: 'Ordner öffnen', hide: 'Ausblenden', removeFromLib: 'Aus Bibliothek entfernen', remove: 'Entfernen',
    launching: '{t} wird gestartet…', launchFailed: 'Start fehlgeschlagen: {e}', addedToast: 'Hinzugefügt: {t}', hiddenToast: '{t} ausgeblendet', removedToast: '{t} entfernt',
    renamePrompt: 'Neuer Name:', openingDiscord: 'Discord wird geöffnet…', discordFailed: 'Discord konnte nicht geöffnet werden',
    closeDiscordTip: 'Discord schließen', discordClosed: 'Discord geschlossen',
    launchWith: 'Zusammen starten…', companionTitle: 'Zusammen starten', save: 'Speichern',
    companionHint: 'Beim Start dieses Spiels werden die ausgewählten Apps mitgestartet.', companionSearch: 'Apps suchen…',
    closeGameTip: 'Spiel schließen', gameClosed: '{t} geschlossen',
    settingsSources: 'Scan-Quellen', optFolders: 'Eigene Ordner', settingsFolders: 'Eigene Spielordner',
    noFolders: 'Noch keine Ordner. Füge einen Ordner mit .exe-Spielen hinzu.', addFolderBtn: 'Ordner hinzufügen',
    settingsAccent: 'Akzentfarbe', settingsLogo: 'Logo-Farbe', settingsLogoShape: 'Logo-Form', settingsLogoSymbol: 'Logo-Symbol', settingsLanguage: 'Sprache', rescanNow: 'Jetzt neu scannen',
    coverHint: 'Steam-Spiele haben automatische Cover. Bei anderen: Rechtsklick → Cover ändern, um ein eigenes Bild zu setzen.',
    settingsAbout: 'Über', aboutSub: 'Deine Spielebibliothek · von Samet Ege',
    settingsCovers: 'Cover-Bilder (SteamGridDB)', sgdbPlaceholder: 'SteamGridDB API-Schlüssel',
    sgdbHint: 'Holt Cover für Nicht-Steam-Spiele (Minecraft, FACEIT, LoL…). Kostenloser Schlüssel: steamgriddb.com → Preferences → API. Einfügen und neu scannen.',
    startupTitle: 'Beim Start öffnen', startupQuestion: 'Soll Arcadia automatisch starten, wenn der PC hochfährt?', startYes: 'Ja, starten', startNo: 'Nein',
    settingsStartup: 'Autostart', autostartLabel: 'Beim Hochfahren starten', bgNotice: 'Arcadia läuft im Hintergrund weiter',
    onbNext: 'Weiter', onbDone: "Los geht's", onbSkip: 'Überspringen',
    onbScanT: 'Spiele scannen', onbScanD: 'Findet automatisch deine Steam-, Epic-, Xbox- und Desktop-Spiele.',
    onbCardT: 'Klicken zum Spielen', onbCardD: 'Karte anklicken zum Starten. Rechtsklick für Favorit, Cover ändern, zusammen starten und mehr.',
    onbDiscordT: 'Discord-Schnellzugriff', onbDiscordD: 'Öffne Discord mit einem Klick; leuchtet grün, schließen mit ×.',
    onbSettingsT: 'Einstellungen', onbSettingsD: 'Sprache, Farbe, Cover, Ordner und Autostart findest du hier.',
  },
  ja: {
    scan: 'スキャン', addGame: 'ゲームを追加', settings: '設定', by: '制作',
    searchPlaceholder: 'ゲームを検索…', sortTitle: 'A → Z', sortRecent: '最近追加', sortPlayed: '最近プレイ',
    emptyTitle: 'まだゲームがありません', emptyText: 'PCにインストールされたゲームをスキャンして見つけましょう。', emptyScan: 'ゲームをスキャン',
    allGames: 'すべてのゲーム', favorites: 'お気に入り', sourcesSection: 'ソース',
    src_steam: 'Steam', src_epic: 'Epic Games', src_xbox: 'Xbox', src_shortcut: 'ショートカット', src_folder: 'フォルダー', src_manual: '追加済み',
    gamesCount: '{n} 本', noGamesInView: 'この表示にゲームはありません。',
    scanning: 'ゲームをスキャン中…', scanningSource: '{s} をスキャン中…', foundGames: '{n} 本のゲームが見つかりました', scanError: 'スキャンエラー: {e}',
    launch: '起動', addFav: 'お気に入りに追加', removeFav: 'お気に入りから削除', rename: '名前を変更',
    changeCover: 'カバーを変更…', openFolder: 'フォルダーを開く', hide: '非表示', removeFromLib: 'ライブラリから削除', remove: '削除',
    launching: '{t} を起動中…', launchFailed: '起動できませんでした: {e}', addedToast: '追加しました: {t}', hiddenToast: '{t} を非表示にしました', removedToast: '{t} を削除しました',
    renamePrompt: '新しい名前:', openingDiscord: 'Discordを起動中…', discordFailed: 'Discordを起動できませんでした',
    closeDiscordTip: 'Discordを閉じる', discordClosed: 'Discordを閉じました',
    launchWith: '一緒に起動…', companionTitle: '一緒に起動', save: '保存',
    companionHint: 'このゲームを起動すると、選択したアプリも開きます。', companionSearch: 'アプリを検索…',
    closeGameTip: 'ゲームを閉じる', gameClosed: '{t} を閉じました',
    settingsSources: 'スキャンソース', optFolders: 'カスタムフォルダー', settingsFolders: 'カスタムゲームフォルダー',
    noFolders: 'まだフォルダーがありません。.exe ゲームが入ったフォルダーを追加してください。', addFolderBtn: 'フォルダーを追加',
    settingsAccent: 'アクセントカラー', settingsLogo: 'ロゴの色', settingsLogoShape: 'ロゴの形', settingsLogoSymbol: 'ロゴの記号', settingsLanguage: '言語', rescanNow: '今すぐ再スキャン',
    coverHint: 'Steamゲームには自動でカバーが付きます。その他は右クリック →「カバーを変更」で自分の画像を設定できます。',
    settingsAbout: '情報', aboutSub: 'あなたのゲームライブラリ · 制作 Samet Ege',
    settingsCovers: 'カバー画像 (SteamGridDB)', sgdbPlaceholder: 'SteamGridDB APIキー',
    sgdbHint: 'Steam以外のゲーム（Minecraft、FACEIT、LoL…）にカバーを取得します。無料キー: steamgriddb.com → Preferences → API。貼り付けて再スキャン。',
    startupTitle: '起動時に開く', startupQuestion: 'PCの起動時にArcadiaを自動的に起動しますか？', startYes: 'はい', startNo: 'いいえ',
    settingsStartup: '起動', autostartLabel: 'PC起動時に起動', bgNotice: 'Arcadiaはバックグラウンドで動作し続けます',
    onbNext: '次へ', onbDone: '始める', onbSkip: 'スキップ',
    onbScanT: 'ゲームをスキャン', onbScanD: 'Steam、Epic、Xbox、デスクトップのゲームを自動的に見つけます。',
    onbCardT: 'クリックして起動', onbCardD: 'カードをクリックして起動。右クリックでお気に入り、カバー変更、一緒に起動など。',
    onbDiscordT: 'Discordショートカット', onbDiscordD: 'ワンクリックでDiscordを起動。起動中は緑に光り、×で閉じます。',
    onbSettingsT: '設定', onbSettingsD: '言語、色、カバー画像、フォルダー、起動設定はこちら。',
  },
  ko: {
    scan: '스캔', addGame: '게임 추가', settings: '설정', by: '제작',
    searchPlaceholder: '게임 검색…', sortTitle: 'A → Z', sortRecent: '최근 추가', sortPlayed: '최근 플레이',
    emptyTitle: '아직 게임이 없습니다', emptyText: 'PC에 설치된 게임을 스캔하여 찾아보세요.', emptyScan: '게임 스캔',
    allGames: '모든 게임', favorites: '즐겨찾기', sourcesSection: '소스',
    src_steam: 'Steam', src_epic: 'Epic Games', src_xbox: 'Xbox', src_shortcut: '바로가기', src_folder: '폴더', src_manual: '추가됨',
    gamesCount: '게임 {n}개', noGamesInView: '이 보기에 게임이 없습니다.',
    scanning: '게임 스캔 중…', scanningSource: '{s} 스캔 중…', foundGames: '게임 {n}개를 찾았습니다', scanError: '스캔 오류: {e}',
    launch: '실행', addFav: '즐겨찾기에 추가', removeFav: '즐겨찾기에서 제거', rename: '이름 바꾸기',
    changeCover: '커버 변경…', openFolder: '폴더 열기', hide: '숨기기', removeFromLib: '라이브러리에서 제거', remove: '제거',
    launching: '{t} 실행 중…', launchFailed: '실행할 수 없습니다: {e}', addedToast: '추가됨: {t}', hiddenToast: '{t} 숨김', removedToast: '{t} 제거됨',
    renamePrompt: '새 이름:', openingDiscord: 'Discord 실행 중…', discordFailed: 'Discord를 열 수 없습니다',
    closeDiscordTip: 'Discord 닫기', discordClosed: 'Discord를 닫았습니다',
    launchWith: '함께 실행…', companionTitle: '함께 실행', save: '저장',
    companionHint: '이 게임을 실행하면 선택한 앱도 함께 열립니다.', companionSearch: '앱 검색…',
    closeGameTip: '게임 닫기', gameClosed: '{t} 닫힘',
    settingsSources: '스캔 소스', optFolders: '사용자 폴더', settingsFolders: '사용자 게임 폴더',
    noFolders: '아직 폴더가 없습니다. .exe 게임이 있는 폴더를 추가하세요.', addFolderBtn: '폴더 추가',
    settingsAccent: '강조 색상', settingsLogo: '로고 색상', settingsLogoShape: '로고 모양', settingsLogoSymbol: '로고 기호', settingsLanguage: '언어', rescanNow: '지금 다시 스캔',
    coverHint: 'Steam 게임은 자동으로 커버가 표시됩니다. 그 외에는 마우스 오른쪽 클릭 → 커버 변경으로 직접 이미지를 설정하세요.',
    settingsAbout: '정보', aboutSub: '나의 게임 라이브러리 · 제작 Samet Ege',
    settingsCovers: '커버 이미지 (SteamGridDB)', sgdbPlaceholder: 'SteamGridDB API 키',
    sgdbHint: 'Steam이 아닌 게임(Minecraft, FACEIT, LoL…)의 커버를 가져옵니다. 무료 키: steamgriddb.com → Preferences → API. 붙여넣고 다시 스캔하세요.',
    startupTitle: '시작 시 실행', startupQuestion: 'PC를 켤 때 Arcadia를 자동으로 시작할까요?', startYes: '예', startNo: '아니요',
    settingsStartup: '시작', autostartLabel: 'PC 시작 시 실행', bgNotice: 'Arcadia가 백그라운드에서 계속 실행됩니다',
    onbNext: '다음', onbDone: '시작하기', onbSkip: '건너뛰기',
    onbScanT: '게임 스캔', onbScanD: 'Steam, Epic, Xbox 및 바탕화면 게임을 자동으로 찾습니다.',
    onbCardT: '클릭하여 실행', onbCardD: '카드를 클릭하여 실행. 마우스 오른쪽 클릭으로 즐겨찾기, 커버 변경, 함께 실행 등.',
    onbDiscordT: '빠른 Discord', onbDiscordD: '한 번의 클릭으로 Discord 실행. 실행 중에는 녹색으로 표시되며 ×로 닫습니다.',
    onbSettingsT: '설정', onbSettingsD: '언어, 색상, 커버 이미지, 폴더, 시작 설정이 여기에 있습니다.',
  },
  es: {
    scan: 'Escanear', addGame: 'Añadir juego', settings: 'Ajustes', by: 'por',
    searchPlaceholder: 'Buscar juegos…', sortTitle: 'A → Z', sortRecent: 'Añadido reciente', sortPlayed: 'Jugado reciente',
    emptyTitle: 'Aún no hay juegos', emptyText: 'Escanea para encontrar los juegos instalados en tu PC.', emptyScan: 'Escanear juegos',
    allGames: 'Todos los juegos', favorites: 'Favoritos', sourcesSection: 'Fuentes',
    src_steam: 'Steam', src_epic: 'Epic Games', src_xbox: 'Xbox', src_shortcut: 'Accesos directos', src_folder: 'Carpeta', src_manual: 'Añadidos',
    gamesCount: '{n} juegos', noGamesInView: 'No hay juegos en esta vista.',
    scanning: 'Escaneando juegos…', scanningSource: 'Escaneando {s}…', foundGames: '{n} juegos encontrados', scanError: 'Error de escaneo: {e}',
    launch: 'Iniciar', addFav: 'Añadir a favoritos', removeFav: 'Quitar de favoritos', rename: 'Renombrar',
    changeCover: 'Cambiar carátula…', openFolder: 'Abrir carpeta', hide: 'Ocultar', removeFromLib: 'Quitar de la biblioteca', remove: 'Quitar',
    launching: 'Iniciando {t}…', launchFailed: 'No se pudo iniciar: {e}', addedToast: 'Añadido: {t}', hiddenToast: '{t} oculto', removedToast: '{t} eliminado',
    renamePrompt: 'Nuevo nombre:', openingDiscord: 'Abriendo Discord…', discordFailed: 'No se pudo abrir Discord',
    closeDiscordTip: 'Cerrar Discord', discordClosed: 'Discord cerrado',
    launchWith: 'Abrir junto…', companionTitle: 'Abrir junto', save: 'Guardar',
    companionHint: 'Al iniciar este juego, también se abren las apps seleccionadas.', companionSearch: 'Buscar apps…',
    closeGameTip: 'Cerrar juego', gameClosed: '{t} cerrado',
    settingsSources: 'Fuentes de escaneo', optFolders: 'Carpetas personalizadas', settingsFolders: 'Carpetas de juegos',
    noFolders: 'Aún no hay carpetas. Añade una carpeta con juegos .exe.', addFolderBtn: 'Añadir carpeta',
    settingsAccent: 'Color de acento', settingsLogo: 'Color del logo', settingsLogoShape: 'Forma del logo', settingsLogoSymbol: 'Símbolo del logo', settingsLanguage: 'Idioma', rescanNow: 'Volver a escanear',
    coverHint: 'Los juegos de Steam traen carátulas automáticas. Para los demás, clic derecho → Cambiar carátula para poner tu propia imagen.',
    settingsAbout: 'Acerca de', aboutSub: 'Tu biblioteca de juegos · por Samet Ege',
    settingsCovers: 'Carátulas (SteamGridDB)', sgdbPlaceholder: 'Clave API de SteamGridDB',
    sgdbHint: 'Obtiene carátulas para juegos que no son de Steam (Minecraft, FACEIT, LoL…). Clave gratis: steamgriddb.com → Preferences → API. Pégala y vuelve a escanear.',
    startupTitle: 'Abrir al iniciar', startupQuestion: '¿Quieres que Arcadia se inicie automáticamente al encender el PC?', startYes: 'Sí', startNo: 'No',
    settingsStartup: 'Inicio', autostartLabel: 'Iniciar al encender el PC', bgNotice: 'Arcadia sigue ejecutándose en segundo plano',
    onbNext: 'Siguiente', onbDone: 'Empezar', onbSkip: 'Omitir',
    onbScanT: 'Escanea tus juegos', onbScanD: 'Encuentra automáticamente tus juegos de Steam, Epic, Xbox y escritorio.',
    onbCardT: 'Haz clic para jugar', onbCardD: 'Haz clic en una tarjeta para iniciar. Clic derecho para favoritos, cambiar carátula, abrir junto y más.',
    onbDiscordT: 'Discord rápido', onbDiscordD: 'Abre Discord con un clic; se ilumina en verde cuando está abierto, ciérralo con ×.',
    onbSettingsT: 'Ajustes', onbSettingsD: 'Idioma, color, carátulas, carpetas y opciones de inicio están aquí.',
  },
};

let lang = 'tr';
function t(key, vars) {
  let s = (I18N[lang] && I18N[lang][key]) || (I18N.en[key]) || key;
  if (vars) for (const k in vars) s = s.replace(`{${k}}`, vars[k]);
  return s;
}
// Map the PC's locale to one of our UI languages (Azerbaijani falls back to
// Turkish; anything we don't translate falls back to English).
function detectLang() {
  const l = (navigator.language || 'en').toLowerCase();
  if (l.startsWith('tr') || l.startsWith('az')) return 'tr';
  if (l.startsWith('de')) return 'de';
  if (l.startsWith('ja')) return 'ja';
  if (l.startsWith('ko')) return 'ko';
  if (l.startsWith('es')) return 'es';
  return 'en';
}

/* ------------------------------ Icons ---------------------------------- */
const L = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const F = (p) => `<svg viewBox="0 0 24 24" fill="currentColor">${p}</svg>`;
const ICONS = {
  grid: L('<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>'),
  star: L('<path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.15 1 5.85L12 17.1 6.75 19.6l1-5.85L3.5 9.7l5.9-.9z"/>'),
  starFill: F('<path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.15 1 5.85L12 17.1 6.75 19.6l1-5.85L3.5 9.7l5.9-.9z"/>'),
  steam: F('<path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z"/>'),
  epic: F('<path d="M6.9 4.4h10.2v2.8h-7.1v2.3h6.3v2.8h-6.3v2.5h7.1v2.8H6.9z"/>'),
  xbox: F('<path d="M4.102 21.033C6.211 22.881 8.977 24 12 24c3.026 0 5.789-1.119 7.902-2.967 1.877-1.912-4.316-8.709-7.902-11.417-3.582 2.708-9.779 9.505-7.898 11.417zm11.16-14.406c2.5 2.961 7.484 10.313 6.076 12.912C23.002 17.48 24 14.861 24 12.004c0-3.34-1.365-6.362-3.57-8.536 0 0-.027-.022-.082-.042-.063-.022-.152-.045-.281-.045-.592 0-1.985.434-4.805 3.246zM3.654 3.426c-.057.02-.082.041-.086.042C1.365 5.642 0 8.664 0 12.004c0 2.854.998 5.473 2.661 7.533-1.401-2.605 3.579-9.951 6.08-12.91-2.82-2.813-4.216-3.245-4.806-3.245-.131 0-.223.021-.281.046v-.002zM12 3.551S9.055 1.828 6.755 1.746c-.903-.033-1.454.295-1.521.339C7.379.646 9.659 0 11.984 0H12c2.334 0 4.605.646 6.766 2.085-.068-.046-.615-.372-1.52-.339C14.946 1.828 12 3.545 12 3.545v.006z"/>'),
  folder: L('<path d="M3 7.5a2 2 0 0 1 2-2h3.4l2 2H19a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
  link: L('<path d="M9.5 14.5l5-5"/><path d="M11 6.5l1.2-1.2a4 4 0 0 1 5.7 5.7L16.5 12"/><path d="M13 17.5l-1.2 1.2a4 4 0 0 1-5.7-5.7L7.5 12"/>'),
  together: L('<rect x="3.5" y="8" width="12.5" height="12.5" rx="2.5"/><path d="M8 8V6a2.5 2.5 0 0 1 2.5-2.5H18A2.5 2.5 0 0 1 20.5 6v7.5A2.5 2.5 0 0 1 18 16h-2"/>'),
  check: L('<path d="M5 12.5l4.5 4.5L19 7"/>'),
  plus: L('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),
  plusSquare: L('<rect x="4" y="4" width="16" height="16" rx="3.5"/><line x1="12" y1="8.5" x2="12" y2="15.5"/><line x1="8.5" y1="12" x2="15.5" y2="12"/>'),
  refresh: L('<path d="M3.5 9a8.5 8.5 0 0 1 14.2-3.2L20 8"/><path d="M20 3.8V8h-4.2"/><path d="M20.5 15a8.5 8.5 0 0 1-14.2 3.2L4 16"/><path d="M4 20.2V16h4.2"/>'),
  gear: L('<circle cx="12" cy="12" r="3.2"/><path d="M12 3v2.6M12 18.4V21M21 12h-2.6M5.6 12H3M18.4 5.6l-1.85 1.85M7.45 16.55 5.6 18.4M18.4 18.4l-1.85-1.85M7.45 7.45 5.6 5.6"/>'),
  play: F('<path d="M7 5v14l12-7z"/>'),
  search: L('<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.6" y2="16.6"/>'),
  dots: F('<circle cx="5.5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="18.5" cy="12" r="1.7"/>'),
  close: L('<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>'),
  discord: F('<path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>'),
  edit: L('<path d="M4 20h4L19 9l-4-4L4 16z"/><line x1="13.5" y1="6.5" x2="17.5" y2="10.5"/>'),
  image: L('<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><circle cx="8.5" cy="10" r="1.8"/><path d="M21 16l-5-5L5 19.5"/>'),
  eyeOff: L('<path d="M4 4l16 16"/><path d="M9.8 5.3A9.3 9.3 0 0 1 12 5c5 0 9 5.2 9 7a12.6 12.6 0 0 1-2.3 2.9M6.4 7.4C4.1 8.8 3 11.1 3 12c0 1.8 4 7 9 7a9.3 9.3 0 0 0 3.1-.5"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'),
  trash: L('<path d="M4 7h16"/><path d="M9 7V4.5h6V7"/><path d="M6.5 7l.9 12.5h9.2L17.5 7"/><line x1="10" y1="10.5" x2="10" y2="16"/><line x1="14" y1="10.5" x2="14" y2="16"/>'),
};
const icon = (name) => ICONS[name] || '';

/* ------------------------------ State ---------------------------------- */
const state = { games: [], settings: {}, filter: 'all', search: '', sort: 'title', running: new Set(), runningSteam: new Set(), runningPaths: [] };

const NAV_SOURCES = [
  { key: 'steam', icon: 'steam' },
  { key: 'epic', icon: 'epic' },
  { key: 'xbox', icon: 'xbox' },
  { key: 'shortcut', icon: 'link' },
  { key: 'folder', icon: 'folder' },
  { key: 'manual', icon: 'plusSquare' },
];
const ACCENTS = [
  '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b', '#f97316',
  '#ef4444', '#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6',
  '#6366f1', '#3b82f6', '#06b6d4', '#14b8a6',
];
const LOGO_COLORS = [...ACCENTS, '#ffffff', '#16171c'];

const $ = (sel) => document.querySelector(sel);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html !== undefined) n.innerHTML = html;
  return n;
};
const displayTitle = (g) => g.customTitle || g.title;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ------------------------------- Boot ---------------------------------- */
async function init() {
  const data = await api.getState();
  state.games = data.games || [];
  state.settings = data.settings || {};
  state.sort = state.settings.sortBy || 'title';
  lang = state.settings.language || detectLang();
  // Persist the detected language on first run so the tray/menus match it too.
  if (!state.settings.language) state.settings = await api.setSettings({ language: lang });

  applyAccent(state.settings.accent || '#10b981');
  applyLogo(state.settings.logo || '#10b981');
  applyStaticIcons();
  applyLogos();
  updateWindowIcon();
  applyLang();
  bindEvents();
  render(true);

  refreshDiscordStatus();
  setInterval(refreshDiscordStatus, 6000);
  startRunning();
  api.onCoversUpdated(applyCoverUpdate);

  if (state.games.length === 0) await runScan();
  else silentRescan(); // every launch: refresh installs/uninstalls in the background

  // First-run: ask about autostart, then run the guided tour.
  if (!state.settings.onboarded) {
    await askStartup();
    await runOnboarding();
    state.settings = await api.setSettings({ onboarded: true });
  }
}

function applyAccent(color) {
  document.documentElement.style.setProperty('--accent', color);
}

// --- Logo colour & shape ---
const LOGO_SHAPES = ['hexagon', 'circle', 'squircle', 'diamond', 'shield'];

function hx(c) {
  c = c.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
}
const isLight = (c) => { const [r, g, b] = hx(c); return 0.299 * r + 0.587 * g + 0.114 * b > 175; };
const logoShape = () => state.settings.logoShape || 'hexagon';

function logoShapeMarkup(shape, fill) {
  switch (shape) {
    case 'circle': return `<circle cx="256" cy="256" r="226" fill="${fill}"/>`;
    case 'squircle': return `<rect x="40" y="40" width="432" height="432" rx="116" fill="${fill}"/>`;
    case 'diamond': return `<rect x="92" y="92" width="328" height="328" rx="58" fill="${fill}" transform="rotate(45 256 256)"/>`;
    case 'shield': return `<path d="M256 28 L452 96 V270 C452 374 374 452 256 484 C138 452 60 374 60 270 V96 Z" fill="${fill}"/>`;
    default: return `<polygon points="256,30 452,143 452,369 256,482 60,369 60,143" fill="${fill}"/>`;
  }
}

const LOGO_SYMBOLS = ['play', 'gamepad', 'bolt', 'star', 'heart', 'letterA'];
const logoSymbol = () => state.settings.logoSymbol || 'play';

function symbolMarkup(sym, fill, play) {
  switch (sym) {
    case 'gamepad':
      return `<g transform="translate(2 -42)"><path d="M196 222h120c40 0 64 28 70 66l8 44c5 26-14 46-40 46-16 0-30-9-37-24l-8-18H203l-8 18c-7 15-21 24-37 24-26 0-45-20-40-46l8-44c6-38 30-66 70-66z" fill="${play}"/><g fill="${fill}"><rect x="180" y="291" width="12" height="34" rx="5"/><rect x="169" y="302" width="34" height="12" rx="5"/><circle cx="324" cy="294" r="8"/><circle cx="343" cy="313" r="8"/><circle cx="305" cy="313" r="8"/></g></g>`;
    case 'bolt':
      return `<path d="M290 146 L184 292 H248 L222 372 L334 220 H268 Z" fill="${play}" stroke="${play}" stroke-width="20" stroke-linejoin="round" stroke-linecap="round"/>`;
    case 'star':
      return `<path d="M256 150l33 71 78 10-57 54 14 77-68-37-68 37 14-77-57-54 78-10z" fill="${play}" stroke="${play}" stroke-width="16" stroke-linejoin="round"/>`;
    case 'heart':
      return `<path d="M256 360C148 288 150 196 212 184c30-6 44 22 44 22s14-28 44-22c62 12 64 104-44 176z" fill="${play}" stroke="${play}" stroke-width="14" stroke-linejoin="round"/>`;
    case 'letterA':
      return `<path d="M204 332 L256 180 L308 332 M226 286 H286" fill="none" stroke="${play}" stroke-width="29" stroke-linejoin="round" stroke-linecap="round"/>`;
    default:
      return `<path d="M212 178 L212 334 L352 256 Z" fill="${play}" stroke="${play}" stroke-width="32" stroke-linejoin="round" stroke-linecap="round"/>`;
  }
}

function logoInner(shape, fill, play, symbol) {
  return logoShapeMarkup(shape, fill) + symbolMarkup(symbol || 'play', fill, play);
}

function applyLogo(color) {
  document.documentElement.style.setProperty('--logo', color);
  document.documentElement.style.setProperty('--logo-play', isLight(color) ? '#16171c' : '#ffffff');
}

function logoSvg() {
  return `<svg viewBox="0 0 512 512" class="logo-svg" xmlns="http://www.w3.org/2000/svg">${logoInner(logoShape(), 'var(--logo)', 'var(--logo-play)', logoSymbol())}</svg>`;
}

function applyLogos() {
  document.querySelectorAll('[data-logo]').forEach((e) => { e.innerHTML = logoSvg(); });
}

// Rasterize the logo to a PNG and push it to the window + taskbar icon (live,
// no Python needed). Re-run on every launch so the icon persists.
async function updateWindowIcon() {
  try {
    const color = state.settings.logo || '#10b981';
    const play = isLight(color) ? '#16171c' : '#ffffff';
    const svg = `<svg width="256" height="256" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">${logoInner(logoShape(), color, play, logoSymbol())}</svg>`;
    const dataUrl = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const cv = document.createElement('canvas');
        cv.width = 256; cv.height = 256;
        cv.getContext('2d').drawImage(img, 0, 0, 256, 256);
        resolve(cv.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
      img.src = 'data:image/svg+xml,' + encodeURIComponent(svg);
    });
    if (dataUrl) api.setIcon(dataUrl);
  } catch { /* ignore */ }
}

async function setLogoShape(shape) {
  state.settings = await api.setSettings({ logoShape: shape });
  applyLogos();
  updateWindowIcon();
  buildSettings();
}

async function setLogoSymbol(sym) {
  state.settings = await api.setSettings({ logoSymbol: sym });
  applyLogos();
  updateWindowIcon();
  buildSettings();
}

function applyStaticIcons() {
  document.querySelectorAll('[data-icon]').forEach((e) => { e.innerHTML = icon(e.dataset.icon); });
}

function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((e) => { e.textContent = t(e.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach((e) => { e.placeholder = t(e.dataset.i18nPh); });
  document.querySelectorAll('[data-i18n-title]').forEach((e) => { e.title = t(e.dataset.i18nTitle); });
  $('#sort').value = state.sort;
  if (!$('#scan-overlay').hidden) { /* keep current scan text */ } else $('#scan-text').textContent = t('scanning');
  render();
  if (!$('#settings-modal').hidden) buildSettings();
}

/* ------------------------------ Rendering ------------------------------ */
function visibleGames() {
  let list = state.games.filter((g) => !g.hidden);
  if (state.filter === 'favorites') list = list.filter((g) => g.favorite);
  else if (state.filter !== 'all') list = list.filter((g) => g.source === state.filter);

  if (state.search.trim()) {
    const q = state.search.trim().toLocaleLowerCase('tr');
    list = list.filter((g) => displayTitle(g).toLocaleLowerCase('tr').includes(q));
  }

  const by = {
    title: (a, b) => displayTitle(a).localeCompare(displayTitle(b), lang),
    recent: (a, b) => (b.addedAt || 0) - (a.addedAt || 0),
    played: (a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0),
  };
  return list.sort(by[state.sort] || by.title);
}

function render(animate) {
  renderNav();
  renderGrid(animate);
}

function renderNav() {
  const nav = $('#nav');
  nav.innerHTML = '';
  const active = state.filter;
  const live = state.games.filter((g) => !g.hidden);

  nav.appendChild(navItem('all', 'grid', t('allGames'), live.length, active));
  nav.appendChild(navItem('favorites', 'star', t('favorites'), live.filter((g) => g.favorite).length, active));

  let sectionAdded = false;
  for (const s of NAV_SOURCES) {
    const count = live.filter((g) => g.source === s.key).length;
    if (count === 0) continue;
    if (!sectionAdded) { nav.appendChild(el('div', 'nav-section', t('sourcesSection'))); sectionAdded = true; }
    nav.appendChild(navItem(s.key, s.icon, t('src_' + s.key), count, active));
  }
}

function navItem(key, iconName, label, count, active) {
  const item = el('div', 'nav-item' + (key === active ? ' active' : ''));
  item.innerHTML = `<span class="ico">${icon(iconName)}</span><span class="nav-label">${esc(label)}</span><span class="nav-count">${count}</span>`;
  item.onclick = () => { state.filter = key; render(true); };
  return item;
}

function viewLabel() {
  if (state.filter === 'all') return t('allGames');
  if (state.filter === 'favorites') return t('favorites');
  return t('src_' + state.filter);
}

function renderGrid(animate) {
  const grid = $('#grid');
  const empty = $('#empty');
  const games = visibleGames();

  $('#view-title').textContent = viewLabel();
  $('#view-count').textContent = games.length ? t('gamesCount', { n: games.length }) : '';
  grid.innerHTML = '';

  if (state.games.filter((g) => !g.hidden).length === 0) {
    grid.hidden = true; empty.hidden = false; return;
  }
  empty.hidden = true; grid.hidden = false;

  if (games.length === 0) {
    grid.appendChild(el('div', 'folder-empty', t('noGamesInView')));
    return;
  }
  games.forEach((g, i) => {
    const cd = card(g);
    if (animate) { cd.classList.add('enter'); cd.style.animationDelay = Math.min(i, 16) * 0.028 + 's'; }
    grid.appendChild(cd);
  });
}

const coverUrl = (g) => g.customCover || g.localCover || g.cover || g.autoCover || null;
const gameProcs = (g) => (g.exeNames && g.exeNames.length ? g.exeNames : g.exeName ? [g.exeName] : []);
const isRunning = (g) => {
  if (g.source === 'steam' && state.runningSteam.has(g.id.slice(6))) return true;
  if (gameProcs(g).some((n) => state.running.has(n))) return true;
  if (g.installDir) {
    const d = g.installDir.toLowerCase() + '\\';
    if (state.runningPaths.some((p) => p.startsWith(d))) return true;
  }
  return false;
};

function card(g) {
  const c = el('div', 'card' + (g.missing ? ' missing' : ''));
  c.dataset.id = g.id;
  const title = esc(displayTitle(g));

  const thumb = el('div', 'thumb');
  const cover = coverUrl(g);

  if (cover) {
    const img = el('img', 'cover');
    img.alt = title; img.loading = 'lazy'; img.src = cover;
    img.onerror = () => {
      if (g.coverFallback && img.src !== g.coverFallback) img.src = g.coverFallback;
      else { img.remove(); thumb.prepend(placeholder(g)); }
    };
    thumb.appendChild(img);
  } else {
    thumb.appendChild(placeholder(g));
  }

  thumb.appendChild(el('div', 'card-overlay', `<div class="play-btn">${icon('play')}</div><div class="close-btn-center" title="${esc(t('closeGameTip'))}">${icon('close')}</div>`));
  if (g.favorite) thumb.appendChild(el('div', 'card-fav', icon('starFill')));

  const menuBtn = el('button', 'card-menu', icon('dots'));
  menuBtn.onclick = (e) => {
    e.stopPropagation();
    const r = menuBtn.getBoundingClientRect();
    openMenu(g, r.right - 196, r.bottom + 6);
  };
  thumb.appendChild(menuBtn);

  // Green dot marks a running game; the center button becomes a red × that
  // closes it (instead of the green play).
  thumb.appendChild(el('div', 'card-run-dot'));
  if (isRunning(g)) c.classList.add('running');

  c.appendChild(thumb);
  c.appendChild(el('div', 'card-title', title));

  c.onclick = () => { if (c.classList.contains('running')) closeGameAction(g); else launch(g); };
  c.oncontextmenu = (e) => { e.preventDefault(); openMenu(g, e.clientX, e.clientY); };
  return c;
}

// Brand-aware themes turn a cover-less game (Minecraft, Xbox, launchers…) into a
// rich full-bleed coloured tile instead of a small logo floating on grey.
const COVER_THEMES = [
  { re: /minecraft|mojang/i, c1: '#74b62f', c2: '#26401a' },
  { re: /faceit/i, c1: '#ff5b1a', c2: '#2a1206' },
  { re: /valorant/i, c1: '#ff4655', c2: '#241016' },
  { re: /league of legends|teamfight|\btft\b|\blol\b/i, c1: '#1ba0e2', c2: '#0a1f2e' },
  { re: /riot/i, c1: '#d5383b', c2: '#2a1012' },
  { re: /fortnite|epic\s*games/i, c1: '#8a4bff', c2: '#191331' },
  { re: /roblox/i, c1: '#e8403a', c2: '#241313' },
  { re: /battle\.?net|blizzard|call of duty|overwatch|diablo|hearthstone/i, c1: '#1c8fe0', c2: '#07141f' },
  { re: /discord/i, c1: '#5865f2', c2: '#181a2e' },
  { re: /xbox|game\s*pass/i, c1: '#16a34a', c2: '#082013' },
  { re: /steam/i, c1: '#3a6fb0', c2: '#0c1722' },
  { re: /origin|battlefield|apex|\bea\s/i, c1: '#ff5a36', c2: '#241010' },
  { re: /ubisoft|uplay|assassin|rainbow six/i, c1: '#2aa9e0', c2: '#0a1722' },
  { re: /gog|cd projekt|cyberpunk|witcher/i, c1: '#b06bff', c2: '#1a1230' },
];

function coverTheme(g) {
  const hay = `${g.title || ''} ${g.id || ''}`;
  for (const th of COVER_THEMES) if (th.re.test(hay)) return th;
  const hue = hash(g.id) % 360;
  return { c1: `hsl(${hue} 44% 36%)`, c2: `hsl(${hue} 40% 12%)` };
}

// Hand-built SVG key art for popular games that ship no usable cover on disk —
// Minecraft only stores a tiny Mojang splash, so we draw a proper full-bleed tile.
function mcCover() {
  return `<svg viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">
  <defs>
    <linearGradient id="mcsky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#6fb13f"/><stop offset=".44" stop-color="#356126"/><stop offset="1" stop-color="#10200c"/>
    </linearGradient>
    <pattern id="mcgrid" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M8 0H0V8" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="80" height="120" fill="url(#mcsky)"/>
  <rect width="80" height="120" fill="url(#mcgrid)"/>
  <g transform="translate(12,23)">
    <rect width="56" height="56" fill="#64ad32"/>
    <g fill="#74bf3c"><rect x="0" y="0" width="7" height="7"/><rect x="35" y="7" width="7" height="7"/><rect x="49" y="14" width="7" height="7"/><rect x="14" y="49" width="7" height="7"/></g>
    <g fill="#55961e"><rect x="49" y="0" width="7" height="7"/><rect x="0" y="49" width="7" height="7"/><rect x="7" y="35" width="7" height="7"/></g>
    <g fill="#14300d">
      <rect x="7" y="7" width="14" height="14"/><rect x="35" y="7" width="14" height="14"/>
      <rect x="21" y="21" width="14" height="7"/><rect x="14" y="28" width="28" height="14"/>
      <rect x="14" y="42" width="7" height="7"/><rect x="35" y="42" width="7" height="7"/>
    </g>
  </g>
  <g>
    <rect x="0" y="103" width="80" height="5" fill="#6cb733"/>
    <rect x="0" y="108" width="80" height="12" fill="#6a4a2b"/>
    <g fill="#583b21"><rect x="7" y="111" width="4" height="4"/><rect x="27" y="114" width="4" height="3"/><rect x="49" y="110" width="4" height="4"/><rect x="67" y="113" width="4" height="4"/></g>
    <g fill="#7c5832"><rect x="17" y="113" width="3" height="3"/><rect x="39" y="111" width="3" height="3"/><rect x="59" y="115" width="3" height="3"/></g>
  </g>
</svg>`;
}

// The Launcher (Java) gets the iconic isometric grass block, so it reads as
// clearly distinct from the Bedrock "for Windows" creeper tile.
function mcGrassCover() {
  return `<svg viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges">
  <defs>
    <linearGradient id="mcsky2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4f8d34"/><stop offset=".45" stop-color="#294620"/><stop offset="1" stop-color="#0f1109"/>
    </linearGradient>
    <pattern id="mcgrid2" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M8 0H0V8" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="80" height="120" fill="url(#mcsky2)"/>
  <rect width="80" height="120" fill="url(#mcgrid2)"/>
  <g>
    <polygon points="40,56 64,42 64,68 40,82" fill="#7a5530"/>
    <polygon points="40,56 16,42 16,68 40,82" fill="#5e4124"/>
    <polygon points="40,56 64,42 64,47 40,61" fill="#57a02d"/>
    <polygon points="40,56 16,42 16,47 40,61" fill="#4a8a26"/>
    <polygon points="40,28 64,42 40,56 16,42" fill="#6cbf3a"/>
    <g fill="#7bce45"><rect x="37" y="39" width="5" height="3"/><rect x="45" y="45" width="4" height="3"/></g>
    <g fill="#5fae31"><rect x="29" y="44" width="4" height="3"/><rect x="48" y="40" width="4" height="3"/></g>
    <g fill="#664626"><rect x="50" y="58" width="4" height="4"/><rect x="57" y="62" width="3" height="3"/></g>
    <g fill="#4a3219"><rect x="24" y="58" width="4" height="4"/><rect x="30" y="64" width="3" height="3"/></g>
  </g>
</svg>`;
}

function generatedCover(g) {
  const hay = `${g.title || ''} ${g.id || ''}`.toLowerCase();
  if (/minecraft/.test(hay)) return /launcher/.test(hay) ? mcGrassCover() : mcCover();
  return null;
}

function placeholder(g) {
  const ph = el('div', 'card-ph');
  const gen = generatedCover(g);
  if (gen) { ph.classList.add('gen'); ph.innerHTML = gen; return ph; }
  const { c1, c2 } = coverTheme(g);
  ph.style.setProperty('--c1', c1);
  ph.style.setProperty('--c2', c2);
  // Real store artwork (Xbox/Minecraft logos, launcher icons) shown large.
  if (g.iconImage) {
    ph.classList.add('has-art');
    ph.innerHTML = `<span class="ph-glow"></span><img class="ph-art" src="${esc(g.iconImage)}" alt="">`;
    return ph;
  }
  const initials = displayTitle(g).replace(/[^\p{L}\p{N} ]/gu, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
  ph.innerHTML = `<span class="ph-glow"></span><div class="ph-icon" data-icon-for="${esc(g.id)}">${esc(initials)}</div>`;
  iconObserver.observe(ph);
  return ph;
}

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (str.charCodeAt(i) + ((h << 5) - h)) | 0;
  return Math.abs(h);
}

// Lazily fetch real executable icons for placeholder tiles as they scroll in.
const iconObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const ph = entry.target;
    iconObserver.unobserve(ph);
    const box = ph.querySelector('.ph-icon');
    const id = box && box.dataset.iconFor;
    if (!id) continue;
    api.getIcon(id).then((dataUrl) => { if (dataUrl) box.innerHTML = `<img src="${dataUrl}" alt="">`; });
  }
}, { root: $('#grid'), rootMargin: '250px' });

/* ------------------------------- Actions ------------------------------- */
async function launch(g) {
  toast(t('launching', { t: displayTitle(g) }));
  try {
    await api.launch(g.id);
    const local = state.games.find((x) => x.id === g.id);
    if (local) { local.lastPlayed = Date.now(); local.playCount = (local.playCount || 0) + 1; }
    setTimeout(() => refreshRunning(true), 1500); // surface the running indicator promptly
  } catch (err) {
    toast(t('launchFailed', { e: err.message }), 'error');
  }
}

async function runScan() {
  showScan(true, t('scanning'));
  const stop = api.onScanProgress((key) => { $('#scan-text').textContent = t('scanningSource', { s: scanLabel(key) }); });
  try {
    const data = await api.scan();
    state.games = data.games || [];
    state.settings = data.settings || state.settings;
    render(true);
    toast(t('foundGames', { n: state.games.filter((g) => !g.hidden).length }), 'success');
  } catch (err) {
    toast(t('scanError', { e: err.message }), 'error');
  } finally {
    stop && stop();
    showScan(false);
  }
}

function scanLabel(key) {
  if (key === 'folders') return t('optFolders');
  return t('src_' + key) || key;
}

function showScan(on, text) {
  if (text) $('#scan-text').textContent = text;
  $('#scan-overlay').hidden = !on;
}

async function addGame() {
  const g = await api.addGame();
  if (g) { await refresh(); toast(t('addedToast', { t: displayTitle(g) }), 'success'); }
}

async function refreshDiscordStatus() {
  try {
    const open = await api.discordStatus();
    state.discordOpen = open;
    $('#btn-discord').classList.toggle('running', open);
    if (!open) $('#btn-discord-close').hidden = true;
  } catch { /* ignore */ }
}

async function onDiscordClick() {
  // If Discord is already running, reveal the close (×) button instead.
  if (state.discordOpen) {
    const cb = $('#btn-discord-close');
    cb.hidden = !cb.hidden;
    return;
  }
  toast(t('openingDiscord'));
  $('#btn-discord-close').hidden = true;
  const ok = await api.openDiscord();
  if (!ok) { toast(t('discordFailed'), 'error'); return; }
  setTimeout(refreshDiscordStatus, 2000);
  setTimeout(refreshDiscordStatus, 4500);
}

async function closeDiscordAction() {
  $('#btn-discord-close').hidden = true;
  await api.closeDiscord();
  state.discordOpen = false;
  $('#btn-discord').classList.remove('running');
  toast(t('discordClosed'));
  setTimeout(refreshDiscordStatus, 1500);
}

/* ---------------------- Running games + companions --------------------- */
// Running-state polling is gated on window focus/visibility, so we never spawn
// process probes while the user is in-game (launcher hidden in the tray). Each
// tick does a cheap name + Steam-registry check; every 4th tick also scans
// process paths to catch Steam/Overwolf games (e.g. Aimlabs) that skip the flag.
let runTimer = null;
let runTick = 0;
let runBusy = false;

async function refreshRunning(withPaths = false) {
  if (runBusy) return;
  runBusy = true;
  try {
    const r = await api.runningProcs({ withPaths });
    state.running = new Set(r.procs || []);
    state.runningSteam = new Set(r.steam || []);
    if (Array.isArray(r.paths)) state.runningPaths = r.paths; // keep last when omitted
    updateRunningIndicators();
  } catch { /* ignore */ } finally {
    runBusy = false;
  }
}

function scheduleRunning() {
  clearTimeout(runTimer);
  if (document.hidden || !document.hasFocus()) return; // don't poll what nobody sees
  runTimer = setTimeout(() => {
    runTick += 1;
    refreshRunning(runTick % 4 === 0);
    scheduleRunning();
  }, 5000);
}

function startRunning() {
  refreshRunning(true);  // full, accurate state the moment the window is shown
  scheduleRunning();
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) clearTimeout(runTimer); else startRunning();
});
window.addEventListener('focus', startRunning);
window.addEventListener('blur', () => clearTimeout(runTimer));

// A SteamGridDB cover arrived from the main process — store it and refresh the
// grid (debounced, so a burst of covers triggers a single re-render).
let coverReloadTimer = null;
function applyCoverUpdate(upd) {
  if (upd && upd.id) {
    const g = state.games.find((x) => x.id === upd.id);
    if (g) g.autoCover = upd.cover;
  }
  clearTimeout(coverReloadTimer);
  coverReloadTimer = setTimeout(() => renderGrid(), 400);
}

function updateRunningIndicators() {
  document.querySelectorAll('.card').forEach((c) => {
    const g = state.games.find((x) => x.id === c.dataset.id);
    c.classList.toggle('running', !!g && isRunning(g));
  });
}

async function closeGameAction(g) {
  await api.closeGame(g.id);
  // Optimistically clear the game and its companions from the running set.
  const clearPaths = (x) => {
    if (!x.installDir) return;
    const d = x.installDir.toLowerCase() + '\\';
    state.runningPaths = state.runningPaths.filter((p) => !p.startsWith(d));
  };
  for (const n of gameProcs(g)) state.running.delete(n);
  if (g.source === 'steam') state.runningSteam.delete(g.id.slice(6));
  clearPaths(g);
  for (const cid of g.companions || []) {
    const c = state.games.find((x) => x.id === cid);
    if (c) { for (const n of gameProcs(c)) state.running.delete(n); clearPaths(c); }
  }
  updateRunningIndicators();
  toast(t('gameClosed', { t: displayTitle(g) }));
  setTimeout(() => refreshRunning(true), 1500);
}

function miniInitials(g) {
  return displayTitle(g).replace(/[^\p{L}\p{N} ]/gu, '').split(/\s+/).filter(Boolean)
    .slice(0, 1).map((w) => w[0].toUpperCase()).join('') || '?';
}

// Small thumbnail (cover, store art, or extracted icon) for a game in a list.
function miniThumb(g) {
  const box = el('div', 'mini-thumb');
  const cover = coverUrl(g);
  if (cover) {
    const img = new Image();
    img.src = cover;
    img.onerror = () => { img.remove(); box.textContent = miniInitials(g); };
    box.appendChild(img);
  } else if (g.iconImage) {
    const img = new Image();
    img.className = 'mini-art';
    img.src = g.iconImage;
    box.appendChild(img);
  } else {
    box.textContent = miniInitials(g);
    api.getIcon(g.id).then((d) => {
      if (d) { box.textContent = ''; const im = new Image(); im.className = 'mini-art'; im.src = d; box.appendChild(im); }
    });
  }
  return box;
}

// Pick companion apps that should launch alongside this game.
function openCompanionPicker(g) {
  const others = state.games
    .filter((x) => x.id !== g.id && !x.hidden)
    .sort((a, b) => displayTitle(a).localeCompare(displayTitle(b), lang));
  const selected = new Set(g.companions || []);

  const backdrop = el('div', 'modal-backdrop');
  const modal = el('div', 'modal');

  const head = el('div', 'modal-head');
  head.innerHTML = `<h2>${esc(t('companionTitle'))}</h2>`;
  const closeX = el('button', 'icon-btn', icon('close'));
  closeX.onclick = () => backdrop.remove();
  head.appendChild(closeX);
  modal.appendChild(head);

  const body = el('div', 'modal-body');
  const hint = el('p', 'hint', t('companionHint'));
  hint.style.margin = '0 0 14px';
  body.appendChild(hint);

  const search = el('label', 'search modal-search');
  search.innerHTML = `<span class="ico">${icon('search')}</span><input type="text" placeholder="${esc(t('companionSearch'))}" spellcheck="false">`;
  body.appendChild(search);

  const list = el('div', 'companion-list');
  const rows = [];
  for (const o of others) {
    const row = el('div', 'companion-row' + (selected.has(o.id) ? ' selected' : ''));
    row.appendChild(miniThumb(o));
    row.appendChild(el('span', 'companion-name', esc(displayTitle(o))));
    row.appendChild(el('span', 'companion-check', icon('check')));
    row.onclick = () => {
      if (selected.has(o.id)) { selected.delete(o.id); row.classList.remove('selected'); }
      else { selected.add(o.id); row.classList.add('selected'); }
    };
    rows.push({ el: row, title: displayTitle(o).toLocaleLowerCase('tr') });
    list.appendChild(row);
  }
  body.appendChild(list);
  modal.appendChild(body);

  search.querySelector('input').oninput = (e) => {
    const q = e.target.value.trim().toLocaleLowerCase('tr');
    for (const r of rows) r.el.style.display = !q || r.title.includes(q) ? '' : 'none';
  };

  const foot = el('div', 'modal-foot');
  const saveBtn = el('button', 'btn btn-primary', esc(t('save')));
  saveBtn.onclick = async () => {
    const companions = [...selected];
    await api.updateGame(g.id, { companions });
    g.companions = companions;
    backdrop.remove();
  };
  foot.appendChild(saveBtn);
  modal.appendChild(foot);

  backdrop.appendChild(modal);
  backdrop.onclick = (e) => { if (e.target === backdrop) backdrop.remove(); };
  document.body.appendChild(backdrop);
  setTimeout(() => search.querySelector('input').focus(), 60);
}

async function refresh() {
  const data = await api.getState();
  state.games = data.games || [];
  state.settings = data.settings || state.settings;
  render();
}

// Background re-scan on every launch: picks up newly installed / uninstalled
// games silently (no overlay), preserving favorites & other user data.
async function silentRescan() {
  try {
    const before = state.games.map((g) => g.id).sort().join('|');
    const data = await api.scan();
    state.games = data.games || [];
    state.settings = data.settings || state.settings;
    if (state.games.map((g) => g.id).sort().join('|') !== before) render();
  } catch { /* ignore */ }
}

/* ---------------------------- Context menu ----------------------------- */
function openMenu(g, x, y) {
  const menu = $('#ctx');
  menu.innerHTML = '';
  const add = (label, ic, fn, cls) => {
    const item = el('div', 'menu-item' + (cls ? ' ' + cls : ''));
    item.innerHTML = `<span class="ico">${icon(ic)}</span><span>${esc(label)}</span>`;
    item.onclick = () => { closeMenu(); fn(); };
    menu.appendChild(item);
  };
  const sep = () => menu.appendChild(el('div', 'menu-sep'));

  add(t('launch'), 'play', () => launch(g));
  add(g.favorite ? t('removeFav') : t('addFav'), 'star', () => toggleFavorite(g));
  sep();
  add(t('rename'), 'edit', () => renameGame(g));
  add(t('changeCover'), 'image', () => changeCover(g));
  add(t('launchWith'), 'together', () => openCompanionPicker(g));
  if (g.installDir) add(t('openFolder'), 'folder', () => api.openInstallDir(g.id));
  sep();
  add(t('hide'), 'eyeOff', () => hideGame(g));
  add(g.source === 'manual' ? t('remove') : t('removeFromLib'), 'trash', () => removeGame(g), 'danger');

  menu.hidden = false;
  menu.style.left = Math.max(8, Math.min(x, window.innerWidth - 204)) + 'px';
  menu.style.top = Math.max(8, Math.min(y, window.innerHeight - menu.offsetHeight - 8)) + 'px';
}
function closeMenu() { $('#ctx').hidden = true; }

async function toggleFavorite(g) { await api.updateGame(g.id, { favorite: !g.favorite }); g.favorite = !g.favorite; render(); }
async function hideGame(g) { await api.updateGame(g.id, { hidden: true }); g.hidden = true; render(); toast(t('hiddenToast', { t: displayTitle(g) })); }
async function removeGame(g) { await api.removeGame(g.id); state.games = state.games.filter((x) => x.id !== g.id); render(); toast(t('removedToast', { t: displayTitle(g) })); }
async function renameGame(g) {
  const name = prompt(t('renamePrompt'), displayTitle(g));
  if (name === null) return;
  const v = name.trim();
  await api.updateGame(g.id, { customTitle: v || null });
  g.customTitle = v || null; render();
}
async function changeCover(g) {
  const updated = await api.pickCover(g.id);
  if (updated) { Object.assign(g, updated); render(); }
}

/* ------------------------------ Settings ------------------------------- */
function openSettings() { buildSettings(); $('#settings-modal').hidden = false; }
function closeSettings() { $('#settings-modal').hidden = true; }

function buildSettings() {
  const body = $('#settings-body');
  const s = state.settings;
  const sources = s.sources || {};
  body.innerHTML = '';

  // Sources
  const g1 = el('div', 'setting-group');
  g1.appendChild(el('h3', null, esc(t('settingsSources'))));
  for (const src of [['steam', 'src_steam'], ['epic', 'src_epic'], ['xbox', 'src_xbox'], ['shortcut', 'src_shortcut'], ['folders', 'optFolders']]) {
    const row = el('div', 'toggle-row');
    const checked = sources[src[0]] !== false ? 'checked' : '';
    row.innerHTML = `<label>${esc(t(src[1]))}</label><span class="switch"><input type="checkbox" data-src="${src[0]}" ${checked}><span class="track"></span></span>`;
    g1.appendChild(row);
  }
  body.appendChild(g1);

  // Folders
  const g2 = el('div', 'setting-group');
  g2.appendChild(el('h3', null, esc(t('settingsFolders'))));
  const list = el('div', 'folder-list');
  const folders = s.scanFolders || [];
  if (folders.length === 0) list.appendChild(el('div', 'folder-empty', esc(t('noFolders'))));
  else for (const f of folders) {
    const item = el('div', 'folder-item');
    item.innerHTML = `<span class="path" title="${esc(f)}">${esc(f)}</span><button class="remove">${icon('close')}</button>`;
    item.querySelector('.remove').onclick = async () => { state.settings = await api.removeFolder(f); buildSettings(); };
    list.appendChild(item);
  }
  g2.appendChild(list);
  const addBtn = el('button', 'btn', `<span class="ico">${icon('plus')}</span>${esc(t('addFolderBtn'))}`);
  addBtn.onclick = async () => { state.settings = await api.addFolder(); buildSettings(); };
  g2.appendChild(addBtn);
  body.appendChild(g2);

  // Language
  const g3 = el('div', 'setting-group');
  g3.appendChild(el('h3', null, esc(t('settingsLanguage'))));
  const langSel = el('select', 'select select-full');
  for (const [code, name] of [['tr', 'Türkçe'], ['en', 'English'], ['de', 'Deutsch'], ['ja', '日本語'], ['ko', '한국어'], ['es', 'Español']]) {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = name;
    if (code === lang) opt.selected = true;
    langSel.appendChild(opt);
  }
  langSel.onchange = () => setLang(langSel.value);
  g3.appendChild(langSel);
  body.appendChild(g3);

  // Startup
  const gStart = el('div', 'setting-group');
  gStart.appendChild(el('h3', null, esc(t('settingsStartup'))));
  const startRow = el('div', 'toggle-row');
  startRow.innerHTML = `<label>${esc(t('autostartLabel'))}</label><span class="switch"><input type="checkbox" ${s.autostart ? 'checked' : ''}><span class="track"></span></span>`;
  startRow.querySelector('input').onchange = async (e) => { state.settings = await api.setAutostart(e.target.checked); };
  gStart.appendChild(startRow);
  body.appendChild(gStart);

  // Accent
  const g4 = el('div', 'setting-group');
  g4.appendChild(el('h3', null, esc(t('settingsAccent'))));
  const sw = el('div', 'swatches');
  for (const c of ACCENTS) {
    const dot = el('div', 'swatch' + ((s.accent || '#8b5cf6').toLowerCase() === c ? ' active' : ''));
    dot.style.background = c;
    dot.onclick = async () => { applyAccent(c); state.settings = await api.setSettings({ accent: c }); buildSettings(); };
    sw.appendChild(dot);
  }
  g4.appendChild(sw);
  body.appendChild(g4);

  // Logo color
  const gL = el('div', 'setting-group');
  gL.appendChild(el('h3', null, esc(t('settingsLogo'))));
  const lsw = el('div', 'swatches');
  for (const c of LOGO_COLORS) {
    const dot = el('div', 'swatch' + ((s.logo || '#10b981').toLowerCase() === c ? ' active' : ''));
    dot.style.background = c;
    dot.onclick = async () => { applyLogo(c); state.settings = await api.setSettings({ logo: c }); updateWindowIcon(); buildSettings(); };
    lsw.appendChild(dot);
  }
  gL.appendChild(lsw);
  body.appendChild(gL);

  // Logo shape
  const gSh = el('div', 'setting-group');
  gSh.appendChild(el('h3', null, esc(t('settingsLogoShape'))));
  const shapes = el('div', 'shapes');
  for (const sh of LOGO_SHAPES) {
    const btn = el('button', 'shape-btn' + (logoShape() === sh ? ' active' : ''));
    btn.innerHTML = `<svg viewBox="0 0 512 512">${logoInner(sh, 'var(--logo)', 'var(--logo-play)', logoSymbol())}</svg>`;
    btn.onclick = () => setLogoShape(sh);
    shapes.appendChild(btn);
  }
  gSh.appendChild(shapes);
  body.appendChild(gSh);

  // Logo symbol
  const gSym = el('div', 'setting-group');
  gSym.appendChild(el('h3', null, esc(t('settingsLogoSymbol'))));
  const syms = el('div', 'shapes');
  for (const sym of LOGO_SYMBOLS) {
    const btn = el('button', 'shape-btn' + (logoSymbol() === sym ? ' active' : ''));
    btn.innerHTML = `<svg viewBox="0 0 512 512">${logoInner(logoShape(), 'var(--logo)', 'var(--logo-play)', sym)}</svg>`;
    btn.onclick = () => setLogoSymbol(sym);
    syms.appendChild(btn);
  }
  gSym.appendChild(syms);
  body.appendChild(gSym);

  // Rescan
  // SteamGridDB cover art — optional, the user's own key, stored locally only.
  const gCov = el('div', 'setting-group');
  gCov.appendChild(el('h3', null, esc(t('settingsCovers'))));
  const keyInput = el('input', 'text-field');
  keyInput.type = 'text';
  keyInput.placeholder = t('sgdbPlaceholder');
  keyInput.value = s.sgdbKey || '';
  keyInput.spellcheck = false;
  keyInput.autocomplete = 'off';
  keyInput.onchange = async () => { state.settings = await api.setSettings({ sgdbKey: keyInput.value.trim() }); };
  gCov.appendChild(keyInput);
  gCov.appendChild(el('p', 'hint', t('sgdbHint')));
  body.appendChild(gCov);

  const g5 = el('div', 'setting-group');
  const rescan = el('button', 'btn btn-primary', `<span class="ico">${icon('refresh')}</span>${esc(t('rescanNow'))}`);
  rescan.onclick = () => { closeSettings(); runScan(); };
  g5.appendChild(rescan);
  g5.appendChild(el('p', 'hint', t('coverHint')));
  body.appendChild(g5);

  // About
  const g6 = el('div', 'setting-group');
  g6.appendChild(el('h3', null, esc(t('settingsAbout'))));
  const about = el('div', 'about');
  about.innerHTML = `<span class="about-logo">${logoSvg()}</span><div><div class="about-name">Arcadia ${APP_VERSION}</div><div class="about-sub">${esc(t('aboutSub'))}</div></div>`;
  g6.appendChild(about);
  body.appendChild(g6);

  // source toggles -> save
  body.querySelectorAll('input[data-src]').forEach((cb) => {
    cb.onchange = async () => { state.settings = await api.setSettings({ sources: { [cb.dataset.src]: cb.checked } }); };
  });
}

async function setLang(code) {
  lang = code;
  state.settings = await api.setSettings({ language: code });
  applyLang();
}

/* --------------------------- First-run flow ---------------------------- */
function askStartup() {
  return new Promise((resolve) => {
    const backdrop = el('div', 'modal-backdrop');
    const modal = el('div', 'modal modal-sm');
    modal.innerHTML = `<div class="modal-head"><h2>${esc(t('startupTitle'))}</h2></div>
      <div class="modal-body">
        <p class="startup-q">${esc(t('startupQuestion'))}</p>
        <div class="toggle-row startup-toggle">
          <label>${esc(t('autostartLabel'))}</label>
          <span class="switch"><input type="checkbox" id="startup-cb"><span class="track"></span></span>
        </div>
      </div>`;
    const foot = el('div', 'modal-foot');
    const goBtn = el('button', 'btn btn-primary', esc(t('onbNext')));
    goBtn.onclick = async () => {
      state.settings = await api.setAutostart(modal.querySelector('#startup-cb').checked);
      backdrop.remove();
      resolve();
    };
    foot.appendChild(goBtn);
    modal.appendChild(foot);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
  });
}

function positionTip(tip, r) {
  tip.style.visibility = 'hidden';
  tip.style.left = '0px';
  tip.style.top = '0px';
  const tw = 300;
  const th = tip.offsetHeight || 150;
  let left = r.left + r.width / 2 - tw / 2;
  left = Math.max(16, Math.min(left, window.innerWidth - tw - 16));
  let top = r.bottom + 14;
  if (top + th > window.innerHeight - 16) top = Math.max(16, r.top - th - 14);
  tip.style.left = left + 'px';
  tip.style.top = top + 'px';
  tip.style.visibility = 'visible';
}

// Guided tour: dim the screen, spotlight a UI element, explain it.
function runOnboarding() {
  const steps = [
    { sel: '#btn-scan', title: t('onbScanT'), text: t('onbScanD') },
    { sel: '.card', title: t('onbCardT'), text: t('onbCardD') },
    { sel: '#btn-discord', title: t('onbDiscordT'), text: t('onbDiscordD') },
    { sel: '#btn-settings', title: t('onbSettingsT'), text: t('onbSettingsD') },
  ].filter((s) => document.querySelector(s.sel));
  if (!steps.length) return Promise.resolve();

  return new Promise((resolve) => {
    const overlay = el('div', 'onb-overlay');
    const spot = el('div', 'onb-spotlight');
    const tip = el('div', 'onb-tip');
    overlay.appendChild(spot);
    overlay.appendChild(tip);
    document.body.appendChild(overlay);

    let i = 0;
    const finish = () => { overlay.remove(); resolve(); };

    function show() {
      const step = steps[i];
      const target = document.querySelector(step.sel);
      if (!target) { finish(); return; }
      const r = target.getBoundingClientRect();
      const pad = 8;
      spot.style.left = r.left - pad + 'px';
      spot.style.top = r.top - pad + 'px';
      spot.style.width = r.width + pad * 2 + 'px';
      spot.style.height = r.height + pad * 2 + 'px';

      const isLast = i === steps.length - 1;
      const dots = steps.map((_, k) => `<span class="${k === i ? 'on' : ''}"></span>`).join('');
      tip.innerHTML = `<div class="onb-title">${esc(step.title)}</div>
        <div class="onb-text">${esc(step.text)}</div>
        <div class="onb-actions">
          <button class="onb-skip">${esc(t('onbSkip'))}</button>
          <div class="onb-dots">${dots}</div>
          <button class="btn btn-primary onb-next">${esc(isLast ? t('onbDone') : t('onbNext'))}</button>
        </div>`;
      positionTip(tip, r);
      tip.querySelector('.onb-next').onclick = () => { i += 1; if (i >= steps.length) finish(); else show(); };
      tip.querySelector('.onb-skip').onclick = finish;
    }

    show();
  });
}

/* ------------------------------- Toasts -------------------------------- */
function toast(msg, type) {
  const el_ = el('div', 'toast' + (type ? ' ' + type : ''), esc(msg));
  $('#toasts').appendChild(el_);
  setTimeout(() => {
    el_.style.transition = 'opacity .3s, transform .3s';
    el_.style.opacity = '0'; el_.style.transform = 'translateX(20px)';
    setTimeout(() => el_.remove(), 300);
  }, 3200);
}

/* ------------------------------- Events -------------------------------- */
function bindEvents() {
  $('#btn-scan').onclick = runScan;
  $('#empty-scan').onclick = runScan;
  $('#btn-add').onclick = addGame;
  $('#btn-discord').onclick = onDiscordClick;
  $('#btn-discord-close').onclick = closeDiscordAction;
  $('#btn-settings').onclick = openSettings;
  $('#settings-close').onclick = closeSettings;
  $('#settings-modal').onclick = (e) => { if (e.target.id === 'settings-modal') closeSettings(); };

  $('#search').oninput = (e) => { state.search = e.target.value; renderGrid(); };
  $('#sort').onchange = async (e) => { state.sort = e.target.value; state.settings = await api.setSettings({ sortBy: state.sort }); renderGrid(); };

  document.addEventListener('click', (e) => { if (!$('#ctx').hidden && !$('#ctx').contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeMenu(); closeSettings(); }
    if (e.key === '/' && document.activeElement !== $('#search')) { e.preventDefault(); $('#search').focus(); }
  });
}

init();
