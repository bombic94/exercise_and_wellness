angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('menu', {
    url: '/side-menu',
    templateUrl: 'templates/menu.html',
    abstract:true
  })
            
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'loginCtrl'
  })

  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'signupCtrl'
  })

  .state('menu.experiment', {
    url: '/experiment',
    views: {
      'side-menu': {
        templateUrl: 'templates/experiment.html',
        controller: 'experimentCtrl',
      }
    }
  }) 

  .state('menu.experimentList', {
    url: '/experimentList',
    views: {
      'side-menu': {
        templateUrl: 'templates/experimentList.html',
        controller: 'experimentListCtrl',
      }
    }
  })

  .state('menu.form_motivation', {
    url: '/form',
    views: {
      'side-menu': {
        templateUrl: 'templates/form_motivation.html',
        controller: 'form_motivationCtrl'
      }
    }
  })

  .state('menu.settings', {
    url: '/settings',
    views: {
      'side-menu': {
        templateUrl: 'templates/settings.html',
        controller: 'settingsCtrl'
      }
    }
  })

  .state('menu.results', {
    url: '/results',
    views: {
      'side-menu': {
        templateUrl: 'templates/results.html',
        controller: 'resultsCtrl'
      }
    }
  })
  
  .state('menu.user_info', {
    url: '/info',
    views: {
      'side-menu': {
        templateUrl: 'templates/user_info.html',
        controller: 'user_infoCtrl'
      }
    }
  })

  $urlRouterProvider.otherwise('/login')

});