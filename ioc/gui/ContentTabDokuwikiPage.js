define([
	"dojo/_base/declare" // declare
       ,"dojo/on"
       ,"dojo/dom-attr"
       ,"dojo/_base/event"
       ,"dijit/layout/ContentPane"
       ,"ioc/wiki30/Request"
       ,"dojo/NodeList-dom" // NodeList.style
], function(declare, on, att, event, ContentPane, Request){
    var ret = declare("ioc.gui.ContentTabDokuwikiPage"
                              ,[ContentPane, Request], {
	// summary:
        //Conveteix enllaços normals en crides AJAX).
 
        startup: function(){
		this.inherited(arguments);
                /*TO DO: */
                var q=null;
                var tab = this;
                on(this.domNode, "a:click", function(e){
                    var arr = att.get(this, "href").split("?");
                    if(arr.length>1){
                        q=arr[1];
                    }
                    tab.sendRequest(q);
                    event.stop(e);
                });
	}
    });
    return ret;
});
