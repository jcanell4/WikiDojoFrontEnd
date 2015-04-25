/**
 * Aquest mòdul exposa la creació i decoració de ContainerContentTools a través dels métodes públics les propietats
 * que exposa.
 *
 * Tots els tipus de ContainerContentTool seran creats i decorats a travès d'aquesta factoria, sent les classes
 * específiques tan per instancar-los com per decorar-los privades a aquest mòdul.
 *
 * Encara que actualment el codi d'un o mès d'aquestes classes es trobi en un fitxer independent s'ha de considerar
 * que son privats a aquesta classe i així s'han anotat.
 *
 * No es pot garantir que les classes marcades com a privades siguien accessibles en el futur.
 *
 * @module containerContentToolFactory
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define([
    "dojo/_base/declare",
    "ioc/gui/content/ContainerContentTool",
    "dijit/layout/AccordionContainer",
    "dijit/layout/TabContainer"

], function (declare, ContainerContentTool, AccordionContainer, TabContainer) {

    var
        /**
         * Genera un ContainerContentTool a partir de un contenidor que ja existeix.
         *
         * @param {*} container
         * @param {*} args - Arguments amb els valors necessaris per configurar el ContainerContentTool
         * @returns {ContainerContentTool} - Contenidor amb tota la funcionalitat del ContainerContentTool
         * @private
         */
        generateFromContainer = function (container, args) {
            declare.safeMixin(container, new ContainerContentTool(args));
            return container;
        },

        /**
         * Genera un ContainerContentTool a partir d'un nou contenidor creat específicament.
         *
         * @param {string} type - Tipus de contenidor que volem fer servir com a base.
         * @param {*} args - Arguments amb els valors necessaris per configurar el ContainerContentTool
         * @returns {ContainerContentTool}
         * @private
         */
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

        /** @enum */
        generation: {
            ACCORDION: 'accordion',
            TAB:       'tab'
        },

        /** @enum */
        decoration: {},

        /**
         * Genera un ContainerContentTool a partir dels valors passats com arguments
         *
         * @param {*|string} container - Contenidor o tipus de contenidor a partir del qual volem generar el ContainerContentTool
         * @param {*} args - Arguments amb els valors necessaris per configurar el ContainerContentTool
         * @returns {ContainerContentTool}
         */
        generate: function (container, args) {
            args.decorator = this;

            if (typeof container === 'string') {
                return generateFromType(container, args);
            } else {
                return generateFromContainer(container, args);
            }
        },

        /**
         * Decora una ContainerContentTool amb una decoració del tipus adequat i valors especificats passats com argument.
         *
         * TODO[Xavi] Actualment no hi ha cap decorador aplicable als ContainerContentTool.
         *
         * @param {string} type - tipus de decoració a aplicar
         * @param {ContainerContentTool} container
         * @param {*} args - arguments necessaris per configurar la decoració
         * @return {ContainerContentTool} - Contenidor decorat
         * @protected
         * @see ContainerContentTool.decorate()
         */
        decorate: function (type, container, args) {
            console.error("Aquesta funció no està implementada encara");
        }
    }


});