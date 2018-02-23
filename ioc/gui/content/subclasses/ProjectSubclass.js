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
            this.setFireEventHandler(this.eventName.CANCEL, this._doCancelDocument.bind(this));
            
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
            var dataToSend = this.getQuerySave(),
                containerId = this.id;

            if (event.extraDataToSend) {
                if (typeof event.extraDataToSend === "string") {
                    lang.mixin(dataToSend, ioQuery.queryToObject(event.extraDataToSend));
                } else {
                    lang.mixin(dataToSend, event.extraDataToSend);
                }
            }

            return {
                id: this.id,
                dataToSend: dataToSend,
                standbyId: containerId
            };
        },

        _doCancelDocument: function (event) {
            var containerId = this.id,
                dataToSend = this.getQueryCancel(this.id);

            if (event.extraDataToSend) {
                if (typeof event.extraDataToSend === "string") {
                    dataToSend += "&" + event.extraDataToSend;
                } else {
                    dataToSend += "&" + ioQuery.objectToQuery(event.extraDataToSend);
                }
            }

            return {
                id: this.id,
                dataToSend: dataToSend,
                standbyId: containerId
            };
        },

        getQuerySave: function () {
            var $form = jQuery('#form_' + this.id);
            var values = {"id": this.ns, "projectType":this.projectType};

            jQuery.each($form.serializeArray(), function (i,field) {
                values[field.name] = field.value;
            });
            return values;
        },

        getQueryCancel: function () {
            return 'do=cancel&id=' + this.ns;
        },


        _getDataFromEvent: function (event) {
            if (event.dataToSend) {
                return event.dataToSend;
            } else {
                return event;
            }
        }
        
    });
    
});
