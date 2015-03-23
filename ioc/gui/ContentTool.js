define([
    'dojo/_base/declare',
    'dijit/layout/ContentPane',
    'ioc/wiki30/manager/EventObserver',
    "dojo/dom-style",

], function (declare, ContentPane, EventObserver, domStyle) {

    return declare([ContentPane, EventObserver],
        /**
         * @class ContentTool
         * @extends ContentPane, EventObserver
         * @author Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            "-chains-": {
                onLoad: "before"
            },

            dispatcher: null,
            data:       null,


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

                this.data = args.data ? args.data : args.content;

                declare.safeMixin(this, args);
            },

            /**
             * @private
             */
            onShow:function () {
                this.onSelect();
            },

            /**
             * @private
             */
            onHide:function () {
                this.onUnselect();
            },


            onSelect: function () { // onShow()
                this.triggerEvent("document_selected (from ContentTool)", {id: this.id});
            },

            onUnselect: function () { // onHide()
                this.triggerEvent("document_Unselected (from ContentTool)", {id: this.id});
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
             * Chained after
             */
            onLoad: function () {
                //TODO[Xavi] aquì s'han d'afegir els watchers i listeners comuns
                console.log("Load ContentTool");
                this.postLoad();
            },

            /**
             * Dins d'aquest mètode s'ha d'afegir tot el codi que volguem assegurar-nos que s'executa quan el
             * ContentTool ha estat afegit efectivament a la pàgina. Es el lloc indicat per afegir els watchers,
             * listeners i enregistrament a esdeveniments.
             */
            postLoad: function () {
                // per implementar a les subclasses, aquí s'afegiran els watchers i listeners específics
                //
                alert("postload de ContentTool");
                console.log("postLoad ContentTool");
            },


            hideContent: function() {
                console.log("hide this: ", this.id);
                domStyle.set(this.domNode.id + "_wrapper", {display: "none"});

            },

            showContent: function() {
                console.log("show this: ", this.id);
                domStyle.set(this.domNode.id + "_wrapper", {display: ""});
                console.log("mostrat");
            },

            onUnload: function () {
                this.unregisterFromEvents();
                console.log("onUnload del ContentTool");
            }

        });
});