define([
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dijit/layout/ContentPane"
], function(declare, domConstruct, ContentPane) {
    return declare("ioc.gui.IocContentPane", [ContentPane],
    {
        /* buttons es un array de botones. cada elemento del array contiene:
            'amdClass': nom de la classe, 
            'position': contiene 1 valor a elegir entre: topLeft, topRight, bottomLeft, bottomRight, 
            'buttonParams': objeto con los parámetros del tipo de botón */
        buttons: null,
        _toolBars: null,

        postStartup: function(){
            for(var i=0; this.buttons && i<this.buttons.length; i++){
                this._addButton(this.buttons[i].amdClass, this.buttons[i].position, this.buttons[i].buttonParams);
            }
        },
        
        _addButton: function(amdButton, buttonPos, buttonParams){
            if (this._toolBars === null){
                var htmlDIV = "<div style='position:absolute; top:2px; left:2px; display:block; z-index:1000'></div>";
                //La posició real s'estableix amb el métode onResize de Contentool.js
                var topLeftNode = domConstruct.toDom(htmlDIV);
                var topRightNode = domConstruct.toDom(htmlDIV);
                var bottomLeftNode = domConstruct.toDom(htmlDIV);
                var bottomRightNode = domConstruct.toDom(htmlDIV);

                this._toolBars = {topLeft:topLeftNode, topRight:topRightNode, bottomLeft:bottomLeftNode, bottomRight:bottomRightNode};
                
                domConstruct.place(topLeftNode, this.domNode); 
                domConstruct.place(topRightNode, this.domNode); 
                domConstruct.place(bottomLeftNode, this.domNode); 
                domConstruct.place(bottomRightNode, this.domNode); 
            }
            
            var self = this;
            if (buttonParams.class){
                buttonParams.class += " contentPaneButton";
            }else{
                buttonParams.class = "contentPaneButton";
            }
            
            require([amdButton], function(Button){
                var button = new Button(buttonParams);
                if (buttonPos==='topLeft'){
                    domConstruct.place(button.domNode, self._toolBars.topLeft);
                }else if(buttonPos==='topRight'){
                    domConstruct.place(button.domNode, self._toolBars.topRight);
                }else if(buttonPos==='bottomLeft'){
                    domConstruct.place(button.domNode, self._toolBars.bottomLeft);
                }else if(buttonPos==='bottomRight'){
                    domConstruct.place(button.domNode, self._toolBars.bottomRight);
                }
            });
        }
    });
});
