define([
    'dojo/_base/declare',
    'dijit/layout/ContentPane',
    'ioc/wiki30/manager/EventObserver'

], function (declare, ContentPane, EventObserver) {

    return declare([ContentPane, EventObserver],
        /**
         * @class ContentTool
         * @extends ContentPane, EventObserver
         * @author Xavier García <xaviergaro.dev@gmail.com>
         */
        {

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
                this.inherited(arguments);

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
            
        });
});