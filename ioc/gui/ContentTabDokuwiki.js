define([
	"dojo/_base/declare", // declare
        "dojo/dom",
        "dojo/on",
        "dojo/dom-attr",
        "dojo/_base/event",
        "dojo/request",
        "ioc/dokuwiki/runRender",
        "ioc/dokuwiki/listHeadings",
        "dijit/Dialog",
        "dijit/layout/ContentPane",
        "dijit/_WidgetsInTemplateMixin"
       ,"dojo/NodeList-dom" // NodeList.style
], function(declare, dom, on, att, event, request, runRender, listHeadings, 
                Dialog, ContentPane, _WidgetsInTemplateMixin){
    var ContentTabDokuwiki= declare("ioc.gui.ContentTabDokuwiki", 
                                    [ContentPane, _WidgetsInTemplateMixin], {
	// summary:
        //		Conveteix enllaços normals en crides AJAX).
 
//        url: "lib/plugins/ajaxcommand/ajax.php?call=page",
//        containerNodeId:"bodyContent",
        
    });
    return ContentTabDokuwiki;
});


