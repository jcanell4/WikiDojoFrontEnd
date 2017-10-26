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


        // fillEditorContainer: function () {
        //     // var contentNode = this.editor.domNode,
        //     var contentNode = this.containerNode,
        //         h = geometry.getContentBox(contentNode).h;
        //
        //     // console.log("DojoEditorFacade#fillEditorContainer", contentNode, h);
        //     this.setHeight(h);
        // },


        fillEditorContainer: function() {
            console.log("fillEditorContainer");
            var viewNode,
                p,
                // $view =jQuery('#view_' + this.id /*+ '_' + header_id*/);
                $view =jQuery('#' + this.viewId /*+ '_' + header_id*/);

            $view.css('display', 'block'); // TODO[Xavi] Solució temporal, el block ha de ser visible per calcular l'alçada

            viewNode = dom.byId(this.viewId /*+ '_' + header_id*/);
            p = geometry.getContentBox(viewNode).h;

            console.log("viewNode", viewNode);

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