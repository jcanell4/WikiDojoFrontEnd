define([
    'dojo/_base/declare',
    'dijit/layout/ContentPane',
    'ioc/wiki30/manager/EventObserver'

], function (declare, ContentPane, EventObserver) {

    return declare([ContentPane, EventObserver], {

        ///** @type {int[]} indentificador propi dels events als que està subscrit */
        //registeredToEvents: [],

        //constructor: function (args) {

            /*
            if (!args.dispatcher) {
                console.error("S'ha depassar una referencia al dispatcher");
                throw new Error("S'ha depassar una referencia al dispatcher");
            }

            declare.safeMixin(this, args);

            this.eventManager = args.dispatcher.getEventManager();

            this.registeredToEvents = [];
            */
        //},

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
                console.log('data changed');
                this.set('content', value);
            });

            if (this.data) {
                this.set('content', value);
            }

        },

        /** @override */
        onClose: function () {

        },

        setData: function (data) {
            this.set('data', data);
        }

        ///**
        // * Es registra al esdeveniment i respón amb la funció passada com argument quan es escoltat.
        // *
        // * Es guarda la referencia obtinguda al registrar-lo per poder desenregistrar-se quan sigui
        // * necessari.
        // *
        // * @param {string} event - nom del esdeveniment
        // * @param {function} callback - funció a executar
        // */
        //registerToEvent: function (event, callback) {
        //    this.registeredToEvents.push(this.eventManager.registerToEvent(event, callback));
        //},
        //
        ///**
        // * Recorre la lista de esdeveniments al que està subscrit i es desenregistra de tots.
        // */
        //unregisterFromEvents: function () {
        //    for (var i = 0, len = this.registeredToEvents.length; i < len; i++) {
        //        this.eventManager.removeObserver(this.registeredToEvents[i]);
        //    }
        //
        //    this.registeredToEvents = [];
        //}
    });

});