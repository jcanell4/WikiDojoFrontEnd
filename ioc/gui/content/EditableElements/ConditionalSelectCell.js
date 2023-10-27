define([
    "dojo/_base/declare", // declare
    "dijit/form/Textarea",
    'ioc/gui/content/EditableElements/ConditionalSelectCellElement',
    'dojo/dom-construct'
], function (declare, TextArea, ConditionalSelectCellElement) {

    // module:
    //		dijit/form/Textarea


    return declare("ioc.conditionalselectcell", [TextArea], {

        // startup: function() {
        //     this.inherited(arguments);
        //     if (!this.widgetInitialized) {
        //         this.createWidget();
        //     }
        // },

        buildRendering: function () {
            this.inherited(arguments);

            // Aquest element s'injecta en lloc del textbox original
            new ConditionalSelectCellElement({
                node: this.textbox,
                alwaysDisplayIcon: true,
                src: this
            });

            var context = this;


            jQuery(this.textbox).on('change input', function (e) {

                var config = context.gridData.cell.config;

                // Cal fer la comprovació aquí perque el gridData no es disponible durant la creació del widget
                if (!config.validationRegex) {
                    return;
                }

                var separator = config.outputSeparatorSplitter ? new RegExp(config.outputSeparatorSplitter) : config.outputSeparator;
                var tokens = jQuery(this).val().split(separator)

                var validated = true;

                for (var i = 0; i < tokens.length; i++) {

                    if (tokens[i].length === 0) {
                        continue;
                    }

                    var pattern = new RegExp(config.validationRegex, 'g');

                    if (!pattern.test(tokens[i])) {
                        validated = false;
                        break;
                    }
                }

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
