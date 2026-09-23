'use strict';

const api = window.arcadia;
// Filled from the main process (package.json) so it can never drift.
let APP_VERSION = '';
// True in the Microsoft Store (MSIX) build: updates and startup are Windows'
// job there, so the in-app controls for them are hidden.
let IS_STORE = false;

/* ------------------------------ i18n ----------------------------------- */
const I18N = {
  tr: {
    scan: 'Tara', addGame: 'Oyun Ekle', settings: 'Ayarlar', by: 'Geliştiren',
    sortRating: 'Puana göre', metacriticLabel: 'Metacritic',
    steamListsSection: 'Steam Listeleri', steamListsLabel: 'Steam listelerini göster', steamListsAskTitle: 'Steam listelerin bulundu', steamListsAskText: '{n} liste buldum ({names}). Bunları sol menüye ekleyeyim mi?', steamListsYes: 'Evet, ekle', steamListsNo: 'Hayır', steamListsNone: "Steam'de liste bulunamadı.", steamListsRefresh: 'Listeleri yenile', steamListsHint: "Steam istemcisindeki koleksiyonların okunur. Yalnızca elle eklenmiş oyunlar gelir; Steam'in kendi kural tabanlı (dinamik) eşleşmeleri gelmez.",
    listsSection: 'Listeler', listAddTo: 'Listeye ekle', listNew: 'Yeni liste oluştur…', listNewPrompt: 'Liste adı:', listRenamePrompt: 'Yeni liste adı:', listDelete: 'Listeyi sil', listDeleted: '{n} silindi', listAdded: '{t} → {n}', listRemoved: '{t}, {n} listesinden çıkarıldı', listSteamLocked: "Bu oyun listeye Steam'den geliyor; Arcadia Steam'e yazmaz.",
    listDeleteSteamConfirm: "'{n}' Steam koleksiyonun. Steam'den de (tüm cihazlarından) silinecek. Emin misin?", listDeletedSteam: "{n} Steam'den de silindi", listDeletedSteamPending: "{n} silindi — Steam açık olduğu için Steam'deki koleksiyon, Steam'i kapattığında silinecek.", listSteamApplied: "{n} liste Steam'den de silindi",
    steamPendingInfo: "{n} liste Steam'den silinmeyi bekliyor — Steam tamamen kapandığında uygulanır (pencereyi kapatmak yetmez, Steam tepside çalışmaya devam eder).", steamApplyNow: "Steam'i kapat ve uygula", steamApplyAsk: "Steam şu an açık. Silmeyi hemen uygulamak için Steam'i kapatıp yeniden açayım mı? Açık bir oyun ya da indirme varsa İptal de — Steam'i kendin kapattığında da uygulanır.", steamApplying: "Steam kapatılıyor, liste siliniyor…", steamApplied: "{n} liste Steam'den silindi, Steam yeniden açılıyor", steamBusy: "Steam kapanmadı (açık bir oyun ya da onay bekleyen bir pencere olabilir). Hiçbir şey değiştirilmedi.",
    updStore: 'Arcadia Microsoft Store üzerinden güncellenir; yeni sürümler otomatik gelir.',
    searchPlaceholder: 'Oyun ara…', sortTitle: 'A → Z', sortRecent: 'Son eklenen', sortPlayed: 'Son oynanan',
    emptyTitle: 'Henüz oyun yok', emptyText: 'Bilgisayarındaki oyunları bulmak için taramayı başlat.', emptyScan: 'Oyunları Tara',
    allGames: 'Tüm Oyunlar', favorites: 'Favoriler', sourcesSection: 'Kaynaklar',
    src_steam: 'Steam', src_epic: 'Epic Games', src_xbox: 'Xbox', src_gog: 'GOG', src_ea: 'EA', src_ubisoft: 'Ubisoft Connect', src_shortcut: 'Kısayollar', src_folder: 'Klasör', src_manual: 'Eklenenler',
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
    settingsAccent: 'Vurgu Rengi', settingsLogo: 'Logo Rengi', settingsLogoShape: 'Logo Şekli', settingsLogoSymbol: 'Logo Simgesi', settingsLanguage: 'Dil', rescanNow: 'Şimdi Yeniden Tara', replayTour: 'Tanıtımı tekrar göster',
    coverHint: 'Steam oyunları otomatik kapakla gelir. Diğerlerinde sağ tık → Kapak değiştir ile kendi görselini koyabilirsin.',
    settingsAbout: 'Hakkında', aboutSub: 'Oyun kütüphanen · Geliştiren Samet Ege',
    settingsCovers: 'Kapak Görselleri (SteamGridDB)', sgdbPlaceholder: 'SteamGridDB API anahtarı',
    sgdbHint: 'Steam dışı oyunlara (Minecraft, FACEIT, LoL…) otomatik kapak getirir. Ücretsiz anahtar: steamgriddb.com → Preferences → API. Yapıştırıp yeniden tara.',
    startupTitle: 'Başlangıçta aç', startupQuestion: 'Arcadia, bilgisayar açıldığında otomatik başlasın mı?', startYes: 'Evet, başlat', startNo: 'Hayır',
    settingsStartup: 'Başlangıç', autostartLabel: 'Bilgisayar açılınca başlat', bgNotice: 'Arcadia arka planda çalışmaya devam ediyor',
    accCancelled: '{s} bağlanmadı — giriş tamamlanmadan pencere kapandı.',
    randomGame: 'Rastgele Oyun', randomTitle: 'Ne oynasam?', randomAnother: 'Bunu istemiyorum', randomEmpty: 'Seçilecek oyun yok.', randomPlay: 'Şimdi oyna',
    librarySection: 'Kütüphane', filterNotInstalled: 'Kurulu değil',
    connectAccounts: 'Hesap Bağla',
    settingsAccounts: 'Bağlı Hesaplar', accConnect: 'Bağlan', accDisconnect: 'Çıkış yap',
    accHint: 'Hesabını bağladığında kurulu olmayan oyunların da kütüphanende görünür. Giriş mağazanın kendi sayfasında yapılır; Arcadia şifreni görmez.',
    accLinked: 'Bağlı: {n}', accSync: 'Kütüphaneyi Yenile', accSyncing: '{s} kütüphanesi alınıyor…',
    accExpired: '{s} oturumu doldu, yeniden bağlan.', accFailed: '{s} alınamadı: {e}',
    accConnected: '{s} bağlandı', accDisconnected: '{s} bağlantısı kesildi',
    notInstalled: 'Kurulu değil', installGame: 'Kur', filterInstalled: 'Kurulu', filterOwned: 'Kütüphanem',
    dlCancel: 'İptal', dlStalled: 'Başlatılamadı', dlStalledHint: 'Mağaza kurulumu başlatmadı — iptal edilmiş olabilir.', dlCancelledStore: 'Mağazanın indirme listesi açıldı, oradan durdurabilirsin.',
    downloads: 'İndirmeler', dlEmpty: 'Şu anda indirilen oyun yok.', dlClear: 'Bitenleri temizle',
    dlPending: 'Başlatılıyor…', dlDownloading: 'İndiriliyor', dlInstalling: 'Kuruluyor', dlDone: 'Kuruldu', dlError: 'Hata',
    dlRemove: 'Listeden çıkar', dlOpenClient: 'Mağazada aç', dlStarted: '{t} indirmesi başlatıldı',
    dlNoUrl: 'Bu oyun için kurulum bağlantısı yok.', dlFinished: '{t} kuruldu',
    dlHandoff: 'İndirmeyi mağazanın kendi istemcisi yapar; Arcadia ilerlemeyi buradan gösterir.',
    dlEta: 'kalan {t}', dlXboxNote: 'Microsoft Store ilerleme bilgisi vermiyor; yalnızca bitince görünür.',
    openingStore: 'Mağaza açılıyor…',
    settingsUpdates: 'Güncellemeler', autoUpdateLabel: 'Güncellemeleri otomatik kur',
    autoUpdateHint: 'Açıkken Arcadia yeni sürümü arka planda indirir ve bir sonraki kapanışta kurar. Kapalıyken sadece haber verir.',
    checkUpdate: 'Güncelleme Kontrol Et', updChecking: 'Kontrol ediliyor…', updLatest: 'En güncel sürümü kullanıyorsun.',
    updAvailable: 'Yeni sürüm bulundu: {v}', updDownloading: 'İndiriliyor… %{p}', updDownloaded: '{v} indirildi — kurmaya hazır',
    updInstall: 'Yeniden başlat ve kur', updError: 'Güncelleme hatası: {e}', updDev: 'Güncelleme yalnızca kurulu sürümde çalışır.',
    onbNext: 'İleri', onbDone: 'Başla', onbSkip: 'Geç',
    onbScanT: 'Oyunlarını tara', onbScanD: 'Steam, Epic, Xbox ve masaüstü oyunlarını otomatik bulur.',
    onbCardT: 'Tıkla ve oyna', onbCardD: 'Karta tıkla, oyun açılır. Sağ tık ile favori, kapak değiştir, birlikte aç ve daha fazlası.',
    onbDiscordT: 'Hızlı Discord', onbDiscordD: "Buradan Discord'u tek tıkla aç; açıkken yeşil yanar, × ile kapatırsın.",
    onbSettingsT: 'Ayarlar', onbSettingsD: 'Dil, renk, kapak görselleri, klasörler ve başlangıç ayarları burada.',
  },
  en: {
    scan: 'Scan', addGame: 'Add Game', settings: 'Settings', by: 'by',
    sortRating: 'By rating', metacriticLabel: 'Metacritic',
    steamListsSection: 'Steam Lists', steamListsLabel: 'Show Steam collections', steamListsAskTitle: 'Steam collections found', steamListsAskText: 'Found {n} collections ({names}). Add them to the sidebar?', steamListsYes: 'Yes, add them', steamListsNo: 'No', steamListsNone: 'No Steam collections found.', steamListsRefresh: 'Refresh lists', steamListsHint: "Read from your Steam client's collections. Only manually added games come through — Steam's own rule-based (dynamic) matches don't.",
    listsSection: 'Lists', listAddTo: 'Add to list', listNew: 'New list…', listNewPrompt: 'List name:', listRenamePrompt: 'New list name:', listDelete: 'Delete list', listDeleted: '{n} deleted', listAdded: '{t} → {n}', listRemoved: '{t} removed from {n}', listSteamLocked: "This game is in the list via Steam; Arcadia doesn't write to Steam.",
    listDeleteSteamConfirm: "'{n}' is a Steam collection. It will be deleted in Steam too (on all your devices). Sure?", listDeletedSteam: '{n} deleted in Steam too', listDeletedSteamPending: '{n} deleted — Steam is running, so the Steam collection goes as soon as you close Steam.', listSteamApplied: '{n} list(s) deleted in Steam too',
    steamPendingInfo: '{n} list(s) waiting to be deleted in Steam — applied once Steam is fully closed (closing its window is not enough; Steam keeps running in the tray).', steamApplyNow: 'Close Steam and apply', steamApplyAsk: 'Steam is running. Close and reopen it now to apply the deletion? Cancel if a game or download is running — it also applies whenever you quit Steam yourself.', steamApplying: 'Closing Steam and deleting the list…', steamApplied: '{n} list(s) deleted in Steam, reopening Steam', steamBusy: "Steam didn't close (a running game or a dialog waiting for you, perhaps). Nothing was changed.",
    updStore: 'Arcadia updates through the Microsoft Store; new versions arrive automatically.',
    searchPlaceholder: 'Search games…', sortTitle: 'A → Z', sortRecent: 'Recently added', sortPlayed: 'Recently played',
    emptyTitle: 'No games yet', emptyText: 'Scan to find the games installed on your PC.', emptyScan: 'Scan for Games',
    allGames: 'All Games', favorites: 'Favorites', sourcesSection: 'Sources',
    src_steam: 'Steam', src_epic: 'Epic Games', src_xbox: 'Xbox', src_gog: 'GOG', src_ea: 'EA', src_ubisoft: 'Ubisoft Connect', src_shortcut: 'Shortcuts', src_folder: 'Folder', src_manual: 'Added',
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
    settingsAccent: 'Accent Color', settingsLogo: 'Logo Color', settingsLogoShape: 'Logo Shape', settingsLogoSymbol: 'Logo Symbol', settingsLanguage: 'Language', rescanNow: 'Rescan Now', replayTour: 'Replay tour',
    coverHint: 'Steam games come with automatic covers. For others, right-click → Change cover to set your own image.',
    settingsAbout: 'About', aboutSub: 'Your game library · by Samet Ege',
    settingsCovers: 'Cover Art (SteamGridDB)', sgdbPlaceholder: 'SteamGridDB API key',
    sgdbHint: 'Fetches covers for non-Steam games (Minecraft, FACEIT, LoL…). Free key: steamgriddb.com → Preferences → API. Paste it and rescan.',
    startupTitle: 'Launch at startup', startupQuestion: 'Should Arcadia start automatically when your PC turns on?', startYes: 'Yes, start it', startNo: 'No',
    settingsStartup: 'Startup', autostartLabel: 'Launch when PC starts', bgNotice: 'Arcadia keeps running in the background',
    accCancelled: '{s} not connected — the window closed before sign-in finished.',
    randomGame: 'Random Game', randomTitle: 'What should I play?', randomAnother: "I don't want this one", randomEmpty: 'No games to pick from.', randomPlay: 'Play now',
    librarySection: 'Library', filterNotInstalled: 'Not installed',
    connectAccounts: 'Link Account',
    settingsAccounts: 'Linked Accounts', accConnect: 'Connect', accDisconnect: 'Sign out',
    accHint: "Link an account and the games you own but haven't installed show up too. You sign in on the store's own page — Arcadia never sees your password.",
    accLinked: 'Linked: {n}', accSync: 'Refresh Library', accSyncing: 'Fetching {s} library…',
    accExpired: 'Your {s} session expired — link it again.', accFailed: "Couldn't fetch {s}: {e}",
    accConnected: '{s} connected', accDisconnected: '{s} disconnected',
    notInstalled: 'Not installed', installGame: 'Install', filterInstalled: 'Installed', filterOwned: 'My library',
    dlCancel: 'Cancel', dlStalled: "Didn't start", dlStalledHint: "The store never began installing — it may have been cancelled.", dlCancelledStore: "Opened the store's download list so you can stop it there.",
    downloads: 'Downloads', dlEmpty: 'No games are downloading right now.', dlClear: 'Clear finished',
    dlPending: 'Starting…', dlDownloading: 'Downloading', dlInstalling: 'Installing', dlDone: 'Installed', dlError: 'Error',
    dlRemove: 'Remove from list', dlOpenClient: 'Open in store', dlStarted: 'Started downloading {t}',
    dlNoUrl: 'No install link for this game.', dlFinished: '{t} installed',
    dlHandoff: "The store's own client does the downloading; Arcadia shows the progress here.",
    dlEta: '{t} left', dlXboxNote: 'The Microsoft Store reports no progress — it only shows up once finished.',
    openingStore: 'Opening store…',
    settingsUpdates: 'Updates', autoUpdateLabel: 'Install updates automatically',
    autoUpdateHint: 'When on, Arcadia downloads a new version in the background and installs it the next time it closes. When off, it only tells you.',
    checkUpdate: 'Check for Updates', updChecking: 'Checking…', updLatest: "You're on the latest version.",
    updAvailable: 'New version found: {v}', updDownloading: 'Downloading… {p}%', updDownloaded: '{v} downloaded — ready to install',
    updInstall: 'Restart and install', updError: 'Update error: {e}', updDev: 'Updates only work in an installed build.',
    onbNext: 'Next', onbDone: 'Get started', onbSkip: 'Skip',
    onbScanT: 'Scan your games', onbScanD: 'Automatically finds your Steam, Epic, Xbox and desktop games.',
    onbCardT: 'Click to play', onbCardD: 'Click a card to launch. Right-click for favorite, change cover, launch together and more.',
    onbDiscordT: 'Quick Discord', onbDiscordD: 'Open Discord with one click; it glows green when running, close it with ×.',
    onbSettingsT: 'Settings', onbSettingsD: 'Language, color, cover art, folders and startup options are here.',
  },
  de: {
    scan: 'Scannen', addGame: 'Spiel hinzufügen', settings: 'Einstellungen', by: 'von',
    sortRating: 'Nach Bewertung', metacriticLabel: 'Metacritic',
    steamListsSection: 'Steam-Listen', steamListsLabel: 'Steam-Sammlungen anzeigen', steamListsAskTitle: 'Steam-Sammlungen gefunden', steamListsAskText: '{n} Sammlungen gefunden ({names}). In die Seitenleiste aufnehmen?', steamListsYes: 'Ja, hinzufügen', steamListsNo: 'Nein', steamListsNone: 'Keine Steam-Sammlungen gefunden.', steamListsRefresh: 'Listen aktualisieren', steamListsHint: 'Wird aus den Sammlungen deines Steam-Clients gelesen. Nur manuell hinzugefügte Spiele erscheinen, keine dynamischen Regeltreffer.',
    listsSection: 'Listen', listAddTo: 'Zur Liste hinzufügen', listNew: 'Neue Liste…', listNewPrompt: 'Listenname:', listRenamePrompt: 'Neuer Listenname:', listDelete: 'Liste löschen', listDeleted: '{n} gelöscht', listAdded: '{t} → {n}', listRemoved: '{t} aus {n} entfernt', listSteamLocked: 'Dieses Spiel kommt über Steam in die Liste; Arcadia schreibt nicht nach Steam.',
    listDeleteSteamConfirm: "'{n}' ist eine Steam-Sammlung. Sie wird auch in Steam gelöscht (auf allen Geräten). Sicher?", listDeletedSteam: '{n} auch in Steam gelöscht', listDeletedSteamPending: '{n} gelöscht — Steam läuft, die Steam-Sammlung wird gelöscht, sobald du Steam schließt.', listSteamApplied: '{n} Liste(n) auch in Steam gelöscht',
    steamPendingInfo: '{n} Liste(n) warten auf Löschung in Steam — wird angewendet, sobald Steam ganz geschlossen ist (Fenster schließen reicht nicht, Steam läuft im Tray weiter).', steamApplyNow: 'Steam schließen und anwenden', steamApplyAsk: 'Steam läuft. Jetzt schließen und neu starten, um die Löschung anzuwenden? Abbrechen, falls ein Spiel oder Download läuft — es wird auch angewendet, wenn du Steam selbst beendest.', steamApplying: 'Steam wird geschlossen, Liste wird gelöscht…', steamApplied: '{n} Liste(n) in Steam gelöscht, Steam startet neu', steamBusy: 'Steam wurde nicht geschlossen (laufendes Spiel oder offener Dialog?). Nichts wurde geändert.',
    updStore: 'Arcadia wird über den Microsoft Store aktualisiert; neue Versionen kommen automatisch.',
    searchPlaceholder: 'Spiele suchen…', sortTitle: 'A → Z', sortRecent: 'Zuletzt hinzugefügt', sortPlayed: 'Zuletzt gespielt',
    emptyTitle: 'Noch keine Spiele', emptyText: 'Starte den Scan, um installierte Spiele zu finden.', emptyScan: 'Spiele scannen',
    allGames: 'Alle Spiele', favorites: 'Favoriten', sourcesSection: 'Quellen',
    src_steam: 'Steam', src_epic: 'Epic Games', src_xbox: 'Xbox', src_gog: 'GOG', src_ea: 'EA', src_ubisoft: 'Ubisoft Connect', src_shortcut: 'Verknüpfungen', src_folder: 'Ordner', src_manual: 'Hinzugefügt',
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
    settingsAccent: 'Akzentfarbe', settingsLogo: 'Logo-Farbe', settingsLogoShape: 'Logo-Form', settingsLogoSymbol: 'Logo-Symbol', settingsLanguage: 'Sprache', rescanNow: 'Jetzt neu scannen', replayTour: 'Tour wiederholen',
    coverHint: 'Steam-Spiele haben automatische Cover. Bei anderen: Rechtsklick → Cover ändern, um ein eigenes Bild zu setzen.',
    settingsAbout: 'Über', aboutSub: 'Deine Spielebibliothek · von Samet Ege',
    settingsCovers: 'Cover-Bilder (SteamGridDB)', sgdbPlaceholder: 'SteamGridDB API-Schlüssel',
    sgdbHint: 'Holt Cover für Nicht-Steam-Spiele (Minecraft, FACEIT, LoL…). Kostenloser Schlüssel: steamgriddb.com → Preferences → API. Einfügen und neu scannen.',
    startupTitle: 'Beim Start öffnen', startupQuestion: 'Soll Arcadia automatisch starten, wenn der PC hochfährt?', startYes: 'Ja, starten', startNo: 'Nein',
    settingsStartup: 'Autostart', autostartLabel: 'Beim Hochfahren starten', bgNotice: 'Arcadia läuft im Hintergrund weiter',
    accCancelled: '{s} nicht verbunden — das Fenster wurde vor dem Login geschlossen.',
    randomGame: 'Zufallsspiel', randomTitle: 'Was soll ich spielen?', randomAnother: 'Das will ich nicht', randomEmpty: 'Keine Spiele zur Auswahl.', randomPlay: 'Jetzt spielen',
    librarySection: 'Bibliothek', filterNotInstalled: 'Nicht installiert',
    connectAccounts: 'Konto verknüpfen',
    settingsAccounts: 'Verknüpfte Konten', accConnect: 'Verbinden', accDisconnect: 'Abmelden',
    accHint: 'Mit einem verknüpften Konto erscheinen auch Spiele, die du besitzt, aber nicht installiert hast. Die Anmeldung läuft auf der Seite des Shops — Arcadia sieht dein Passwort nie.',
    accLinked: 'Verknüpft: {n}', accSync: 'Bibliothek aktualisieren', accSyncing: '{s}-Bibliothek wird geladen…',
    accExpired: 'Deine {s}-Sitzung ist abgelaufen — bitte neu verbinden.', accFailed: '{s} konnte nicht geladen werden: {e}',
    accConnected: '{s} verbunden', accDisconnected: '{s} getrennt',
    notInstalled: 'Nicht installiert', installGame: 'Installieren', filterInstalled: 'Installiert', filterOwned: 'Meine Bibliothek',
    dlCancel: 'Abbrechen', dlStalled: 'Nicht gestartet', dlStalledHint: 'Der Store hat die Installation nie begonnen — vielleicht abgebrochen.', dlCancelledStore: 'Die Download-Liste des Stores wurde geöffnet.',
    downloads: 'Downloads', dlEmpty: 'Derzeit wird kein Spiel geladen.', dlClear: 'Fertige entfernen',
    dlPending: 'Wird gestartet…', dlDownloading: 'Wird geladen', dlInstalling: 'Wird installiert', dlDone: 'Installiert', dlError: 'Fehler',
    dlRemove: 'Aus der Liste entfernen', dlOpenClient: 'Im Store öffnen', dlStarted: 'Download von {t} gestartet',
    dlNoUrl: 'Für dieses Spiel gibt es keinen Installationslink.', dlFinished: '{t} installiert',
    dlHandoff: 'Der Store-Client lädt herunter; Arcadia zeigt den Fortschritt hier an.',
    dlEta: 'noch {t}', dlXboxNote: 'Der Microsoft Store meldet keinen Fortschritt — es erscheint erst nach Abschluss.',
    openingStore: 'Shop wird geöffnet…',
    settingsUpdates: 'Updates', autoUpdateLabel: 'Updates automatisch installieren',
    autoUpdateHint: 'Wenn aktiv, lädt Arcadia neue Versionen im Hintergrund und installiert sie beim nächsten Beenden. Sonst wirst du nur benachrichtigt.',
    checkUpdate: 'Nach Updates suchen', updChecking: 'Wird geprüft…', updLatest: 'Du hast die neueste Version.',
    updAvailable: 'Neue Version gefunden: {v}', updDownloading: 'Wird geladen… {p}%', updDownloaded: '{v} geladen — bereit zur Installation',
    updInstall: 'Neu starten und installieren', updError: 'Update-Fehler: {e}', updDev: 'Updates funktionieren nur in einer installierten Version.',
    onbNext: 'Weiter', onbDone: "Los geht's", onbSkip: 'Überspringen',
    onbScanT: 'Spiele scannen', onbScanD: 'Findet automatisch deine Steam-, Epic-, Xbox- und Desktop-Spiele.',
    onbCardT: 'Klicken zum Spielen', onbCardD: 'Karte anklicken zum Starten. Rechtsklick für Favorit, Cover ändern, zusammen starten und mehr.',
    onbDiscordT: 'Discord-Schnellzugriff', onbDiscordD: 'Öffne Discord mit einem Klick; leuchtet grün, schließen mit ×.',
    onbSettingsT: 'Einstellungen', onbSettingsD: 'Sprache, Farbe, Cover, Ordner und Autostart findest du hier.',
  },
  ja: {
    scan: 'スキャン', addGame: 'ゲームを追加', settings: '設定', by: '制作',
    sortRating: '評価順', metacriticLabel: 'Metacritic',
    steamListsSection: 'Steamリスト', steamListsLabel: 'Steamコレクションを表示', steamListsAskTitle: 'Steamコレクションが見つかりました', steamListsAskText: '{n} 件のコレクション ({names}) が見つかりました。サイドバーに追加しますか？', steamListsYes: 'はい、追加', steamListsNo: 'いいえ', steamListsNone: 'Steamコレクションが見つかりません。', steamListsRefresh: 'リストを更新', steamListsHint: 'Steamクライアントのコレクションから読み取ります。手動で追加したゲームのみで、動的ルールの一致は含まれません。',
    listsSection: 'リスト', listAddTo: 'リストに追加', listNew: '新しいリスト…', listNewPrompt: 'リスト名:', listRenamePrompt: '新しいリスト名:', listDelete: 'リストを削除', listDeleted: '{n} を削除しました', listAdded: '{t} → {n}', listRemoved: '{t} を {n} から削除しました', listSteamLocked: 'このゲームはSteam経由でリストに入っています。ArcadiaはSteamに書き込みません。',
    listDeleteSteamConfirm: "「{n}」はSteamのコレクションです。Steamからも（すべての端末で）削除されます。よろしいですか？", listDeletedSteam: '{n} をSteamからも削除しました', listDeletedSteamPending: '{n} を削除しました — Steamが起動中のため、Steamを閉じるとSteam側も削除されます。', listSteamApplied: '{n} 件のリストをSteamからも削除しました',
    steamPendingInfo: '{n} 件のリストがSteamでの削除待ちです — Steamが完全に終了すると適用されます（ウィンドウを閉じるだけでは不十分、Steamはトレイで動作し続けます）。', steamApplyNow: 'Steamを閉じて適用', steamApplyAsk: 'Steamが起動中です。今すぐ閉じて再起動し、削除を適用しますか？ゲームやダウンロード中ならキャンセルしてください — 自分でSteamを終了したときにも適用されます。', steamApplying: 'Steamを閉じてリストを削除しています…', steamApplied: '{n} 件のリストをSteamから削除し、Steamを再起動します', steamBusy: 'Steamが終了しませんでした（ゲーム実行中か確認ダイアログ待ち？）。何も変更していません。',
    updStore: 'ArcadiaはMicrosoft Storeで更新されます。新しいバージョンは自動で届きます。',
    searchPlaceholder: 'ゲームを検索…', sortTitle: 'A → Z', sortRecent: '最近追加', sortPlayed: '最近プレイ',
    emptyTitle: 'まだゲームがありません', emptyText: 'PCにインストールされたゲームをスキャンして見つけましょう。', emptyScan: 'ゲームをスキャン',
    allGames: 'すべてのゲーム', favorites: 'お気に入り', sourcesSection: 'ソース',
    src_steam: 'Steam', src_epic: 'Epic Games', src_xbox: 'Xbox', src_gog: 'GOG', src_ea: 'EA', src_ubisoft: 'Ubisoft Connect', src_shortcut: 'ショートカット', src_folder: 'フォルダー', src_manual: '追加済み',
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
    settingsAccent: 'アクセントカラー', settingsLogo: 'ロゴの色', settingsLogoShape: 'ロゴの形', settingsLogoSymbol: 'ロゴの記号', settingsLanguage: '言語', rescanNow: '今すぐ再スキャン', replayTour: 'ツアーを再生',
    coverHint: 'Steamゲームには自動でカバーが付きます。その他は右クリック →「カバーを変更」で自分の画像を設定できます。',
    settingsAbout: '情報', aboutSub: 'あなたのゲームライブラリ · 制作 Samet Ege',
    settingsCovers: 'カバー画像 (SteamGridDB)', sgdbPlaceholder: 'SteamGridDB APIキー',
    sgdbHint: 'Steam以外のゲーム（Minecraft、FACEIT、LoL…）にカバーを取得します。無料キー: steamgriddb.com → Preferences → API。貼り付けて再スキャン。',
    startupTitle: '起動時に開く', startupQuestion: 'PCの起動時にArcadiaを自動的に起動しますか？', startYes: 'はい', startNo: 'いいえ',
    settingsStartup: '起動', autostartLabel: 'PC起動時に起動', bgNotice: 'Arcadiaはバックグラウンドで動作し続けます',
    accCancelled: '{s} は連携されませんでした — サインイン前にウィンドウが閉じられました。',
    randomGame: 'ランダム', randomTitle: '何をプレイする？', randomAnother: 'これはいらない', randomEmpty: '選べるゲームがありません。', randomPlay: '今すぐプレイ',
    librarySection: 'ライブラリ', filterNotInstalled: '未インストール',
    connectAccounts: 'アカウント連携',
    settingsAccounts: '連携アカウント', accConnect: '連携する', accDisconnect: 'ログアウト',
    accHint: 'アカウントを連携すると、未インストールの所有ゲームもライブラリに表示されます。ログインはストア自身のページで行われ、Arcadiaがパスワードを見ることはありません。',
    accLinked: '連携中: {n}', accSync: 'ライブラリを更新', accSyncing: '{s} のライブラリを取得中…',
    accExpired: '{s} のセッションが期限切れです。再連携してください。', accFailed: '{s} を取得できませんでした: {e}',
    accConnected: '{s} を連携しました', accDisconnected: '{s} の連携を解除しました',
    notInstalled: '未インストール', installGame: 'インストール', filterInstalled: 'インストール済み', filterOwned: 'マイライブラリ',
    dlCancel: 'キャンセル', dlStalled: '開始されませんでした', dlStalledHint: 'ストアがインストールを開始しませんでした。キャンセルされた可能性があります。', dlCancelledStore: 'ストアのダウンロード一覧を開きました。',
    downloads: 'ダウンロード', dlEmpty: '現在ダウンロード中のゲームはありません。', dlClear: '完了分を消去',
    dlPending: '開始しています…', dlDownloading: 'ダウンロード中', dlInstalling: 'インストール中', dlDone: 'インストール済み', dlError: 'エラー',
    dlRemove: 'リストから削除', dlOpenClient: 'ストアで開く', dlStarted: '{t} のダウンロードを開始しました',
    dlNoUrl: 'このゲームにはインストールリンクがありません。', dlFinished: '{t} をインストールしました',
    dlHandoff: 'ダウンロードはストア自身のクライアントが行い、Arcadiaは進捗をここに表示します。',
    dlEta: '残り {t}', dlXboxNote: 'Microsoft Storeは進捗を通知しません。完了後に表示されます。',
    openingStore: 'ストアを開いています…',
    settingsUpdates: 'アップデート', autoUpdateLabel: 'アップデートを自動でインストール',
    autoUpdateHint: 'オンにすると、新しいバージョンをバックグラウンドでダウンロードし、次回終了時にインストールします。オフの場合は通知のみです。',
    checkUpdate: 'アップデートを確認', updChecking: '確認中…', updLatest: '最新バージョンです。',
    updAvailable: '新しいバージョン: {v}', updDownloading: 'ダウンロード中… {p}%', updDownloaded: '{v} をダウンロード済み — インストール可能',
    updInstall: '再起動してインストール', updError: 'アップデートエラー: {e}', updDev: 'アップデートはインストール版でのみ動作します。',
    onbNext: '次へ', onbDone: '始める', onbSkip: 'スキップ',
    onbScanT: 'ゲームをスキャン', onbScanD: 'Steam、Epic、Xbox、デスクトップのゲームを自動的に見つけます。',
    onbCardT: 'クリックして起動', onbCardD: 'カードをクリックして起動。右クリックでお気に入り、カバー変更、一緒に起動など。',
    onbDiscordT: 'Discordショートカット', onbDiscordD: 'ワンクリックでDiscordを起動。起動中は緑に光り、×で閉じます。',
    onbSettingsT: '設定', onbSettingsD: '言語、色、カバー画像、フォルダー、起動設定はこちら。',
  },
  ko: {
    scan: '스캔', addGame: '게임 추가', settings: '설정', by: '제작',
    sortRating: '평점순', metacriticLabel: 'Metacritic',
    steamListsSection: 'Steam 목록', steamListsLabel: 'Steam 컬렉션 표시', steamListsAskTitle: 'Steam 컬렉션을 찾았습니다', steamListsAskText: '컬렉션 {n}개를 찾았습니다 ({names}). 사이드바에 추가할까요?', steamListsYes: '예, 추가', steamListsNo: '아니요', steamListsNone: 'Steam 컬렉션이 없습니다.', steamListsRefresh: '목록 새로고침', steamListsHint: 'Steam 클라이언트의 컬렉션에서 읽습니다. 수동으로 추가한 게임만 표시되며 동적 규칙 일치는 포함되지 않습니다.',
    listsSection: '목록', listAddTo: '목록에 추가', listNew: '새 목록…', listNewPrompt: '목록 이름:', listRenamePrompt: '새 목록 이름:', listDelete: '목록 삭제', listDeleted: '{n} 삭제됨', listAdded: '{t} → {n}', listRemoved: '{t}을(를) {n}에서 제거함', listSteamLocked: '이 게임은 Steam을 통해 목록에 있습니다. Arcadia는 Steam에 쓰지 않습니다.',
    listDeleteSteamConfirm: "'{n}'은(는) Steam 컬렉션입니다. Steam에서도(모든 기기) 삭제됩니다. 계속할까요?", listDeletedSteam: '{n}을(를) Steam에서도 삭제했습니다', listDeletedSteamPending: '{n} 삭제됨 — Steam이 실행 중이라 Steam을 닫으면 Steam 컬렉션도 삭제됩니다.', listSteamApplied: '목록 {n}개를 Steam에서도 삭제했습니다',
    steamPendingInfo: '목록 {n}개가 Steam 삭제를 기다리는 중 — Steam이 완전히 종료되면 적용됩니다(창을 닫는 것만으로는 부족, Steam은 트레이에서 계속 실행됨).', steamApplyNow: 'Steam 종료 후 적용', steamApplyAsk: 'Steam이 실행 중입니다. 지금 종료하고 다시 열어 삭제를 적용할까요? 게임이나 다운로드 중이면 취소하세요 — 직접 Steam을 종료할 때도 적용됩니다.', steamApplying: 'Steam을 종료하고 목록을 삭제하는 중…', steamApplied: 'Steam에서 목록 {n}개 삭제, Steam 다시 여는 중', steamBusy: 'Steam이 종료되지 않았습니다(실행 중인 게임이나 확인 창?). 아무것도 바뀌지 않았습니다.',
    updStore: 'Arcadia는 Microsoft Store를 통해 업데이트되며 새 버전이 자동으로 설치됩니다.',
    searchPlaceholder: '게임 검색…', sortTitle: 'A → Z', sortRecent: '최근 추가', sortPlayed: '최근 플레이',
    emptyTitle: '아직 게임이 없습니다', emptyText: 'PC에 설치된 게임을 스캔하여 찾아보세요.', emptyScan: '게임 스캔',
    allGames: '모든 게임', favorites: '즐겨찾기', sourcesSection: '소스',
    src_steam: 'Steam', src_epic: 'Epic Games', src_xbox: 'Xbox', src_gog: 'GOG', src_ea: 'EA', src_ubisoft: 'Ubisoft Connect', src_shortcut: '바로가기', src_folder: '폴더', src_manual: '추가됨',
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
    settingsAccent: '강조 색상', settingsLogo: '로고 색상', settingsLogoShape: '로고 모양', settingsLogoSymbol: '로고 기호', settingsLanguage: '언어', rescanNow: '지금 다시 스캔', replayTour: '둘러보기 다시 보기',
    coverHint: 'Steam 게임은 자동으로 커버가 표시됩니다. 그 외에는 마우스 오른쪽 클릭 → 커버 변경으로 직접 이미지를 설정하세요.',
    settingsAbout: '정보', aboutSub: '나의 게임 라이브러리 · 제작 Samet Ege',
    settingsCovers: '커버 이미지 (SteamGridDB)', sgdbPlaceholder: 'SteamGridDB API 키',
    sgdbHint: 'Steam이 아닌 게임(Minecraft, FACEIT, LoL…)의 커버를 가져옵니다. 무료 키: steamgriddb.com → Preferences → API. 붙여넣고 다시 스캔하세요.',
    startupTitle: '시작 시 실행', startupQuestion: 'PC를 켤 때 Arcadia를 자동으로 시작할까요?', startYes: '예', startNo: '아니요',
    settingsStartup: '시작', autostartLabel: 'PC 시작 시 실행', bgNotice: 'Arcadia가 백그라운드에서 계속 실행됩니다',
    accCancelled: '{s} 연결되지 않음 — 로그인 전에 창이 닫혔습니다.',
    randomGame: '랜덤 게임', randomTitle: '뭘 할까?', randomAnother: '이건 싫어', randomEmpty: '고를 게임이 없습니다.', randomPlay: '지금 플레이',
    librarySection: '라이브러리', filterNotInstalled: '미설치',
    connectAccounts: '계정 연결',
    settingsAccounts: '연결된 계정', accConnect: '연결', accDisconnect: '로그아웃',
    accHint: '계정을 연결하면 설치하지 않은 보유 게임도 라이브러리에 표시됩니다. 로그인은 스토어 자체 페이지에서 이루어지며 Arcadia는 비밀번호를 볼 수 없습니다.',
    accLinked: '연결됨: {n}', accSync: '라이브러리 새로고침', accSyncing: '{s} 라이브러리 가져오는 중…',
    accExpired: '{s} 세션이 만료되었습니다. 다시 연결하세요.', accFailed: '{s}을(를) 가져오지 못했습니다: {e}',
    accConnected: '{s} 연결됨', accDisconnected: '{s} 연결 해제됨',
    notInstalled: '미설치', installGame: '설치', filterInstalled: '설치됨', filterOwned: '내 라이브러리',
    dlCancel: '취소', dlStalled: '시작되지 않음', dlStalledHint: '스토어가 설치를 시작하지 않았습니다. 취소되었을 수 있습니다.', dlCancelledStore: '스토어의 다운로드 목록을 열었습니다.',
    downloads: '다운로드', dlEmpty: '지금 다운로드 중인 게임이 없습니다.', dlClear: '완료된 항목 지우기',
    dlPending: '시작하는 중…', dlDownloading: '다운로드 중', dlInstalling: '설치 중', dlDone: '설치됨', dlError: '오류',
    dlRemove: '목록에서 제거', dlOpenClient: '스토어에서 열기', dlStarted: '{t} 다운로드를 시작했습니다',
    dlNoUrl: '이 게임에는 설치 링크가 없습니다.', dlFinished: '{t} 설치 완료',
    dlHandoff: '다운로드는 스토어 자체 클라이언트가 수행하며 Arcadia는 진행 상황만 표시합니다.',
    dlEta: '{t} 남음', dlXboxNote: 'Microsoft Store는 진행률을 알려주지 않아 완료 후에만 표시됩니다.',
    openingStore: '스토어를 여는 중…',
    settingsUpdates: '업데이트', autoUpdateLabel: '업데이트 자동 설치',
    autoUpdateHint: '켜면 새 버전을 백그라운드에서 내려받아 다음 종료 시 설치합니다. 끄면 알림만 표시합니다.',
    checkUpdate: '업데이트 확인', updChecking: '확인 중…', updLatest: '최신 버전입니다.',
    updAvailable: '새 버전 발견: {v}', updDownloading: '다운로드 중… {p}%', updDownloaded: '{v} 다운로드 완료 — 설치 준비됨',
    updInstall: '다시 시작하고 설치', updError: '업데이트 오류: {e}', updDev: '업데이트는 설치된 버전에서만 작동합니다.',
    onbNext: '다음', onbDone: '시작하기', onbSkip: '건너뛰기',
    onbScanT: '게임 스캔', onbScanD: 'Steam, Epic, Xbox 및 바탕화면 게임을 자동으로 찾습니다.',
    onbCardT: '클릭하여 실행', onbCardD: '카드를 클릭하여 실행. 마우스 오른쪽 클릭으로 즐겨찾기, 커버 변경, 함께 실행 등.',
    onbDiscordT: '빠른 Discord', onbDiscordD: '한 번의 클릭으로 Discord 실행. 실행 중에는 녹색으로 표시되며 ×로 닫습니다.',
    onbSettingsT: '설정', onbSettingsD: '언어, 색상, 커버 이미지, 폴더, 시작 설정이 여기에 있습니다.',
  },
  es: {
    scan: 'Escanear', addGame: 'Añadir juego', settings: 'Ajustes', by: 'por',
    sortRating: 'Por valoración', metacriticLabel: 'Metacritic',
    steamListsSection: 'Listas de Steam', steamListsLabel: 'Mostrar colecciones de Steam', steamListsAskTitle: 'Colecciones de Steam encontradas', steamListsAskText: 'Se encontraron {n} colecciones ({names}). ¿Añadirlas a la barra lateral?', steamListsYes: 'Sí, añadir', steamListsNo: 'No', steamListsNone: 'No se encontraron colecciones de Steam.', steamListsRefresh: 'Actualizar listas', steamListsHint: 'Se leen de las colecciones de tu cliente de Steam. Solo aparecen los juegos añadidos manualmente, no las coincidencias dinámicas por reglas.',
    listsSection: 'Listas', listAddTo: 'Añadir a lista', listNew: 'Nueva lista…', listNewPrompt: 'Nombre de la lista:', listRenamePrompt: 'Nuevo nombre:', listDelete: 'Eliminar lista', listDeleted: '{n} eliminada', listAdded: '{t} → {n}', listRemoved: '{t} quitado de {n}', listSteamLocked: 'Este juego está en la lista vía Steam; Arcadia no escribe en Steam.',
    listDeleteSteamConfirm: "'{n}' es una colección de Steam. También se eliminará en Steam (en todos tus dispositivos). ¿Seguro?", listDeletedSteam: '{n} eliminada también en Steam', listDeletedSteamPending: '{n} eliminada — Steam está abierto; la colección se eliminará en Steam al cerrarlo.', listSteamApplied: '{n} lista(s) eliminada(s) también en Steam',
    steamPendingInfo: '{n} lista(s) esperando eliminarse en Steam — se aplica cuando Steam se cierre del todo (cerrar la ventana no basta, Steam sigue en la bandeja).', steamApplyNow: 'Cerrar Steam y aplicar', steamApplyAsk: 'Steam está abierto. ¿Cerrarlo y reabrirlo ahora para aplicar la eliminación? Cancela si hay un juego o descarga en curso — también se aplica cuando cierres Steam tú.', steamApplying: 'Cerrando Steam y eliminando la lista…', steamApplied: '{n} lista(s) eliminada(s) en Steam, reabriendo Steam', steamBusy: 'Steam no se cerró (¿un juego abierto o un diálogo esperando?). No se cambió nada.',
    updStore: 'Arcadia se actualiza desde Microsoft Store; las nuevas versiones llegan solas.',
    searchPlaceholder: 'Buscar juegos…', sortTitle: 'A → Z', sortRecent: 'Añadido reciente', sortPlayed: 'Jugado reciente',
    emptyTitle: 'Aún no hay juegos', emptyText: 'Escanea para encontrar los juegos instalados en tu PC.', emptyScan: 'Escanear juegos',
    allGames: 'Todos los juegos', favorites: 'Favoritos', sourcesSection: 'Fuentes',
    src_steam: 'Steam', src_epic: 'Epic Games', src_xbox: 'Xbox', src_gog: 'GOG', src_ea: 'EA', src_ubisoft: 'Ubisoft Connect', src_shortcut: 'Accesos directos', src_folder: 'Carpeta', src_manual: 'Añadidos',
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
    settingsAccent: 'Color de acento', settingsLogo: 'Color del logo', settingsLogoShape: 'Forma del logo', settingsLogoSymbol: 'Símbolo del logo', settingsLanguage: 'Idioma', rescanNow: 'Volver a escanear', replayTour: 'Repetir tutorial',
    coverHint: 'Los juegos de Steam traen carátulas automáticas. Para los demás, clic derecho → Cambiar carátula para poner tu propia imagen.',
    settingsAbout: 'Acerca de', aboutSub: 'Tu biblioteca de juegos · por Samet Ege',
    settingsCovers: 'Carátulas (SteamGridDB)', sgdbPlaceholder: 'Clave API de SteamGridDB',
    sgdbHint: 'Obtiene carátulas para juegos que no son de Steam (Minecraft, FACEIT, LoL…). Clave gratis: steamgriddb.com → Preferences → API. Pégala y vuelve a escanear.',
    startupTitle: 'Abrir al iniciar', startupQuestion: '¿Quieres que Arcadia se inicie automáticamente al encender el PC?', startYes: 'Sí', startNo: 'No',
    settingsStartup: 'Inicio', autostartLabel: 'Iniciar al encender el PC', bgNotice: 'Arcadia sigue ejecutándose en segundo plano',
    accCancelled: '{s} no se vinculó: la ventana se cerró antes de iniciar sesión.',
    randomGame: 'Juego al azar', randomTitle: '¿A qué juego?', randomAnother: 'Este no me gusta', randomEmpty: 'No hay juegos para elegir.', randomPlay: 'Jugar ahora',
    librarySection: 'Biblioteca', filterNotInstalled: 'No instalados',
    connectAccounts: 'Vincular cuenta',
    settingsAccounts: 'Cuentas vinculadas', accConnect: 'Conectar', accDisconnect: 'Cerrar sesión',
    accHint: 'Al vincular una cuenta también aparecen los juegos que tienes pero no has instalado. El inicio de sesión ocurre en la página de la tienda; Arcadia nunca ve tu contraseña.',
    accLinked: 'Vinculada: {n}', accSync: 'Actualizar biblioteca', accSyncing: 'Obteniendo la biblioteca de {s}…',
    accExpired: 'Tu sesión de {s} caducó: vuelve a vincularla.', accFailed: 'No se pudo obtener {s}: {e}',
    accConnected: '{s} conectada', accDisconnected: '{s} desconectada',
    notInstalled: 'No instalado', installGame: 'Instalar', filterInstalled: 'Instalados', filterOwned: 'Mi biblioteca',
    dlCancel: 'Cancelar', dlStalled: 'No se inició', dlStalledHint: 'La tienda nunca empezó a instalar; puede que se cancelara.', dlCancelledStore: 'Se abrió la lista de descargas de la tienda.',
    downloads: 'Descargas', dlEmpty: 'Ahora mismo no se está descargando ningún juego.', dlClear: 'Limpiar terminadas',
    dlPending: 'Iniciando…', dlDownloading: 'Descargando', dlInstalling: 'Instalando', dlDone: 'Instalado', dlError: 'Error',
    dlRemove: 'Quitar de la lista', dlOpenClient: 'Abrir en la tienda', dlStarted: 'Descarga de {t} iniciada',
    dlNoUrl: 'No hay enlace de instalación para este juego.', dlFinished: '{t} instalado',
    dlHandoff: 'La descarga la hace el cliente de la tienda; Arcadia muestra el progreso aquí.',
    dlEta: 'quedan {t}', dlXboxNote: 'Microsoft Store no informa del progreso: solo aparece al terminar.',
    openingStore: 'Abriendo la tienda…',
    settingsUpdates: 'Actualizaciones', autoUpdateLabel: 'Instalar actualizaciones automáticamente',
    autoUpdateHint: 'Si está activo, Arcadia descarga la nueva versión en segundo plano y la instala al cerrarse. Si no, solo te avisa.',
    checkUpdate: 'Buscar actualizaciones', updChecking: 'Comprobando…', updLatest: 'Tienes la última versión.',
    updAvailable: 'Nueva versión encontrada: {v}', updDownloading: 'Descargando… {p}%', updDownloaded: '{v} descargada — lista para instalar',
    updInstall: 'Reiniciar e instalar', updError: 'Error de actualización: {e}', updDev: 'Las actualizaciones solo funcionan en una versión instalada.',
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
  // Store/brand marks are Simple Icons paths (simpleicons.org, CC0), used as-is
  // on a 24x24 viewBox. Take new ones from there rather than drawing them —
  // hand-made approximations of real logos read as wrong at a glance.
  steam: F('<path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z"/>'),
  epic: F('<path d="M3.537 0C2.165 0 1.66.506 1.66 1.879V18.44a4.262 4.262 0 00.02.433c.031.3.037.59.316.92.027.033.311.245.311.245.153.075.258.13.43.2l8.335 3.491c.433.199.614.276.928.27h.002c.314.006.495-.071.928-.27l8.335-3.492c.172-.07.277-.124.43-.2 0 0 .284-.211.311-.243.28-.33.285-.621.316-.92a4.261 4.261 0 00.02-.434V1.879c0-1.373-.506-1.88-1.878-1.88zm13.366 3.11h.68c1.138 0 1.688.553 1.688 1.696v1.88h-1.374v-1.8c0-.369-.17-.54-.523-.54h-.235c-.367 0-.537.17-.537.539v5.81c0 .369.17.54.537.54h.262c.353 0 .523-.171.523-.54V8.619h1.373v2.143c0 1.144-.562 1.71-1.7 1.71h-.694c-1.138 0-1.7-.566-1.7-1.71V4.82c0-1.144.562-1.709 1.7-1.709zm-12.186.08h3.114v1.274H6.117v2.603h1.648v1.275H6.117v2.774h1.74v1.275h-3.14zm3.816 0h2.198c1.138 0 1.7.564 1.7 1.708v2.445c0 1.144-.562 1.71-1.7 1.71h-.799v3.338h-1.4zm4.53 0h1.4v9.201h-1.4zm-3.13 1.235v3.392h.575c.354 0 .523-.171.523-.54V4.965c0-.368-.17-.54-.523-.54zm-3.74 10.147a1.708 1.708 0 01.591.108 1.745 1.745 0 01.49.299l-.452.546a1.247 1.247 0 00-.308-.195.91.91 0 00-.363-.068.658.658 0 00-.28.06.703.703 0 00-.224.163.783.783 0 00-.151.243.799.799 0 00-.056.299v.008a.852.852 0 00.056.31.7.7 0 00.157.245.736.736 0 00.238.16.774.774 0 00.303.058.79.79 0 00.445-.116v-.339h-.548v-.565H7.37v1.255a2.019 2.019 0 01-.524.307 1.789 1.789 0 01-.683.123 1.642 1.642 0 01-.602-.107 1.46 1.46 0 01-.478-.3 1.371 1.371 0 01-.318-.455 1.438 1.438 0 01-.115-.58v-.008a1.426 1.426 0 01.113-.57 1.449 1.449 0 01.312-.46 1.418 1.418 0 01.474-.309 1.58 1.58 0 01.598-.111 1.708 1.708 0 01.045 0zm11.963.008a2.006 2.006 0 01.612.094 1.61 1.61 0 01.507.277l-.386.546a1.562 1.562 0 00-.39-.205 1.178 1.178 0 00-.388-.07.347.347 0 00-.208.052.154.154 0 00-.07.127v.008a.158.158 0 00.022.084.198.198 0 00.076.066.831.831 0 00.147.06c.062.02.14.04.236.061a3.389 3.389 0 01.43.122 1.292 1.292 0 01.328.17.678.678 0 01.207.24.739.739 0 01.071.337v.008a.865.865 0 01-.081.382.82.82 0 01-.229.285 1.032 1.032 0 01-.353.18 1.606 1.606 0 01-.46.061 2.16 2.16 0 01-.71-.116 1.718 1.718 0 01-.593-.346l.43-.514c.277.223.578.335.9.335a.457.457 0 00.236-.05.157.157 0 00.082-.142v-.008a.15.15 0 00-.02-.077.204.204 0 00-.073-.066.753.753 0 00-.143-.062 2.45 2.45 0 00-.233-.062 5.036 5.036 0 01-.413-.113 1.26 1.26 0 01-.331-.16.72.72 0 01-.222-.243.73.73 0 01-.082-.36v-.008a.863.863 0 01.074-.359.794.794 0 01.214-.283 1.007 1.007 0 01.34-.185 1.423 1.423 0 01.448-.066 2.006 2.006 0 01.025 0zm-9.358.025h.742l1.183 2.81h-.825l-.203-.499H8.623l-.198.498h-.81zm2.197.02h.814l.663 1.08.663-1.08h.814v2.79h-.766v-1.602l-.711 1.091h-.016l-.707-1.083v1.593h-.754zm3.469 0h2.235v.658h-1.473v.422h1.334v.61h-1.334v.442h1.493v.658h-2.255zm-5.3.897l-.315.793h.624zm-1.145 5.19h8.014l-4.09 1.348z"/>'),
  xbox: F('<path d="M4.102 21.033C6.211 22.881 8.977 24 12 24c3.026 0 5.789-1.119 7.902-2.967 1.877-1.912-4.316-8.709-7.902-11.417-3.582 2.708-9.779 9.505-7.898 11.417zm11.16-14.406c2.5 2.961 7.484 10.313 6.076 12.912C23.002 17.48 24 14.861 24 12.004c0-3.34-1.365-6.362-3.57-8.536 0 0-.027-.022-.082-.042-.063-.022-.152-.045-.281-.045-.592 0-1.985.434-4.805 3.246zM3.654 3.426c-.057.02-.082.041-.086.042C1.365 5.642 0 8.664 0 12.004c0 2.854.998 5.473 2.661 7.533-1.401-2.605 3.579-9.951 6.08-12.91-2.82-2.813-4.216-3.245-4.806-3.245-.131 0-.223.021-.281.046v-.002zM12 3.551S9.055 1.828 6.755 1.746c-.903-.033-1.454.295-1.521.339C7.379.646 9.659 0 11.984 0H12c2.334 0 4.605.646 6.766 2.085-.068-.046-.615-.372-1.52-.339C14.946 1.828 12 3.545 12 3.545v.006z"/>'),
  folder: L('<path d="M3 7.5a2 2 0 0 1 2-2h3.4l2 2H19a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>'),
  link: L('<path d="M9.5 14.5l5-5"/><path d="M11 6.5l1.2-1.2a4 4 0 0 1 5.7 5.7L16.5 12"/><path d="M13 17.5l-1.2 1.2a4 4 0 0 1-5.7-5.7L7.5 12"/>'),
  together: L('<rect x="3.5" y="8" width="12.5" height="12.5" rx="2.5"/><path d="M8 8V6a2.5 2.5 0 0 1 2.5-2.5H18A2.5 2.5 0 0 1 20.5 6v7.5A2.5 2.5 0 0 1 18 16h-2"/>'),
  check: L('<path d="M5 12.5l4.5 4.5L19 7"/>'),
  plus: L('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),
  plusSquare: L('<rect x="4" y="4" width="16" height="16" rx="3.5"/><line x1="12" y1="8.5" x2="12" y2="15.5"/><line x1="8.5" y1="12" x2="15.5" y2="12"/>'),
  refresh: L('<path d="M3.5 9a8.5 8.5 0 0 1 14.2-3.2L20 8"/><path d="M20 3.8V8h-4.2"/><path d="M20.5 15a8.5 8.5 0 0 1-14.2 3.2L4 16"/><path d="M4 20.2V16h4.2"/>'),
  download: L('<path d="M12 3.5v11"/><path d="M7.5 10.5 12 15l4.5-4.5"/><path d="M4.5 18.5h15"/>'),
  list: L('<line x1="8.5" y1="7" x2="20" y2="7"/><line x1="8.5" y1="12" x2="20" y2="12"/><line x1="8.5" y1="17" x2="20" y2="17"/><circle cx="4.6" cy="7" r="1.2" fill="currentColor" stroke="none"/><circle cx="4.6" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="4.6" cy="17" r="1.2" fill="currentColor" stroke="none"/>'),
  gog: F('<path d="M7.15 15.24H4.36a.4.4 0 0 0-.4.4v2c0 .21.18.4.4.4h2.8v1.32h-3.5c-.56 0-1.02-.46-1.02-1.03v-3.39c0-.56.46-1.02 1.03-1.02h3.48v1.32zM8.16 11.54c0 .58-.47 1.05-1.05 1.05H2.63v-1.35h3.78a.4.4 0 0 0 .4-.4V6.39a.4.4 0 0 0-.4-.4H4.39a.4.4 0 0 0-.41.4v2.02c0 .23.18.4.4.4H6v1.35H3.68c-.58 0-1.05-.46-1.05-1.04V5.68c0-.57.47-1.04 1.05-1.04H7.1c.58 0 1.05.47 1.05 1.04v5.86zM21.36 19.36h-1.32v-4.12h-.93a.4.4 0 0 0-.4.4v3.72h-1.33v-4.12h-.93a.4.4 0 0 0-.4.4v3.72h-1.33v-4.42c0-.56.46-1.02 1.03-1.02h5.61v5.44zM21.37 11.54c0 .58-.47 1.05-1.05 1.05h-4.48v-1.35h3.78a.4.4 0 0 0 .4-.4V6.39a.4.4 0 0 0-.4-.4h-2.03a.4.4 0 0 0-.4.4v2.02c0 .23.18.4.4.4h1.62v1.35H16.9c-.58 0-1.05-.46-1.05-1.04V5.68c0-.57.47-1.04 1.05-1.04h3.43c.58 0 1.05.47 1.05 1.04v5.86zM13.72 4.64h-3.44c-.58 0-1.04.47-1.04 1.04v3.44c0 .58.46 1.04 1.04 1.04h3.44c.57 0 1.04-.46 1.04-1.04V5.68c0-.57-.47-1.04-1.04-1.04m-.3 1.75v2.02a.4.4 0 0 1-.4.4h-2.03a.4.4 0 0 1-.4-.4V6.4c0-.22.17-.4.4-.4H13c.23 0 .4.18.4.4zM12.63 13.92H9.24c-.57 0-1.03.46-1.03 1.02v3.39c0 .57.46 1.03 1.03 1.03h3.39c.57 0 1.03-.46 1.03-1.03v-3.39c0-.56-.46-1.02-1.03-1.02m-.3 1.72v2a.4.4 0 0 1-.4.4v-.01H9.94a.4.4 0 0 1-.4-.4v-1.99c0-.22.18-.4.4-.4h2c.22 0 .4.18.4.4zM23.49 1.1a1.74 1.74 0 0 0-1.24-.52H1.75A1.74 1.74 0 0 0 0 2.33v19.34a1.74 1.74 0 0 0 1.75 1.75h20.5A1.74 1.74 0 0 0 24 21.67V2.33c0-.48-.2-.92-.51-1.24m0 20.58a1.23 1.23 0 0 1-1.24 1.24H1.75A1.23 1.23 0 0 1 .5 21.67V2.33a1.23 1.23 0 0 1 1.24-1.24h20.5a1.24 1.24 0 0 1 1.24 1.24v19.34z"/>'),
  ea: F('<path d="M16.635 6.162l-5.928 9.377H4.24l1.508-2.3h4.024l1.474-2.335H2.264L.79 13.239h2.156L0 17.84h12.072l4.563-7.259 1.652 2.66h-1.401l-1.473 2.299h4.347l1.473 2.3H24zm-11.461.107L3.7 8.604l9.52-.035 1.474-2.3z"/>'),
  ubisoft: F('<path d="M23.561 11.988C23.301-.304 6.954-4.89.656 6.634c.282.206.661.477.943.672a11.747 11.747 0 00-.976 3.067 11.885 11.885 0 00-.184 2.071C.439 18.818 5.621 24 12.005 24c6.385 0 11.556-5.17 11.556-11.556v-.455zm-20.27 2.06c-.152 1.246-.054 1.636-.054 1.788l-.282.098c-.108-.206-.37-.932-.488-1.908C2.163 10.308 4.7 6.96 8.57 6.33c3.544-.52 6.937 1.68 7.728 4.758l-.282.098c-.087-.087-.228-.336-.77-.878-4.281-4.281-11.002-2.32-11.956 3.74zm11.002 2.081a3.145 3.145 0 01-2.59 1.355 3.15 3.15 0 01-3.155-3.155 3.159 3.159 0 012.927-3.144c1.018-.043 1.972.51 2.416 1.398a2.58 2.58 0 01-.455 2.95c.293.205.575.4.856.595zm6.58.12c-1.669 3.782-5.106 5.766-8.77 5.712-7.034-.347-9.083-8.466-4.38-11.393l.207.206c-.076.108-.358.325-.791 1.182-.51 1.041-.672 2.081-.607 2.732.369 5.67 8.314 6.83 11.045 1.214C21.057 8.217 11.822.401 3.626 6.374l-.184-.184C5.599 2.808 9.816 1.3 13.837 2.309c6.147 1.55 9.453 7.956 7.035 13.94z"/>'),
  dice: L('<rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="8.8" cy="8.8" r="1.25" fill="currentColor" stroke="none"/><circle cx="15.2" cy="15.2" r="1.25" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none"/>'),
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

// Latest message from the updater, mirrored into Settings → Updates.
let updateState = { state: 'idle' };

// User lists. A Steam-linked list's members are Steam's own (steamGames) plus
// whatever was added here (games) — Arcadia never writes back to Steam.
let lists = [];
const listOf = (filter) => lists.find((l) => 'list:' + l.id === filter) || null;
const listMembers = (l) => new Set([...(l.steamGames || []), ...(l.games || [])]);
const isInList = (l, gameId) => (l.games || []).includes(gameId) || (l.steamGames || []).includes(gameId);

// Metacritic scores keyed by Steam appid, filled in the background by main.
const ratings = new Map();
const steamAppId = (g) => (g.source === 'steam' && /^steam:\d+$/.test(g.id) ? g.id.slice(6) : null);
const ratingOf = (g) => {
  const id = steamAppId(g);
  return id ? ratings.get(id) || null : null;
};

const NAV_SOURCES = [
  { key: 'steam', icon: 'steam' },
  { key: 'epic', icon: 'epic' },
  { key: 'xbox', icon: 'xbox' },
  { key: 'gog', icon: 'gog' },
  { key: 'ea', icon: 'ea' },
  { key: 'ubisoft', icon: 'ubisoft' },
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
  APP_VERSION = await api.getVersion();
  IS_STORE = await api.isStore();
  accountList = await api.listAccounts();
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
  api.onUpdateStatus(onUpdateStatus);
  api.onDownloads(onDownloads);
  api.onRatings(applyRatings);
  api.onSteamCollectionsDeleted((ids) => { if (ids && ids.length) toast(t('listSteamApplied', { n: ids.length }), 'success'); });
  // Whatever was cached from earlier sessions is available immediately.
  api.allRatings().then((known) => {
    for (const [appid, score] of Object.entries(known || {})) ratings.set(appid, score);
    if (ratings.size) renderGrid();
  });
  // A finished install rescans in the background; pick up the fresh library.
  api.onLibraryUpdated((data) => {
    state.games = data.games || state.games;
    state.settings = data.settings || state.settings;
    render();
    updateCardProgress();
  });
  await loadCollections();
  downloadList = await api.listDownloads();
  refreshDownloadsButton();

  if (state.games.length === 0) await runScan();
  else silentRescan(); // every launch: refresh installs/uninstalls in the background

  // First-run: ask about autostart, then run the guided tour.
  if (!state.settings.onboarded) {
    if (!IS_STORE) await askStartup();
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
    // Side 320 → diagonal 452, matching the circle's extent. A 45° square is
    // measured across its diagonal, so the raw side has to be ÷√2 or the
    // diamond renders noticeably larger than every other shape.
    case 'diamond': return `<rect x="96" y="96" width="320" height="320" rx="56" fill="${fill}" transform="rotate(45 256 256)"/>`;
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
      // The glyph spans y 184–360, so its own centre sits at 272 — nudge it up
      // to line up with the other symbols on 256.
      return `<g transform="translate(0 -16)"><path d="M256 360C148 288 150 196 212 184c30-6 44 22 44 22s14-28 44-22c62 12 64 104-44 176z" fill="${play}" stroke="${play}" stroke-width="14" stroke-linejoin="round"/></g>`;
    case 'letterA':
      return `<path d="M204 332 L256 180 L308 332 M226 286 H286" fill="none" stroke="${play}" stroke-width="29" stroke-linejoin="round" stroke-linecap="round"/>`;
    default:
      // Rounded corners are part of the path rather than a fat stroke, so the
      // in-app logo, the window icon and assets/icon.png are the same shape —
      // a stroked triangle leaves a notch at the closing seam in some renderers.
      return `<path d="M 196 195 L 196 317 A 26 26 0 0 0 234.7 339.7 L 344.1 278.7 A 26 26 0 0 0 344.1 233.3 L 234.7 172.3 A 26 26 0 0 0 196 195 Z" fill="${play}"/>`;
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
  else if (state.filter === 'installed') list = list.filter((g) => g.installed !== false);
  else if (state.filter === 'notInstalled') list = list.filter((g) => g.installed === false);
  else if (state.filter.startsWith('list:')) {
    const l = listOf(state.filter);
    const want = l ? listMembers(l) : new Set();
    list = list.filter((g) => want.has(g.id));
  }
  else if (state.filter !== 'all') list = list.filter((g) => g.source === state.filter);

  if (state.search.trim()) {
    const q = state.search.trim().toLocaleLowerCase('tr');
    list = list.filter((g) => displayTitle(g).toLocaleLowerCase('tr').includes(q));
  }

  const by = {
    title: (a, b) => displayTitle(a).localeCompare(displayTitle(b), lang),
    recent: (a, b) => (b.addedAt || 0) - (a.addedAt || 0),
    played: (a, b) => (b.lastPlayed || 0) - (a.lastPlayed || 0),
    // Unrated games sort last rather than pretending to be a zero.
    rating: (a, b) => (ratingOf(b) || -1) - (ratingOf(a) || -1) || displayTitle(a).localeCompare(displayTitle(b), lang),
  };
  const cmp = by[state.sort] || by.title;
  // Favourites lead every view, so a starred game always sits top-left however
  // the rest is sorted. (In the favourites view they all are, so it's a no-op.)
  return list.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0) || cmp(a, b));
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

  const installed = live.filter((g) => g.installed !== false).length;
  const notInstalled = live.length - installed;

  // Installed / not-installed only mean something once a linked account has
  // added games that aren't on disk; until then they'd both equal "All games".
  if (notInstalled > 0) nav.appendChild(el('div', 'nav-section', t('librarySection')));
  nav.appendChild(navItem('all', 'grid', t('allGames'), live.length, active));
  if (notInstalled > 0) {
    nav.appendChild(navItem('installed', 'check', t('filterInstalled'), installed, active));
    nav.appendChild(navItem('notInstalled', 'download', t('filterNotInstalled'), notInstalled, active));
  }
  nav.appendChild(navItem('favorites', 'star', t('favorites'), live.filter((g) => g.favorite).length, active));

  // Lists: Arcadia's own plus anything mirrored from Steam. Draggable, so the
  // order here is the user's.
  if (lists.length) {
    nav.appendChild(el('div', 'nav-section', t('listsSection')));
    const box = el('div', 'nav-lists');
    for (const l of lists) {
      const members = listMembers(l);
      const count = live.filter((g) => members.has(g.id)).length;
      const item = navItem('list:' + l.id, l.steamId ? 'steam' : 'list', l.name, count, active);
      item.classList.add('nav-list');
      item.draggable = true;
      item.dataset.listId = l.id;
      item.oncontextmenu = (e) => { e.preventDefault(); openListMenu(l, e.clientX, e.clientY); };
      box.appendChild(item);
    }
    wireListDrag(box);
    nav.appendChild(box);
  }

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
  if (state.filter === 'installed') return t('filterInstalled');
  if (state.filter === 'notInstalled') return t('filterNotInstalled');
  if (state.filter.startsWith('list:')) {
    const l = listOf(state.filter);
    return l ? l.name : t('listsSection');
  }
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
  requestVisibleRatings();
}

// Every image worth trying for a card, best first. For Steam games the URLs
// Steam's own store API returned (steamArt) replace the guessed legacy ones —
// those guesses are wrong for newer games and can even "load" a grey
// placeholder, which no error handler ever catches.
function coverCandidates(g) {
  const list = [g.customCover, g.localCover];
  if (g.source === 'steam' && g.steamArt) {
    list.push(g.steamArt.cover, g.autoCover, g.steamArt.header);
  } else {
    list.push(g.cover, g.autoCover, g.coverFallback);
  }
  return [...new Set(list.filter(Boolean))];
}
const coverUrl = (g) => coverCandidates(g)[0] || null;

// Points an <img> at a game's candidates in turn; when all fail, `onGiveUp`
// swaps in the drawn placeholder. One implementation for the grid, the random
// picker and live cover updates, so they can't drift apart.
function loadCover(img, g, onGiveUp) {
  const list = coverCandidates(g);
  let i = 0;
  if (!list.length) { onGiveUp(); return; }
  img.onerror = () => {
    i += 1;
    if (i < list.length) img.src = list[i];
    else { img.onerror = null; onGiveUp(); }
  };
  img.addEventListener('load', () => fitCover(img));
  img.src = list[0];
}

// Portrait art fills its 2:3 slot. Anything noticeably wider is shown whole
// over a blurred copy of itself rather than cropped down to a sliver.
function fitCover(img) {
  const wide = img.naturalWidth && img.naturalHeight && img.naturalWidth / img.naturalHeight > 0.8;
  img.classList.toggle('wide', !!wide);
  const host = img.parentElement;
  if (!host) return;
  let blur = host.querySelector(':scope > .cover-blur');
  if (wide) {
    if (!blur) { blur = el('div', 'cover-blur'); host.insertBefore(blur, img); }
    blur.style.backgroundImage = `url("${img.currentSrc || img.src}")`;
  } else if (blur) {
    blur.remove();
  }
}
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

const metaBand = (n) => (n >= 75 ? 'good' : n >= 50 ? 'mixed' : 'bad');

function metaBadge(score) {
  const b = el('div', 'card-meta ' + metaBand(score), String(score));
  b.title = `${t('metacriticLabel')}: ${score}`;
  return b;
}

// Scores arrived for games already on screen — drop the badge in without
// redrawing the grid (which would reload every cover).
function applyRatings(batch) {
  for (const r of batch || []) {
    if (!r || !r.score) continue;
    ratings.set(String(r.appid), r.score);
    const cardEl = document.querySelector(`.card[data-id="${CSS.escape('steam:' + r.appid)}"]`);
    if (!cardEl || cardEl.querySelector('.card-meta')) continue;
    cardEl.querySelector('.thumb').appendChild(metaBadge(r.score));
  }
  // A rating-sorted view genuinely changes order as scores land, so redraw it.
  if (state.sort === 'rating' && (batch || []).length) renderGrid();
}

// Ask main for the scores of what we just drew; anything unknown is queued
// with priority so the visible grid fills in first.
function requestVisibleRatings() {
  const ids = visibleGames().map(steamAppId).filter(Boolean).slice(0, 400);
  if (!ids.length) return;
  api.requestRatings(ids, true).then((known) => {
    let added = 0;
    for (const [appid, v] of Object.entries(known || {})) {
      if (!ratings.has(appid)) { ratings.set(appid, v.score); added++; }
    }
    if (added) applyRatings(Object.entries(known).map(([appid, v]) => ({ appid, score: v.score })));
  });
}

function card(g) {
  const c = el('div', 'card' + (g.missing ? ' missing' : ''));
  c.dataset.id = g.id;
  const title = esc(displayTitle(g));

  const thumb = el('div', 'thumb');
  const cover = coverUrl(g);

  if (cover) {
    const img = el('img', 'cover');
    img.alt = title; img.loading = 'lazy';
    loadCover(img, g, () => { img.remove(); thumb.prepend(placeholder(g)); });
    thumb.appendChild(img);
  } else {
    thumb.appendChild(placeholder(g));
  }

  // Owned but not installed: dim the art, show a badge, and offer "install"
  // instead of a play button — clicking hands off to the store.
  const notInstalled = g.installed === false;
  if (notInstalled) c.classList.add('not-installed');

  thumb.appendChild(el('div', 'card-overlay',
    `<div class="play-btn">${icon(notInstalled ? 'download' : 'play')}</div>` +
    `<div class="close-btn-center" title="${esc(t('closeGameTip'))}">${icon('close')}</div>`));
  if (notInstalled) thumb.appendChild(el('div', 'card-badge', esc(t('notInstalled'))));

  // Metacritic score, top-left, revealed on hover. Colour follows Metacritic's
  // own bands so a glance is enough: green good, yellow mixed, red poor.
  const score = ratingOf(g);
  if (score) thumb.appendChild(metaBadge(score));
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
  // Not installed: this is an install request, not a play request.
  if (g.installed === false) { await installGame(g); return; }
  toast(t('launching', { t: displayTitle(g) }));
  try {
    const res = await api.launch(g.id);
    // A hand-off to the store isn't a play session — don't touch play stats.
    if (res === 'install') return;
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
  // Account sync reports as "account:<provider>" or "account:<provider>:120/450".
  if (key.startsWith('account:')) {
    const [id, count] = key.slice('account:'.length).split(':');
    const meta = ACCOUNT_META.find((m) => m.id === id);
    const label = meta ? meta.label : id;
    return count ? `${label} (${count})` : label;
  }
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

// A SteamGridDB cover arrived from the main process. Patch just that one card:
// rebuilding the grid would recreate every <img> on the page, and with a linked
// account that is a thousand of them — they'd all blank out and reload on every
// single cover that lands.
function applyCoverUpdate(upd) {
  if (!upd || !upd.id) return;
  const g = state.games.find((x) => x.id === upd.id);
  if (!g) return;
  // Two senders: Steam's store API (steamArt) and SteamGridDB (cover).
  if (upd.steamArt) g.steamArt = upd.steamArt;
  if (upd.cover) g.autoCover = upd.cover;

  const cardEl = document.querySelector(`.card[data-id="${CSS.escape(upd.id)}"]`);
  if (!cardEl) return; // not on screen in this view — it'll be right when drawn
  const thumb = cardEl.querySelector('.thumb');
  const want = coverUrl(g);
  if (!want) return;

  const img = thumb.querySelector('img.cover');
  if (img && img.src === want) return;

  // Load the new art off-screen first and only swap once it has arrived, so
  // the tile never flashes empty — and a candidate that fails just moves on.
  const next = el('img', 'cover');
  next.alt = displayTitle(g);
  let swapped = false;
  next.onload = () => {
    if (swapped) return;
    swapped = true;
    const old = thumb.querySelector('img.cover') || thumb.querySelector('.card-ph');
    if (old) old.replaceWith(next); else thumb.prepend(next);
  };
  loadCover(next, g, () => { /* keep whatever the card shows now */ });
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
  const addTo = el('div', 'menu-item');
  addTo.innerHTML = `<span class="ico">${icon('list')}</span><span>${esc(t('listAddTo'))}</span><span class="menu-more">›</span>`;
  addTo.onclick = () => {
    const r = addTo.getBoundingClientRect();
    openListPicker(g, r.left, r.top);
  };
  menu.appendChild(addTo);
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

/* ---------------------------- Random picker ---------------------------- */

// "What should I play?" — pulls one game out of the whole library (installed or
// just owned) and offers to start it. Rerolling never repeats until the pool is
// exhausted, so mashing the button actually shows you new things.
let rolled = new Set();
let rolledGame = null;

function rollGame() {
  const pool = state.games.filter((g) => !g.hidden);
  if (!pool.length) return null;
  let left = pool.filter((g) => !rolled.has(g.id));
  if (!left.length) { rolled.clear(); left = pool; } // seen them all: start over
  const pick = left[Math.floor(Math.random() * left.length)];
  rolled.add(pick.id);
  return pick;
}

function renderRandom() {
  const body = $('#random-body');
  body.innerHTML = '';
  const g = rolledGame;
  if (!g) {
    body.appendChild(el('div', 'folder-empty', esc(t('randomEmpty'))));
    return;
  }

  const art = el('div', 'rnd-art');
  const cover = coverUrl(g);
  if (cover) {
    const img = el('img');
    img.alt = displayTitle(g);
    loadCover(img, g, () => { img.remove(); art.appendChild(placeholder(g)); });
    art.appendChild(img);
  } else {
    art.appendChild(placeholder(g));
  }
  body.appendChild(art);

  body.appendChild(el('div', 'rnd-title', esc(displayTitle(g))));

  const srcLabel = t('src_' + g.source) || g.source;
  const stateLabel = g.installed === false ? t('notInstalled') : t('filterInstalled');
  body.appendChild(el('div', 'rnd-meta', `${esc(srcLabel)} · ${esc(stateLabel)}`));

  const actions = el('div', 'rnd-actions');
  const notInstalled = g.installed === false;
  const go = el('button', 'btn btn-primary',
    `<span class="ico">${icon(notInstalled ? 'download' : 'play')}</span>` +
    esc(notInstalled ? t('installGame') : t('randomPlay')));
  go.onclick = () => { closeRandom(); launch(g); };
  actions.appendChild(go);

  const again = el('button', 'btn', `<span class="ico">${icon('dice')}</span>${esc(t('randomAnother'))}`);
  again.onclick = () => { rolledGame = rollGame(); renderRandom(); };
  actions.appendChild(again);
  body.appendChild(actions);
}

function openRandom() {
  rolledGame = rollGame();
  renderRandom();
  $('#random-modal').hidden = false;
}
function closeRandom() { $('#random-modal').hidden = true; }

/* ------------------------------ Downloads ------------------------------ */

let downloadList = [];

const fmtBytes = (n) => {
  if (!n || n < 0) return '';
  const u = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${n < 10 && i > 0 ? n.toFixed(1) : Math.round(n)} ${u[i]}`;
};

const fmtDuration = (secs) => {
  if (secs == null || !isFinite(secs)) return '';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h) return `${h} sa ${m} dk`;
  if (m) return `${m} dk`;
  return `${Math.max(1, Math.round(secs))} sn`;
};

const DL_STATE_KEY = {
  pending: 'dlPending', downloading: 'dlDownloading',
  installing: 'dlInstalling', done: 'dlDone', error: 'dlError', stalled: 'dlStalled',
};
const DL_FINISHED = new Set(['done', 'error', 'stalled']);

function openDownloads() { buildDownloads(); $('#downloads-modal').hidden = false; }
function closeDownloads() { $('#downloads-modal').hidden = true; }

function downloadRow(d) {
  const row = el('div', 'dl-row' + (d.state === 'done' ? ' done' : '') + (d.state === 'error' || d.state === 'stalled' ? ' failed' : ''));
  const meta = [];
  if (d.state === 'downloading' || d.state === 'installing') {
    if (d.total) meta.push(`${fmtBytes(d.downloaded)} / ${fmtBytes(d.total)}`);
    if (d.speed > 0) meta.push(`${fmtBytes(d.speed)}/s`);
    if (d.eta) meta.push(t('dlEta', { t: fmtDuration(d.eta) }));
  } else if (d.state === 'error') {
    meta.push(d.error || '');
  }

  const stateLabel = t(DL_STATE_KEY[d.state] || 'dlPending');
  const pct = d.percent;
  row.innerHTML =
    '<div class="dl-head">' +
      `<span class="dl-title">${esc(d.title)}</span>` +
      `<span class="dl-pct">${pct == null ? '' : pct + '%'}</span>` +
    '</div>' +
    `<div class="dl-bar${pct == null && d.state !== 'done' && d.state !== 'error' ? ' indeterminate' : ''}">` +
      `<span style="width:${pct == null ? 100 : pct}%"></span>` +
    '</div>' +
    `<div class="dl-meta"><span class="dl-state">${esc(stateLabel)}</span>${meta.length ? ' · ' + esc(meta.join(' · ')) : ''}</div>`;

  const actions = el('div', 'dl-actions');
  const openBtn = el('button', 'btn btn-small', esc(t('dlOpenClient')));
  openBtn.onclick = () => api.openStoreClient(d.source);
  actions.appendChild(openBtn);

  if (DL_FINISHED.has(d.state)) {
    // Nothing left to stop — the row is just history now.
    const rmBtn = el('button', 'btn btn-small', esc(t('dlRemove')));
    rmBtn.onclick = async () => { downloadList = await api.forgetDownload(d.id); buildDownloads(); updateCardProgress(); };
    actions.appendChild(rmBtn);
  } else {
    const cancelBtn = el('button', 'btn btn-small btn-danger', esc(t('dlCancel')));
    cancelBtn.onclick = async () => {
      cancelBtn.disabled = true;
      const res = await api.cancelDownload(d.id);
      await loadCollections();
  downloadList = await api.listDownloads();
      if (res && res.openedStore) toast(t('dlCancelledStore'));
      buildDownloads();
      refreshDownloadsButton();
      updateCardProgress();
    };
    actions.appendChild(cancelBtn);
  }
  row.appendChild(actions);

  if (d.state === 'stalled') row.appendChild(el('div', 'hint', esc(t('dlStalledHint'))));
  else if (d.source === 'xbox' && d.state !== 'done') row.appendChild(el('div', 'hint', esc(t('dlXboxNote'))));
  return row;
}

function buildDownloads() {
  const body = $('#downloads-body');
  body.innerHTML = '';
  if (!downloadList.length) {
    body.appendChild(el('div', 'folder-empty', esc(t('dlEmpty'))));
    return;
  }
  for (const d of downloadList) body.appendChild(downloadRow(d));

  if (downloadList.some((d) => DL_FINISHED.has(d.state))) {
    const clear = el('button', 'btn', esc(t('dlClear')));
    clear.onclick = async () => { downloadList = await api.clearDownloads(); buildDownloads(); };
    const wrap = el('div', 'upd-actions');
    wrap.appendChild(clear);
    body.appendChild(wrap);
  }
  body.appendChild(el('div', 'hint', esc(t('dlHandoff'))));
}

// The titlebar button only exists while something is being installed.
function refreshDownloadsButton() {
  const btn = $('#btn-downloads');
  const active = downloadList.filter((d) => !DL_FINISHED.has(d.state));
  btn.hidden = downloadList.length === 0;
  $('#dl-badge').textContent = active.length || '';
  btn.classList.toggle('busy', active.length > 0);
}

function onDownloads(list) {
  const before = new Map(downloadList.map((d) => [d.id, d.state]));
  downloadList = list || [];
  for (const d of downloadList) {
    if (d.state === 'done' && before.get(d.id) !== 'done') toast(t('dlFinished', { t: d.title }), 'success');
  }
  refreshDownloadsButton();
  if (!$('#downloads-modal').hidden) buildDownloads();
  updateCardProgress();
}

// Paint the live percentage onto the grid cards themselves, so progress is
// visible without opening the downloads screen.
function updateCardProgress() {
  const byId = new Map(downloadList.map((d) => [d.id, d]));
  for (const cardEl of document.querySelectorAll('.card')) {
    const d = byId.get(cardEl.dataset.id);
    let bar = cardEl.querySelector('.card-progress');
    if (!d || DL_FINISHED.has(d.state)) { if (bar) bar.remove(); continue; }
    if (!bar) {
      bar = el('div', 'card-progress', '<span></span>');
      cardEl.querySelector('.thumb').appendChild(bar);
    }
    bar.classList.toggle('indeterminate', d.percent == null);
    bar.firstChild.style.width = (d.percent == null ? 100 : d.percent) + '%';
  }
}

async function installGame(g) {
  if (!g.installUrl) { toast(t('dlNoUrl'), 'error'); return; }
  try {
    downloadList = await api.installGame(g.id);
    toast(t('dlStarted', { t: displayTitle(g) }));
    refreshDownloadsButton();
    updateCardProgress();
  } catch (err) {
    toast(t('launchFailed', { e: err.message }), 'error');
  }
}

/* ------------------------------ Accounts ------------------------------- */

const ACCOUNT_META = [
  { id: 'steam', label: 'Steam', icon: 'steam' },
  { id: 'epic', label: 'Epic Games', icon: 'epic' },
  { id: 'xbox', label: 'Xbox / Game Pass', icon: 'xbox' },
  { id: 'gog', label: 'GOG.com', icon: 'gog' },
  { id: 'ea', label: 'EA app', icon: 'ea' },
  { id: 'ubisoft', label: 'Ubisoft Connect', icon: 'ubisoft' },
];

let accountList = [];

// `heading: false` for the dedicated modal, whose own title already says it.
function accountsGroup({ heading = true } = {}) {
  const g = el('div', 'setting-group setting-group--acc');
  if (heading) g.appendChild(el('h3', null, esc(t('settingsAccounts'))));

  for (const meta of ACCOUNT_META) {
    const acc = accountList.find((a) => a.id === meta.id) || { linked: false };
    const row = el('div', 'acc-row');
    const sub = acc.linked ? t('accLinked', { n: acc.name || '' }) : '';
    row.innerHTML =
      `<span class="acc-ico">${icon(meta.icon)}</span>` +
      `<span class="acc-text"><span class="acc-name">${esc(meta.label)}</span>` +
      (sub ? `<span class="acc-sub">${esc(sub)}</span>` : '') +
      '</span>';

    const btn = el('button', 'btn' + (acc.linked ? '' : ' btn-primary'),
      esc(acc.linked ? t('accDisconnect') : t('accConnect')));
    btn.onclick = async () => {
      btn.disabled = true;
      try {
        if (acc.linked) {
          accountList = await api.logoutAccount(meta.id);
          toast(t('accDisconnected', { s: meta.label }));
          await refreshLibrary();
        } else {
          const res = await api.loginAccount(meta.id);
          accountList = await api.listAccounts();
          if (res && res.linked) {
            toast(t('accConnected', { s: meta.label }));
            await syncAccounts(); // pull the freshly linked library in
            if (meta.id === 'steam') await loadCollections({ ask: true });
          } else {
            // Silence here reads as "the button is broken", so say what happened.
            toast(t('accCancelled', { s: meta.label }), 'error');
          }
        }
      } catch (err) {
        toast(t('accFailed', { s: meta.label, e: err.message }), 'error');
      } finally {
        btn.disabled = false;
        refreshAccountsGroup();
      }
    };
    row.appendChild(btn);
    g.appendChild(row);
  }

  if (accountList.some((a) => a.linked)) {
    const syncBtn = el('button', 'btn', `<span class="ico">${icon('refresh')}</span>${esc(t('accSync'))}`);
    syncBtn.onclick = async () => {
      syncBtn.disabled = true;
      try { await syncAccounts(); } finally { syncBtn.disabled = false; }
    };
    const wrap = el('div', 'upd-actions');
    wrap.appendChild(syncBtn);
    g.appendChild(wrap);
  }

  g.appendChild(el('div', 'hint', esc(t('accHint'))));
  return g;
}

// The accounts UI lives in two places: its own modal (the sidebar button) and
// a section inside Settings. Both render the same group.
// Closes Steam through its own -shutdown, writes the queued collection
// deletions and starts Steam again. Only ever run on the user's say-so.
async function applySteamDeletesNow() {
  showScan(true, t('steamApplying'));
  try {
    const res = await api.applySteamDeletesNow();
    if (res && res.error === 'steam-busy') toast(t('steamBusy'), 'error');
    else if (res && res.error) toast(t('steamBusy'), 'error');
    else if (res && res.applied && res.applied.length) toast(t('steamApplied', { n: res.applied.length }), 'success');
  } finally {
    showScan(false);
    refreshListsGroup();
  }
}

// Settings → Steam Lists: toggle the sidebar mirror, re-read the collections,
// and show what was found so it's obvious whether it worked.
function steamListsGroup() {
  const g = el('div', 'setting-group setting-group--lists');
  g.appendChild(el('h3', null, esc(t('steamListsSection'))));

  const row = el('div', 'toggle-row');
  const on = !!state.settings.steamCollections;
  row.innerHTML = `<label>${esc(t('steamListsLabel'))}</label><span class="switch"><input type="checkbox" ${on ? 'checked' : ''}><span class="track"></span></span>`;
  row.querySelector('input').onchange = async (e) => {
    state.settings = await api.setSettings({ steamCollections: e.target.checked, steamCollectionsAsked: true });
    await loadCollections();
    render();
    refreshListsGroup();
  };
  g.appendChild(row);

  const steamLists = lists.filter((l) => l.steamId);
  if (steamLists.length) {
    const box = el('div', 'folder-list');
    for (const l of steamLists) {
      const item = el('div', 'folder-item');
      item.innerHTML = `<span class="path" title="${esc(l.name)}">${esc(l.name)}</span><span class="acc-sub">${(l.steamGames || []).length}</span>`;
      box.appendChild(item);
    }
    g.appendChild(box);
  } else {
    g.appendChild(el('div', 'folder-empty', esc(t('steamListsNone'))));
  }

  const refresh = el('button', 'btn', `<span class="ico">${icon('refresh')}</span>${esc(t('steamListsRefresh'))}`);
  refresh.onclick = async () => { await loadCollections(); refreshListsGroup(); };
  const wrap = el('div', 'upd-actions');
  wrap.appendChild(refresh);
  g.appendChild(wrap);

  // Deletions still waiting for Steam to close, with a way to do it now.
  const pendingBox = el('div', 'upd-actions');
  g.appendChild(pendingBox);
  api.pendingSteamDeletes().then((pending) => {
    if (!pending || !pending.length) return;
    pendingBox.before(el('div', 'upd-status', esc(t('steamPendingInfo', { n: pending.length }))));
    const go = el('button', 'btn btn-primary', `<span class="ico">${icon('refresh')}</span>${esc(t('steamApplyNow'))}`);
    go.onclick = () => { if (confirm(t('steamApplyAsk'))) applySteamDeletesNow(); };
    pendingBox.appendChild(go);
  });

  g.appendChild(el('div', 'hint', esc(t('steamListsHint'))));
  return g;
}

function refreshListsGroup() {
  const old = $('#settings-body .setting-group--lists');
  if (old) old.replaceWith(steamListsGroup());
}

function refreshAccountsGroup() {
  const inSettings = $('#settings-body .setting-group--acc');
  if (inSettings) inSettings.replaceWith(accountsGroup());
  const inModal = $('#accounts-body .setting-group--acc');
  if (inModal) inModal.replaceWith(accountsGroup({ heading: false }));
}

function openAccounts() {
  const body = $('#accounts-body');
  body.innerHTML = '';
  body.appendChild(accountsGroup({ heading: false }));
  $('#accounts-modal').hidden = false;
}
function closeAccounts() { $('#accounts-modal').hidden = true; }

// Re-read the store after accounts changed, so the grid reflects it at once.
/* -------------------------------- Lists ---------------------------------- */

// Pulls Steam's collections in (when enabled) and reloads every list. On the
// first sight after linking Steam it asks whether to mirror them at all.
async function loadCollections({ ask = false } = {}) {
  if (ask && !state.settings.steamCollectionsAsked) {
    let found = [];
    try { found = await api.syncCollections(); } catch { /* ignore */ }
    // syncCollections only mirrors when the setting is on, so peek first.
    const steamLists = found.filter((l) => l.steamId);
    if (!state.settings.steamCollections) {
      const probe = await api.getLists();
      const names = (steamLists.length ? steamLists : probe.filter((l) => l.steamId)).slice(0, 3).map((l) => l.name).join(', ');
      const yes = await askCollections(steamLists.length || probe.filter((l) => l.steamId).length, names);
      state.settings = await api.setSettings({ steamCollections: yes, steamCollectionsAsked: true });
    }
  }
  try { lists = await api.syncCollections(); } catch { lists = []; }
  renderNav();
}

// Drag a list up or down to reorder; the order is saved as soon as it changes.
function wireListDrag(box) {
  let dragged = null;
  box.addEventListener('dragstart', (e) => {
    const item = e.target.closest('.nav-list');
    if (!item) return;
    dragged = item;
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    // Firefox/Chromium need *some* payload for a drag to start.
    try { e.dataTransfer.setData('text/plain', item.dataset.listId); } catch { /* ignore */ }
  });

  box.addEventListener('dragover', (e) => {
    if (!dragged) return;
    e.preventDefault();
    const over = e.target.closest('.nav-list');
    if (!over || over === dragged) return;
    const r = over.getBoundingClientRect();
    const after = e.clientY > r.top + r.height / 2;
    box.insertBefore(dragged, after ? over.nextSibling : over);
  });

  box.addEventListener('dragend', async () => {
    if (!dragged) return;
    dragged.classList.remove('dragging');
    dragged = null;
    const ids = [...box.querySelectorAll('.nav-list')].map((n) => n.dataset.listId);
    lists = await api.reorderLists(ids);
  });
}

function openListMenu(l, x, y) {
  const menu = $('#ctx');
  menu.innerHTML = '';
  const add = (label, ic, fn, cls) => {
    const item = el('div', 'menu-item' + (cls ? ' ' + cls : ''));
    item.innerHTML = `<span class="ico">${icon(ic)}</span><span>${esc(label)}</span>`;
    item.onclick = () => { closeMenu(); fn(); };
    menu.appendChild(item);
  };

  add(t('rename'), 'edit', async () => {
    const name = prompt(t('listRenamePrompt'), l.name);
    if (name === null) return;
    lists = await api.renameList(l.id, name.trim());
    render();
  });
  menu.appendChild(el('div', 'menu-sep'));
  add(t('listDelete'), 'trash', async () => {
    // A Steam-linked list is deleted in Steam too, on every device — ask first.
    if (l.steamId && !confirm(t('listDeleteSteamConfirm', { n: l.name }))) return;
    const res = await api.deleteList(l.id);
    lists = res.lists;
    if (state.filter === 'list:' + l.id) state.filter = 'all';
    render();
    if (res.steam === 'applied') toast(t('listDeletedSteam', { n: l.name }));
    else if (res.steam === 'pending') {
      // Steam is open: offer to close it now, or let it happen whenever the
      // user quits Steam themselves.
      if (confirm(t('steamApplyAsk'))) await applySteamDeletesNow();
      else toast(t('listDeletedSteamPending', { n: l.name }));
    } else toast(t('listDeleted', { n: l.name }));
  }, 'danger');

  menu.hidden = false;
  menu.style.left = Math.max(8, Math.min(x, window.innerWidth - 204)) + 'px';
  menu.style.top = Math.max(8, Math.min(y, window.innerHeight - menu.offsetHeight - 8)) + 'px';
}

// "Add to list" submenu for a game: every list, plus a way to make a new one.
function openListPicker(g, x, y) {
  const menu = $('#ctx');
  menu.innerHTML = '';

  for (const l of lists) {
    const inList = isInList(l, g.id);
    const fromSteam = (l.steamGames || []).includes(g.id);
    const item = el('div', 'menu-item' + (fromSteam ? ' disabled' : ''));
    item.innerHTML =
      `<span class="ico">${icon(inList ? 'check' : 'list')}</span>` +
      `<span>${esc(l.name)}</span>` +
      (l.steamId ? `<span class="menu-tag">Steam</span>` : '');
    if (!fromSteam) {
      item.onclick = async () => {
        closeMenu();
        lists = await api.setListGame(l.id, g.id, !inList);
        render();
        toast(inList ? t('listRemoved', { t: displayTitle(g), n: l.name })
                     : t('listAdded', { t: displayTitle(g), n: l.name }));
      };
    } else {
      // Membership that came from Steam can't be removed here, because Arcadia
      // doesn't write to Steam's collection store.
      item.title = t('listSteamLocked');
    }
    menu.appendChild(item);
  }

  if (lists.length) menu.appendChild(el('div', 'menu-sep'));
  const mk = el('div', 'menu-item');
  mk.innerHTML = `<span class="ico">${icon('plus')}</span><span>${esc(t('listNew'))}</span>`;
  mk.onclick = async () => {
    closeMenu();
    const name = prompt(t('listNewPrompt'), '');
    if (name === null || !name.trim()) return;
    const created = await api.createList(name.trim());
    lists = await api.setListGame(created.id, g.id, true);
    render();
    toast(t('listAdded', { t: displayTitle(g), n: created.name }));
  };
  menu.appendChild(mk);

  menu.hidden = false;
  menu.style.left = Math.max(8, Math.min(x, window.innerWidth - 224)) + 'px';
  menu.style.top = Math.max(8, Math.min(y, window.innerHeight - menu.offsetHeight - 8)) + 'px';
}

function askCollections(n, names) {
  return new Promise((resolve) => {
    const backdrop = el('div', 'modal-backdrop');
    const modal = el('div', 'modal modal-sm');
    modal.innerHTML = `<div class="modal-head"><h2>${esc(t('steamListsAskTitle'))}</h2></div>
      <div class="modal-body"><p class="startup-q">${esc(t('steamListsAskText', { n, names }))}</p></div>`;
    const foot = el('div', 'modal-foot');
    const no = el('button', 'btn', esc(t('steamListsNo')));
    no.onclick = () => { backdrop.remove(); resolve(false); };
    const yes = el('button', 'btn btn-primary', esc(t('steamListsYes')));
    yes.onclick = () => { backdrop.remove(); resolve(true); };
    foot.appendChild(no); foot.appendChild(yes);
    modal.appendChild(foot);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
  });
}

async function refreshLibrary() {
  const data = await api.getState();
  state.games = data.games || [];
  state.settings = data.settings || state.settings;
  render();
}

async function syncAccounts() {
  showScan(true, t('accSync'));
  const stop = api.onScanProgress((key) => {
    $('#scan-text').textContent = t('accSyncing', { s: scanLabel(key) });
  });
  try {
    const res = await api.syncAccounts();
    state.games = res.games || [];
    state.settings = res.settings || state.settings;
    render();
    for (const e of res.errors || []) {
      const label = (ACCOUNT_META.find((m) => m.id === e.id) || {}).label || e.id;
      toast(e.code === 'expired' ? t('accExpired', { s: label }) : t('accFailed', { s: label, e: e.message }), 'error');
    }
  } catch (err) {
    toast(t('accFailed', { s: '', e: err.message }), 'error');
  } finally {
    stop();
    showScan(false);
  }
}

/* ------------------------------ Updates -------------------------------- */

// One line describing where the updater currently is, or '' while idle.
function updateStatusText() {
  const u = updateState;
  switch (u.state) {
    case 'checking': return t('updChecking');
    case 'latest': return t('updLatest');
    case 'available': return t('updAvailable', { v: u.version });
    case 'downloading': return t('updDownloading', { p: u.percent });
    case 'downloaded': return t('updDownloaded', { v: u.version });
    case 'error': return t('updError', { e: u.message });
    case 'dev': return t('updDev');
    default: return '';
  }
}

function updateGroup() {
  const g = el('div', 'setting-group');
  g.appendChild(el('h3', null, esc(t('settingsUpdates'))));
  if (IS_STORE) {
    g.appendChild(el('div', 'hint', esc(t('updStore'))));
    return g;
  }

  const row = el('div', 'toggle-row');
  const on = state.settings.autoUpdate !== false;
  row.innerHTML = `<label>${esc(t('autoUpdateLabel'))}</label><span class="switch"><input type="checkbox" ${on ? 'checked' : ''}><span class="track"></span></span>`;
  row.querySelector('input').onchange = async (e) => {
    state.settings = await api.setSettings({ autoUpdate: e.target.checked });
  };
  g.appendChild(row);

  const actions = el('div', 'upd-actions');
  const checkBtn = el('button', 'btn', `<span class="ico">${icon('refresh')}</span>${esc(t('checkUpdate'))}`);
  checkBtn.onclick = () => { api.checkUpdate(); };
  actions.appendChild(checkBtn);

  // Only offered once a build is on disk and ready to run.
  if (updateState.state === 'downloaded') {
    const installBtn = el('button', 'btn btn-primary', esc(t('updInstall')));
    installBtn.onclick = () => api.installUpdate();
    actions.appendChild(installBtn);
  }
  g.appendChild(actions);

  const status = updateStatusText();
  if (status) g.appendChild(el('div', 'upd-status', esc(status)));
  g.appendChild(el('div', 'hint', esc(t('autoUpdateHint'))));
  return g;
}

function onUpdateStatus(msg) {
  updateState = msg || { state: 'idle' };
  refreshUpdateGroup();
  // Tell the user out here too — they rarely have Settings open when the
  // launch-time check finishes.
  if (msg.state === 'downloaded') toast(t('updDownloaded', { v: msg.version }));
  else if (msg.state === 'available' && state.settings.autoUpdate === false) {
    toast(t('updAvailable', { v: msg.version }));
  }
}

// Refresh just the Updates group in place so progress ticks don't rebuild
// (and scroll-reset) the whole settings panel.
function refreshUpdateGroup() {
  const modal = $('#settings-modal');
  if (!modal || modal.hidden) return;
  const old = $('#settings-body .setting-group--upd');
  const fresh = updateGroup();
  fresh.classList.add('setting-group--upd');
  if (old) old.replaceWith(fresh);
}

function buildSettings() {
  const body = $('#settings-body');
  const s = state.settings;
  const sources = s.sources || {};
  body.innerHTML = '';

  // Sources
  const g1 = el('div', 'setting-group');
  g1.appendChild(el('h3', null, esc(t('settingsSources'))));
  for (const src of [['steam', 'src_steam'], ['epic', 'src_epic'], ['xbox', 'src_xbox'], ['gog', 'src_gog'], ['ea', 'src_ea'], ['ubisoft', 'src_ubisoft'], ['shortcut', 'src_shortcut'], ['folders', 'optFolders']]) {
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

  // Startup — not in the Store build, where Windows owns app startup.
  const gStart = el('div', 'setting-group');
  if (IS_STORE) gStart.hidden = true;
  gStart.appendChild(el('h3', null, esc(t('settingsStartup'))));
  const startRow = el('div', 'toggle-row');
  startRow.innerHTML = `<label>${esc(t('autostartLabel'))}</label><span class="switch"><input type="checkbox" ${s.autostart ? 'checked' : ''}><span class="track"></span></span>`;
  startRow.querySelector('input').onchange = async (e) => { state.settings = await api.setAutostart(e.target.checked); };
  gStart.appendChild(startRow);
  body.appendChild(gStart);

  // Linked store accounts
  body.appendChild(accountsGroup());

  // Steam collections — only meaningful once Steam is actually linked/installed
  body.appendChild(steamListsGroup());

  // Updates
  const gUpd = updateGroup();
  gUpd.classList.add('setting-group--upd');
  body.appendChild(gUpd);

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
  const tour = el('button', 'btn', esc(t('replayTour')));
  tour.style.marginTop = '8px';
  tour.onclick = () => { closeSettings(); setTimeout(runOnboarding, 220); };
  g5.appendChild(tour);
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
  $('#btn-downloads').onclick = openDownloads;
  $('#downloads-close').onclick = closeDownloads;
  $('#downloads-modal').onclick = (e) => { if (e.target.id === 'downloads-modal') closeDownloads(); };
  $('#btn-accounts').onclick = openAccounts;
  $('#accounts-close').onclick = closeAccounts;
  $('#accounts-modal').onclick = (e) => { if (e.target.id === 'accounts-modal') closeAccounts(); };
  $('#btn-random').onclick = openRandom;
  $('#random-close').onclick = closeRandom;
  $('#random-modal').onclick = (e) => { if (e.target.id === 'random-modal') closeRandom(); };

  $('#search').oninput = (e) => { state.search = e.target.value; renderGrid(); };
  $('#sort').onchange = async (e) => { state.sort = e.target.value; state.settings = await api.setSettings({ sortBy: state.sort }); renderGrid(); };

  document.addEventListener('click', (e) => { if (!$('#ctx').hidden && !$('#ctx').contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeMenu(); closeSettings(); closeDownloads(); closeAccounts(); closeRandom(); }
    if (e.key === '/' && document.activeElement !== $('#search')) { e.preventDefault(); $('#search').focus(); }
  });
}

init();
