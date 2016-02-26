define([
    'dojo/_base/declare',
    'ioc/wiki30/Draft',
], function (declare, Draft) {

    return declare([], {
        /** @abstract TODO[Xavi] Potser no fan falta, això es especific del editor múltiple */
        //isLockNeeded: function() {},
        //lockEditors: function() {},
        //unlockEditors: function() {}


        /** @abstract */
        generateDraft:function() { // TODO[Xavi] això anirà en el nou sistema pels drafts
            console.error("S'ha d'implementar la funció generateDraft en las subclasses per poder generar l'esborrany");
        },



        lockDocument: function () {
            this.dispatcher.getLockManager().lock(this.id, this.ns);

            // TODO[Xavi] pendent de determinar si fem servir una subclasse diferent pels Draft
            if (!this.draft) {
                this.draft = new Draft(this.dispatcher, this);
            }

        },

        unlockDocument: function () {
            this.dispatcher.getLockManager().unlock(this.id);

            // TODO[Xavi] pendent de determinar si fem servir una subclasse diferent pels Draft
            if (this.draft) {
                this.draft.destroy();
                this.draft = null;
            }
        },

        // Alerta [Xavi] No es fa servir
        refreshLock: function (timeout) {
            //console.log("LocktimedDocumentSbuclass#refreshLock", timeout);
            //this.locktimer.refreshed(timeout);
        },

        changesNotDiscarded: function() {
            //this.locktimer.refreshed();
        },

        unlock: function() {
            //if (this.locktimer) {
            //    this.locktimer.unlock();
            //}

        },


        onDestroy: function () {
            // TOOD[Xavi] Aquest métode fa servir el nou sistema
            console.log("LocktimedDocumentSubclass#onDestroy");
            this.dispatcher.getLockManager().unlock(this.id);
            this.inherited(arguments);
        }

    });

});
