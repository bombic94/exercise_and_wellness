angular.module('app.services', [])

.factory('BlankFactory', [function(){

}])

.service('BlankService', [function(){

}])

.factory('LoadJSON', function($http) {
    return {
        getJSON: function(dataSource) {
            return $http.get(dataSource);
        },
    }
})

.factory('socket',function(socketFactory){
    //Create socket and connect to http://chat.socket.io 
    var myIoSocket = io.connect('http://147.228.63.49:8080/mobile-services');

    mySocket = socketFactory({
        ioSocket: myIoSocket
    });

    return mySocket;
})