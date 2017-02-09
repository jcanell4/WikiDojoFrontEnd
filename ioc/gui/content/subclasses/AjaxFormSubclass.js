define([
    "dojo/_base/declare",
    "ioc/gui/content/subclasses/RequestSubclass",
    // "dojo/on",
    // "dojo/query",
    // "dojo/dom-form",
    // "dojo/_base/event",
], function (declare, RequestSubclass, on, query, domForm, event) {

    return declare([RequestSubclass],
        /**
         * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
         *
         * S'ha deixat com un fitxer independent per facilitar la seva edició
         * i no es garanteix que sigui accesible en el futur.
         *
         * @extends RequestSubclass
         * @class AjaxFormSubclass
         * @author Xavier García <xaviergaro.dev@gmail.com>
         * @private
         * @see contentToolFactory.generate()
         */
        {

            /**
             * Afegeix la substitució d'enviament de formularis per una crida ajax
             *
             * @override
             */
            postRender: function () {
                this.inherited(arguments);

                var $form = jQuery(this.domNode).find('form'),
                    targetId = this.domNode,
                    self = this;

                $form.on('submit', function(event) {
                    event.preventDefault();
                    var $this = jQuery( this ),
                        params = $this.serialize(),
                        request = self.requester;


                    request.urlBase = $this.attr('action');
                    request.setStandbyId(targetId);
                    request.sendRequest(params);
                    $form.each(function() {
                        this.reset();
                    });
                });
            }


        });
});
