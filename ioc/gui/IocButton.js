/* 
 * Declara un Botó que realitza la funció indicada en un atribut
 * també canvia el tamany de fixe a variable segons el contenidor
 */
define(["dojo/_base/declare"
        ,"dijit/form/Button"
        ,"dijit/_TemplatedMixin"
        ,"dojo/text!./templates/Button.html"
        ,"ioc/gui/IocResizableComponent"
        ,"dojo/_base/lang"
],
function(declare, button, _TemplatedMixin, template, IocComponent, dojoBase) {
    // module:
    //		ioc/gui/IocButton

    var ret = declare("ioc.gui.IocButton", [button, _TemplatedMixin, IocComponent], 
	{
	    templateString: template
            ,query: ""
            ,clickListener:null
            ,_onClick: function(evt){
                    this.inherited(arguments);
                    if(this.clickListener){
                        for(var i in this.clickListener){
                            if(dojoBase.isFunction(this.clickListener[i])){
                                this.clickListener[i](evt);
                            }else if(dojoBase.isObject(this.clickListener[i])){
                                this.clickListener[i].process(evt);
                            }
                        }
                    }
                    this.sendRequest(this.getQuery());
            }
            ,startup: function(){
                    this.inherited(arguments);
                    this.nodeToResize = this.buttonNode;
                    this.topNodeToResize = this.buttonTopNode;
                    this.resize();
                    this.__setVisible();
            }
            ,getQuery: function(){
                return this.query;
            }
            ,addClickListener:function(/*function or object*/ listener){
                var key = 'autoKey'
                key = key + Object.keys(this.clickListener).length;
                return this.putClicListener(key, listener);
            }            
            ,putClickListener:function(/*String*/key,
                                        /*function or object*/ listener){
                if(!this.clickListener){
                    this.clickListener={};                    
                }
                this.clickListener[key]=listener;
            }
	});
	return ret;
});
