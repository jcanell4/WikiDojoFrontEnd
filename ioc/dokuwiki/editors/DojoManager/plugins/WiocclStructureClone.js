// Aquesta classe és un wrapper per les estructures wioccl enviades des del servidor que incluen
// les funcions per gestionar-les i modificar-les des del plugin per Dojo Editor DojoWioccl i DojoWiocclDialog
define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/DojoManager/plugins/WiocclStructureBase',
], function (declare, WiocclStructureBase) {

    // cas pels dialeg principal, clona la estructura original per no modificar-la
    return declare([WiocclStructureBase], {


        constructor: function (config) {

            this.setStructure(config.structure, config.root);

        },

        setStructure: function(structure, root) {

            // console.log("setStructure:", structure);

            this.structure = JSON.parse(JSON.stringify(structure));

            // Ajustem l'arrel
            this.structure['0'].open = '';
            this.structure['0'].type = 'root';
            this.structure['0'].close = '';

            // siblings és un array d'ids de nodes temporals afegits
            this.siblings = [];
            this.root =root;

        }

    });
});
