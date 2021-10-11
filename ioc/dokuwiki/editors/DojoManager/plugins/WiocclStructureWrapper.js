// Aquesta classe és un wrapper per les estructures wioccl enviades des del servidor que incluen
// les funcions per gestionar-les i modificar-les des del plugin per Dojo Editor DojoWioccl i DojoWiocclDialog
define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/DojoManager/plugins/WiocclStructureBase',
], function (declare, WiocclStructureBase) {

    // cas pels subdialegs
    return declare([WiocclStructureBase], {


        constructor: function (config, dispatcher) {

            // console.error("WiocclStructureWrapper");
            this.setStructure(config.structure, config.root);
            this.dispatcher = dispatcher;
        },

        setStructure: function(structure, root) {

            // console.log("setStructure:", structure);

            // La estructura sempre és completa, el root és el que determina quina és l'arrel de l'arbre
            this.structure = JSON.parse(JSON.stringify(structure));


            let key = Number(this.structure.next);
            this.structure.next = (key + 1) + "";
            key += "";

            let wrapper = {
                id: root,
                open : '',
                type : 'wrapper',
                close :'',
                children: [key],
                parent: this.structure[root].parent,
                attrs: ''
            }


            this.structure[root].parent = root;
            this.structure[root].id = key;
            this.structure[key] = this.structure[root];
            this.structure[root] = wrapper;

            for (let child in this.structure[key].children) {
                this.structure[child].parent = key;
            }

            // siblings és un array d'ids de nodes temporals afegits
            this.siblings = [];
            this.root = root;

        },


        _createTree(root, outTokens) {
            // console.log("_createTree, alerta! es el wrapper i NO s'està eliminant el root");

            //this._removeChildren(root.id);

            this.inherited(arguments);
        },

        canInsert: function(pos, node) {
            // console.log("Node?", node);
            // if (node.id === "0" || node.parent === "0" || node.solo) {
            //     console.warn("No es pot inserir, el node és root, fill directe o solo");
            //     return false;
            // }

            return true;
        },
    });
});
