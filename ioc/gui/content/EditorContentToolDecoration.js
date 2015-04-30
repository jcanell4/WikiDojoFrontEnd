/**
 * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
 *
 * S'ha deixat com un fitxer independent per facilitar la seva edició i no pot comptarse amb que sigui accesible
 * en el futur.
 *
 * Aquesta classe s'espera que es mescli amb un DocumentContentTool per afegir-li les funcions de edició de documents
 * amb un ACE-Editor.
 *
 * @class EditorContentToolDecoration
 * @extends EditorContentTool
 * @author Xavier García <xaviergaro.dev@gmail.com>
 * @private
 * @see contentToolFactory.decorate()
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "ioc/gui/content/AbstractChangesManagerDecoration"
], function (declare, lang, on, AbstractChangesManagerDecoration) {

    return declare([AbstractChangesManagerDecoration],

        /**
         * Aquesta classe es una decoració i requereix que es faci un mixin amb un ContentTool per poder funcionar.
         *
         * Aquesta decoració modifica el ContentTool per fer la comprovació de canvis abans de tancar-se i canviar
         * el color de la pestanya a vermell si es produeixen canvis.
         *
         * Aquesta decoració s'ha d'aplicar a un DocumentContentTool o que afegeixi un métode closeDocument() per poder
         * realitzar la comprovació de canvis abans de tancar-se.
         *
         * @class EditorContentTool
         * @extends DocumentContentTool
         * @private
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
                var content = this._getCurrentContent(),
                    result = !(this._getOriginalContent() == content);

                if (result) {
                    this.dispatchEvent("document_changed", {id: this.id});
                }

                return result;
            },

            /**
             * Reinicialitza l'estat del document establint el valor del contingut original igual al del contingut
             * actual.
             */
            resetContentChangeState: function () {
                this._setOriginalContent(this._getCurrentContent());
                this.dispatchEvent("document_changes_reset", {id: this.id});
            },

            /**
             * Acció a realitzar quan es tanca el document. Si detecta canvis demana confirmació i en cas de que no hi hagin
             * o es descartin el canvis retorna cert i es procedeix al tancament del document.
             *
             * @returns {boolean}
             */
            onClose: function () {
                var confirmation = true;

                if (this.changesManager.isChanged(this.id)) {
                    confirmation = this.dispatcher.discardChanges();
                }

                if (confirmation) {
                    this.closeDocument();
                    this.changesManager.removeContentTool(this.id);
                }

                return confirmation;
            },

            /**
             * Es registra als esdeveniments i activa la detecció de canvis, copiar, enganxar i pijar tecles dins
             * del node on es troba quest ContentTool.
             *
             * Realitza l'enregistrament al ChangesManager.
             *
             * @override
             */
            postLoad: function () {
                //TODO[Xavi] Aquesta crida s'ha de fer aquí perque si no el ContentTool que es registra es l'abstracta
                this.registerToChangesManager();

                this.registerToEvent(this, "document_changed", lang.hitch(this, this._onDocumentChanged));
                this.registerToEvent(this, "document_changes_reset", lang.hitch(this, this._onDocumentChangesReset));

                on(this.domNode, 'keyup', lang.hitch(this, this._checkChanges));
                on(this.domNode, 'paste', lang.hitch(this, this._checkChanges));
                on(this.domNode, 'cut', lang.hitch(this, this._checkChanges));
                on(this.domNode, 'focusout', lang.hitch(this, this._checkChanges));

                this.inherited(arguments);
            },

            /**
             * Comunica al ChangesManager que pot haver canvis.
             *
             * @private
             */
            _checkChanges: function () {
                this.changesManager.updateContentChangeState(this.id);
            },

            /**
             * Accio a realitzar quan hi han canvis al document.
             *
             * @private
             */
            _onDocumentChanged: function () {
                if (this.controlButton) {
                    this.controlButton.containerNode.style.color = 'red';
                }
            },

            /**
             * Acció a realitzar quan es reinicialitza el document.
             *
             * @private
             */
            _onDocumentChangesReset: function () {
                if (this.controlButton) {
                    this.controlButton.containerNode.style.color = 'black';
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
             * TODO[Xavi] Això es propi només del EditorContentTool, no es global
             *
             * @param {string?} id - id del document del que volem recuperar el contingut
             * @returns {string|null} - Text contingut al editor
             * o null si no existeix
             * @private
             */
            _getCurrentContent: function () {
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
             * Retorna la id del document actual.
             *
             * TODO[Xavi] Deixar com a helper method? Afegir-lo a un decorador? <-- Es necessari, cridat per altres
             * @returns {string} - Id del document actual
             * @private
             */
            _getCurrentId: function () {
                return this.dispatcher.getGlobalState().getCurrentId();
            }
        })
});