define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin',
    'dojo/cookie'
], function (declare, AbstractAcePlugin, cookie) {

    return declare([AbstractAcePlugin], {

        init: function () {
            var args = {
                type: "preview", // we havea new type that links to the function
                title: "Previsualitzar el contingut d'aquest editor",
                icon: "/iocjslib/ioc/gui/img/Document-Preview-icon.png"
            };

            this.addButton(args, this.activate);
        },


        activate: function () {
            switch (this.editor.TOOLBAR_ID) {
                case 'full-editor':
                    this._activateFull();
                    break;

                case 'partial_edit':
                    this._activatePartial();
                    break;

                default:
                    throw new Error("Tipus d'editor no reconegut: " + this.editor.TOOLBAR_ID);
            }
        },


        // El context és el mateix plugin
        _activateFull: function () {
            var dispatcher = this.editor.dispatcher;
            var id = dispatcher.getGlobalState().getCurrentId(),
                contentTool = dispatcher.getContentCache(id).getMainContentTool(),
                dataToSend = contentTool.requester.get("dataToSend"),
                urlBase = contentTool.requester.get("urlBase");

            cookie("IOCForceScriptLoad", 1);

            contentTool.requester.set("dataToSend", {call: "preview", wikitext: contentTool.getCurrentContent()});
            contentTool.requester.set("urlBase", contentTool.requester.get("defaultUrlBase"));

            contentTool.requester.sendRequest().then(function () {
                contentTool.requester.set("urlBase", urlBase);
                contentTool.requester.set("dataToSend", dataToSend)
            });
        },

        _activatePartial: function () {
            var dispatcher = this.editor.dispatcher;
            var chunk = dispatcher.getGlobalState().getCurrentElementId(),
                id = dispatcher.getGlobalState().getCurrentId(),
                contentTool = dispatcher.getContentCache(id).getMainContentTool(),
                dataToSend = contentTool.requester.get("dataToSend"),
                urlBase = contentTool.requester.get("urlBase");

            cookie("IOCForceScriptLoad", 1);

            chunk = chunk.replace(id + "_", "");
            chunk = chunk.replace("container_", "");

            contentTool.requester.set("dataToSend", {call: "preview", wikitext: contentTool.getEditedChunk(chunk)});
            contentTool.requester.set("urlBase", contentTool.requester.get("defaultUrlBase"));

            contentTool.requester.sendRequest().then(function () {
                contentTool.requester.set("urlBase", urlBase);
                contentTool.requester.set("dataToSend", dataToSend)
            });
        }

    });

});