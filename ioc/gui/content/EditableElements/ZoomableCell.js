define([
	"dojo/_base/declare", // declare
    "dijit/form/Textarea",
    "dojo/dom-style", // domStyle.set
    'ioc/gui/content/EditableElements/ZoomableCellElement'
], function(declare, Textarea, domStyle, ZoomableCellElement){

	// module:
	//		dijit/form/Textarea

	return declare([Textarea], {


		buildRendering: function(){
			this.inherited(arguments);

			//domStyle.set(this.textbox, { backgroundColor: 'red', zIndex: 0, overflowY: 'auto' }); // Test

			// Aquest element s'injecta en lloc del textbox original
            new ZoomableCellElement({
                node: this.textbox,
                alwaysDisplayIcon: true
            });

		},

	});
});
