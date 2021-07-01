// Aquesta classe és un wrapper per les estructures wioccl enviades des del servidor que incluen
// les funcions per gestionar-les i modificar-les des del plugin per Dojo Editor DojoWioccl i DojoWiocclDialog
define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/DojoManager/plugins/WiocclStructureBase',
], function (declare, WiocclStructureBase) {

    // cas pels subdialegs
    return declare([WiocclStructureBase], {


        constructor: function (config) {

            this.structure = {
                "0": {
                    "type": "temp",
                    "value": "",
                    "attrs": "",
                    "open": "",
                    "close": "",
                    "id": "0",
                    "children": [],
                },
                next: "1",
                temp: true,
                siblings: []
            };

            this.root = "0";

            // console.log("this.structure:", this.structure);
        },

        setStructure: function(structure) {
            alert("Check!, s'estableix en algún moment per les structures temporals?");
            this.structure = structure;
        },

        // Sembla que la única diferència era el setData i ara això no es fa aqui
        // parseWioccl: function (text, wioccl) {
        //     // console.log(text, outRoot, outStructure);
        //     let outTokens = this._tokenize(text);
        //
        //     if (wioccl.parent) {
        //         this._removeChildren(wioccl.id);
        //
        //         // ALERTA! un cop eliminat els fills cal desvincular també aquest element, ja que s'afegirà automàticament al parent si escau
        //         let found = false;
        //
        //         for (let i = 0; i < this.structure[wioccl.parent].children.length; i++) {
        //
        //             // Cal tenir en compte els dos casos (chidlren com id o com nodes) ja que un cop es fa
        //             // a un update tots els childrens hauran canviat a nodes
        //             if (this.structure[wioccl.parent].children[i] === wioccl.id || this.structure[wioccl.parent].children[i].id === wioccl.id) {
        //                 // console.log("eliminat el ", wioccl.id, " de ", structure[wioccl.parent].children, " per reafegir-lo");
        //                 this.structure[wioccl.parent].children.splice(i, 1);
        //                 wioccl.index = i;
        //                 found = true;
        //                 break;
        //             }
        //         }
        //
        //         // perquè passa això de vegades?
        //         if (!found) {
        //             console.error("no s'ha trobat aquest node al propi pare");
        //             console.log(structure, wioccl);
        //             alert("node no trobat al pare");
        //         }
        //
        //         if (text.length === 0) {
        //
        //             if (Number(wioccl.id) === Number(this.root)) {
        //                 alert("L'arrel s'ha eliminat, es mostrarà la branca superior.");
        //                 // si aquest és el node arrel de l'arbre cal actualitzar l'arrel també
        //                 this.root = wioccl.parent;
        //             } else {
        //                 alert("La branca s'ha eliminat.");
        //             }
        //
        //             wioccl = this.structure[wioccl.parent];
        //             outTokens = [];
        //         }
        //     }
        //
        //
        //     this._createTree(wioccl, outTokens);
        //
        //     return wioccl;
        //
        // },

        _createTree(root, outTokens) {
            // if (root.type === 'temp') {
            //     // cal eliminar els childs perquè es tornaran a afegir
            //     // ALERTA! no posar true el removeNode (3r param) perquè eliminarà els nodes
            //     // del document!
                this._removeChildren(root.id);
            //     // root.children = [];
            // }
            this.inherited(arguments);
        }
    });
});
