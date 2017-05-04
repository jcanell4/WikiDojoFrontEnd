define([
        'dojo/_base/declare',
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dojo/text!./templates/IocFilteredList.html',
        'dojo/_base/array',
        'ioc/widgets/IocFilteredItem/IocFilteredItem',
        'dojo/text!./css/IocFilteredList.css',
        'dijit/form/Button',
        'ioc/wiki30/dispatcherSingleton',
        'ioc/widgets/SearchUsersPane/SearchUsersPane',
        'dojo/dom-class',
    ],
    function (declare, _WidgetBase, _TemplatedMixin, template, arrayUtil, IocFilteredItem, css, Button, getDispatcher, SearchUsersPane, domClass) {

        var cssStyle = document.createElement('style');
        cssStyle.innerHTML = css;
        document.head.appendChild(cssStyle);

        var dispatcher = getDispatcher();
        
        var isRelatedTargetAnItem = function(event){
            var ret = false;
            var relatedTarget = event.relatedTarget || event.originalEvent.explicitOriginalTarget || event.originalTarget;
            ret = relatedTarget && (domClass.contains(relatedTarget, 'ioc-filtered-list') || domClass.contains(relatedTarget, 'ioc-filtered-item'));
            if(relatedTarget && !ret){
                relatedTarget = relatedTarget.parentNode;
                ret = relatedTarget && (domClass.contains(relatedTarget, 'ioc-filtered-list') || domClass.contains(relatedTarget, 'ioc-filtered-item'));
            }
            return ret;
        }


        return declare([_WidgetBase, _TemplatedMixin], {
            templateString: template,

            baseClass: 'ioc-filtered-list',

            constructor: function (/*data, field*/) {
                this.inherited(arguments);
                this.selected = {}; // referenciats pel id per trobar-los més ràpidament
                this.candidate = null;
            },

            postCreate: function () {
                this.inherited(arguments);

                this._addListeners();
                this._fill();

            },

            _addListeners: function () {
                var $input = jQuery(this.entryText);


                $input.on('change click input', function () {
//                    console.log("on (change, click or input)");
                    this.filter($input.val());
                }.bind(this));


                $input.on('keydown', function (e) {
                    if (e.which == 13) { // Enter
//                        console.log("on (Enter)");

                        var item;
                        // cas 1: Hi ha almenys un element visible a la llista, es selecciona
                        if (this.candidate) {
                            item = this.candidate;
                        } else {
                            item = {name: $input.val(), username: ''};
                        }

                        this.filter('');
                        this._itemSelected(item);
                        e.preventDefault();
                        e.stopPropagation();

                    } else if (e.which === 27) {
//                       console.log("on (Esc)");
                       this.filter(null);
                        e.preventDefault();
                        e.stopPropagation();
                    }


                }.bind(this));

                $input.on('blur', function (e) {
//                    console.log("on (blur)");
//                    if (e.relatedTarget && (e.relatedTarget.className.indexOf('ioc-filtered-list') >= 0 || e.relatedTarget.className.indexOf('ioc-filtered-item') >= 0)) {
                    if (isRelatedTargetAnItem(e)) {
//                        console.log("on (blur.return)");
                        return;
                    } else {
//                        console.log("on (blur.filter(null))");
                        this.filter(null);
                    }
                }.bind(this));

                $input.on('focus', function () {
//                    console.log("on (focus)");
                    this.filter($input.val());
                }.bind(this));

                this.selectedItemsNode.addEventListener('click', function () {
//                    console.log("on (selectedItemsNode.click)");
                    $input.focus();
                });

                // jQuery(this.selectedItemsNode).on('click', function () {
                //     $input.focus();
                //
                // });


                var searchButton = new Button({
                    iconClass: 'ioc-filtered-list-icon search', //ALERTA[Xavi] L'icona es una llanterna, canviar per les nostre spropies classes
                    showLabel: false
                }).placeAt(this.buttonContainer);


                var $searchButton = jQuery(searchButton.domNode);

                $searchButton.on('click', function () {

                    var searchUserWidget = new SearchUsersPane({
                        urlBase: this.searchDataUrl,
                        buttonLabel: this.buttonLabel,
                        //token: this.token,
                        colNameLabel: 'Nom', // TODO[Xavi] Localitzar
                        colUsernameLabel: 'Nom d\'usuari'// TODO[Xavi] Localitzar
                    });

                    var dialogParams = {
                        title: "Cerca usuaris per afegir", //TODO[Xavi] Localitzar
                        message: '',

                        sections: [
                            // Secció 1: widget de cerca que inclou la taula pel resultat.
                            // searchUserWidget.domNode

                            {widget: searchUserWidget},
                        ],

                        buttons: [
                            {
                                id: 'add-results',
                                description: 'Afegir', // TODO[Xavi] Localitzar
                                buttonType: 'default',
                                callback: function () {
                                    var items = searchUserWidget.getSelected();
                                    // console.log("Retornat del widget: ", items);

                                    for (var item in items) {
                                        this._itemSelected(items[item]);
                                    }

                                }.bind(this),
                            },

                        ]

                    };

                    var dialogManager = dispatcher.getDialogManager();
                    var dialog = dialogManager.getDialog(dialogManager.type.DEFAULT, 'search-users', dialogParams);

                    dialog.show();

                }.bind(this));

            },

            reset: function () {
                var $input = jQuery(this.entryText);
                $input.val('');

                var $field = jQuery(this.hiddenSelected);
                $field.val('');

                var $items = jQuery(this.selectedItemsNode).find('.selected');
                $items.remove();


                this.selected = {};
                this.candidate = null;
                this.lastQuery = null;


                this.filter(null);
            },


            _fill: function () {
                // console.log("IocFilteredList#fill", this.data);
                this.itemListByUserId = {};

                var that = this;

                arrayUtil.forEach(this.data, function (item) {
                    // Create our widget and place it
                    var data = item;
                    data.container = that;
                    item.widget = new IocFilteredItem(data);
                    item.widget.placeAt(that.contentListNode);
                    item.widget.on('selected', that._itemSelected.bind(that));
                    that.itemListByUserId[item.username] = item;
                });

            },


            _itemSelected: function (item) {

                if (this.selected[item.username]) {
                    // console.log("Ja s'ha afegit anteriorment")
                    return;
                }

                var newItem = jQuery('<li class="selected"></li>');
                newItem.html(item.name + " &lt;" + item.username + "&gt;" + " <span>x</span>");
                newItem.attr('data-user-id', item.username);
                newItem.attr('data-name', item.name);

                newItem.insertBefore(this.entryListItem);

                var that = this;
                var closeButton = newItem.find('span').on('click', function () {
                    that._itemUnselected(this);
                });


                if (item.username) {
                    this.selected[item.username] = item;

                    // ALERTA[Xavi] Els elements afegits a partir del dialeg no són a la llista
                    if (this.itemListByUserId[item.username]) {
                        this.itemListByUserId[item.username].widget.hide();
                    }

                } else {
                    // Aquest cas només pot ocorrer quan s'entra un valor que no es trobi a la llista
                    this.selected[item.name] = item;
                }
                this._updateHiddentSelectedField();

                var $input = jQuery(this.entryText);
                $input.val('');

                // ALERTA[Xavi] en el post create no el troba. Com no cal fer res fins que es selecciona alguna cosa ho afegim aquí
                if (!this.$form) {
                    this.$form = $input.closest('form');

                    this.$form.on('reset', function () {
                        this.reset();
                    }.bind(this));
                }

            },

            _itemUnselected: function (itemNode) {
                // console.log("IocFilteredList#_itemUnselected", itemNode);

                var $node = jQuery(itemNode.parentElement);

                if (this.selected[$node.attr('data-user-id')] || this.selected[$node.attr('data-name')]) {
                    delete(this.selected[$node.attr('data-user-id')]);
                    this.selectedCount--;
                    $node.remove();

                    this._updateHiddentSelectedField();

                } else {
                    // console.error("L'item no es troba a la llista de seleccionats:", $node, this.selected);
                }


                this.filter(this.lastQuery);

            },

            _updateHiddentSelectedField: function () {
                var $hiddenField = jQuery(this.hiddenSelected);

                var selectedUserIds = "",
                    first = true;

                for (var selected in this.selected) {
                    if (first) {
                        first = false;
                    } else {
                        selectedUserIds += ",";
                    }
                    selectedUserIds += selected;
                }


                $hiddenField.val(selectedUserIds);

                if (selectedUserIds.length === 0) {
                    jQuery(this.entryText).prop('required', true);
                } else {
                    jQuery(this.entryText).prop('required', false);
                }
            },


            /**
             * ALERTA[Xavi] Quan query es una cadena buida es mostren tots els resultats, però quan és null no es mostra cap resultat i s'amaga la llista
             *
             * @param query
             */
            filter: function (query) {
                // console.log("IocFilteredList#filter");

                if (this.candidate) {

                    jQuery(this.candidate.widget.domNode).removeClass('candidate');
                    this.candidate = null;
                }

                var isEmpty = true;


                if (query !== null) {
                    query = query.toLowerCase();
                }

                this.lastQuery = query;


                for (var i = 0; i < this.data.length; i++) {

                    var item = this.data[i];

                    var lowerUserId = item.username.toLowerCase(),
                        lowerName = item.name.toLowerCase();


                    // Si es troba seleccioant no cal comprovar-lo, ja s'ha amagat abans.
                    if (this.selected[item.username]) {
                        // console.log("Ja es troba seleccionat", item.username);
                        continue;

                    } else if (query === null) {
                        item.widget.hide();

                    } else {
                        // Si la mida del query es 0 es mostren tots

                        if (query.length === 0 || lowerUserId.indexOf(query) >= 0 || lowerName.indexOf(query) >= 0) {
                            item.widget.show();

                            if (isEmpty) {
                                this.candidate = item;

                                jQuery(this.candidate.widget.domNode).addClass('candidate');
                                isEmpty = false;
                            }


                        } else {
                            item.widget.hide();
                        }
                    }
                }

                if (isEmpty) {
                    jQuery(this.contentListNode).css('display', 'none');
                } else {
                    jQuery(this.contentListNode).css('display', 'inherit');
                }


            }
        });
    });


