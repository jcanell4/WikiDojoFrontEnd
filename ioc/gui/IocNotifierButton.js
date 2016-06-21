define([
    "dojo/_base/declare",
    "dijit/form/DropDownButton",
    "dijit/_Templated",
    "dojo/text!./templates/DropDownButton.html",
    "ioc/gui/ResizableComponent",
    "ioc/wiki30/dispatcherSingleton"

], function (declare, DropDownButton, _Templated, template, IocComponent, getDispatcher) {

    var dispatcher = getDispatcher();

    return declare("ioc.gui.IocNotifierButton", [DropDownButton, IocComponent, _Templated],

        {
            templateString: template, // TODO[Xavi] Crear un nou template, i fer servir el comptador amb aquest

            /*
             TODO: Cal passar un nom o icona que acompanyarà al comptador
             */
            constructor: function () {
                //console.log("IocDropDownButton");
                this.counter = 0;
            },

            /** @override */
            startup: function () {
                this.inherited(arguments);
                this.nodeToResize = this._buttonNode;
                this.topNodeToResize = this._buttonTopNode;
                this.resize();

                this.notifyManager = dispatcher.getNotifyManager();
                this.watch('_opened', this._onToggleButton.bind(this));

                this.notifyManager.watch('unreadCounter', this._updateLabel.bind(this));

            },

            _onToggleButton: function (property, oldValue, newValue) {
                if (newValue === false) {
                    // S'ha tancat el panell, neteixem les classes extres de les notificacions
                    this.updateContainer();
                } else {
                    // S'ha obert el panell, reiniticiem el comptador
                    this.notifyManager.resetUnreadCounter();
                }
            },

            updateContainer: function () {
                this.notifyManager.markAllAsRead();
            },

            _updateLabel: function (property, oldValue, newValue) {
                this.updateLabel(newValue);
            },

            updateLabel: function (value) {
                this.set('label', "Notificacions (" + value + ")");
            }
        });
});
