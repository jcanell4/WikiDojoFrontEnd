define([
    "dojo/_base/declare",
    "ioc/dokuwiki/Locktimer2",
], function (declare, Locktimer) {

    return declare([], {
        /** @abstract TODO[Xavi] Potser no fan falta, això es especific del editor múltiple */
        //isLockNeeded: function() {},
        //lockEditors: function() {},
        //unlockEditors: function() {}

        /** @abstract */
        generateDraft:function() {
            console.error("S'ha d'implementar la funció generateDraft en las subclasses per poder generar l'esborrany");
        },


        lockDocument: function () {
            if (!this.locktimer) {
                this.locktimer = new Locktimer(this.id, this.dispatcher, this);
                this.locktimer.init(true);
            } else {
                this.locktimer.stop = false;
                this.locktimer.reset();
            }


            //console.log("StructuredDocumentSubclass#lockDocument");
        },

        unlockDocument: function () {
            //console.log("StructuredDocumentSubclass#unlockDocument");
            if (this.locktimer) {
                this.locktimer.stop = true;
                this.locktimer.reset();
            }
        },

        refreshLock: function (timeout) {
            //console.log("Refreshing lock", timeout);
            this.locktimer.refreshed(timeout);
        },

        changesNotDiscarded: function() {
            this.locktimer.refreshed();
        },

        unlock: function() {
            if (this.locktimer) {
                this.locktimer.unlock();
            }

        },


        onDestroy: function () {
            //console.log("LocktimedDocumentSubclass#onDestroy");
            this.unlock();
            this.inherited(arguments);

        },

    });

});
