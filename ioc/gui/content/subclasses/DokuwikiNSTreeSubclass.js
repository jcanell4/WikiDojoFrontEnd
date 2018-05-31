define([
    "dojo/_base/declare"
], function (declare) {

    return declare([], {

        constructor: function (args) {
            this.params = args;
        },

        startup: function () {
            this.inherited(arguments);
            this._createTree(this, this.params);
            
            // ejecutamos un extra de IocContentPane una vez el ContentPane se ha llenado con el NsTree
            if (this.postStartup) {
                this.postStartup();
            }
        },

        _createTree: function (context, params) {
            this.params = params;

            require(["ioc/gui/ContentTabDokuwikiNsTree"], function (ContentTabDokuwikiNsTree) {
                params.id = params.id + "_tree";
                context.tree = new ContentTabDokuwikiNsTree(params).placeAt(context);
                context.tree.startup();
            });
        },

        updateDocument: function (content) {
            // ALERTA[Xavi] El mètode refresh() de l'arbre no funciona quan es crida aquí, es perden les referencies al rootNode
            this.tree.destroyRecursive();
            this._createTree(this, content);
        }

    });

});