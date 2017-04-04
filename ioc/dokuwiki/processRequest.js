define([
    "ioc/wiki30/Request"
], function (Request) {

    var request = new Request(),

    getQueryString = function (data) {
        var query = '',
        first = true;

        for (var item in data) {

            if (first) {
                first = false;
            } else {
                query +="&";

            }
            query +=item + "=" + data[item];
        }

        return query;
    };

    return function(params){
        console.log("processRequest", params);

        request.urlBase = params.urlBase;

        var queryString = getQueryString(params.params);

        request.sendRequest(queryString);
    };

});

