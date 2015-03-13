define([
    'dojo/_base/declare',
    'dijit/layout/ContentPane'

], function (declare, ContentPane) {

    return declare([ContentPane], {


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

        },

        /** @override */
        onClose: function () {

        },

        setData: function (data) {
        },

        registerToEvent: function (event, callback) {

        },

        unregisterFromEvents: function (events) {

        }

    });

});