define(function() {
  return function() {
    var element, textarea, wrapper;
    textarea = jQuery('#wiki__text');
    wrapper = jQuery('<div>', {
      "class": 'ace-doku'
    });
    element = jQuery('<div>');
    (function() {
      var prop, properties, _i, _len;
      properties = ['border', 'border-color', 'border-style', 'border-width', 'border-top', 'border-top-color', 'border-top-style', 'border-top-width', 'border-right', 'border-right-color', 'border-right-style', 'border-right-width', 'border-bottom', 'border-bottom-color', 'border-bottom-style', 'border-bottom-width', 'border-left', 'border-left-color', 'border-left-style', 'border-left-width', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left'];
      for (_i = 0, _len = properties.length; _i < _len; _i++) {
        prop = properties[_i];
        wrapper.css(prop, textarea.css(prop));
      }
      return wrapper.append(element).insertAfter(textarea).hide();
    })();
    return {
      element: function() {
        return element.get(0);
      },
      hide: function() {
        return wrapper.hide();
      },
      incr_height: function(value) {
        wrapper.css('height', (wrapper.height() + value) + 'px');
        return element.css('height', wrapper.height() + 'px');
      },
      on_resize: function() {
        return element.css('width', wrapper.width() + 'px');
      },
      set_height: function(value) {
        wrapper.css('height', value + 'px');
        return element.css('height', wrapper.height() + 'px');
      },
      show: function() {
        wrapper.show();
        element.css('width', wrapper.width() + 'px');
        return element.css('height', wrapper.height() + 'px');
      }
    };
  };
});

