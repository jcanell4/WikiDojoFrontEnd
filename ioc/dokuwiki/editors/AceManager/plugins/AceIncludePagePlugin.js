define([
    'dojo/_base/declare',
    'dijit/registry',
    'dojo/dom',
    'dojo/dom-construct',
    'dijit/Dialog',
    'dijit/layout/BorderContainer',
    'dijit/layout/ContentPane',
    'dijit/form/Form',
    'dijit/form/TextBox',
    'dijit/form/Button',
    "ioc/gui/NsTreeContainer",
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin',
    "dojo/string"
], function (declare,registry,dom,domConstruct,Dialog,
             BorderContainer,ContentPane,Form,TextBox,Button,
             NsTreeContainer,AbstractAcePlugin,string) {

    return declare([AbstractAcePlugin], {

        init: function (args) {
            this.template = args.template;
            this.title = args.title;

            var config = JSON.parse(JSON.stringify(args));
            if (args.icon.indexOf(".png") === -1) {
                config.icon = "/iocjslib/ioc/gui/img/" + args.icon + ".png";
            }
            this.addButton(config, this.process);
            this.enabled = true;
        },

        _getEditor: function () {
            var dispatcher = this.editor.dispatcher;
            var id = dispatcher.getGlobalState().getCurrentId();
            var contentTool = dispatcher.getContentCache(id).getMainContentTool();
            return contentTool.getCurrentEditor();
        },

        _showDialog: function () {
            var context = this;
            var ed = this._getEditor();
            var selectedPage = {};
            var dialog = registry.byId("includePageSyntaxDocumentDlg");

            if (!dialog){
                dialog = new Dialog({
                    id: "includePageSyntaxDocumentDlg",
                    title: "Cerca de la pàgina a incloure",
                    style: "width: 510px; height: 350px;",
                    page: ed.id
                });

                dialog.on('hide', function () {
                    dialog.destroyRecursive(false);
                    domConstruct.destroy("includePageSyntaxDocumentDlg");
                });

                dialog.on('show', function () {
                    dialog.dialogTree.tree.set('path', '');
                });

                //Creació del marc contenidor del diàleg
                var bc = new BorderContainer({
                    style: "height: 300px; width: 490px;"
                });

                // create a ContentPane as the left pane in the BorderContainer
                var cpEsquerra = new ContentPane({
                    region: "left",
                    style: "width: 220px"
                });
                bc.addChild(cpEsquerra);

                // create a ContentPane as the right pane in the BorderContainer
                var cpDreta = new ContentPane({
                    region: "right",
                    style: "width: 210px"
                });
                bc.addChild(cpDreta);

                // put the top level widget into the document, and then call startup()
                bc.placeAt(dialog.containerNode);

                //L'arbre de navegació a la banda esquerra del quadre.
                var divizquierda = domConstruct.create('div', {
                    className: 'izquierda'
                },cpEsquerra.containerNode);

                var dialogTree = new NsTreeContainer({
                    treeDataSource: 'lib/exe/ioc_ajaxrest.php/ns_tree_rest/',
                    onlyDirs: false,
                    hiddenProjects: false
                }).placeAt(divizquierda);
                dialogTree.startup();

                dialog.dialogTree = dialogTree;

                dialogTree.tree.onClick=function(item) {
                    if (item.type === "f") {
                        selectedPage.id = item.id;
                        selectedPage.name = item.name;
                        dom.byId('textBoxPagesList').value = item.id;
                    }
                };

                // Un formulari a la banda dreta contenint:
                var divdreta = domConstruct.create('div', {
                    className: 'dreta'
                },cpDreta.containerNode);

                var form = new Form({id:"formIncludeSyntaxDialog"}).placeAt(divdreta);

                //Un camp de text per inclore la ruta de la pàgina
                var divPagesList = domConstruct.create('div', {
                    className: 'divPagesList'
                },form.containerNode);

                domConstruct.create('label', {
                    innerHTML: 'Pàgina seleccionada<br>'
                },divPagesList);

                var PagesList = new TextBox({
                    id: 'textBoxPagesList',
                    name: 'PagesList',
                    readOnly: true,
                    style: 'width: 100%;'
                }).placeAt(divPagesList);
                dialog.textBoxPagesList = PagesList;


                // ----- Botons generals del formulari ------
                var botons = domConstruct.create('div', {
                    className: 'botons',
                    style: "text-align:center;margin-top:20px;"
                },form.containerNode);

                domConstruct.create('label', {
                    innerHTML: '<br>'
                }, botons);

                new Button({
                    label: 'Acceptar',
                    onClick: function(){
                        dialog.hide();
                        context.insert(selectedPage.id);
                    }
                }).placeAt(botons);

                new Button({
                    label: 'Cancel·lar',
                    onClick: function(){dialog.hide();}
                }).placeAt(botons);

                form.startup();
            }
            dialog.show();
            return false;
        },

        _processFull: function () {
            this._showDialog();
        },

        insert: function (value) {
            var data = {id: value};
            this.editor.session.insert(this.editor.editor.getCursorPosition(), string.substitute(this.template, data));
        }

    });

});