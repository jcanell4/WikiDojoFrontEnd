define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/Components/RequestComponent',
    'dojo/cookie'
], function (declare, RequestComponent, cookie) {


    return declare(RequestComponent, {


        send: function (extraData) {

            cookie("IOCForceScriptLoad", 1);

            var urlBase = this._getUrlBase(),
                dataToSend = {
                    call: "preview",
                    wikitext: this._getCurrentContent(),
                };

            if (extraData) {
                dataToSend = this._addExtraDataToObject(dataToSend, extraData);
            }

            this.inherited(arguments, [urlBase, dataToSend]);
        },

        _getCurrentContent: function () {
            var dispatcher = this.dispatcher;
            var id = dispatcher.getGlobalState().getCurrentId(),
                contentTool = dispatcher.getContentCache(id).getMainContentTool();

            return contentTool.getCurrentContent();
        },

        _getUrlBase: function () {
            var dispatcher = this.dispatcher;
            var id = dispatcher.getGlobalState().getCurrentId(),
                contentTool = dispatcher.getContentCache(id).getMainContentTool();

            return contentTool.requester.get("defaultUrlBase")
        },


        _addExtraDataToObject(object, data) {
            for (var attrname in data) {
                object[attrname] = data[attrname];
            }

            return object;
        }
    });
});