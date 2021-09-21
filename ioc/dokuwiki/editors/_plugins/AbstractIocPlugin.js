define([
    'dojo/_base/declare',
    'dojo/Evented',
    'ioc/dokuwiki/editors/IdReferencer'
], function (declare, Evented, IdReferencer) {


    return declare([Evented, IdReferencer], {

        constructor: function () {
            this.handlers = [];
            this.enabled = false;
        },

        /**
         * Estableix l'editor utilitzat durant l'inicialització del plugin
         * Es necessari perquè en aquest punt el content tool pot ser que no s'hagi afegit
         * al ContentCache. Aquesta versió de l'editor correspondria a l'editor INTERN
         *
         * ALERTA! aquest editor només es fiable durant l'inicialització: handlers i botons
         * Un cop inicialitzat s'ha de cridar a getEditor() o getInnerEditor() segons el cas
         *
         * @param editor
         */
        _setEditor: function (editor) {
            this.setupEditor = editor;
            this.dispatcher = editor.dispatcher;
        },

        /**
         * Inicialització del pluguin
         */
        init: function () {
            throw new Error('Method not implemented');
        },


        process: function () {
            var editor = this.getEditor();

            switch (editor.TOOLBAR_ID) {
                case 'full-editor':
                    this._processFull();
                    break;

                case 'partial-editor':
                    this._processPartial();
                    break;

                default:
                    console.log(editor);
                    throw new Error("Tipus d'editor no reconegut: " + editor.TOOLBAR_ID);
            }
        },

        _processFull: function () {
            throw new Error('Method not implemented');
        },

        _processPartial: function () {
            this._processFull();
        },

        /**
         * Activació del plugin. Aquí es suscriuen els listeners dels events. Ha d'establir el valor de la propietat
         * enabled a true.
         */
        activate: function () {
            // console.log('AbstractPlugin#activate');
            this.enabled = true;
            // throw new Error('Method not implemented');
        },

        /**
         * Desactivació del plugin. Aquí es desuscriuen els listeners dels events. Ha d'establir el valor de la
         * propietat enabled a false.
         */
        deactivate: function () {
            // console.log('AbstractPlugin#deactivate');
            this.enabled = false;
            // throw new Error('Method not implemented');
            this.removeEditorListeners();
        },

        /**
         * Alterna entra la activació o desactivació.
         */
        toggle: function () {
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
        destroy: function () {
            this.deactivate();
            // throw new Error('Method not implemented');
        },

        /**
         * Afegeix la detecció d'events disparats per l'editor.
         *
         * @param {string} events - un o més events separats per comes, per exemple:  'change, click'
         * @param {Function} callback - funció a cridar quan es dispari l'event a l'editor
         *
         * @return handler - handler corresponent al listener afegit per permetre la seva eliminació individual
         */
        addEditorListener: function (events, callback) {
            var handler = this.setupEditor.on(events, callback);
            this.handlers.push(handler);
            return handler;
        },

        /**
         * Elimina la detecció de tots els events a l'editor.
         */
        removeEditorListeners: function () {
            // console.log("AbstractPlugin#removeEditorListeners");
            for (var i = 0; i < this.handlers.length; i++) {
                this.handlers[i].remove();
            }
        },


    });

});