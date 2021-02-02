define([
    "dojo/_base/declare",
    "dojo/on",
    'dojo/_base/lang',
    "ioc/gui/content/subclasses/LocktimedDocumentSubclass",  //Canviar per DraftTimedSubclass
    "ioc/gui/content/subclasses/BasicEditorSubclass",
    "ioc/gui/content/subclasses/ChangesManagerCentralSubclass",
    "dojo/io-query",
    'ioc/wiki30/Draft',
    'ioc/dokuwiki/editors/AceManager/toolbarManager',

], function (declare, on, lang, LocktimedDocumentSubclass, BasicEditorSubclass, ChangesManagerCentralSubclass, ioQuery, toolbarManager) {

    return declare([BasicEditorSubclass, LocktimedDocumentSubclass, ChangesManagerCentralSubclass],
        //return declare(null,

        /**
         * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
         *
         * S'ha deixat com un fitxer independent per facilitar la seva edició i no pot comptarse amb que sigui accesible
         * en el futur.
         *
         * Aquesta classe s'espera que es mescli amb un DocumentContentTool per afegir-li les funcions de edició de documents
         * amb un ACE-Editor.
         *
         * @class EditorSubclass
         * @extends DocumentSubclass, AbstractChangesManagerCentral
         * @author Xavier García <xaviergaro.dev@gmail.com>
         * @private
         * @see contentToolFactory.generate()
         */
        {

            DRAFT_TYPE: 'full',

            /**
             * El contingut original inicial s'ha de passar a travès del constructor dins dels arguments com la
             * propietat originalContent.
             *
             * @param args
             */
            constructor: function (args) {
                // this._setOriginalContent(args.originalContent);
                this.hasChanges = false;
                this.forceClose = false;
            },

            /**
             * Retorna cert si el contingut actual i el contingut original són diferents o fals si són iguals.
             *
             * @returns {boolean} - Retorna true si el contingut ha canviat o false en cas contrari
             */
            isContentChanged: function () {
//                var content = this.getCurrentContent(),
                    // diffFromOriginal = this._getOriginalContent() != content,
                var diffFromOriginal = this.getEditor().isChanged(),
                    diffFromLastCheck = this.isLastCheckedContentChanged();

                if (diffFromOriginal && diffFromLastCheck) { // No es fa el refresc si encara no s'ha produït cap canvi
                    this.onDocumentRefreshed();
                }

                if (diffFromOriginal && !this.hasChanges) {
                    this.hasChanges = true;
                    this.onDocumentChanged();
                }

                return diffFromOriginal;
            },

            // Només es crida quan es tanca el document o es fa un cancel de la edició per evitar forçar la comprovació de canvis
            isContentChangedRaw: function () {
                return this.hasChanges;
            },

            /**
             * Reinicialitza l'estat del document establint el valor del contingut original igual al del contingut
             * actual.
             */
            resetContentChangeState: function () {
                this.hasChanges = false;
                this.getEditor().resetOriginalContentState();
                // this._setOriginalContent(this.getCurrentContent());
                this.onDocumentChangesReset();
            },

            /**
             * Es registra als esdeveniments i activa la detecció de canvis, copiar, enganxar i pijar tecles dins
             * del node on es troba quest ContentTool.
             * Realitza l'enregistrament al ChangesManager.
             * @override
             */
            postAttach: function () {
                this.registerObserverToEvent(this, this.eventName.REFRESH_EDITION, this._refreshEdition.bind(this)); // Alerta[Xavi] Necessari per redimensionar correctament l'editor quan es recarrega amb més d'una pestanya
                this.registerToChangesManager();
                this.editor.on('change', this._checkChanges.bind(this));
                this.inherited(arguments);
                this.lockDocument(); // Lock i Draft  [JOSEP]:Ara no cal això, ja que es bloqueja des del servidor en fer la petició d'edició
                this._checkChanges();
            },

            _refreshEdition: function (event) {
                this.eventManager.fireEvent(this.eventManager.eventName.EDIT,
                                            {
                                                id: this.id,
                                                dataToSend: "id=" + this.ns + "&refresh=true"
                                            });
            },


            // Alerta[Xavi] el event pot contenir informació que cal afegir al dataToSend, com per exemple el keep_draft i el discardChanges
            _doCancelDocument: function (event) {
                var dataToSend, containerId;
                event = this._mixCachedEvent(event);
                var data = this._getDataFromEvent(event);
                var isAuto = (typeof event.extraDataToSend === 'string' && event.extraDataToSend.indexOf('auto=true') >= 0);

                if (data.discardChanges || isAuto) {
                    dataToSend = this.getQueryForceCancel(); // el paràmetre no es fa servir
                }
                // else if (data.discardChanges === undefined && this.isContentChanged()) {
                else if (data.discardChanges === undefined && this.isContentChangedRaw()) {
                    var cancelDialog = this._generateDiscardDialog();
                    if (cancelDialog)
                        cancelDialog.show();
                    this.cachedEvent = event;
                    return {_cancel: true};
                }
                else {
                    dataToSend = this.getQueryCancel(); // el paràmetre no es fa servir
                }

                if (event.dataToSend) {
                    dataToSend = this.mixData(dataToSend, event.dataToSend, 'string');
                }

                if (event.extraDataToSend) {
                    dataToSend = this.mixData(dataToSend, event.extraDataToSend, 'string');
                }

                if (this.required && this.getPropertyValueFromData(dataToSend, 'keep_draft') === false) {
                    this._removeAllDrafts();
                }

                containerId = this.id;

                if (event.dataToSend && event.dataToSend.close === true || this.getPropertyValueFromData(dataToSend, 'close')) {
                    // this.removeContentTool();
                    // ALERTA[Xavi] Per forçar el tancament de la pestanya hem de descartar els canvis per actualizar
                    // El ChangesManager i forçar la crida de la pestanya com si s'hagues fet click a la pestanya
                    this.forceReset();
                    this.forceClose = true;
                    this.container.closeChild(this);
                    return {
                        id: this.id,
                        dataToSend: dataToSend
                    };
                }

                return {
                    id: this.id,
                    dataToSend: dataToSend,
                    standbyId: containerId
                };
            },

            _removeAllDrafts: function () {
                //console.log("EditorSubclass#_removeAllDrafts", this.id);
                this.draftManager.clearDraft(this.id, this.ns, true);
            },

            _discardChanges: function () {
                // console.log("EditorSubclass#_discardChanges");
                return confirm(this.messageChangesDetected);
            },

            _getDataFromEvent: function (event) {
                if (event.dataToSend) {
                    return event.dataToSend;
                } else {
                    return event;
                }
            },

            getQueryForceCancel: function () {
                var query = 'do=cancel&discard_changes=true&id=' + this.ns;

                if (this.rev) {
                    query += '&rev=' + this.rev;
                }

                var contentCache = this.dispatcher.getGlobalState().getContent(this.id);

                if (contentCache.projectOwner && contentCache.projectOwner !== 'undefined') {
                    query += "&projectOwner=" + contentCache.projectOwner;
                    query += "&projectSourceType=" + contentCache.projectSourceType;
                }

                return query;
            },


            /**
             * Comunica al ChangesManager que pot haver canvis.
             *
             * @private
             */
            _checkChanges: function () {
                //console.log('EditorSubclass#_checkChanges');
                // Si el document està bloquejat mai hi hauran canvis
                if (!this.locked) {
                    this.inherited(arguments);
                }
            },

            // /**
            //  * Retorna el que està establert com a contingut original per fer comprovacions sobre canvis.
            //  *
            //  * @returns {string} - Contingut original
            //  * @private
            //  */
            // _getOriginalContent: function () {
            //     return this.originalContent;
            // },
            //
            // /**
            //  * Estableix el contingut passat com paràmetre com a contingut original.
            //  *
            //  * @param {string} content - Contingut a establir com original
            //  * @private
            //  */
            // _setOriginalContent: function (content) {
            //
            //     // this.originalContent = content;
            // },

            /**
             * Descarta els canvis al document actual i restaura els originals
             */
            discardChanges: function () {
                // TODO: fer la substitució del contingut i comprovar que està sincronitzat amb el ACEEditor, i si no ho està comprovar si es necessari sincronitzar-lo.
                this.inherited(arguments);
            },

            _generateDraftInMemory: function () {
                return {
                    type: this.DRAFT_TYPE,
//                    id: this.id,
                    id: this.ns,
//                    content: jQuery.trim(this.getCurrentContent())
                    content: this.getCurrentContent()
                };
            },

            isLastCheckedContentChanged: function () {
                var content = this.getCurrentContent(),
                    result = this._getLastCheckedContent() != content;

                if (result) {
                    this._setLastCheckedContent(content);
                }

                return result;
            },

            _getLastCheckedContent: function () {
                return this.lastCheckedContent;
            },

            _setLastCheckedContent: function (content) {
                this.lastCheckedContent = content;
            },

            _doSave: function (event) {
                arguments[0] =  this._mixCachedEvent(event);

                if (this.hasChanges || this.rev) {
                    return this.inherited(arguments);
                } else {
                    return {_cancel: true}
                }
            },

            onClose: function () {
                var ret = this.inherited(arguments);
                ret = ret && !this.isContentChanged();
                return ret || this.forceClose;
            }

        });
});
