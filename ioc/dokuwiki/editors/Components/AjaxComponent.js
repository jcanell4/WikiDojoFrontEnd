define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/Components/AbstractIocComponent'
], function (declare, AbstractIocComponent) {

    return declare(AbstractIocComponent, {
        urlBase:"",
        method:"GET",
        init: function (urlBase, method) {
            this.urlBase = urlBase;
            if(method){
                this.method = method;
            }
        },
        send: function (dataToSend) {
            var context = this;

            var promise = jQuery.ajax({
                url: context.urlBase,
                type: context.method,
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