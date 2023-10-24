define([
     "dojo/on"
    ,"dojo/dom"
    ,"dojo/_base/event"
    ,"ioc/dokuwiki/dwPageUi"
    ,"dojo/dom-class"
    ,"ioc/wiki30/dispatcherSingleton"
    ,"dojo/dom-attr"
], function(on, dom, event, dwPageUi, domClass, getDispatcher, att){

    var dispatcher = getDispatcher();

    console.error("Check, des de on s'ha afegit el processMediaList?");

    let listenerdblclick = null;
    let listenerclick = null;

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

        // Si s'han assignat els eliminem per evitar que es dupliquin
        if (listenerdblclick) {
            listenerdblclick.remove();
        }

        if (listenerclick) {
            listenerclick.remove();
        }

        //JSINFO.id=params.ns;

        var domNode = dom.byId(id);

        listenerdblclick = on(domNode, 'li:dblclick', function(e){
            var eventManager = dispatcher.getEventManager();
            var elid = dwPageUi.getElementWhithNodeId(this,"DL").title;
            var q ={
                dataToSend:'id=' + elid + '&image=' + elid + '&img=' + elid + '&do=media'
            };
            eventManager.fireEvent(eventManager.eventName.MEDIA_DETAIL, q);
        });

        listenerclick = on(domNode, 'li:click', function(e){
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



