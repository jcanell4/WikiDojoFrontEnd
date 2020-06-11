define([
    "dojo/_base/declare",
    "dojo/Evented",
], function (declare, Evented) {

    return declare([Evented],
        {
            editionState : false,

            constructor: function (args) {

                this.init(args);
            },

            init: function (args) {

                // console.log("init args:", args);
                // alert("stop");
                this.context = args.context;
                this.$node = jQuery(args.node);
                this.args = args;

                this.defaultDisplay = this.$node.css('display');

                this._replaceNodeContent(args);
                this._createIcon();

                // Comproven que el contenttool accepti elements actualitzables (només el form subclass els accepta)
                if (this.context._registerEditableElement) {
                    // console.log("context?", this.context);
                    this.context._registerEditableElement(this);
                }

            },

            _replaceNodeContent: function (args) {
                this.$container = jQuery('<div>');

                var vstyle = this.$node.parent().attr("style");
                this.$node.before(this.$container);
                this.$container.append(this.$node);
                if(vstyle && vstyle.indexOf("display: none;")!==-1){
                    this.$container.attr("data-display-node", "none;");
                }


                // Alerta[Xavi] Aquesta es l'ancla on s'ha de ficar el widget que correspongui

                this.$editableNode = jQuery('<div></div>');
                this.$container.append(this.$editableNode);


                this.hide();

                this.$node.on('dblclick', this.show.bind(this));

                if (args.editable) {
                    jQuery(args.context.domNode).on('postrender',this.show.bind(this));
                }

            },

            hide: function () {

                this.emit('pre-hide', {});

                this.setEditionState(false);

                this.$node.css('display', this.defaultDisplay);

                if (this.$icon) {
                    this.$icon.css('display', 'block');
                }

                this.$editableNode.css('display', 'none');

                this.emit('hide', {});
            },

            show: function () {
                this.setEditionState(true);
                this.emit('pre-show', {});

                if (!this.widgetInitialized) {
                    this.createWidget();
                }

                this.$node.css('display', 'none');

                if (this.$icon) {
                    this.$icon.css('display', 'none');
                }
                this.$editableNode.css('display', 'block');

                this.emit('show', {});
            },

            setEditionState: function (state) { // Alerta[Xavi] es un booleà o un enum?
                this.editionState = state;
            },

            createWidget: function(){
                throw new Error("El mètode createWidget s'ha d'implementar a la subclasse");
            },

            // Desa el contingut de l'element al camp lligat, cridat automàticament quan es desa el formulari
            saveToField: function() {
                throw new Error("La funció save ha de ser implementada per la subclasse");
            },

            // Actualitza el contingut intern de l'element
            updateField: function() {
                throw new Error("La funció update ha de ser implementada per la subclasse");
            },

            getValue: function () {
                throw new Error("La funció getValue ha de ser implementada per la subclasse");
            },

            _createIcon: function () {

                // Afegim un contenidor per l'icona i l'input
                var $container = jQuery('<div>');
                $container.css('position', 'relative');

                this.$node.before($container);
                $container.append(this.$node);

                this.$icon = jQuery('<img src="/iocjslib/ioc/gui/img/edit.png" alt="" height="16" width="16">');
                this.$icon.css('position', 'absolute');
                this.$icon.css('top', '2px');
                this.$icon.css('right', '2px');
                this.$icon.css('display', 'block');
                this.$icon.css('cursor', 'pointer');
                this.$node.before(this.$icon);

                //
                //
                // this.$node.on('mouseover', function() {
                //     console.log("mouseover");
                //     this.$icon.css('display', 'block'); // TODO: Comprovar que no sigui ja en edició
                // }.bind(this));
                //
                // this.$node.on('mouseout', function() {
                //     console.log("mouseout");
                //     this.$icon.css('display', 'none');
                // }.bind(this));
                //
                //
                //
                // this.$icon.on('mouseover', function () {
                //     this.hover = true;
                // }.bind(this));
                //
                // this.$icon.on('mouseout', function () {
                // this.$icon.on('mouseout', function () {
                //     this.hover = false;
                // }.bind(this));

                this.$icon.on('click', this.show.bind(this));
            }

        });

});
