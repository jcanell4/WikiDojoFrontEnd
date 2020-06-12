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

    return declare([ZoomableFormElement],
        {

            constructor: function (args) {
                this.src = args.src;
            },

            _zoom: function (event) {

                this.src.gridData.grid.ignoreApply = true;

                // ALERTA! Aquest objecte es creat pel ConditionalSelectCell que és el que rep la injecció del IocEditManager
                console.warn("**************");
                console.warn(this.src.gridData);
                console.warn(this.src.datasource);
                console.warn(this.src.gridData.cell.config); // Config
                console.warn(this.src.gridData.grid.getItem(this.src.gridData.rowIndex)); // fila
                console.warn("**************");


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

                var config = this.src.gridData.cell.config;
                var fieldSource = JSON.parse(this.src.datasource.getValue(config.fieldsource));
                var fieldOwn = JSON.parse(this.src.datasource.getValue(this.src.gridData.grid.sourceId));
                var rowOwn = fieldOwn[this.src.gridData.rowIndex];

                for (var i = 0; i < fieldSource.length; i++) {

                    // ALERTA! == intencionat perquè un valor pot ser enter i l'altre string
                    if (fieldSource[i][config.filterByKeySource] == rowOwn[config.filterByKeyOwn]) {
                        var labelItems = [];
                        var outputItems = [];

                        for (var j=0; j < config.labelFields.length; j++) {
                            labelItems.push(fieldSource[i][config.labelFields[j]]);
                        }

                        for (var j=0; j < config.outputFields.length; j++) {
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
                var selectedOptions = this.$field.val().split(config.outputSeparator);
                var optionsToUpdate = [];

                for (var i=0; i < auxOptions.length; i++) {
                    for (var j=0; j<selectedOptions.length; j++) {
                        // == intencionat, per si es dona el cas de que un sigui nombre i l'altre string
                        if (auxOptions[i].value == selectedOptions[j]) {
                            auxOptions[i].selected = true;
                            optionsToUpdate.push(auxOptions);
                        }
                    }
                }

                checkMultiSelectWidget.updateOption(optionsToUpdate);

                var $container = jQuery('<div>');
                $container.text('Selecciona:');

                var context = this;

                var saveCallback = function () {

                    var value = checkMultiSelectWidget.getValue().join(config.outputSeparator);

                    // TODO: eliminar els resultats redundants per jerarquía

                    context.$field.val(value);

                    this.src.gridData.grid.ignoreApply = false;
                    this.setEditionState(false);
                    this.src.gridData.grid.edit.apply();

                    dialog.onHide();

                }.bind(this);

                var cancelCallback = function () {
                    this.src.gridData.grid.ignoreApply = false;
                    this.setEditionState(false);
                    this.src.gridData.grid.edit.apply();

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
