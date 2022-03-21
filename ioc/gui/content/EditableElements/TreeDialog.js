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

            $updateButton.on('click', function () {
                // Alerta, el context d'execució en afegir el callback al objecte de
                // configuració (pel principal és DojoWioccl)
                context.updateCallback(context.editor);
            });

            // Als subdialegs no s'ha de mostrar el botó d'eliminar nodes
            let $deleteButton = jQuery(this.deleteBtnNode);

            if (!context.enabledDelete) {
                $deleteButton.prop('disabled', 'true');
            } else {
                $deleteButton.prop('disabled', '');
            }

            $saveButton.on('click', function () {
                context.saveCallback(context.editor);
            });

            let $insertPropertyButton = jQuery(this.insertPropertyBtnNode);
            let $insertElementButton = jQuery(this.insertElementBtnNode);
            let $insertDeleteButton = jQuery(this.deleteBtnNode);

            // Iniciem els botons per inserir elements wioccl a l'editor
            $insertPropertyButton.on('click', function () {
                // ALERTA! Igual que a property canviant el nom de l'element
                var childItem = {
                    name: "nova_propietat",
                    id: Math.random(),
                    key: "nova_propietat",
                    type: 'value'
                };

                context.addItem(childItem, context.selected);
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
                console.log("TODO: Delete");
            });

        },

        updateFieldsAndButtons: function () {
            // console.log("###UPDATING FIELDS AND BUTTONS###");
            let $insertPropertyButton = jQuery(this.insertPropertyBtnNode);
            let $insertElementButton = jQuery(this.insertElementBtnNode);
            let $insertDeleteButton = jQuery(this.deleteBtnNode);


            let disableInsertProperty = true;
            let disableInsertElement = true;
            let disableInsertDelete = true;

            switch(this.selected.type) {
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
                    break;
            }

            let parent = this.getParentItem(this.selected);

            if (parent === null) {
                // console.log("Tot desactivat, és el root");
                disableInsertProperty = true;
                disableInsertElement = true;
                disableInsertDelete = true;
            } else {
                // console.log("No és root");
                disableInsertDelete = false;
            }

            $insertPropertyButton.prop('disabled', disableInsertProperty);
            $insertElementButton.prop('disabled', disableInsertElement);
            $insertDeleteButton.prop('disabled', disableInsertDelete);


            // FIELDS
            let parentType = parent ? parent.type : '';

            let $value = jQuery(this.valueNode);
            let $property = jQuery(this.propertyNode);
            let $type = jQuery(this.typeNode);
            let $label = jQuery(this.labelNode);

            let valueDisabled = true;
            let propertyDisabled = true;
            let typeDisabled = false;

            switch (this.selected.type) {
                case 'value':

                    if (parentType==='object') {
                        propertyDisabled = false;
                    }

                    valueDisabled = false;
                    $label.html("");
                    break;

                case 'array':
                    if (this.selected.type === 'value') {
                        valueDisabled = false;
                    }
                    $label.html("Índex:");
                    break;

                case 'object':
                    $label.html("Propietat:");
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
                    $label.html("");
                    break;

                case 'array':
                    $label.html("Índex:");
                    propertyDisabled = true;
                    break;

                case 'object':
                    $label.html("Propietat:");
                    break;
            }

            $value.prop('disabled', valueDisabled);
            $property.prop('disabled', propertyDisabled);
            $type.prop('disabled', typeDisabled);

        },


        getParentItem: function(item) {
            // console.error("item?", item);
            let id = this.store.getIdentity(item)
            // console.log("id?", id);
            let context = this;
            let parent = this.store.query(function(element) {
                let children = context.store.getChildren(element);
                for (let i = 0; i< children.length; i++) {
                    if (children[i].id === id){
                        return true;
                    }
                }
                return false;
            });

            return parent.length>0? parent[0] : null;
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
                            // children: this.dataToNode(clonedData[i], i, counter, id)
                        }
                        // Afegim els nodes com a fills, però sense atribut children
                        this.dataToNode(clonedData[i], i, counter, id)
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

            return aux;


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

            this.updateFieldsAndButtons();
        },


        store: null,
        mode: null,

        addDataToStore: function(data, store, counter, parent) {
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
                put: function(object, options){
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

                    if(eventType === "update"){
                        if(options && options.overwrite === false){
                            throw new Error("Object already exists");
                        }
                        else{
                            previousIndex = index[id];
                            defaultDestination = previousIndex;
                        }
                    }
                    // console.log("previous index", previousIndex);

                    if(options && "before" in options){
                        console.log("Before!");
                        if(options.before == null){
                            newIndex = data.length;
                            if(eventType === "update"){
                                --newIndex;
                            }
                        }
                        else{
                            newIndex = index[this.getIdentity(options.before)];
                            console.log("new index", newIndex);
                            // Account for the removed item
                            if(previousIndex < newIndex){
                                --newIndex;
                            }
                        }
                    }
                    else{
                        newIndex = defaultDestination;
                    }

                    if(newIndex === previousIndex){
                        data[newIndex] = object;
                    }
                    else{
                        if(previousIndex !== undefined){
                            console.log("Canviant el data")
                            data.splice(previousIndex, 1);
                        }
                        data.splice(newIndex, 0, object);
                        this._rebuildIndex(previousIndex === undefined ? newIndex : Math.min(previousIndex, newIndex));

                    }

                    return id;
                },
                _rebuildIndex: function(startIndex){
                    var data = this.data;
                    var dataLength = data.length;
                    var i;

                    startIndex = startIndex || 0;

                    for(i = startIndex; i < dataLength; i++){
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
                }

            });

            this.store = store;

            // S'han d'afegir abans d'instanciar l'arbre perquè requereix com a mínim un node
            this.addDataToStore(storeData, store, {count: 0}, null);



            let context = this;

            let $value = jQuery(this.valueNode);
            let $property = jQuery(this.propertyNode);
            let $type = jQuery(this.typeNode);

            $value.on('input change', function() {
                // console.log("Canvis al valor");
                if (context.selected){
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

            $property.on('input change', function() {
                console.log("Canvis al nom de la propietat");
                if (context.selected){

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

            $type.on('change', function() {
                // console.log("Canvis al tipus");
                let newValue = jQuery(this).val();

                if (context.selected){

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
                        $value.val("");
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
                showRoot: false,
                onLoad: function () {
                    // dom.byId('image').src = '../resources/images/root.jpg';
                },

                onClick: function (item) {
                    console.log("item clicat:", item);

                    // TODO: revisar això del selected, ficar en el context.select(item)?
                    context.select(item);

                    $value.val(item.value);
                    $property.val(item.index !== undefined ? item.index : item.key);
                    $type.val(item.type);

                },

            });

            this.treeWidget.placeAt(this.treeContainerNode);
            this.treeWidget.startup();
        },

        discardChildren: function(item) {
            console.log("Decartant els fills de ", item);
            for (let child of this.store.getChildren(item)) {
                this.discardChildren(child);
                this.removeItem(child);
            }
        },

        removeItem: function(item) {
            // ALERTA! El remove és amb la identitat i no de l'item
            this.store.remove(this.store.getIdentity(item));
            this.model.onDelete(item);
        },

        fixChildNames: function (item) {

            // console.log("** Cercant els fills de **", item);
            let children = this.store.getChildren(item);

            for (let i= 0; i<children.length; i++) {
                let child = children[i];
                this.fixChildNames(child);

                // si el parent és un array, i el tipus del item el nom és el valor
                if (item.type === 'array') {
                    child.index = i;
                } else {
                    delete(child.index);
                }

                if (item.type==='array' && child.type!=='value') {
                    // console.log("assignant index", i);
                    child.name = i;
                } else if (item.type==='object') {
                    // console.log("assignant propietat", child.key);
                    child.name = child.key;
                } else {
                    // console.log("assignant valor", child.value);
                    child.name = child.value;
                }

                this.store.put(child, {overwrite: true, parent: item});

            }

        },

        updateItem: function(item, parent) {
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

        addItem: function(item, parent) {

            // Si és un array el nom serà l'index de l'array
            let childrenCount;
            if (parent.type === 'array' && item.value !== 'value') {
                childrenCount =this.store.getChildren(parent).length;
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
