/* 
 * IocDropDownButton
 */
define(["dojo/_base/declare"
		,"dijit/form/DropDownButton"
		,"ioc/wiki30/Request"
        ,"dijit/_TemplatedMixin"
		,"dojo/text!./templates/DropDownButton.html"
		,"ioc/gui/IocResizableComponent"
],
function(declare, DropDownButton, Request, _TemplatedMixin, template, IocComponent) {
    /* module:
    *		ioc/gui/IocDropDownButton
	* Afegeix un nou mètode al DropDownButton estàndar que redimensiona el botó
	* per igualar-lo a la mida del seu contenidor pare.
	* El mètode s'activa amb l'atribut autoSize.
	*	- autoSize: true/false
	*				true: executa el mètode resize -> canvia el tamany del botó
	*				false: no executa el mètode resize -> no canvia el tamany del botó
	*/
    var ret = declare("ioc.gui.IocDropDownButton", [DropDownButton, Request, _TemplatedMixin, IocComponent],
	{
		templateString: template
		,startup: function(){
			this.inherited(arguments);
			this.nodeToResize = this._buttonNode;
			this.topNodeToResize = this._buttonTopNode;
			this.resize();
		}
    });
    return ret;
});
