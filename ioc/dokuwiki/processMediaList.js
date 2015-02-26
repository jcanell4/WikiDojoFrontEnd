define([
     "dojo/on"
    ,"dojo/dom"
    ,"dojo/_base/event"
    ,"dojo/dom-form"
    ,"ioc/dokuwiki/listHeadings"
    ,"ioc/dokuwiki/runRender"
    ,"ioc/dokuwiki/runQuiz" 
    ,"ioc/wiki30/Request"
    ,"ioc/dokuwiki/dwPageUi"
    ,"dojo/dom-class"
    ,"ioc/wiki30/dispatcherSingleton"
    ,"dojo/dom-attr"
], function(on, dom, event, domform, listHeadings, runRender, runQuiz, 
                Request, dwPageUi, domClass, dispatcher, att){
    
    function setCurrentElement(node){
        var oldId = dispatcher.getGlobalState().getCurrentElementId();
        dispatcher.getGlobalState().setCurrentElementId(node,"A");    
        setSelectedElement(node, true);
        if(oldId){
            if(oldId!==dispatcher.getGlobalState().getCurrentElementId()){
                setSelectedElement(dwPageUi.getElementParentNodeId(oldId,"LI"), false);
            }
        }

    }
    
    function toggleClass(node, className, toggle){
            if(toggle){
                domClass.add(node, className);
            }else{
                domClass.remove(node, className);
            }                      
    }

    function setSelectedElement(node, selected){
        toggleClass(node, "section_selected", selected);
    }
    
    
    var res = function(id, params){
        //JSINFO.id=params.ns;
        listHeadings(id);
        runRender(id);   
        runQuiz();
        
        var domNode = dom.byId(id);        
        
        on(domNode, 'li:click', function(e){
            setCurrentElement(this);
            event.stop(e); 
        });

        
        if(dispatcher.getGlobalState().getCurrentElementId()){
            var node = dwPageUi.getElementParentNodeId(dispatcher.getGlobalState().getCurrentElementId(),"LI")
            toggleClass(node, "section_selected", true);
        }
        
    };
    return res;
});



