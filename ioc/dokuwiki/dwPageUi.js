define([
     "dojo/dom-class"
    ,"dojo/dom-form"
    ,"dojo/dom"
    ,"dojo/query"
], function(domClass, domForm, dom, query){
    var ret = {
        getAllSectionNodes: function(node){
            /*
             * Retorna un array dels nodes de la secció, des del node "pare" H1 fins al darrer node
             */
            var arrNodes = new Array();
            var tagName = "DIV";
            var className = "secedit";

            var ps = this.getFirstSectionNode(node);
            var i = 0;
            while (ps){
                if (ps.nodeType === ps.ELEMENT_NODE) {
                    arrNodes[i++]=ps;
                }
                if (ps.tagName && ps.tagName.toUpperCase() === tagName && domClass.contains(ps, className)) {
                    break;  //Hem arribat al node inicial de la secció
                }
                ps = ps.nextSibling;
            }
            return arrNodes;
        }

        ,getFirstSectionNode: function(node){
            /*
             * Retorna el node "pare" H1 de la secció del node que inicia el procés
             */
            var ps = node;
            while (ps) {
                if (ps.nodeType === ps.ELEMENT_NODE) {
                    if (ps.tagName.charAt(0) === "H" && ps.className.indexOf("sectionedit") >= 0) {
                        break;  //hem arribat al node Head
                    }
                }
                ps = ps.previousSibling;
            }
            return ps;
        }
       ,getIdSectionNode: function(node){
            return this.getFirstSectionNode(node).id;
       }
       ,getFormQueryToEditSection: function(/*String*/ id ){
           var ret="";
           var lastNode = this.getLastSectionNode(dom.byId(id));
           if(lastNode){
               ret = domForm.toQuery(query("form", lastNode)[0]);
           }
           return ret;
       }
       ,getLastSectionNode: function(node){
            /*
             * Retorna el darrer node de la secció del node que inicia el procés
             */
            var tagName = "DIV";
            var className = "secedit";
            
            var ps = node;
            while (ps){
                if (ps.tagName && ps.tagName.toUpperCase() === tagName && domClass.contains(ps, className)) {
                    break;  //Hem arribat al darrer node de la secció
                }
                ps = ps.nextSibling;
            }
            return ps;
        }
       ,getElementWhithNodeId: function(node,typeId){
            /*
             * Donat un node, retorna el node (tipus element) que coincideix amb typeId
             */
            /*
             * TODO Si no el troba, no para
             */

            var ps = node.firstChild;
            while (ps){
                if(ps.hasChildNodes()){
                    ps = ps.firstChild;
                }else{
                    var pt = ps.nextSibling;
                    if(pt){
                        ps = pt;
                    }else{
                        ps = ps.parentNode;
                        ps = ps.nextSibling;
                    }
                }
                if(ps){
                    if (ps.nodeType === ps.ELEMENT_NODE) {
                        if (ps.tagName && ps.tagName.toUpperCase() === typeId){
                            break;
                        } 
                        
                    }
                    
                }
            }
            return ps;
        }
       ,getElementParentNodeId: function(nodeId, typeId){
            /*
             * Donat un Id d'element, retorna l'element pare que coincideix amb typeId
             */
            /*
             * TODO Si no el troba, no para
             */
            var ps = null;
            if(dom.byId(nodeId)){
                ps = dom.byId(nodeId);
                if ((ps.nodeType === ps.ELEMENT_NODE) && (ps.tagName && ps.tagName.toUpperCase() === typeId)) {                    
                                             
                }else{
                    while (ps){
                        ps = ps.parentElement;
                        if(ps){
                            if (ps.nodeType === ps.ELEMENT_NODE) {
                                if (ps.tagName && ps.tagName.toUpperCase() === typeId){
                                    break;
                                }                         
                            }                    
                        }
                    }                    
                }                    
            }
            return ps;
        }

//      ,sectionHighlight: function() {
//        
//        jQuery('form.btn_secedit')
//            .mouseover(function(){
//                var $tgt = jQuery(this).parent(),
//                    nr = $tgt.attr('class').match(/(\s+|^)editbutton_(\d+)(\s+|$)/)[2],
//                    $highlight = jQuery(),                                             // holder for elements in the section to be highlighted
//                    $highlightWrap = jQuery('<div class="section_highlight"></div>');  // section highlight wrapper
//
//                // Walk the dom tree in reverse to find the sibling which is or contains the section edit marker
//                while($tgt.length > 0 && !($tgt.hasClass('sectionedit' + nr) || $tgt.find('.sectionedit' + nr).length)) {
//                    $tgt = $tgt.prev();
//                    $highlight = $highlight.add($tgt);
//                }
//              // insert the section highlight wrapper before the last element added to $highlight
//              $highlight.filter(':last').before($highlightWrap);
//              // and move the elements to be highlighted inside the section highlight wrapper
//              $highlight.detach().appendTo($highlightWrap);
//            })
//            .mouseout(function(){
//                // find the section highlight wrapper...
//                var $highlightWrap = jQuery('.section_highlight');
//                // ...move its children in front of it (as siblings)...
//                $highlightWrap.before($highlightWrap.children().detach());
//                // ...and remove the section highlight wrapper
//                $highlightWrap.detach();
//            });
//        } 
//       ,highlight: function(){
//           
//       }
    };
    return ret;
});




