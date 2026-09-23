'use strict';

// Strings the main process owns.
//
// The renderer has its own dictionary for the UI; these are the few labels
// Windows itself renders — native file dialogs and the tray menu — plus errors
// thrown from the main process. They follow the same language setting, so a
// Japanese user doesn't get a Turkish file picker.

const STRINGS = {
  tr: {
    trayShow: 'Aç', trayQuit: 'Çık', trayTopPlayed: 'En çok oynanan',
    addGameTitle: 'Oyun ekle', gamesAndShortcuts: 'Oyunlar ve kısayollar', allFiles: 'Tüm dosyalar',
    pickCoverTitle: 'Kapak görseli seç', images: 'Görseller',
    pickFolderTitle: 'Taranacak oyun klasörü seç',
    noLaunchTarget: 'Bu oyun için başlatma hedefi bulunamadı.',
  },
  en: {
    trayShow: 'Open', trayQuit: 'Quit', trayTopPlayed: 'Most played',
    addGameTitle: 'Add game', gamesAndShortcuts: 'Games and shortcuts', allFiles: 'All files',
    pickCoverTitle: 'Choose cover image', images: 'Images',
    pickFolderTitle: 'Choose a game folder to scan',
    noLaunchTarget: 'No launch target found for this game.',
  },
  de: {
    trayShow: 'Öffnen', trayQuit: 'Beenden', trayTopPlayed: 'Meistgespielt',
    addGameTitle: 'Spiel hinzufügen', gamesAndShortcuts: 'Spiele und Verknüpfungen', allFiles: 'Alle Dateien',
    pickCoverTitle: 'Coverbild wählen', images: 'Bilder',
    pickFolderTitle: 'Zu scannenden Spielordner wählen',
    noLaunchTarget: 'Für dieses Spiel wurde kein Startziel gefunden.',
  },
  ja: {
    trayShow: '開く', trayQuit: '終了', trayTopPlayed: 'よくプレイ',
    addGameTitle: 'ゲームを追加', gamesAndShortcuts: 'ゲームとショートカット', allFiles: 'すべてのファイル',
    pickCoverTitle: 'カバー画像を選択', images: '画像',
    pickFolderTitle: 'スキャンするゲームフォルダーを選択',
    noLaunchTarget: 'このゲームの起動先が見つかりませんでした。',
  },
  ko: {
    trayShow: '열기', trayQuit: '종료', trayTopPlayed: '많이 플레이',
    addGameTitle: '게임 추가', gamesAndShortcuts: '게임 및 바로 가기', allFiles: '모든 파일',
    pickCoverTitle: '커버 이미지 선택', images: '이미지',
    pickFolderTitle: '검색할 게임 폴더 선택',
    noLaunchTarget: '이 게임의 실행 대상을 찾을 수 없습니다.',
  },
  es: {
    trayShow: 'Abrir', trayQuit: 'Salir', trayTopPlayed: 'Más jugados',
    addGameTitle: 'Añadir juego', gamesAndShortcuts: 'Juegos y accesos directos', allFiles: 'Todos los archivos',
    pickCoverTitle: 'Elegir imagen de portada', images: 'Imágenes',
    pickFolderTitle: 'Elegir una carpeta de juegos para analizar',
    noLaunchTarget: 'No se encontró destino de inicio para este juego.',
  },
};

// The language is read lazily from settings on every call, so switching it in
// Settings takes effect without a restart.
let getLanguage = () => 'en';

function setLanguageSource(fn) { getLanguage = fn; }

function t(key) {
  const table = STRINGS[getLanguage()] || STRINGS.en;
  return table[key] || STRINGS.en[key] || key;
}

module.exports = { t, setLanguageSource, STRINGS };
