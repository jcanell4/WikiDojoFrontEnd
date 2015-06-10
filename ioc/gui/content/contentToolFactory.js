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
    "dojo/_base/declare",
    "dojo/_base/lang",
    "ioc/gui/content/ContentTool",
    "ioc/gui/content/DocumentContentTool",
    "ioc/gui/content/MetaInfoContentTool",
    "ioc/gui/content/EditorContentToolDecoration",
    "ioc/gui/content/requestReplacerFactory",
    "dojo/query", // Encara que no es cridi el dojo/query es necessari per que funcione la delegació dels listeners
    "dojo/on",
    "dojo/dom",
    "ioc/gui/content/AbstractContentToolListenersManagement",
], function (declare, lang, ContentTool, DocumentContentTool, MetaInfoContentTool, EditorContentToolDecoration,
             requestReplacerFactory, dojoQuery, on, dom, AbstractContentToolListenersManagement) {

    var ControlChangeContentToolDecoration = declare(null, {

            /** @typedef {{node:string, selector:string, callback:function}} ControlToCheck */

            /** @type {ControlToCheck[]} no es posa com a null perquè llavors falla al fer el mixin */
            //controlsToCheck: null,

            /**
             * Els arguments han de contenir una propietat controlsToCheck que es el array del que s'obtindrá la
             * informació per enllaçar els controls.
             */
            constructor: function (args) {
                declare.safeMixin(this, args);
            },

            /**
             * S'afegeixen tota la llista de controls a comprovar als nodes i events que corresponguin. Si no hi ha
             * un node especifica es fa servir el node pare d'aquest ContentTool.
             */
            postLoad: function () {

                //this.controlsToCheck.forEach(lang.hitch(this, function (control) {
                //    var node, handler;
                //
                //    if (control.node && typeof control.node === 'string') {
                //        node = dom.byId(control.node);
                //    } else {
                //        node = control.node || this.domNode;
                //    }
                //
                //
                //    if (node) {
                //        handler = on(node, control.selector, lang.hitch(this, control.callback));
                //    } else {
                //        console.error("No s'ha trobat el node: ", control);
                //    }
                //
                //    if (control.volatile) {
                //        console.log("VOLATILE!");
                //        this.addListenerHandler(handler);
                //    }
                //
                //
                //}));

                this._addListenersToControl(this.controlsToCheck);
                //TODO[Xavi] Compta! es dupliquen els handlers dels volatils cada vegada! la comprovació dels handlers
                // s'ha de fer per altre banda


                this.inherited(arguments);
                console.log("CRIDAT POSTLOAD A CONTROL CHANGE: ", this.id);
            },

            postRender: function () {

                //var handlers = this._addListenersToControl(this._getVolatileControls);

                this._addListenersToControl(this._getVolatileControls());

                this._resetcontrols();

                //this.addListenerHandler(handlers);
                console.log("AbstractContentToolListenersManagement#postRender()");

            },

            _resetcontrols: function () {
                var context = this,
                    resetableControls = this._getResetableControls();

                console.log("Controls resetables", resetableControls);

                resetableControls.forEach(function (control) {

                    //if (control.reset) {
                        //console.log("context que se va a pasar: ", context);
                        control.reset(context);
                        //control.reset();
                    //}

                });
            },

            _getResetableControls: function () {
                return this.controlsToCheck.filter(function (control) {
                    return control.reset ? true : false;
                });

            },

            _getVolatileControls: function () {
                return this._getControls(true);
            },

            _getNotVolatileControls: function () {
                return this._getControls(false);
            },

            _getControls: function (volatile) {
                var controls = this.controlsToCheck.filter(function (control) {
                    //console.log("*** VOLATIL :", volatile, control);

                    if (volatile) {
                        //console.log("Es volatil? ", control.volatile ? true : false);

                        return control.volatile ? true : false;
                    } else {
                        //console.log("NO Es volatil");
                        return control.volatile ? false : true;
                    }
                });

                //console.log("Retornant controls:", controls, volatile);
                return controls;
            },

            /**
             * Afegeix el listener al control, en cas de ser volatil l'afegeix al hash de listeners que s'esborraran
             * quan es fasi un render() i retorna la llista de aquests mateixos handlers volatils.
             *
             * TODO[Xavi] Actualment aquest valor de retorn no es fa servir per a res, es pot eliminar o canviar pel
             * array complet de handlers.
             *
             * @param listeners
             * @returns {Handler[]} - handlers corresponents als listeners volatils
             * @private
             */
            _addListenersToControl: function (listeners) {
                var handlers = [];

                listeners.forEach(lang.hitch(this, function (control) {


                    var node, handler;

                    if (!control.volatile) {

                    }

                    if (control.node && typeof control.node === 'string') {
                        node = dom.byId(control.node);
                    } else {
                        node = control.node || this.domNode;
                    }


                    if (node) {
                        handler = on(node, control.selector, lang.hitch(this, control.callback));
                    } else {
                        console.error("No s'ha trobat el node: ", control);
                    }

                    if (control.volatile) {
                        handlers.push(handler);
                        console.log("VOLATILE!");
                    }
                }));


                this.addListenerHandler(handlers);

                return handlers;


            },
            /**
             * Combina els arguments passats que han de ser soportats per aquest decorador amb el decorador ja
             * existent.
             *
             * @param args
             */
            merge:                  function (args) {
                this.controlsToCheck = this.controlsToCheck.concat(args.controlsToCheck);
                delete(args.controlsToCheck);
                declare.safeMixin(this, args);
            }
        }
    );


    var RequestContentToolDecoration = declare(AbstractContentToolListenersManagement,
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
        {


            /** @type Request @protecte*/
            requester: null,

            /** @private */
            replacers: {},

            /** @private */
            replacersParams: {},

            /** @private */
            //listeners: null; // es millor no declarar-lo per evitar problemes amb els mixins

            constructor: function (args) {
                if (args.requester) {
                    this.requester = args.requester;
                } else {
                    this._createRequest();
                }
                this.listenerHandlers = [];
            },

            /**
             * Carrega i genera un nou objecte Request. Aquest objecte no inclou urlBase, aquesta s'ha de passar
             * via el reemplaçador.
             *
             * @private
             */
            _createRequest: function () {

                require(["ioc/wiki30/Request"], lang.hitch(this, function (Request) {
                    this.requester = new Request();

                    this.requester.updateSectok = function (sectok) {
                        this.sectok = sectok;
                    };

                    this.requester.sectok = this.requester.dispatcher.getSectok();
                    this.requester.dispatcher.toUpdateSectok.push(this.requester);
                }));
            },

            /**
             * Aquest métode realitza la renderització de els dades i la substitució dels enllaços per crides AJAX.
             * @protected
             */
            render: function () {
                //console.log("ABANS de modificar el content");
                this.set('content', this.renderEngine(this.data));
                //console.log("DEPRÉS de modificar el content");

                //this.set('content', this.renderEngine(this.data));
                //this.removeListenerHandlers();
                this._replaceContent();
            },

            /**
             * Itera sobre tots els reemplaçadors afegits i realitza la substitució cridant a la funció de reemplaç
             * @private
             */
            _replaceContent: function () {
                var handler;


                for (var replacer in this.replacers) {
                    handler = lang.hitch(this, this.replacers[replacer])(this.replacersParams[replacer]);

                    if (this.replacersParams[replacer].volatile) {
                        this.addListenerHandler(handler);
                    } else {
                        delete(this.replacers[replacer]);
                        delete(this.replacersParams[replacer]);
                    }

                }

                this.inherited(arguments);
            },

            /**
             * Afegeix un reemplaçador de continguts específic.
             * TODO[Xavi] Cal que sigui un Hash o pot ser un array?
             *
             * @param {string} type - tipus per identificar aquest reemplaçador
             * @param {function} replacer - funció que es cridarà quan calgui fer el reemplaç
             * @param {*} params - arguments necessaris per efectuar el reemplaç
             */
            addReplacer: function (type, replacer, params) {
                if (!this.replacers) {
                    this.replacers = {};
                    this.replacersParams = {};
                }

                params.request = this.requester;
                this.replacersParams[type] = params;
                this.replacers[type] = replacer;
            },

            /**
             * Afegeix un hash de reemplaçadors.
             *
             * @param {{string:{type: string, replacer:function, params:{query: string, nodeId:string, trigger:string}}}} replacers
             */
            addReplacers: function (replacers) {
                for (var replacer in replacers) {
                    this.addReplacer(
                        replacers[replacer]['type'],
                        replacers[replacer]['replacer'],
                        replacers[replacer]['params']);
                }
            },

            //addListenerHandler: function (handler) {
            //    if (Array.isArray(handler)) {
            //        this.listenerHandlers = this.listenerHandlers.concat(handler)
            //    } else {
            //        this.listenerHandlers.push(handler);
            //    }
            //    console.log("RequestContentToolDecoration#addListenerHandler()");
            //
            //},
            //
            //removeListenerHandlers: function () {
            //    console.log("RequestContentToolDecoration#removeListenerHandlers()");
            //    this.listenerHandlers.forEach(function (handler) {
            //        handler.remove();
            //        console.log("Eliminat");
            //    });
            //
            //    this.listenerHandlers = [];
            //}
        });

    return {
        /** @enum */
        decoration: {
            EDITOR:          'editor',
            REQUEST:         'request',
            REQUEST_LINK:    'request_link',
            REQUEST_FORM:    'request_form',
            CONTROL_CHANGES: 'control_changes'
        },

        /** @enum */
        generation: {
            BASE:     'base',
            META:     'meta',
            DOCUMENT: 'document'
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
            args.requester = contentTool.requester;

            //this._mixArrays(contentTool, args);

            //console.log(args.listenerHandlers);

            //console.log("Hi ha arguments al decorador?", args);

            switch (type) {
                //                case this.decoration.META:
                //                    decoration = new MetaContentToolDecoration(args);
                //                    break;

                case this.decoration.EDITOR:
                    decoration = new EditorContentToolDecoration(args)
                    break;

                case this.decoration.REQUEST:
                    //Aquest request no afegeix res, els replaces han d'anar ja afegits als arguments dins del
                    //args.replacers.
                    //
                    //Aquest es un exemple de com s'afegiría el tipus link manualment:

                    //args.replacers = {
                    //    'link': {
                    //        type: 'link',
                    //        replacer: requestReplacerFactory.getRequestReplacer('link'),
                    //        params: {
                    //            trigger: "click",
                    //            urlBase: args.urlBase
                    //
                    //        }
                    //    }
                    //};
                    decoration = new RequestContentToolDecoration(args);

                    if (args.replacers) {
                        decoration.addReplacers(args.replacers);
                    }

                    break;

                case this.decoration.REQUEST_LINK:
                    decoration = new RequestContentToolDecoration(args);
                    decoration.addReplacer('link', requestReplacerFactory.getRequestReplacer('link'), {
                        trigger:       "click",
                        urlBase:       args.urlBase,
                        standbyTarget: args.standbyTarget,
                        volatile:      false
                    });
                    break;

                case this.decoration.REQUEST_FORM:
                    decoration = new RequestContentToolDecoration(args);
                    decoration.addReplacer('form', requestReplacerFactory.getRequestReplacer('form'), {
                        trigger:       "click",
                        urlBase:       args.urlBase,
                        form:          args.form,
                        standbyTarget: args.standbyTarget,
                        volatile:      false
                    });
                    break;

                case this.decoration.CONTROL_CHANGES:
                    if (!args.controlsToCheck) {
                        console.error("Error: s'ha de passar un array amb la informació dels controls a observar");
                    } else {

                        if (!Array.isArray(args.controlsToCheck)) {
                            args.controlsToCheck = [args.controlsToCheck];
                        }

                        if (contentTool.controlsToCheck) {
                            contentTool.merge(args);
                        } else {
                            decoration = new ControlChangeContentToolDecoration(args);
                        }
                    }

                    break;


                default:
                    console.error('No existeix el tipus de decoració ' + type);
            }

            if (decoration) {
                return declare.safeMixin(contentTool, decoration);
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

                default:
                    console.error('No existeix el tipus de ContentTool ' + type);
            }
        },

        ///**
        // * Aquest métode comprova si hi ha coincidencia entre els arrays dels arguments i del ContentTool i si es el cas
        // * els concatena i els passa als arguments que es faran servir al decorador.
        // *
        // * Això permet que els valors originals dels arrays no es perdin en el cas de que es generi el mateix array al
        // * nou decorador.
        // *
        // * Els valors no son eliminats del ContentTool original perquè no sempre son reemplaçats.
        // *
        // * El valor dels arguments s'ajusta per referència per això no es retorna cap valor.
        // *
        // * @param {ContentTool} contentTool
        // * @param {*} args
        // * @private
        // */
        //_mixArrays: function (contentTool, args) {
        //    //args.listenerHandlers = ["test"];
        //
        //    // TODO[Xavi] Prova: es poden extreure els arrays del contentTool?
        //    console.log(".......................");
        //    console.log("ID: ", contentTool.id, contentTool);
        //    for (var property in contentTool) {
        //        //if (contentTool.hasOwnProperty(property)) {
        //        //    console.log("Checking: ", property);
        //        //}
        //
        //        if (contentTool.hasOwnProperty(property) && Array.isArray(contentTool[property])) {
        //            console.log("Trobat array (PROPI):", property,contentTool[property].length);
        //            if (args[property]) {
        //                if (!Array.isArray(args[property])) {
        //                    console.error("S'ha trobat la propietat " + property+ " però no era un array.");
        //                } else {
        //                    args[property] = contentTool[property].concat(args[property]);
        //                    console.log("Afegits arrays", args[property]);
        //                }
        //            }
        //        }
        //
        //    }
        //    console.log(".......................");
        //
        //}
    }
});