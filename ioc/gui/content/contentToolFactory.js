/**
 * Aquest mòdul exposa la creació i decoració de objectes ContentTool a través dels métodes públics les propietats
 * que exposa.
 *
 * Tots els tipus de ContentTool seran creats i decorats a travès d'aquesta factoria, sent les classes específiques tant
 * per instancar-los com per decorar-los privades a aquest mòdul.
 *
 * Encara que actualment el codi d'un o mès d'aquestes classes es trobi en un fitxer independent s'ha de considerar
 * que son privats a aquesta classe i així s'han anotat.
 *
 * No es pot garantir que les classes marcades com a privades siguien accessibles en el futur.
 *
 * @module contentToolFactory
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define([
        "dojo/_base/lang",
        "ioc/gui/content/ContentTool",
        "ioc/gui/content/DocumentContentTool",
        "ioc/gui/content/MetaInfoContentTool",
        "ioc/gui/content/EditorContentTool",
        "ioc/gui/content/requestReplacerFactory",
        "dojo/query", // Encara que no es cridi el dojo/query es necessari per que funcione la delegació dels listeners
        "dojo/on",
        "dojo/dom",
    ], function (lang, ContentTool, DocumentContentTool, MetaInfoContentTool, EditorContentTool,
                 requestReplacerFactory, dojoQuery, on, dom ) {

        var patch = function (target, source) {
                return function () {
                    source.apply(this, arguments);
                    return target.apply(this, arguments);
                }
            },

            mix = function (target, source) {
                var targetProp, sourceProp;

                for (var prop in source) {
                    targetProp = target[prop];
                    sourceProp = source[prop];

                    if (!targetProp) { // No existeix la propietat, reemplacem
                        target[prop] = sourceProp;

                    } else if (typeof source[prop] === 'function') {
                        //console.log("Aplicant patch per funció: ", prop);
                        target[prop] = patch(targetProp, sourceProp);

                    } else if (Array.isArray(source[prop])) {
                        console.warn("S'ha decorat amb un array, el valor reemplaçarà als enteriors.");
                        target[prop] = sourceProp;

                    } else {
                        target[prop] = sourceProp;
                    }
                }

                return target;
            },

            /**
             * Els arguments han de contenir una propietat controlsToCheck que es el array del que s'obtindrá la
             * informació per enllaçar els controls.
             */
            ControlChangeContentToolDecoration = function (args) {

                if (!args.controlsToCheck) {
                    console.error("Error: s'ha de passar un array amb la informació dels controls a observar");
                    args.controlsToCheck = [];
                }


                if (!Array.isArray(args.controlsToCheck)) {
                    args.controlsToCheck = [args.controlsToCheck];
                }

                var _resetcontrols = function () {
                        var context = this,
                            resetableControls = _getResetableControls();

                        resetableControls.forEach(function (control) {
                            control.reset(context);
                        });
                    },

                    _getResetableControls = function () {
                        return args.controlsToCheck.filter(function (control) {
                            return control.reset ? true : false;
                        });

                    },

                    _getVolatileControls = function () {
                        return _getControls(true);
                    },

                    _getNotVolatileControls = function () {
                        return _getControls(false);
                    },

                    _getControls = function (volatile) {
                        return args.controlsToCheck.filter(function (control) {
                            if (volatile) {
                                return control.volatile ? true : false;
                            } else {
                                return control.volatile ? false : true;
                            }
                        });
                    },

                    /**
                     * Afegeix el listener al control, en cas de ser volatil l'afegeix al hash de listeners que s'esborraran
                     * quan es fasi un render() i retorna la llista de aquests mateixos handlers volatils.
                     *
                     * TODO[Xavi] Actualment aquest valor de retorn no es fa servir per a res, es pot eliminar o canviar pel
                     * array complet de handlers.
                     *
                     * @param listeners
                     * @returns {Handler[]} - handlers a afegir
                     * @private
                     */
                    _addListenersToControl = function (listeners) {
                        var handlers = [],
                            self = this;

                        listeners.forEach(lang.hitch(this, function (control) {

                            var node, handler;

                            if (control.node && typeof control.node === 'string') {
                                node = dom.byId(control.node);
                            } else {
                                node = control.node || self.domNode;
                            }

                            if (node) {
                                handler = on(node, control.selector, lang.hitch(this, control.callback));
                            } else {
                                console.error("No s'ha trobat el node: ", control);
                            }

                            if (control.volatile) {
                                handlers.push(handler);
                            }
                        }));

                        this.addListenerHandler(handlers);

                        return handlers;
                    };

                return {
                    /**
                     * S'afegeixen tota la llista de controls a comprovar als nodes i events que corresponguin. Si no hi ha
                     * un node especifica es fa servir el node pare d'aquest ContentTool.
                     */
                    postAttach: function () {
                        console.log("ControlChangeContentToolDecoration#postAttach", this.id);
                        var controls = lang.hitch(this, _getNotVolatileControls)();
                        lang.hitch(this, _addListenersToControl)(controls);
                    },

                    postRender: function () {
                        console.log("ControlChangeContentToolDecoration#postRender", this.id);
                        var controls = lang.hitch(this, _getVolatileControls)();
                        lang.hitch(this, _addListenersToControl)(controls);
                        lang.hitch(this, _resetcontrols)();

                    }

                }
            };


        /**
         * Aquesta classe es una decoració i requereix que es faci un mixin amb un ContentTool per poder funcionar.
         *
         * Aquesta decoració reemplaça els continguts que enllacin a altres direccións per crides ajax que
         * respondran a diferents esdevenimets.
         *
         * @class RequestContentToolDecoration
         * @extends ContentTool, AbstractContentToolListenersManagement
         * @private
         */
        var RequestContentToolDecoration = function (args) {

            /**
             * Carrega i genera un nou objecte Request. Aquest objecte no inclou urlBase, aquesta s'ha de passar
             * via el reemplaçador.
             *
             * @private
             */
            var requester = args.requester,
                replacers = args.replacers || {},

                /**
                 * Itera sobre tots els reemplaçadors afegits i realitza la substitució cridant a la funció de reemplaç
                 * @private
                 */
                _replaceContent = function () {
                    var handler;

                    for (var type in replacers) {
                        var replacer = replacers[type],
                            params = replacer.params;

                        params.request = requester;

                        handler = lang.hitch(this, replacer.replacer)(params);

                        if (params.volatile) {

                            this.addListenerHandler(handler);

                        } else {

                            delete(replacers[type]);

                        }

                    }
                };

            // si no existeix el requester es genera un de nou
            (function () {

                if (!requester) {
                    require(["ioc/wiki30/Request"], lang.hitch(this, function (Request) { // TODO[Xavi] comprovar si cal el hitch, no es fa servir el this per a res
                        requester = new Request();

                        requester.updateSectok = function (sectok) {
                            this.sectok = sectok;
                        };

                        requester.sectok = requester.dispatcher.getSectok();
                        requester.dispatcher.toUpdateSectok.push(requester);
                    }));
                }
            })();


            return {

                /**
                 * Aquest métode realitza la renderització de els dades i la substitució dels enllaços per crides AJAX.
                 * @protected
                 */
                postRender: function () {
                    console.log("RequestContentToolDecoration#postRender", this.id);
                    lang.hitch(this, _replaceContent)();
                }

            };

        };

        return {
            /** @enum */
            decoration: {
                REQUEST:         'request',
                REQUEST_LINK:    'request_link',
                REQUEST_FORM:    'request_form',
                CONTROL_CHANGES: 'control_changes'
            },

            /** @enum */
            generation: {
                BASE:     'base',
                META:     'meta',
                DOCUMENT: 'document',
                EDITOR:    'editor'
            },

            /**
             * Decora el ContentTool amb el tipus de decoració i valors passats com arguments.
             *
             * Aquest mètode es cridat automàticament pels ContentTools, no cal cridar-lo manualment.
             *
             * @param {string} type - Tipus de decoració
             * @param {ContentTool} contentTool - ContentTool a decorar
             * @param {*} args - Arguments necessaris per configurar la decoració
             * @returns {ContentTool} - ContentTool decorat
             * @protected
             * @see ContentTool.decorate()
             */
            decorate: function (type, contentTool, args) {
                var decoration;
                args = args ? args : {};


                // Aquesta comprovació es genèrica per tots els decoradors de tipus request
                if (type.indexOf("request")>-1 && !args.replacers) {
                    args.replacers = {};
                }

                switch (type) {

                    case this.decoration.REQUEST:
                        decoration = new RequestContentToolDecoration(args);

                        break;

                    case this.decoration.REQUEST_LINK:

                        args.replacers['link'] = {
                            type:     'link',
                            replacer: requestReplacerFactory.getRequestReplacer('link'),
                            params:   {
                                trigger:       "click",
                                urlBase:       args.urlBase,
                                standbyTarget: args.standbyTarget,
                                volatile:      false
                            }
                        };

                        decoration = new RequestContentToolDecoration(args);

                        break;

                    case this.decoration.REQUEST_FORM:

                        args.replacers['form'] = {
                            type:     'form',
                            replacer: requestReplacerFactory.getRequestReplacer('form'),
                            params:   {
                                trigger:       "click",
                                urlBase:       args.urlBase,
                                form:          args.form,
                                standbyTarget: args.standbyTarget,
                                volatile:      false
                            }
                        };

                        decoration = new RequestContentToolDecoration(args);

                        break;

                    case this.decoration.CONTROL_CHANGES:

                        decoration = new ControlChangeContentToolDecoration(args);

                        break;


                    default:
                        console.error('No existeix el tipus de decoració ' + type);
                }

                if (decoration) {
                    //console.log("Type: ", type);
                    return mix(contentTool, decoration);
                    //return declare.safeMixin(contentTool, decoration);
                }
                else {
                    return contentTool;
                }
            },

            /**
             * Genera un ContentTool del tipus especificat amb els arguments passats.
             *
             * @param {string} type - Tipus del ContentTool a generar
             * @param {*} args -
             * @returns {ContentTool} - ContentTool instanciat
             */
            generate: function (type, args) {
                args.decorator = this;

                switch (type) {
                    case this.generation.BASE:
                        return new ContentTool(args);

                    case this.generation.META:
                        return new MetaInfoContentTool(args);

                    case this.generation.DOCUMENT:
                        return new DocumentContentTool(args);

                    case this.generation.EDITOR:
                        return new EditorContentTool(args);
                        break;

                    default:
                        console.error('No existeix el tipus de ContentTool ' + type);
                }
            }

        }
    }
);
