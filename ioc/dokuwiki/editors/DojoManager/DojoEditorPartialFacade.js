define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/DojoManager/IocDojoEditor',
    'dijit/_editor/plugins/AlwaysShowToolbar',
    'dojo/dom',
    'dojo/dom-style',
    'dojo/dom-geometry',
    'ioc/dokuwiki/editors/DojoManager/DojoEditorFacade',
], function (declare, Editor, AlwaysShowToolbar, dom, style, geometry, DojoEditorFacade) {
    return declare([DojoEditorFacade], {

        TOOLBAR_ID: 'partial-editor',

        fillEditorContainer: function() {

            var viewNode,
                p,
                $view =jQuery('#' + this.viewId);

            $view.css('display', 'block'); // TODO[Xavi] Solució temporal, el block ha de ser visible per calcular l'alçada

            viewNode = dom.byId(this.viewId);
            p = geometry.getContentBox(viewNode).h;

            $view.css('display', 'none');  // TODO[Xavi] Solució temporal, el block ha de ser visible per calcular l'alçada

            this.setHeight(p);
        },


        setHeight: function (height) {
            // console.log("DojoEditorFacade#setHeight", height);

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