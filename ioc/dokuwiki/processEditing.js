/**
 * @author Josep Cañellas <jcanell4@ioc.cat>, Xavier García <xaviergaro.dev@gmail.com>
 */
define([
    "ioc/wiki30/dispatcherSingleton",
    "dojo/dom",
    "dojo/on",
    "dijit/focus",
    "dojo/ready"

], function (dispatcher, dom, on, focus, ready) {
    /**
     * Activate "not saved" dialog, add draft deletion to page unload,
     * add handlers to monitor changes
     *
     * Sets focus to the editbox as well
     */
    function setChangesControl(editFormId, wikiTextId, summaryId) {
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


        on(summary, "change", summaryCheck);
        on(summary, "keyup", summaryCheck);

        if (changesManager.thereAreChangedDocuments()) {
            summaryCheck();
        }

        dw_editor.init();
    }

    /**
     * @param {{toolbarId:string, editFormId:string, wikiTextId:string, summaryId:string}} params
     */
    var res = function (params) {
        ready(function () {
            var toolbar = window[params.varName];

            if (toolbar && params.toolbarId && params.wikiTextId) {
                initToolbar(params.toolbarId, params.wikiTextId, toolbar);
                jQuery('#' + params.toolbarId).attr('role', 'toolbar');
            }

            setChangesControl(params.editFormId, params.wikiTextId,
                params.summaryId);

            dw_locktimer.init(params.timeout, params.draft);
        });
    };
    return res;
});

