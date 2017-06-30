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
         * @author Josep Cañellas <jcanell4@ioc.cat>
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
                var $link, targetId, self;
                this.inherited(arguments);

                targetId = this.domNode;
                self = this;
                
                $link = jQuery(this.domNode).find('a');

                $link.on('click', function(event) {
                    event.preventDefault();
                    var $this, call, params, request, urlBase, aHref;
                    
                    request = self.requester;
                    $this = jQuery( this );
                    aHref = $this.attr('href').split('?');
                    if(!self.requestLinkArgs){
                        call = 'page';
                        urlBase = request.defaultUrlBase?request.defaultUrlBase:aHref[0];
                    }else{
                        if(!self.requestLinkArgs.callAtt){
                            call = this.dataset['data-call'];
                        }else{
                            call = this.dataset[self.requestLinkArgs.callAtt];
                        }
                        if(!self.requestLinkArgs.urlBase){
                            urlBase = request.defaultUrlBase?request.defaultUrlBase:aHref[0];
                        }else{
                            urlBase = self.requestLinkArgs.urlBase;
                        }
                    }
                    
                    if(!call){
                        call = 'page';
                    }
                        
                    //params = "call="+call+"&" + $this.attr('href').replace(/^.*\?/, "");
                    params = "call="+call+ (aHref.length>1?"&"+aHref[1]:"");
                    
                    request.urlBase = urlBase;
                    request.setStandbyId(targetId);
                    request.sendRequest(params);

                });
            }

        });
});
