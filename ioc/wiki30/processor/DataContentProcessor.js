define([
    "ioc/dokuwiki/editorManager/Editor",
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "dojo/ready",
    "ioc/gui/content/contentToolFactory",
    "ioc/dokuwiki/AceManager/toolbarManager",
    "ioc/dokuwiki/editorManager/locktimer",
    "dojo/dom",
    "dojo/dom-style"

], function (Editor, declare, ContentProcessor, ready, contentToolFactory, toolbarManager, locktimer, dom, domStyle) {

    var editing = function (params, docId, dispatcher) {

        console.log("params:", params);

        toolbarManager.setToolbar(params.varName, params.toolbarId, params.wikiTextId);

        // Locked:

        dw_editor.init();

        //dw_locktimer.init(params.timeout, params.draft);
        //locktimer.init(params.timeout, params.draft);

        // Ho instanciem com a classe, hi ha d'haver 1 timer per cada document
        //new locktimer(docId, dispatcher).init(5, params.draft); // Temps en segons


        //var btn = "#" + dispatcher.saveButtonId;
        //console.log("button:", btn);


        //console.log("jQuery.node", jQuery(btn).css('display', 'none'));
        //console.log("parent", jQuery(btn).parent().css('display', 'none'));


        if (params.locked) {

            // Document bloquejat


        } else {

            // Només activem el temportizador si el document està bloquejat
            //new locktimer(docId, dispatcher).init(params.timeout, params.draft); // TODO[Xavi] Aquest es el correcte
            new locktimer(docId, dispatcher).init(10, params.draft);
        }


    };

    return declare([ContentProcessor],
        /**
         * Aquesta classe s'encarrega de processar les dades i generar un document editable.
         *
         * @class DataContentProcessor
         * @extends ContentProcessor
         * @author Josep Cañellas <jcanell4@ioc.cat>, Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "data",

            /**
             * Processa el valor i crea un nou Editor amb la informació i el lliga al Dispatcher passat com argument.
             * Desprès de efectuar les operacions necessaries delega a la classe ContentTool per continuar amb
             * la seqüència del processament.
             *
             * @param {EditorContent} value - Informació per generar l'editor
             * @param {Dispatcher} dispatcher - Dispatcher al que està lligat el ContentTool que es generarà
             * @returns {int} - El valor de return es un enter que depèn del resultat del valor retornat per la
             * superclasse.
             * @override
             */
            process: function (value, dispatcher) {
                var ret;

                value.editor = new Editor(value.id, value.content);
                value.content = "<p></p>";


                ret = this.inherited(arguments);

                // En aquest punt ja ha d'estar el ContentTool creat

                value.editor.select();


                ready(function () {
                    editing(value.editing, value.id, dispatcher);
                });


                return ret;
            },

            /**
             * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument, i afegeix
             * el valor de la acció a "edit".
             *
             * @param {Dispatcher} dispatcher
             * @param {Content} value
             * @override
             */
            updateState: function (dispatcher, value) {
                this.inherited(arguments);
                dispatcher.getGlobalState().getContent(value.id)["action"] = "edit";
                dispatcher.getContentCache(value.id).setEditor(value.editor);


            },

            /**
             * Aquesta es la implementació específica del métode que genera un ContentTool decorat per funcionar com
             * Editor de documents amb gestió de canvis.
             *
             * @param {EditorContent} content - Contingut a partir del cual es genera el ContentTool
             * @param dispatcher - Dispatcher al que està lligat el ContentTool
             * @returns {ContentTool} - ContentTool decorat per funcionar com un editor de documents
             * @override
             * @protected
             */
            createContentTool: function (content, dispatcher) {
                var args = {
                    ns:              content.ns,
                    id:              content.id,
                    title:           content.title,
                    content:         content.content,
                    closable:        true,
                    dispatcher:      dispatcher,
                    originalContent: this._extractContentFromNode(content.editor.editorNode),
                    type:            this.type,
                    locked:          content.editing.locked
                };

                return contentToolFactory.generate(contentToolFactory.generation.EDITOR, args);
            },

            _extractContentFromNode: function (parentNode) {
                var nodes = parentNode.children;

                for (var i = 0; i < nodes.length; i++) {
                    if (nodes[i].className == "editBox") {
                        return nodes[i].lastElementChild.textContent;
                    }
                }
            }
        });
});
