define([
    "dojo/_base/declare",
    "ioc/gui/EventButton",
    "ioc/wiki30/Request"
], function (declare, EventButton, Request) {
    var ret = declare("ioc.gui.RequestEventButton", [EventButton, Request],

        /**
         * Declara un Botó que realitza la funció indicada en un atribut
         * també canvia el tamany de fixe a variable segons el contenidor
         *
         * Aquest widget es un boto que Al clicarlo recorre tots els listeners associats i els processa si son objectes
         * o els executa si son funcions.
         *
         * @class IocButton
         * @extends dijit.form.Button
         * @extends dijit._TemplatedMixin
         * @extends ResizableComponent
         */
        {
            /** @type EventObserver */
            eventId: null
        });
    return ret;
});