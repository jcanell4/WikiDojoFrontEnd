define([
    "dojo/Stateful",
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/dom",
    "dojo/dom-prop",
], function (Stateful, declare, domConstuct, dom, domProp) {
    return declare([Stateful],
        /**
         * Embolcall per manipular un editor ace.
         *
         * @class Editor
         * @extends dojo.Stateful
         * @author Josep Cañellas<jcanell4@ioc.cat>
         */
        {
            
            /** @type {boolean} @private */
            hasPrefix: false,
            
            /** @type {string} @private */
            containerId: null,
            
            /** @type {Element} @private */
            editorNode: null,
            
            /**
             *
             * @param {AceWrapper} aceWrapper
             * @param {DokuWrapper} dokuWrapper
             */
            constructor: function (id, editorNode) {
                this.containerId = id;
                this.setEditorNode(editorNode);
            },
            
             /** @param {ElementCollection | Element | id} editorNode*/
            setEditorNode: function(editorNode){
                if(typeof editorNode==="string"){
                    this.editorNode = domConstuct.create("div", {innerHTML: editorNode});
                }else if(typeof (editorNode.length) === "undefined"){
                    this.editorNode = editorNode;
                }else{
                    this.editorNode = domConstuct.create("div");
                    for(var i=0; i<editorNode.length; i++){
                        domConstuct.place(editorNode[i], this.editorNode);
                    }
                }
            },
            
            select: function(){
                domConstuct.place(this.editorNode, this.containerId);
                this._removePrefixId();
            },

    
            unselect: function(){
                var container = dom.byId(this.containerId);
                while(container.hasChildNodes()){
                    container.removeChild(container.firstChild);
                }
                this._addPrefixId();
            },
            
            getEditorNode: function(){
                return this.editorNode;
            },
            
            _addPrefixId: function(){
                var queue = new Array()
                queue.push(this.editorNode);
                while(queue.length>0){
                    var elem = queue.shift();
                    var children = elem.children;
                    for(var i=0; i<children.length; i++){
                        queue.push(children[i]);
                    }
                    if(elem.id){
                        if(typeof elem.id === "string"){
                            var newId = this.containerId
                                    + "_"
                                    + elem.id;
                            domProp.set(elem, "id", newId)
                        }else if(elem.tagName=="FORM"){
                            domProp.set(elem, "id", this.containerId + "_dw__editform")
                        }
                    }
                }
                this.hasPrefix=true;
            },

            _removePrefixId: function(){
                if(!this.hasPrefix){
                    return;
                }
                var queue = new Array()
                queue.push(this.editorNode);
                while(queue.length>0){
                    var elem = queue.shift();
                    var children = elem.children;
                    for(var i=0; i<children.length; i++){
                        queue.push(children[i]);
                    }
                    if(elem.id){
                        if(typeof elem.id === "string"){
                            var newId = elem.id.substr(this.containerId.length+1);
                            domProp.set(elem, "id", newId)
                        }else if(elem.tagName=="FORM"){
                            domProp.set(elem, "id", "dw__editform")
                        }
                    }
                }
                this.hasPrefix=false;
            }
        });
});

