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

                this.requester.updateSectok = function (sectok) {
                    this.sectok = sectok;
                };

                this.requester.sectok = this.requester.dispatcher.getSectok();
                this.requester.dispatcher.toUpdateSectok.push(this.requester);
            }.bind(this));
        }

    });

});