define([
	 "dojo/_base/declare" // declare
        ,"dojo/text!./templates/ActionHiddenDialogDokuwiki.html"
        ,"dijit/TooltipDialog"
        ,"dijit/_WidgetsInTemplateMixin"
        ,"ioc/wiki30/Request"
        ,"dijit/registry"
        ,"dojo/dom-form"
        ,"dojo/on"
        ,"dojo/_base/event"
        ,"dojo/dom-style"
        ,"dojo/NodeList-dom" // NodeList.style
], function(declare, template, TooltipDialog, _WidgetsInTemplateMixin 
                   , Request, registry, domForm, on, event, style){
    var ret = declare("ioc.gui.ActionHiddenDialogDokuwiki", 
                                    [TooltipDialog, _WidgetsInTemplateMixin, Request], {
        templateString: template
       ,widgetsInTemplate: true         
       ,startup:function(){
            this.inherited(arguments);
            /*TO DO: */
           var formDialog = registry.byId(this.id+"_form");
           var hiddenDialog = this;
           formDialog.on('submit',function(){
                if(formDialog.validate()){
                    //enviar                    
                    var query = domForm.toQuery(this.id);
                    hiddenDialog.sendRequest(query);
//                    var node = hiddenDialog.domNode;
//                    style.set(node, "display", "none");
                }else{
                    alert('Les dades no són correctes');
                    return false;
                }
                return false;
           });
       }
       ,responseHandler:function(data){
            this.dispatcher.processResponse(data);                    
            if(this._standby){
                this._standby.hide();
            }           
            var node = this.domNode;
            style.set(node, "display", "none");
       }
    });
    return ret;
});


