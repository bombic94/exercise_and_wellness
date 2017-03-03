angular.module('app.controllers', [])

/** Login page - scan or input login and password and verify on server*/
.controller('loginCtrl', function($scope, $cordovaBarcodeScanner, $state, $http, $ionicPopup, $translate, $ionicLoading, $filter) {

    /** Variables */
    $scope.user = {};


    /** After launch verify that use of camera is authorized (Android 6+) */
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

    /** Change language */
    $scope.ChangeLanguage = function(lang){
		    $translate.use(lang);
	  }

    /** Scan QR */
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
        /** Save data */
        window.localStorage.setItem("username", $scope.user.username);
        window.localStorage.setItem("password", $scope.user.password);       

        /** Data for server */
        var url = 'http://147.228.63.49:80/app/mobile-services/login';
        var data = {'client_username': $scope.user.username, 
                    'client_passwd': $scope.user.password
                   };

        /** Show loading */
        $ionicLoading.show({
            noBackdrop: true,
            template: '<ion-spinner icon="circles"></ion-spinner>',
        });

        /** Send data */
        console.log(data);
        $http.post(url, data).then(function(response){

            /** Hide loading */
            $ionicLoading.hide();

            /** parse data */
            var myData = response;
            console.log(myData);
            
            /** Wrong name or password */
            if (myData.data == 'authorization failed'){
                var alertPopup = $ionicPopup.alert({
                    title: $filter('translate')('ERROR'),
                    template: "{{ 'AUTH_FAIL' | translate }}"
                });
                $scope.user = {};
            }
            else {
                /** Save data */
                window.localStorage.setItem("token", myData.data.token);
                window.localStorage.setItem("measurement_array", JSON.stringify(myData.data.data))
                
                /** Go to measurement list*/
                $scope.user = {};
                $state.go('menu.listOfMeasurements');
            }
        },
        /** http ERROR */
        function(error){

            $ionicLoading.hide();

            var alertPopup = $ionicPopup.alert({
                title: $filter('translate')('ERROR'),
                template: "{{ 'CONNECT_FAIL' | translate }}"
            });
        });
    };
})

/** Measurement list page - choose one measurement */
.controller('listOfMeasurementsCtrl', function($scope, $state, $http, $translate, $ionicLoading, $filter) {

    /** Get variables before entering */
    $scope.$on('$ionicView.beforeEnter', function(){   
        $scope.experiments = JSON.parse(window.localStorage.getItem("measurement_array"));
        $scope.token = window.localStorage.getItem("token");
        $scope.username = window.localStorage.getItem("username");
    });

    /** Choose one measurement */
    $scope.showExperiment = function(measurement) {
        
        /** Save data */
        window.localStorage.setItem("measurement", JSON.stringify(measurement))

    }

})

/** Measurement page - scan or input person ID, put measured values and send them to server */
.controller('measurementCtrl', function($scope, $cordovaBarcodeScanner, $ionicPopup, $http, $translate, $ionicLoading, $filter) {

    /** Variables */
    $scope.objects = [];
    $scope.person = {};

    /** Get variables before entering from server */
    $scope.$on('$ionicView.beforeEnter', function(){
        $scope.measurement = JSON.parse(window.localStorage.getItem("measurement"));
        $scope.token = window.localStorage.getItem("token"); 
        $scope.username = window.localStorage.getItem("username");
        
        /** Data for server */
        var url = 'http://147.228.63.49:80/app/mobile-services/scheme';
        var data = {'client_username': $scope.username, 
                    'token': $scope.token, 
                    'measurementID': $scope.measurement.id
                   };

        /** Show loading */
        $ionicLoading.show({
            noBackdrop: true,
            template: '<ion-spinner icon="circles"></ion-spinner>',
        });

        /** Send data */
        console.log(data);
        $http.post(url, data).then(function(response){

            /** Hide loading */
            $ionicLoading.hide();

            /** parse data */
            console.log(response);
            for (var i = 0; i < response.data.length; i++){
                $scope.objects[i] = response.data[i];
                $scope.objects[i].schema = JSON.parse(response.data[i].scheme);
            }  
        },
        /** http ERROR */
        function(error){

            $ionicLoading.hide();

            var alertPopup = $ionicPopup.alert({
                title: $filter('translate')('ERROR'),
                template: "{{ 'CONNECT_FAIL' | translate }}"
            });
            //return back
            $state.go('menu.listOfMeasurements');

        }); 

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

    /** After button pressed ask to confirm then generate data and send */
    $scope.showConfirm = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: $filter('translate')('SAVE_CONFIRM1'),
            template: "{{ 'SAVE_CONFIRM2' | translate }}",
            cancelText: $filter('translate')('CANCEL'),
            okText: $filter('translate')('CONFIRM'),
        });

        confirmPopup.then(function(res) {
            if(res) {

                /** Show loading */
                $ionicLoading.show({
                    noBackdrop: true,
                    template: '<ion-spinner icon="circles"></ion-spinner>',
                });

                /** creating array empty */
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
                /** filling array with data */
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

                /** Data for server */
                for(var i = 0; i < response.length; i++){
                    var url = 'http://147.228.63.49:80/app/mobile-services/recieve-data';
                    var data = {'client_username':$scope.username,
                                'token':$scope.token,
                                'personID':$scope.person.personID,
                                'measurementID':$scope.measurement.id,
                                'experimentID':$scope.objects[i].experimentID,
                                'data':response[i]    
                               };
                  
                    /** Send data */        
                    console.log(data);
                    $http.post(url, data).then(function(response){
                        
                        /** Hide loading */
                        $ionicLoading.hide();
                      
                        /** parse data */
                        var myData = response;
                        console.log(myData);
                        
                        /** invalid ID */
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
                      
                        /** valid ID, successfully saved */
                        else {
                            var alertPopup = $ionicPopup.alert({
                                title: $filter('translate')('SAVE_OK1'),
                                template: "{{ 'SAVE_OK2' | translate }}"
                            });
                            /** clean up */
                            var myData = JSON.parse(window.localStorage.getItem("measurement_scheme"));
                            for (var i = 0; i < myData.length; i++){ 
                                $scope.person.personID = "";
                                $scope.objects[i] = myData[i];
                                $scope.objects[i].schema = JSON.parse(myData[i].scheme);    
                            } 
                        }
                    }, 
                    /** http ERROR */
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
.controller('resultsCtrl', function($scope, $state, $cordovaBarcodeScanner, $ionicPopup, $http, $translate, $ionicLoading, $filter) {

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

        /** Confirm popup window */
        var confirmPopup = $ionicPopup.confirm({
            title: $filter('translate')('LOAD_RESULTS1'),
            template: "{{ 'LOAD_RESULTS2' | translate }}",
            cancelText: $filter('translate')('CANCEL'),
            okText: $filter('translate')('CONFIRM'),
        });

        confirmPopup.then(function(res) {
            if(res) {
                
                /** Data for server */
                var url = 'http://147.228.63.49:80/app/mobile-services/data';
                var data = {'client_username':$scope.username,
                            'token':$scope.token,
                            'personID':$scope.person.personID                    
                           };

                /** Show loading */
                $ionicLoading.show({
                    noBackdrop: true,
                    template: '<ion-spinner icon="circles"></ion-spinner>',
                });

                /** Send data */
                console.log(data);
                $http.post(url, data).then(function(response){

                    /** Hide loading */
                    $ionicLoading.hide();

                    /** parse data */
                    var myData = response;
                    console.log(myData);

                    for (var i = 0; i < myData.data.length; i++){
                        $scope.object[i] = myData.data[i];
                    }

                    /** invalid ID */
                    if (myData.data == 'ID not found.'){                                                 
                        var alertPopup = $ionicPopup.alert({
                            title: $filter('translate')('SAVE_FAIL1'),
                            template: "{{ 'SAVE_FAIL2' | translate }}"
                        });
                        $scope.person.personID = "";
                    } 
                    /** valid ID, parse results */
                    else {
                        /** Save data */
                        window.localStorage.setItem("result_data", JSON.stringify(myData.data))
                        window.localStorage.setItem("personID", $scope.person.personID);
                        /** Go to measurement list*/
                        $scope.person.personID = "";
                        $state.go('menu.resultsID');
                    }  
                }, 
                /** http ERROR */
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

/** Sign up page - not implemented yet */
.controller('resultsIDCtrl', function($scope) {

    /** Variables */
    $scope.objects = [];

    /** Get variables before entering */
    $scope.$on('$ionicView.beforeEnter', function(){
        $scope.result = JSON.parse(window.localStorage.getItem("result_data")); 
        $scope.personID = window.localStorage.getItem("personID");

        for (var i = 0; i < $scope.result.experiments.length; i++){
            $scope.objects[i] = {
                experiments: null,
                names: [],
                units: [],
                values: []
            };
        }

        for (var i = 0; i < $scope.result.experiments.length; i++){
            $scope.objects[i].experiments = $scope.result.experiments[i];
            $scope.objects[i].names = $scope.result.names[i];
            $scope.objects[i].units = $scope.result.units[i];
            $scope.objects[i].values = $scope.result.values[i];
        }  
    });
})

/** Settings page - so far implemented change of language */
.controller('settingsCtrl', function($scope, $translate, $filter, $state) {
    
    $scope.languages = [
      {name: 'ENGLISH', short:'en'},
      {name: 'DEUTSCH', short:'de'},
      {name: 'CZECH', short:'cz'}
    ];

    for (var i = 0; i < $scope.languages.length; i++){
        if ($translate.use() === $scope.languages[i].short){
            $scope.myLang = $scope.languages[i];
            break;
        }
    }

    $scope.ChangeLanguage = function(lang){
		  $translate.use(lang);
          console.log("Language changed");
          console.log(lang);
	  }
    
})


.controller('menuCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('homeCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {

}])

.controller('aboutCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {

}])