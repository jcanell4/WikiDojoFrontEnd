define([
    "dojo/_base/declare", // declare
    "dijit/form/Textarea",
    // 'ioc/gui/content/EditableElements/ConditionalSelectCellElement',
    'ioc/gui/content/EditableElements/ZoomableCellTree',
    'dojo/dom-construct'
], function (declare, TextArea, ZoomableCellTree) {

    // module:
    //		dijit/form/Textarea


    return declare("ioc.treecell", [TextArea], {

        // startup: function() {
        //     this.inherited(arguments);
        //     if (!this.widgetInitialized) {
        //         this.createWidget();
        //     }
        // },

        buildRendering: function () {

            this.inherited(arguments);

            // Aquest element s'injecta en lloc del textbox original
            new ZoomableCellTree({
                node: this.textbox,
                alwaysDisplayIcon: true,
                src: this
            });

            var context = this;


            jQuery(this.textbox).on('change input', function (e) {

                // Validem que es tracta d'un jason correcte

                let text = jQuery(this).val();
                let validated = false;
                try {
                    JSON.parse(text);
                    validated = true;
                } catch {
                    validated = false;
                }

                var config = context.gridData.cell.config;
                // console.log("Hi ha config a la cel·la? ens fa falta?", config);


                if (!validated) {
                    jQuery(context.domNode).css('border', '1px solid red');
                    jQuery(context.domNode).css('background-color', 'pink');
                } else {
                    jQuery(context.domNode).css('border', 'none');
                    jQuery(context.domNode).css('background-color', 'white');
                }

            });


        },

    });
});
