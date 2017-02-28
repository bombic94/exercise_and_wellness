// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.directives','app.services', 'ngCordova', 'pascalprecht.translate'])

.config(function($ionicConfigProvider, $sceDelegateProvider, $translateProvider) {
  
  $sceDelegateProvider.resourceUrlWhitelist([ 'self','*://www.youtube.com/**', '*://player.vimeo.com/video/**']);
  
  $ionicConfigProvider.navBar.alignTitle('center');

  $translateProvider.translations('en', {

    //login html
    LOGIN: 'Login',
    USERNAME: 'Username',
    PASSWORD: 'Password',
    LOG_IN: 'Log in',
    GET_SECTION: 'Get section',

    //login ctrl
    ERROR: 'Error',
    CANCEL: 'Cancel',
    CONFIRM: 'OK',
    QR_FAIL: 'Failed to load QR code',
    AUTH_FAIL: 'Authorization failed',
    CONNECT_FAIL: 'Connection to server failed',

    //experimentList html
    MEASURE_LIST: 'List of measurements',
    NO_MEASUREMENT: 'No measurement available',

    //experiment html
    MEASUREMENT: 'Measurements',
    SCAN_ID: 'Scan person ID',
    SAVE: 'Save',

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
    SHOW_RESULTS: 'Show results',

    //results ctrl
    LOAD_RESULTS1: 'Load results',
    LOAD_RESULTS2: 'Do you want to load results for this person',

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
    //
  })

  $translateProvider.translations('cz', {
    //login html
    LOGIN: 'Přihlášení',
    USERNAME: 'Jméno',
    PASSWORD: 'Heslo',
    LOG_IN: 'Přihlásit',
    GET_SECTION: 'Načíst stanoviště',

    //login ctrl
    ERROR: 'Chyba',
    CANCEL: 'Zrušit',
    CONFIRM: 'Potvrdit',
    QR_FAIL: 'Nepodařilo se načíst QR kód',
    AUTH_FAIL: 'Autorizace se nezdařila',
    CONNECT_FAIL: 'Nepodařilo se spojit se serverem',

    //experimentList html
    MEASURE_LIST: 'Seznam měření',
    NO_MEASUREMENT: 'Není k dispozici žádné měření',

    //experiment html
    MEASUREMENT: 'Měření',
    SCAN_ID: 'Načíst ID osoby',
    SAVE: 'Uložit',

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