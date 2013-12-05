

define(["dojo/_base/declare"
        ,"dijit/form/Form"
        ,"ioc/wiki30/Request"        
        ,"dojo/NodeList-dom"
],
function(declare, Form, Request) {
    // module:
    //		ioc/gui/IocButton

    var ret = declare("ioc.gui.IocButton", [Form, Request],{
    ,query: ""
    ,startup: function(){
			this.inherited(arguments);
                        if(this.action){
                            this.query=this.action;
                        }
		}
	});
	return ret;
});
