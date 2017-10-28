define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin',
], function (declare, AbstractAcePlugin) {

    return declare([AbstractAcePlugin], {

        init: function () {
            var args = {
                type: 'format',
                title: 'Sintaxis de so',
                icon: '/iocjslib/ioc/gui/img/sound.png',
                open: "{{soundcloud>",
                sample: "identificador del so:clau",
                close: "}}"
            };

            this.addButton(args);
        },


        _funcPreview: function () {
            var id = this.getGlobalState().getCurrentId(),
                contentTool = this.getContentCache(id).getMainContentTool(),
                dataToSend = contentTool.requester.get("dataToSend"),
                urlBase = contentTool.requester.get("urlBase");

            cookie("IOCForceScriptLoad", 1);

            contentTool.requester.set("dataToSend", {call: "preview", wikitext: contentTool.getCurrentContent()});
            contentTool.requester.set("urlBase", contentTool.requester.get("defaultUrlBase"));
            contentTool.requester.sendRequest();
            contentTool.requester.set("urlBase", urlBase);
            contentTool.requester.set("dataToSend", dataToSend);
        },

    });

});