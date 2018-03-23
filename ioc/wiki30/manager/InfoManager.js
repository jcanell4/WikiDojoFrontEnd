define([
        'dojo/_base/declare',
        'dojo/dom',
        'dojo/_base/lang'
    ], function (declare, dom, lang) {
        return declare(null,
            /**
             * Gestiona la informació guardada al GloblState i com s'ha de mostrar.
             *
             * @class InfoManager
             * @author Xavier Garcia <xaviergaro.dev@gmail.com>
             */

            /**
             * Estructura que conté la informació a mostrar en el panell d'informació.
             *
             * @typedef {{type: string, message: string|string[], duration: int, id: string?}} Info
             */

            /**
             * Estructura que conte tot el magatzem de dades.
             *
             * @typedef {{timer:{global:int?,document:{string:int?}}, currentInfo:{global:Info?,document:{string:Info?}}, storedInfo:{global:Info?, document:{string:Info?}}}} InfoStorage
             */
            {
                /** @type: {Dispatcher} */
                dispatcher: null,

                EMPTY_INFO: {type: "", message: "", duration: -1, timestamp: ""},

                constructor: function (dispatcher) {
                    this.dispatcher = dispatcher;
                },

                /**
                 * Retorna una cadena amb les etiquetes CSS que defineixen el estil a aplicar segons el type que
                 * correspongui a la info passada com argument.
                 *
                 * TODO[Xavi] El contingut d'aquest mètode es provisional, l'he afegit per deixar-lo preparat per
                 * quan calgui aplicar un format diferent segons els tipus de info.
                 *
                 * @param {Info} info - Info a donar estil
                 * @returns {string} - Cadena amb el codi CSS generat
                 * @private
                 */
                _stylizeInfo: function (info) {
                    var style = "";

                    switch (info.type) {
                        case "error":
                            style = "color:#D8000C;background-color:#FFBABA;";
                            break;

                        case "success":
                            style = "color:#4f8A10;background-color:#DFF2BF;";
                            break;

                        case "warning":
                            style = "color:#9F6000;background-color:#FEEFB3;";
                            break;

                        case "info":
                            style = "color:#00529B;background-color:#BDE5F8;";
                            break;
                            
                        case "notify":
                            style = "color:#00529B;background-color:#BDE5F8;";
                            break;

                        default:
                            style = "border:none";
                            break;
                    }



                    return style;
                },

                /**
                 * Formata el element info passat com argument com una taula en la que la primera columna mostra el
                 * timestamp, i la segona el contingut.
                 *
                 * En cas de que hi hagi més d'una fila de missatges les següents no mostren res a la primera columna.
                 *
                 * També s'aplica el estil segons la informació trobada a la info.
                 *
                 * @param {Info} info - Informació a mostrar
                 * @return {string} Cadena HTML amb la info formatada.
                 * @private
                 */
                _formatInfoToHTMLWithTimestamp: function (info) {
                    var html,
                        style = this._stylizeInfo(info);

                    html = "<table style=\"" + style + ";width:100%;text-align:left\">";
                    if (Array.isArray(info.message)) {
                        var primeraLinia = true;
                        for (var i = info.message.length - 1; i >= 0; i--) {
                            html += "<tr>";
                            if (primeraLinia) {
                                html += "<td style = \"width:1%;white-space:nowrap\">" + info.timestamp + "</td>";
                                primeraLinia = false;
                            } else {
                                html += "<td></td>";
                            }

                            html += "<td>" + info.message[i] + "</div>";
                            html += "</tr>";
                        }
                    } else {
                        html += "<tr style=\"" + style + "\">";
                        html += html += "<td style = \"width:1%;white-space:nowrap\">" + info.timestamp + "</td>";
                        html += "<td>" + info.message + "</div>";
                        html += "</tr>";

                    }

                    html += "</table>";
                    return html;
                },

                /**
                 * Formata el element info passat com argument com a un missatge simple.
                 *
                 * @param {Info} info - Info a formatar
                 * @return {string} - Cadena HTML amb la info formatada.
                 * @private
                 */
                _formatInfoToHTMLSimple: function (info) {
                    var html = "";

                    if (Array.isArray(info.message)) {
                        for (var i = info.message.length - 1; i >= 0; i--) {
                            html += "<div>" + info.message[i] + "</div>";
                        }
                    } else {
                        html += "<div>" + info.message + "</div>";
                    }

                    return html;
                },

                /**
                 * Retorna el magatzem de informació lligat a aquest gestor.
                 *
                 * @returns {InfoStorage} - Magatzem de dades
                 * @private
                 */
                _getInfoStorage: function () {
                    return this.dispatcher.getGlobalState().getInfoStorage();
                },


                /**
                 * Estableix una informació. Segons el tipus s'activarà el temporitzador corresponent i es cancel·laran
                 * els previs i es mostrarà on correspongui, es a dir activa automàticament el refresc.
                 *
                 * @param {Info} info - info a mostrar
                 */
                setInfo: function (info) {
                    this._cancelInfoTimer(info);

                    if (info.duration && info.duration > 0) {
                        this._setInfoTimer(info);
                    } else {
                        this._setStoredInfo(info);
                    }

                    this._setCurrentInfo(info);
                    this.refreshInfo(info.id);
                },

                /**
                 * Comprova si existeix cap temporitzador lligat a la id de aquesta info i si es així el cancel·la.
                 *
                 * @param {Info} info - Info que conté el id necessari per cancel·lar el timer.
                 * @private
                 */
                _cancelInfoTimer: function (info) {
                    var timerId;

                    if (info.id && info.id.length > 0) {
                        if (this._getInfoStorage().timer.document[info.id]) {
                            timerId = this._getInfoStorage().timer.document[info.id];
                            clearTimeout(timerId);
                            delete this._getInfoStorage().timer.document[info.id];
                        }

                    } else {
                        timerId = this._getInfoStorage().timer.global;
                        clearTimeout(timerId);
                        delete this._getInfoStorage().timer.global;
                    }

                },

                /**
                 * Inicialitza un temporitzador amb una duració en segons igual a la propietat duration de la informació
                 * passada com argument.
                 *
                 * @param {Info} info - Info amb la id i duration necessaries per inicialitzar el temporitzador
                 * @private
                 */
                _setInfoTimer: function (info) {
                    var timerId = setTimeout(lang.hitch(this, this._restoreInfo), info.duration * 1000, info);

                    if (info.id && info.id.length > 0) {
                        this._getInfoStorage().timer.document[info.id] = timerId;
                    } else {
                        this._getInfoStorage().timer.global = timerId;
                    }

                },

                /**
                 * Estableix la informació actual al magatzem. Aquesta informació no persisteix en cas de recarrega.
                 *
                 * @param {Info} info - Info a establir com actual
                 * @private
                 */
                _setCurrentInfo: function (info) {
                    if (info.id && info.id.length > 0) {
                        this._getInfoStorage().currentInfo.document[info.id] = info;
                    } else {
                        this._getInfoStorage().currentInfo.global = info;
                    }
                },

                /**
                 * Estableix la informació com a persistent al magatzem.
                 * @param {Info} info - Info a establir com a persistent.
                 * @private
                 */
                _setStoredInfo: function (info) {
                    if (info.id && info.id.length > 0) {
                        this._getInfoStorage().storedInfo.document[info.id] = info;
                    } else {
                        this._getInfoStorage().storedInfo.global = info;
                    }
                },

                /**
                 * Restaura la informació emmagatzemada de forma persistent.
                 * @param {Info} info - Informació que conté el id de la informació a restaurar.
                 * @private
                 */
                _restoreInfo: function (info) {
                    var currentInfo = {
                        type:    "error",
                        message: "No hi ha cap missatge anterior per mostrar",
                        id:      info.id
                    };

                    if (info.id && info.id.length > 0) {

                        if (this._getInfoStorage().storedInfo.document[info.id]) {
                            currentInfo = this._getInfoStorage().storedInfo.document[info.id];
                        }
                        this._getInfoStorage().currentInfo.document[info.id] = currentInfo;
                        delete this._getInfoStorage().timer.document[info.id];

                    } else {
                        if (this._getInfoStorage().storedInfo.global) {
                            currentInfo = this._getInfoStorage().storedInfo.global;
                        }

                        this._getInfoStorage().currentInfo.global = currentInfo;
                        delete this._getInfoStorage().timer.global;
                    }

                    this.refreshInfo(currentInfo.id);
                },

                /**
                 * Retorna la informació actual per la id passada com argument. Aquesta id correspon a la del document,
                 * si no es passa cap es retorna la info global.
                 *
                 * @param {string?} id - Identificador de la informació que volem obtenir
                 * @returns {Info} - Informació actual a mostrar per la id passada com argument
                 */
                getInfo: function (id) {
                    var currentInfo = {type: "error", message: "No hi ha cap missatge per mostrar"};

                    if (id && id.length > 0) {
                        currentInfo = this._getInfoStorage().currentInfo.document[id]

                    } else {
                        currentInfo = this._getInfoStorage().currentInfo.global;
                    }
                    return currentInfo
                },

                /**
                 * Refresca o mostra la informació enllaçada amb el id passat com argument però només en el cas de que
                 * es tract d'un missatge global o correspongui amb el document actualment actiu. En cas contrari la
                 * acció es ignorada.
                 *
                 * TODO[Xavi] Es podria actualitzar per fer servir l'observador del dispatcher i no fer el refresc manualment
                 *
                 * @param {string?} id - Id del document del que volem mostrar la info, o null per mostrar el global.
                 */
                refreshInfo: function (id) {
                    var info = null,
                        currentId = this.dispatcher.getGlobalState().getCurrentId();

                    if (id && id.length > 0 && id === currentId) {
                        info = this.getInfo(id);
                        // console.log("Estructura de l'info:", info);

                    } else if (id === null || typeof id === 'undefined' || id.length === 0) {


                        info = this.getInfo() || this.getClearInfo();
                        // console.log("Recuperat el info global:", info);

                    } else {
                        //alert("El id ["+id+"] no coincideix amb el document actual ["+ currentId +"], i no es tracta d'un missatge global. No cal refrescar res");
                    }

                    if (info != null) {
                        dom.byId(this.dispatcher.infoNodeId).innerHTML = this._formatInfoToHTMLWithTimestamp(info);
                        //dom.byId(this.dispatcher.infoNodeId).innerHTML = this._formatInfoToHTMLSimple(info);
                    }
                },

                /**
                 * Recarrega la info amb la informació passada com argument, descartant tota la informació referent
                 * als temporitzadors, i establint la informació persistent com la actual.
                 *
                 * @param {InfoStorage} infoStorage - Magatzem de dades a carregar
                 */
                loadInfoStorage: function (infoStorage) {
                    infoStorage.timer.document = {};
                    infoStorage.timer.global = null;

                    infoStorage.currentInfo.global = lang.clone(infoStorage.storedInfo.global);
                    infoStorage.currentInfo.document = lang.clone(infoStorage.storedInfo.document);

                    this.dispatcher.getGlobalState().setInfoStorage(infoStorage);
                },

                getClearInfo: function() {
                    var currentDocumentId = this.dispatcher.getGlobalState().getCurrentId();

                    if (currentDocumentId) {
                        return this.getInfo(currentDocumentId);
                    } else {
                        return this.EMPTY_INFO;
                    }

                }
            }


        )
    }
);