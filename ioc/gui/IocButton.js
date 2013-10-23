
define([
	"dojo/_base/declare" // declare
        ,"dijit/form/Button"
        ,"ioc/wiki30/Request"
	,"dojo/NodeList-dom" // NodeList.style
], function(declare, Button, Request){
var IocButton = declare("ioc.gui.IocButton", 
                                [Button, Request], {
	// summary:
        //		Set of tabs with a menu to switch between tabs.
        //              Tabs are resized according the TabController size.
	//		Works only for horizontal tabs (either above or below 
        //		the content, not to the left or right).
       
         command:""
        ,onClick: function(){
            this.sendRequest(this.command);
        }
});

return IocButton;
});
