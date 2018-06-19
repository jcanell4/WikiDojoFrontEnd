define([
    "dojo/_base/declare",
    "dojo/dom-style",
    "ioc/gui/content/AbstractContentTool"
], function (declare, domStyle, AbstractContentTool) {
    /**
     * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
     * S'ha deixat com un fitxer independent per facilitar la seva edició i no pot comptarse amb que sigui accesible
     * en el futur.
     *
     * @class ContentTool
     * @extends AbstractContentTool
     * @author Xavier García <xaviergaro.dev@gmail.com>
     * @private
     * @see contentToolFactory.generate()
     */
    return declare([AbstractContentTool],
        {
            /**
             * Dispara l'esdeveniment que indica que el ContentToool esta a punt de destruir-se
             * Previament a la seva execusió es llança la subscripció del succés anomenat "destroy".
             */
            onDestroy: function () {
                //console.log("ContentTool#onDestroy");
            },

            /**
             * Dispara l'esdeveniment que indica que el contingut ha estat seleccionat.
             */
            onSelect: function () {
                //console.log("ContentTool#onSelect");
                this.dispatchEvent(this.eventName.CONTENT_SELECTED, {id: this.id});
            },

            /**
             * Dispara l'esdeveniment que indica que el contingut ha estat des-seleccionat.
             */
            onUnselect: function () {
                //console.log("ContentTool#onUnselect");
                this.dispatchEvent(this.eventName.CONTENT_UNSELECTED, {id: this.id});
            },

            /**
             * Aquest mètode es cridat automàticament quan es realitza un canvi de mida del ContentTool.
             *
             * @param {*} args - el objecte amb els arguments pot tenir diferents hash amb informació sobre el canvi
             * sent els estandard changeSize i resultSize.
             * @see resize()
             */
            onResize: function (args) {
                if (this._toolBars && args.changeSize) {
                    // cambiamos la posición de los div's de IocContentPane
                    var posH = ((args.changeSize.h-4) < 4) ? 4 : (args.changeSize.h-4);
                    var posW = ((args.changeSize.w-36) < 0) ? 0 : (args.changeSize.w-36);    
                    for (var key in this._toolBars) {
                        switch (key) {
                            case 'topRight':
                                domStyle.set(this._toolBars[key], "left", posW+"px");
                                break;
                            case 'bottomLeft': 
                                domStyle.set(this._toolBars[key], "top", posH+"px");
                                break;
                            case 'bottomRight': 
                                domStyle.set(this._toolBars[key], "top", posH+"px");
                                domStyle.set(this._toolBars[key], "left", posW+"px");
                                break;
                        }
                    }
                }
            },

            /**
             * Aquest mètode es cridat al tancar la pestanya, per defecte retornarà true. Si volem evitar aquest
             * comportament NO HEM DE RETORNAR EL VALOR DE LA SUPERCLASSE.
             *
             * @return bool - true si volem continuar o false per evitar el tancament
             * @override
             */
            onClose: function () {
                //console.log("ContentTool#onClose");
                return this.inherited(arguments);
            },

            /**
             * Dins d'aquest mètode s'ha d'afegir tot el codi que volguem assegurar-nos que s'executa quan el
             * ContentTool ha estat afegit efectivament a la pàgina. Es el lloc indicat per afegir els watchers,
             * listeners i enregistrament a esdeveniments.
             *
             * @protected
             */
            postAttach: function () {
                // per implementar a les subclasses, aquí s'afegiran els watchers i listeners específics
                //console.log("ContentTool#postAttach", this.id);
                this.inherited(arguments);
            },

            /**
             * Aquest mètode es cridat automàticament quan s'afegeix el ContentTool a un ContainerContentTool
             *
             * @protected
             */
            onAttach: function () {
                //console.log("ContentTool#onAttach");
            }

        });
});
