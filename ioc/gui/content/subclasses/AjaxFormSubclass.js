define([
    "dojo/_base/declare",
    "ioc/gui/content/subclasses/RequestSubclass"
], function (declare, RequestSubclass) {

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
             * cuando el tipo que tiene el ContentTool es "revisions", este formulario se crea previamente en ioc/gui/content/engines/revisionRenderEngine.js
             * @override
             */
            postRender: function () {
                this.inherited(arguments);
                
                if (!this.aRequestFormArgs){
                    this._configureRequestForm();
                }else if (!Array.isArray(this.aRequestFormArgs)){
                    this._configureRequestForm(this.aRequestFormArgs.formId, this.aRequestFormArgs.urlBase, this.aRequestFormArgs.query);
                }else{
                    for(var i=0; this.aRequestFormArgs; ++i){
                        this._configureRequestForm(this.aRequestFormArgs[i].formId, this.aRequestFormArgs[i].urlBase, this.aRequestFormArgs[i].query);
                    }
                }
            },
            
            _configureRequestForm: function(formId, urlBase, query){
                var $form;
                var targetId = this.domNode;
                var self = this;
                
                if (formId){
                    $form = jQuery(this.domNode).find('#' + formId);
                }else{
                    $form = jQuery(this.domNode).find('form');                    
                }

                $form.on('submit', function(event) {
                    event.preventDefault();
                    var $this = jQuery(this);
                    var $button = jQuery(document.activeElement);
                    var params = $this.serialize() + "&"+$button.attr('name')+'='+encodeURIComponent($button.val()),

                    request = self.requester;
                    if ($button.attr('data-query')) {
                        request.urlBase = urlBase + $button.attr('data-query');
                    }else if (urlBase){
                        query = (query==undefined) ? "" : query;
                        request.urlBase = urlBase + query;
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
                        }else {
                            console.error("S'ha produit un error en enviar el formulari", e);
                        }
                    });

                });
            }
        });
});
