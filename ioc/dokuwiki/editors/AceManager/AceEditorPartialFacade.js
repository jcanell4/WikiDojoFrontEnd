define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/AceManager/AceEditorFullFacade',
    'ioc/dokuwiki/editors/AceManager/toolbarManager',
    'dojo/cookie',
    'dojo/dom',
    'dojo/dom-style',
    'dojo/dom-geometry',

], function (declare, AceEditorFullFacade, toolbarManager, cookie, dom, style, geometry) {
    return declare([AceEditorFullFacade], {

        TOOLBAR_ID: 'partial_edit',
        VERTICAL_MARGIN: 100,
        MIN_HEIGHT: 200,

        addToolbars: function () {
            //console.log("StructuredDocumentSubclass#addToolbars");
            // var auxId;

            this.addButtons();

            this.toolbarId = 'toolbar_' + this.id;
            toolbarManager.initToolbar('toolbar_' + this.id, 'textarea_' + this.id, this.TOOLBAR_ID);

        },

        addButtons: function () {
            var argSave = {
                    type: "SaveButton",
                    title: "Desar",
                    icon: "/iocjslib/ioc/gui/img/save.png"
                },

                argCancel = {
                    type: "BackButton",
                    title: "Tornar",
                    icon: "/iocjslib/ioc/gui/img/back.png"
                },

                confEnableAce = {
                    type: "EnableAce",
                    title: "Activar/Desactivar ACE",
                    icon: "/iocjslib/ioc/gui/img/toggle_on.png"
                },

                confEnableWrapper = {
                    type: "EnableWrapper", // we havea new type that links to the function
                    title: "Activar/Desactivar embolcall",
                    icon: "/iocjslib/ioc/gui/img/wrap.png"
                },
                argPreview = {
                    type: "preview", // we havea new type that links to the function
                    title: "Previsualitzar el contingut d'aquest editor",
                    icon: "/iocjslib/ioc/gui/img/Document-Preview-icon.png"
                };

            toolbarManager.addButton(argPreview, this._funcPreview.bind(this.dispatcher), this.TOOLBAR_ID);
            toolbarManager.addButton(confEnableWrapper, this._funcEnableWrapper.bind(this.dispatcher), this.TOOLBAR_ID);
            toolbarManager.addButton(confEnableAce, this._funcEnableAce.bind(this.dispatcher), this.TOOLBAR_ID);
            toolbarManager.addButton(argSave, this._funcSave.bind(this.dispatcher), this.TOOLBAR_ID);
            toolbarManager.addButton(argCancel, this._funcCancel.bind(this.dispatcher), this.TOOLBAR_ID);
        },

        // ALERTA[Xavi] this fa referencia al dispatcher
        _funcSave: function () {
            // console.log("StructuredDocumentSubclass#_funcSave");

            var chunk = this.getGlobalState().getCurrentElementId(),
                id = this.getGlobalState().getCurrentId(),
                eventManager = this.getEventManager();

            chunk = chunk.replace(id + "_", "");
            chunk = chunk.replace("container_", "");


            //console.log("StructuredDocumentSubclass#_funcSave", id, chunk);

            eventManager.fireEvent(eventManager.eventName.SAVE_PARTIAL, {
                id: id,
                chunk: chunk
            }, id);
        },

        _funcPreview: function(){
            var chunk = this.getGlobalState().getCurrentElementId(),
                id = this.getGlobalState().getCurrentId(),
                contentTool = this.getContentCache(id).getMainContentTool(),
                dataToSend = contentTool.requester.get("dataToSend"),
                urlBase = contentTool.requester.get("urlBase");

            cookie("IOCForceScriptLoad", 1);

            chunk = chunk.replace(id + "_", "");
            chunk = chunk.replace("container_", "");




            contentTool.requester.set("dataToSend", {call:"preview", wikitext:contentTool.getEditedChunk(chunk)});
            contentTool.requester.set("urlBase", contentTool.requester.get("defaultUrlBase"));
            contentTool.requester.sendRequest();
            contentTool.requester.set("urlBase", urlBase);
            contentTool.requester.set("dataToSend", dataToSend);
        },

        /**
         * Activa o desactiva l'editor ACE segons l'estat actual
         *
         * @returns {boolean} - Sempre retorna fals.
         */
        _funcEnableAce: function () {
            var chunk = this.getGlobalState().getCurrentElementId(),
                id = this.getGlobalState().getCurrentId();
            chunk = chunk.replace(id + "_", "");
            chunk = chunk.replace("container_", "");
            var editor = this.getContentCache(id).getMainContentTool().getEditor(chunk);

            editor.toggleEditor();

        },

        _funcCancel: function () {
            var chunk = this.getGlobalState().getCurrentElementId(),
                id = this.getGlobalState().getCurrentId(),
                eventManager = this.getEventManager();

            chunk = chunk.replace(id + "_", "");
            chunk = chunk.replace("container_", "");

            //this.getEventManager().dispatchEvent(eventManager.eventNameCompound.CANCEL_PARTIAL + id, {
            //    id: id,
            //    chunk: chunk
            //});
            eventManager.fireEvent(eventManager.eventName.CANCEL_PARTIAL, {
                id: id,
                chunk: chunk
            }, id);
        },

        /**
         * Activa o desactiva l'embolcall del text.
         * @returns {boolean} - Sempre retorna fals
         */
        _funcEnableWrapper: function () {
            var chunk = this.getGlobalState().getCurrentElementId(),
                id = this.getGlobalState().getCurrentId(),
                editor;
            chunk = chunk.replace(id + "_", "");
            chunk = chunk.replace("container_", "");

            editor = this.getContentCache(id).getMainContentTool().getEditor(chunk);
            editor.toggleWrap();
        },

        setHeight: function (height) {
            console.log("AceEditorPartialFacade#setHeight", height);
            var min = this.MIN_HEIGHT,
                contentNode = dom.byId('editor_' + this.id),
                h = geometry.getContentBox(contentNode).h,
                max = h - this.VERTICAL_MARGIN,
                normalizedHeight = Math.max(min, Math.min(height, max));


            var node = dom.byId(this.dokuWrapper.textArea.id);

            if (node) {
                style.set(node, "height", "" + normalizedHeight  + "px");
            }

            node = dom.byId(this.iocAceEditor.containerId);
            if (node) {
                style.set(node, "height", "" + normalizedHeight  + "px");
            }

            this.container.aceWrapper.resize(); // TODO[Xavi] Important! sense això no s'ajusta la mida del editor

        },


    });
});

