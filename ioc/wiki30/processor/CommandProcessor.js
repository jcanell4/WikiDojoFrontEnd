define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/AbstractResponseProcessor",
    "dijit/registry", //search widgets by id
    "dojo/dom-style",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/_base/kernel"
], function (declare, AbstractResponseProcessor, registry, domStyle, lang, array, dojo) {
    var ret = declare("ioc.wiki30.processor.CommandProcessor", [AbstractResponseProcessor],
        /**
         * @class ioc.wiki30.processor.CommandProcessor
         * @extends {ioc.wiki30.processor.AbstractResponseProcessor}
         *
         * @typedef {object} DijitWidget widget
         * @typedef {object} DijitContainer contenidor
         */
        {
            type: "command", // TODO[Xavi] Moure la declaració al constructor?


            processors: {}, // TODO[Xavi] S'afegeixen enlloc?

            constructor: function () {
                this.inherited(arguments); // TODO[Xavi] Això te cap efecte?
                //           this.processors["alert"]=new AlertProcessor();
            },

            /**
             * @param {object} value
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @override
             */
            process: function (value, dispatcher) {
                this._processCommand(value, dispatcher);
            },

            /**
             * @param {object} command
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @private
             */
            _processCommand: function (command, dispatcher) {

                // TODO[Xavi] No hi ha processors, això es necessari?
                if (this.processors[command.type]) {
                    this.processors[command.type].process(command, dispatcher);

                } else {
                    if (command.type === "change_dom_style") {
                        this._processChangeStyleCommand(command, dispatcher);

                    } else if (command.type === "change_widget_property") {
                        this._processChangeWidgetPropertyCommand(command, dispatcher);

                    } else if (command.type === "reaload_widget_content") {
                        this._processRefresh(command, dispatcher);

                    } else if (command.type === "remove_widget_child") {
                        this._processRemoveWidgetChild(command, dispatcher);

                    } else if (command.type === "remove_all_widget_children") {
                        this._processRemoveAllChildrenWidgets(command, dispatcher);

                    } else if (command.type === "process_dom_from_function") {
                        this._processDomFromFuntcion(command, dispatcher);

                    } else if (command.type === "process_function") {
                        this._processFuntcion(command, dispatcher);

                    } else if (command.type === "jsinfo") {
                        this._processJsInfo(command, dispatcher);

                    }
                }
            },

            /**
             * @param {object} command
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @private
             */
            _processRefresh: function (command, dispatcher) {
                var tabId = registry.byId(command.id);
                if (tabId.refresh) {
                    tabId.refresh();
                } else {
                    dispatcher._processError("Aquest element: " + command.id + " no té mètode refresh.");
                }
            },

            /**
             * @param {*} command
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @private
             */
            _processRemoveWidgetChild: function (command, dispatcher) {
                dispatcher.removeWidgetChild(command.id, command.childId)
                return 0;
            },

            /**
             * @param {object} command
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @private
             */
            _processRemoveAllChildrenWidgets: function (command, dispatcher) {
                var node = registry.byId(command.id);
                dispatcher.removeAllChildrenWidgets(node);
            },

            /**
             * @param {object} command
             * @private
             */
            _processChangeWidgetPropertyCommand: function (command) {
                var widget = registry.byId(command.id);
                widget.set(command.propertyName, command.propertyValue);
            },

            /**
             *
             * @param {object} command
             * @private
             */
            _processChangeStyleCommand: function (command) {
                domStyle.set(command.id, command.propertyName, command.propertyValue);
            },

            // TODO[Xavi] Es fa servir enlloc?
            _processWidgetCommand:      function (command) {
                var widget = registry.byId(command.componentId);
                if (lang.isArray(command.toExecute)) {
                    array.forEach(command.toExecute, function (responseItem) {
                        widget.processCommand(responseItem);
                    });
                } else {
                    widget._processResponse(command.toExecute);
                }
            },

            /**
             * TODO[Xavi] Typo en el nom
             * @param {object} command
             * @private
             */
            _processDomFromFuntcion: function (command) {

                if (command.amd) {
                    require(new Array(command.processName), function (process) {
                        process(command.id, command.params);
                    });
                } else {
                    var cmd = command.processName;
                    cmd += "('" + command.id + "'";
                    if (command.params) {
                        for (var par in command.params) {
                            cmd += ", '" + par + "'";
                        }
                    }
                    cmd += ")";
                    dojo.eval(cmd);
                }
            },

            /**
             * TODO[Xavi] typo en el nom
             * @param {object} command
             * @private
             */
            _processFuntcion: function (command) {
                if (command.amd) {
                    require(new Array(command.processName), function (process) {
                        process(command.params);
                    });
                } else {
                    var i;
                    var cmd = command.processName;
                    cmd += "(";
                    if (command.params) {
                        for (i = 0; i < command.params.length; i++) {
                            if (i > 0) {
                                cmd += ", ";
                            }
                            cmd += "'" + command.params + "'";
                        }
                    }
                    cmd += ")";
                    dojo.eval(cmd);
                }
            },

            /**
             *
             * @param {object} command
             * @private
             */
            _processJsInfo: function (command) {
                lang.mixin(window.JSINFO, command.value);
            }
        });
    return ret;
});

