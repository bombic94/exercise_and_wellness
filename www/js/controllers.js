angular.module('app.controllers', [])

.controller('loginCtrl', function($scope, $state, socket) {
    $scope.username;
    $scope.password;

    $scope.login = function() {
        window.localStorage.setItem("username", $scope.username);
        window.localStorage.setItem("password", $scope.password);
        socket.emit('login', {"username":$scope.username,"password":$scope.password});
        
        //socket.on('token', function(msg){
        //  window.localStorage.setItem("token", msg);
          $state.go('menu.experimentList')
        //})
    };
 
    $scope.logout = function() {
        window.localStorage.removeItem("username");
        window.localStorage.removeItem("password");
    };
})


.controller('experimentListCtrl', function($scope, $state, $ionicLoading, LoadJSON, socket) {
    var dataSource = 'data/JSON2.json';
    $scope.experiments = "";

    $scope.$on('$ionicView.enter', function(){
        $ionicLoading.show();
        //socket.on('measurement array', function(msg){
        // $scope.experiments = msg;
        //})
        LoadJSON.getJSON(dataSource).then(function(response){
            $scope.experiments = response.data;
            if ($scope.experiments.length == 1){
                $scope.showExperiment($scope.experiments[0]);
            }
        }).catch(function(response){
            
        }).finally(function(){
            $ionicLoading.hide();
        });
    });


    $scope.showExperiment = function(experiment) {
          window.localStorage.setItem("measurementNumber", experiment.id);
          window.localStorage.setItem("measurementName", experiment.name);
          socket.emit('measurement index', {"measurementNumber":experiment.id}); 
          $state.go('menu.experiment');
    };

})

.controller('experimentCtrl', function($scope, $cordovaBarcodeScanner, $ionicPopup, $ionicLoading, LoadJSON, socket) {

    $scope.objects = "";
    $scope.personID = "";
    $scope.data = "";   
    var dataSource = 'data/JSON1.json';

    $scope.$on('$ionicView.enter', function(){
        $scope.name = window.localStorage.getItem("measurementName");


        $ionicLoading.show();
        //socket.on('form scheme to mobile device', function(msg){
        // $scope.objects = msg;
        //})
        LoadJSON.getJSON(dataSource).then(function(response){
            $scope.objects = response.data;
        }).catch(function(response){
            
        }).finally(function(){
            $ionicLoading.hide();
        });
    });

    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            var str = "http://www.exerciseandwellnes.org/users/id/41de0b5764d683ef";
            //var str = imageData.text;
            str = str.substring(str.lastIndexOf("/") + 1);
            $scope.personID = str;
            
        }, function(error) {
            var alertPopup = $ionicPopup.alert({
              title: 'Chyba',
              template: 'Něco se nepovedlo',
            });
        });
    };

    $scope.showConfirm = function() {
      var confirmPopup = $ionicPopup.confirm({
      title: 'Uložit experiment',
      template: 'Opravdu chcete uložit změřené hodnoty?'
      });

      confirmPopup.then(function(res) {
        if(res) {

          var alertPopup = $ionicPopup.alert({
            title: 'Uložit experiment',
            template: 'Změřené hodnoty úspěšně uloženy'
          });

          alertPopup.then(function(res) {
            
          });
        } else {
          
        }
      });
    };
})


.controller('form_motivationCtrl', function($scope, $ionicPopup, $ionicLoading, LoadJSON, socket) {
  
    $scope.objects = "";   
    var dataSource = 'data/motivJSON.json';

    $scope.$on('$ionicView.enter', function(){
        $ionicLoading.show();
        //socket.on('motivational form', function(msg){
        // $scope.objects = msg;
        //})
        LoadJSON.getJSON(dataSource).then(function(response){
            $scope.objects = response.data;
        }).catch(function(response){
            
        }).finally(function(){
            $ionicLoading.hide();
        });
    });

    $scope.showConfirm = function() {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Uložit formulář',
        template: 'Opravdu chcete uložit vyplněný formulář?'
      });

      confirmPopup.then(function(res) {
        if(res) {

          var alertPopup = $ionicPopup.alert({
            title: 'Uložit formulář',
            template: 'Formulář úspěšně uložen'
          });

          alertPopup.then(function(res) {
            
          });
        } else {
          
        }
      });
    };
})
   


.controller('signupCtrl', function($scope) {

})
   

   
.controller('user_infoCtrl', function($scope, $ionicPopup) {
    $scope.showConfirm = function() {
        var confirmPopup = $ionicPopup.confirm({
          title: 'Uložit informace',
          template: 'Opravdu chcete uložit informace?'
        });

        confirmPopup.then(function(res) {
          if(res) {

            var alertPopup = $ionicPopup.alert({
              title: 'Uložit informace',
              template: 'Informace úspěšně uloženy'
            });

            alertPopup.then(function(res) {
              
            });
          } else {
            
          }
        });
      };
    });