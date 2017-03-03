define([
    'dojo/_base/declare',
    "dojo/dom-class"
], function (declare, domClass) {

    return declare(null, {

        postAttach: function () {
            this._addCloseButtonListener();
            this.inherited(arguments);
            if (!this.read) {
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
            domClass.remove(this.domNode, 'unread');
            this.read = true;
        },

        markAsUnread: function () {
            //console.log("NotificationSubclass#markAsUnread", this.domNode);
            domClass.add(this.domNode, 'unread');
            this.read = false;
        },

        isRead: function () {
            console.log("NotificationSubclass#isRead", this.read);
            return this.read;
        },

        show: function() {
            this.domNode.setAttribute('style', 'display:inherit');
        },

        hide: function() {
            this.domNode.setAttribute('style', 'display:none');
        }

    });

});
