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
            elementContainer: null,

            /** @type {object} @private*/
            wrapper: null,

            /** @type {object} @private*/
            textarea: null,

            /**
             *
             * @param {AceWrapper} aceWrapper
             * @param {DokuWrapper} dokuWrapper
             */
            constructor: function (aceWrapper, dokuWrapper) {
                this.aceWrapper = aceWrapper;
                this.dokuWrapper = dokuWrapper;
                dokuWrapper.setContainer(this);
                this._init();
            },

            _init: function () {
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

                this.elementContainer = element;
                this.wrapper = wrapper;
                this.textarea = textarea;
            },

            element: function () {
                return this.elementContainer.get(0);
            },

            hide: function () {
                return this.wrapper.hide();
            },

            incr_height: function (value) {
                var wrapper = this.wrapper,
                    element = this.elementContainer;

                wrapper.css('height', (wrapper.height() + value) + 'px');
                return element.css('height', wrapper.height() + 'px');
            },

            on_resize:  function () {
                return this.elementContainer.css('width', this.wrapper.width() + 'px');
            },

            set_height: function (value) {
                this.wrapper.css('height', value + 'px');
                return this.elementContainer.css('height', this.wrapper.height() + 'px');
            },

            show: function () {
                var wrapper = this.wrapper,
                    element = this.elementContainer;
                wrapper.show();
                element.css('width', wrapper.width() + 'px');
                return element.css('height', wrapper.height() + 'px');
            }

        });
});
