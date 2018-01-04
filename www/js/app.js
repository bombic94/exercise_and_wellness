// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.directives','app.services', 'ngCordova', 'pascalprecht.translate', 'chart.js'])

.config(function($ionicConfigProvider, $sceDelegateProvider, $translateProvider) {
  
  $sceDelegateProvider.resourceUrlWhitelist([ 'self','*://www.youtube.com/**', '*://player.vimeo.com/video/**']);
  
  //$ionicConfigProvider.navBar.alignTitle('center');

  //contains translations for all provided languages
  $translateProvider.translations('en', {

    //login html
    LOGIN: 'Login',
    USERNAME: 'Section name',
    PASSWORD: 'Password',
    LOG_IN: 'Log in',
    GET_SECTION: 'Get section',
    FORGOT_NAME1: 'Section name missing',
    FORGOT_NAME2: 'Please fill in section name',
    FORGOT_PASS1: 'Password missing',
    FORGOT_PASS2: 'Please fill in password',

    //login ctrl
    ERROR: 'Error',
    CANCEL: 'Cancel',
    CONFIRM: 'OK',
    QR_FAIL: 'Failed to load QR code',
    AUTH_FAIL: 'Authorization failed',
    AUTH_EXP: 'Token expired',
    CONNECT_FAIL: 'Connection to server failed',
    ERR_UNSP: 'Unspecified error happened',

    //home html
    HOME: 'Homepage',

    //about html
    ABOUT: 'About',
    ABOUT_HEAD: 'About this application',
    ABOUT_TEXT: 'Unwillingness of many people to assume responsibilities for a personal health, fitness and wellness seems to be widespread. This can be partially remedied by individualized exercise and wellness program that integrates the basic knowledge domains: lifestyle, sports and fitness, and nutrition and personal/environmental health. However, collection, management and analysis of data and metadata related to these domains is demanding and time consuming task. Moreover, the appropriate annotation of raw data is crucial for their next processing. To promote such a program a software infrastructure for collection, storage, management, analysis and interpretation of health related data and metadata has been proposed and part of this infrastructure has been developed and tested outside laboratory conditions. This software prototype allows experimenters to collect various heterogeneous health related data in a~highly organized and efficient way. Data are then evaluated and users can view relevant information related to their health and fitness.',
    VERSION: 'Version',
    AUTHOR: 'Author',
    COMPANY: 'Company',
    
    //experimentList html
    MEASURE_LIST: 'List of measurements',
    NO_MEASUREMENT: 'No measurement available',

    //experiment html
    MEASUREMENT: 'Measurements',
    NO_INPUT: 'There are no data to input',
    SCAN_ID: 'Scan person ID',
    SAVE: 'Save',
    FORGOT_INPUT1: 'Input missing',
    FORGOT_INPUT2: 'Please fill in data to every input field',
    FORGOT_ID1: 'Person ID missing',
    FORGOT_ID2: 'Please fill in Person ID',

    //experiment ctrl
    SAVE_CONFIRM1: 'Save values',
    SAVE_CONFIRM2: 'Do you really want to save measured values?',
    REG_FAIL1: 'Person ID already registered',
    REG_FAIL2: 'Please use other ID',
    SAVE_FAIL1: 'Person ID not found',
    SAVE_FAIL2: 'Please use other ID',
    SAVE_OK1: 'OK',
    SAVE_OK2: 'Data successfully saved',

    //results html
    RESULTS: 'Results',
    RESULTS_ID: 'Personal results',
    NO_RESULTS: 'There are no results to show',
    SHOW_RESULTS: 'Show results',

    //results ctrl
    LOAD_RESULTS1: 'Load results',
    LOAD_RESULTS2: 'Do you want to load results for this person?',

    //settings html
    SETTINGS: 'Settings',
    LANGUAGE: 'Language',
    ENGLISH: 'English',
    DEUTSCH: 'Deutsch',
    CZECH: 'Czech',

    //menu
    MENU: 'Menu',

    //logout
    LOGOUT: 'Log out'
  });

  $translateProvider.translations('de', {
    //login html
    LOGIN: 'Anmeldung',
    USERNAME: 'Abschnittsname',
    PASSWORD: 'Passwort',
    LOG_IN: 'Einloggen',
    GET_SECTION: 'Erhalten abteilung',
    FORGOT_NAME1: 'Abschnittsname fehlt',
    FORGOT_NAME2: 'Bitte füllen sie den abschnittsnamen aus',
    FORGOT_PASS1: 'Passwort fehlt',
    FORGOT_PASS2: 'Bitte füllen Sie das passwort aus',

    //login ctrl
    ERROR: 'Fehler',
    CANCEL: 'Stornieren',
    CONFIRM: 'Bestätigen',
    QR_FAIL: 'Fehlgeschlagen den QR-Code zu laden',
    AUTH_FAIL: 'Autorisierung fehlgeschlagen',
    AUTH_EXP: 'Token abgelaufen',
    CONNECT_FAIL: 'Verbindung zum server fehlgeschlagen',
    ERR_UNSP: 'Unspezifizierter fehler ist passiert',

    //home html
    HOME: 'Homepage',

    //about html
    ABOUT: 'Über die anwendung',
    ABOUT_HEAD: 'Über diese anwendung',
    ABOUT_TEXT: 'Unwillen vieler Menschen, Verantwortung für eine persönliche Gesundheit, Fitness und Wellness zu übernehmen, scheint weit verbreitet zu sein. Dies kann teilweise durch ein individuelles Übungs- und Wellnessprogramm behoben werden, das die grundlegenden Wissensdomänen integriert: Lifestyle, Sport und Fitness sowie Ernährung und persönliche / umweltfreundliche Gesundheit. Allerdings ist die Erfassung, Verwaltung und Analyse von Daten und Metadaten im Zusammenhang mit diesen Domains anspruchsvolle und zeitaufwändige Aufgabe. Darüber hinaus ist die entsprechende Annotation von Rohdaten für ihre nächste Verarbeitung entscheidend. Zur Förderung eines solchen Programms wurde eine Software-Infrastruktur für die Erhebung, Speicherung, Verwaltung, Analyse und Interpretation von gesundheitsbezogenen Daten und Metadaten vorgeschlagen und ein Teil dieser Infrastruktur wurde außerhalb der Laborbedingungen entwickelt und getestet. Dieser Software-Prototyp ermöglicht es den Experimentatoren, verschiedene heterogene gesundheitsbezogene Daten in einer hochgradig organisierten und effizienten Weise zu sammeln. Die Daten werden dann ausgewertet und die Nutzer können relevante Informationen über ihre Gesundheit und Fitness anzeigen.',
    VERSION: 'Version',
    AUTHOR: 'Author',
    COMPANY: 'Company',
    
    //experimentList html
    MEASURE_LIST: 'Liste der messungen',
    NO_MEASUREMENT: 'Keine messung vorhanden',

    //experiment html
    MEASUREMENT: 'Messungen',
    NO_INPUT: 'Es liegen keine daten zur eingabe vor',
    SCAN_ID: 'Scannen sie Person ID',
    SAVE: 'Speichern',
    FORGOT_INPUT1: 'Eingabe fehlt',
    FORGOT_INPUT2: 'Bitte füllen sie bitte daten in jedes eingabefeld ein',
    FORGOT_ID1: 'Person ID fehlt',
    FORGOT_ID2: 'Bitte füllen sie die Person ID aus',

    //experiment ctrl
    SAVE_CONFIRM1: 'Werte speichern',
    SAVE_CONFIRM2: 'Möchten sie die messwerte wirklich speichern?',
    REG_FAIL1: 'Person ID bereits registriert',
    REG_FAIL2: 'Bitte benutzen sie andere ID',
    SAVE_FAIL1: 'Person ID nicht gefunden',
    SAVE_FAIL2: 'Bitte benutzen sie andere ID',
    SAVE_OK1: 'OK',
    SAVE_OK2: 'Die daten wurden erfolgreich gespeichert',

    //results html
    RESULTS: 'Ergebnisse',
    RESULTS_ID: 'Persönliche ergebnisse',
    NO_RESULTS: 'Es gibt keine ergebnisse zu zeigen',
    SHOW_RESULTS: 'Zeige ergebnisse',

    //results ctrl
    LOAD_RESULTS1: 'Laden sie die ergebnisse',
    LOAD_RESULTS2: 'Möchten Sie Ergebnisse für diese Person laden?',

    //settings html
    SETTINGS: 'Einstellungen',
    LANGUAGE: 'Sprache',
    ENGLISH: 'Englisch',
    DEUTSCH: 'Deutsch',
    CZECH: 'Tschechisch',

    //menu
    MENU: 'Menü',

    //logout
    LOGOUT: 'Ausloggen'
  });

  $translateProvider.translations('cz', {
    //login html
    LOGIN: 'Přihlášení',
    USERNAME: 'Stanoviště',
    PASSWORD: 'Heslo',
    LOG_IN: 'Přihlásit',
    GET_SECTION: 'Načíst stanoviště',
    FORGOT_NAME1: 'Není vyplněn název stanoviště',
    FORGOT_NAME2: 'Vyplňte prosím název stanoviště',
    FORGOT_PASS1: 'Není vyplněno heslo',
    FORGOT_PASS2: 'Vyplňtě prosím heslo',

    //login ctrl
    ERROR: 'Chyba',
    CANCEL: 'Zrušit',
    CONFIRM: 'Potvrdit',
    QR_FAIL: 'Nepodařilo se načíst QR kód',
    AUTH_EXP: 'Platnost tokenu vypršela',
    AUTH_FAIL: 'Autorizace se nezdařila',
    CONNECT_FAIL: 'Nepodařilo se spojit se serverem',
    ERR_UNSP: 'Vyskytla se nespecifikovaná chyba',

    //home html
    HOME: 'Úvodní obrazovka',

    //about html
    ABOUT: 'O aplikaci',
    ABOUT_HEAD: 'O této aplikaci',
    ABOUT_TEXT: 'Neochota mnoha lidí přijmout zodpovědnost za svoje osobní zdraví, kondici a životosprávu se stále rozšiřuje. Toto lze být částečně napraveno individuálním programem zaměřeným na cvičení a životosprávu, který zahrnuje základní znalosti z těchto odvětví: životní styl, sport, cvičení, stravování a osobní zdraví. Je nutné podotknout, že sběr, správa a analýza dat a metadat z těchto odvětví je obtížný a časově náročný úkol. Správné ohodnocení je naprosto nezbytné pro další výzkum. K rozšíření takového programu byla navrhnuta softwarová infrastruktura pro sběr, ukládání, spravování, analýzu a vyhodnocení zdravotnických dat a metadat. Část této infrastruktury byla otestována mimo laboratorní podmínky. Tento software umožňuje experimentátorům velmi efektivně sbírat různá zdravotně zaměřená data ve strukturalizované formě. Data jsou následně ohodnocena a uživatelé si mohou zobrazit důležité informace ohledně svého zdraví a kondice.',
    VERSION: 'Verze',
    AUTHOR: 'Autor',
    COMPANY: 'Společnost',
    
    //experimentList html
    MEASURE_LIST: 'Seznam měření',
    NO_MEASUREMENT: 'Není k dispozici žádné měření',

    //experiment html
    MEASUREMENT: 'Měření',
    NO_INPUT: 'Nelze zadávat žádná data',
    SCAN_ID: 'Načíst ID osoby',
    SAVE: 'Uložit',
    FORGOT_INPUT1: 'Nejsou vyplněna data',
    FORGOT_INPUT2: 'Vyplňte prosím všechna datová pole',
    FORGOT_ID1: 'Není vyplněno ID osoby',
    FORGOT_ID2: 'Vyplňte prosím ID osoby',

    //experiment ctrl
    SAVE_CONFIRM1: 'Uložit hodnoty',
    SAVE_CONFIRM2: 'Opravdu chcete uložit změřené hodnoty?',
    REG_FAIL1: 'ID uživatele již zaregistrováno',
    REG_FAIL2: 'Použijte prosím jiné ID',
    SAVE_FAIL1: 'ID uživatele nenalezeno',
    SAVE_FAIL2: 'Použijte prosím jiné ID',
    SAVE_OK1: 'OK',
    SAVE_OK2: 'Uložení proběhlo v pořádku',

    //results html
    RESULTS: 'Výsledky',
    RESULTS_ID: 'Výsledky osoby',
    NO_RESULTS: 'Nejsou k zobrazení žádné výsledky',
    SHOW_RESULTS: 'Zobrazit výsledky',

    //results ctrl
    LOAD_RESULTS1: 'Načíst výsledky',
    LOAD_RESULTS2: 'Opravdu chcete načíst výsledky této osoby?',

    //settings html
    SETTINGS: 'Nastavení',
    LANGUAGE: 'Jazyk',
    ENGLISH: 'Angličtina',
    DEUTSCH: 'Němčina',
    CZECH: 'Čeština',

    //menu
    MENU: 'Nabídka',

    //logout
    LOGOUT: 'Odhlásit se'
  })

  /** Tries to get native language of device and start app in that language, if language not supported, start in EN */
  .registerAvailableLanguageKeys(['en', 'de', 'cz'], {
    'en_*': 'en',
    'de_*': 'de',
    'cs_*': 'cz',
    '*': 'en'
  })
  .determinePreferredLanguage();
  //$translateProvider.preferredLanguage('en');
  $translateProvider.useSanitizeValueStrategy(null);

})

/** on start of app run following commands */
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

/*
  This directive is used to disable the "drag to open" functionality of the Side-Menu
  when you are dragging a Slider component.
*/
.directive('disableSideMenuDrag', ['$ionicSideMenuDelegate', '$rootScope', function($ionicSideMenuDelegate, $rootScope) {
    return {
        restrict: "A",  
        controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {

            function stopDrag(){
              $ionicSideMenuDelegate.canDragContent(false);
            }

            function allowDrag(){
              $ionicSideMenuDelegate.canDragContent(true);
            }

            $rootScope.$on('$ionicSlides.slideChangeEnd', allowDrag);
            $element.on('touchstart', stopDrag);
            $element.on('touchend', allowDrag);
            $element.on('mousedown', stopDrag);
            $element.on('mouseup', allowDrag);

        }]
    };
}])

/*
  This directive is used to open regular and dynamic href links inside of inappbrowser.
*/
.directive('hrefInappbrowser', function() {
  return {
    restrict: 'A',
    replace: false,
    transclude: false,
    link: function(scope, element, attrs) {
      var href = attrs['hrefInappbrowser'];

      attrs.$observe('hrefInappbrowser', function(val){
        href = val;
      });
      
      element.bind('click', function (event) {

        window.open(href, '_system', 'location=yes');

        event.preventDefault();
        event.stopPropagation();

      });
    }
  };
});
