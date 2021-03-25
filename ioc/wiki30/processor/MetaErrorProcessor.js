define([
    "dojo/_base/declare",
    "dijit/registry",
    "ioc/gui/content/contentToolFactory",
    "ioc/wiki30/processor/AbstractResponseProcessor",
    "ioc/wiki30/processor/ExtraMetaInfoProcessor"
], function (declare, registry, contentToolFactory, AbstractResponseProcessor, ExtraMetaInfoProcessor) {




    return declare([AbstractResponseProcessor, ExtraMetaInfoProcessor], {

        // aquest és el tipus que es fa servir pel renderengine
        type: "metainfo",

        docId: null,

        process: function (value, dispatcher) {
            this.docId = value.id;
            this.inherited(arguments);
        },

        _addMetainfo: function (id, meta, dispatcher, nodeMetaInfo, ret, standalone) {

            var widgetCentral = registry.byId(dispatcher.containerNodeId).selectedChildWidget,
                cp,
                //defaultSelected=0,
                //firstPane=1,
                currentMetaItem,
                currentMetaContent;

            if ((widgetCentral && widgetCentral.id === id) || standalone) { // aquesta metainfo pertany a la pestanya activa
                currentMetaContent = meta;

                currentMetaItem = registry.byId(currentMetaContent.id);
                if (!currentMetaItem) {

                    // Afegim la informació extra necessaria per generar el ContentTool
                    currentMetaContent.dispatcher = dispatcher;
                    currentMetaContent.docId = id;

                    cp = this.createContentTool(currentMetaContent);
                    nodeMetaInfo.addChild(cp);
                    nodeMetaInfo.resize();

                    let $doc = jQuery('#' + this.docId);

                    jQuery(cp.domNode).find('[data-error-target]').on('click', function (e) {
                        e.preventDefault();
                        // console.log("Doc:", $doc);

                        jQuery('.meta-error-highlight').removeClass('meta-error-highlight');

                        let $this = jQuery(this);
                        let fieldId = $this.attr('data-error-target');

                        let node = $doc[0].querySelector('[data-error-id="' + fieldId + '"]');
                        // let node = document.querySelector('[data-error-id="' + fieldId + '"]');
                        jQuery(node).attr('data-collapse-target', true);

                        // Travesem el dom fins l'arrel del document cercant tots els icons collapse en cascada inversa
                        // per obrir-los
                        let $parent = $doc.find('[data-error-id="' + fieldId + '"]').parent();

                        $parent.closest('.pair-label-field').addClass('meta-error-highlight');

                        // Fem servir un set (podria ser un map) perque distingueix entre nodes quan es fan servir entre claus, això
                        // permet ignorar els duplicats
                        let cachedIcons = new Set();

                        do {
                            let $icons = $parent.find('.collapse-icon .collapsed');
                            if ($icons.length > 0) {
                                $icons.each(function () {
                                    // aquest ha de ser el .collapsed-icon
                                    // ALERTA! Els nodes jQuery no és reconeixen com a únics, però els nodes del DOM sí
                                    cachedIcons.add(jQuery(this).parent()[0]);
                                });
                            }
                            $parent = $parent.parent();
                        } while ($parent.length > 0 && $parent.prop('tagName') && $parent.prop('tagName').toLowerCase() !== 'form');


                        let collapsing = false;

                        for (let icon of cachedIcons) {

                            let $icon = jQuery(icon);

                            // Cal cercar el contenidor (marcat amb la classe collapsable-frame) pare del botó
                            // que conté la classe amb l'atribut data-collapse-target

                            if ($icon.closest('.collapsable-frame').find('[data-collapse-target]').length > 0) {
                                jQuery(icon).trigger('click');
                                collapsing = true;
                            }
                        }


                        let timeBeforeFocusing = 0;
                        if (node) {
                            if (collapsing) {
                                // Hem d'esperar a que acavi
                                setTimeout(function() {
                                    node.scrollIntoView({behavior: 'smooth', block: 'center'});
                                }, 600);
                                timeBeforeFocusing = 1000;
                            } else {
                                node.scrollIntoView({behavior: 'smooth', block: 'center'});
                                timeBeforeFocusing = 500;
                            }
                        }

                        // intentem fer focus
                        setTimeout(function() {
                            $doc.find('#' + fieldId).focus();
                        }, timeBeforeFocusing);


                        jQuery(node).removeAttr('data-collapse-target');


                    });

                } else {
                    this._updateContentTool(currentMetaItem, currentMetaContent);
                    // currentMetaItem.updateDocument(currentMetaContent.content);
                    cp = currentMetaItem;
                }
                if (meta.defaultSelected) { //Des del servidor ens marquen aquesta opció com a defaultSelected
                    ret.defaultSelected = cp.id;
                }
                if (!ret.firstPane) {
                    ret.firstPane = cp.id;
                }
            }
        },
    });
});
