define([
    "dojo/_base/declare",
    "dojo/on",
    "ioc/gui/content/subclasses/LocktimedDocumentSubclass",  //Canviar per DraftTimedSubclass
    "ioc/gui/content/subclasses/BasicEditorSubclass",
    "ioc/gui/content/subclasses/ChangesManagerCentralSubclass",
    "dojo/io-query",
    'ioc/wiki30/Draft',
], function (declare, on, LocktimedDocumentSubclass, BasicEditorSubclass, ChangesManagerCentralSubclass, ioQuery) {

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
                this._setOriginalContent(args.originalContent);
                this.hasChanges = false;
            },

            /**
             * Retorna cert si el contingut actual i el contingut original són diferents o fals si són iguals.
             *
             * @returns {boolean} - Retorna true si el contingut ha canviat o false en cas contrari
             */
            isContentChanged: function () {
                //console.log("EditorSubclass#isContentChanged");
                var content = this.getCurrentContent(),
                    diffFromOriginal = this._getOriginalContent() != content,
                    diffFromLastCheck = this.isLastCheckedContentChanged();


                if (diffFromOriginal && diffFromLastCheck) { // No es fa el refresc si encara no s'ha produt cap canvi
                    this.onDocumentRefreshed();
                }

                if (diffFromOriginal && !this.hasChanges) {
                    this.onDocumentChanged();
                    this.hasChanges = true;
                }

                return diffFromOriginal;
            },

            /**
             * Reinicialitza l'estat del document establint el valor del contingut original igual al del contingut
             * actual.
             */
            resetContentChangeState: function () {
                this.hasChanges = false;
                this._setOriginalContent(this.getCurrentContent());
                this.onDocumentChangesReset();
            },

            /**
             * Es registra als esdeveniments i activa la detecció de canvis, copiar, enganxar i pijar tecles dins
             * del node on es troba quest ContentTool.
             *
             * Realitza l'enregistrament al ChangesManager.
             *
             * @override
             */
            postAttach: function () {
                //console.log("EditorSubclass#postAttach");
                this.registerToChangesManager();

                jQuery(this.domNode).on('input paste cut keyup', this._checkChanges.bind(this));
                
                this.inherited(arguments);
                
                this.lockDocument(); // Lock i Draft
            },


            // Alerta[Xavi] el event pot contenir informació que cal afegir al dataToSend, com per exemple el keep_draft i el discardChanges
            _doCancelDocument: function (event) {
                //console.log("EditorSubclass#_doCancelDocument", this.id, event);
                var dataToSend, containerId, data = this._getDataFromEvent(event);


                if (data.discardChanges) {
                    dataToSend = this.getQueryForceCancel(this.id); // el paràmetre no es fa servir
                } else {
                    dataToSend = this.getQueryCancel(this.id); // el paràmetre no es fa servir
                }

                if (data.keep_draft) {
                    dataToSend += '&keep_draft=' + data.keep_draft;
                }

                containerId = this.id;

                if(event.extraDataToSend){
                    if(typeof event.extraDataToSend==="string"){
                        dataToSend += "&" + event.extraDataToSend;
                    }else{
                        dataToSend += "&" + ioQuery.objectToQuery(event.extraDataToSend);
                    }
                }

                this.eventManager.dispatchEvent(this.eventName.CANCEL, {
                    id: this.id,
                    dataToSend: dataToSend,
                    standbyId: containerId
                })

            },

            _getDataFromEvent: function (event) {
                if (event.dataToSend) {
                    return event.dataToSend;
                } else {
                    return event;
                }
            },

            getQueryForceCancel: function () {
                return 'do=cancel&discard_changes=true&id=' + this.ns;
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
                    this.changesManager.updateContentChangeState(this.id);
                }
            },

            /**
             * Retorna el que està establert com a contingut original per fer comprovacions sobre canvis.
             *
             * @returns {string} - Contingut original
             * @private
             */
            _getOriginalContent: function () {
                return this.originalContent;
            },

            /**
             * Estableix el contingut passat com paràmetre com a contingut original.
             *
             * @param {string} content - Contingut a establir com original
             * @private
             */
            _setOriginalContent: function (content) {
                this.originalContent = content;
            },

            /**
             * Descarta els canvis al document actual i restaura els originals
             */
            discardChanges: function () {
                // TODO: fer la substitució del contingut i comprovar que està sincronitzat amb el ACEEditor, i si no ho està comprovar si es necessari sincronitzar-lo.

                this.inherited(arguments);
            },

            _generateDraft: function () {
                return {
                    type: this.DRAFT_TYPE,
//                    id: this.id,
                    id: this.ns,
                    content: jQuery.trim(this.getCurrentContent())
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
            }           
        });
});