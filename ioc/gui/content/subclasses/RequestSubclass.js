define([
    "dojo/_base/declare"
], function (declare) {

    return declare([], {
        constructor: function () {
            this._createRequest();
        },

        _createRequest: function () {

            require(["ioc/wiki30/Request"], function (Request) {
                this.requester = new Request();
                this.requester.defaultUrlBase = "lib/exe/ioc_ajax.php";
            }.bind(this));
        }

    });

});