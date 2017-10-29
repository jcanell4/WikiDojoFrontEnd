define([
    'dojo/_base/declare',
    'dojo/Evented'
], function (declare, Evented) {


    return declare(Evented, {

        constructor: function() {
            this.handlers = [];
            this.enabled = false;
        },

        /**
         * Estableix l'editor sobre el que actuarà el pluguin.
         *
         * @param editor
         */
        setEditor: function (editor) {
            this.editor = editor;
        },

        /**
         * Inicialització del pluguin
         */
        init: function () {
            throw new Error('Method not implemented');
        },

        /**
         * Activació del plugin. Aquí es suscriuen els listeners dels events. Ha d'establir el valor de la propietat
         * enabled a true.
         */
        activate: function() {
            // console.log('AbstractPlugin#activate');
            this.enabled = true;
            // throw new Error('Method not implemented');
        },

        /**
         * Desactivació del plugin. Aquí es desuscriuen els listeners dels events. Ha d'establir el valor de la
         * propietat enabled a false.
         */
        deactivate: function() {
            // console.log('AbstractPlugin#deactivate');
            this.enabled = false;
            // throw new Error('Method not implemented');
            this.removeEditorListeners();
        },

        /**
         * Alterna entra la activació o desactivació.
         */
        toggle: function() {
            // console.log("AbstractPlugin#toggle", this.enabled);
            if (this.enabled) {
                this.deactivate();
            } else {
                this.activate();
            }
        },

        /**
         * Accions
         */
        destroy: function() {
            this.deactivate();
            // throw new Error('Method not implemented');
        },

        /**
         * Afegeix la detecció d'events disparats per l'editor.
         *
         * @param {string} events - un o més events separats per comes, per exemple:  'change, click'
         * @param {Function} callback - funció a cridar quan es dispari l'event a l'editor
         */
        addEditorListener: function (events, callback) {
            this.handlers.push (this.editor.on(events, callback));
        },

        /**
         * Elimina la detecció de tots els events a l'editor.
         */
        removeEditorListeners: function() {
            // console.log("AbstractPlugin#removeEditorListeners");
            for (var i=0; i<this.handlers.length; i++) {
                this.handlers[i].remove();
            }
        }

    });

});