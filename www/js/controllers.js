angular.module('app.controllers', [])

.controller('loginCtrl', function($scope, $state, $http, $ionicPopup) {
    $scope.user = {};
    //smucrz@students.zcu.cz
    //a3tKe

    //kraft@students.zcu.cz
    //utBK8

    $scope.login = function() {
        window.localStorage.setItem("username", $scope.user.username);
        window.localStorage.setItem("password", $scope.user.password);       

        var url = 'http://147.228.63.49:80/app/mobile-services/login';
        var data = {'client_username': 'smucrz@students.zcu.cz', 'client_passwd': 'a3tKe'};

        $http.post(url, data).then(function(response){
            var myData = response;
            console.log(myData);
            if (myData.username == window.localStorage.getItem("username")){
                window.localStorage.setItem("token", myData.token);
                window.localStorage.setItem("measurement_array", JSON.stringify(myData.data))

                console.log("received token");
                console.log(myData.token);

                $state.go('menu.experimentList')
            }
        });
    };
 
    $scope.logout = function() {
        window.localStorage.clear();
        $scope.user = {};
    };
})


.controller('experimentListCtrl', function($scope, $state, $ionicLoading, $http) {


    $scope.$on('$ionicView.beforeEnter', function(){
        
        var myData = JSON.parse(window.localStorage.getItem("measurement_array"));
        console.log("received measurement array");
        console.log(myData);
        $scope.experiments = myData;
        if ($scope.experiments.length == 1){
            $scope.showExperiment($scope.experiments[0]);
        }

    });


    $scope.showExperiment = function(measurement) {
        window.localStorage.setItem("measurement", JSON.stringify(measurement))
          
        $scope.token = window.localStorage.getItem("token");
        $scope.username = window.localStorage.getItem("username")

        var url = '';
        var data = {'username':$scope.username, 'token':$scope.token, 'measurementID':measurement.id};

        $http.post(url, data).then(function(response){

        }); 
        $state.go('menu.experiment');
    };

})

.controller('experimentCtrl', function($scope, $cordovaBarcodeScanner, $ionicPopup, $ionicLoading, $http) {

    $scope.objects = [];
    $scope.person = {};

    $scope.$on('$ionicView.beforeEnter', function(){
        
        $scope.measurement = JSON.parse(window.localStorage.getItem("measurement"));
        $scope.token = window.localStorage.getItem("token"); 
        $scope.username = window.localStorage.getItem("username");

        var url = ''
        
        $http.get(url).then(function(response){
            console.log("received scheme");
            var socketData = response;
            console.log(socketData);
            for (var i = 0; i < socketData.length; i++){
                if (socketData[i].username == window.localStorage.getItem("username")){
                    $scope.objects[i] = socketData[i];
                }
            }
        })
    });

    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            var str = imageData.text;
            str = str.substring(str.lastIndexOf("/") + 1);
            $scope.person.personID = str;
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
                
                var response = new Array($scope.objects.length);
                for (var i = 0; i < $scope.objects.length; i++) {
                    response[i] = new Array($scope.objects[i].scheme.length);
                    for (var j = 0; j < $scope.objects[i].scheme.length; j++){
                        response[i][j] = {
                            id: "",
                            values: ""
                        };
                    }
                }

                for (var i = 0; i < $scope.objects.length; i++){
                    for (var j = 0; j < $scope.objects[i].scheme.length; j++){
                        response[i][j].id = $scope.objects[i].scheme[j].id;
                        response[i][j].values = $scope.objects[i].scheme[j].values;
                    }
                } 

                for(var i = 0; i < response.length; i++){
                    $http.post("url data to server",{'username':$scope.username,
                                                   'token':$scope.token,
                                                   'personID':$scope.person.personID,
                                                   'measurementID':$scope.measurement.id,
                                                   'experimentID':$scope.objects[i].experimentID,
                                                   'data':response[i]
                                                   //'data':[{'id':0, values:["email@email.cz"]}]
                                                });
                    console.log({'username':$scope.username,'token':$scope.token,'personID':$scope.person.personID,'measurementID':$scope.measurement.id,'experimentID':$scope.objects[i].experimentID,'data':[{'id':0, values:["email@email.cz"]}]})
                }

                $http.get("url info").then(function(response){
                    $scope.info = {};
                    var socketData = response;
                    console.log(socketData);
                    $scope.info.type = socketData.type;
                    $scope.info.message = socketData.message;  
                    console.log(socketData);
                });

                var alertPopup = $ionicPopup.alert({
                    title: $scope.info.type,
                    template: $scope.info.message
                });

                alertPopup.then(function(res) {
                
                });
            } else {
            
            }
        });
    };
})


.controller('form_motivationCtrl', function($scope, $cordovaBarcodeScanner, $ionicPopup, $ionicLoading, $http) {
  
    $scope.objects = [];
    $scope.person = {};   
    var dataSource = 'data/motivJSON.json';

    $scope.$on('$ionicView.beforeEnter', function(){

        $http.get('data/motivJSON.json').then(function(response){
            $scope.objects = response.data;
        }).catch(function(response){
            
        }).finally(function(){

        });
    });

    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            var str = imageData.text;
            str = str.substring(str.lastIndexOf("/") + 1);
            $scope.person.personID = str;
        }, function(error) {
        });
    };


    $scope.showConfirm = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Uložit formulář',
            template: 'Opravdu chcete uložit vyplněný formulář?'
        });

        confirmPopup.then(function(res) {
            if(res) {

                $http.post('motivation',{'username':$scope.username,
                                          'token':$scope.token,
                                          'personID':$scope.person.personID,
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