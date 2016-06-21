define([
    "dojo/_base/declare",
    "dijit/registry",
    "dojo/dom-style"
], function (declare, registry, style) {
    /**
     * @class LocalUserConfig
     */
    var ret = declare(null, {
        /* localStorage.userConfig és l'objecte que conté els objectes de configuració dels usuaris,
         * conté un objecte de configuració per a cada usuari identificat pel nom d'usuari 
         * localStorage.userConfig = '{"<user_name>":{"panelPosition":{"left":"<left>", "rigth":"<rigth>", "bottom":"<bottom>"}}}'
         */
        lsuc: null,
        lsucDefault: null,

        /**
         * lsuc: contiene un objeto que almacena para la sesión del usuario 
         * los valores personalizados del tamaño de los contenedores
         * 
         * lsucDefault: contiene un objeto que almacena para la sesión del usuario 
         * los valores por defecto del tamaño de los contenedores
         */
        constructor: function() {
           this.lsuc = {panelPosition:{}};
           this.lsucDefault = {};
        },
        
        /*
         * almacena en lsucDefault los valores por defecto del tamaño de los contenedores
         */
        setUpUserDefaultPanelsSize: function(dispatcher) {
            var node;
            node = registry.byId(dispatcher.leftPanelNodeId).domNode;
            this.lsucDefault.left = style.get(node, "width");
            node = registry.byId(dispatcher.rightPanelNodeId).domNode;
            this.lsucDefault.right = style.get(node, "width");
            node = registry.byId(dispatcher.bottomPanelNodeId).domNode;
            this.lsucDefault.bottom = style.get(node, "height");
        },
        
        /*
         * Establece los valores del tamaño de los contenedores con los valores por defecto y
         * elimina los posibles valores previos de lsuc.
         * Se produce cuando no hay un usuario activo (con login)
         */
        setUserDefaultPanelsSize: function(dispatcher) {
            if (this.lsucDefault) {
                this.setUserPanelsSize(dispatcher, this.lsucDefault);
                this.lsuc = {panelPosition:{}};
            }
        },
        
        /*
         * Recupera y establece los valores del tamaño de los contenedores 
         * con los valores del usuario previamente almacenados (si los hubiere)
         */
        loadUserConfig: function(dispatcher, user) {
            var panel = this.getUserPanelsSize(user);
            if (panel) {
                this.setUserPanelsSize(dispatcher, panel);
            }
        },
        
        /**
         * Recupera los valores particulares del usuario del tamaño de los contenedores y
         * los almacena en la variable lsuc para su uso durante la sesión de usuario
         * @returns {obj} valores del tamaño de los contenedores
         */
        getUserPanelsSize: function(user) {
            var ret = null;
            if (localStorage.UserConfig) {
                var panel = JSON.parse(localStorage.UserConfig);
                if (panel[user]) {
                    ret = {"left":   panel[user].panelPosition.left,
                           "right":  panel[user].panelPosition.right,
                           "bottom": panel[user].panelPosition.bottom
                          };
                    this.lsuc.panelPosition = ret;
                    return ret;
                }
            }
        },
        
        /**
         * Asigna a los widgets los nuevos valores del tamaño de los contenedores y
         * obliga a la redimensión del BorderContainer para que los cambios se reflejen en la GUI
         * @param {obj} panel : contiene los valores del tamaño de los contenedores
         */
        setUserPanelsSize: function(dispatcher, panel) {
            var node; var estil;
            var bcId = registry.byId(dispatcher.mainBCNodeId);
            if (panel.left) {
                node = registry.byId(dispatcher.leftPanelNodeId).domNode;
                estil = style.set(node, "width", ""+panel.left+"px");
            }
            if (panel.right) {
                node = registry.byId(dispatcher.rightPanelNodeId).domNode;
                estil = style.set(node, "width", ""+panel.right+"px");
            }
            if (panel.bottom) {
                node = registry.byId(dispatcher.bottomPanelNodeId).domNode;
                estil = style.set(node, "height", ""+panel.bottom+"px");
            }
            bcId.resize();
        },
        
        /**
         * Guarda el valor del tamaño del contenedor LEFT en la variable lsuc y
         * envía una petición para su almacenamiento permanente en localStorage
         */
        setUserLeftPanelSize: function(user, left) {
            if (user && left) {
                this.lsuc.panelPosition.left = left;
                this._saveLocalStorage(this.lsuc, user);
            }
        },
        
        /**
         * Guarda el valor del tamaño del contenedor RIGHT en la variable lsuc y
         * envía una petición para su almacenamiento permanente en localStorage
         */
        setUserRightPanelSize: function(user, right) {
            if (user && right) {
                this.lsuc.panelPosition.right = right;
                this._saveLocalStorage(this.lsuc, user);
            }
        },
        
        /**
         * Guarda el valor del tamaño del contenedor BOTTOM en la variable lsuc y
         * envía una petición para su almacenamiento permanente en localStorage
         */
        setUserBottomPanelSize: function(user, bottom) {
            if (user && bottom) {
                this.lsuc.panelPosition.bottom = bottom;
                this._saveLocalStorage(this.lsuc, user);
            }
        },
            
        _saveLocalStorage: function(value, user) {
            if (localStorage.UserConfig) {
                var all_users = JSON.parse(localStorage.UserConfig);
                all_users[user] = value;
                var str_lsuc = JSON.stringify(all_users);
            }else {
                //Cuando todavía no hay localStorage
                var str_lsuc = '{"'+user+'":'+JSON.stringify(value)+'}';
            }
            if (str_lsuc) {
                localStorage.UserConfig = str_lsuc;
            }
        }

    });

    return ret;
});