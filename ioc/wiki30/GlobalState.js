define([
	"dojo/_base/declare"
], function(declare, lang){
    var ret = declare("ioc.wiki30.GlobalState", [], {
        pages: {}        //[{pageId: {ns, mode, action}}]
        ,defaultPage:{}  //{ns, mode}
        ,login: false
        ,info: ""
        ,currentTabId: null
        ,currentSectionId: null
        ,sectok: null
        ,title: ""
        ,currentSection: function(node) {
            if (typeof(node) == "String") {  //recibido directamente el id
                this.currentSectionId = node;
            }
            else {
                var tagName = node.nodeName.charAt(0).toUpperCase();
                switch(tagName) {
                    case 'H': 
//                      var tag = document.getElementsByTagName(node.nodeName)[0];
//                      this.currentSectionId = tag.getAttribute("id");
                        this.currentSectionId = node.id;
                        break;
                    case 'D':
                        var tag = document.getElementsByTagName(node.nodeName)[0];
                        var ps = node.previousSibling;
                        break;
                }
            }
        }
    });
    return ret;
});
