define([
    "dojo/_base/declare",
    "ioc/gui/content/AbstractContentTool"
], function (declare, AbstractContentTool) {

    return declare([AbstractContentTool],

        /**
         * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
         *
         * S'ha deixat com un fitxer independent per facilitar la seva edició i no pot comptarse amb que sigui accesible
         * en el futur.
         *
         * @class ContentTool
         * @extends AbstractContentTool
         * @author Xavier García <xaviergaro.dev@gmail.com>
         * @private
         * @see contentToolFactory.generate()
         */
        {
            /**
             * Dispara l'esdeveniment que indica que el contingut ha estat seleccionat.
             */
            onSelect: function () {
                this.triggerEvent("content_selected", {id: this.id});
            },

            /**
             * Dispara l'esdeveniment que indica que el contingut ha estat des-seleccionat.
             */
            onUnselect: function () {
                this.triggerEvent("content_unselected", {id: this.id});
            },

            /**
             * Aquest mètode es cridat automàticament quan es realitza un canvi de mida del ContentTool.
             *
             * @param {*} args - el objecte amb els arguments pot tenir diferents hash amb informació sobre el canvi
             * sent els estandard changeSize i resultSize.
             * @see resize()
             */
            onResize: function (args) {
                this.inherited(arguments);
            },

            /**
             * Aquest mètode es cridat al tancar la pestanya, per defecte retornarà true. Si volem evitar aquest
             * comportament NO HEM DE RETORNAR EL VALOR DE LA SUPERCLASSE.
             *
             * @return bool - true si volem continuar o false per evitar el tancament
             * @override
             */
            onClose: function () {
                return this.inherited(arguments);
            },
            
            /**
             * Dins d'aquest mètode s'ha d'afegir tot el codi que volguem assegurar-nos que s'executa quan el
             * ContentTool ha estat afegit efectivament a la pàgina. Es el lloc indicat per afegir els watchers,
             * listeners i enregistrament a esdeveniments.
             *
             * @protected
             */
            postLoad: function () {
                // per implementar a les subclasses, aquí s'afegiran els watchers i listeners específics
                this.inherited(arguments);
            }

        });
});