define([
    'dojo/_base/declare',
    'ioc/wiki30/Draft',
], function (declare, Draft) {

    var LocktimedDocumentSubclassException = function (message) {
        this.message = message;
        this.name = "LocktimedDocumentSubclassException"
    };

    return declare([], {

        constructor: function (args) {
            this.draftManager = args.dispatcher.getDraftManager();
        },

        /** @abstract */
        _generateDraft: function () { // TODO[Xavi] això anirà en el nou sistema pels drafts
            throw new LocktimedDocumentSubclassException("El ContentTool ha d'implementar la funció generateDraft a " +
                "les subclasses per poder generar l'esborrany");
        },

        lockDocument: function () {
//            console.log("LocktimedDocumentSubclass#lockDocument", this.id);

            if (this.getReadOnly()) { // Si el document es de només lectura no s'ha de bloquejar
                return;
            }

            //this.dispatcher.getLockManager().lock(this.id, this.ns);

            // TODO[Xavi] pendent de determinar si fem servir una subclasse diferent pels Draft
            this.getDraft();

        },

        unlockDocument: function () {
            //ALERTA[Xavi] Provem d'alliberar el bloqueig
            this.dispatcher.getGlobalState().freePage(this.id, this.ns);

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
            this.draftManager.getDraft(this.id, this).destroy();
            this.inherited(arguments);
        },

        getDraft: function () {
            //console.log("LocktimedDocumentSubclass#getDraft", this.id);
            var draft = this.draftManager.getDraft(this.id, this);
            //console.log("Draft:", draft);
            return draft;

        },

        getDraftChunk: function (chunkId) {
            //console.log("LocktimedDocumentSubclass#getDraftChunk", this.id, chunkId);
            return this.getDraft().recoverLocalDraft().structured[chunkId].content;
        },

        getReadOnly: function () {
            return this.get("readonly") || this.get("locked");
        }
    });
});
