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
                this.inherited(arguments);
                
                if(!this.aRequestFormArgs){
                    this._configureRequestForm();
                }else if(!Array.isArray(this.aRequestFormArgs)){
                    this._configureRequestForm(this.aRequestFormArgs.formId, this.aRequestFormArgs.urlBase);
                }else{
                    for(var i=0; this.aRequestFormArgs; ++i){
                        this._configureRequestForm(this.aRequestFormArgs[i].formId, this.aRequestFormArgs[i].urlBase);
                    }
                }

            },
            
            _configureRequestForm: function(formId, urlBase){
                var $form, targetId, self;

                targetId = this.domNode;
                self = this;
                
                if(formId){
                    $form = jQuery(this.domNode).find('#' + formId);
                }else{
                    $form = jQuery(this.domNode).find('form');                    
                }

                console.log("Form trobat?", $form);
                
                $form.on('submit', function(event) {
                    console.log("*** S'ha fet un submit ***");
                    event.preventDefault();
                    var $this = jQuery( this ),
                        // button = event.originalEvent.explicitOriginalTarget,
                        // params = $this.serialize() /*+ "&"+button.name+'='+button.value*/,
                        $button = jQuery(document.activeElement),
                        params = $this.serialize() + "&"+$button.attr('name')+'='+encodeURIComponent($button.val()),



                    request = self.requester;
                    if(urlBase){
                        request.urlBase = urlBase;
                    }else{ 
                        request.urlBase = $this.attr('action');
                    }                    
                    request.setStandbyId(targetId);
                    request.sendRequest(params);
                    request.on('completed', function(e) {

                        if (e.status == 'success' && e.data[0].type !="error") {
                            $form.each(function() {
                                this.reset();
                            });

                            $form.find('input[type="checkbox"]').each(function() {
                                if (this.getAttribute('data-checked')) {
                                    this.setAttribute('checked', true);
                                }
                            });


                        } else {
                                console.error("S'ha produit un error en enviar el formulari", e);

                        }

                    })

                });
            }
        });
});
