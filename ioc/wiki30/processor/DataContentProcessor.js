define([
    "dojo/dom",
    "ioc/dokuwiki/editorManager/Editor",
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "dojo/on",
    "dijit/focus",
    "dojo/ready",
    "ioc/gui/content/contentToolFactory"

], function (dom, Editor, declare, ContentProcessor, on, focus, ready, contentToolFactory) {

    var setChangesControl = function (editFormId, wikiTextId, summaryId, dispatcher) {


            var editform = dom.byId(editFormId),

                edit_text = dom.byId(wikiTextId),

            //summary = dom.byId(summaryId),

                changesManager = dispatcher.getChangesManager(),


                checkfunc = function () {
                    var currentId = dispatcher.getGlobalState().getCurrentId();
                    changesManager.updateDocumentChangeState(currentId);
                    summaryCheck();
                };


            if (!editform || (edit_text && edit_text.readOnly)) {
                return;
            }

            changesManager.setDocument(edit_text.value);

            // TODO[Xavi] Això hauria de activarse globalment, no només per un tipus concret de document
            window.addEventListener("beforeunload", function (event) {
                if (changesManager.thereAreChangedDocuments()) {
                    event.returnValue = LANG.notsavedyet;
                }

                deleteDraft();
            });

            // TODO[Xavi] No trobo que això tingui cap efecte actualment
            if (edit_text) {
                // set focus and place cursor at the start
                var sel = getSelection(edit_text);
                sel.start = 0;
                sel.end = 0;
                setSelection(sel);
                focus.focus(edit_text);
                //            edit_text.focus();
            }

            // TODO[Xavi] El control de canvis produits s'ha de moure al ContentTool pertinent

            on(editform, 'keyup', checkfunc);
            on(editform, 'paste', checkfunc);
            on(editform, 'cut', checkfunc);
            on(editform, 'focusout', checkfunc);

            //alert("existe summary?");
            //on(summary, "change", summaryCheck);
            //on(summary, "keyup", summaryCheck);


            if (changesManager.thereAreChangedDocuments()) {
                summaryCheck();
            }

            dw_editor.init();
        },

        editing = function (params, dispatcher) {
            var toolbar = window[params.varName];

            // TODO[Xavi] Segurament això està directament enllaçat amb el problema detectat al recarregar la pagina
            // Moure la inicialització del toolbar al aceProcessEditor?
            if (toolbar && params.toolbarId && params.wikiTextId) {
                initToolbar(params.toolbarId, params.wikiTextId, toolbar);
                jQuery('#' + params.toolbarId).attr('role', 'toolbar');
            }

            setChangesControl(params.editFormId, params.wikiTextId, params.summaryId, dispatcher);
            dw_locktimer.init(params.timeout, params.draft);
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
                value.editor.select();

                ready(function () {
                    editing(value.editing, dispatcher);
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
                dispatcher.getGlobalState().pages[value.id]["action"] = "edit";
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
                    id:         content.id,
                    title:      content.title,
                    content:    content.content,
                    closable:   true,
                    dispatcher: dispatcher
                };

                //return contentToolFactory.generate(contentToolFactory.generation.EDITOR, args)
                //    .decorate(contentToolFactory.decoration.DOCUMENT, args);

                return contentToolFactory.generate(contentToolFactory.generation.DOCUMENT, args)
                    .decorate(contentToolFactory.decoration.EDITOR, args);;

            }
        });
});