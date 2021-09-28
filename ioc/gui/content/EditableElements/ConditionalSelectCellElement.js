define([
    'dojo/_base/declare',
    'ioc/gui/content/EditableElements/ZoomableFormElement',
    "dojox/form/CheckedMultiSelect",
    'dojo/text!dojox/form/resources/CheckedMultiSelect.css',
], function (declare, ZoomableFormElement, CheckedMultiSelect, css) {

    css += "\n";
    css += "div.checkContainer .dojoxCheckedMultiSelectWrapper {height: auto;}\n";
    css += "div.checkContainer {margin-top: 15px; margin-bottom: 15px;}\n";

    var cssStyle = document.createElement('style');
    cssStyle.innerHTML = css;
    document.head.appendChild(cssStyle);

    var lastFocusedElement;
    
    var isCompliant = function(value1, value2, relation){
        let compliant = false;
        switch (relation){
            case "=":
            case "==":
                compliant = value1 == value2;
                break;
            case "!=":
                compliant = value1 != value2;
                break;
            case ">":
                compliant = value1 > value2;
                break;
            case "<":
                compliant = value1 < value2;
                break;
            case ">=":
                compliant = value1 >= value2;
                break;
            case "<=":
                compliant = value1 <= value2;
                break;
            default :
                let match = [...relation.matchAll(/(.*)\((.*?)\)/g)];
                if(match[0][1] == "is_in"){
                    const arrayValue2 = value2.split(RegExp("["+match[0][2]+"]"));
                    compliant = arrayValue2.includes(value1);
                }else if(match[0][1] == "includes"){
                    const arrayValue1 = value1.split(RegExp("["+match[0][2]+"]"));
                    compliant = arrayValue1.includes(value2);
                }
        }  
        return compliant;
    }

    return declare([ZoomableFormElement],
        {

            constructor: function (args) {
                this.src = args.src;
            },

            _zoom: function (event) {

                this.src.gridData.grid.ignoreApply = true;

                // ALERTA! Aquest objecte es creat pel ConditionalSelectCell que és el que rep la injecció del IocEditManager
                // console.warn("**************");
                // console.warn(this.src.gridData);
                // console.warn(this.src.datasource);
                // console.warn(this.src.gridData.cell.config); // Config
                // console.warn(this.src.gridData.grid.getItem(this.src.gridData.rowIndex)); // fila
                // console.warn("**************");


                var options = [];

                // Exemple de dades a cell.config
                //     "datasource": "activitatsAprenentatge",
                //     "filterByKeySource": "unitat",
                //     "filterByKeyOwn": "unitat formativa",
                //     "labelFields": ["unitat", "descripció"],
                //     "labelSeparator": ",",
                //     "outputFields": ["unitat", "periode"],
                //     "outputSeparator": [";"],
                //     "outputMultiSeparator": [","],
                //     "hierarchySeparator": "."
                //     "validationRegex": ""

                var config = this.src.gridData.cell.config;
                var fieldSource = JSON.parse(this.src.datasource.getValue(config.fieldsource));
                var fieldOwn = JSON.parse(this.src.datasource.getValue(this.src.gridData.grid.sourceId));
                var rowOwn = fieldOwn[this.src.gridData.rowIndex];

                for (var i = 0; i < fieldSource.length; i++) {
                    var compliant = true;
                    if(Array.isArray(config.filterByKeySource)){
                        for(var j=0; j<config.filterByKeySource.length; j++){
                            if(config.filterCompliantRelation){
                                compliant = compliant && isCompliant(fieldSource[i][config.filterByKeySource[j]],rowOwn[config.filterByKeyOwn[j]],config.filterCompliantRelation[j]);
                            }else{
                                compliant = compliant && fieldSource[i][config.filterByKeySource[j]] == rowOwn[config.filterByKeyOwn[j]];
                            }
                        }
                    }else if(config.filterCompliantRelation){
                        compliant = isCompliant(fieldSource[i][config.filterByKeySource], rowOwn[config.filterByKeyOwn], config.filterCompliantRelation);
                    }else{
                        compliant = fieldSource[i][config.filterByKeySource] == rowOwn[config.filterByKeyOwn];
                    }

                    // ALERTA! == intencionat perquè un valor pot ser enter i l'altre string
                    if (compliant) {
                        var labelItems = [];
                        var outputItems = [];

                        for (var j = 0; j < config.labelFields.length; j++) {
                            labelItems.push(fieldSource[i][config.labelFields[j]]);
                        }

                        for (var j = 0; j < config.outputFields.length; j++) {
                            outputItems.push(fieldSource[i][config.outputFields[j]]);
                        }

                        options.push(
                            {
                                label: labelItems.join(config.labelSeparator),
                                value: outputItems.join(config.outputMultiseparator)
                            }
                        );
                    }
                }

                event.preventDefault();
                this.setEditionState(true);
                var fieldId = this.$field.attr('data-form-editor-button') || Date.now();

                var dispatcher;

                require(["ioc/wiki30/dispatcherSingleton", "ioc/gui/content/contentToolFactory"], function (getDispatcher) {
                    dispatcher = getDispatcher();
                });


                var dialogManager = dispatcher.getDialogManager();

                var params = {
                    id: "auxWidget" + fieldId,
                    multiple: config.multiple,
                    baseClass: 'checkContainer',
                    options: options, // per mostrar
                };

                var checkMultiSelectWidget = new CheckedMultiSelect(params);

                // Seleccionem les opcions anteriors
                var auxOptions = checkMultiSelectWidget.getOptions();
                for (var i = 0; i < auxOptions.length; i++) {
                    auxOptions[i].selected = false;
                }
                var selectedOptions = this.$field.val().split(config.outputSeparator);
                var optionsToUpdate = [];

                for (var i = 0; i < auxOptions.length; i++) {
                    for (var j = 0; j < selectedOptions.length; j++) {
                        // == intencionat, per si es dona el cas de que un sigui nombre i l'altre string
                        if (auxOptions[i].value == selectedOptions[j]) {
                            auxOptions[i].selected = true;
                        }
                    }
                    optionsToUpdate.push(auxOptions);
                }

                checkMultiSelectWidget.updateOption(optionsToUpdate);

                var $container = jQuery('<div>');
                $container.text('Selecciona:');

                var context = this;

                var saveCallback = function () {

                    var value = checkMultiSelectWidget.getValue();
                    var processedValue;


                    // TODO: eliminar els resultats redundants per jerarquía

                    if (config.hierarchySeparator) {

                        var hierarchy = {};

                        for (var i = 0; i < value.length; i++) {
                            var decomposedValue = value[i].split(config.hierarchySeparator);


                            var addElementToHierarchy = function (key, subobject, elementsrestants) {

                                if (subobject[key] === undefined) {
                                    subobject[key] = {};
                                }


                                if (elementsrestants.length > 0) {
                                    addElementToHierarchy(elementsrestants.shift(), subobject[key], elementsrestants)
                                } else {
                                    subobject[key]['leaf'] = true;
                                }

                            };

                            addElementToHierarchy(decomposedValue.shift(), hierarchy, decomposedValue);

                        }

                        var parsedValues = [];

                        // entrada:
                        // 1
                        //   1
                        //     99
                        //   2
                        // 2
                        //   1
                        //
                        // sortida:
                        //  1
                        //  2.1


                        var parseObject = function (obj, value) {

                            for (var key in obj) {
                                var candidateValue = value;

                                if (candidateValue.length > 0) {
                                    candidateValue += config.hierarchySeparator;
                                }
                                candidateValue += key;

                                if (obj[key].leaf) {
                                    // Si troba una fulla l'afegeix i deixa de parsejar
                                    parsedValues.push(candidateValue);
                                } else {
                                    parseObject(obj[key], candidateValue);
                                }

                            }
                        };

                        parseObject(hierarchy, "");

                        processedValue = parsedValues.join(config.outputSeparator)


                    } else {
                        processedValue = value.join(config.outputSeparator)
                    }

                    context.$field.val(processedValue);

                    this.src.gridData.grid.ignoreApply = false;
                    this.setEditionState(false);
                    this.src.gridData.grid.edit.apply();

                    dialog.onHide();

                }.bind(this);

                var cancelCallback = function () {
                    this.src.gridData.grid.ignoreApply = false;
                    this.setEditionState(false);
                    if(this.src.gridData.grid.edit){
                        this.src.gridData.grid.edit.apply();
                    }

                    dialog.onHide();
                }.bind(this);

                var dialogParams = {
                    title: "Editar cel·la",
                    baseClass: 'checkContainer',
                    message: '',
                    single: true,
                    sections: [
                        $container,
                        {widget: checkMultiSelectWidget},
                    ],
                    buttons: [
                        {
                            id: 'accept',
                            description: 'Desar',
                            buttonType: 'default',
                            callback: saveCallback
                        },
                        {
                            id: 'cancel',
                            description: 'Cancel·lar',
                            buttonType: 'default',
                            callback: cancelCallback
                        }
                    ],
                };

                var dialog = dialogManager.getDialog(dialogManager.type.DEFAULT, this.context.ns, dialogParams);

                dialog.show();
                dialog.resize();

                this.originalContent = this.$field.val();

            },

            init: function (args) {

                // Això hauria de ser un contenttool, però no es aplicable en el cas de les cel·les perquè les crea el DataGrid
                var context = {
                    title: "Edició de cel·la", // TODO: Localitzar
                };


                this.context = context;

                this.$field = jQuery(args.node);
                this.args = args;


                this._createIcon();


                this.$field.on('focus', function () {

                    this.$field.parent().css('position', 'relative');
                    this.$field.before(this.$icon);

                    if (lastFocusedElement) {
                        lastFocusedElement.show(false);
                    }

                    lastFocusedElement = this;


                    this.show(true);
                }.bind(this));

            },

        });

});
