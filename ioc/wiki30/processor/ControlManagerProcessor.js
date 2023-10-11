/* 
 * ControlManagerProcessor: processa la resposta enviada per un ResponseHandler
 * de tipus gestió de controls extres
 */
define([
    "dojo/_base/declare",
    "dojo/dom",
    "ioc/wiki30/processor/AbstractResponseProcessor",
    "dijit/registry"
], function (declare, dom, AbstractResponseProcessor, registry) {
    
    var ret = declare([AbstractResponseProcessor], {
        
        type: "controlManager",
        
        /**
         * process: Processa la resposta enviada per un ResponseHandler.
         * @param {object} response - resposta enviada per un ResponseHandler. Conté:
         *      - 'actions' (un array de classes)
         *      - 'url' (la ruta del fitxer UpdateViewHandler)
         * @param {Dispatcher} dispatcher
         * @override
         */
        process: function (response, dispatcher) {
            var listOfRequiredClass = [];
            
            if (response.do === "create") {
                response.actions.forEach(function(item) {
                    listOfRequiredClass.push(item.class);
                });
                
                require(listOfRequiredClass,
                    function() {
                        for (i = 0; i < arguments.length; i++ ) {
                            var reg = registry.byId(response.actions[i].id);
                            if (reg && response.actions[i].overwrite === true) {
                                reg.destroyRecursive(false);
                                reg = undefined;
                            }
                            if (reg === undefined) {
                                var control = new arguments[i](response.actions[i].params);
                                control.id = response.actions[i].id;
                                control.domNode.dataset.iocGroup = response.actions[i].group;
                                control.domNode.dataset.iocId = response.actions[i].id;
                                registry.add(control);
                                registry.byId(response.actions[i].containerId).addChild(control);
                            }
                        };
                    });

                require([response.updateViewHandler],
                    function(updateViewHandler) {
                        var viewHandler = new updateViewHandler();
                        dispatcher.addUpdateView(viewHandler);
                    });
            }
            else if (response.do === "delete") {
                if (response.actions['type']==='group') {
                    var child;
                    var elements = document.querySelectorAll("[data-ioc-group='" + response.actions['id'] + "']");
                    // Eliminar cadascún dels iocId del grup
                    for (i = 0; i < elements.length; i++ ) {
                        child = registry.byId(elements[i].dataset.iocId);
                        child.destroyRecursive(false);
                    }
                }else {
                    //Un únic element DOM, corresponent a un únic witget identificat per id
                    var child = registry.byId(response.actions['id']);
                    child.destroyRecursive(false);
                }
            }
            
        }
    });
    
    return ret;
    
});
