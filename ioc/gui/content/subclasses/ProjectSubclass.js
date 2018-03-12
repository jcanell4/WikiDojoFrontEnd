define([
    "dojo/_base/declare",
    'dojo/_base/lang',
    "dojo/io-query",
    "ioc/gui/content/subclasses/DocumentSubclass",
    "ioc/gui/content/subclasses/FormSubclass"
], function (declare, lang, ioQuery, DocumentSubclass, FormSubclass) {
    /**
     * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
     *
     * @class ProjectSubclass
     * @extends FormSubclass
     * @culpable Rafael Claver
     */
    return declare([DocumentSubclass, FormSubclass], {
        
        DRAFT_TYPE: "project",

        _generateDraftInMemory: function () {
            return {
                type: this.DRAFT_TYPE,
                id: this.ns,
                content: JSON.stringify(this.getCurrentContent())
            };
        },

        /**
         * Registra els esdeveniments i activa la detecció de canvis, edició del document.
         * Realitza l'enregistrament al ChangesManager.
         * @override
         */
        postAttach: function () {
            this.inherited(arguments);
            this.setFireEventHandler(this.eventName.SAVE_PROJECT, this._doSave.bind(this));
            this.setFireEventHandler(this.eventName.CANCEL_PROJECT, this._doCancelProjectForm.bind(this));
            
            this.lockDocument(); //pendiente de renombrar a algo así como initDraft()
        },
        
        /**
         * @returns {boolean} - Retorna true si el contingut ha canviat o false en cas contrari
         */
        isContentChanged: function () {
            var changed = this.inherited(arguments);
            if (changed) {
                this.onDocumentRefreshed();
            }
            return changed;
        },

        _doSave: function (event) {
            var dataToSend = {};
            
            if (event.dataToSend) {
                dataToSend = event.dataToSend;
            }
            lang.mixin(dataToSend, this.getQuerySave());

            if (event.extraDataToSend) {
                if (typeof event.extraDataToSend === "string") {
                    lang.mixin(dataToSend, ioQuery.queryToObject(event.extraDataToSend));
                } else {
                    lang.mixin(dataToSend, event.extraDataToSend);
                }
            }
            
            if (dataToSend['keep_draft'] === false) {
                this.draftManager.clearDraft(this.id, this.ns, true);
            }

            return {
                id: this.id,
                dataToSend: dataToSend,
                standbyId: this.id
            };
        },

        _doCancelProjectForm: function (event) {
            var extraDataToSend;
            var dataToSend = this.getQueryCancel();
            var containerId = this.id;
            var data = this._getDataFromEvent(event);
            var isAuto = (typeof event.extraDataToSend === "string" && event.extraDataToSend.indexOf('auto=true') >= 0);

            if (data.discard_changes || isAuto) {
                dataToSend = this.getQueryForceCancel();
                this.mixin(dataToSend, this.cachedEvent.dataToSend);
            } 
            else if (data.discard_changes === undefined && this.isContentChanged()) {
                var cancelDialog = this._generateDiscardDialog();
                if (cancelDialog) 
                    cancelDialog.show();
                this.cachedEvent = event;
                return {_cancel: true};
            }

            this.mixin(dataToSend, data);

            if (event.extraDataToSend) {
                if (typeof event.extraDataToSend === "string") {
                    extraDataToSend = ioQuery.queryToObject(event.extraDataToSend);
                } else {
                    extraDataToSend = event.extraDataToSend;
                }
                this.mixin(dataToSend, extraDataToSend);
            }
            
            if (dataToSend['keep_draft'] === false) {
                this.draftManager.clearDraft(this.id, this.ns, true);
            }

            if (dataToSend.close === true) {
                this.forceReset();  
                this.forceClose = true; //Cuando sea necesario, un procedimiento podrá cambiar este valor para impedir el cierre de la pestaña
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

        getQuerySave: function () {
            var $form = jQuery('#form_' + this.id);
            var values = {id: this.ns, projectType: this.projectType};
            
            var fields = $form.serializeArray();
            for (var i=0; i < fields.length; i++) {
                values[fields[i].name] = fields[i].value;
            }

            return values;
        },

        getQueryCancel: function () {
            return {id: this.ns};
        },

        getQueryForceCancel: function () {
            var query = this.getQueryCancel();
            query.discard_changes = true;
            if (this.rev) query.rev = this.rev;
            return query;
        },

        _getDataFromEvent: function (event) {
            if (event.dataToSend) {
                return event.dataToSend;
            } else {
                return event;
            }
        },
        
        onClose: function() {
            var ret = this.inherited(arguments);
            if (ret===undefined) ret = true;

            if (ret && !this.forceClose) {
                var eventManager = this.dispatcher.getEventManager();
                eventManager.fireEvent(eventManager.eventName.CANCEL_PROJECT, {
                    id: this.id,
                    name: eventManager.eventName.CANCEL_PROJECT,
                    dataToSend: {
                        projectType: this.projectType,
                        no_response: true,
                        keep_draft: false,
                        close: true
                    }
                }, this.id);

                ret = false; //Si es dispara l'event no es tanca la pestanya
            }
            ret = ret && !this.isContentChanged();
            return ret || this.forceClose;
        },
        
        /**
         * @override DocumentSubclass
         * @param {object} content : parámetros, datos y estructura del formulario
         */
        updateDocument: function (content) {
            this.setData(content.content);
            this.updateTitle();
            this.render();
            this.addDocument();
        }

    });
    
});
