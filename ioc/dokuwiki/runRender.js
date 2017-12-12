define([], function () {
    var res = function (idBodyContent) {

        //TODO [Josep] Sempre hauria d'haver JSINFO[plugin_iocexportl] excepte si eliminem el plugin (REVISAR)
        if (!JSINFO['plugin_iocexportl'] || !JSINFO['plugin_iocexportl']['toccontents']) {
            var $toc = jQuery('#toc__inside');
            $toc.css('display', 'none');
            var $tocul = $toc.children('ul.toc');
            $tocul.css('display', 'none');
        }

        jQuery.expr[':'].parents = function (a, i, m) {
            return jQuery(a).parents(m[3]).length < 1;
        };

        jQuery('#' + idBodyContent).imagesLoaded(function () {
            jQuery('p > a > img').filter(':parents(.iocfigure)').filter(':parents(.ioccontent)').each(function (key, value) {
                var $img = jQuery(this);
                var width = ($img.attr('width') ? parseInt($img.attr('width')) : $img.width());
                var height = ($img.attr('height') ? parseInt($img.attr('height')) : $img.height());
                //var widthaux = 0;
                if (width > 48 && height > 48) {
                    $img.parents('p').addClass('imgb');
                    var element = jQuery('<div class="imgb"></div>');
                    var $remove = $img.closest('p');
                    $remove.before(element);
                    var $anchor = $img.parent();
                    $anchor.appendTo(element);
                    var title = $img.attr('title');
                    if (title) title = title.replace(/\/[-+]?\w+$/gi, "");
                    if (title) {
                        jQuery('<div class="title">' + title + '</div>').appendTo(element);
                    }
                    $remove.remove();
                }
                else { //[Rafa] La classe 'imga' no existeix encara
                    $img.parents('p').addClass('imga');
                    var element = jQuery('<div class="imga"></div>');
                    var $remove = $img.closest('p');
                    $remove.before(element);
                    var $anchor = $img.parent();
                    $anchor.appendTo(element);
                    var title = $img.attr('title');
                    if (title) title = title.replace(/\/[-+]?\w+$/gi, "");
                    if (title) {
                        jQuery('<div class="title">' + title + '</div>').appendTo(element);
                    }
                    $remove.remove();
                }
            });

            jQuery('div.iocfigure img,.ioctable img').each(function (key, value) {
                var $img = jQuery(this);
                var width = ($img.attr('width') ? parseInt($img.attr('width')) : $img.width());
                var height = ($img.attr('height') ? parseInt($img.attr('height')) : $img.height());
                var widthaux = 0;
                if (width) {
                    widthaux = width * 1;
                    if (widthaux > 800) {
                        widthaux = 800;
                    }
                    jQuery(this).attr('width', widthaux);
                }

                if (height) {
                    var ratio = parseFloat(width / height);
                    height = parseInt(widthaux / ratio);
                    jQuery(this).attr('height', height);
                }
            });

            var infoFigure = function () {
                jQuery('div.iocfigure img').each(function (key, value) {
                    var img = jQuery(this);
                    var width = img.width();
                    var info = img.parents('.iocfigure').children().filter('.iocinfo');
                    info.css('width', width);
                });
            };

            var infoTable = function () {
                jQuery('div.ioctable table, div.iocaccounting table').each(function (key, value) {
                    var table = jQuery(this);
                    var width = table.width();
                    if(width>0){
                        var info = table.parents('.iocaccounting,.ioctable').children().filter('.iocinfo');
                        info.css('width', width);
                    }
                });
            };

            infoFigure();
            infoTable();

            jQuery('p > img.latex_inline').filter('[title*=Fail]').each(function (key, value) {
                jQuery(this).parent().remove();
            });
        });
    };
    return res;
});




