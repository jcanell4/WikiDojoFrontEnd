define([
    "dojo/_base/declare", // declare
    "dojo/_base/array", // array.forEach
    "dojo/dom-class", // domClass
    "dojo/dom-geometry",
    "dojo/_base/lang", // lang.hitch
    "dojo/on",
    "dojo/query", // query
    "dijit/registry",	// registry.byId()
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/layout/TabController",
    "dojo/text!./templates/ResizingTabController.html",
    "dojo/text!./templates/_ResizingTabControllerButton.html",
    "dijit/form/Button",
    "dijit/_HasDropDown",
    "dijit/Menu",
    "dijit/MenuItem",
    "dojo/NodeList-dom" // NodeList.style
], function (declare, array, domClass, geometry, lang, on, query, registry,
            _TemplatedMixin, _WidgetsInTemplateMixin, TabController, 
            tabControllerTemplate, buttonTemplate, Button, _HasDropDown, 
            Menu, MenuItem) {

    var ResizingTabController = declare("ioc.gui.ResizingTabController", [TabController, _TemplatedMixin, _WidgetsInTemplateMixin],
        /**
         * Set of tabs with a menu to switch between tabs. Tabs are resized according to the TabController size.
         * Works only for horizontal tabs (either above or below the content, not the left or right).
         *
         * @class ResizingTabController
         * @extends dijit._WidgetsInTemplateMixin
         * @extends dijit.layout.TabController
         */
        {
            // Attachpoints
            tablistWrapper: null,

            _menuBtn: null,

            /** @override */
            templateString: tabControllerTemplate,

            /** @const {boolean}  True if a menu should be used to select tabs, false otherwise. */
            useMenu:       false, // TODO[Xavi] no es constant, segurament @final seria més apropiat però no es aplicable a propietats

            // tabStripClass: [const] String
            //		The css class to apply to the tab strip, if it is visible.
            /** @const {string} The css class to apply to the tab strip, if it is visible. */ // TODO[Xavi] no es constant, segurament @final seria més apropiat però no es aplicable a propietats
            tabStripClass: "", // TODO[Xavi] no es constant, segurament @final seria més apropiat però no es aplicable a propietats

            /** @override */
            widgetsInTemplate: true, // TODO[Xavi] No es necessari en aquesta versió de Dojo

            /** @override */
            buildRendering: function () {
                //	postCreate: function(){
                this.inherited(arguments);
                var n = this.domNode;

                this._initMenuButton();

                if (!this.tabStripClass) {
                    this.tabStripClass = "dijitTabContainer" +
                        this.tabPosition.charAt(0).toUpperCase() +
                        this.tabPosition.substr(1).replace(/-.*/, "") +
                        "None";
                    domClass.add(n, "tabStrip-disabled")
                }

                domClass.add(this.tablistWrapper, this.tabStripClass);
            },

            /** @override */
            onStartup: function () {
                this.inherited(arguments);

                // TabController is hidden until it finishes drawing, to give
                // a less visually jumpy instantiation.   When it's finished, set visibility to ""
                // to that the tabs are hidden/shown depending on the container's visibility setting.
                this.domNode.style.visibility = "";
                this._postStartup = true;
                this._calculateButtonSize();

                // changes to the tab button label or iconClass will have changed the width of the
                // buttons, so do a resize
                this.own(
                    on(this.containerNode, "attrmodified-label, attrmodified-iconclass", lang.hitch(this, function (evt) {
                        if (this._dim) {
                            this.resize(this._dim);
                        }
                    })));
            },

            /** @override */
            onAddChild: function (page, insertIndex) {
                this.inherited(arguments);
                this._calculateButtonSize();
            },

            /** @override */
            onRemoveChild: function (page, insertIndex) {
                this.inherited(arguments);
                this._calculateButtonSize();
            },

            /** @override */
            onkeypress: function (evt) {
            },

            /**
             * Calcula i canvia la mida del botó de la pestanya.
             *
             * @private
             */
            _calculateButtonSize: function () {
                var posLabel;
                var i;
                var buttonWidth;
                var maxTextWidth;
                var tabButtonNode;
                var tabButton;
                var textNode;
                var nChildren = this.getChildren().length;
                var tabListWrapperWidth = this.domNode.offsetWidth;
                if (this.useMenu && this._menuBtn) {
                    tabButtonNode = this._menuBtn.domNode;
                    var w = geometry.getMarginSize(tabButtonNode).w - 1;
                    tabListWrapperWidth -= w;
                    tabButtonNode.style.left = "" + (tabListWrapperWidth) + "px";
                }
                buttonWidth = tabListWrapperWidth / nChildren;
                for (i = 0; i < nChildren; i++) {
                    tabButton = this.getChildren()[i];
                    tabButtonNode = tabButton.domNode;
                    maxTextWidth = buttonWidth
                        - geometry.getPadBorderExtents(tabButtonNode).w
                        - geometry.getMarginExtents(tabButtonNode).w;
                    tabButtonNode.style.width = "" + (maxTextWidth) + "px";
                    textNode = query("> .tabLabel", tabButtonNode)[0];
                    textNode.innerHTML = tabButton.label;
                    posLabel = tabButton.label.length;
                    while (textNode.offsetWidth >= maxTextWidth + 5) {
                        posLabel--;
                        textNode.innerHTML = tabButton.label.substr(0, posLabel) + "...";
                    }
                }
            },

            /**
             * Creates the menu button used to view all tabs using a menu format. Make the content labels of the buttons
             * to display when the tab labels become wider than the TabContainer. Also set the widt for each button.
             *
             * @private
             */
            _initMenuButton: function () {
                var menuButton = this._menuBtn.domNode;
                menuButton.style.position = "absolute";
                menuButton.style.top = "0px";
                if (this.useMenu) {
                    menuButton.style.display = "";
                } else {
                    menuButton.style.display = "none";
                }
            },

            /**
             * @param {{w: int}} dim
             * @override
             */
            resize: function (dim) {
                this.inherited(arguments);
                this.domNode.style.width = "" + dim.w + "px";
                this._calculateButtonSize();
            }/*,*/
        });

    var ResizingTabControllerButtonMixin = declare("ioc.gui._ResizingTabControllerButtonMixin", null,
        /**
         * Set of tabs with a menu to switch between tabs. Tabs are resized according to the TabController size.
         * Works only for horizontal tabs (either above or below the content, not the left or right).
         *
         * @class ioc.gui._ResizingTabControllerButtonMixin
         */
        {
            /** @override */
            baseClass: "dijitTab tabStripButton",

            /** @override */
            templateString: buttonTemplate,

            /**
             * Override inherited tabIndex: 0 from dijit/form/Button, because user shouldn't be able to tab to the
             * left/right/menu buttons
             * @type {string}
             * @override
             */
            tabIndex: "",


            /**
             * Similarly, override FormWidget.isFocusable() because clicking a button shouldn't focus it either
             * (this override avoids focus() call in FormWidget.js)
             *
             * @override
             */
            isFocusable: function () {
                return false;
            }
        });

    // Class used in template
    declare("ioc.gui._ResizingTabControllerMenuButton", [Button, _HasDropDown, ResizingTabControllerButtonMixin],
        /**
         * @class ioc.gui._ResizingTabControllerMenuButton
         * @extends dijit.form.Button
         * @extends dijit._HastDropDown
         * @extends ioc.gui._ResizingTabControllerButtonMixin
         */
        {
            /** @type {string} id of the TabContainer itself */
            containerId: "",

            /**
             * -1 so user can't tab into the button, but so that button can still be focused programatically. Because need to move focus to the button (or somewhere) before the menu is hidden or IE6 will crash.
             * @type {string}
             * @override
             */
            tabIndex: "-1",

            /**
             * @returns {boolean} Sempre retorna false
             * @override
             */
            isLoaded: function () {
                // recreate menu every time, in case the TabContainer's list of children (or their icons/labels) have changed
                return false;
            },

            /**
             * @param callback
             * @override
             */
            loadDropDown: function (callback) {
                this.dropDown = new Menu({
                    id:            this.containerId + "_menu",
                    ownerDocument: this.ownerDocument,
                    dir:           this.dir,
                    lang:          this.lang,
                    textDir:       this.textDir
                });
                var container = registry.byId(this.containerId);
                array.forEach(container.getChildren(), function (page) {
                    var menuItem = new MenuItem({
                        id:            page.id + "_stcMi",
                        label:         page.title,
                        iconClass:     page.iconClass,
                        disabled:      page.disabled,
                        ownerDocument: this.ownerDocument,
                        dir:           page.dir,
                        lang:          page.lang,
                        textDir:       page.textDir,
                        onClick:       function () {
                            container.selectChild(page);
                        }
                    });
                    this.dropDown.addChild(menuItem);
                }, this);
                callback();
            },

            /**
             * @param {boolean} focus
             * @override
             */
            closeDropDown: function (focus) {
                this.inherited(arguments);
                if (this.dropDown) {
                    this.dropDown.destroyRecursive();
                    delete this.dropDown;
                }
            }
        });

    return ResizingTabController;
});