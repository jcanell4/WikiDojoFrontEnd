define([
    'dojo/_base/declare',
    'dijit/registry',
    'ioc/gui/content/EditableElements/AbstractEditableElement',
], function (declare, registry, AbstractEditableElement) {

    return declare([AbstractEditableElement],
        {

            // Node de destí que s'actualitzarà amb els canvis de l'editor
            $target: null,


            // Això es crida en fer click al botó d'editar

            createWidget: function () {
                // No cal fer res, els widgets es crean automàticament
            },

            setTarget: function ($target) {
                this.$target = $target;
            },

            updateTarget: function (content) {

                if (!this.$target) {
                    return;
                }

                if (this.$target.is("input, textarea")) {
                    this.$target.val(content)
                } else {
                    this.$target.html(content);
                }
            },

            _replaceNodeContent: function (args) {

                var $rootNode = jQuery(args.node);
                var editId = $rootNode.attr('data-edit-id');
                var viewId = $rootNode.attr('data-view-id');

                this.$container = $rootNode;
                this.$node = $rootNode.find('#' + viewId);
                this.$editableNode = $rootNode.find('#' + editId);

                this.hide();

                this.$node.on('dblclick', this.show.bind(this));

                if (args.editable) {
                    jQuery(args.context.domNode).on('postrender', this.show.bind(this));
                }
            },

            updateField: function () {
                var viewWidget = this.getWidget(this.$node);
                var editWidget = this.getWidget(this.$editableNode);

                if (viewWidget !== null && editWidget !== null) {
                    viewWidget.set('value', editWidget.get('value'));
                }
            },

            getWidget: function($node) {
                var widget = null;
                if ($node && $node.children().get(0)) {

                    widget = registry.byNode($node.children().get(0));
                } else {
                    // Aquest cas es produeix quan encara no s'han ininialitzat els widgets
                    // console.log("Widget not found");
                }

                return widget;
            },

            saveToField: function () {
                // No fem res, la sincronització es automàtica

            },

            hide: function () {

                this.updateField();
                this.inherited(arguments);
            }


        });

});
