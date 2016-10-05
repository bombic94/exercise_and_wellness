angular.module('app.services', [])

.factory('BlankFactory', [function(){

}])

.service('BlankService', [function(){

}])

.factory('socket',function(socketFactory){
    var myIoSocket = io.connect('http://147.228.63.49:8080/mobile');
    //var myIoSocket = io.connect('http://147.228.63.49:8080/app.fcgi/m');
    //var myIoSocket = io.connect('http://chat.socket.io')
    mySocket = socketFactory({
        ioSocket: myIoSocket
    });

    return mySocket;
})