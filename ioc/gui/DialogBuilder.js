define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver',
    'ioc/gui/CustomDialog',
    'ioc/gui/jsdifflib/jsdifflib-amd',
], function (declare, EventObserver, CustomDialog, jsdifflib) {

    var DialogBuilderException = function (message) {
        this.message = message;
        this.name = "DialogBuilderException";
    };

    return declare([], {

        type: {
            REQUEST_CONTROL: 'request_control',
            CANCEL: 'cancel'
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
            this.params.nextDialog = {};
            this.params.nextCallbacks = {};

        },

        getId: function () {
            return this.params.id;
        },



        addCancelButton: function() {
            return this.addButton(this.type.CANCEL)
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

        addButton: function (type, params) {
            var button;

            switch (type) {
                case this.type.REQUEST_CONTROL:
                    // Params: {
                    //      id: id del botó, ha de ser unic per cada dialeg
                    //      description: text del boto, ** PER TOTS ELS BOTONS **
                    //      extra: {
                    //          eventType: tipus del event que rebrà un request control,
                    //          dataToSend: dades que es passen al request control}
                    button = this._createRequestButton(params);
                    break;

                case this.type.CANCEL:
                    button = this._createCancelButton();
                    break;

                default:
                    throw new DialogBuilderException("No existeix el tipus de botó: " + type);
            }

            this._addButton(button);

            return this;
        },

        addButtons: function (buttons) {
            for (var i = 0; i < buttons.length; i++) {
                newButton = buttons[i];
                this.addButton(this.type.REQUEST_CONTROL, newButton);
            }

            return this;
        },

        addTimeout: function (timeout) {
            this.params.timeout = timeout;
            return this;
        },

        addNextDialog: function (event, dialog) {
            // llença el dialog passat per argument quan es dispara l'event

            if (this.params.nextDialog[event]) {
                throw new DialogBuilderException("Ja s'ha establert un dialog per l'event:" + event);
            }

            this.params.nextDialog[event] = dialog;

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
        addNextRequestControl: function (eventListened, eventTriggered, dataToSend) {
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
            console.log('DialogBuilder#build', this.params);
            return new CustomDialog(this.params);
        },


        _createRequestButton: function (params) {
            return { // ALERTA[Xavi] el eventType i el dataToSend no cal passar-los al botò, queden fixats al callback
                id: params.id,
                description: params.description,
                callback: this._generateRequestControlCallback(params.extra.eventType,
                    params.extra.dataToSend)
            };
        },

        _createCancelButton: function() {
            return {
                id: this.type.CANCEL,
                description: 'Cancel·lar',
                callback:this._generateCancelCallback()
            }
        },

        _generateRequestControlCallback: function (event, dataToSend) {
            return function () {
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

        _addSection: function (node) {
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

