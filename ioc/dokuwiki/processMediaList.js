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
                var nodeOld = dwPageUi.getElementParentNodeId(oldId,"LI");
                if(nodeOld){
                    setSelectedElement(nodeOld, false);
                }
            }
        }
        dispatcher.updateFromState();

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

        
        var domNode = dom.byId(id);        
        
        on(domNode, 'li:click', function(e){
            var myAnchor = dwPageUi.getElementWhithNodeId(this,"A");            
            var myAnchorArray = myAnchor.id.split(".");
            var myAnchorIndex = myAnchorArray.length;
            var myMime = myAnchorArray[myAnchorIndex -1];
            var myDL = this.firstChild;           
            var myDLT= myDL.title;            
            if(myMime.toUpperCase() === "JPEG"){
                dispatcher.getGlobalState().pages["media"][myDLT] = true;
            }else{
                dispatcher.getGlobalState().pages["media"][myDLT] = false;
            }
            setCurrentElement(this);
            event.stop(e); 
        });

        
        if(dispatcher.getGlobalState().getCurrentElementId()){
            var node = dwPageUi.getElementParentNodeId(dispatcher.getGlobalState().getCurrentElementId(),"LI")
            if(node){                
                toggleClass(node, "section_selected", true);
            }

        }
        
    };
    return res;
});



