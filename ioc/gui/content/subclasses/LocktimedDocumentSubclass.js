define([
    'dojo/_base/declare',
    'ioc/wiki30/Draft',
], function (declare, Draft) {

    var LocktimedDocumentSubclassException = function (message) {
        this.message = message;
        this.name = "LocktimedDocumentSubclassException"
    };

    return declare([], {

        /** @abstract */
        generateDraft: function () { // TODO[Xavi] això anirà en el nou sistema pels drafts
            throw new LocktimedDocumentSubclassException("El ContentTool ha d'implementar la funció generateDraft a " +
                "les subclasses per poder generar l'esborrany");
        },

        lockDocument: function () {
            if (this.readonly) { // Si el document es de només lectura no s'ha de bloqudrejar
                return;
            }
            this.dispatcher.getLockManager().lock(this.id, this.ns);

            // TODO[Xavi] pendent de determinar si fem servir una subclasse diferent pels Draft
            this.getDraft();

        },

        unlockDocument: function () {
            if (this.readonly) { // Si el document es de només lectura no pot ser bloquejat
                return;
            }

            this.dispatcher.getLockManager().unlock(this.id);

            // TODO[Xavi] pendent de determinar si fem servir una subclasse diferent pels Draft
            if (this.draft) {
                this.draft.destroy();
                this.draft = null;
            }
        },

        onDestroy: function () {
            //console.log("LocktimedDocumentSubclass#onDestroy");
            this.dispatcher.getLockManager().unlock(this.id);
            this.inherited(arguments);
        },

        getDraft: function() {
            if (!this.draft) {
                this.draft = new Draft(this.dispatcher, this);
            }

            return this.draft;
        }

    });

});
