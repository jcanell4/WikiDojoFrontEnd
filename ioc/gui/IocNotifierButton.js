define([
    "dojo/_base/declare",
    "dijit/form/DropDownButton",
    "dijit/_Templated",
    "dojo/text!./templates/DropDownButton.html",
    "ioc/gui/ResizableComponent",
    "dojo/dom-class",
    "ioc/wiki30/dispatcherSingleton"

], function (declare, DropDownButton, _Templated, template, IocComponent, domClass, getDispatcher) {

    var dispatcher = getDispatcher();

    return declare("ioc.gui.IocNotifierButton", [DropDownButton, IocComponent, _Templated],

        {
            templateString: template, // TODO[Xavi] Crear un nou template, i fer servir el comptador amb aquest

            /*
             TODO: Cal passar un nom o icona que acompanyarà al comptador
             */
            constructor: function () {
                console.log("IocDropDownButton", arguments);
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
                this.notifyManager.watch('notificationsCounter', this._updateNotifyButton.bind(this));
                this.inactiveIconClass = this.get("iconClass");
                if(!this.activeIconClass){
                    this.activeIconClass = this.get("iconClass");
                }

            },

            _onToggleButton: function (property, oldValue, newValue) {
                if (newValue === false) {
                    // S'ha tancat el panell, neteixem les classes extres de les notificacions
                    this.updateContainer();
                } else {
                    // S'ha obert el panell, reiniticiem el comptador
                    this.notifyManager.resetUnreadCounter(this.mailbox);
                    if(!this.notifyManager.hasNotifications(this.mailbox)){
                        this.closeDropDown(false);
                    }
                }
            },

            updateContainer: function () {
                this.notifyManager.markAllAsRead(this.mailbox);
            },

            _updateLabel: function (property, oldValue, newValue) {
                this.updateLabel(newValue);
            },

            updateLabel: function (value) {
                this.set('label', "(" + value + ")");
                if(value==0){
                    this.set("iconClass", this.inactiveIconClass);
                    domClass.replace(this.domNode, "inactiveAlarm", "activeAlarm");
                }else{
                    this.set("iconClass", this.activeIconClass);
                    domClass.replace(this.domNode, "activeAlarm", "inactiveAlarm");
                }
            },
            
            _updateNotifyButton: function(){
                if(!this.notifyManager.hasNotifications(this.mailbox)){
                    this.closeDropDown(false);
                }
            }

            
        });
});
