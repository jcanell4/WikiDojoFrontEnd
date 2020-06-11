define([
	"dojo/_base/declare", // declare
    "dijit/form/Textarea",
    "dojox/form/CheckedMultiSelect",
    'dojo/text!dojox/form/resources/CheckedMultiSelect.css',
    // "dojo/dom-style", // domStyle.set
    // 'ioc/gui/content/EditableElements/ConditionalSelectCellElement'
], function(declare, TextArea, CheckedMultiSelect, css/*, domStyle, ConditionalSelectCellElement*/){

	// module:
	//		dijit/form/Textarea

    var cssStyle = document.createElement('style');
    cssStyle.innerHTML= css;
    document.head.appendChild(cssStyle);

	return declare("ioc.conditionalselectcell", [TextArea], {


		buildRendering: function(){
			this.inherited(arguments);

			alert("TODO: configurar el ConditionalSelectCell");
			// TODO[Xavi] EL camp real és un textarea, s'ha d'injectar una icona com la lupa però en lloc de mostrar
           // un editor cal mostrar un dialeg per seleccionar els camps, mostrará un CheckedMultiSelect amb les opcions i un botó per desar



            // El checked:
            //      S'ha d'omplir amb els dades obtingudes de la taula original
            //      value = id composta
            //      descripció = id composta + descripció de la taula original
            //      Si el value del widget original (contingut del textarea) es diferent de 0 s'han d'agafar els ids compostos i marcar aquests al widget.
            //      En desar es guardan tots els valors checked separats per coma (id compostos)





			//domStyle.set(this.textbox, { backgroundColor: 'red', zIndex: 0, overflowY: 'auto' }); // Test

			// Aquest element s'injecta en lloc del textbox original
            // new ConditionalSelectCellElement({
             //    node: this.textbox,
             //    alwaysDisplayIcon: true
            // });

		},

	});
});
