define([
    'dojo/_base/declare',
    'dojo/cookie',
    'ioc/dokuwiki/editors/Components/AbstractIocComponent',
    'dijit/registry',
    "dojo/on",
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
], function (declare, cookie, AbstractIocComponent, registry, on,
             dom, domConstruct, string, Dialog, BorderContainer, ContentPane,
             Form, TextBox, CheckBox, Button, NsTreeContainer) {

    var request;

    require(["ioc/wiki30/Request"], function (Request) {
        request = new Request({urlBase: "lib/exe/ioc_ajax.php?call=get_toc_page"});
    });

    return declare([AbstractIocComponent], {

        show: function (editor, callback, canBeHighlighted) {
            var selectedPage = {};
            var dialog = registry.byId("includePageSyntaxDocumentDlg");

            if (!dialog) {
                dialog = new Dialog({
                    id: "includePageSyntaxDocumentDlg",
                    title: "Cerca de la secció d'una pàgina a incloure",
                    style: "height: 410px; width: 540px;",
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
                    style: "height: 360px; width: 520px;"
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
                    style: "height: 360px; width: 260px;"
                });
                bc.addChild(bcDreta);

                // ContentPane a la part superior del BorderContainer
                var cpTop = new ContentPane({
                    region: "top",
                    style: "height:125px; width:245px"
                });
                bcDreta.addChild(cpTop);

                // ContentPane a la part inferior del BorderContainer
                var cpBottom = new ContentPane({
                    region: "bottom",
                    style: "height:185px; width:245px"
                });
                bcDreta.addChild(cpBottom);

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
                        request.dataToSend = {id: item.id};
                        request.sendRequest();
                    }
                };

                // Un espai a la banda dreta alta per contenir el resultat de la petició de TOC:
                domConstruct.create('div', {
                    id: 'idTocArea',
                    className: 'divTocArea'
                }, cpTop.containerNode);

                request.responseHandler = function (data) {
                    this._stopStandby();
                    dom.byId('idTocArea').innerHTML = data.htmlTOC;
                };

                var getTocAreaHandler = on(document, "#idTocArea a:click", function (evt) {
                    selectedPage.section = selectedPage.id + "#" + evt.target.innerText;
                    dom.byId('textBoxPageSectionName').value = selectedPage.section;
                    // ALERTA[Xavi] perquè es treia el handler? si es treu un cop hem fet
                    // clic en un element ja no podem canviar-lo i no s'actualiza el
                    // input. Pendent de valorar si realment és necessari.
                    // getTocAreaHandler.remove();
                });

                // Creació del formulari
                var divdretabaixa = domConstruct.create('div', {
                    className: 'dretabaixa'
                }, cpBottom.containerNode);

                var form = new Form({id: "formIncludeSyntaxDialog"}).placeAt(divdretabaixa);

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

                //Checkbox 'amagar Títol'
                var divAmagarTitol = domConstruct.create('div', {
                    className: 'divAmagarTitol'
                }, form.containerNode);

                var AmagarTitol = new CheckBox({
                    id: 'chkAmagarTitol',
                    value: 'noheader',
                    checked: false
                }).placeAt(divAmagarTitol);
                dialog.chkAmagarTitol = AmagarTitol;

                domConstruct.create('label', {
                    innerHTML: ' amagar Títol'
                }, divAmagarTitol);

                //Checkbox 'amagar Apartats'
                var divAmagarApartats = domConstruct.create('div', {
                    className: 'divAmagarApartats'
                }, form.containerNode);

                var AmagarApartats = new CheckBox({
                    id: 'chkAmagarApartats',
                    value: 'firstsectiononly',
                    checked: false
                }).placeAt(divAmagarApartats);
                dialog.chkAmagarApartats = AmagarApartats;

                domConstruct.create('label', {
                    innerHTML: ' amagar Subapartats'
                }, divAmagarApartats);


                //Un camp de text per inclore la ruta de la pàgina#secció
                var divPageSectionName = domConstruct.create('div', {
                    className: 'divPageSectionName'
                }, form.containerNode);

                domConstruct.create('label', {
                    innerHTML: '<br>Pàgina i secció seleccionades'
                }, divPageSectionName);

                var PageSectionName = new TextBox({
                    id: 'textBoxPageSectionName',
                    name: 'PageSectionName',
                    readOnly: true,
                    style: 'width: 100%;'
                }).placeAt(divPageSectionName);
                dialog.textBoxPageSectionName = PageSectionName;

                let divMostrarHighlight = domConstruct.create('div', {
                    className: 'divMostrarHighlight'
                }, form.containerNode);

                let mostrarHighlight = new CheckBox({
                    id: 'chkMostrarHighlight',
                    value: 'highlight',
                    checked: false,
                    ignored: true
                }).placeAt(divMostrarHighlight);
                dialog.chkMostrarHighlight = registry.byId('chkMostrarHighlight');

                domConstruct.create('label', {
                    innerHTML: ' afegir ressaltat'
                }, divMostrarHighlight);

                // ----- Botons generals del formulari ------
                var botons = domConstruct.create('div', {
                    className: 'botons',
                    style: "text-align:center;margin-top:10px;margin-bottom:0;"
                }, form.containerNode);

                new Button({
                    label: 'Acceptar',
                    onClick: function () {
                        if (!dialog.chkMostrarDataCrea.checked && dialog.chkAmagarDates.checked) {
                            dialog.chkAmagarDates.value = dialog.chkAmagarDates.value + "&no" + dialog.chkMostrarDataCrea.value;
                        }
                        dialog.hide();

                        let response;

                        if (selectedPage.section) {
                            response = selectedPage.section + "&";
                        } else {
                            response = dom.byId('textBoxPageSectionName').value;
                        }

                        registry.toArray().forEach(function (widget) {
                            if (widget.type === 'checkbox' && widget.checked === true && !widget.ignored) {
                                response += widget.value + "&";
                            }
                        });
                        response = response.replace(/&?$/, ""); //elimina el '&' del final
                        // callback(response);
                        callback(response, dialog.chkMostrarHighlight.get('checked'));
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
        },

        setValue: function (value, checked) {
            dom.byId('textBoxPageSectionName').value = value;
            registry.byId('chkMostrarHighlight').set('checked', checked);
        }

    });
});