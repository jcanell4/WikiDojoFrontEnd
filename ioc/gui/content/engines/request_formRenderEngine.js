/**
 * @module NotificationEngineFactory
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define([], function () {


    var createField = function (data) {
            var $fieldContainer = jQuery('<div>'),
                $input = createInput(data),
                $label;


            if (data.label) {
                $label = jQuery('<label>');
                $label.html(data.label);
                $fieldContainer.append($label);
                $fieldContainer.append('<br>');
            }


            // TODO si és un check o radiobutton s'afegeix el input abans que el label! (before? first?)

            if ($label && (data.type == 'checkbox' || data.type == 'radio')) {
                $input.insertBefore($label);

            } else {
                $fieldContainer.append($input);
            }

            if (data.type == 'hidden') {
                $fieldContainer.addClass('hidden');
            }


            return $fieldContainer;
        },

        createInput = function (data) {
            var $input;


            switch (data.type) {
                case 'textarea':
                    $input = jQuery('<textarea>');
                    if (data.value) {
                        $input.html(data.value);
                    }
                    break;

                case 'button':
                    console.log("*** afegint button ***");
                    $input = jQuery('<button>');
                    $input.val(data.value);
                    $input.html(data.value);
                    break;

                default:
                    $input = jQuery('<input>');
                    $input.attr('type', data.type);
                    if (data.value) {
                        $input.val(data.value);
                    }

            }

            $input.attr('name', data.name);


            // Afegim les propietats
            if (data.properties) {

                for (var i = 0; i < data.properties.length; i++) {
                    // $input.attr(data.properties[i], true);
                    $input.prop(data.properties[i], true);
                    $input.attr('data-'+data.properties[i], true); // ALERTA[Xavi]Això permet recordar els props originals, per exemple la casella marcada per defecte
                    // console.log("** Afegit prop?", $input.prop());
                }
            }



            return $input;
        };


    return function (data) {




        // console.log("DATA:", data);

        var $container = jQuery('<div>'),
        $form = jQuery('<form>');
        $form.attr('action', data.action);
        $form.attr('method', data.method);
        $container.addClass('request_form');

        for (var i = 0; i < data.fields.length; i++) {
            console.log(data.fields[i]);
            // ALERTA[Xavi] La creació del camp inclou el label
            var $field = createField(data.fields[i]);

            $form.append($field);
        }


        var $button = jQuery('<button>');
        $button.html(data.send_button);
        $form.append($button);
        $container.append($form);

        return $container;
    }
});
