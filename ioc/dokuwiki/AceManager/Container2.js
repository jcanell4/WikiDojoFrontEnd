define([
    "dojo/Stateful",
    "dojo/_base/declare",
], function (Stateful, declare) {
    return declare([Stateful],
        /**
         * Embolcall per manipular un editor ace.
         *
         * @class Container
         * @extends dojo.Stateful
         * @author Xavier García<xaviergaro.dev@gmail.com>
         */
        {
            /** @type {AceWrapper} @private */
            aceWrapper: null,

            /** @type {DokuWrapper} @private */
            dokuWrapper: null,

            /** @type {object} @private*/
            $elementContainer: null,

            /** @type {object} @private*/
            $wrapper: null,

            /** @type {object} @private*/
            $textArea: null,
                    
            /** @type {object} @private*/
            dokuEditor: null,

            /**
             *
             * @param {AceWrapper} aceWrapper
             * @param {DokuWrapper} dokuWrapper
             * @param {Editor} dokuEditor
             */
            constructor: function (aceWrapper, dokuWrapper/*, dokuEditor*/) {
                this.aceWrapper = aceWrapper;
                //this.dokuEditor = dokuEditor;
                this.dokuWrapper = dokuWrapper;
                dokuWrapper.setContainer(this);
                this._init();
            },

            _init: function () {
                //console.log("Container#init");
                var element = jQuery('<div>'),
                    textarea = jQuery(this.dokuWrapper.textArea),
                    wrapper = jQuery('<div>', {
                        "class": 'ace-doku',
                        "id":    this.aceWrapper.containerId
                    }),
                    prop,
                    properties = ['border', 'border-color', 'border-style', 'border-width', 'border-top',
                        'border-top-color', 'border-top-style', 'border-top-width', 'border-right',
                        'border-right-color', 'border-right-style', 'border-right-width', 'border-bottom',
                        'border-bottom-color', 'border-bottom-style', 'border-bottom-width', 'border-left',
                        'border-left-color', 'border-left-style', 'border-left-width', 'margin', 'margin-top',
                        'margin-right', 'margin-bottom', 'margin-left'];

                // Recorre les propietats css del array
                // les afegeix una per una al wrapper
                // afegeix al wrapper un element (div) amb classe 'ace-doku' després del textarea

                for (var i = 0, len = properties.length; i < len; i++) {
                    prop = properties[i];
                    wrapper.css(prop, textarea.css(prop));
                }

                wrapper.append(element).insertAfter(textarea).hide();

                this.$elementContainer = element;
                this.$wrapper = wrapper;
                this.$textArea = textarea;
            },

            element: function () { // TODO[Xavi] No se si això continua fent falta, no veig que es cridi
//                console.log("Container#element");
                return this.$elementContainer.get(0);
            },

            hide: function () {
                //console.log("Container#hide");
                return this.$wrapper.hide();
            },

            incr_height: function (value) {
                //console.log("Container#incr_height");
                var wrapper = this.$wrapper,
                    element = this.$elementContainer;

                wrapper.css('height', (wrapper.height() + value) + 'px');
                return element.css('height', wrapper.height() + 'px');
            },

            on_resize:  function () {
                //console.log("Container#on_resize");
                return this.$elementContainer.css('width', this.$wrapper.width() + 'px');
            },

            set_height: function (value) {
                //console.log("Container#set_height");
                this.$wrapper.css('height', value + 'px');
                return this.$elementContainer.css('height', this.$wrapper.height() + 'px');
            },

            show: function () {
                //console.log("Container#show");
                var wrapper = this.$wrapper,
                    element = this.$elementContainer;
                wrapper.show();
                element.css('width', wrapper.width() + 'px');
                return element.css('height', wrapper.height() + 'px');
            },
            
            getTextAreaValue: function(){
                return this.dokuWrapper.get_value();
            },
            
            getAceValue: function(){
                return this.aceWrapper.get_value();
            },
            
            setTextAreaValue: function(v){
                return this.dokuWrapper.set_value(v);
            },
            
            setAceValue: function(v){
                return this.aceWrapper.set_value(v);
            },

            /** @param {ElementCollection | Element | id} editorNode*/
            setEditorNode: function(editorNode){
                console.log("eliminada");
                //if(this.dokuEditor){
                //    this.dokuEditor.setEditorNode(editorNode);
                //}
            },
            
            select: function(){
                console.log("eliminada");
                //if(this.dokuEditor){
                //    this.dokuEditor.select();
                //}
            },

    
            unselect: function(){
                console.log("eliminada");
                //if(this.dokuEditor){
                //    this.dokuEditor.unselect();
                //}
            },
            
            getEditorNode: function(){
                console.log("eliminada");
                //return this.dokuEditor.getEditorNode();
            }
            


        });
});

