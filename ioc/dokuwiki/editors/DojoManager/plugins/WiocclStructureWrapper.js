define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/DojoManager/plugins/WiocclStructureBase',
], function (declare, WiocclStructureBase) {

    // cas pels subdialegs
    return declare([WiocclStructureBase], {

        constructor: function (config, dispatcher) {
            this.setStructure(config.structure, config.root);
            this.dispatcher = dispatcher;
        },

        setStructure: function(structure, root) {
            // La estructura sempre és completa, el root és el que determina quina és l'arrel de l'arbre
            this.structure = JSON.parse(JSON.stringify(structure));

            let key = Number(this.structure.next);
            this.structure.next = (key + 1) + "";
            key += "";

            let wrapper = {
                id: root,
                open : '',
                name: 'temporal',
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

            let children = this.structure[key].children;
            for (let child of children) {
                let childId = typeof child == "string" ? child : child.id;
                this.structure[childId].parent = key;
            }

            this.root = root;
        },

        canInsert: function(pos, node) {
            return true;
        },
    });
});
