/**
 * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
 *
 * S'ha deixat com un fitxer independent per facilitar la seva edició i no pot comptarse amb que sigui accesible
 * en el futur.
 *
 * Aquesta classe s'espera que es mescli amb un DocumentContentTool que incorpori un AbstractChangesManagerDecoration
 * per afegir-li les funcionalitats comunes dels documents editables de la pestanya central que son:
 *
 *      - Canviar el color de la pestanya a vermell quan hi han canvis
 *      - Canviar el color de la pestanya a negre quan els canvis es restableixin
 *      - Disparar els esdeveniment document_changed i document_changes_reset quan calgui
 *      - Demanar confirmació abans de tancar si s'han realitzat canvis
 *
 * Les crides a aquests mètodes es faran desde la clase decorada.
 *
 * @class EditorContentToolDecoration
 * @extends DocumentContentTool, AbstractChangesManagerDecoration
 * @author Xavier García <xaviergaro.dev@gmail.com>
 * @private
 * @abstract
 * @see contentToolFactory.decorate()
 */
define([
    "dojo/_base/declare"
], function (declare) {

    return declare(null, {

        /**
         * Accio a realitzar quan hi han canvis al document.
         *
         * @protected
         */
        onDocumentChanged: function () {
            this.dispatchEvent("document_changed");

            if (this.controlButton) {
                this.controlButton.containerNode.style.color = 'red';
            }
        },

        /**
         * Acció a realitzar quan es reinicialitza el document.
         *
         * @protected
         */
        onDocumentChangesReset: function () {
            this.dispatchEvent("document_changes_reset");

            if (this.controlButton) {
                this.controlButton.containerNode.style.color = 'black';
            }
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
        }
    });
});
