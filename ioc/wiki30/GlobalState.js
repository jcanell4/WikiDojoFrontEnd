define([
	"dojo/_base/declare"
], function(declare, lang){
    var ret = declare("ioc.wiki30.GlobalState", [], {
        pages: {}       //[{pageId: {ns, mode, action}}]
       ,defaultPage:{}  //{ns, mode}
       ,login: false
       ,info: ""
       ,currentTabId: null
       ,currentSectionId: null
       ,sectok: null
       ,title: ""
       ,currentSection: function(node) {
           
       }
    });
    return ret;
});
