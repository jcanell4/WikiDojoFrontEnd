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
                temp: true
            };

            this.root = "0";

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
