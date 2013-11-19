/* 
 * IocDropDownButton
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
    /* module:
    *		ioc/gui/IocDropDownButton
	* Afegeix un nou mètode al DropDownButton estàndar que redimensiona el botó
	* per igualar-lo a la mida del seu contenidor pare.
	* El mètode s'activa amb l'atribut autoSize.
	*	- autoSize: true/false
	*				true: executa el mètode resize -> canvia el tamany del botó
	*				false: no executa el mètode resize -> no canvia el tamany del botó
	*/
    var ret = declare("ioc.gui.IocDropDownButton", [DropDownButton, Request, _TemplatedMixin],{
		templateString: template
		,autoSize: true 	
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
		,startup: function(){
			this.inherited(arguments);
			this.resize();
		}
    });
    return ret;
});
