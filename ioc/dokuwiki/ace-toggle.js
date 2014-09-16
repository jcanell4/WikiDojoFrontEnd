define(function() {
  return function(spec) {
    var IMAGES_BASE, img_off, img_on;
    IMAGES_BASE = window.DOKU_BASE + 'lib/plugins/aceeditor/images/';
    img_on = jQuery('<img>').addClass('ace-toggle').attr('src', IMAGES_BASE + 'toggle_on.png').insertAfter(jQuery('#size__ctl')).click(spec.on_disable).hide();
    img_off = jQuery('<img>').addClass('ace-toggle').attr('src', IMAGES_BASE + 'toggle_off.png').insertAfter(jQuery('#size__ctl')).click(spec.on_enable);
    return {
      on: function() {
        img_on.show();
        return img_off.hide();
      },
      off: function() {
        img_on.hide();
        return img_off.show();
      }
    };
  };
});
