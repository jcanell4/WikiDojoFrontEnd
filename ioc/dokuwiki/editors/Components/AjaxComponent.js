define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/Components/AbstractIocComponent',
    'dojox/widget/Standby',

], function (declare, AbstractIocComponent, Standby) {

    // ALERTA[Xavi] Només per utilitzar en casos molt molt concrets que no hagin de passar pels processors normals
    // TODO valorar injectar-lo com a funció-processor quan s'envia i que la desvinculi quan retorna i eliminar
    // aquesta classe (s'utilitzaria el request)

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
                // console.log("Creat standby object");
                this._standby = new Standby({target: this.standbyId});
                document.body.appendChild(this._standby.domNode);
                this._standby.startup();
            }
        },


        send: function (dataToSend) {
            var context = this;


            this._createStandbyObject();


            // Pot ser que existeixi el _standby però no s'hagi fer un setStandbyId, llavors fallaria
            if (this._standby && this._standby.target) {
                this._standby.show();
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
                    if (context._standby && context._standby.target) {
                        context._standby.hide();
                    }
                }
            });

            return promise;
        }

    });
});