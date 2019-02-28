define([
    "dojo/_base/declare",
    "ioc/gui/IocContentPane", /*"dijit/layout/ContentPane",*/
    "ioc/wiki30/manager/EventObserver",
    "ioc/wiki30/manager/EventObservable",
    "dojo/dom-style",
    "dojo/dom",
    "ioc/gui/content/renderEngineFactory",
    "dojo/aspect",
    "ioc/gui/content/plugins/contentToolPluginFactory",
], function (declare, IocContentPane, EventObserver, EventObservable, domStyle, dom, renderEngineFactory, aspect,
             contentToolPluginFactory) {
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
    return declare([IocContentPane, EventObservable, EventObserver],
        {
            /** @typedef {remove: function} Handler */
            "-chains-": {
                onAttach: "after",
                render: "after"
            },

            /** @private*/
            updating: false,
            data: null,
            decorator: null,

            /** @type Dispatcher @private*/
            dispatcher: null,

            /** @type ContainerContentTool @private */
            container: null,

            /** @type string|null @private*/
            type: null,

            /** @type string[]|null @private noms dels plugins a carregar*/
            plugins: null,

            /** @type AbstractContentToolPlugin[] plugin instanciat @private*/
            _plugins: [],

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
                console.log("AbstractContentTool#onSelect", this.id);
                this.dispatchEvent(this.eventName.CONTENT_SELECTED, {id: this.id});
            },

            /**
             * Dispara l'esdeveniment que indica que el contingut ha estat des-seleccionat.
             */
            onUnselect: function () {
                console.log("AbstractContentTool#onUnselect", this.id);
                this.dispatchEvent(this.eventName.CONTENT_SELECTED, {id: this.id});
            },

            /**
             * Aquest mètode es cridat automàticament quan es realitza un canvi de mida del ContentTool.
             *
             * @param {*} args - el objecte amb els arguments pot tenir diferents hash amb informació sobre el canvi
             * sent els estandard changeSize i resultSize.
             * @see resize()
             */
            onResize: function (args) {
                //console.log("AbstractContentTool#_onResize(", args, ")");
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
                //console.log("AbstractContentTool#render", this);
                this.updating = true;
                this.set('content', this.renderEngine(this.data, this));
                this.updating = false;
            },

            /**
             * Afegeix un observador per renderitzar les dades quan aquestes canviin
             *
             * @override
             */
            startup: function () {

                if (!this.defaultRenderEngineType){
                    this.defaultRenderEngineType = this.type;
                }

                if (this.renderEngines) {
                    this.renderEngines.unshift(this.defaultRenderEngineType);
                    this.renderEngine = renderEngineFactory.getRenderEngineMacro(this.renderEngines);
                } else {
                    this.renderEngine = renderEngineFactory.getRenderEngine(this.type);
                }




                // Establim els aspectes

                aspect.after(this, "render", this.postRender);
                aspect.before(this, "render", this.preRender);

                if (this.data) {
                    this.setData(this.data);
                    this.render();
                }

                if (this.plugins !== null) {
                    this.initPlugins();
                }
            },

            initPlugins: function (){

                for (var i=0; i<this.plugins.length; i++) {
                    var pluginClass = contentToolPluginFactory.getPlugin(this.plugins[i]);
                    var plugin = new pluginClass();
                    plugin.init(this);
                    this._plugins.push(plugin); // Alerta[Xavi] Actualment no és necesari, guardem les referencies per si cal més endavant.
                }
            },


            /**
             * Afegeix un nou tipus de render engine i regenera el RenderEngine.
             * @param type
             */
            addRenderEngineType: function(type) {
                this.renderEngines.push(type);
                this.renderEngine = renderEngineFactory.getRenderEngineMacro(this.renderEngines);
            },

            setDefaultRenderEngine: function (type) {
                this.defaultRenderEngineType = type;
                this.renderEngines[0] = type; // El primer element sempre es el render engine per defecte original.
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
                if (data) {
                    this.set('data', data);
                }
                this.dispatchEvent(this.eventName.DATA_REPLACED, {id: this.id});
            },

            /**
             * Aquest mètode es crida automàticament desde las subclasses abans d'executar el onLoad() propi.
             *
             * Chained: before
             *
             * @override
             */
            onLoad: function () {
                //console.log("AbstractContentTool#onLoad");
            },

            /**
             * Dins d'aquest mètode s'ha d'afegir tot el codi que volguem assegurar-nos que s'executa quan el
             * ContentTool ha estat afegit efectivament a la pàgina. Es el lloc indicat per afegir els watchers,
             * listeners i enregistrament a esdeveniments.
             *
             * @protected
             */
            postAttach: function () {
                //console.log("AbstractContentTool#postAttach", this.id);
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
             * @param {string} idToShow - és el 'id' de la pestanya de la 'versió actual' de la pàgina (s'utilitza amb el botó Revertir)
             */
            removeContentTool: function (idToShow) {
                var parent = this.getContainer();

                if (parent.selectedChildWidget && parent.selectedChildWidget.id === this.id) {
                    if (idToShow) {
                        var i = parent.getChildIndex(idToShow);
                        var childs = parent.getChildren();
                        parent.selectChild(childs[i]);
                    }else {
                        parent.selectedChildWidget = null;
                    }
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
                //console.log("AbstractContentTool#onAttach");
                this.postAttach();
            },

            onUnload: function () {
                // console.log("AbstractContentTool#onUnload");
                if (!this.updating) {
                    this._destroyContentTool();
                }
            },

            _destroyContentTool: function () {
                // console.log("AbstractContentTool#destroyContentTool", this.id);
                this.dispatchEvent(this.eventName.DESTROY, {id: this.id});
                this.removeListenerHandlers();
                this._onDestroy();
            },
            
            _onDestroy: function(){
                if(this.onDestroy){
                    this.onDestroy();
                }
            },

            preRender: function () {
                //console.log("AbstractContentTool#preRender", this.id);
                this.removeListenerHandlers();
            },

            postRender: function () {
                //console.log("AbstractContentTool#postRender", this.id);
            },

            addListenerHandler: function (handler) {
                //console.log("AbstractContentTool#addListenerHandler", this.id, handler);
                if (Array.isArray(handler)) {
                    this._setListenerHandlers(this._getListenerHandlers().concat(handler));
                } else {
                    this._getListenerHandlers().push(handler);
                }
            },

            removeListenerHandlers: function () {
                //console.log("AbstractContentTool#removeListenerHandlers()", this.id, this._getListenerHandlers() );

                this._getListenerHandlers().forEach(function (handler) {
                    handler.remove();
                });

                this._setListenerHandlers([]);
            },

            _getListenerHandlers: function () {
                //console.log("AbstractContentTool#_getListenerHandlers()", this.listenerHandlers);
                return (this.listenerHandlers ? this.listenerHandlers : []);
            },

            _setListenerHandlers: function (listenerHandlers) {
                this.listenerHandlers = listenerHandlers;
                //console.log("AbstractContentTool#_setListenerHandlers()", listenerHandlers);
            },
            
            updateDocument: function (content) {
                this.setData(content);
                this.render();
            },


        });
});
