/* 
 * Funcions comunes als botons
*/
define(["dojo/_base/declare"
		,"dojo/dom-style"
],
function(declare, style) {
	/* @author Rafael Claver <rclaver@xtec.cat>
     * module: ioc/gui/IocComponent
	 *  
	 * Afegeix el mètode 'resize' que redimensiona l'objecte
	 * per igualar-lo a la mida del seu contenidor pare.
	 * El mètode s'activa amb l'atribut autoSize.
	 *	- autoSize: true/false
	 *				true: executa el mètode resize -> iguala el tamany del botó al del contenidor pare
	 *				false: no executa el mètode resize -> no canvia el tamany del botó
	 * Afegeix el mètode '__setVisible' que mostra/amaga l'objecte
	*/
    var ret = declare("ioc.gui.IocComponent", [], {
		 nodeToResize: null
		,topNodeToResize:null
		,visible: true
		,autoSize: false

		,set: function(propName){
			this.inherited(arguments);
			if (propName==="visible") {
				this.__setVisible();
			}
		}
		,__setVisible: function(){
			if (this._started) {
				var node = this.nodeToResize;
				if (this.visible) {
					style.set(node, "display", "");
					this.resize();
				}else {
					style.set(node, "display", "none");
				}
			}
		}
		,resize: function(){
			if (this.autoSize) {
				this.inherited(arguments);
				var correccio_amplada = 15;
		        var node = this.nodeToResize;
				var nodePare = this.topNodeToResize.parentNode;
				var amplePare = nodePare.clientWidth - correccio_amplada;
				style.set(node, "width", amplePare+"px");
			}
		}
	});
	return ret;
});
