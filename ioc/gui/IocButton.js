/* 
 * Declara un Botó que realitza la funció indicada en un atribut
 * també canvia el tamany de fixe a variable segons el contenidor
 */
define(["dojo/_base/declare"
		,"dijit/form/Button"
		,"ioc/wiki30/Request"
        ,"dijit/_TemplatedMixin"
		,"dojo/text!./templates/Button.html"
		,"dojo/dom-style"
        ,"dojo/NodeList-dom"
],
function(declare, button, Request, _TemplatedMixin, template, style) {
    // module:
    //		ioc/gui/IocButton

    var ret = declare("ioc.gui.IocButton", [button, Request, _TemplatedMixin],{
    templateString: template,
    query: ""
    ,autoSize: false	// true: canvia el tamany del botó: width=inherited
						// false: no canvia el tamany del botó
    ,_onClick: function(){
                this.inherited(arguments);
                this.sendRequest(this.query);
            }
    ,startup: function(){
		this.inherited(arguments);
		if (this.autoSize) this.resize();
	}
	,resize: function(){
            this.inherited(arguments);
			var correccio_amplada = 15;
            var node = this.buttonNode;
			var nodePare = this.buttonTopNode.parentNode;
			var amplePare = nodePare.clientWidth - correccio_amplada;
			style.set(node, "width", amplePare+"px");
			}
    });
    return ret;
});
