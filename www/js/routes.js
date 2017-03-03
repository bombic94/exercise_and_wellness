angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  .state('menu', {
    url: '/side-menu21',
    templateUrl: 'templates/menu.html',
    controller: 'menuCtrl',
    abstract:true
  })

  .state('menu.home', {
    url: '/home',
    views: {
      'side-menu21': {
        templateUrl: 'templates/home.html',
        controller: 'homeCtrl'
      }
    }
  })

  .state('menu.listOfMeasurements', {
    url: '/listMeasurements',
    views: {
      'side-menu21': {
        templateUrl: 'templates/listOfMeasurements.html',
        controller: 'listOfMeasurementsCtrl'
      }
    }
  })

  .state('menu.measurement', {
    url: '/measurement',
    views: {
      'side-menu21': {
        templateUrl: 'templates/measurement.html',
        controller: 'measurementCtrl'
      }
    }
  })

  .state('menu.results', {
    url: '/results',
    views: {
      'side-menu21': {
        templateUrl: 'templates/results.html',
        controller: 'resultsCtrl'
      }
    }
  })

  .state('menu.resultsID', {
    url: '/resultsID',
    views: {
      'side-menu21': {
        templateUrl: 'templates/resultsID.html',
        controller: 'resultsIDCtrl'
      }
    }
  })

  .state('menu.settings', {
    url: '/settings',
    views: {
      'side-menu21': {
        templateUrl: 'templates/settings.html',
        controller: 'settingsCtrl'
      }
    }
  })

  .state('menu.about', {
    url: '/about',
    views: {
      'side-menu21': {
        templateUrl: 'templates/about.html',
        controller: 'aboutCtrl'
      }
    }
  })

$urlRouterProvider.otherwise('/login')

});