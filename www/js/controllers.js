angular.module('app.controllers', [])

.controller('loginCtrl', function($scope, $state, socket, $ionicPopup) {
    $scope.user = {};
    //"smucrz@students.zcu.cz";
    //"a3tKe";

    $scope.login = function() {
        window.localStorage.setItem("username", $scope.user.username);
        window.localStorage.setItem("password", $scope.user.password);

        socket.emit('login',{'username':$scope.user.username,'password':$scope.user.password});

        socket.on('token', function(msg){
            var socketData = JSON.parse(msg);
            if (socketData.username == window.localStorage.getItem("username")){
                window.localStorage.setItem("token", socketData.token);

                console.log("received token");
                console.log(socketData.token);

                $state.go('menu.experimentList')
            }
        });

        socket.on('error', function(msg){
            var alertPopup = $ionicPopup.alert({
              title: 'Špatné jméno nebo heslo',
              template: 'Zkuste se přihlásit znovu',
            });
        })
    };
 
    $scope.logout = function() {
        window.localStorage.clear();
        $scope.user = {};
    };
})


.controller('experimentListCtrl', function($scope, $state, $ionicLoading, LoadJSON, socket) {


    $scope.$on('$ionicView.beforeEnter', function(){

        socket.on('measurement array', function(msg){
            console.log("received measurement array");
            var socketData = JSON.parse(msg);

            if (socketData.username == window.localStorage.getItem("username")){
                $scope.experiments = socketData.data;
                if ($scope.experiments.length == 1){
                    $scope.showExperiment($scope.experiments[0]);
                }
            }
        })

    });


    $scope.showExperiment = function(measurement) {
          window.localStorage.setItem("measurementID", measurement.id);
          window.localStorage.setItem("measurementInstitution", measurement.institution);
          window.localStorage.setItem("measurementBegin", measurement.begin);
          window.localStorage.setItem("measurementEnd", measurement.end);
          window.localStorage.setItem("measurementTown", measurement.town);
          window.localStorage.setItem("measurementStreet", measurement.street);
          window.localStorage.setItem("measurementNumber", measurement.number);
          
          $scope.token = window.localStorage.getItem("token");
          $scope.username = window.localStorage.getItem("username")

          socket.emit('measurement id',{'username':$scope.username,'token':$scope.token,'measurementID':measurement.id}); 
          $state.go('menu.experiment');
    };

})

.controller('experimentCtrl', function($scope, $cordovaBarcodeScanner, $ionicPopup, $ionicLoading, LoadJSON, socket) {

    $scope.objects = "";
    $scope.personID = "";
    var dataSource = 'data/JSON1.json';

    $scope.$on('$ionicView.beforeEnter', function(){
        $scope.measurementID = window.localStorage.getItem("measurementID");
        $scope.institution = window.localStorage.getItem("measurementInstitution");
        $scope.begin = window.localStorage.getItem("measurementBegin");
        $scope.end = window.localStorage.getItem("measurementEnd");
        $scope.town = window.localStorage.getItem("measurementTown");
        $scope.street = window.localStorage.getItem("measurementStreet");
        $scope.number = window.localStorage.getItem("measurementNumber");
        
        $scope.token = window.localStorage.getItem("token"); 
        $scope.username = window.localStorage.getItem("username");

        socket.on('form scheme to mobile device', function(msg){
            console.log("received scheme");
            var socketData = JSON.parse(msg);
            console.log(socketData);
            if (socketData[0].username == window.localStorage.getItem("username")){
                $scope.objects = socketData;
            }
        })
    });

    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            //var str = "http://www.exerciseandwellnes.org/users/id/41de0b5764d683ef";
            var str = imageData.text;
            str = str.substring(str.lastIndexOf("/") + 1);
            $scope.personID = str;
            
        }, function(error) {
            
        });
    };

    $scope.showConfirm = function() {
        var confirmPopup = $ionicPopup.confirm({
        title: 'Uložit experiment',
        template: 'Opravdu chcete uložit změřené hodnoty?'
        });

        confirmPopup.then(function(res) {
            if(res) {
                
                var response = [];
                for (var i = 0; i < $scope.objects.length; i++){
                    for (var j = 0; j < $scope.objects[i].length; j++){
                      response[i][j].id = $scope.objects[i][j].id;
                      response[i][j].data = $scope.objects[i][j].data;
                    }
                } 
                
                           
                for(var i = 0; i < response.length; i++){
                    socket.emit('data to server', {'username':$scope.username,
                                                   'token':$scope.token,
                                                   'personID':$scope.personID,
                                                   'measurementID':$scope.measurementID,
                                                   'experimentID':$scope.objects[i].experimentID,
                                                   'data':response[i]});
                }

                socket.on('info', function(msg){
                    $scope.info.type = msg.typ;
                    $scope.info.message = msg.message;  
                });

                var alertPopup = $ionicPopup.alert({
                    title: 'Uložit experiment',
                    template: $scope.info.message
                });

                alertPopup.then(function(res) {
                
                });
            } else {
            
            }
        });
    };
})


.controller('form_motivationCtrl', function($scope, $cordovaBarcodeScanner, $ionicPopup, $ionicLoading, LoadJSON, socket) {
  
    $scope.objects = "";
    $scope.personID = "";   
    var dataSource = 'data/motivJSON.json';

    $scope.$on('$ionicView.beforeEnter', function(){
        //socket.on('motivational form', function(msg){
        // $scope.objects = msg;
        //})
        LoadJSON.getJSON(dataSource).then(function(response){
            $scope.objects = response.data;
        }).catch(function(response){
            
        }).finally(function(){

        });
    });

    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            //var str = "http://www.exerciseandwellnes.org/users/id/41de0b5764d683ef";
            var str = imageData.text;
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
        title: 'Uložit formulář',
        template: 'Opravdu chcete uložit vyplněný formulář?'
      });

      confirmPopup.then(function(res) {
        if(res) {

          socket.emit('motivation', {'username':$scope.username,
                                         'token':$scope.token,
                                         'personID':$scope.personID,
                                         'form':objects});

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