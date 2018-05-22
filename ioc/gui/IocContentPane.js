define([
    "dojo/_base/declare", // declare
    "dojo/dom-construct",
    "dojo/dom-style",
    "dijit/layout/ContentPane",
    "ioc/gui/IocResizableComponent"

], function(declare, domConstruct, domStyle, ContentPane, IocComponent) {
    return declare("ioc.gui.IocContentPane", [ContentPane, IocComponent],
    {
        buttons:null,
        _toolBars:null,
        startup: function(){
            this.inherited(arguments);
            for(var i=0; this.buttons && i<this.buttons.length; i++){
                this._addButton(this.buttons[i].ambClass, this.buttons[i].position, this.buttons[i].buttonParams);
            }
        },
        _addButton: function(amdButton, buttonPos, buttonParams){
            if(buttonParams.class){
                buttonParams.class += " contentPaneButton";
            }else{
                buttonParams.class = "contentPaneButton";
            }
            var self = this;
            if(this._toolBars==null){
                var domNodeComputedStyle = domStyle.getComputedStyle(this.domNode);
                var topLeftNode = domConstruct.toDom("<div style='position: absolute; top: 2px; left: 2px; display: block; z-index: 1000'></div>");
                var topRightNode = domConstruct.toDom("<div style='position: absolute; top: 2px; left: "+domNodeComputedStyle.width+"px; display: block; z-index: 1000'></div>");
                var bottomLeftNode = domConstruct.toDom("<div style='position: absolute; top: "+domNodeComputedStyle.height+"px; left: 2px; display: block; z-index: 1000'></div>");
                var bottomRightNode = domConstruct.toDom("<div style='position: absolute; top: "+domNodeComputedStyle.height+"px; left: "+domNodeComputedStyle.width+"px; display: block; z-index: 1000'></div>");
                domConstruct.place(topLeftNode, this.domNode);
                this._toolBars = {topLeft:topLeftNode, topRight:topRightNode, bottomLeft:bottomLeftNode, bottomRight: bottomRightNode};
            }
            require([amdButton], function(Button){
                var button = new Button(buttonParams);
                if(buttonPos=='topLeft'){
                    domConstruct.place(button.domNode, self._toolBars.topLef);
                }else if(buttonPos=='topRight'){
                    domConstruct.place(button.domNode, self._toolBars.topRight);
                }else if(buttonPos=='bottomLeft'){
                    domConstruct.place(button.domNode, self._toolBars.bottomLeft);
                }else if(buttonPos=='bottomRight'){
                    domConstruct.place(button.domNode, self._toolBars.bottomRight);
                }
            });
        }
    });
});
