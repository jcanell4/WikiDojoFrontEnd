define(["dojo/_base/declare"
        ,"dijit/form/Form"
        ,"dijit/registry"
        ,"dojo/dom-form"
        ,"ioc/wiki30/Request"        
        ,"dojo/on"
        ,"dojo/_base/event"
        ,"dojo/NodeList-dom"
],
function(declare, Form, registry, domForm, Request) {
    // module:
    //		ioc/gui/IocForm

    var ret = declare("ioc.gui.IocForm", [Form, registry, domForm, Request],{
		,query: ""
		,startup: function(){
			var formDialog = registry.byId(this.id+"_form");
			var thisForm = this;
			this.inherited(arguments);
			formDialog.on('submit',function(){
				if(formDialog.validate()){
					//enviar                    
					var query = domForm.toQuery(this.id);
					thisForm.sendRequest(query);
				}else{
					alert('Les dades no són correctes');
					return false;
				}
				return false;
           });

			if(this.action){
				this.query=this.action;
			}
		}
	});
	return ret;
});
