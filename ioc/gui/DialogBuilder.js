define([
    'dojo/_base/declare',
    'ioc/gui/CustomDialog',
    'ioc/gui/jsdifflib/jsdifflib-amd'
], function (declare, CustomDialog, jsdifflib) {

    var DialogBuilderException = function (message) {
        this.message = message;
        this.name = "DialogBuilderException";
        console.error(this.name, this.message);
    };

    return declare([], {

        buttonType: {
            REQUEST_CONTROL: 'request_control',
            CANCEL: 'cancel',
            DEFAULT: 'default'
        },

        constructor: function (args) {

            this.dispatcher = args.dispatcher;
            this.params = args;

            if (args.content) {
                throw new DialogBuilderException("No es pot afegir una propietat 'content' a aquests dialegs");
            }

            this.params.width = 400;
            this.params.sections = [];
            this.params.initFunctions = [];
            this.params.buttons = [];
            this.params.nextDialogs = {};
            this.params.nextCallbacks = {};

        },

        getId: function () {
            return this.params.id;
        },


        addCancelDialogButton: function (description) {
            return this.addButton(this.buttonType.CANCEL, description)
        },

        addDiff: function (text1, text2, text1Label, text2Label) {
            console.log('DialogBuilder#addDiff');

            var node = document.createElement('div'),
                diffNode = jsdifflib.getDiff(text1, text2, text1Label, text2Label);

            node.className = 'diff-dialog-diff';
            node.appendChild(diffNode);


            this.setWidth(700);
            this._addSection(node);

            return this;
        },

        setWidth: function (value) {
            if (this.params.width < value) {
                this.params.width = value;
            }
            return this;
        },

        addButtons: function(buttons) {
            for (var i=0; i<buttons.length; i++) {
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
                newButton = buttons[i];
                this.addButton(this.buttonType.REQUEST_CONTROL, newButton);
            }

            return this;
        },

        addTimeout: function (timeout) {
            this.params.timeout = timeout;
            return this;
        },

        addNextDialog: function (event, dialog) {
            //console.log("DialogBuilder#addNextDialog", event);

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
        addNextRequestControlCallback: function (eventListened, eventTriggered, dataToSend) {
            //console.log("DialogBuilder#_addNextRequestControl", eventTriggered, dataToSend);

            var callback = function () {
                this.eventManager.dispatchEvent(eventTriggered, { // Això fa referencia al eventManager del dialog
                    id: this.id,
                    dataToSend: dataToSend
                });
            };

            this.addNextCallback(eventListened, callback);

            return this;
        },


        setParam: function (key, value) {
            this.params[key] = value;
            return this;
        },


        build: function () {
            //console.log('DialogBuilder#build', this.params);
            return new CustomDialog(this.params);
        },


        _createRequestButton: function (params) {
            var button = {
                id: params.id,
                description: params.description,
            }, callback;


            if (Array.isArray(params.extra)) {
                callback = [];
                for (var i = 0; i < params.extra.length; i++) {
                    callback.push(this._generateRequestControlCallback(params.extra[i].eventType, params.extra[i].dataToSend));
                }


            } else {
                callback = this._generateRequestControlCallback(params.extra.eventType, params.extra.dataToSend);
            }

            button.callback = callback;

            return button;
        },

        _createCancelButton: function (params) {
            return {
                id:params.id,
                description: params.description || 'Cancel·lar',
                callback: this._generateCancelCallback()
            }
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

        _generateRequestControlCallback: function (event, dataToSend) {
            //console.log("DialogBuilder#_generateRequestControllCallback", event, dataToSend);

            return function () {
                //console.log("Click:", event, dataToSend);
                this.eventManager.dispatchEvent(event, { // Això fa referencia al eventManager del dialog
                    id: this.id,
                    dataToSend: dataToSend
                });
            }

        },

        _generateCancelCallback: function () {
            return function () {
                this.remove();
            }
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
        },

    });

});

