define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/Components/RequestComponent',
    'dojo/cookie'
], function (declare, RequestComponent, cookie) {


    return declare(RequestComponent, {


        send: function (extraData) {
            // alert("TODO: Implementar petició per canviar d'editor");
            // return;

            // cookie("IOCForceScriptLoad", 1);

            // Eliminem els esborranys, si no s'elimina la petició és interceptada pel comparador de draft/document
            // i es perd el paràmetre amb el contentFormat
            var id = this.dispatcher.getGlobalState().getCurrentId();

            // Eliminem tots els esborranys abans d'enviar la petició
            this.dispatcher.getContentCache(id).getMainContentTool()._removeAllDrafts();


            // ALERTA! sempre es descarta l'esborrany perquè correspondrà a l'editor actual i no al nou
            var urlBase = this._getUrlBase() + '?call=edit',
                dataToSend = {
                    do: 'edit',
                    id: id,
                    format: this.format,
                    recover_draft: 'false'
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


        _addExtraDataToObject: function(object, data) {
            for (var attrname in data) {
                object[attrname] = data[attrname];
            }

            return object;
        }
    });
});