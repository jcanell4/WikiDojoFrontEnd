define([
    'dojo/_base/declare',
    'ioc/dokuwiki/AceManager/IocDojoEditor',
    'dijit/_editor/plugins/AlwaysShowToolbar',
    'dojo/dom',
    'dojo/dom-style',
    'dojo/Evented',
    'dojo/dom-geometry',
    'ioc/dokuwiki/AceManager/DojoEditorFacade',
], function (declare, Editor, AlwaysShowToolbar, dom, style, Evented, geometry, DojoEditorFacade) {
    return declare([DojoEditorFacade], {


        setHeight: function (height) {
            console.log("DojoEditorFacade#setHeight", height);

            var min = this.MIN_HEIGHT,
                $contentNode = jQuery(this.editor.domNode),
                $tab = jQuery("#" +this.dispatcher.getGlobalState().getCurrentId()),
                h = geometry.getContentBox($tab[0]).h,
                max = h - this.VERTICAL_MARGIN,
                normalizedHeight = Math.max(min, Math.min(height, max));

            $contentNode.height(normalizedHeight);
            this.editor.resize({height: normalizedHeight+ 'px'});
        },

    });
});