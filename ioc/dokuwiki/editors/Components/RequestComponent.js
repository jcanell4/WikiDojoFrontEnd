define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/Components/AbstractIocComponent'
], function (declare, AbstractIocComponent) {


    return declare(AbstractIocComponent, {

        constructor: function (dispatcher) {
            this.dispatcher = dispatcher;
        },

        _getRequester: function () {
            var id = this.dispatcher.getGlobalState().getCurrentId(),
                contentTool = this.dispatcher.getContentCache(id).getMainContentTool();

            return contentTool.requester;
        },

        send: function (urlBase, dataToSend) {
            var context = this,
                requester = this._getRequester(),
                originalDataToSend = requester.get("dataToSend"),
                originalUrlBase = requester.get("urlBase");

            requester.set('dataToSend', dataToSend);
            requester.set('urlBase', urlBase);

            var promise = requester.sendRequest();

            promise.then(
                function (data) {
                    requester.set("urlBase", originalUrlBase);
                    requester.set("dataToSend", originalDataToSend)

                    context.emit('completed', {
                        status: 'Success',
                        data: data
                    });
                },
                function (error) {
                    requester.set("urlBase", originalUrlBase);
                    requester.set("dataToSend", originalDataToSend)

                    context.emit('error',
                        {
                            status: 'Error',
                            error: error
                        });
                });

            return promise;
        }

    });
});