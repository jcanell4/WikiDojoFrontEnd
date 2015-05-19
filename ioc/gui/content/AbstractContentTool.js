define([
    "dojo/_base/declare",
    "dijit/layout/ContentPane",
    "ioc/wiki30/manager/EventObserver",
    "dojo/dom-style",
    "dojo/dom",
    "ioc/gui/content/renderEngineFactory"
], function (declare, ContentPane, EventObserver, domStyle, dom, renderEngineFactory) {

    return declare([ContentPane, EventObserver],

        /**
         * Aquesta classe no s'ha de instanciar, es fa servir com a base per afegir tota la funcionalitat bàsica del
         * ContentTool que no ha de ser modificada.
         *
         * S'ha deixat com un fitxer independent per facilitar la seva edició i no pot comptarse amb que sigui accesible
         * en el futur.
         *
         * @class AbstractContentTool
         * @extends ContentPane, EventObserver
         * @author Xavier García <xaviergaro.dev@gmail.com>
         * @private
         * @abstract
         * @see contentToolFactory.generate()
         */
        {
            "-chains-": {
                onLoad: "after"
            },

            /** @private*/
            data: null,

            /** @private */
            decorator: null,

            /** @type Dispatcher @private*/
            dispatcher: null,

            /** @type ContainerContentTool @private */
            container: null,

            /** @type string @private*/
            type: null,

            /**
             * Aquest component treballa amb la propietat data a la que dona format segons la implementació de les
             * subclasses per aquesta raó en cas de que es trobi la propietat data com argument es farà servir aquesta,
             * i en cas de no trobar-la s'agafarà el valor de content.
             *
             * Si no s'ha passat cap valor per data ni per content el valor d'inici de la propietat data serà undefined.
             *
             * @param args
             */
            constructor: function (args) {
                this.data = null;
                this.dispatcher = null;
                this.decorator = null;
                this.type = null;

                this.data = args.data ? args.data : args.content;

                declare.safeMixin(this, args);
            },

            /**
             * Acció portada a terme quan l'element es seleccionat. Aquest mètode es cridat automàticament, l'he afegit
             * per centralitzar tota la funcionalitat al mateix lloc.
             *
             * @private
             * @override
             * @see onSelect()
             */
            onShow: function () {
                this.onSelect();
            },

            /**
             * Acció portada a terme quan l'element es des-seleccionat. Aquest mètode es cridat automàticament, l'he
             * afegit per centralitzar tota la funcionalitat al mateix lloc.
             *
             * @private
             * @override
             * @see onUnselect()
             */
            onHide: function () {
                this.onUnselect();
            },


            /**
             * Dispara l'esdeveniment que indica que el contingut ha estat seleccionat.
             */
            onSelect: function () {
                this.dispatchEvent("content_selected", {id: this.id});
            },

            /**
             * Dispara l'esdeveniment que indica que el contingut ha estat des-seleccionat.
             */
            onUnselect: function () {
                this.dispatchEvent("content_unselected", {id: this.id});
            },

            /**
             * Aquest mètode es cridat automàticament quan es realitza un canvi de mida del ContentTool.
             *
             * @param {*} args - el objecte amb els arguments pot tenir diferents hash amb informació sobre el canvi
             * sent els estandard changeSize i resultSize.
             * @see resize()
             */
            onResize: function (args) {
                // Per defecte no fa res especial
                // console.log("Resizing:", args);
            },

            /**
             * Aquest mètode es cridat automàticament quan s'afegeix el ContentTool al ContainerContentTool i quan
             * canvia la mida del ContainerContentTool.
             *
             * @param {*?} changeSize - Dades sobre la nova mida. El format varia segons el contenidor. Pot ser undefined.
             * @param {*?} resultSize - TODO[Xavi] A les proves sempre es undefined i no hi ha informació a la API
             * @override
             */
            resize: function (changeSize, resultSize) {
                this.inherited(arguments);

                this.onResize(
                    {
                        changeSize: changeSize,
                        resultSize: resultSize
                    });
            },

            /**
             * Retorna la id d'aquest ContentTool
             *
             * @returns {string}
             */
            getId: function () {
                return this.get('id');
            },


            /**
             * Processa les dades a través del motor de render i les afegeix al contingut amb el format obtingut.
             *
             * @protected
             */
            render: function () {
                this.set('content', this.renderEngine(this.data));
            },

            /**
             * Afegeix un observador per renderitzar les dades quan aquestes canviin
             *
             * @override
             */
            startup: function () {

                this.renderEngine = renderEngineFactory.getRenderEngine(this.type);

                this.watch("data", function () {
                    this.render();
                });

                if (this.data) {
                    this.render();
                }
            },

            /**
             * Aquest mètode es cridat al tancar la pestanya
             *
             * @return bool - true si volem continuar o false per evitar el tancament
             * @override
             */
            onClose: function () {
                return true;
            },

            /**
             * Estableix les dades del ContentTool
             *
             * @param {*} data - Dades per establir, amb un format diferent segons el tipus de ContentTool o decoració
             * aplicada.
             */
            setData: function (data) {
                this.set('data', data);
            },

            /**
             * Aquest mètode es crida automàticament desde las subclasses abans d'executar el onLoad() propi.
             *
             * Chained: before
             *
             * @override
             */
            onLoad: function () {
                // TODO[Xavi] Aquì s'han d'afegir els watchers i listeners comuns
                this.postLoad();
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
            },


            /**
             * Amaga el contingut del ContentTool
             */
            hideContent: function () {
                if (dom.byId(this.domNode.id)) {
                    domStyle.set(this.domNode.id + "_wrapper", {display: "none"});
                    this.getContainer().resize();
                }
            },

            /**
             * Mostra el contingut del ContentTool
             */
            showContent: function () {
                if (dom.byId(this.domNode.id)) {
                    domStyle.set(this.domNode.id + "_wrapper", {display: ""});
                    this.getContainer().resize();
                }
            },

            /**
             * Retorna el contenidor al que estan afegits o undefined si no ha estat afegit a cap contenidor.
             *
             * @returns {ContainerContentTool|null} - Contenidor al que estan afegits o undefined si no s'ha afegit a cap
             */
            getContainer: function () {
                return this.container;
            },

            /**
             * Estableix el contenidor al que s'ha afegit aquest ContentTool. Cridat automàticament per
             * ContainerContentTool.
             *
             * @param {ContainerContentTool} container - Contenidor al que s'ha afegit
             * @see ContainerContentTool.addChild()
             */
            setContainer: function (container) {
                this.container = container;
                this.onAttach();
            },

            /**
             * Elimina aquest ContentTool del ContainerContentTool en el que es trobi i es destrueix junt amb tots els
             * elements que el composin.
             */
            removeContentTool: function () {
                var parent = this.getContainer();

                if (parent.selectedChildWidget && parent.selectedChildWidget.id == this.id) {
                    parent.selectedChildWidget = null;
                }

                parent.removeChild(this);
                this.destroyRecursive();
            },

            /**
             * Decora aquest ContentTool amb la decoració passada com argument i amb els valors passats com arguments.
             *
             * @param {string} type - tipus de decoració
             * @param {*} args - arguments necesaris per passar al decorador
             * @returns {ContainerContentTool}
             */
            decorate: function (type, args) {

                if (this.decorator) {
                    return this.decorator.decorate(type, this, args);
                } else {
                    console.error("Decorador no incorporat");
                }
            },


            /**
             * Estableix el tipus de ContentTool que estem tractant.
             *
             * @param {string} type - referencia que volem donar al ContentTool
             */
            setType: function (type) {
                this.type = type;
            },

            /**
             * Retorna el tipus que s'ha establert per aquest ContentTool o null si no s'ha establert cap.
             *
             * @returns {string|null}
             */
            getType: function () {
                return this.type;
            },

            /**
             * Aquest mètode es cridat automàticament quan s'afegeix el ContentTool a un ContainerContentTool.
             *
             * @abstract
             * @protected
             */
            onAttach: function () {

            }
        });
});