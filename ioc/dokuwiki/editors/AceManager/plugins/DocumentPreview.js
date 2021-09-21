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

            this.addButton(args, this.process);
        },


        process: function () {
            let editor = this.getEditor();

            switch (editor.TOOLBAR_ID) {
                case 'full-editor':
                    this._processFull();
                    break;

                case 'partial-editor':
                    this._processPartial();
                    break;

                default:
                    throw new Error("Tipus d'editor no reconegut: " + editor.TOOLBAR_ID);
            }
        },


        // El context és el mateix plugin
        _processFull: function () {
            var id = this.dispatcher.getGlobalState().getCurrentId(),
                contentTool = this.dispatcher.getContentCache(id).getMainContentTool(),
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

        _processPartial: function () {
            var chunk = this.dispatcher.getGlobalState().getCurrentElementId(),
                id = this.dispatcher.getGlobalState().getCurrentId(),
                contentTool = this.dispatcher.getContentCache(id).getMainContentTool(),
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