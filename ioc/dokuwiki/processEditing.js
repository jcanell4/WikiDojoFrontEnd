define([           
    "ioc/wiki30/dispatcherSingleton"
    ,"dojo/dom"
    ,"dojo/on"
    ,"dojo/query"
    ,"dijit/focus"
    ,"dojo/ready"
    ,"dojo/dom-geometry"
    ,"dojo/dom-style"
], function(dispatcher, dom, on, query, focus, ready, geometry, style){
    /**
    * Activate "not saved" dialog, add draft deletion to page unload,
    * add handlers to monitor changes
    *
    * Sets focus to the editbox as well
    */
   function setChangesControl(editFormId, wikiTextId, summaryId){
        var editform = dom.byId(editFormId);
        if (!editform) {
            return;
        }

        var edit_text = dom.byId(wikiTextId);
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
            window.textChanged=true;
            dispatcher.setUnsavedChangesState(true);
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

        var summary = dom.byId(summaryId);
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
    
    function cleanHtmlEdition(id, wikiTextId, editBarId, licenseClass){
        var aText = new Array();
        var node = dom.byId(id);
        var child = node.firstChild;
        while(child!=null){
            if(child.nodeType == Node.ELEMENT_NODE){
                var tag = child.tagName.toLowerCase();
                if(tag!=="div" && tag!=="script"){
                    var toDelete = child;
                    child = child.nextSibling;
                    node.removeChild(toDelete);
                    aText.push(toDelete);
                }else{
                    child = child.nextSibling;
                }
            }else{
                child = child.nextSibling;
            }
        }
        child = dom.byId(editBarId);
        style.set(child, "visibility", "hidden");
//        child.style.visibility = "hidden";
        
        query("."+licenseClass, node).forEach(function(child){
            aText.push(child);
            node = child.parentNode;
            node.removeChild(child);
        });
        
        node  = dom.byId(dispatcher.infoNodeId);
        node.innerHTML="";
        for(var i in aText){
            node.appendChild(aText[i]);
        }
        
        var contentNode = dom.byId(id);
        var h = geometry.getContentBox(contentNode).h;
        style.set(wikiTextId, "height", ""+h-20+"px" );
        style.set(wikiTextId, "resize", "vertical" );
    }
    
    var res = function(params){
        ready(function(){
            var toolbar = window[params.varName];
            if(toolbar && params.toolbarId && params.wikiTextId){
                //initToolbar('tool__bar','wiki__text', toolbar);
                initToolbar(params.toolbarId,params.wikiTextId, toolbar);
                jQuery('#'+params.toolbarId).attr('role', 'toolbar');
            }

            setChangesControl(params.editFormId, params.wikiTextId, 
                                params.summaryId);
            cleanHtmlEdition(params.id, params.wikiTextId, params.editBarId, 
                                params.licenseClass);
            dw_locktimer.init(params.timeout, params.draft);
        });
    };
    return res;
});

