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
    var myIoSocket = io.connect('http://147.228.63.49:8080/mobile-services/');
    //var myIoSocket = io.connect('http://147.228.63.49:8080/app.fcgi/m');
    //var myIoSocket = io.connect('http://chat.socket.io')
    mySocket = socketFactory({
        ioSocket: myIoSocket
    });

    return mySocket;
})