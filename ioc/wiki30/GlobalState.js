define([
	"dojo/_base/declare" // declare
], function(declare, lang){
    var ret = declare("ioc.wiki30.GlobalState", [], {
        pages: {} //[{pageId: {ns, mode, action}}]
       ,defaultPage:{} //{ns, mode}
       ,login: false
       ,info: ""
       ,currentTabId: null
       ,sectok: null
       ,title: ""
    });
    return ret;
});
