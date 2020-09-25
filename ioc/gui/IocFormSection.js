define([
    "dojo/_base/declare",
    "dijit/registry",
    "dojo/dom",
    "dojo/dom-construct",
    "dijit/form/TextBox",
    "dijit/form/ComboBox",
    "ioc/gui/NsTreeContainer",
    "dojo/store/JsonRest",
    "dijit/form/Form",
    "ioc/wiki30/Request",
    "ioc/gui/ButtonToListen",
    "ioc/functions/normalitzaCaracters"
], function (declare, registry, dom, domConstruct, TextBox, ComboBox, NsTreeContainer, JsonRest, Form, Request, Button, normalitzaCaracters) {
    /**
     * IocFormSection
     * @culpable Rafael
     */
    return declare ("ioc.gui.IocFormSection", [Form, Request], {
        
        getProjectCreateElementsDialog: function (id, params) {
            var formId = "form_"+id;
            var dialogParams = {
                id: id,
                ns: params.dialogParams.ns,
                urlBase: params.dialogParams.urlBase,
                title: "Creació d'un nou element de projecte",
                message: "Selecciona l'element a crear i omple les dades corresponents.",
                width: "410px",
                closable: true,
                sections: [
                    {'widget': this._getDialogTree(params.dialogParams.treeDataSource, params.dialogParams.fromRoot, reactClick)},
                    {'widget': this._getForm(formId, params.dialogParams, params.formParams)}
                ],
                buttons: [
                    {
                        id: "create_new_element",
                        description: "Acceptar",
                        buttonType: 'default',
                        callback: _submitDialogForm(dialogParams.sections[1].widget, params.dialogParams)
                    },
                    {
                        id: "cancel_new_element",
                        buttonType: 'cancel'
                    }
                ]
            };

            var reactClick = function(item) {
                registry.byId('textBoxEspaiNoms').set('value', item.id);
                registry.byId('textBoxEspaiNoms').focus();
            };

            var _submitDialogForm = function (w, params) {
                var query, k;
                var separacio = (w.value.EspaiNoms !== '') ? ':' : '';
                for (k in w.value) {
                    w.value[k] = normalitzaCaracters(w.value[k]);
                } 

                if (w.value.NouProjecte) {
                    query = params.call_project + 
                            '&id=' + w.value.EspaiNoms + separacio + w.value.NouProjecte +
                            '&projectType=' + w.value.SelectProjecte +
                            '&nsParent=' + params.ns +
                            '&projectTypeParent=' + params.projectType;
                }
                else if (w.value.NouDocument) {
                    var item = registry.byId("comboSelectTemplate").item;
                    var nsTemplate = item ? "&template="+item.path : "";

                    query = params.call_document + 
                            '&id=' + w.value.EspaiNoms + separacio + w.value.NouDocument +
                            '&espai=' + w.value.EspaiNoms +
                            '&nsProject=' + params.ns +
                            '&projectType=' + params.projectType +
                            nsTemplate;
                }
                else if (w.value.NovaCarpeta) {
                    query = params.call_folder + 
                            '&id=' + w.value.EspaiNoms + separacio + w.value.NovaCarpeta +
                            '&nsProject=' + params.ns +
                            '&projectType=' + params.projectType;
                }
                if (query) {
                    w.action = query;
                    w.urlBase = params.urlBase;
                    w.sendRequest(query);
                }
            };
            
            var dialogBuilder = new DialogBuilder(dialogParams);
            return dialogBuilder;
        },
        
        _getDialogTree: function (treeDataSource, fromRoot, reactClick) {
            var dialogTree = new NsTreeContainer({
                        treeDataSource: treeDataSource,
                        onlyDirs: true,
                        hiddenProjects: false,
                        expandProject: true,
                        fromRoot: fromRoot
                });
            dialogTree.tree.onClick = reactClick;
            return dialogTree;
        },
        
        _getForm: function(formId, params, formParams) {
            var path = [];
            
            var dialog = {
                default: function () {
                    dialog.dialogTree.tree.collapseAll();   //contrae el árbol
                    //Elimina los valores de los inputs
                    if (params.call_project) {
                        registry.byId(dialog.comboProjectes).set('value', "");
                        registry.byId(dialog.textBoxNouProjecte).set('value', "");
                    }
                    if (params.call_document) {
                        registry.byId(dialog.comboTemplates).set('value', null);
                        registry.byId(dialog.textBoxNouDocument).set('value', "");
                    }
                    //por defecto, oculta todos los DIV's
                    if (params.call_project) {
                        dom.byId('id_divSelectProjecte').hidden = true;
                        dom.byId('id_divNouProjecte').hidden = true;
                    }
                    if (params.call_document) {
                        dom.byId('id_divSelectTemplate').hidden = true;
                        dom.byId('id_divNouDocument').hidden = true;
                    }
                    if (params.call_folder) {
                        dom.byId('id_divNovaCarpeta').hidden = true;
                    }
                },

                show_documet: function () {
                    dialog.default();
                    //Muestra los DIV que se necesitan para la creación de un nuevo documento
                    dom.byId('id_divSelectTemplate').hidden = false;
                    dom.byId('id_divNouDocument').hidden = false;
                },

                show_folder: function () {
                    dialog.default();
                    //Muestra los DIV que se necesitan para la creación de una nueva carpeta
                    dom.byId('id_divNovaCarpeta').hidden = false;
                },

                show_project: function () {
                    dialog.default();
                    //Muestra los DIV que se necesitan para la creación de una nuevo proyecto
                    dom.byId('id_divSelectProjecte').hidden = false;
                    dom.byId('id_divNouProjecte').hidden = false;
                },
                
                nsActivePage: function (){
                    path.length=0;
                    var stPath = "";
                    var aPath = params.ns;
                    aPath = aPath.split(':');
                    aPath.pop();
                    aPath.unshift("");
                    for (var i=0; i<aPath.length; i++) {
                        if (i > 1) {stPath = stPath + ":";}
                        stPath = stPath + aPath[i];
                        path[i] = stPath;
                    }
                },

                setDefaultDocumentName: function(n,o,e) {
                    registry.byId(dialog.textBoxNouDocument).set('value', e);
                    registry.byId(dialog.textBoxNouDocument).focus();
                }

            };
            
            dialog.nsActivePage();
            
            var dialogTree = this._getDialogTree(params.treeDataSource);
            dialog.dialogTree = dialogTree;

            var form = new Form();
            form.id = formId;
            
            //ESPAI DE NOMS Un camp de text per poder escriure l'espai de noms
            dialog.textBoxEspaiNoms = this._createDivTextBox("EspaiNoms", false, params.ns || "", form, formParams.EspaiDeNomsLabel);

            if (params.call_project) {
                //DIV PROJECTE conté la selecció de Projectes
                dialog.comboProjectes = this._createComboBox("SelectProjecte", form, formParams.ProjectesLabel, "", params.urlListProjects);
                dialog.comboProjectes.startup();

                //DIV NOU PROJECTE: Un camp de text per poder escriure el nom del nou projecte (hidden/visible)
                dialog.textBoxNouProjecte = this._createDivTextBox("NouProjecte", true, "", form, formParams.NouProjecteLabel);
            }

            if (params.call_document) {
                //DIV PLANTILLA: Selecció de plantilla
                dialog.comboTemplates = this._createComboBox("SelectTemplate", form, formParams.TemplatesLabel, "", params.urlListTemplates);
                dialog.comboTemplates.startup();
                dialog.comboTemplates.watch('value', dialog.setDefaultDocumentName );
                this.documentTemplateList = dialog.comboTemplates;

                //DIV NOU DOCUMENT: Un camp de text per escriure el nom del nou document (hidden/visible)
                dialog.textBoxNouDocument = this._createDivTextBox("NouDocument", true, "", form, formParams.NouDocumentLabel);
            }

            if (params.call_folder) {
                //DIV NOVA CARPETA: Un camp de text per escriure el nom de la nova carpeta
                dialog.textBoxNovaCarpeta = this._createDivTextBox("NovaCarpeta", true, "", form, formParams.NovaCarpetaLabel);
            }

            this._createEmptyDiv("name", form, "");
            
            if (params.call_folder) {
                //botó Carpeta
                new Button({
                    id: "ButtonFolder",
                    label: "carpeta",
                    onClick: function(){dialog.show_folder();}
                }).placeAt(form.containerNode);
            }

            if (params.call_document) {
                //botó Document
                new Button({
                    id: "ButtonDocument",
                    label: "document",
                    onClick: function(){dialog.show_documet();}
                }).placeAt(form.containerNode);
            }

            if (params.call_project) {
                //botó Projecte
                new Button({
                    id: "ButtonProject",
                    label: "project",
                    onClick: function(){dialog.show_project();}
                }).placeAt(form.containerNode);
            }
            
            form.startup();
            
            return form;
        },
        
        //Crea un DIV con un elemento de formulario HTML "input='text'" acompañado de un elemento "label"
        _createDivTextBox: function(name, hidden, value, container, label) {
            //Label
            var div = domConstruct.create("div", {id:"id_div"+name, hidden:hidden, style:"margin-bottom:10px;"}, container.containerNode);
            domConstruct.create("label", {innerHTML: label+"<br>"}, div);
            //TextBox
            var tex = new TextBox({
                    id: "textBox"+name,
                    name: name,
                    value: value,
                    placeHolder: label
                }).placeAt(div);
            return tex;
        },
        
        //Crea un DIV con un elemento de formulario HTML "select" acompañado de un elemento "label"
        _createComboBox: function(name, container, label, value, urlList) {
            //Label
            var div = domConstruct.create("div", {id:"id_div"+name, hidden:true, style:"margin-bottom:10px;"}, container.containerNode);
            domConstruct.create("label", {innerHTML: label+"<br>"}, div);
            //ComboBox
            var combo = new ComboBox({
                    id: "combo"+name,
                    placeHolder: label,
                    name: name,
                    value: value,
                    searchAttr: 'name',
                    store: new JsonRest({target: urlList})
                }).placeAt(div);
            return combo;
        },
        
        //Crea un elemento DIV que contiene un "label" (que puede estar vacío)
        _createEmptyDiv: function(name, container, label) {
            //Label
            var div = domConstruct.create("div", {id:"id_div"+name}, container.containerNode);
            domConstruct.create("label", {innerHTML: label+'<br>'}, div);
            return div;
        },
        
        //Obtención directa del contenido item de un ComboBox
        _getItemComboBox: function(widget, name) {
            var item;
            for (var i=0; i<widget._descendants.length; i++) {
                if (widget._descendants[i].name === name) {
                    item = widget._descendants[i].item;
                    break;
                }
            }
            return item;
        }
    
    });
    
});
