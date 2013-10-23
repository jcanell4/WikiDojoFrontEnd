define([
	"dojo/_base/declare" // declare
       ,"dojo/_base/lang"
], function(declare, lang){
    var ret = declare("ioc.wiki30.ConfigurableByState", [], {
        getState: null
       ,setState: null
       ,startup:function(){
           this.inherited(arguments);
           if(!lang.isFunction(this.getState)){
               throw new Error("Error getState no definit");
           }else if(lang.isFunction(this.setState)){
               throw new Error("Error setState no definit");
           }
       }
    });
    return ret;
});


