define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on"
], function (declare, lang, on) {

    return declare(null,

        /**
         * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
         *
         * S'ha deixat com un fitxer independent per facilitar la seva edició i no pot comptarse amb que sigui accesible
         * en el futur.
         *
         * Aquesta classe s'espera que es mescli amb un DocumentContentTool per afegir-li les funcions de edició de documents
         * amb un ACE-Editor.
         *
         * @class EditorSubclass
         * @extends DocumentSubclass, AbstractChangesManagerCentral
         * @author Xavier García <xaviergaro.dev@gmail.com>
         * @private
         * @see contentToolFactory.generate()
         */
        {
            /**
             * El contingut original inicial s'ha de passar a travès del constructor dins dels arguments com la
             * propietat originalContent.
             *
             * @param args
             */
            constructor: function (args) {
                this._setOriginalContent(args.originalContent);
            },

            /**
             * Retorna cert si el contingut actual i el contingut original son iguals o fals si no ho son.
             *
             * @returns {boolean} - Retorna true si el contingut ha canviat o false en cas contrari
             */
            isContentChanged: function () {
                var content = this.getCurrentContent(),
                    result = !(this._getOriginalContent() == content);

                if (result) {
                    this.onDocumentChanged();
                }

                return result;
            },

            /**
             * Reinicialitza l'estat del document establint el valor del contingut original igual al del contingut
             * actual.
             */
            resetContentChangeState: function () {
                this._setOriginalContent(this.getCurrentContent());
                this.onDocumentChangesReset();
            },

            /**
             * Es registra als esdeveniments i activa la detecció de canvis, copiar, enganxar i pijar tecles dins
             * del node on es troba quest ContentTool.
             *
             * Realitza l'enregistrament al ChangesManager.
             *
             * @override
             */
            postAttach: function () {

                //TODO[Xavi] Aquesta crida s'ha de fer aquí perque si no el ContentTool que es registra es l'abstracta
                this.registerToChangesManager();

                on(this.domNode, 'input', lang.hitch(this, this._checkChanges));
                //on(this.domNode, 'keyup', lang.hitch(this, this._checkChanges));
                //on(this.domNode, 'paste', lang.hitch(this, this._checkChanges));
                //on(this.domNode, 'cut', lang.hitch(this, this._checkChanges));
                //on(this.domNode, 'focusout', lang.hitch(this, this._checkChanges));


                this.inherited(arguments);
            },

            /**
             * Comunica al ChangesManager que pot haver canvis.
             *
             * @private
             */
            _checkChanges: function () {
                // Si el document està bloquejat mai hi hauran canvis
                if (!this.locked) {
                    this.changesManager.updateContentChangeState(this.id);
                }
            },

            /**
             * Retorna el que està establert com a contingut original per fer comprovacions sobre canvis.
             *
             * @returns {string} - Contingut original
             * @private
             */
            _getOriginalContent: function () {
                return this.originalContent;
            },

            /**
             * Estableix el contingut passat com paràmetre com a contingut original.
             *
             * @param {string} content - Contingut a establir com original
             * @private
             */
            _setOriginalContent: function (content) {
                this.originalContent = content;
            },

            /**
             * Retorna el text contingut al editor per la id passada com argument o la del id del document actual si
             * no s'especifica.
             *
             * @returns {string|null} - Text contingut al editor
             * o null si no existeix
             */
            getCurrentContent: function () {
                var contentCache = this.dispatcher.getContentCache(this.id),
                    content;

                try {
                    if (contentCache.isAceEditorOn()) {
                        content = contentCache.getEditor().iocAceEditor.getText();

                    } else {
                        content = contentCache.getEditor().$textArea.context.value;
                    }

                    content = '\n' + content + '\n';

                } catch (error) {
                    console.error("Error detectat: ", error);
                }

                return content;
            },


            /**
             * Al ser seleccionat aquest ContentTool estableix l'editor com a sel·leccionat.
             *
             * La primera vegada que es selecciona el content tool encara no es troba carregat al ContentCache per això
             * s'ha de fer la comprovació.
             *
             * @override
             */
            onSelect: function () {
                var contentCache = this.dispatcher.getContentCache(this.id);

                if (contentCache && contentCache.getEditor()) {
                    this.dispatcher.getContentCache(this.id).getEditor().select();
                }

                this.inherited(arguments);
            },

            /**
             * Al ser des-seleccionat aquest ContentTool es des-selecciona l'editor.
             *
             * Ens assegurem que existeix l'editor abans de des-seleccionar-lo per evitar errors.
             *
             * @override
             */
            onUnselect: function () {
                var contentCache = this.dispatcher.getContentCache(this.id);

                if (contentCache && contentCache.getEditor()) {
                    this.dispatcher.getContentCache(this.id).getEditor().unselect();
                }

                this.inherited(arguments);
            },


            /**
             * Descarta els canvis al document actual i restaura els originals
             */
            discardChanges: function () {
                // TODO: fer la substitució del contingut i comprovar que està sincronitzat amb el ACEEditor, i si no ho està comprovar si es necessari sincronitzar-lo.

                this.inherited(arguments);
            }


        });
});