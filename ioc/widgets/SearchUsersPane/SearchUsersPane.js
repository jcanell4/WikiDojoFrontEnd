define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dojo/text!./templates/SearchUsersPane.html',
    'dojo/on',
    'dojo/_base/lang',
    'dojo/text!./css/SearchUsersPane.css',
    "dojo/Evented",
    'dijit/form/Button',
], function (declare, _WidgetBase, _TemplatedMixin, template, on, lang, css, Evented, Button) {

    var cssStyle = document.createElement('style');
    cssStyle.innerHTML = css;
    document.head.appendChild(cssStyle);

    return declare("ioc.widgets.SarchUsersPane", [_WidgetBase, _TemplatedMixin, Evented], {

        templateString: template,

        baseClass: "search-users-pane",

        postCreate: function () {
            this.selection = {};
            this.inherited(arguments);

            var searchButton = new Button({
                label: this.buttonLabel,

            }).placeAt(this.buttonContainer);


            var that = this;

            var $tableBody = jQuery(this.tableBodyNode);

            searchButton.on('click', function () {

                var $input = jQuery(that.searchNode);

                jQuery.ajax(that.searchDataUrl, {

                    dataType: 'json',
                    data: {
                        sectok: that.token,
                        filter: $input.val()
                    },

                    success: function (response) {
                        console.log("Resposta:", response);

                        // TODO[Xavi] comprovar que el type es "array"
                        // TODO[Xavi] els valors es troben a data[0].value

                        var data = response[0].value;

                        $tableBody.empty();

                        for (var i = 0; i < data.length; i++) {
                            var $row = jQuery('<tr>');
                            var $colName = jQuery('<td>');
                            $colName.html(data[i].name);

                            var $colUsername = jQuery('<td>');
                            $colUsername.html(data[i].username);

                            var $colSelect = jQuery('<input type="checkbox">');
                            $colSelect.attr('data-username', data[i].username);
                            $colSelect.attr('data-name', data[i].name);

                            $colSelect.on('click', function () {
                                var $this = jQuery(this);
                                if ($this.prop('checked')) {
                                    that.selection[$this.attr('data-username')] = {
                                        name: $this.attr('data-name'),
                                        username: $this.attr('data-username')
                                    };

                                } else {
                                    delete(that.selection[$this.attr('data-username')]);
                                }
                            });

                            $row.append($colName);
                            $row.append($colUsername);
                            $row.append($colSelect);
                            $tableBody.append($row);
                        }

                    }
                });

                $input.val('');

            })


        },

        getSelected: function () {
            return this.selection;
        }

    });
});
