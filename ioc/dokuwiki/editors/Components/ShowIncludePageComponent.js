define([
    'dojo/_base/declare',
    'dojo/cookie',
    'ioc/dokuwiki/editors/Components/AbstractIocComponent',
    'dijit/registry',
    'dojo/dom',
    'dojo/dom-construct',
    'dojo/string',
    'dijit/Dialog',
    'dijit/layout/BorderContainer',
    'dijit/layout/ContentPane',
    'dijit/form/Form',
    'dijit/form/TextBox',
    "dijit/form/CheckBox",
    'dijit/form/Button',
    'ioc/gui/NsTreeContainer',
], function (declare, cookie, AbstractIocComponent, registry,
             dom, domConstruct, string, Dialog, BorderContainer, ContentPane,
             Form, TextBox, CheckBox, Button, NsTreeContainer) {

    return declare([AbstractIocComponent], {

        // constructor: function (context) {
        //     this.context = context;
        // },

        show: function (editor, callback) {
            // var context = this;
            // var editor = this.getEditor();
            var selectedPage = {};
            var dialog = registry.byId("includePageSyntaxDocumentDlg");

            if (!dialog) {
                dialog = new Dialog({
                    id: "includePageSyntaxDocumentDlg",
                    title: "Cerca de la pàgina a incloure",
                    style: "width: 510px; height: 350px;",
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
                }, cpEsquerra.containerNode);

                var dialogTree = new NsTreeContainer({
                    treeDataSource: 'lib/exe/ioc_ajaxrest.php/ns_tree_rest/',
                    onlyDirs: false,
                    hiddenProjects: true
                }).placeAt(divizquierda);
                dialogTree.startup();

                dialog.dialogTree = dialogTree;

                dialogTree.tree.onClick = function (item) {
                    if (item.type === "f") {
                        selectedPage.id = item.id;
                        selectedPage.name = item.name;
                        dom.byId('textBoxPageName').value = item.id;
                    }
                };

                // Un formulari a la banda dreta contenint:
                var divdreta = domConstruct.create('div', {
                    className: 'dreta'
                }, cpDreta.containerNode);

                var form = new Form({id: "formIncludeSyntaxDialog"}).placeAt(divdreta);

                //Un camp de text per inclore la ruta de la pàgina
                var divPageName = domConstruct.create('div', {
                    className: 'divPageName'
                }, form.containerNode);

                domConstruct.create('label', {
                    innerHTML: 'Pàgina seleccionada<br>'
                }, divPageName);

                var PageName = new TextBox({
                    id: 'textBoxPageName',
                    name: 'PageName',
                    readOnly: true,
                    style: 'width: 100%;'
                }).placeAt(divPageName);
                dialog.textBoxPageName = PageName;

                //Checkbox 'mostrar data de creació'
                var divMostrarDataCrea = domConstruct.create('div', {
                    className: 'divMostrarDataCrea'
                }, form.containerNode);

                var MostrarDataCrea = new CheckBox({
                    id: 'chkMostrarDataCrea',
                    value: 'date',
                    checked: false
                }).placeAt(divMostrarDataCrea);
                dialog.chkMostrarDataCrea = MostrarDataCrea;

                domConstruct.create('label', {
                    innerHTML: ' mostrar la data de creació'
                }, divMostrarDataCrea);

                //Checkbox 'amagar Dates'
                var divAmagarDates = domConstruct.create('div', {
                    className: 'divAmagarDates'
                }, form.containerNode);

                var AmagarDates = new CheckBox({
                    id: 'chkAmagarDates',
                    value: 'nomdate',
                    checked: false
                }).placeAt(divAmagarDates);
                dialog.chkAmagarDates = AmagarDates;

                domConstruct.create('label', {
                    innerHTML: ' amagar data de modificació'
                }, divAmagarDates);

                // ----- Botons generals del formulari ------
                var botons = domConstruct.create('div', {
                    className: 'botons',
                    style: "text-align:center;margin-top:20px;"
                }, form.containerNode);

                domConstruct.create('label', {
                    innerHTML: '<br>'
                }, botons);

                new Button({
                    label: 'Acceptar',
                    onClick: function () {
                        if (!dialog.chkMostrarDataCrea.checked && dialog.chkAmagarDates.checked) {
                            dialog.chkAmagarDates.value = dialog.chkAmagarDates.value + "&no" + dialog.chkMostrarDataCrea.value;
                        }
                        dialog.hide();
                        var response = selectedPage.id;
                        registry.toArray().forEach(function (widget) {
                            if (widget.type === 'checkbox' && widget.checked === true) {
                                response += "&" + widget.value;
                            }
                        });
                        callback(response);
                        // context.insert(response);
                    }
                }).placeAt(botons);

                new Button({
                    label: 'Cancel·lar',
                    onClick: function () {
                        dialog.hide();
                    }
                }).placeAt(botons);

                form.startup();
            }
            dialog.show();
            return false;
        }

    });
});