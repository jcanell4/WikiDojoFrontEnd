define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/_base/declare',
    'dijit/Dialog',
    'dojo/text!./templates/CustomDialog.html',
    'dojo/dom-construct',
    'ioc/wiki30/manager/EventObservable',
    'ioc/wiki30/manager/EventObserver',
    'dijit/form/Button',
    "dojo/dom-style", // domStyle.set
], function (TemplatedMixin, WidgetsInTemplateMixin, declare, Dialog, template, domConstruct, EventObservable, EventObserver, Button, domStyle) {

    return declare("ioc.gui.CustomDialog", [Dialog, TemplatedMixin, WidgetsInTemplateMixin, EventObservable, EventObserver], {

        templateString: template,

        constructor: function () {


            this.initFunctions = [];
            this.sections = [];
            this.nextDialogs = {};
            this.nextCallbacks = {};

            declare.safeMixin(this, arguments);

            // console.log(this.style);
            // El dialog builder ja afegeix el width i el height
            // if (!this.style) {
            //     this.style = "width:" + this.width + "px;";
            // }

            // ALERTA! Només accepta l'alçada i amplada, la resta d'estils com min-width, min-height, etc. són descartats
            // Cal manipular-lo al startup

            this.eventManager = this.dispatcher.getEventManager();
        },

        startup: function () {
            this.inherited(arguments);

            this._addMessage();
            this._addSections();
            this._addButtons();
            this._addListerners();
            this._initNextDialogs();
            this._initNextCallbacks();
            this._initFunctions();
            this._initTimer();

            // Ajustem la mida mínima segons el nombre de botons (65px per botó)
            jQuery(this.domNode).find('.dijitDialogPaneContent').css('min-width', (this.buttons.length * 65) + "px");

        },

        _initTimer: function () {
            if (!this.timeout) {
                return;
            }

            var timerId = setTimeout(function () {
                this.dispatchEvent(this.eventName.TIMEOUT, {id: this.id});
            }.bind(this), this.timeout); // El context del timer serà el propi dialog

            this.registerObserverToEvent(this, this.eventName.DESTROY, function () {
                clearInterval(timerId);
            });
        },

        _initFunctions: function () {
            for (var i = 0; i < this.initFunctions.length; i++) {
                this.initFunctions[i].bind(this)(); // es passa el contexte del dialog a cada funció que es crida
            }

            // Afegim les suscripcions adicionals
            this.registerObserverToEvent(this, this.eventName.TIMEOUT, this.remove.bind(this));
        },

        _initNextDialogs: function () {
            for (var event in this.nextDialogs) {
                this.registerObserverToEvent(this, event, this._createDialogShowCallback(this.nextDialogs[event]).bind(this));
            }
        },

        _createDialogShowCallback: function (dialog) {
            return function () {
                dialog.show();
            };
        },

        _initNextCallbacks: function () {
            // llença tota la seqüencia de funcions d'inicialització afegides
            for (var event in this.nextCallbacks) {
                // Es tracta d'un array
                for (var i = 0; i < this.nextCallbacks[event].length; i++) {
                    this.registerObserverToEvent(this, event, this.nextCallbacks[event][i].bind(this));
                }
            }
        },

        _addMessage: function () {
            this.contentNode.innerHTML = this.message;
        },

        _addSections: function () {
            if (this.single === true) {
                this._addSectionSingleColumn();
            } else {
                this._addSectionsTwoColumns();
            }

            if (this.sections.length>0) {
                jQuery(this.sectionsNode.lastChild).animate({scrollTop: (0)}); // En cas de que es mostri una barra de desplaçament sempre es mostrarà el principi de la secció
            };
        },

        _addSectionSingleColumn: function() {
            for (var i = 0; i < this.sections.length; i++) {
                let cssClass = "";

                // console.log("mínimal?", this.minimal);
                if (this.minimal) {
                    cssClass = "minimal";
                }

                var divSection = domConstruct.create("div", {class: cssClass});

                this.sectionsNode.appendChild(divSection);

                this._addSectionToNode(this.sections[i], divSection);
                // if (this.sections[i].widget) {
                //     this.sections[i].widget.placeAt(divSection);
                // } else if (this.sections[i] instanceof jQuery) {
                //     jQuery(divSection).append(this.sections[i]);
                // } else {
                //     divSection.appendChild(this.sections[i]);
                // }
            }
        },


        _addSectionsTwoColumns: function() {
            for (var i = 0; i < this.sections.length; i++) {

                let cssClass ="";

                if (this.minimal) {
                    cssClass = " minimal";
                }

                var divSection = domConstruct.create("div", {class:"sectionNode" + cssClass});
                var divContent = domConstruct.create("div", {class:"content"});
                divSection.appendChild(divContent);
                this.sectionsNode.appendChild(divSection);

                this._addSectionToNode(this.sections[i], divContent);
                // if (this.sections[i].widget) {
                //     this.sections[i].widget.placeAt(divContent);
                // } else if (this.sections[i] instanceof jQuery) {
                //     jQuery(divContent).append(this.sections[i]);
                // } else {
                //     divContent.appendChild(this.sections[i]);
                // }
            }
        },


        _addSectionToNode : function (section, node){
            if (section.widget) {
                section.widget.placeAt(node);
            } else if (section instanceof jQuery) {
                jQuery(node).append(section);
            } else {
                node.appendChild(section);
            }
        },

        _addButtons: function () {
            if (!this.buttons) {
                return;
            }
            this._createButtons();
        },

        _createButtons: function () {
            var buttonId, classButton, btn;
            for (var i = 0; i < this.buttons.length; i++) {

                buttonId = this._getButtonId(this.buttons[i].id);
                if(this.buttons[i].classButton){
                    classButton = this.buttons[i].classButton;
                }else{
                     classButton = Button;
                }
                if(!this.buttons[i].props){
                    this.buttons[i].props = {
                        label:this.buttons[i].description
                    };
                }else if(this.buttons[i].description){
                    this.buttons[i].props.label = this.buttons[i].description;
                }
                this.buttons[i].props.id = buttonId;
                btn = new classButton(this.buttons[i].props);
                btn.placeAt(this.buttonsNode);
                this.buttons[i].widget = btn;
            }

        },

        _getButtonId: function (id) {
            return 'dialogButton_' + this.id + '_' + id;
        },

        _addListerners: function () {
            //var $button;
            if (!this.buttons) {
                return;
            }
            var buttonId;
            var context = this;

            for (var i = 0; i < this.buttons.length; i++) {
                buttonId = this._getButtonId(this.buttons[i].id);
                //$button = jQuery('#' + buttonId);

                if (Array.isArray(this.buttons[i].callback)) {
                    this.buttons[i].widget._callbackDlg = [];
                    this.buttons[i].widget._removeDlg = this.remove.bind(this);
                    for (var j = 0; j < this.buttons[i].callback.length; j++) {
                        this.buttons[i].widget._callbackDlg.push(this.buttons[i].callback[j]);
                    }

                    this.buttons[i].widget.onClick = function(){
                        for (var j = 0; j < this._callbackDlg.length; j++) {
                            this._callbackDlg[j].call(context);
                        }
                        this._removeDlg();
                        //$button.on('click', this.buttons[i].callback[j].bind(this));
                    };
                } else if(this.buttons[i].callback){
                    this.buttons[i].widget._callbackDlg = this.buttons[i].callback.bind(this);
                    this.buttons[i].widget._removeDlg = this.remove.bind(this);
                    this.buttons[i].widget.onClick = function(){
                        this._callbackDlg();
                        this._removeDlg();
                        //$button.on('click', this.buttons[i].callback.bind(this));
                    };                    
                } else {
                    var oc = this.buttons[i].widget.onClick.bind(this.buttons[i].widget);
                    this.buttons[i].widget._removeDlg = this.remove.bind(this);
                    this.buttons[i].widget.onClick = function(){
                        if(oc){
                            oc();
                        }
                        this._removeDlg();
                    };                    
                }
                //$button.on('click', function () {
                //  this.remove(); // Al fer click en un boto sempre es tanca el dialeg
                //}.bind(this));
            }
        },

        remove: function () {
            // console.log("CustomDialog#remove", this.id);
            if (!this.destroying) {
                this.destroying = true;
                // console.log("CustomDialog#remove (confirmed)", this.id);
                this.destroyRecursive();
                this.dispatchEvent(this.eventName.DESTROY, {id: this.id, refId: this.refId});
            }
        },

        onHide: function () {
            // console.log("CustomDialog#onHide");
            this.inherited(arguments);
            this.dispatchEvent(this.eventName.CANCEL, {id: this.id, refId: this.refId});
            this.remove();
        },

        // Correspn al docId o algun altre tipus d'identificador únic amb el que volem agrupar dialegs
        setRefId: function (refId) {
            this.refId = refId;
        }
    });
});
