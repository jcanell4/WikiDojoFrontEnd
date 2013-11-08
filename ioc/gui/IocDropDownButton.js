/* 
 * Declara un Botó que realitza la funció indicada en un atribut
 * també canvia el tamany de fixe a variable segons el contenidor
 */
define(["dojo/_base/declare"
		,"dijit/form/DropDownButton"
		,"ioc/wiki30/Request"
        ,"dijit/_TemplatedMixin"
		,"dojo/text!./templates/DropDownButton.html"
		,"dojo/dom-style"
        ,"dojo/NodeList-dom"
],
function(declare, DropDownButton, Request, _TemplatedMixin, template, style) {
    // module:
    //		ioc/gui/IocDropDownButton

    var ret = declare("ioc.gui.IocDropDownButton", [DropDownButton, Request, _TemplatedMixin],{
    templateString: template
    ,query: ""
    ,autoSize: true 	// true: canvia el tamany del botó: width=inherited
						// false: no canvia el tamany del botó
    ,_onClick: function(){
                this.inherited(arguments);
                this.sendRequest(this.query);
            }
    ,startup: function(){
		this.inherited(arguments);
		this.resize();
	}
	,resize: function(){
		if (this.autoSize) {
            this.inherited(arguments);
			var correccio_amplada = 15;
            var node = this._buttonNode;
			var nodePare = this._buttonTopNode.parentNode;
			var amplePare = nodePare.clientWidth - correccio_amplada;
			style.set(node, "width", amplePare+"px");
			}
		}
    });
    return ret;
});
