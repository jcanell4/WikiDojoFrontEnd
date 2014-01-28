define([
     "dojo/_base/declare"
    ,"ioc/wiki30/dispatcherSingleton"
], function(declare, dispatcher){
    var ret = declare("ioc.dokuwiki.dwPageUi", [], {
        sectionHighlight: function() {
        
        jQuery('form.btn_secedit')
            .mouseover(function(){
                var $tgt = jQuery(this).parent(),
                    nr = $tgt.attr('class').match(/(\s+|^)editbutton_(\d+)(\s+|$)/)[2],
                    $highlight = jQuery(),                                             // holder for elements in the section to be highlighted
                    $highlightWrap = jQuery('<div class="section_highlight"></div>');  // section highlight wrapper

                // Walk the dom tree in reverse to find the sibling which is or contains the section edit marker
                while($tgt.length > 0 && !($tgt.hasClass('sectionedit' + nr) || $tgt.find('.sectionedit' + nr).length)) {
                    $tgt = $tgt.prev();
                    $highlight = $highlight.add($tgt);
                }
              // insert the section highlight wrapper before the last element added to $highlight
              $highlight.filter(':last').before($highlightWrap);
              // and move the elements to be highlighted inside the section highlight wrapper
              $highlight.detach().appendTo($highlightWrap);
            })
            .mouseout(function(){
                // find the section highlight wrapper...
                var $highlightWrap = jQuery('.section_highlight');
                // ...move its children in front of it (as siblings)...
                $highlightWrap.before($highlightWrap.children().detach());
                // ...and remove the section highlight wrapper
                $highlightWrap.detach();
            });
        } 
       ,highlight: function(){
           
       }
    });
    return ret;
});




