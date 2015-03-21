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

            onSelect: function () { // onShow()

            },

            onUnselect: function () { // onHide()

            },

            onResize: function () {

            },

            getId: function () { // get('id')

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

            postLoad: function () {
                // per implementar a les subclasses, aquí s'afegiran els watchers i listeners específics
                //
                console.log("postLoad ContentTool");
            },


            hideContent: function() {
                domStyle.set(this.domNode.id + "_wrapper", {display: "none"});

            },

            showContent: function() {

                domStyle.set(this.domNode.id + "_wrapper", {display: ""});

            }

        });
});