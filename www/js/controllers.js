angular.module('app.controllers', [])

/** Login page - scan or input login and password and verify on server*/
.controller('loginCtrl', function($scope, $cordovaBarcodeScanner, $state, $http, $ionicPopup, $translate, $ionicLoading, $filter) {

    /** Variables */
    $scope.user = {};

 //   var master = {devel: false, port: 80};
 //   var devel = {devel: true, port: 8080};
 //   $scope.server = master;
    
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
            /*var alertPopup = $ionicPopup.alert({
                title: $filter('translate')('ERROR'),
                template: "{{ 'QR_FAIL' | translate }}"
            });*/
            console.log("error while scanning: " + error);
        });
    };

    $scope.login = function() {
        
        /** Show loading */
        $ionicLoading.show({
            noBackdrop: true,
            template: '<ion-spinner icon="circles"></ion-spinner>'
        });     

        /** Catch if username is blank */
        if (typeof $scope.user.username === 'undefined' || typeof $scope.user.username === 'null' || $scope.user.username == ""){
            /** Hide loading */
            $ionicLoading.hide();
            
            var alertPopup = $ionicPopup.alert({
                title: $filter('translate')('FORGOT_NAME1'),
                template: "{{ 'FORGOT_NAME2' | translate }}"
            });
            return;
        }

        /** Catch if password is blank */
        if (typeof $scope.user.password === 'undefined' || typeof $scope.user.password === 'null' || $scope.user.password == ""){
            /** Hide loading */
            $ionicLoading.hide();
            
            var alertPopup = $ionicPopup.alert({
                title: $filter('translate')('FORGOT_PASS1'),
                template: "{{ 'FORGOT_PASS2' | translate }}"
            });
            return;
        }

    //    if ($scope.user.username.startsWith("dev:")){
    //         $scope.user.username = $scope.user.username.substring(4);
    //         $scope.server = devel;
    //    } else {
	  //        $scope.server = master;
	  //    }    
        
        /** Save data */
        window.localStorage.setItem("username", $scope.user.username);
        window.localStorage.setItem("password", $scope.user.password);  
   //     window.localStorage.setItem("server", JSON.stringify($scope.server));     

        /** Data for server */
        var url = 'https://147.228.63.49:443/app/mobile-services/login';
        var data = {'client_username': $scope.user.username, 
                    'client_passwd': $scope.user.password
                   };   

        /** Send data */
        console.log(url);
        console.log(data);
        $http.post(url, data).then(function(response){

            /** Hide loading */
            $ionicLoading.hide();

            /** parse data */
            var myData = response;
            console.log(myData);
            
            if(myData.data.token !== undefined){
                /** Save data */
                window.localStorage.setItem("token", myData.data.token);
                
                /** Go to homepage*/
                $scope.user = {};
                $state.go('menu.home');
            }

            /** Wrong name or password */
            else if (myData.data == 'authentication failed'){
                var alertPopup = $ionicPopup.alert({
                    title: $filter('translate')('ERROR'),
                    template: "{{ 'AUTH_FAIL' | translate }}"
                });
                $scope.user = {};
            }
            /** Unspecified error */
            else {
                var alertPopup = $ionicPopup.alert({
                    title: $filter('translate')('ERROR'),
                    template: "{{ 'ERR_UNSP' | translate }}"
                });
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
        $scope.token = window.localStorage.getItem("token");
        $scope.username = window.localStorage.getItem("username");
 //       $scope.server = JSON.parse(window.localStorage.getItem("server"));

        /** Show loading */
         $ionicLoading.show({
             noBackdrop: true,
             template: '<ion-spinner icon="circles"></ion-spinner>'
         });

         /** Data for server */
         var url = 'https://147.228.63.49:443/app/mobile-services/measurement-list';
         var data = {'client_username': $scope.username, 
                     'token': $scope.token
                    };
 
         /** Send data */
         console.log(url);
         console.log(data);
         $http.post(url, data).then(function(response){
 
             /** Hide loading */
             $ionicLoading.hide();
 
             /** parse data */
             var myData = response;
             console.log(myData);
            
             if(myData.data.list !== undefined){
                 /** Save data */
                 $scope.experiments = myData.data.list;
                 window.localStorage.setItem("measurement_array", JSON.stringify(myData.data.list));
                 if ($scope.experiments.length == 0){
                    var alertPopup = $ionicPopup.alert({
                        title: $filter('translate')('ERROR'),
                        template: "{{ 'NO_MEASUREMENT' | translate }}"
                    });
                 }
            }

             /** Token expired */
             else if (myData.data == 'authorization failed'){
                 var alertPopup = $ionicPopup.alert({
                     title: $filter('translate')('ERROR'),
                     template: "{{ 'AUTH_EXP' | translate }}"
                 });
                 $scope.user = {};
                 $state.go('login');
             }
             /** Unspecified error */
             else {
                var alertPopup = $ionicPopup.alert({
                    title: $filter('translate')('ERROR'),
                    template: "{{ 'ERR_UNSP' | translate }}"
                });
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
    });

    /** Choose one measurement */
    $scope.showExperiment = function(measurement) {
        /** Save data */
        window.localStorage.setItem("measurement", JSON.stringify(measurement))
    }

})

/** Measurement page - scan or input person ID, put measured values and send them to server */
.controller('measurementCtrl', function($scope, $state, $cordovaBarcodeScanner, $ionicPopup, $http, $translate, $ionicLoading, $filter) {

    /** Variables */
    $scope.objects = [];
    $scope.person = {};

    /** Get variables before entering from server */
    $scope.$on('$ionicView.beforeEnter', function(){
        $scope.measurement = JSON.parse(window.localStorage.getItem("measurement"));
        $scope.token = window.localStorage.getItem("token"); 
        $scope.username = window.localStorage.getItem("username");
   //     $scope.server = JSON.parse(window.localStorage.getItem("server"));
        
        /** Show loading */
        $ionicLoading.show({
            noBackdrop: true,
            template: '<ion-spinner icon="circles"></ion-spinner>'
        });

        /** Data for server */
        var url = 'https://147.228.63.49:443/app/mobile-services/scheme';
        var data = {'client_username': $scope.username, 
                    'token': $scope.token, 
                    'measurementID': $scope.measurement.id
                   };

        /** Send data */
        console.log(url);
        console.log(data);
        $http.post(url, data).then(function(response){

            /** Hide loading */
            $ionicLoading.hide();

            /** parse data */
            var myData = response;
            console.log(myData);

            if(myData.data instanceof Array){
                /** Save data */
                for (var i = 0; i < myData.data.length; i++){
                    $scope.objects[i] = myData.data[i];
                    $scope.objects[i].schema = JSON.parse(myData.data[i].scheme);
                }
                if ($scope.objects.length == 0){
                    var alertPopup = $ionicPopup.alert({
                        title: $filter('translate')('ERROR'),
                        template: "{{ 'NO_INPUT' | translate }}"
                    });
                }  
                window.localStorage.setItem("measurement_scheme", JSON.stringify($scope.objects));
            }

             /** Token expired */
            else if (myData.data == 'authorization failed'){
                var alertPopup = $ionicPopup.alert({
                    title: $filter('translate')('ERROR'),
                    template: "{{ 'AUTH_EXP' | translate }}"
                });
                $scope.user = {};
                $state.go('login');
            }
            /** Unspecified error */
            else {
                var alertPopup = $ionicPopup.alert({
                    title: $filter('translate')('ERROR'),
                    template: "{{ 'ERR_UNSP' | translate }}"
                });
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
            /*var alertPopup = $ionicPopup.alert({
                title: $filter('translate')('ERROR'),
                template: "{{ 'QR_FAIL' | translate }}"
            });*/
            console.log("error while scanning: " + error);
        });
    };

    /** After button pressed ask to confirm then generate data and send */
    $scope.showConfirm = function() {
        var confirmPopup = $ionicPopup.confirm({
            title: $filter('translate')('SAVE_CONFIRM1'),
            template: "{{ 'SAVE_CONFIRM2' | translate }}",
            cancelText: $filter('translate')('CANCEL'),
            okText: $filter('translate')('CONFIRM')
        });

        confirmPopup.then(function(res) {
            if(res) {

                /** Show loading */
                $ionicLoading.show({
                    noBackdrop: true,
                    template: '<ion-spinner icon="circles"></ion-spinner>'
                });

                /** Catch if personID is blank */
                if (typeof $scope.person.personID === 'undefined' || typeof $scope.person.personID === 'null'  || $scope.person.personID == ""){
                    /** Hide loading */
                    $ionicLoading.hide();
                    
                    var alertPopup = $ionicPopup.alert({
                        title: $filter('translate')('FORGOT_ID1'),
                        template: "{{ 'FORGOT_ID2' | translate }}"
                    });
                    return;
                }

                /** creating array empty */
                var response = new Array($scope.objects.length);
                for (var i = 0; i < $scope.objects.length; i++) {
                    response[i] = new Array($scope.objects[i].schema.length);
                    for (var j = 0; j < $scope.objects[i].schema.length; j++){

                        /** Catch if some input is missing */
                        if (typeof $scope.objects[i].schema[j].values === 'undefined' || typeof $scope.objects[i].schema[j].values === 'null' || $scope.objects[i].schema[j].values == ""){
                            /** Hide loading */
                            $ionicLoading.hide();
                            
                            var alertPopup = $ionicPopup.alert({
                                title: $filter('translate')('FORGOT_INPUT1'),
                                template: "{{ 'FORGOT_INPUT2' | translate }}"
                            });
                            return;
                        }
                        /** create object for response, if checkbox, create array of objects */
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


                var iterNum = 0;
                var ok = true;
                /** Data for server */
                for(var i = 0; i < $scope.objects.length; i++){
                  (function(ind){      
                    setTimeout(function(){
                      console.log(ind);
                    var url = 'https://147.228.63.49:443/app/mobile-services/receive-data';
                    var data = {'client_username':$scope.username,
                                'token':$scope.token,
                                'personID':$scope.person.personID,
                                'measurementID':$scope.measurement.id,
                                'experimentID':$scope.objects[ind].experimentID,
                                'data':JSON.stringify(response[ind]) 
                               };
                  
                    /** Send data */   
                    console.log(url);
                    console.log(data);
                    $http.post(url, data).then(function(response){
                        
                        /** Hide loading */
                        $ionicLoading.hide();
                      
                        /** parse data */
                        var myData = response;
                        console.log(myData);

                        iterNum++;

                        /** valid ID, successfully saved */
                        if  (myData.data == 'Save success'){
                            /** clean up */
                            var myData = JSON.parse(window.localStorage.getItem("measurement_scheme"));
                            for (var j = 0; j < myData.length; j++){ 
                                $scope.objects[j] = myData[j];
                                $scope.objects[j].schema = JSON.parse(myData[j].scheme);    
                            }
                            /** Last iteration, all ok */
                            if (ok == true && iterNum == ($scope.objects.length)){
                                $scope.person.personID = "";
                                var alertPopup = $ionicPopup.alert({
                                    title: $filter('translate')('SAVE_OK1'),
                                    template: "{{ 'SAVE_OK2' | translate }}"
                                });    
                            } 
                        }

                        /** invalid ID in registration */
                        else if (myData.data == 'Registration failed. Use another ID!'){
                            ok = false;
                            /** Last iteration */
                            if (iterNum == ($scope.objects.length)){
                                var alertPopup = $ionicPopup.alert({
                                    title: $filter('translate')('REG_FAIL1'),
                                    template: "{{ 'REG_FAIL2' | translate }}"
                                });
                                $scope.person.personID = "";
                            }     
                            
                        } 
                         /** invalid ID */
                        else if (myData.data == 'ID not found'){ 
                            ok = false;
                            /** Last iteration */
                            if (iterNum == ($scope.objects.length)){
                                var alertPopup = $ionicPopup.alert({
                                    title: $filter('translate')('SAVE_FAIL1'),
                                    template: "{{ 'SAVE_FAIL2' | translate }}"
                                });
                                $scope.person.personID = ""; 
                            }
                        }
                        /** Unspecified error */
                        else {
                            ok = false;
                            /** Last iteration */
                            if (iterNum == ($scope.objects.length)){
                                var alertPopup = $ionicPopup.alert({
                                    title: $filter('translate')('ERROR'),
                                    template: "{{ 'ERR_UNSP' | translate }}"
                                });
                            }
                        }
                    }, 
                    /** http ERROR */
                    function(error){

                        $ionicLoading.hide();

                        iterNum++;
                        ok = false;
                         /** Last iteration */
                        if (iterNum == ($scope.objects.length)){
                            var alertPopup = $ionicPopup.alert({
                                title: $filter('translate')('ERROR'),
                                template: "{{ 'CONNECT_FAIL' | translate }}"
                            });
                        }

                    });

                   }, (500 * ind));
                  })(i);
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
  //      $scope.server = JSON.parse(window.localStorage.getItem("server"));
    });

    /** Scan QR */
    $scope.scanBarcode = function() {
        $cordovaBarcodeScanner.scan().then(function(imageData) {
            var str = imageData.text;
            str = str.substring(str.lastIndexOf("/") + 1);
            $scope.person.personID = str;
        },
        function(error) { 
            /*var alertPopup = $ionicPopup.alert({
                title: $filter('translate')('ERROR'),
                template: "{{ 'QR_FAIL' | translate }}"
            });*/
            console.log("error while scanning: " + error);
        });
    };

    /** After button pressed ask to confirm then get results */
    $scope.showConfirm = function() {
                
        /** Show loading */
        $ionicLoading.show({
            noBackdrop: true,
            template: '<ion-spinner icon="circles"></ion-spinner>'
        });

        /** Catch if personID is blank */
        if (typeof $scope.person.personID === 'undefined' || typeof $scope.person.personID === 'null' || $scope.person.personID == ""){
            /** Hide loading */
            $ionicLoading.hide();
            
            var alertPopup = $ionicPopup.alert({
                title: $filter('translate')('FORGOT_ID1'),
                template: "{{ 'FORGOT_ID2' | translate }}"
            });
            return;
        }

        /** Data for server */
       var url = 'https://147.228.63.49:443/app/mobile-services/measured-data';
        var data = {'client_username':$scope.username,
                    'token':$scope.token,
                    'personID':$scope.person.personID                    
                    };

        /** Send data */
        console.log(url);
        console.log(data);
        $http.post(url, data).then(function(response){

            /** Hide loading */
            $ionicLoading.hide();

            /** parse data */
            var myData = response;
            console.log(myData);

            /** valid ID, parse results */
            if (myData.data.experiments !== undefined){
                /** Save data */
                for (var i = 0; i < myData.data.length; i++){
                    $scope.object[i] = myData.data[i];
                }

                window.localStorage.setItem("result_data", JSON.stringify(myData.data))
                window.localStorage.setItem("personID", $scope.person.personID);
                /** Go to results for ID*/
                $scope.person.personID = "";
                $state.go('menu.resultsID');
            }

            /** invalid ID */
            else if (myData.data == 'ID not found'){                                                 
                var alertPopup = $ionicPopup.alert({
                    title: $filter('translate')('SAVE_FAIL1'),
                    template: "{{ 'SAVE_FAIL2' | translate }}"
                });
                $scope.person.personID = "";
            } 
            /* token expired */
            else if (myData.data == 'authorization failed'){
                var alertPopup = $ionicPopup.alert({
                    title: $filter('translate')('ERROR'),
                    template: "{{ 'AUTH_EXP' | translate }}"
                });
                $scope.user = {};
                $state.go('login');
            }
            /** Uspecified error */
            else {
                var alertPopup = $ionicPopup.alert({
                    title: $filter('translate')('ERROR'),
                    template: "{{ 'ERR_UNSP' | translate }}"
                });
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

/** Results page */
.controller('resultsIDCtrl', function($scope) {

    /** Variables */
    $scope.objects = [];

    /** Get variables before entering */
    $scope.$on('$ionicView.beforeEnter', function(){
        $scope.result = JSON.parse(window.localStorage.getItem("result_data")); 
        $scope.personID = window.localStorage.getItem("personID");
  //      $scope.server = JSON.parse(window.localStorage.getItem("server"));

         /** create empty array */
        for (var i = 0; i < $scope.result.experiments.length; i++){
            $scope.objects[i] = {
                experiments: null,
                names: [],
                units: [],
                values: []
            };
        }

        /** fill array with received values */
        for (var i = 0; i < $scope.result.experiments.length; i++){
            $scope.objects[i].experiments = $scope.result.experiments[i];
            $scope.objects[i].names = $scope.result.names[i];
            $scope.objects[i].units = $scope.result.units[i];
            $scope.objects[i].values = $scope.result.values[i];
        }

         /** no results */
        if ($scope.objects.length == 0){
            var alertPopup = $ionicPopup.alert({
                title: $filter('translate')('ERROR'),
                template: "{{ 'NO_RESULTS' | translate }}"
            });
        } 
    });
})

/** Settings page - so far implemented change of language */
.controller('settingsCtrl', function($scope, $translate, $filter, $state) {
    
    /** Get variables before entering */
    $scope.$on('$ionicView.beforeEnter', function(){
  //      $scope.server = JSON.parse(window.localStorage.getItem("server"));
    });
    
     /** list of supported languages */
    $scope.languages = [
      {name: 'ENGLISH', short:'en'},
      {name: 'DEUTSCH', short:'de'},
      {name: 'CZECH', short:'cz'}
    ];

    /** set language */
    for (var i = 0; i < $scope.languages.length; i++){
        if ($translate.use() === $scope.languages[i].short){
            $scope.myLang = $scope.languages[i];
            break;
        }
    }

    /** change language */
    $scope.ChangeLanguage = function(lang){
		  $translate.use(lang);
          console.log("Language changed");
          console.log(lang);
	  }
    
})

/** Menu - controls logout */
.controller('menuCtrl', function ($scope, $state, $ionicPopup, $http, $translate, $ionicLoading, $filter) {

    /** logout from app */
    $scope.logout = function(){
        $scope.token = window.localStorage.getItem("token"); 
        $scope.username = window.localStorage.getItem("username");
   //     $scope.server = JSON.parse(window.localStorage.getItem("server"));
        
          /** Data for server */
        var url = 'https://147.228.63.49:443/app/mobile-services/logout';
        var data = {'client_username': $scope.username, 
                    'token': $scope.token 
                   };

        /** Show loading */
        $ionicLoading.show({
            noBackdrop: true,
            template: '<ion-spinner icon="circles"></ion-spinner>'
        });

        /** Send data */
        console.log(url);
        console.log(data);
        $http.post(url, data).then(function(response){

            /** Hide loading */
            $ionicLoading.hide();

            /** parse data */
            console.log(response);

             /** Token expired */
            if (response.data == 'Logout failed'){

                $scope.user = {};
                $state.go('login');
            }
            /** logout ok */
            else {
                window.localStorage.clear();
                $state.go('login');
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
            $state.go('login');

        }); 
	  }
})

//EMPTY
.controller('homeCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {

    /** Get variables before entering */
    $scope.$on('$ionicView.beforeEnter', function(){
 //       $scope.server = JSON.parse(window.localStorage.getItem("server"));
  //      console.log($scope.server.devel);
    });
}])

//EMPTY
.controller('aboutCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {

    /** Get variables before entering */
    $scope.$on('$ionicView.beforeEnter', function(){
  //      $scope.server = JSON.parse(window.localStorage.getItem("server"));
    });   
    $scope.version = "1.2.3";
    $scope.author = "David Bohmann";
    $scope.company = "Faculty of Applied Sciences at University of West Bohemia";

}])