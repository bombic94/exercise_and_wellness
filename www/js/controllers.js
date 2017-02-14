angular.module('app.controllers', [])

.controller('loginCtrl', function($scope, $cordovaBarcodeScanner, $state, $http, $ionicPopup, $translate) {

    $scope.ChangeLanguage = function(lang){
		$translate.use(lang);
	}
    
    $scope.$on('$ionicView.beforeEnter', function(){
        cordova.plugins.diagnostic.getCameraAuthorizationStatus(function(status){
            if(status === cordova.plugins.diagnostic.permissionStatus.GRANTED){
                console.log("Camera use is authorized");
            } else {
                cordova.plugins.diagnostic.requestCameraAuthorization(function(status){
                    console.log("Authorization request for camera use was " + (status == cordova.plugins.diagnostic.permissionStatus.GRANTED ? "granted" : "denied"));
                }, function(error){
                    console.error(error);
                });
            }
        }, function(error){
            console.error("The following error occurred: "+error);
        });
    });

    $scope.user = {};

    $scope.login = function() {
        window.localStorage.setItem("username", $scope.user.username);
        window.localStorage.setItem("password", $scope.user.password);       

        var url = 'http://147.228.63.49:80/app/mobile-services/login';
        var data = {'client_username': $scope.user.username, 'client_passwd': $scope.user.password};
        $http.post(url, data)
        .then(function(response){
            var myData = response;
            console.log(myData);
            
            if (myData.data == 'authorization failed'){
                var alertPopup = $ionicPopup.alert({
                    title: 'Chyba',
                    template: 'Neúspěšné přihlášení'
                });
                $scope.user = {};
            }
            else {
                window.localStorage.setItem("token", myData.data.token);
                window.localStorage.setItem("measurement_array", JSON.stringify(myData.data.data))

                console.log("received token");
                console.log(myData.data.token);

                $state.go('menu.experimentList');
            }
        });
    };
 
    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            $scope.user.username = imageData.text;
            alert("We got a barcode\n" +
                "Result: " + imageData.text + "\n" +
                "Format: " + imageData.format + "\n" +
                "Cancelled: " + imageData.cancelled);
        }, function(error) { 
        });
    };

    //$scope.logout = function() {
    //    window.localStorage.clear();
    //    $scope.user = {};
    //};
})


.controller('experimentListCtrl', function($scope, $state, $ionicLoading, $http) {


    $scope.$on('$ionicView.beforeEnter', function(){
        
        var myData = JSON.parse(window.localStorage.getItem("measurement_array"));
        console.log("received measurement array");
        console.log(myData);
        $scope.experiments = myData;
        //if ($scope.experiments.length == 1){
         //   $scope.showExperiment($scope.experiments[0]);
        //}

    });


    $scope.showExperiment = function(measurement) {
        window.localStorage.setItem("measurement", JSON.stringify(measurement))
          
        $scope.token = window.localStorage.getItem("token");
        $scope.username = window.localStorage.getItem("username");

        var url = 'http://147.228.63.49:80/app/mobile-services/scheme';
        var data = {'client_username': $scope.username, 'token': $scope.token, 'measurementID': measurement.id};
        console.log(data);
        $http.post(url, data).then(function(response){
            var myData = response;
            console.log("received scheme"); 
            console.log(myData);
            
            window.localStorage.setItem("measurement_scheme", JSON.stringify(myData.data))
            $state.go('menu.experiment');   
        }); 
        
    };

})

.controller('experimentCtrl', function($scope, $cordovaBarcodeScanner, $ionicPopup, $ionicLoading, $http) {

    $scope.objects = [];
    $scope.person = {};

    $scope.$on('$ionicView.beforeEnter', function(){
        var myData = JSON.parse(window.localStorage.getItem("measurement_scheme"));
        $scope.measurement = JSON.parse(window.localStorage.getItem("measurement"));
        $scope.token = window.localStorage.getItem("token"); 
        $scope.username = window.localStorage.getItem("username");
        
        for (var i = 0; i < myData.length; i++){
                $scope.objects[i] = myData[i];
                $scope.objects[i].schema = JSON.parse(myData[i].scheme);
                for (var j = 0; j < $scope.objects[i].schema.length; j++){
                    if ($scope.objects[i].schema[j].formType == 'checkbox'){
                        
                    }
                }
        }

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
                //creating array empty
                var response = new Array($scope.objects.length);
                for (var i = 0; i < $scope.objects.length; i++) {
                    response[i] = new Array($scope.objects[i].schema.length);
                    for (var j = 0; j < $scope.objects[i].schema.length; j++){
                        response[i][j] = {
                            values: {},
                            id: ""
                        };
                        if ($scope.objects[i].schema[j].formType == 'checkbox'){
                            response[i][j].values = new Array(1);
                            response[i][j].values[0] = new Array(Object.keys($scope.objects[i].schema[j].values).length);
                        }
                        else {
                            response[i][j].values = new Array(Object.keys($scope.objects[i].schema[j].values).length);
                        }
                    }
                }
                // filling array with data
                for (var i = 0; i < $scope.objects.length; i++){
                    for (var j = 0; j < $scope.objects[i].schema.length; j++){
                        response[i][j].id = $scope.objects[i].schema[j].id;
                        for (var k = 0; k < Object.keys($scope.objects[i].schema[j].values).length; k++){         
                            if ($scope.objects[i].schema[j].formType == 'checkbox'){
                                response[i][j].values[0][k] = $scope.objects[i].schema[j].values[k];
                            }
                            else {
                                response[i][j].values[k] = $scope.objects[i].schema[j].values[k];
                            }
                        }
                    }
                } 
                // sending to server
                var ok = 0;
                var idUsed = 0;
                var idNotFound = 0;

                for(var i = 0; i < response.length; i++){
                    console.log(JSON.stringify({'client_username':$scope.username,
                            'token':$scope.token,
                            'personID':$scope.person.personID,
                            'measurementID':$scope.measurement.id,
                            'experimentID':$scope.objects[i].experimentID,
                            'data':response[i]
                            
                    }))
                    console.log(JSON.stringify(response[i]));
                    $http.post('http://147.228.63.49:80/app/mobile-services/recieve-data',
                            {'client_username':$scope.username,
                            'token':$scope.token,
                            'personID':$scope.person.personID,
                            'measurementID':$scope.measurement.id,
                            'experimentID':$scope.objects[i].experimentID,
                            'data':response[i]
                            
                    }).then(function(response){
                        var myData = response;
                        console.log(myData);
                        
                        if (myData.data == 'id used'){
                            idUsed++;
                            $scope.person.personID = "";
                        } else if (myData.data == 'id not found'){                            
                            idNotFound++;
                            $scope.person.personID = "";
                        }
                        else {
                            //clean up
                            var myData = JSON.parse(window.localStorage.getItem("measurement_scheme"));
                            for (var i = 0; i < myData.length; i++){ 
                                $scope.person.personID = "";
                                $scope.objects[i] = myData[i];
                                $scope.objects[i].schema = JSON.parse(myData[i].scheme);
                            } 
                        }
                    });
                    //popup based on response
                    if (i = response.length - 1){
                        if (idUsed > 0){
                            var alertPopup = $ionicPopup.alert({
                                title: 'ID uživatele již zaregistrováno',
                                template: 'Použijte prosím jiné ID'
                            });
                        } else if (idNotFound > 0){
                            var alertPopup = $ionicPopup.alert({
                                title: 'ID uživatele nenalezeno',
                                template: 'Použijte prosím jiné ID'
                            });
                        } else {
                            var alertPopup = $ionicPopup.alert({
                                title: 'OK',
                                template: 'Uložení proběhlo v pořádku'
                            });
                        }
                    }
                }
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