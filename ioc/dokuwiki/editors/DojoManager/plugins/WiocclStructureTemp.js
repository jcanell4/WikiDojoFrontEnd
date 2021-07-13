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
                next: 0,
                temp: true
            };

            let node = this.createNode('temp');
            this.addNode(node);

            this.root = node.id;

            if (this.root !== '0') {
                console.log("Error, el primer element de la estructura ha de tenir id 0");
            }

            // console.log("estructura temporal");

            // console.log("this.structure:", this.structure);
        },

        setStructure: function (structure, root) {
            alert("Check!, s'estableix en algún moment per les structures temporals?");
            this.structure = structure;
            this.root = root;
            this.siblings = [];
        },


        _createTree(root, outTokens) {

            this._removeChildren(root.id);

            this.inherited(arguments);
        }
    });
});
