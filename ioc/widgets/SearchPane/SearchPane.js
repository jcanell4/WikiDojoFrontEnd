define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dojo/text!./templates/SearchPane.html',
    'dojo/on',
    'dojo/_base/lang',
    'dojo/text!./css/SearchPane.css',
    "dojo/Evented",
    'dijit/form/Button',
    'ioc/wiki30/Request',
    'ioc/wiki30/processor/AbstractResponseProcessor',
], function (declare, _WidgetBase, _TemplatedMixin, template, on, lang, css, Evented, Button, Request, AbstractResponseProcessor) {

    var cssStyle = document.createElement('style');
    cssStyle.innerHTML = css;
    document.head.appendChild(cssStyle);

    return declare("ioc.widgets.SearchPane", [_WidgetBase, _TemplatedMixin, Request, AbstractResponseProcessor], {

        templateString: template,
        baseClass: "search-users-pane",
        
        process: function(response, dispatcher){

            var that = this;
            var $tableHead = jQuery(this.tableHeadNode);
            var $tableBody = jQuery(this.tableBodyNode);
            var data = response;

            $tableBody.empty();


            // Add headers rows
            // var fields = response[0];
            var $row = jQuery('<tr>');
            
            if (!this.fields && Array.isArray(response) && response.length>0) {
                this.generateFields(response[0]);
            }
            
            // TODO: passar els fiels com argument al constructor (arribaran del server), i que incloguin el 'label': {field1:label1, field2:label2}
            for (var fieldKey in this.fields) {
                var $field = jQuery('<th>');
                $field.html(this.fields[fieldKey]);
                $row.append($field);
            }

            // +1 cell for the check box
            $row.append(jQuery('<th>'));

            $tableHead.append($row);



            // Add body rows
            for (var i = 0; data!= null && i<data.length; i++) {
                $row = jQuery('<tr>');

                var $colSelect = jQuery('<input type="checkbox">');

                for (fieldKey in this.fields) {
                    var $col = jQuery('<td>');
                    $col.html(data[i][fieldKey]);
                    $colSelect.attr('data-'+fieldKey, data[i][fieldKey]);
                    $row.append($col);
                }


                $colSelect.on('click', function () {
                    var $this = jQuery(this);

                    var auxData = {};

                    for (fieldKey in that.fields ) {
                        auxData[fieldKey] = $this.attr('data-' + fieldKey);
                    }

                    var fieldId = auxData[that.getColFieldId()];

                    if ($this.prop('checked')) {

                        that.selection[fieldId] = auxData;

                    } else {
                        delete(that.selection[fieldId]);
                    }
                });

                $row.append($colSelect);

                $tableBody.append($row);
            }

        },

        generateFields: function(data) {
            this.fields = {};

            for (var fieldKey in data) {
                this.fields[fieldKey] = fieldKey;
            }
        },

        getColFieldId: function() {
          if (this.colFieldId) {
              return this.colFieldId;
          } else {
              var keys = Object.keys(that.fields);
              if (keys.length>0) {
                  return keys[0];
              } else {
                  console.error("Column field id not found. There are no fields:", that.fields);
                  return '';
              }

          }
        },

        postCreate: function () {
            var that = this;
            this.selection = {};
            this.inherited(arguments);

            var searchButton = new Button({
                label: this.buttonLabel,
            }).placeAt(this.buttonContainer);

            this.addProcessor("array", this);

            searchButton.on('click', function () {
                that.onClickButton();
            })
        },
        
        onClickButton: function(){
            var $input = jQuery(this.searchNode);
                
            this.sendRequest({
                filter: $input.val(),
                id: this.ns
            });            
            $input.val('');
        },

        getSelected: function () {
            return this.selection;
        },

        // constructor: function(args) {
        //     console.log("Arguments?", args);
        // }


    });
});
