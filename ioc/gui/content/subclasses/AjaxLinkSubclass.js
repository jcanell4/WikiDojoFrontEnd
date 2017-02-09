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
         * @class AjaxLinkSubclass
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

                var $link = jQuery(this.domNode).find('a'),
                    targetId = this.domNode,
                    self = this;

                $link.on('click', function(event) {
                    event.preventDefault();
                    var $this = jQuery( this ),
                        params = "call=page&" + $this.attr('href').replace(/^.*\?/, ""),
                        request = self.requester;

                    console.log("Params:", params);

                    request.urlBase = request.defaultUrlBase;
                    request.setStandbyId(targetId);
                    request.sendRequest(params);

                });
            }


        });
});
