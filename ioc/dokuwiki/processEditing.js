define([           
    "ioc/wiki30/dispatcherSingleton"
    ,"dojo/dom"
    ,"dojo/on"
    ,"dijit/focus"
    ,"dojo/ready"
], function(dispatcher, dom, on, focus, ready){
    /**
    * Activate "not saved" dialog, add draft deletion to page unload,
    * add handlers to monitor changes
    *
    * Sets focus to the editbox as well
    */
   function setChangesControl(){
        var editform = dom.byId('dw__editform');
        if (!editform) {
            return;
        }

        var edit_text = dom.byId('wiki__text');
        if (edit_text) {
            if(edit_text.readOnly) {
                return;
            }

            // set focus and place cursor at the start
            var sel = getSelection(edit_text);
            sel.start = 0;
            sel.end   = 0;
            setSelection(sel);
            focus.focus(edit_text);
//            edit_text.focus();
        }

        var checkfunc = function() {
            window.textChanged = true; //global var
            dispatcher.setUnsavedChangesState(window.textChanged );
            summaryCheck();
        };

        on(editform, 'keydown', checkfunc);
        on(editform, 'change', checkfunc);
//        focus.watch(editform, checkfunc);

        window.onbeforeunload = function(){
            if(dispatcher.getUnsavedChangesState()) {
                return LANG.notsavedyet;
            }
        };
        window.onunload = deleteDraft;

        var summary = dom.byId('edit__summary');
        on(summary, "change", summaryCheck);
        on(summary, "keyup", summaryCheck);


        if (dispatcher.getUnsavedChangesState()) summaryCheck();
                
//        // reset change memory var on submit
//        jQuery('#edbtn__save').click(
//            function() {
//                window.onbeforeunload = '';
//                textChanged = false;
//            }
//        );
//        jQuery('#edbtn__preview').click(
//            function() {
//                window.onbeforeunload = '';
//                textChanged = false;
//                window.keepDraft = true; // needed to keep draft on page unload
//            }
//        );

        dw_editor.init();
    }
    
    var res = function(params){
        ready(function(){
            var toolbar = window[params.varName];
            if(toolbar && params.toolbarId && params.wikiTextId){
                //initToolbar('tool__bar','wiki__text', toolbar);
                initToolbar(params.toolbarId,params.wikiTextId, toolbar);
                jQuery('#'+params.toolbarId).attr('role', 'toolbar');
            }

            setChangesControl();
        });
    };
    return res;
});

