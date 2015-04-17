define([
    "dojo/_base/declare",
    "ioc/gui/ContainerContentTool",
    "dijit/layout/AccordionContainer",
    "dijit/layout/TabContainer"

], function (declare, ContainerContentTool, AccordionContainer, TabContainer) {


    var generateFromContainer = function (container, args) {
            declare.safeMixin(container, new ContainerContentTool(args));
            return container;
        },

        generateFromType = function (type, args) {
            var container;

            switch (type) {
                case this.generation.ACCORDION:
                    container = new AccordionContainer(args);
                    break;

                case this.generation.TAB:
                    container = new TabContainer(args);
                    break;
            }

            declare.safeMixin(container, new ContainerContentTool(args));
            return container;
        };


    return {

        generation: {
            ACCORDION: 'accordion',
            TAB:       'tab'
        },

        decoration: {},

        generate: function (container, args) {

            args.decorator = this;

            if (typeof container === 'string') {
                return generateFromType(container, args);
            } else {
                return generateFromContainer(container, args);
            }

        },

        decorate: function (type, container, args) {
            console.error("Aquesta funció no està implementada encara");
        }
    }


});