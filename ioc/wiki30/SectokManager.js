define([
	"dojo/_base/declare" // declare
       ,"require"
], function(declare, require){
    var ret = declare("ioc.wiki30.SectokManager", [], {
        _hashSectok:new Array()
       ,defaultId:"ajax"
       ,putSectok: function (/*String*/ id, /*String*/ sectok){
           if(sectok){
                this._hashSectok[this._getId(id)]=sectok;
           }
       }
       ,removeSectok: function (/*String*/ id){
           id = this.this._getId(id);
           if(id in this._hashSectok){
                delete this._hashSectok[id];
           }
       }
       ,getSectok: function (/*String*/ id){
           return this._hashSectok[this._getId(id)];
       }
       ,_getId: function(/*String*/ id){
           if(!id){
               id=this.defaultId;
           }
           return id;
       }
    });
    return ret;
});



