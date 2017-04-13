define([
        'dojo/_base/declare',
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dojo/text!./templates/IocFilteredList.html',
        'dojo/_base/array',
        'ioc/widgets/IocFilteredItem/IocFilteredItem',
        'dojo/text!./css/IocFilteredList.css'
    ],
    function (declare, _WidgetBase, _TemplatedMixin, template, arrayUtil, IocFilteredItem, css) {

        var cssStyle = document.createElement('style');
        cssStyle.innerHTML = css;
        document.head.appendChild(cssStyle);


        return declare([_WidgetBase, _TemplatedMixin], {
            templateString: template,

            baseClass: 'ioc-filtered-list',

            constructor: function (data, field) {
                this.inherited(arguments);


                console.log("IocFilteredList#constructor", data);
                // El template és només una llista
                // Que es omple amb IocFilteredItems
                // Ha de rebre:
                //  - el node a sota del qual s'ha de desplegar
                //  - l'array d'elements total
                //  - L'element de destí: rebrà l'objecte amb la informació del item clicat

                // ALERTA[Xavi]: data contindrà l'array d'elements, i selector el objecte al que se li pasarà la informació quan un element sigui seleccionat <-- Eliminar això i fer servir un on i emit amb la informació de l'objecte?

                this.data = data;
                this.fieldName = field;

                this.fullList = data;


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
                    this.filter($input.val());
                }.bind(this));


                $input.on('keydown', function (e) {
                    if (e.which == 13) {
                        console.log("S'ha pres enter...");

                        var item;
                        // cas 1: Hi ha almenys un element visible a la llista, es selecciona
                        if (this.candidate) {
                            item = this.candidate;
                        } else {
                            item = {name: $input.val(), username: ''};
                        }
                        // cas 2: No hi ha cap element, es crea un nou amb el text entrat

                        console.log("Buidant el valor de l'input");


                        console.log("S'ha buidat?", $input.val(''));


                        this.filter('');
                        this._itemSelected(item);
                        e.preventDefault();
                        e.stopPropagation();
                    }


                }.bind(this));

                        console.log("Existeix el entryListItem?", this.entryListItem);

                $input.on('blur', function(e) {
                    console.log("BLUR!", e);


                    // console.log("Qui te el focus??", e.relatedTarget.className);

                    if (e.relatedTarget && (e.relatedTarget.className.indexOf('ioc-filtered-list')>=0 ||  e.relatedTarget.className.indexOf('ioc-filtered-item')>=0)) {
                        return;
                    } else {
                        this.filter(null);
                    }


                    // }.bind(this), 100);

                    // this.filter(null);
677

                }.bind(this));

                $input.on('focus', function() {
                    console.log("FOCUS!");
                    this.filter($input.val());
                }.bind(this));



                jQuery(this.selectedItemsNode).on('click', function() {
                    $input.focus();

                });


                jQuery(this.hiddenSelected).attr('name', this.fieldName);


            },

            reset: function() {
                console.log("RESET: Posem el valor a en blanc");
                var $input = jQuery(this.entryText);
                $input.val('');

                console.log("RESET: Posem el valor ocult en blanc");
                var $field = jQuery(this.hiddenSelected);
                $field.val('');

                var $items = jQuery(this.selectedItemsNode).find('.selected');

                console.log("RESET: eliminant selected:", $items);
                $items.remove();


                console.log("RESET: inicialitzant seletect, candidate i lastquery");
                this.selected={};
                this.candidate = null;
                this.lastQuery = null;



                this.filter(null);
            },


            _fill: function () {
                console.log("IocFilteredList#fill", this.fullList);
                // Omple la llista amb tots els elements
                this.itemListByUserId = {};

                var that = this;

                arrayUtil.forEach(this.fullList, function (item) {
                    // Create our widget and place it
                    var data = item;
                    data.container = that;
                    item.widget = new IocFilteredItem(data);
                    item.widget.placeAt(that.contentListNode);
                    item.widget.on('selected', that._itemSelected.bind(that));
                    that.itemListByUserId[item.username] = item;
                });

                // ALERTA[Xavi] Comprovar si el valor establert s'ha passat correctament per referencia
                console.log("S'han actualitzat els items de l'array?", this.items);
            },


            _itemSelected: function (item) {
                console.log("IocFilteredList#_itemSelected", item);
                console.log("IocFilteredList#_itemSelected");
                console.log("S'ha fet click a l'item:", item);

                console.log("llista completa d'items:", this.fullList);

                var newItem = jQuery('<li class="selected"></li>');
                newItem.html(item.name + " &lt;" + item.username + "&gt;" + " <span>x</span>");
                newItem.attr('data-user-id', item.username);
                newItem.attr('data-name', item.name);

                // TODO[Xavi] Afegir botó de tancar i listener

                console.log("Existeix el node entryListItem?", this.entryListItem);
                newItem.insertBefore(this.entryListItem);

                var that = this;
                var closeButton = newItem.find('span').on('click', function () {
                    that._itemUnselected(this);
                });


                if (item.username) {
                    this.selected[item.username] = item;
                    this.itemListByUserId[item.username].widget.hide();

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

                    console.log ("^***** TROBAT FORM??? ", this.$form);
                    this.$form.on('reset', function() {
                        console.log("Form Reset!");
                        this.reset();

                    }.bind(this));
                }

            },

            _itemUnselected: function (itemNode) {
                console.log("IocFilteredList#_itemUnselected", itemNode);

                var $node = jQuery(itemNode.parentElement);

                if (this.selected[$node.attr('data-user-id')] || this.selected[$node.attr('data-name')]) {
                    console.log("L'item estava seleccionat");
                    delete(this.selected[$node.attr('data-user-id')]);
                    this.selectedCount--;
                    $node.remove();

                    this._updateHiddentSelectedField();

                } else {
                    console.error("L'item no es troba a la llista de seleccionats:", $node, this.selected);
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
                    console.log("El camp principal a passat a required");
                    jQuery(this.entryText).prop('required', true);
                } else {
                    console.log("El camp principal ja no es required");
                    jQuery(this.entryText).prop('required', false);
                }

                console.log("Updated Hiddenfield:", $hiddenField.val());
                console.log("Required Hiddenfield:", $hiddenField.prop('required'));

            },


            /**
             * ALERTA[Xavi] Quan query es una cadena buida es mostren tots els resultats, però quan és null no es mostra cap resultat i s'amaga la llista
             *
             * @param query
             */
            filter: function (query) {
                console.log("IocFilteredList#filter");

                if (this.candidate) {

                    jQuery(this.candidate.widget.domNode).removeClass('candidate');
                    this.candidate = null;
                }

                var isEmpty = true;


                if (query !== null) {
                    query = query.toLowerCase();
                }

                this.lastQuery = query;


                for (var i = 0; i < this.fullList.length; i++) {

                    var item = this.fullList[i];

                    var lowerUserId = item.username.toLowerCase(),
                        lowerName = item.name.toLowerCase();


                    // Si es troba seleccioant no cal comprovar-lo, ja s'ha amagat abans.
                    if (this.selected[item.username]) {
                        console.log("Ja es troba seleccionat", item.username);
                        continue;

                    } else if (query=== null) {
                        console.log("El query es null");
                        item.widget.hide();

                    } else {
                        // Si la mida del query es 0 es mostren tots

                        if (query.length === 0 || lowerUserId.indexOf(query) >= 0 || lowerName.indexOf(query) >= 0) {
                            console.log(item, " ha passat el filtre ", query);
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

                // TODO: Si la mida de la llista es 0 s'amaga la llista, en cas contrari es mostra
                if (isEmpty) {
                    jQuery(this.contentListNode).css('display', 'none');
                } else {
                    jQuery(this.contentListNode).css('display', 'inherit');
                }



            }
        });
    });


