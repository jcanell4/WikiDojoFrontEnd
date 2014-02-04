define([
	/*"dojo/_base/declare"
    ,*/"dojo/_base/lang"
    ,"ioc/dokuwiki/dwPageUi"
], function(/*declare,*/ lang, dwPageUi){
//    var ret = declare("ioc.wiki30.GlobalState", [], {
    var ret = {
        pages: {}        //{[pageId]: {ns, mode, action}}
        ,login: false
        ,info: ""
        ,currentTabId: null
        ,currentSectionId: null
        ,sectok: null
        ,title: ""
        ,setCurrentSectionId: function(node) {
            if (lang.isString(node))   //recibe directamente el id
                this.currentSectionId = node;
            else 
                this.currentSectionId = dwPageUi.getIdSectionNode(node);
        }
        ,getCurrentSectionId: function() {
            return this.currentSectionId;
        }
        ,pagesLength: function(){
            return Object.keys(this.pages).length
        }  
        ,newInstance: function(p){
            var instance = Object.create(this);
            lang.mixin(instance, p);
            return instance;            
        }
        
       ,__ImprimirObjeto: function (o, nom) {
            var salida = nom + '\n\n';
            for (var p in o) {
                salida += '• ' + p + ': ' + o[p] + '\n\n';
            }
            alert(salida);
        }
    };
//    });
    return ret;
});
