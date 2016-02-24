define([
    'dojo/_base/declare',
    'ioc/dokuwiki/Locktimer',
], function (declare, Locktimer) {

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

            //console.log("StructuredDocumentSubclass#lockDocument");
            //if (!this.locktimer) {
            //    this.locktimer = new Locktimer(this.id, this.dispatcher, this);
            //    this.locktimer.init(true);
            //} else {
            //    this.locktimer.stop = false;
            //    this.locktimer.reset();
            //}


            //console.log("StructuredDocumentSubclass#lockDocument");
        },

        unlockDocument: function () {
            this.dispatcher.getLockManager().unlock(this.id);
            //console.log("StructuredDocumentSubclass#unlockDocument");
            //if (this.locktimer) {
            //    this.locktimer.stop = true;
            //    this.locktimer.reset();
            //}
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
