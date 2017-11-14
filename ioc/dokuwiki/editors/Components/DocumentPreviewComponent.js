define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/Components/RequestComponent',
    'dojo/cookie'
], function (declare, RequestComponent, cookie) {


    return declare(RequestComponent, {


        send: function () {

            cookie("IOCForceScriptLoad", 1);

            var urlBase = this._getUrlBase(),
                dataToSend = {
                    call: "preview",
                    wikitext: this._getCurrentContent()
                };

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


    });
});