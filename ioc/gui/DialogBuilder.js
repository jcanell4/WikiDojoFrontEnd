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
            REQUEST_CONTROL: 'request_control'
        },

        constructor: function (args) {

            this.dispatcher = args.dispatcher;
            this.params = args;

            if (args.content) {
                throw new DialogBuilderException("No es pot afegir una propietat 'content' a aquests dialegs");
            }

            this.params.sections = [];
            this.params.initFunctions = [];
            this.params.buttons = [];
            this.params.nextDialog = {};
            this.params.nextCallback = {};

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

                default:
                    throw new DialogBuilderException("No existeix el tipus de botó: " + type);
            }


            this._addButton(button);

            return this;
        },

        _createRequestButton: function (params) {
            return { // ALERTA[Xavi] el eventType i el dataToSend no cal passar-los al botò, queden fixats al callback
                id: params.id,
                description: params.description,
                callback: this._generateRequestControlCallback(params.extra.eventType,
                    params.extra.dataToSend)
            };
        },

        _generateRequestControlCallback: function (eventType, dataToSend) {

            return function () {
                console.log("que es això:", this);
                //var id = this.getAttribute('id'),
                //    eventType= this.getAttribute('eventtype'),
                //    dataToSend = this.getAttribute('datatosend');

                console.log("Callback de dialog:", eventType, dataToSend);

                this.eventManager.dispatchEvent(eventType, { // Això fa referencia al eventManager del dialog
                    id: this.id,
                    dataToSend: dataToSend
                });
            }
        },


        addDiff: function (text1, text2, text1Label, text2Label) {
            console.log('DialogBuilder#addDiff');
            // Crear un node per contenir el getDiff, i afegir-li la classe class="diff-dialog-diff"
            var node = document.createElement('div'),
                diffNode = jsdifflib.getDiff(text1, text2, text1Label, text2Label);

            node.className = 'diff-dialog-diff';
            node.appendChild(diffNode);

            console.log("Node per afegir:", node, diffNode);

            this._addSection(node);
            return this;
        },

        _addSection: function (node) {
            // Afegeix el codi html que ha de correspondre a un node al array de seccions
            this.params.sections.push(node);
        },

        _addButton: function (button) {
            this.params.buttons.push(button);
        },

        addTimeout: function (timeout) {
            // En acabar el temps:
            // - es dispara l'event 'TIMEOUT'
            // - es tanca el dialog
            this._addInitFunction(function () {
                setTimeout(function () {
                    // Trigger event
                    this.dispatchEvent('TIMEOUT', {id: this.id});
                    this.destroy();
                }, timeout).bind(this) // El context del timer serà el propi dialog
            });

            return this;
        },

        _addInitFunction: function (func) {
            // afegeix la funció a la seqüencia d'inicialització
            this.params.initFunctions.push(func);
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
            if (!this.params.nextCallback[event]) {
                this.params.nextCallback[event] = [];
            }

            this.params.nextCallback[event].push(callback);

            return this;
        },


        build: function () {
            console.log("Params pel constructor del dialog:", this.params);
            return new CustomDialog(this.params);
        }


    });

});

