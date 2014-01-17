/* 
 * Declara un Botó que realitza la funció indicada en un atribut
 * també canvia el tamany de fixe a variable segons el contenidor
 */
define(["dojo/_base/declare"
		,"dijit/form/Button"
		,"ioc/wiki30/Request"
        ,"dijit/_TemplatedMixin"
		,"dojo/text!./templates/Button.html"
		,"ioc/gui/IocComponent"
],
function(declare, button, Request, _TemplatedMixin, template, IocComponent) {
    // module:
    //		ioc/gui/IocButton

    var ret = declare("ioc.gui.IocButton", [button, Request, _TemplatedMixin, IocComponent], 
	{
	    templateString: template
		,query: ""
		,_onClick: function(){
			this.inherited(arguments);
			this.sendRequest(this.getQuery());
		}
		,startup: function(){
			this.inherited(arguments);
			this.nodeToResize = this.buttonNode;
			this.topNodeToResize = this.buttonTopNode;
			this.resize();
			this.__setVisible();
		}
                ,getQuery: function(){
                    return this.query;
                }
	});
	return ret;
});
