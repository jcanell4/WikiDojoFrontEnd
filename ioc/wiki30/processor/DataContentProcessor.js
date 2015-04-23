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

                summary = dom.byId(summaryId),

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


            window.addEventListener("beforeunload", function (event) {
                if (changesManager.thereAreChangedDocuments()) {
                    event.returnValue = LANG.notsavedyet;
                }

                deleteDraft();
            });

            if (edit_text) {
                // set focus and place cursor at the start
                var sel = getSelection(edit_text);
                sel.start = 0;
                sel.end = 0;
                setSelection(sel);
                focus.focus(edit_text);
                //            edit_text.focus();
            }


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

            if (toolbar && params.toolbarId && params.wikiTextId) {
                initToolbar(params.toolbarId, params.wikiTextId, toolbar);
                jQuery('#' + params.toolbarId).attr('role', 'toolbar');
            }


            setChangesControl(params.editFormId, params.wikiTextId,
                params.summaryId, dispatcher);


            dw_locktimer.init(params.timeout, params.draft);

            //});
        };


    var ret = declare("ioc.wiki30.processor.DataContentProcessor", [ContentProcessor],
        /**
         * @class DataContentProcessor
         * @extends ContentProcessor
         */
        {

            type: "data",

            /**
             * @param {Content} value
             * @param {Dispatcher} dispatcher
             * @override
             */
            process: function (value, dispatcher) {


                var ret;


                value.editor = new Editor(value.id, value.content);

                value.content = "<p></p>";


                ret = this.inherited(arguments);

                value.editor.select();

                ready(function() {
                    editing(value.editing, dispatcher);
                });


                return ret;
                //return this.inherited(arguments);
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
             *
             * @param content
             * @param dispatcher
             * @returns {*}
             * @private
             */
            createContentTool: function (content, dispatcher) {
                var args = {
                    id:         content.id,
                    title:      content.title,
                    content:    content.content,
                    closable:   true,
                    dispatcher: dispatcher
                };

                console.log("Args are ok");

                return contentToolFactory.generate(contentToolFactory.generation.EDITOR, args);
            },

        });


    return ret;
});

