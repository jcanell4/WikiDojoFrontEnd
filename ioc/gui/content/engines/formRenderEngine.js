/**
 * Aquest motor de render espera que el format de les dades sigui string i retorna el mateix contingut
 * o un missatge d'error si no era un string.
 *
 * @module standardEngineFactory
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define([], function () {

    // Si obj1.priority es major es colocarà abans
    var comparePriority = function (obj1, obj2) {
            //console.log('formRenderEngine#comparePriority', obj1.priority, obj2.priority);

            if (!obj1) {
                return obj2.priority || 0;
            } else if (!obj2) {
                return obj1.priority;
            } else {
                return obj2.priority - obj1.priority;
            }
        },

        renderGroup = function (group) {
            var fields = group.fields.sort(comparePriority),
                $group = jQuery('<div>'),
                $header;

            // renderitzar el marc i titol
            if (group.title) {
                $header = jQuery('<p>');
                $header.addClass('h2');
                $header.html(group.title);

                $group.append($header);
            }

            if (group.hasFrame) {
                $group.addClass('form-frame');
            } else {
                $group.addClass('form-without-frame');
            }

            for (var i = 0; i < fields.length; i++) {
                console.log("Rendering form item: ", fields[i]);
                $group.append(renderField(fields[i]));
            }

            $group.addClass('form-group col-xs-6'); // input-group o form-group?

            return $group;

        },

        renderField = function (field) {
            var $field = jQuery('<div>'),
                $label = jQuery('<label>'),
                $input = jQuery('<input>');

            //$field.addClass('col-xs-6'); // TODO[Xavi] Canviar el nombre per la conversió a columnes

            $label.html(field.label);
            $field.append($label);

            $input.attr('type', field.type); // Afegir un switch-case per crear cada tipus de camp
            $input.attr('name', field.name);

            $input.val(field.value);
            $input.addClass('form-control');

            $field.append($input);

            if (field.props) {
                addPropsToInput(field.props, $input);
            }


            return $field;
        },

        addPropsToInput = function (props, $input) {
            for (var prop in props) {
                $input.attr(prop, props[prop]);
            }
        },
        renderRow = function (row) {
            var $row = jQuery('<div>'),
                $header, $title;
            $row.addClass('row');

            if (row.title) {
                $header = jQuery('<div>');
                $header.addClass('col-xs-12');

                $title = jQuery('<p>');
                $title.addClass('h1');
                $title.html(row.title);

                $row.append($header.append($title));
            }

            row.groups.sort(comparePriority);

            for (var i = 0; i < row.groups.length; i++) {
                $row.append(renderGroup(row.groups[i]));

            }

            return $row;
        };

    return function (data) {
        //console.log("StandardRenderEngine", data);

        var $doc = jQuery('<div>'),
            $form = jQuery('<form>'),
            $row;


        $doc.addClass('container-fluid ioc-bootstrap'); // Si fem servir container la amplada màxima es ~1200px
        $doc.append($form);

        //$form.addClass('row');


        console.log('Data to render:', data);

        data.rows.sort(comparePriority);

        for (var i = 0; i < data.rows.length; i++) {
            $row = renderRow(data.rows[i]);
            $form.append($row);
        }


        return $doc;
    }
});
