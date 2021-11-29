define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/DojoManager/plugins/WiocclStructureBase',
], function (declare, WiocclStructureBase) {

    // cas pels subdialegs
    return declare([WiocclStructureBase], {


        constructor: function (config, dispatcher) {

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
        },

        _createTree(root, outTokens) {
            this._removeChildren(root.id);
            this.inherited(arguments);
        }
    });
});
