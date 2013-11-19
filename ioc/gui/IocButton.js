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
    templateString: template
    ,query: ""
    ,autoSize: false	// true: canvia el tamany del botó: width=inherited
						// false: no canvia el tamany del botó
	,visible: true
    ,_onClick: function(){
			this.inherited(arguments);
			this.sendRequest(this.query);
		}
	,resize: function(){
			if (this.autoSize) {
				this.inherited(arguments);
				var correccio_amplada = 15;
		        var node = this.buttonNode;
				var nodePare = this.buttonTopNode.parentNode;
				var amplePare = nodePare.clientWidth - correccio_amplada;
				style.set(node, "width", amplePare+"px");
			}
		}
    ,startup: function(){
			this.inherited(arguments);
			this.resize();
			this.__setVisible();
		}
	,set: function(propName){
			this.inherited(arguments);
			if (propName==="visible") {
				this.__setVisible();
			}
		}
	,setVisible: function(visible){
			this.visible = visible;
			this.__setVisible();
		}
	,__setVisible: function(){
			if (this._started) {
				var node = this.buttonNode;
				if (this.visible) {
					style.set(node, "display", "");
					this.resize();
				}
				else {
					style.set(node, "display", "none");
				}
			}
		}
	});
	return ret;
});
