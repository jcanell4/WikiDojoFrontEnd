/**
 * @module NotificationEngineFactory
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define([], function () {

    return function (data) {

        // console.log("DATA:", data);

        var closeId = data.id + "_close_button",
            $pane = jQuery('<div class="notification ' + (data.type || '') + '"></div>'),
            $titleGroup = jQuery('<div class="notification-title-group"></div>'),
            $title = jQuery('<b></b>'),
            $closeButton = jQuery('<span class="dijitInline dijitTabCloseButton dijitTabCloseIcon" id="' + closeId + '"></span>'),
            $content = jQuery('<div></div>');

        $title.text(data.title);
        $titleGroup.append($title);

        if (data.closable) {
            $titleGroup.append($closeButton);
        }

        $content.html(data.text);

        $pane.append($titleGroup);
        $pane.append($content);


        return $pane;
    }
});
