define([
    "dojo/_base/declare",
], function (declare) {

    return declare(null,
        {
            editionState : false,

            constructor: function (args) {

                this.init(args);


            },

            init: function (args) {
                this.context = args.context;
                this.$node = jQuery(args.node);
                this.args = args;

                this._replaceNodeContent(args);
            },

            _replaceNodeContent: function (args) {
                this.$container = jQuery('<div>');

                this.$node.before(this.$container);
                this.$container.append(this.$node);


                // Alerta[Xavi] Aquesta es l'ancla on s'ha de ficar el widget que correspongui

                this.$editableNode = jQuery('<div></div>');
                this.$container.append(this.$editableNode);
                this.hide();


                this.$node.on('dblclick', this.show.bind(this));

            },

            hide: function () {

                console.log("AbstractEditableElement#hide");
                this.setEditionState(false);
                this.$node.css('display', 'block');
                this.$editableNode.css('display', 'none');
            },

            show: function () {
                if (!this.widgetInitialized) {
                    this.createWidget()
                }

                console.log("AbstractEditableElement#show");
                this.setEditionState(true);
                this.$node.css('display', 'none');
                this.$editableNode.css('display', 'block');
            },

            setEditionState: function (state) { // Alerta[Xavi] es un booleà o un enum?
                this.editionState = state;
            },

            createWidget: function(){
                throw new Error("El mètode createWidget s'ha d'implementar a la subclasse");
            }
        });

});
