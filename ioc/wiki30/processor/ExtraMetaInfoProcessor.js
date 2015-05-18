define([
    "dojo/_base/declare",
    "dijit/registry",
    "ioc/wiki30/processor/MetaInfoProcessor"
], function (declare, registry, MetaInfoProcessor) {
    return declare([MetaInfoProcessor],
        /**
         * Aquesta classe s'encarrega de processar la informació de tipus metadada, generar el ContentTool del tipus
         * adequat i afegirlo al ContainerContentTool que li pertoca.
         *
         * @class ExtraMetaInfoProcessor
         * @extends AbstractResponseProcessor
         * @author Josep Cañellas <jcanell4@ioc.cat>
         */
        {
            type: "extra_metainfo",

            /**
             * Elimina tots els widgets del contenidor de metadades i crea un de nou amb la informació del contingut
             * passat com argument.
             *
             * @param {{id: string, meta:Content[]}} content
             * @param {Dispatcher} dispatcher
             * @returns {number} - Sempre es 0
             * @protected
             */
            _processMetaInfo: function (content, dispatcher) {
                var nodeMetaInfo = registry.byId(dispatcher.metaInfoNodeId),
                    m,
                    defaultSelected=0,
                    firstPane=1,
                    selectedPane,
                    contentCache = dispatcher.getContentCache(content.id),
                    ret=[null, null];

                if(Array.isArray(content.meta) && Object.keys(content.meta).indexOf('0')>0 ){
                    for (m in content.meta) {
                        this._addMetainfo(content.id, content.meta[m], dispatcher, nodeMetaInfo, content.defaultSelected, ret);
                    }                    
                }else{
                    this._addMetainfo(content.id, content.meta, dispatcher, nodeMetaInfo, false, ret);
                }


                selectedPane = contentCache.getCurrentId("metadataPane");

                if (!selectedPane && ret[defaultSelected]) {
                    selectedPane = ret[defaultSelected];
                } else if (!selectedPane) {
                    selectedPane = ret[firstPane];
                }

                nodeMetaInfo.selectChild(selectedPane);
                contentCache.setCurrentId("metadataPane", selectedPane);

                return 0;
            },
        });
});