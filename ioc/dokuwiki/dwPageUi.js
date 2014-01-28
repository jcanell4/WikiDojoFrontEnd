define([
     "dojo/_base/declare"
    ,"ioc/wiki30/dispatcherSingleton"
], function(declare, dispatcher){
    var ret = declare("ioc.dokuwiki.dwPageUi", [], {
        getAllSectionNodes: function(node){
            /*
             * Retorna un array de nodes, des del node "pare" H1 fins al node que inicia el procés
             */
            var ps = node;
            var arrNodes = new Array();
            var tagName = node.tagName;
            var className = node.className;

            while (ps) {
                if (ps.nodeType === ps.ELEMENT_NODE) {
                    if (ps.tagName.charAt(0) === "H" && ps.className.indexOf("sectionedit") >= 0) {
                        break;  //Hem arribat al node Head
                    }
                }
                ps = ps.previousSibling;
            }

            var i = 0;
            while (ps){
                if (ps.nodeType === ps.ELEMENT_NODE) {
                    arrNodes[i++]=ps;
                }
                if (ps.tagName === tagName && ps.className == className) {
                    break;  //Hem arribat al node inicial
                }
                ps = ps.nextSibling;
            }
            return arrNodes;
        }

        ,getFirstSectionNode: function(node){
            /*
             * Retorna el node "pare" H1 del node que inicia el procés
             */
            var ps = node;
            while (ps) {
                if (ps.nodeType === ps.ELEMENT_NODE) {
                    if (ps.tagName.charAt(0) === "H" && ps.className.indexOf("sectionedit") >= 0) {
                        break;
                    }
                }
                ps = ps.previousSibling;
            }
            this.__ImprimirObjeto(ps,"ps");
            return ps;
        }
       ,getIdSectionNode: function(node){
            return this.getFirstSectionNode(node).id;
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
    });
    return ret;
});




