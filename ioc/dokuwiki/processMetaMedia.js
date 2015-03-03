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
        var requestMedia = new Request();
        requestMedia.urlBase = "/dokuwiki_30/lib/plugins/ajaxcommand/ajax.php?call=media";
        requestMedia.updateSectok=function(sk){
            this.sectok=sk;
        };
        
        on(domNode, 'li:click', function(e){
            alert("hola");
            alert(this.id);
            setCurrentElement(this);
            alert(dispatcher.getGlobalState().getCurrentElementId().id);
            //NOTA EL A TAMPOC TE ID està dins de href a la variable ns (no a la variable id)
            //query='id='+params.fromId +'&image=' + params.imageId+'&img='+params.imageId+'&do=media';
            elid="fp:dam:m03:u1:a2";
            query='id='+elid+'&do=media';
            
            requestMedia.sendRequest(query);
            event.stop(e); 
        });

        
        if(dispatcher.getGlobalState().getCurrentElementId()){
            var node = dwPageUi.getElementParentNodeId(dispatcher.getGlobalState().getCurrentElementId(),"LI")
            toggleClass(node, "section_selected", true);
        }
        
    };
    return res;
});



