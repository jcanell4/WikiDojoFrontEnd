define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/Components/AbstractIocComponent',
    'dojox/widget/Standby',

], function (declare, AbstractIocComponent, Standby) {

    return declare(AbstractIocComponent, {
        urlBase: "",
        method: "GET",
        init: function (urlBase, method) {
            this.urlBase = urlBase;
            if (method) {
                this.method = method;
            }

        },

        // ALERTA! per fer servir el standby cal establir el node on es mostrarà
        setStandbyId: function(node) {
          this.standbyId = node;
        },

        _createStandbyObject: function () {
            /*It sets the Standby object in a variable to be accessible from any site.
             *The private attibute is used to control the construction of the object
             */
            if (this.standbyId !== null && !this._standby) {
                console.log("Creat standby object");
                this._standby = new Standby({target: this.standbyId});
                document.body.appendChild(this._standby.domNode);
                this._standby.startup();
            }
        },


        send: function (dataToSend) {
            var context = this;


            this._createStandbyObject();

            if (this._standby) {
                console.log("mostrant show");
                this._standby.show();
            }else {
                console.log("standby no mostrat");
            }


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
                },

                complete: function() {
                    console.log("hiding standby");
                    context._standby.hide();
                }
            });

            return promise;
        }

    });
});