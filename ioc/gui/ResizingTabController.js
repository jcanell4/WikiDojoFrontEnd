define([
	"dojo/_base/declare", // declare
	"dojo/_base/array", // array.forEach
        "dojo/dom-class", // domClass
        "dojo/dom-geometry",
	"dojo/_base/lang", // lang.hitch
	"dojo/on",
	"dojo/query", // query
	"dijit/registry",	// registry.byId()
	"dojo/text!./templates/ResizingTabController.html",
	"dojo/text!./templates/_ResizingTabControllerButton.html",
        "dijit/layout/TabController",
        "dijit/_WidgetsInTemplateMixin",
	"dijit/form/Button",
	"dijit/_HasDropDown",
	"dijit/Menu",
	"dijit/MenuItem",
	"dojo/NodeList-dom" // NodeList.style
], function(declare, array, domClass, geometry, lang, on, query, registry, 
            tabControllerTemplate, buttonTemplate, TabController, 
            _WidgetsInTemplateMixin, Button, _HasDropDown, Menu, MenuItem){
var ResizingTabController = declare("ioc.gui.ResizingTabController", 
                                [TabController, _WidgetsInTemplateMixin], {
	// summary:
        //		Set of tabs with a menu to switch between tabs.
        //              Tabs are resized according the TabController size.
	//		Works only for horizontal tabs (either above or below 
        //		the content, not to the left or right).
 
 	templateString: tabControllerTemplate,

	// useMenu: [const] Boolean
	//		True if a menu should be used to select tabs, false otherwise.
	useMenu: false,

	// tabStripClass: [const] String
	//		The css class to apply to the tab strip, if it is visible.
	tabStripClass: "",

	widgetsInTemplate: true,

	buildRendering: function(){
		this.inherited(arguments);
		var n = this.domNode;

		this._initMenuButton();
                
		if(!this.tabStripClass){
			this.tabStripClass = "dijitTabContainer" +
				this.tabPosition.charAt(0).toUpperCase() +
				this.tabPosition.substr(1).replace(/-.*/, "") +
				"None";
			domClass.add(n, "tabStrip-disabled")
		}

		domClass.add(this.tablistWrapper, this.tabStripClass);
	},

        onStartup: function(){
		this.inherited(arguments);

		// TabController is hidden until it finishes drawing, to give
		// a less visually jumpy instantiation.   When it's finished, set visibility to ""
		// to that the tabs are hidden/shown depending on the container's visibility setting.
                this.domNode.style.visibility="";
		this._postStartup = true;
                this._calculateButtonSize();

		// changes to the tab button label or iconClass will have changed the width of the
		// buttons, so do a resize
		this.own(on(this.containerNode, 
                                "attrmodified-label, attrmodified-iconclass", 
                                lang.hitch(this, function(evt){
			if(this._dim){
				this.resize(this._dim);
			}
		})));
	},
//
	onAddChild: function(page, insertIndex){
		this.inherited(arguments);
                this._calculateButtonSize();
	},
//
	onRemoveChild: function(page, insertIndex){
		this.inherited(arguments);
                this._calculateButtonSize();                
	},
//        
        _calculateButtonSize: function(){
            var posLabel;
            var i;
            var buttonWidth;
            var maxTextWidth;
            var tabButtonNode;
            var tabButton;
            var textNode;
            var nChildren = this.getChildren().length-1;
            var tabListWrapperWidth = this.domNode.offsetWidth;
            if(this.useMenu && this._menuBtn){
                tabButtonNode = this._menuBtn.domNode;
                tabListWrapperWidth-=geometry.getPadExtents(tabButtonNode).w;
                tabListWrapperWidth-=geometry.getMarginSize(tabButtonNode).w;
            }
            buttonWidth = tabListWrapperWidth/nChildren;
            for(i=0; i<nChildren; i++){
                tabButton = this.getChildren()[i];
                tabButtonNode = tabButton.domNode;
                maxTextWidth = buttonWidth 
                                - geometry.getPadBorderExtents(tabButtonNode).w
                                - geometry.getMarginExtents(tabButtonNode).w;
                tabButtonNode.style.width=""+(maxTextWidth)+"px";
                textNode = query("> .tabLabel", tabButtonNode)[0];
                textNode.innerHTML=tabButton.label;
                posLabel=tabButton.label.length;
                while(textNode.offsetWidth >= maxTextWidth+5){
                    posLabel--;
                    textNode.innerHTML=tabButton.label.substr(0, posLabel)+"...";
                }
            }
            
        },

	_initMenuButton: function(){
		// summary:
		//		Creates the menu button used to view all tabs 
                //		using a menu format.

		// Make the content labels of the buttons to display when the 
                // tab labels become wider than the TabContainer.
		// Also set the width for each button.
                var menuButton = this._menuBtn.domNode;
                if(this.useMenu){
                    menuButton.style.display="";
                }else{
                    menuButton.style.display="none";
                }
	},

	resize: function(dim){
            this.inherited(arguments);
            this.domNode.style.width=""+dim.w+"px";
            this._calculateButtonSize();
	}/*,*/
});

var ResizingTabControllerButtonMixin = declare("ioc.gui._ResizingTabControllerButtonMixin", null, {
	baseClass: "dijitTab tabStripButton",

	templateString: buttonTemplate,

		// Override inherited tabIndex: 0 from dijit/form/Button, because user shouldn't be
		// able to tab to the left/right/menu buttons
	tabIndex: "",

	// Similarly, override FormWidget.isFocusable() because clicking a button shouldn't focus it
	// either (this override avoids focus() call in FormWidget.js)
	isFocusable: function(){ return false; }
});

// Class used in template
declare(
	"ioc.gui._ResizingTabControllerMenuButton",
	[Button, _HasDropDown, ResizingTabControllerButtonMixin],
{
	// id of the TabContainer itself
	containerId: "",

	// -1 so user can't tab into the button, but so that button can still be focused programatically.
	// Because need to move focus to the button (or somewhere) before the menu is hidden or IE6 will crash.
	tabIndex: "-1",

	isLoaded: function(){
		// recreate menu every time, in case the TabContainer's list of children (or their icons/labels) have changed
		return false;
	},

	loadDropDown: function(callback){
		this.dropDown = new Menu({
			id: this.containerId + "_menu",
			ownerDocument: this.ownerDocument,
			dir: this.dir,
			lang: this.lang,
			textDir: this.textDir
		});
		var container = registry.byId(this.containerId);
		array.forEach(container.getChildren(), function(page){
			var menuItem = new MenuItem({
				id: page.id + "_stcMi",
				label: page.title,
				iconClass: page.iconClass,
				disabled: page.disabled,
				ownerDocument: this.ownerDocument,
				dir: page.dir,
				lang: page.lang,
				textDir: page.textDir,
				onClick: function(){
					container.selectChild(page);
				}
			});
			this.dropDown.addChild(menuItem);
		}, this);
		callback();
	},

	closeDropDown: function(/*Boolean*/ focus){
		this.inherited(arguments);
		if(this.dropDown){
			this.dropDown.destroyRecursive();
			delete this.dropDown;
		}
	}
});

return ResizingTabController;
});
