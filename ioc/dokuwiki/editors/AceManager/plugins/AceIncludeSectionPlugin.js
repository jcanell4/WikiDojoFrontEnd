define([
    "dojo/_base/declare",
    "dijit/registry",
    "dojo/on",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/string",
    "dijit/Dialog",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/form/Form",
    "dijit/form/TextBox",
    "dijit/form/Button",
    "ioc/gui/NsTreeContainer",
    "ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin"
], function (declare,registry,on,dom,domConstruct,string,Dialog,BorderContainer,ContentPane,Form,TextBox,Button,
             NsTreeContainer,AbstractAcePlugin) {

    var request;

    require(["ioc/wiki30/Request"], function(Request) {
        request = new Request({urlBase: "lib/exe/ioc_ajax.php?call=get_toc_page"});
    });

    var ret = declare([AbstractAcePlugin], {

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

        // _getEditor: function () {
        //
        //     var id = this.dispatcher.getGlobalState().getCurrentId();
        //     var contentTool = this.dispatcher.getContentCache(id).getMainContentTool();
        //     return contentTool.getCurrentEditor();
        // },

        _showDialog: function () {
            var self = this;
            var editor = this.getEditor();
            var selectedPage = {};
            var dialog = registry.byId("includePageSyntaxDocumentDlg");

            if (!dialog){
                dialog = new Dialog({
                    id: "includePageSyntaxDocumentDlg",
                    title: "Cerca de la secció d'una pàgina a incloure",
                    style: "width: 540px; height: 350px;",
                    page: editor.id
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
                    style: "height: 300px; width: 520px;"
                });

                // create a ContentPane as the left pane in the BorderContainer
                var cpEsquerra = new ContentPane({
                    region: "left",
                    style: "width: 220px"
                });
                bc.addChild(cpEsquerra);

                //Creació del marc de la dreta
                var bcDreta = new BorderContainer({
                    region: "right",
                    style: "height: 300px; width: 260px;"
                });
                bc.addChild(bcDreta);

                // ContentPane a la part superior del BorderContainer
                var cpTop = new ContentPane({
                    region: "top",
                    style: "height:180px; width:245px"
                });
                bcDreta.addChild(cpTop);

                // ContentPane a la part inferior del BorderContainer
                var cpBottom = new ContentPane({
                    region: "bottom",
                    style: "height:70px; width:245px"
                });
                bcDreta.addChild(cpBottom);

                // put the top level widget into the document, and then call startup()
                bc.placeAt(dialog.containerNode);

                //L'arbre de navegació a la banda esquerra del quadre.
                var divizquierda = domConstruct.create('div', {
                    className: 'izquierda'
                },cpEsquerra.containerNode);

                var dialogTree = new NsTreeContainer({
                    treeDataSource: 'lib/exe/ioc_ajaxrest.php/ns_tree_rest/',
                    onlyDirs: false,
                    hiddenProjects: true
                }).placeAt(divizquierda);
                dialogTree.startup();

                dialog.dialogTree = dialogTree;

                dialogTree.tree.onClick = function(item) {
                    if (item.type === "f") {
                        selectedPage.id = item.id;
                        request.dataToSend = {id: item.id};
                        request.sendRequest();
                    }
                };

                // Un espai a la banda dreta alta per contenir el resultat de la petició de TOC:
                domConstruct.create('div', {
                    id: 'idTocArea',
                    className: 'divTocArea'
                },cpTop.containerNode);

                request.responseHandler = function (data) {
                    this._stopStandby();
                    dom.byId('idTocArea').innerHTML = data.htmlTOC;
                };
                
                var getTocAreaHandler = on(document, "#idTocArea a:click", function(evt){
                    selectedPage.section = selectedPage.id + "#" + evt.target.innerText;
                    dom.byId('textBoxPageSectionName').value = selectedPage.section;
                    getTocAreaHandler.remove();
                });

                // Creació del formulari
                var divdretabaixa = domConstruct.create('div', {
                    className: 'dretabaixa'
                },cpBottom.containerNode);

                var form = new Form({id:"formIncludeSyntaxDialog"}).placeAt(divdretabaixa);

                //Un camp de text per inclore la ruta de la pàgina#secció
                var divPageSectionName = domConstruct.create('div', {
                    className: 'divPageSectionName'
                },form.containerNode);

                domConstruct.create('label', {
                    innerHTML: 'Pàgina i secció seleccionada'
                },divPageSectionName);

                var PageSectionName = new TextBox({
                    id: 'textBoxPageSectionName',
                    name: 'PageSectionName',
                    readOnly: true,
                    style: 'width: 100%;'
                }).placeAt(divPageSectionName);
                dialog.textBoxPageSectionName = PageSectionName;


                // ----- Botons generals del formulari ------
                var botons = domConstruct.create('div', {
                    className: 'botons',
                    style: "text-align:center;margin-top:10px;margin-bottom:0;"
                },form.containerNode);

                new Button({
                    label: 'Acceptar',
                    onClick: function(){
                        dialog.hide();
                        self.insert(selectedPage.section);
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
            var innerEditor = this.getInnerEditor();
            innerEditor.session.insert(innerEditor.cursor_position(), string.substitute(this.template, data));
        }

    });
    return ret;

});
