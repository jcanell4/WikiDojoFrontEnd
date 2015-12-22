define([
    "ioc/wiki30/Dispatcher"
], function (Dispatcher) {
    var instance=null;
    return function(){
        if(!instance){
            instance = new Dispatcher();
        }
        return instance;
    }
});


