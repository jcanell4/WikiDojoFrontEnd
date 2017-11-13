define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/Components/AbstractIocComponent'
], function (declare, AbstractIocComponent) {

    return declare(AbstractIocComponent, {

        send: function (urlBase, dataToSend, type) {
            var context = this;

            if (!type) {
                type = 'GET';
            }

            var promise = jQuery.ajax({
                url: urlBase,
                type: type,
                data: dataToSend,
                dataType: "json",

                success: function (data, textStatus, xhr) {
                    context.emit('success',
                        {
                            status: textStatus,
                            data: data
                        });
                },
                error: function (xhr, textStatus, errorThrown) {
                    context.emit('error',
                        {
                            status: textStatus,
                            error: errorThrown
                        });
                }
            });

            return promise;
        }

    });
});