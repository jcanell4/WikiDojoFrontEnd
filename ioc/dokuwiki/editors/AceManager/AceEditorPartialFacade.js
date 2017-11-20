define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/AceManager/AceEditorFullFacade',
    'ioc/dokuwiki/editors/AceManager/toolbarManager',
    'dojo/cookie',
    'dojo/dom',
    'dojo/dom-style',
    'dojo/dom-geometry',

], function (declare, AceEditorFullFacade, toolbarManager, cookie, dom, style, geometry) {
    return declare([AceEditorFullFacade], {

        TOOLBAR_ID: 'partial-editor',
        VERTICAL_MARGIN: 100,
        MIN_HEIGHT: 200,

        setHeight: function (height) {
            // console.log("AceEditorPartialFacade#setHeight", height);
            var min = this.MIN_HEIGHT,
                contentNode = dom.byId(this.dispatcher.containerNodeId),
                h = geometry.getContentBox(contentNode).h,
                max = h - this.VERTICAL_MARGIN,
                normalizedHeight = Math.max(min, Math.min(height, max));

            var node = this.editor.$textarea.get(0);

            if (node) {
                style.set(node, "height", "" + normalizedHeight + "px");
            }

            node = dom.byId(this.editor.containerId);
            if (node) {
                style.set(node, "height", "" + normalizedHeight + "px");
            }

            this.editor.resize(); // TODO[Xavi] Important! sense això no s'ajusta la mida del editor

        },

        fillEditorContainer: function () {
            // console.log("fillEditorContainer");
            var viewNode,
                p,
                $view = jQuery('#view_' + this.id);

            $view.css('display', 'block'); // TODO[Xavi] Solució temporal, el block ha de ser visible per calcular l'alçada

            viewNode = dom.byId('view_' + this.id);
            p = geometry.getContentBox(viewNode).h;

            // console.log("viewNode", viewNode);

            $view.css('display', 'none');  // TODO[Xavi] Solució temporal, el block ha de ser visible per calcular l'alçada

            this.setHeight(p);
        }

    });
});

