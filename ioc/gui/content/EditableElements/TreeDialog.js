define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/_base/declare',
    'dijit/Dialog',
    'dojo/text!./templates/treeDialog.html',
    'dojo/dom-construct',
    'ioc/wiki30/manager/EventObservable',
    'ioc/wiki30/manager/EventObserver',
    'dijit/form/Button',
    'ioc/dokuwiki/editors/AceManager/toolbarManager',
    "dojo/store/Memory",
    "dijit/tree/ObjectStoreModel",
    "dijit/Tree",
    "dojo/aspect",
    "dojo/store/Observable"
], function (TemplatedMixin, WidgetsInTemplateMixin, declare, Dialog, template, domConstruct, EventObservable,
             EventObserver, Button, toolbarManager, Memory, ObjectStoreModel, Tree, aspect, Observable) {

    const UPDATE_TIME = 300; // temps en millisegons

    let AceFacade = null;

    let counter = 0;

    // Aquest és el comportament normal, no és pot editar directament, només mitjançant els botons.
    // Es pot posar com a false per testejar, o podem parametritzar-lo segons el tipus d'usuari (només avanaçats).
    const ALWAYS_LOCKED = true;

    // ALERTA! Aquestes classes no carregan correctament a la capçalera, cal fer un segon require
    require(["ioc/dokuwiki/editors/AceManager/AceEditorFullFacade"], function (AuxClass) {
        AceFacade = AuxClass;
    });

    var TreeDialog = declare("ioc.gui.CustomDialog", [Dialog, TemplatedMixin, WidgetsInTemplateMixin, EventObservable, EventObserver], {

        templateString: template,

        lastPos: null,
        lastCursor: null,
        wasFocused: null,

        startup: function () {
            this.inherited(arguments);
            this.createTree(this.data);
            let $updateButton = jQuery(this.updateButtonNode);
            let $saveButton = jQuery(this.saveButtonNode);
            let $cancelButton = jQuery(this.cancelButtonNode);

            let context = this;

            $cancelButton.on('click', function () {
                context.destroyRecursive();
            });

            // Als subdialegs no s'ha de mostrar el botó d'eliminar nodes
            let $deleteButton = jQuery(this.deleteBtnNode);

            if (!context.enabledDelete) {
                $deleteButton.prop('disabled', 'true');
            } else {
                $deleteButton.prop('disabled', '');
            }


            $saveButton.on('click', function () {
                // console.log("S'ha clicat el botó save");
                let returnValue;

                let root;
                // console.log("** BEFORE? **");

                // Alerta[Xavi] Funciona mitjançant un callback (coses de Dojo)
                context.model.getRoot(function(item) {
                    root = item;
                    // NOTA: Els childrens d'aquest root NO és corresponen amb els que es mostren!

                    // Generem la jerarquia del store des del root, consultant la jerarquia real
                    let storeTree = buildHierarchy(root);

                    // aquesta funció realitza la consulta pels fills, els childs assignats als nodes
                    // obtinguts amb store.get() no són correctes.
                    function buildHierarchy(node) {
                        let nouNode = JSON.parse(JSON.stringify(node));

                        let queryChildren = context.store.query({parent: node.id});
                        if (queryChildren.length>0) {
                            nouNode.children = [];
                        }

                        for (let i=0; i<queryChildren.length; i++) {
                            let child = buildHierarchy(queryChildren[i]);
                            nouNode.children.push(child);
                            child.parent = nouNode;
                        }

                        return nouNode;
                    }

                    // l'arrel ha de ser un objecte o un array
                    let object;
                    if (storeTree.type==='object') {
                        object = buildObject(storeTree)
                    } else if (storeTree.type==='array') {
                        object = [buildObject(storeTree)];
                    } else {
                        console.error("Error: l'arrel ha de ser un objecte o un array:", storeTree);
                    }

                    returnValue = JSON.stringify(object);

                    function buildObject(node) {
                        let value;

                        switch (node.type) {
                            case 'object':
                                // console.log("Node Object:", node);
                                value = {};
                                for (let i=0; i<node.children.length; i++) {
                                    value[node.children[i].key] = buildObject(node.children[i]);
                                }
                                break;

                            case 'array':
                                value = []
                                for (let i=0; i<node.children.length; i++) {
                                    value.push(buildObject(node.children[i]));
                                }
                                break;

                            case 'value':
                                // console.log("Node Value:", node);
                                value = node.value ? node.value : "";
                                break;
                        }

                        return value;
                    }

                });

                context.saveCallback(returnValue);
            });

            let $insertPropertyButton = jQuery(this.insertPropertyBtnNode);
            let $insertElementButton = jQuery(this.insertElementBtnNode);
            let $insertDeleteButton = jQuery(this.deleteBtnNode);
            let $moveUpButton = jQuery(this.moveUpBtnNode);
            let $moveDownButton = jQuery(this.moveDownBtnNode);



            // Iniciem els botons per inserir elements wioccl a l'editor
            $insertPropertyButton.on('click', function () {
                let nameCounter = 0;

                // Els children del selected no són vàlids, no s'actualitcen<-- provant a actualitzar-lo
                let children = context.selected.children;

                let ready = true;

                do {
                    ready = true;

                    for (let child of children) {
                        if (child.key === "nova_propietat" + nameCounter) {
                            ready = false;
                            break;
                        }
                    }

                    if (!ready) {
                        nameCounter++;
                    }


                } while (!ready);



                var childItem = {
                    name: "nova_propietat" + nameCounter,
                    id: Math.random(),
                    key: "nova_propietat" + nameCounter,
                    type: 'value'
                };

                context.addItem(childItem, context.selected);

                // Cal actualitzar el valor de context.selected perquè en afegir el child
                // ja no conté la mateixa informació que el store
                // console.log("Store", context.store.query({id: context.selected.id})[0]);

                // Actualitzem els fills del seleccionat
                context.selected.children = context.store.query({parent: context.selected.id});


            });

            $insertElementButton.on('click', function () {
                // ALERTA! Igual que a property canviant el nom de l'element
                var childItem = {
                    name: "Nou element",
                    id: Math.random(),
                    type: 'value'
                };
                context.addItem(childItem, context.selected);
            });

            $insertDeleteButton.on('click', function () {
                context.removeItem(context.selected);
            });


            $moveUpButton.on('click', function () {
                console.log("TODO: moveUp");
                context.moveBefore(context.selected);
            });

            $moveDownButton.on('click', function () {
                console.log("TODO: moveDown");
                context.moveAfter(context.selected);
                //context.removeItem(context.selected);
            });

        },

        moveBefore: function (item) {
            let treeNodes = this.treeWidget.getNodesByItem(item);
            let destinationItem = treeNodes[0].getPreviousSibling().item;

            this._moveItem(item, destinationItem)
        },

        moveAfter: function (item) {
            let treeNodes = this.treeWidget.getNodesByItem(item);
            let destinationItem = treeNodes[0].getNextSibling().item;

            this._moveItem(item, destinationItem)
        },

        // Mou el item1 a la posició de l'item 2  <-- movem l'item 2 abans de l'item 1?
        _moveItem(item1, item2) {
            let parent = this.getParentItem(item1);
            let children = this.store.getChildren(parent);

            console.log("switch item1", item1);
            console.log("switch item2", item2);
            console.log("switch parent", parent);
            console.log("children", children);


            // El parent és el mateix
            // TODO: podem obtenir el index?? <-- cercquem entre els children del parent la correspondencia amb el
            // id del item2
            let index = 0;
            for (let i = 0; i < children.length; i++) {
                if (children[i].id === item2.id) {
                    index = i;
                    break;
                }
            }

            console.warn("TODO: continuar aquí")
            // TODO: Continuar aquí, el pasteItem no funciona, mirar com estem fent la inserció i depurar
            // per veure si és possible o no afegir-lo com a índex
            // Solució pitjor: provar a eliminar tots els fills i reafegir-los
            /*
            console.log("Inserint a l'index:", index);
            this.model.pasteItem(item1, parent, parent, false, index)

             */



            this.updateFieldsAndButtons();

            // Cal actualitzar les etiquetes
            // TODO: no està funcionant!
            this.fixChildNames(parent);
            // console.log("Avisant al model: onChange", item1);
            // console.log("Avisant al model: onChildrenChange", parent, this.store.getChildren(parent));
            // this.model.onChange(item1);
            // this.model.onChildrenChange(parent, parent.children);
            //pasteItem: function(/*Item*/ childItem, /*Item*/ oldParentItem, /*Item*/ newParentItem, /*Boolean*/ bCopy, /*int?*/ insertIndex, /*Item*/ before){
        },

        updateFieldsAndButtons: function () {
            // console.log("Selected:", this.selected);
            // console.log("###UPDATING FIELDS AND BUTTONS###");
            let $insertPropertyButton = jQuery(this.insertPropertyBtnNode);
            let $insertElementButton = jQuery(this.insertElementBtnNode);
            let $insertDeleteButton = jQuery(this.deleteBtnNode);
            let $moveUpButton = jQuery(this.moveUpBtnNode);
            let $moveDownButton = jQuery(this.moveDownBtnNode);


            let disableInsertProperty = true;
            let disableInsertElement = true;
            let disableInsertDelete = true;
            let lock = false;
            let disableMoveUp = true;
            let disableMoveDown = true;

            switch (this.selected.type) {
                case 'value':
                    // console.log("Valor");
                    // Tots els botons desactivats
                    break;

                case 'object':
                    // console.log("Objecte");
                    disableInsertProperty = false;
                    break;

                case 'array':
                    // console.log("Array");
                    disableInsertElement = false;

                    // Activem els botons moveUp i moveDown només per arrays
                    // Només s'activa si hi ha previous i next respectivament

                    break;
            }

            let parent = this.getParentItem(this.selected);

            if (parent === null) {
                // Es permet afegir propietats
                disableInsertProperty = false;
                disableInsertElement = true;
                disableInsertDelete = true;
                // No permetem modificar es
                lock = true;
            } else {
                // console.log("No és root");
                disableInsertDelete = false;
            }

            $insertPropertyButton.prop('disabled', disableInsertProperty);
            $insertElementButton.prop('disabled', disableInsertElement);
            $insertDeleteButton.prop('disabled', disableInsertDelete);

            // FIELDS
            let parentType = parent ? parent.type : '';

            let valueDisabled = true;
            let propertyDisabled = true;
            let typeDisabled = false;

            // TODO: ALERTA! Aquest switch NO es pot combinar amb l'anterior??
            // O s'ha d'eliminar perquè no és correcte?? perquè mirem aqui el parent si
            // desprès es fa un switch amb el seu tipus??
            switch (this.selected.type) {
                case 'value':

                    if (parentType === 'object') {
                        propertyDisabled = false;
                    }

                    valueDisabled = false;
                    this.$label.html("");
                    break;

                case 'array':
                    if (this.selected.type === 'value') {
                        valueDisabled = false;
                    }
                    this.$label.html("Índex:");


                    break;

                case 'object':
                    this.$label.html("Propietat:");
                    propertyDisabled = false;
                    // valueDisabled = false;
                    break;
            }


            // console.log("Updating, disabled:", propertyDisabled, typeDisabled, valueDisabled);


            // Update Label

            // Determinem això
            switch (parentType) {
                case 'value':
                    // Aquest cas no s'ha de donar
                    this.$label.html("");
                    break;

                case 'array':
                    this.$label.html("Índex:");
                    propertyDisabled = true;

                    let treeNodes = this.treeWidget.getNodesByItem(this.selected);
                    if (treeNodes[0].getPreviousSibling()) {
                        disableMoveUp = false;
                    }

                    if (treeNodes[0].getNextSibling()) {
                        disableMoveDown = false;
                    }
                    break;

                case 'object':
                    this.$label.html("Propietat:");
                    break;
            }

            // console.log("property està disabled??", propertyDisabled);

            this.$value.prop('disabled', lock || valueDisabled);
            this.$property.prop('disabled', lock || propertyDisabled);
            this.$type.prop('disabled', lock || typeDisabled);


            $moveUpButton.prop('disabled', disableMoveUp);
            $moveDownButton.prop('disabled', disableMoveDown);


        },


        getParentItem: function (item) {
            // console.error("item?", item);
            let id = this.store.getIdentity(item)
            // console.log("id?", id);
            let context = this;
            let parent = this.store.query(function (element) {
                let children = context.store.getChildren(element);
                for (let i = 0; i < children.length; i++) {
                    if (children[i].id === id) {
                        return true;
                    }
                }
                return false;
            });

            return parent.length > 0 ? parent[0] : null;
        },

        show: function () {
            this.inherited(arguments);

            // this._updateEditorHeight();
            this._updateTreeHeight();
        },

        _updateTreeHeight: function () {
            let $paneContainer = jQuery(this.paneContainerNode);
            let $treeContainer = jQuery(this.treeContainerNode);
            let $detailContainer = jQuery(this.detailContainerNode);

            let height = $paneContainer.height() - 30;

            $treeContainer.css('height', height);
            let treeWidth = $treeContainer.width();
            let paneWidth = $paneContainer.width();

            $detailContainer.css('height', height);
            $detailContainer.css('width', paneWidth - treeWidth - 90);
        },

        JSONToData: function (data) {
            // Creem un clon per evitar modificar les dades originals
            let clonedData = JSON.parse(JSON.stringify(data));
            let counter = {
                count: 0
            };

            let aux = [this.dataToNode(clonedData, 'root', counter)];
            // console.log(aux);

            return aux;
        },

        dataToNode: function (data, name, counter, parent) {
            // console.log(data,name, counter.count, parent);
            // Abans de fer qualsevol canvi a les dades fem una copia per
            // no alterar el contingut original
            let clonedData;

            if (Array.isArray(data) || typeof data === 'object') {
                clonedData = JSON.parse(JSON.stringify(data));
            } else {
                clonedData = data;
            }

            // Les dades són un array
            if (Array.isArray(data)) {

                let aux = [];

                for (let i = 0; i < data.length; i++) {
                    let value;

                    if (Array.isArray(data[i])) {
                        let id = counter.count++;
                        value = {
                            id: id,
                            name: i,
                            type: 'array',
                            parent: parent,
                            children: this.dataToNode(clonedData[i], i, counter, id)
                            // children: this.dataToNode(clonedData[i], i, counter, id)
                        }
                        if (!value.children) {
                            value.children = [];
                        }

                        // Afegim els nodes com a fills, però sense atribut children
                        // <-- perquè ho vam posar així??
                        // this.dataToNode(clonedData[i], i, counter, id)
                    } else {
                        value = this.dataToNode(clonedData[i], i, counter, counter.count);
                    }

                    aux.push(value);
                }
                return aux;
            }

            // Les dades són un objecte
            if (typeof data === 'object') {
                let id = counter.count++;

                // Fem una copia de l'objecte


                let remove = [];

                let keys = Object.getOwnPropertyNames(data);

                data.children = [];

                // console.log("Cal processar l'objecte", data);

                if (keys.includes("id")) {
                    // ALERTA[Xavi] si hi ha cap node amb la propietat id es produirà un error
                    // aquesta propietat és necessaria pel store.
                    console.error("S'ha detectat una propietat duplicada, retornem");
                    alert("S'ha detectat la propietat id, això no està suportat");
                    return {
                        id: counter.count++,
                        value: " Error, S'ha detectat la propietat id, això no està suportat"
                    };
                }

                for (let i in keys) {
                    let key = keys[i];
                    let value = clonedData[key];

                    // console.log(">>>>> cal processar el valor de la propietat:", index, key, value);

                    if (Array.isArray(value)) {
                        value = {
                            id: counter.count++,
                            name: key,
                            type: 'array',
                            parent: id,
                            children: this.dataToNode(value, key, counter, id)
                        }
                    } else {
                        value = this.dataToNode(value, key, counter, id);
                    }

                    value.key = key;
                    data.children.push(value);
                    remove.push(key)


                    //console.log("Convertit atribut", keys[index], " en children");
                }

                for (let key of remove) {
                    delete data[key];
                }

                data.id = id;
                data.name = name;
                data.key = name;
                data.type = 'object';
                // data.parent = parent;

                return data;
            }


            // Les dades són un valor
            // Si el name és un nombre, es tracta d'un array, mostrem el valor en lloc de l'índex

            let node = {
                id: counter.count++,
                value: data,
                name: Number.isInteger(name) ? data : name,
                // parent: parent,
                type: 'value'
            };

            return node;

        },


        DataToJSON: function (data) {
            console.error("Alerta! això no pot ser correcte, les dades de parents/children es troben a l'store, no als nodes")
            // El primer element és el root
            // let aux = this.nodeToData(data[0]);

            // console.log("Objecte reconstruit:", aux);

            //return aux;


        },


        nodeToData: function (node) {

            alert("Alerta! això no pot funcionar, el childrens no es treuen al item si no al store");

            let result;

            switch (node.type) {
                case 'value':
                    result = node.value;
                    break;

                case 'array':
                    result = [];
                    for (let i = 0; i < node.children.length; i++) {
                        result.push(this.nodeToData(node.children[i]));
                    }
                    break;

                case 'object':
                    result = {};
                    for (let i = 0; i < node.children.length; i++) {
                        let key = node.children[i].name;
                        let value = this.nodeToData(node.children[i]);
                        value.key = key;
                        result[key] = value;
                    }
                    break;

            }

            console.log("Result:", result);

            return result;
        },

        selected: null,

        select: function (item) {
            this.selected = item;

            this.$value.val(item.value);
            this.$property.val(item.index !== undefined ? item.index : item.key);
            this.$type.val(item.type);

            this.updateFieldsAndButtons();
        },


        store: null,
        mode: null,

        addDataToStore: function (data, store, counter, parent) {
            // console.log("addDataToStore", data);

            // En principi això només es crida per l'arrel que és un node dins d'un array
            // però generalitzem per si de cas
            if (Array.isArray(data)) {
                for (let item of data) {
                    this.addDataToStore(item, store, counter, parent);
                }
                return;
            }

            let id = counter.count++;
            // console.log("Afegint data amb id", id, " i parent:", parent);


            store.put(data, {
                id: id,
                parent: parent
            });

            // console.log("Afegint data al store:", data.type, data.children);

            switch (data.type) {
                case 'array':
                case 'object':
                    for (let child of data.children) {
                        this.addDataToStore(child, store, counter, store.get(id));
                    }
                    break;
            }


        },

        // Es modifica el contingut de outArray


        createTree: function (data) {

            this.$value = jQuery(this.valueNode);
            this.$property = jQuery(this.propertyNode);
            this.$type = jQuery(this.typeNode);
            this.$label = jQuery(this.labelNode);

            // console.log("base data:", data);

            let storeData = this.JSONToData(data);
            // console.log("store data:", storeData);


            // TODO: REFER EL TEST TEST! la conversió invesrsa DataToJSON ha de retornar el mateix objecte
            // let checkJSON = this.DataToJSON(storeData);
            // console.log("rebuild data:", checkJSON);
            // Comparem els dos objectes
            // console.log("Són iguals?", JSON.stringify(data).localeCompare(JSON.stringify(checkJSON)) === 0);


            let store = new Memory({
                // Aquest mostra els nous nodes afegits amb put
                getChildren: function (object) {
                    // console.log("object del que cerquem el parent:", object);
                    return this.query({parent: object.id});
                },

                mayHaveChildren: function (item) {
                    console.log("S'ha cridat a mayHaveChildren (store)", item, item.type !== 'value');
                    // Això només es crida quan es crea l'arbre, no quan volem afegir
                    // PROVA: fer un put al store després de modificar el valor
                    // return true;
                    return item.type !== 'value';
                },
                // ALERTA[Xavi] Sobreescriptura amb la darrera versió a Github que inclou before per poder fer el
                // seguiment
                put: function (object, options) {
                    // console.log("Cridat nou put");
                    // summary:
                    //		Stores an object
                    // object: Object
                    //		The object to store.
                    // options: dojo/store/api/Store.PutDirectives?
                    //		Additional metadata for storing the data.  Includes an "id"
                    //		property if a specific id is to be used.
                    // returns: Number
                    var data = this.data;
                    var index = this.index;
                    var idProperty = this.idProperty;
                    var id = object[idProperty] = (options && "id" in options) ?
                        options.id : idProperty in object ? object[idProperty] : Math.random();
                    var defaultDestination = data.length;
                    var newIndex;
                    var previousIndex;
                    var eventType = id in index ? "update" : "add";

                    if (eventType === "update") {
                        if (options && options.overwrite === false) {
                            throw new Error("Object already exists");
                        } else {
                            previousIndex = index[id];
                            defaultDestination = previousIndex;
                        }
                    }
                    // console.log("previous index", previousIndex);

                    if (options && "before" in options) {
                        console.log("Before!");
                        if (options.before == null) {
                            newIndex = data.length;
                            if (eventType === "update") {
                                --newIndex;
                            }
                        } else {
                            newIndex = index[this.getIdentity(options.before)];
                            console.log("new index", newIndex);
                            // Account for the removed item
                            if (previousIndex < newIndex) {
                                --newIndex;
                            }
                        }
                    } else {
                        newIndex = defaultDestination;
                    }

                    if (newIndex === previousIndex) {
                        data[newIndex] = object;
                    } else {
                        if (previousIndex !== undefined) {
                            console.log("Canviant el data")
                            data.splice(previousIndex, 1);
                        }
                        data.splice(newIndex, 0, object);
                        this._rebuildIndex(previousIndex === undefined ? newIndex : Math.min(previousIndex, newIndex));

                    }

                    return id;
                },
                _rebuildIndex: function (startIndex) {
                    var data = this.data;
                    var dataLength = data.length;
                    var i;

                    startIndex = startIndex || 0;

                    for (i = startIndex; i < dataLength; i++) {
                        // console.log("Canviant ordre de " + data[i][this.idProperty] + " a " +i);
                        this.index[data[i][this.idProperty]] = i;
                    }

                    // console.log ("Index reordenats:", this.index);

                }
            });

            // Això és necessari per escoltar els canvis al store
            aspect.around(store, "put", function (originalPut) {
                return function (obj, options) {

                    if (options && options.parent) {
                        obj.parent = options.parent.id;
                    }

                    return originalPut.call(store, obj, options);
                }
            });

            store = new Observable(store);


            this.model = new ObjectStoreModel({
                store: store,
                query: {id: 0},
                mayHaveChildren: function (item) {
                    // Això només es crida quan es crea l'arbre, no quan volem afegir
                    // PROVA: fer un put al store després de modificar el valor
                    // return true;
                    return item.type !== 'value';
                },
                // ALERTA[Xavi] Això no funciona, no es pot modificar el store sobre els items perquè
                // sembla que no estan lligats els items amb el store, no s'actualitzen les referències a l'arbre
                /*
                pasteItem: function (child, oldParent, newParent, bCopy, insertIndex) {
                    // make this store available in all the inner functions
                    //var store = store;
                    // get the full oldParent object

                    // Agafem el parent actualitzat. Determinar si és necessari
                    oldParent = store.get(oldParent.id);
                    newParent = store.get(newParent.id);

                    // get the oldParent's children and scan through it find the child object
                    var oldChildren = store.getChildren(oldParent);
                    // això forma part de ES6
                    oldChildren.some(function (oldChild, i) {
                        //dojo.some(oldChildren, function (oldChild, i) {
                        // it matches if the ids match
                        if (oldChild.id == child.id) {
                            // found the child, now remove it from the children array
                            oldChildren.splice(i, 1);
                            return true; // done, break out of the some() loop
                        }
                    });
                    // do a put to save the oldParent with the modified childrens array
                    store.put(oldParent, {overwrite: true});
                    // now insert the child object into the new parent,
                    // using the insertIndex if available
                    newParent.children.splice(insertIndex || 0, 0, child);
                    // save changes to the newParent
                    store.put(newParent, {overwrite: true});

                    // TODO: Alerta, el problema pot ser que no s'afegeix el node com a parent a les options del put
                    // ni el oberwrie

                    // Actualitzem l'arbre cridant al OnChange
                    // this.onChange(child);
                    this.onChange(newParent);
                    this.onChildrenChange(newParent, store.getChildren(newParent));
                }*/

            });

            this.store = store;

            // S'han d'afegir abans d'instanciar l'arbre perquè requereix com a mínim un node
            this.addDataToStore(storeData, store, {count: 0}, null);


            let context = this;

            // let $value = jQuery(this.valueNode);
            // let $property = jQuery(this.propertyNode);
            // let $type = jQuery(this.typeNode);

            this.$value.on('input change', function () {
                // console.log("Canvis al valor");
                if (context.selected) {
                    // TODO: compte! en el cas dels elements dels arrays el nom del node és el valor!

                    let parent = context.getParentItem(context.selected);
                    let item = JSON.parse(JSON.stringify(context.selected));
                    item.value = jQuery(this).val();


                    // if (parent.type==='object') {
                    //     $property.val(item.value);
                    //     item.name = item.value;
                    // }

                    context.updateItem(item, parent);


                    // funciona: s'actualitza el valor de l'element a l'arbre
                }
            })

            this.$property.on('input change', function () {
                // console.log("Canvis al nom de la propietat");
                if (context.selected) {

                    let parent = context.getParentItem(context.selected);
                    let item = JSON.parse(JSON.stringify(context.selected));
                    item.name = jQuery(this).val();
                    item.key = jQuery(this).val();
                    context.selected = item;


                    // if (parent.type==='object') {
                    //     $value.val(item.name);
                    //     item.value = item.name;
                    // }

                    context.updateItem(item, parent);

                    // funciona: s'actualitza el valor de l'element a l'arbre
                }
            })

            this.$type.on('change', function () {
                // console.log("Canvis al tipus");
                let newValue = jQuery(this).val();

                if (context.selected) {

                    if (context.selected.type === newValue) {
                        return;
                    }


                    // TODO: compte! en el cas dels elements dels arrays el nom del node és el valor!
                    // context.selected.type = jQuery(this).val();

                    let parent = context.getParentItem(context.selected);

                    // Canviar el tipus no és suficient, perquè l'item es queda bloquejat sense el expando i no mostra els fills
                    // encara que s'afegeixen al tree, així que el  reemplacem

                    // TODO: això hauria de ser el normal, però només funciona amb un force refresh
                    // Això canvia el tipus i actualtiza el store, però no permet que s'afegeixi res


                    if (newValue === 'value') {
                        if (confirm("Es perdran les propietats o elements. Estas segur que vols canviar el tipus a 'value'?")) {
                            // descartem els fills
                            context.discardChildren(context.selected);

                            // TODO: Eliminar el expando
                            let treeNodes = context.treeWidget.getNodesByItem(context.selected);
                            // només ha de retornar 1 node
                            treeNodes[0].isExpandable = false;
                            context.selected.value = "";

                        } else {
                            // No fem cap canvi
                            jQuery(this).val(context.selected.type);
                            return;
                        }
                    } else {
                        context.selected.value = "";
                        context.$value.val("");

                        // S'ha canviat el tipus a object o array
                        if (!context.selected.children) {
                            context.selected.children = [];
                        }
                    }

                    let item = JSON.parse(JSON.stringify(context.selected));
                    item.type = jQuery(this).val();
                    context.selected = item;
                    context.updateItem(item, parent);


                }

                context.updateFieldsAndButtons();

            })

            this.treeWidget = new Tree({
                id: Date.now(),
                model: this.model,
                fields: this.fields,
                onOpenClick: true,
                showRoot: true,
                onLoad: function () {
                    // dom.byId('image').src = '../resources/images/root.jpg';
                },

                onClick: function (item) {
                    // console.log("item clicat:", item);

                    // TODO: revisar això del selected, ficar en el context.select(item)?
                    context.selectItem(item);

                    // $value.val(item.value);
                    // $property.val(item.index !== undefined ? item.index : item.key);
                    // $type.val(item.type);

                }
            });

            this.treeWidget.placeAt(this.treeContainerNode);
            this.treeWidget.startup();
        },

        selectItem: function (item) {
            this.select(item);

            this.$value.val(item.value);
            this.$property.val(item.index !== undefined ? item.index : item.key);
            this.$type.val(item.type);
        },

        discardChildren: function (item) {
            console.log("Decartant els fills de ", item);
            for (let child of this.store.getChildren(item)) {
                this.discardChildren(child);
                this.removeItem(child);
            }
        },

        removeItem: function (item) {
            // console.log("Remove item", item);

            // Probem a seleccionar un sibling
            let treeNodes = this.treeWidget.getNodesByItem(item);
            let node = treeNodes[0].getPreviousSibling() ? treeNodes[0].getPreviousSibling() : treeNodes[0].getNextSibling();

            if (!node) {
                // Seleccionem el parent
                // No hi ha sibling, seleccionem el parent
                let parent = this.getParentItem(item);
                let parentTreeNodes = this.treeWidget.getNodesByItem(parent);
                node = parentTreeNodes[0];
            }

            // ALERTA! El remove és fa amb la identitat i no de l'item
            this.store.remove(this.store.getIdentity(item));
            this.model.onDelete(item);

            this.selectNode(node);
        },

        selectNode: function (node) {
            let path = node.getTreePath();
            this.treeWidget.set('path', path);
            this.selectItem(node.item);
        },

        fixChildNames: function (item) {

            // console.log("** Cercant els fills de **", item);
            let children = this.store.getChildren(item);

            for (let i = 0; i < children.length; i++) {
                let child = children[i];
                this.fixChildNames(child);

                // si el parent és un array, i el tipus del item el nom és el valor
                if (item.type === 'array') {
                    child.index = i;
                } else {
                    delete (child.index);
                }

                if (item.type === 'array' && (child.type !== 'value' || child.value === undefined)) {
                    // console.log("assignant index", i);
                    child.name = i;
                } else if (item.type === 'object') {
                    // console.log("assignant propietat", child.key);
                    child.name = child.key;
                } else {
                    // console.log("assignant valor", child.value);
                    child.name = child.value;
                }

                this.store.put(child, {overwrite: true, parent: item});

            }

        },

        updateItem: function (item, parent) {
            this.store.put(item, {
                parent: parent,
                overwrite: true
            });

            // Això no te cap efecte aquí
            this.model.onChange(item);
            this.model.onChildrenChange(parent, this.store.getChildren(parent));

            let treeNodes = this.treeWidget.getNodesByItem(item);
            // només ha de retornar 1 node
            // console.log(treeNodes[0]);
            treeNodes[0].expand();

            this.fixChildNames(parent);
            this.updateFieldsAndButtons();
        },

        addItem: function (item, parent) {

            // Si és un array el nom serà l'index de l'array
            let childrenCount;
            if (parent.type === 'array' && item.value !== 'value') {
                childrenCount = this.store.getChildren(parent).length;
                item.index = childrenCount;
            }

            if (parent.type === 'array' && item.value !== 'value') {
                //item.value = item.name;
                item.name = childrenCount;
            }

            this.store.put(item, {
                overwrite: true,
                parent: parent
            });

            // això fa que es refresqui l'arbre??
            // TODO: Comprovar si és necessari el onChange
            this.model.onChange(item);
            this.model.onChildrenChange(parent, this.store.getChildren(parent));

            let treeNodes = this.treeWidget.getNodesByItem(parent);
            // només ha de retornar 1 node
            // console.log(treeNodes[0]);
            treeNodes[0].expand();

            // console.log("selected?", this.selected);
            if (this.selected.key === 'root') {
                // console.log("Seleccionant el nou item");
                // Seleccionem el nou node craat
                let node = this.treeWidget.getNodesByItem(item)[0];
                this.selectNode(node);
            }

        },


        // ALERTA! aquesta funció es crida automáticament quan canvia la mida de la finestra del navegador o es fa scroll
        // Com que hem fet que els elements del dialog s'ajustin via jQuery quan es crida al resize es
        // fa malbé la composició.
        //
        // Per alguna raó desconeguda si es sobreescriu aquesta funció i s'intenta cridar al this.inherited()
        // no funciona, i si es sobreescriu a la inicialització no es crida la primera vegada i no es
        // genera correctament, per aquest motiu es fa la reescriptura en aquest punt, on ja tenim la mida final
        resize: function (args) {
        },


        destroy: function () {
            this.inherited(arguments);

            if (this.timerId_Detail2Field) {
                clearTimeout(this.timerId_Detail2Field);
            }
        },

    });

    return TreeDialog;
});
