define([
    "dojo/_base/declare"
], function (declare) {
    return declare(null,
        /**
         * Classe abstracta amb la implementació genérica per la generació de jocs de regles.
         *
         * @class AbstractRuleSet
         * @author Xavier García<xaviergaro.dev@gmail.com>
         */
        {
            /**
             * Mode al que està vinculat aquest joc de regles.
             * @type {IocAceMode}
             * @protected
             */
            mode: null,

            /**
             * Array associatiu que ha de contenir el llenguate com a string i el ressaltador.
             * @type {Object.<string, {Highlighter}>}
             * @protected
             */
            baseHighlighters: {},

            /**
             * Array bidimensional que conté una cadena amb el tipus de regla i un array de cadenes amb els arguments.
             * @ype {array[][]}
             * @protected
             */
            _extraRules: [],

            /**
             * Enregistra el mode al que se li aplicaran les regles i afegeix les baseHighlighters al mode. Cridat
             * automàticamente per IocAceMode al afegir el set de regles.
             *
             * Un joc de regles només pot estar enregistrat a un mode.
             * @param {IocAceMode} mode - Mode al que es registra aquest joc de regles.
             */
            register: function (mode) {
                this.mode = mode;
                mode.addHighlighters(this.baseHighlighters);
                mode.addExtraRules(this._extraRules);
            },

            /**
             * Aquest es el métode que crida el IocAceMode per processar totes les regles de cada set de regles, les
             * modificaciones realitzades durant el process son descartades cada vegada que hi han canvis, al contrari
             * del que passa amb les regles que es troben a extraRules que son conservades.
             *
             * Per exemple en aquest métode es poden afegir comprovacions que no depenen d'aquest set de regles si no
             * del conjunt de regles o llenguatges carregats, per exemple en IocAceMode es comprova si s'ha carregat
             * el lates o markdown i afegeix les regles extres pertinents.
             *
             * @abstract
             * @return {undefined}
             */
            process: function () {
                throw new Error("S'ha de implementar a les subclasses");
            }
        });
});