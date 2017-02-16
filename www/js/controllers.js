angular.module('app.controllers', [])

.controller('loginCtrl', function($scope, $cordovaBarcodeScanner, $state, $http, $ionicPopup, $translate, $ionicLoading, $filter) {

    $scope.user = {};

    $scope.$on('$ionicView.enter', function(){
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

    $scope.ChangeLanguage = function(lang){
		$translate.use(lang);
	}

    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            $scope.user.username = imageData.text;
        },
        function(error) { 
            var alertPopup = $ionicPopup.alert({
                title: $filter('translate')('ERROR'),
                template: "{{ 'QR_FAIL' | translate }}"
            });
        });
    };

    $scope.login = function() {
        window.localStorage.setItem("username", $scope.user.username);
        window.localStorage.setItem("password", $scope.user.password);       

        var url = 'http://147.228.63.49:80/app/mobile-services/login';
        var data = {'client_username': $scope.user.username, 
                    'client_passwd': $scope.user.password
                   };


        $ionicLoading.show({
            //noBackdrop: true,
            template: '<ion-spinner icon="circles"></ion-spinner>',
        });

        console.log(data);
        $http.post(url, data)
        .then(function(response){

            $ionicLoading.hide();

            var myData = response;
            console.log(myData);
            
            if (myData.data == 'authorization failed'){
                var alertPopup = $ionicPopup.alert({
                    title: $filter('translate')('ERROR'),
                    template: "{{ 'AUTH_FAIL' | translate }}"
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
        }, function(error){

            $ionicLoading.hide();

            var alertPopup = $ionicPopup.alert({
                title: $filter('translate')('ERROR'),
                template: "{{ 'CONNECT_FAIL' | translate }}"
            });
        });
    };
})


.controller('experimentListCtrl', function($scope, $state, $http, $translate, $ionicLoading, $filter) {


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
        var data = {'client_username': $scope.username, 
                    'token': $scope.token, 
                    'measurementID': measurement.id
                   };

        $ionicLoading.show({
            template: '<ion-spinner icon="circles"></ion-spinner>',
        });

        console.log(data);
        $http.post(url, data).then(function(response){

            $ionicLoading.hide();

            var myData = response;
            console.log("received scheme"); 
            console.log(myData);
            
            window.localStorage.setItem("measurement_scheme", JSON.stringify(myData.data))
            $state.go('menu.experiment');   
        },
        function(error){

            $ionicLoading.hide();

            var alertPopup = $ionicPopup.alert({
                title: $filter('translate')('ERROR'),
                template: "{{ 'CONNECT_FAIL' | translate }}"
            });
        }); 
        
    };

})

.controller('experimentCtrl', function($scope, $cordovaBarcodeScanner, $ionicPopup, $http, $translate, $ionicLoading, $filter) {

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
        }

    });

    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            var str = imageData.text;
            str = str.substring(str.lastIndexOf("/") + 1);
            $scope.person.personID = str;
        },
        function(error) { 
            var alertPopup = $ionicPopup.alert({
                title: $filter('translate')('ERROR'),
                template: "{{ 'QR_FAIL' | translate }}"
            });
        });
    };

    $scope.showConfirm = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: $filter('translate')('SAVE_CONFIRM1'),
            template: "{{ 'SAVE_CONFIRM2' | translate }}"
        });

        confirmPopup.then(function(res) {
            if(res) {

                $ionicLoading.show({
                    template: '<ion-spinner icon="circles"></ion-spinner>',
                });

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

                for(var i = 0; i < response.length; i++){
                    var url = 'http://147.228.63.49:80/app/mobile-services/recieve-data';
                    var data = {'client_username':$scope.username,
                                'token':$scope.token,
                                'personID':$scope.person.personID,
                                'measurementID':$scope.measurement.id,
                                'experimentID':$scope.objects[i].experimentID,
                                'data':response[i]    
                               };
                            
                    console.log(data);
                    $http.post(url, data).then(function(response){
                        
                        var myData = response;
                        console.log(myData);
                        
                        if (myData.data == 'Registration failed. Use another ID!'){
                            var alertPopup = $ionicPopup.alert({
                                title: $filter('translate')('REG_FAIL1'),
                                template: "{{ 'REG_FAIL2' | translate }}"
                            });
                            $scope.person.personID = "";
                        } else if (myData.data == 'ID not found.'){                            
                            var alertPopup = $ionicPopup.alert({
                                title: $filter('translate')('SAVE_FAIL1'),
                                template: "{{ 'SAVE_FAIL2' | translate }}"
                            });
                            $scope.person.personID = "";
                        }
                        else {
                            var alertPopup = $ionicPopup.alert({
                                title: $filter('translate')('SAVE_OK1'),
                                template: "{{ 'SAVE_OK2' | translate }}"
                            });
                            //clean up
                            var myData = JSON.parse(window.localStorage.getItem("measurement_scheme"));
                            
                            for (var i = 0; i < myData.length; i++){ 
                                $scope.person.personID = "";
                                $scope.objects[i] = myData[i];
                                $scope.objects[i].schema = JSON.parse(myData[i].scheme);    
                            } 
                        }
                    }, 
                    function(error){

                        $ionicLoading.hide();

                        var alertPopup = $ionicPopup.alert({
                            title: $filter('translate')('ERROR'),
                            template: "{{ 'CONNECT_FAIL' | translate }}"
                        });
                    });
                }
            }
        });
    };
})


/** Results page - scan or input person ID and then get results from server */
.controller('resultsCtrl', function($scope, $cordovaBarcodeScanner, $ionicPopup, $http, $translate, $ionicLoading, $filter) {

    /** Variables */
    $scope.objects = [];
    $scope.person = {};

    /** Get variables before entering */
    $scope.$on('$ionicView.beforeEnter', function(){
        $scope.token = window.localStorage.getItem("token"); 
        $scope.username = window.localStorage.getItem("username");
    });

    /** Scan QR */
    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            var str = imageData.text;
            str = str.substring(str.lastIndexOf("/") + 1);
            $scope.person.personID = str;
        },
        function(error) { 
            var alertPopup = $ionicPopup.alert({
                title: $filter('translate')('ERROR'),
                template: "{{ 'QR_FAIL' | translate }}"
            });
        });
    };

    /** After button pressed ask to confirm then get results */
    $scope.showConfirm = function() {

        var confirmPopup = $ionicPopup.confirm({
            title: $filter('translate')('LOAD_RESULTS1'),
            template: "{{ 'LOAD_RESULTS2' | translate }}"
        });

        confirmPopup.then(function(res) {
            if(res) {

                var url = 'http://147.228.63.49:80/app/mobile-services/data';
                var data = {'client_username':$scope.username,
                            'token':$scope.token,
                            'personID':$scope.person.personID                    
                           };

                $ionicLoading.show({
                    template: '<ion-spinner icon="circles"></ion-spinner>',
                });

                console.log(data);
                $http.post(url, data).then(function(response){

                    $ionicLoading.hide();

                    var myData = response;
                    console.log(myData);

                    if (myData.data == 'ID not found.'){                                                 
                        var alertPopup = $ionicPopup.alert({
                            title: $filter('translate')('SAVE_FAIL1'),
                            template: "{{ 'SAVE_FAIL2' | translate }}"
                        });
                        $scope.person.personID = "";
                    }
                }, 
                function(error){

                    $ionicLoading.hide();

                    var alertPopup = $ionicPopup.alert({
                        title: $filter('translate')('ERROR'),
                        template: "{{ 'CONNECT_FAIL' | translate }}"
                    });
                });
            }
        });
    };
})   

.controller('signupCtrl', function($scope) {

})
   
.controller('settingsCtrl', function($scope, $translate) {
    
    $scope.ChangeLanguage = function(lang){
		$translate.use(lang);
	}

})