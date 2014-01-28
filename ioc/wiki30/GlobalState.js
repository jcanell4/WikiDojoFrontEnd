define([
	"dojo/_base/declare"
    ,"dojo/dom-class"
    ,"dojo/_base/lang"
], function(declare, classe, lang){
    var ret = declare("ioc.wiki30.GlobalState", [], {
        pages: {}        //[{pageId: {ns, mode, action}}]
        ,defaultPage:{}  //{ns, mode}
        ,login: false
        ,info: ""
        ,currentTabId: null
        ,currentSectionId: null
        ,sectok: null
        ,title: ""
        ,setCurrentSectionId: function(node) {
            
//            this.__ImprimirObjeto(node, "node.className : "+node.className + " -- node.tagName : "+node.tagName);
            
            if (lang.isString(node)) {  //recibe directamente el id
                this.currentSectionId = node;
            }
            else {
//              if (node.hasChildNodes()) {
//                  var childNodes = node.children;
//                  this.__ImprimirObjeto(childNodes, "childNodes_node_children");
//              }
                    
                var ltagName = node.tagName.charAt(0).toUpperCase();
                var lclassName = node.className;
                
                switch(ltagName) {
                    case 'H': //H1, H2
                        alert("node.id : "+node.id + "\n\nnode.tagName : "+node.tagName + "\n\nnode.className : "+node.className);
                        if (lclassName.indexOf("sectionedit") >= 0)
                            this.currentSectionId = node.id;
                        break;
                    case 'D': //DIV
                        alert("node.id : "+node.id + "\n\nnode.tagName : "+node.tagName + "\n\nnode.className : "+node.className);
                        var ps = null;
                        if (lclassName.indexOf("level") >= 0) { //DIV 1
                            ps = node.previousSibling;
                            ps = ps.previousSibling;
                        }
                        if (classe.contains(node,"secedit editbutton_section")){ //DIV 2
                            ps = node.previousSibling;
                            ps = ps.previousSibling;
                            ps = ps.previousSibling;
                            ps = ps.previousSibling;
                        }
                        alert("ps.id : "+ps.id);
                        this.currentSectionId = ps.id;
                        this.__ImprimirObjeto(this, "globalState");
                        break;
                }
            }
        }
       ,__ImprimirObjeto: function (o, nom) {
            var salida = nom + '\n\n';
            for (var p in o) {
                salida += '• ' + p + ': ' + o[p] + '\n\n';
            }
            alert(salida);
        }
    });
    return ret;
});
