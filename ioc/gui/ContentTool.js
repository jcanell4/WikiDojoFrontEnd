define([
    "dojo/_base/declare",
    "dijit/layout/ContentPane",
    "ioc/wiki30/manager/EventObserver",
    "dojo/dom-style"

], function (declare, ContentPane, EventObserver, domStyle) {

    return declare([ContentPane, EventObserver],
        /**
         * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
         *
         * @class ContentTool
         * @extends ContentPane, EventObserver
         * @author Xavier García <xaviergaro.dev@gmail.com>
         * @protected
         * @see contentToolFactory
         */
        {
            "-chains-": {
                onLoad:   "before",
                onUnload: "before"
            },

            dispatcher: null,

            data: null,

            decorator: null,


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
                console.log("Constructor amb args: ", args);
                this.data = null;
                this.dispatcher = null;

                this.data = args.data ? args.data : args.content;

                declare.safeMixin(this, args);

            },

            /**
             * @private
             */
            onShow: function () {
                this.onSelect();
            },

            /**
             * @private
             */
            onHide: function () {
                this.onUnselect();
            },


            onSelect: function () { // onShow()
                this.triggerEvent("content_selected", {id: this.id});
            },

            onUnselect: function () { // onHide()
                this.triggerEvent("content_unselected", {id: this.id});
            },

            onResize: function () {

            },

            getId: function () { // get('id')
                return this.get('id');
            },

            /** @override */
            startup: function () {

                this.watch('data', function (name, oldValue, value) {
                    this.set('content', value);
                });

                if (this.data) {
                    this.set('content', this.data);

                }
            },

            /** @override */
            onClose: function () {

            },

            setData: function (data) {
                this.set('data', data);
            },

            /**
             * Chained before
             */
            onLoad: function () {
                // aquì s'han d'afegir els watchers i listeners comuns
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
                this.inherited(arguments);
            },


            hideContent: function () {
                domStyle.set(this.domNode.id + "_wrapper", {display: "none"});
                this.getContainer().resize();
            },

            showContent: function () {
                domStyle.set(this.domNode.id + "_wrapper", {display: ""});
                this.getContainer().resize();
            },

            /**
             * Chained before
             */
            onUnload: function () {
                this.unregisterFromEvents();
            },


            getContainer: function () {
                return this.getParent().getParent();
            },

            removeContentTool: function () {
                var parent = this.getContainer();

                if (parent.selectedChildWidget && parent.selectedChildWidget.id == this.id) {
                    parent.selectedChildWidget = null;
                }

                parent.removeChild(this);
                this.destroyRecursive();
            },


            decorate: function (type) {

                if (this.decorator) {
                    return this.decorator.decorate(type, this);
                } else {
                    console.error("Decorador no incorporat");
                }

            }

        });
});