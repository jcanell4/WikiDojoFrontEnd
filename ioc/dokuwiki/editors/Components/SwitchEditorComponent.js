define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/Components/RequestComponent',
    'dojo/cookie'
], function (declare, RequestComponent, cookie) {


    return declare(RequestComponent, {


        send: function (extraData) {

            // Eliminem els esborranys, si no s'elimina la petició és interceptada pel comparador de draft/document
            // i es perd el paràmetre amb el editorType
            let globalState = this.dispatcher.getGlobalState();
            var id = globalState.getCurrentId();
            var ns = globalState.getCurrentNs();

            // Eliminem tots els esborranys abans d'enviar la petició
            this.dispatcher.getContentCache(id).getMainContentTool()._removeAllDrafts();

            let projectOwner = globalState.getContent(id).projectOwner;
            let projectSourceType = globalState.getContent(id).projectSourceType;


            // ALERTA! sempre es descarta l'esborrany perquè correspondrà a l'editor actual i no al nou
            var urlBase = this._getUrlBase() + '?call=edit',
                dataToSend = {
                    do: 'edit',
                    id: ns,
                    editorType: this.editorType,
                    recover_draft: 'false',
                    projectOwner: projectOwner,
                    projectSourceType: projectSourceType
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

            return contentTool.requester.get("defaultUrlBase");
        },


        _addExtraDataToObject: function (object, data) {
            for (var attrname in data) {
                object[attrname] = data[attrname];
            }

            return object;
        }
    });
});