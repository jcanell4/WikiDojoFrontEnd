/**
 * Funcions compartides entre el scriptsRef.tpl i altres mòduls i processos de la dokuwiki que afecten a la GUI.
 *
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define([
    'dojo/query',
    'dojo/on',
    'dojo/dom'
], function (dojoQuery, on, dom) {

    var
        /**
         * Afegeix un watch al panell per controlar quan s'ha clicat i fa persistent el canvi al ContentCache.
         *
         * @param {Object} node - Dijit al que s'aplica el watch
         * @param {string} documentId - id del document al que està enllaçat aquest panell
         * @param {string} paneId - id del panell seleccionat
         * @param {Dispatcher} dispatcher
         * @private
         */
        _addWatchToMetadataPane = function (node, documentId, paneId, dispatcher) {

            node.watch("selected", function (name, oldValue, newValue) {

                if (newValue) {
                    console.log("selected:", paneId);
                    dispatcher.getContentCache(documentId).setCurrentId("metadataPane", paneId)
                }
            })
        },

        /**
         * Afegeix un listener a tots els elements de tipus input del panell que actualitzará les metadades
         * relacionadas al ContentCache amb els canvis fets.
         *
         * Actualitza els valors checked i value, si el tipus del element no es basa en aquests valors (per exemple
         * radio buttons) no tindrá l'efecte esperat.
         *
         * @param {string} paneId - id del panell de metadades
         * @param {Dispatcher} dispatcher
         * @private
         */
        _addChangeListenersToMetadataPane = function (paneId, dispatcher) {
            var nodeList = dojoQuery("#" + paneId + " input");

            nodeList.forEach(function (node) {
                on(node, 'change', function (evt) {
                    var currentTab = dispatcher.getGlobalState().getCurrentId(),
                        changedNode;

                    node.setAttribute("value", evt.target.value);
                    node.setAttribute("checked", evt.target.checked);
                    changedNode = dom.byId(paneId).innerHTML;

                    dispatcher.getContentCache(currentTab).replaceMetaDataContent(paneId, changedNode)
                })
            });
        },


        /**
         * Afegeix al array passat com argument els objectes amb metadata de prova
         *
         * @param {{id: string, title: string, content: string}[]} meta - Array al que s'afegeixen les dades
         * @private
         */
        _pushTestMetadataToArray = function (meta) {
            meta.push({
                id:      "prova",
                title:   "prova_title",
                content: "<input type=\"checkbox\"/> Checkbox Test"
            });

            meta.push({
                id:      "prova2",
                title:   "prova_title2",
                content: "<input type=\"text\"/> Text Test"
            })
        },

        _generateRevisionsHtml = function (revisions) {
            return 'Generacio de les revisions';
        };


    return {

        addWatchToMetadataPane: _addWatchToMetadataPane,

        addChangeListenersToMetadataPane: _addChangeListenersToMetadataPane,

        pushTestMetadataToArray: _pushTestMetadataToArray,

        generateRevisionsHtml: _generateRevisionsHtml

    }
});