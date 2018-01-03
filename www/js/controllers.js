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
        var url = 'http://147.228.63.49:8080/app/mobile-services/login';
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
    
    

    $scope.fitbitLogin = function() {
    
        var accessToken = "";
        var userId = "";
        var clientId = "22CHZM";
        var clientSecret = "96d9b1c10c79733ba7a525da668dffc7";

        $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        var ref = window.open('https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=' + clientId + '&redirect_uri=http://localhost/callback&scope=activity%20nutrition%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=31536000', '_blank', 'location=no');
        ref.addEventListener('loadstart', function(event) {
            if((event.url).startsWith("http://localhost/callback")) {  
              accessToken = (event.url).split("access_token=")[1].split("&")[0];    
              userId = (event.url).split("user_id=")[1].split("&")[0];        
              ref.close();    
              
              /** Save fitbit token */        
              window.localStorage.setItem("fitbitToken", accessToken); 
              window.localStorage.setItem("fitbitUser", userId); 
                                      
              /** Go to homepage*/    
              $scope.user = {};       
              $state.go('fitbit'); 
            } 
        });
    };

    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (str){
            return this.indexOf(str) == 0;
        };
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
         var url = 'http://147.228.63.49:8080/app/mobile-services/measurement-list';
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
        var url = 'http://147.228.63.49:8080/app/mobile-services/scheme';
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
                    var url = 'http://147.228.63.49:8080/app/mobile-services/receive-data';
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
        var url = 'http://147.228.63.49:8080/app/mobile-services/measured-data';
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
        var url = 'http://147.228.63.49:8080/app/mobile-services/logout';
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

.controller('fitbitCtrl', function($scope, $http, $ionicLoading) {
    $scope.$on('$ionicView.beforeEnter', function(){
    
      $scope.token = window.localStorage.getItem("fitbitToken");
      $scope.user = window.localStorage.getItem("fitbitUser");
      //$scope.token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1WEozRkciLCJhdWQiOiIyMkNIWk0iLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZXMiOiJyc29jIHJhY3QgcnNldCBybG9jIHJ3ZWkgcmhyIHJudXQgcnBybyByc2xlIiwiZXhwIjoxNTQ1OTE0NzEzLCJpYXQiOjE1MTQzODUzMjV9.nCI0MVykbfvc_eyfxCAlBf4yG67_nbX-L2Ve3GO22S4";
      //$scope.user = "5XJ3FG";
    
      $scope.showTable = false;
      /** Show loading */
      $ionicLoading.show({
          noBackdrop: true,
          template: '<ion-spinner icon="circles"></ion-spinner>'
      });
        
      //$http.defaults.headers.common.Authorization = 'Bearer ' + $scope.token;
      $http.defaults.headers.common.Authorization = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1WEozRkciLCJhdWQiOiIyMkNIWk0iLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZXMiOiJyc29jIHJzZXQgcmFjdCBybG9jIHJ3ZWkgcmhyIHJwcm8gcm51dCByc2xlIiwiZXhwIjoxNTQ1OTE0NzEzLCJpYXQiOjE1MTQ4MDQ2NTZ9.w9T3lMy-BYb0-T9mmOQINwC6D1vX2n8CnqjDX7en5IY';      
      
      get1();
      
    });
    
    function get1(){
      /** Get user information */
      var url = "https://api.fitbit.com/1/user/-/profile.json";
      $http.get(url).then(function(response){
              console.log(response);
              $scope.userInfo = response.data;  
              get2();
          },
          /** http ERROR */
          function(error){

            $ionicLoading.hide();

            var alertPopup = $ionicPopup.alert({
                title: $filter('translate')('ERROR'),
                template: "{{ 'COULD_NOT_OBTAIN_FITBIT_DATA' | translate }}"
            });
            //return back
            $state.go('login');

          }); 
    }
      
    function get2(){
      /** Get summary of steps, floors and distance */    
      url = "https://api.fitbit.com/1/user/-/activities.json";      
      $http.get(url).then(function(response){
              console.log(response);
              $scope.userInfo.summary = response.data; 
              get3(); 
          },
          /** http ERROR */
          function(error){

            $ionicLoading.hide();

            var alertPopup = $ionicPopup.alert({
                title: $filter('translate')('ERROR'),
                template: "{{ 'COULD_NOT_OBTAIN_FITBIT_DATA' | translate }}"
            });
            //return back
            $state.go('login');

          }); 
    }
      
    function get3(){ 
      /** Get steps in last month */   
      url = "https://api.fitbit.com/1/user/-/activities/steps/date/today/30d.json";       
      $http.get(url).then(function(response){
              console.log(response);
              var avg = 0;
              response.data['activities-steps'].forEach( function (item){
                avg = avg + parseInt(item.value);
              });
              $scope.userInfo.summary.steps30 = Math.round(avg / 30);  
              get4();
          },
          /** http ERROR */
          function(error){
              $scope.userInfo.summary.steps30 = "";
              get4();
          });
    }
      
    function get4(){
      /** Get floors in last month */     
      url = "https://api.fitbit.com/1/user/-/activities/floors/date/today/30d.json";   
      $http.get(url).then(function(response){
              console.log(response);
              var avg = 0;
              response.data['activities-floors'].forEach( function (item){
                avg = avg + parseInt(item.value);
              });
              $scope.userInfo.summary.floors30 = Math.round(avg / 30);
              get5();  
          },
          /** http ERROR */
          function(error){
              $scope.userInfo.summary.floors30 = "";
              get5();
          });
    }
      
    function get5(){    
      /** Get distance in last month */    
      url = "https://api.fitbit.com/1/user/-/activities/distance/date/today/30d.json";   
      $http.get(url).then(function(response){
              console.log(response);
              var avg = 0;
              response.data['activities-distance'].forEach( function (item){
                avg = avg + parseInt(item.value);
              });
              $scope.userInfo.summary.distance30 = (avg / 30).toFixed(2);  
              get6();
          },
          /** http ERROR */
          function(error){
              $scope.distance30 = "";
              get6();
          });
    }
      
    function get6(){
      /** Get heart rate in last month*/    
      url = "https://api.fitbit.com/1/user/-/activities/heart/date/today/1w.json";      
      $http.get(url).then(function(response){
              console.log(response);
              var min = 999;
              response.data['activities-heart'].forEach( function (item){
                if (min > parseInt(item.value.restingHeartRate)){
                   min = parseInt(item.value.restingHeartRate);
                }
              });
              $scope.userInfo.summary.minHR = min + " BPM";  
              if (min === 999){
                 $scope.userInfo.summary.minHR = "";
              }
              get7();
          },
          /** http ERROR */
          function(error){
              $scope.userInfo.summary.minHR = "";
              get7();
          }); 
    }
      
    function get7(){ 
      /** Get sleep*/   
      url = "https://api.fitbit.com/1/user/-/sleep/minutesAsleep/date/today/30d.json";     
      $http.get(url).then(function(response){
              console.log(response);
              var avg = 0;
              response.data['sleep-minutesAsleep'].forEach( function (item){
                avg = avg + parseInt(item.value);
              });
              $scope.userInfo.summary.sleep30 = Math.floor(avg/1800) + " hours, " + Math.round(avg/30) % 60 + " minutes"; 
              showTable();
          },
          /** http ERROR */
          function(error){
              $scope.userInfo.summary.sleep30 = "";
              showTable();
          }); 
    }
    
    function showTable(){
         
         console.log($scope.userInfo);
         
         if ($scope.userInfo.user.distanceUnit == "METRIC") {
            
            $scope.userInfo.user.height = $scope.userInfo.user.height + " cm";
            $scope.userInfo.summary.best.total.distance.value = $scope.userInfo.summary.best.total.distance.value.toFixed(2) + " km";
            $scope.userInfo.summary.lifetime.total.distance = $scope.userInfo.summary.lifetime.total.distance.toFixed(2) + " km";
            if (typeof $scope.userInfo.summary.distance30 !== 'undefined' && typeof $scope.userInfo.summary.distance30 !== 'null' && $scope.userInfo.summary.distance30 != ""){
                $scope.userInfo.summary.distance30 = $scope.userInfo.summary.distance30 + " km";
            }
         } else if ($scope.userInfo.user.distanceUnit == "en_US") {
            $scope.userInfo.user.height = $scope.userInfo.user.height + " inches";
            $scope.userInfo.summary.best.total.distance.value = $scope.userInfo.summary.best.total.distance.value + " miles";
            $scope.userInfo.summary.lifetime.total.distance = $scope.userInfo.summary.lifetime.total.distance + " miles";
            if (typeof $scope.userInfo.summary.distance30 !== 'undefined' && typeof $scope.userInfo.summary.distance30 !== 'null' && $scope.userInfo.summary.distance30 != ""){
                $scope.userInfo.summary.distance30 = $scope.userInfo.summary.distance30 + " miles";
            }
         }
         
         if ($scope.userInfo.user.weightUnit == "METRIC") {
            $scope.userInfo.user.weight = $scope.userInfo.user.weight + " kg"; 
         } else if ($scope.userInfo.user.weightUnit == "en_US") {
            $scope.userInfo.user.weight = $scope.userInfo.user.weight + " pounds"; 
         } else if ($scope.userInfo.user.weightUnit == "en_GB") {
            $scope.userInfo.user.weight = $scope.userInfo.user.weight + " stone"; 
         }
         
         
         /** Hide loading */
         $ionicLoading.hide();
         $scope.showTable = true;
    }
    
    function synchronize(){
    
//         /** Show loading */
//         $ionicLoading.show({
//             noBackdrop: true,
//             template: '<ion-spinner icon="circles"></ion-spinner>'
//         });
//         
//         /** Data for server */
//         var url = 'http://147.228.63.49:8080/app/mobile-services/fitbit';
//         var data = {'client_username':$scope.username,
//                     'token':$scope.token,
//                     'fitbit':$scope.userInfo                   
//                     };
// 
//         /** Send data */
//         console.log(url);
//         console.log(data);
//         $http.post(url, data).then(function(response){
// 
//             /** Hide loading */
//             $ionicLoading.hide();
// 
//             /** parse data */
//             var myData = response;
//             console.log(myData);
// 
//             /** invalid ID */
//             if (myData.data == 'Fitbit Failed'){                                                 
//                 var alertPopup = $ionicPopup.alert({
//                     title: $filter('translate')('FITBIT_SYNC_FAIL'),
//                     template: "{{ 'FITBIT_SYNC_FAIL' | translate }}"
//                 });
//             } 
//             /* token expired */
//             else if (myData.data == 'authorization failed'){
//                 var alertPopup = $ionicPopup.alert({
//                     title: $filter('translate')('ERROR'),
//                     template: "{{ 'AUTH_EXP' | translate }}"
//                 });
//             }
//             /* OK*/
//             else if (myData.data == 'OK'){
//                 var alertPopup = $ionicPopup.alert({
//                     title: $filter('translate')('SYNC_SUCCESS'),
//                     template: "{{ 'SYNC_SUCCESS' | translate }}"
//                 });
//             }
//             /** Uspecified error */
//             else {
//                 var alertPopup = $ionicPopup.alert({
//                     title: $filter('translate')('ERROR'),
//                     template: "{{ 'ERR_UNSP' | translate }}"
//                 });
//             }  
//         }, 
//         /** http ERROR */
//         function(error){
// 
//             $ionicLoading.hide();
// 
//             var alertPopup = $ionicPopup.alert({
//                 title: $filter('translate')('ERROR'),
//                 template: "{{ 'CONNECT_FAIL' | translate }}"
//             });
//         });
    }
})