define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/DojoManager/plugins/WiocclStructureBase',
], function (declare, WiocclStructureBase) {

    // cas pels dialeg principal, clona la estructura original per no modificar-la
    return declare([WiocclStructureBase], {


        constructor: function (config, dispatcher) {
            this.setStructure(config.structure, config.root);
            this.dispatcher = dispatcher;
        },

        setStructure: function (structure, root) {
            this.structure = JSON.parse(JSON.stringify(structure));

            // Ajustem l'arrel
            this.structure['0'].open = '';
            this.structure['0'].type = 'root';
            this.structure['0'].close = '';

            this.root = root;
        }

    });
});
