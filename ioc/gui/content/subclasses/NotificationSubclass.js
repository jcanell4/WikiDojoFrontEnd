define([
    'dojo/_base/declare',
    "dojo/dom-class"
], function (declare, domClass) {

    return declare(null, {

        postAttach: function () {
            this._addCloseButtonListener();
            this.inherited(arguments);
            if (!this.readed) {
                this.markAsUnread();
            }

        },

        _addCloseButtonListener: function () {
            var $closeButton = jQuery('#' + this.id + '_close_button');

            $closeButton.on('click', function () {
                this.removeContentTool();
            }.bind(this));

        },

        markAsRead: function () {
            //console.log("NotificationSubclass#markAsRead", this.domNode);
            domClass.remove(this.domNode, 'unreaded');
            this.readed = true;
        },

        markAsUnread: function () {
            //console.log("NotificationSubclass#markAsUnread", this.domNode);
            domClass.add(this.domNode, 'unreaded');
            this.readed = false;
        },

        isReaded: function () {
            console.log("NotificationSubclass#isReaded", this.readed);
            return this.readed;
        }

    });

});
