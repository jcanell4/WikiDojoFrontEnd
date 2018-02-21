define([
    "dojo/_base/declare",
    "ioc/gui/content/subclasses/DocumentSubclass",
    "ioc/gui/content/subclasses/FormSubclass"
], function (declare, DocumentSubclass, FormSubclass) {
    /**
     * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
     *
     * @class ProjectSubclass
     * @extends FormSubclass
     * @culpable Rafael Claver
     */
    return declare([DocumentSubclass, FormSubclass], {
        
        DRAFT_TYPE: "project",
        project_Type: "",

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
            this.project_Type = this.projectType;
            this.inherited(arguments);
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
        }

    });
    
});
