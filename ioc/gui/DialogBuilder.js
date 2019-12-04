define([
    "dojo/_base/declare",
    "ioc/gui/CustomDialog",
    "ioc/gui/jsdifflib/jsdifflib-amd",
    "ioc/functions/jsProjectDiff"
], function (declare, CustomDialog, jsdifflib, jsProjectDiff) {

    var DialogBuilderException = function (message) {
        this.message = message;
        this.name = "DialogBuilderException";
        console.error(this.name, this.message);
    };

    return declare([], {

        buttonType: {
            REQUEST_CONTROL: 'request_control',
            FIRE_EVENT: 'fire_event',
            CANCEL: 'cancel',
            DEFAULT: 'default'
        },

        constructor: function (args) {
            this.dispatcher = args.dispatcher;
            this.params = args;

            if (args.content) {
                throw new DialogBuilderException("No es pot afegir una propietat 'content' a aquests dialegs");
            }
            this.params.width = args.width || 400;
            // this.params.height = args.height || 400;

            if (!this.params.sections) {
                this.params.sections = [];
            }

            this.params.initFunctions = [];
            this.params.buttons = [];
            this.params.nextDialogs = {};
            this.params.nextCallbacks = {};

        },

        getId: function () {
            return this.params.id;
        },


        addCancelDialogButton: function (description) {
            return this.addButton(this.buttonType.CANCEL, description);
        },

        addDiff: function (text1, text2, text1Label, text2Label) {
            var node = document.createElement('div'),
                diffNode = jsdifflib.getDiff(text1, text2, text1Label, text2Label);

            node.className = 'diff-dialog-diff';
            node.appendChild(diffNode);

            this.setWidth(700);
            this._addSection(node);

            return this;
        },

        addProjectDiff: function (form1, form2, label1, label2) {
            var node = document.createElement('div');
            var diffNode = jsProjectDiff.getDiff(form1, form2, label1, label2);

            node.className = 'diff-dialog-diff';
            node.innerHTML = diffNode;

            this.setWidth(800);
            this._addSection(node);

            return this;
        },

        addForm: function (data) {

            var $node = jQuery('<form>');
            var $fields = jQuery('<ul>');

            $node.addClass('ioc-bootstrap form-dialog')
            $node.append($fields);

            $node.addClass('row');

            // for (var item in data) {
            for (var i = 0; i < data.length; i++) {
                var item = data[i];

                var $li = jQuery('<li>');

                var $input;

                switch (item.type) {

                    case 'select':
                        $input = this._createSelect(item);
                        break;

                    default:
                        $input = this._createInput(item);

                }

                $li.append($input);
                $fields.append($li);
            }

            // No s'utilitza l'event submit del form, es fan servir botons que executen el callback corresponent
            $node.on('submit', function (e) {
                e.preventDefault();
            });

            this._addSection($node[0]);
            return this;
        },

        _createInput: function (item) {
            return jQuery('<label for="' + item.name + '">' + item.label + ':</label><input name="' + item.name + '" placeholder="' + item.placeholder + '" class="form-control" value="' + item.value + '"/>');
        },

        _createSelect: function (item) {

            var $input = jQuery('<div>');
            var $label = jQuery('<label for="' + item.name + '">' + item.label + ':</label>');
            var $select = jQuery('<select name="' + item.name + '" class="form-control">');

            if (item.placeholder) {
                var $option = jQuery('<option value="'+item.placeholder+'">'+item.placeholder+'</option>');
                $select.append($option);
            }

            for (var i=0; i<item.options.length || 0; i++) {
                if (item.options[i] === item.placeholder) {
                    continue;
                }

                $option = jQuery('<option value="'+item.options[i]+'">'+item.options[i]+'</option>');
                $select.append($option);
            }


            $select.val(item.value);
            $input.append($label);
            $input.append($select);


            return $input;
        },


        setWidth: function (value) {
            if (this.params.width < value) {
                this.params.width = value;
            }
            return this;
        },

        setHeight: function (value) {
            if (this.params.height < value) {
                this.params.height = value;
            }
            return this;
        },

        addButtons: function (buttons) {
            if (!buttons) {
                console.warn("Dialog without buttons");
                return;
            }
            for (var i = 0; i < buttons.length; i++) {
                this.addButton(buttons[i].buttonType, buttons[i]);
            }
        },

        addButton: function (buttonType, params) {
            var button;

            switch (buttonType) {
                case this.buttonType.REQUEST_CONTROL:
                    // Params: {
                    //      id: id del botó, ha de ser unic per cada dialeg
                    //      description: text del boto, ** PER TOTS ELS BOTONS **
                    //      extra: {
                    //          eventType: tipus del event que rebrà un request control,
                    //          dataToSend: dades que es passen al request control}
                    button = this._createRequestButton(params);
                    break;

                case this.buttonType.FIRE_EVENT:
                    button = this._createEventButton(params);
                    break;


                case this.buttonType.CANCEL:
                    button = this._createCancelButton(params);
                    break;

                case this.buttonType.DEFAULT:
                default:
                    button = this._createDefaultButton(params);
            }

            this._addButton(button);

            return this;
        },

        addRequestControlButtons: function (buttons) {
            for (var i = 0; i < buttons.length; i++) {
                var newButton = buttons[i];
                this.addButton(this.buttonType.REQUEST_CONTROL, newButton);
            }

            return this;
        },

        addTimeout: function (timeout) {
            this.params.timeout = timeout;
            return this;
        },

        addNextDialog: function (event, dialog) {
            if (!dialog) {
                throw new DialogBuilderException('No s\'ha passat cap dialeg');
            }

            if (this.params.nextDialogs[event]) {
                throw new DialogBuilderException('Ja s\'ha establert un dialog per l\'event:' + event);
            }

            this.params.nextDialogs[event] = dialog;

            return this;
        },

        addNextCallback: function (event, callback) {
            // crida la funció passada com argument quan es dispara l'event
            if (!this.params.nextCallbacks[event]) {
                this.params.nextCallbacks[event] = [];
            }

            this.params.nextCallbacks[event].push(callback);
            return this;
        },

        // Helper per facilitar la adició de events que treballen amb el RequestControl
        addNextRequestControlCallback: function (eventListened, eventTriggered, dataToSend, observable) {
            //console.log("DialogBuilder#_addNextRequestControl", eventTriggered, dataToSend);

            var callback = function () {
                var dts;
                //this.eventManager.fireEvent(eventTriggered, { // Això fa referencia al eventManager del dialog
                //    id: this.id,
                //    dataToSend: dataToSend
                //}, observable);
                if (dataToSend) {
                    if (typeof dataToSend === "string") {
                        dts = {
                            id: this.id,
                            dataToSend: dataToSend
                        };
                    } else if (dataToSend.extraDataToSend) {
                        dts = dataToSend;
                    } else {
                        if (!dataToSend.id) {
                            dataToSend.id = this.id;
                        }
                        dts = {
                            id: dataToSend.id,
                            dataToSend: dataToSend
                        };
                    }
                }
                this.eventManager.fireEvent(eventTriggered, dts, observable);
            };

            this.addNextCallback(eventListened, callback);

            return this;
        },


        setParam: function (key, value) {
            this.params[key] = value;
            return this;
        },

        build: function () {
            var style = '';

            if (this.params.height) {
                style += 'height:' + this.params.height + "px;";
            }

            if (this.params.width) {
                style += 'width:' + this.params.width + "px";
            }

            this.params['style'] = style;

            delete (this.params.height);
            delete (this.params.width);

            return new CustomDialog(this.params);
        },

        _createRequestButton: function (params) {
            var button = {
                    id: params.id,
                    description: params.description
                },
                callback;

            if (Array.isArray(params.extra)) {
                callback = [];
                for (var i = 0; i < params.extra.length; i++) {
                    callback.push(this._generateRequestControlCallback(params.extra[i].eventType, params.extra[i].dataToSend));
                }
            }
            else {
                callback = this._generateRequestControlCallback(params.extra.eventType, params.extra.dataToSend);
            }

            button.callback = callback;

            return button;
        },

        _createEventButton: function (params) {
            var button = {
                    id: params.id,
                    description: params.description
                },
                callback;

            if (Array.isArray(params.extra)) {
                callback = [];
                for (var i = 0; i < params.extra.length; i++) {
                    callback.push(this._generateFireEventCallback(params.extra[i].eventType, params.extra[i].data, params.extra[i].observable));
                }
            } else {
                callback = this._generateFireEventCallback(params.extra.eventType, params.extra.data, params.extra.observable);
            }

            button.callback = callback;
            return button;

        },

        _createCancelButton: function (params) {
            return {
                id: params.id,
                description: params.description || 'Cancel·lar',
                callback: this._generateCancelCallback()
            };
        },

        _createDefaultButton: function (params) {
            /*
            return {
                id: params.id,
                description: params.description,
                callback: params.callback
            }
            */
            return params;
        },

        _generateRequestControlCallback: function (event, dataToSend, observable) {
            //console.log("DialogBuilder#_generateRequestControllCallback", event, dataToSend);

            return function () {
                this.eventManager.fireEvent(event, { // Això fa referencia al eventManager del dialog
                    id: this.id,
                    ns: this.ns,
                    dataToSend: dataToSend
                }, observable);
            };
        },

        _generateFireEventCallback: function (event, data, observable) {

            if (!data.id) {
                if (typeof observable === "string") {
                    data.id = observable;
                } else {
                    data.id = observable.id;
                }
            }

            return function () {
                // ALERTA[Xavi] Això permet afegir dades extras a l'event que s'obtenen des del dialog
                if (this.extraData) {
                    for (var item in this.extraData) {
                        data[item] = this.extraData[item];
                    }
                }
                this.eventManager.fireEventFromObservable(event, data, observable); // Això fa referencia al eventManager del dialog
            };

        },

        _generateCancelCallback: function () {
            return function () {
                this.remove();
            };
        },

        addSection: function (node) {
            this._addSection(node);
        },

        _addSection: function (node) {
            // Alerta[Xavi] Ho he deixat com a privat per poder fer canvis sense afectar a la API
            // Afegeix el codi html que ha de correspondre a un node al array de seccions
            this.params.sections.push(node);
        },

        _addButton: function (button) {
            this.params.buttons.push(button);
        },

        _addInitFunction: function (func) {
            this.params.initFunctions.push(func);
        }

    });

});
