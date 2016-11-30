/**
 * @module NotificationEngineFactory
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define([], function () {

    return function (data) {

        //ALERTA[Xavi] Problema: aqui el que retornem es una cadena de text i no un widget de dojo, per tant el reemplaç de les dades als 'dojo-attach-points' s'ha de fer "manualment"

        console.log("DATA:", data);

        var closeId = data.id + "_close_button",
            $pane = jQuery('<div class="notification ' + (data.type || '') + '"></div>'),
            $titleGroup = jQuery('<div class="notification-title-group"></div>'),
            $title = jQuery('<b></b>'),
            $closeButton = jQuery('<span class="dijitInline dijitTabCloseButton dijitTabCloseIcon" id="' + closeId + '"></span>'),
            $content = jQuery('<div></div>');

        console.log("data title?", data, data.title);
        $title.text(data.title);
        $titleGroup.append($title);

        if (data.closable) {
            $titleGroup.append($closeButton);
        }

        $content.text(data.text);


        $pane.append($titleGroup);
        $pane.append($content);


        //var $template= jQuery(template),
        //
        //    $titleNode = $template.find("[data-dojo-attach-point='titleNode']"),
        //    $contentNode = $template.find("[data-dojo-attach-point='containerNode']");
        //
        //    $titleNode.html(data.type + ": " + data.title);
        //    $contentNode.html(data.text);


        //return function (data) {
        //    return typeof data === 'string' ? data : 'Tipus de dada no reconegut.';
        //},

        return $pane;
    }
});
