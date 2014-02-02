define([
	"dojo/_base/declare"
    ,"dojo/_base/lang"
    ,"ioc/dokuwiki/dwPageUi"
], function(declare, lang, dwPageUi){
//    var ret = declare("ioc.wiki30.GlobalState", [], {
    var ret = {
        pages: {}        //{[pageId]: {ns, mode, action}}
        ,defaultPage:{}  //{ns, mode}
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
