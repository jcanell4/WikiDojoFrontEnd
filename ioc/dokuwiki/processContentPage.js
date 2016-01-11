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
                Request, dwPageUi, domClass, getDispatcher, att){
    var dispatcher = getDispatcher();
    
    function setCurrentSection(node){
        var oldId = dispatcher.getGlobalState().getCurrentSectionId();
        dispatcher.getGlobalState().setCurrentSectionId(node); 
        setSelectedSection(node, true);
        if(oldId!==dispatcher.getGlobalState().getCurrentSectionId()){
            setSelectedSection(dom.byId(oldId), false);
        }
        dispatcher.updateFromState();
    }
    
    function toggleClass(aNodes, className, toggle){
        for(var i=0; i+1<aNodes.length; i++){
            if(toggle){
                domClass.add(aNodes[i], className);
            }else{
                domClass.remove(aNodes[i], className);
            }
        }                        
    }

    function setSelectedSection(node, selected){
        toggleClass(dwPageUi.getAllSectionNodes(node), "section_selected", selected);
    }
    
    function setHighlightSection(node, highlight){
        toggleClass(dwPageUi.getAllSectionNodes(node), "section_highlight", highlight);
    }
    
    var res = function(id, params){
        //JSINFO.id=params.ns;

        listHeadings(id);
        runRender(id);   
        runQuiz(id);
        
        var domNode = dom.byId(id);
        var requestEdita = new Request();
        requestEdita.updateSectok=function(sk){
            this.sectok=sk;
        };
        requestEdita.sectok = requestEdita.dispatcher.getSectok();
        requestEdita.dispatcher.toUpdateSectok.push(requestEdita);
        requestEdita.urlBase=params.editCommand;
        
        on(domNode, "form.btn_secedit:submit", function(e){
            //enviar  
            var query = "";
            var data;
            data = domform.toQuery(this);
            if (data){
                query = data;
            }
            requestEdita.sendRequest(query);
            event.stop(e);
        });
        
        on(domNode, 'div.secedit:click, div[class*=\"level\"]:click', function(e){
            setCurrentSection(this);
        });

        on(domNode, '*[class*=\"sectionedit\"]:click', function(e){
            setCurrentSection(this);
        });
        on(domNode, 'div.secedit:mouseover, div[class*=\"level\"]:mouseover', 
                                                                    function(e){
            setHighlightSection(this, true);
        });
        on(domNode, 'div.secedit:mouseout, div[class*=\"level\"]:mouseout', 
                                                                    function(e){
            setHighlightSection(this, false);
        });
        on(domNode, '*[class*=\"sectionedit\"]:mouseover', function(e){
            setHighlightSection(this, true);
        });
        
        on(domNode, '*[class*=\"sectionedit\"]:mouseout', function(e){
            setHighlightSection(this, false);
        });
        
        var requestImgDetail = new Request();
        requestImgDetail.updateSectok=function(sk){
            this.sectok=sk;
        };
        requestImgDetail.sectok = requestImgDetail.dispatcher.getSectok();
        requestImgDetail.dispatcher.toUpdateSectok.push(requestImgDetail);
        requestImgDetail.urlBase=params.detailCommand;

        on(domNode, 'div.imgb a.media:click, div.iocfigure a.media:click', function(e){
            var query = "";
            var arr = att.get(this, "href").split("?");
            if (arr.length > 1) {
                query = arr[1];
            }
            requestImgDetail.sendRequest(query);
            event.stop(e);            
        });
        
        if(dispatcher.getGlobalState().getCurrentSectionId()){
            var node = dom.byId(dispatcher.getGlobalState().getCurrentSectionId());
            toggleClass(dwPageUi.getAllSectionNodes(node), "section_selected", true);
        }

    };
    return res;
});



