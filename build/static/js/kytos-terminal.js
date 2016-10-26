/*! Kytos Admin - Kterminal - 2016-10-25
 * Copyright (c) 2016 José Luiz Coe; */
;
(function($) {

    $.fn.kterminal = function() {
        var this_obj = $(this),
            this_header = this_obj.find('.terminal-header'),
            this_body = this_obj.find('.terminal-body'),
            this_actions = this_obj.find('.terminal-actions'),
            this_form = this_obj.find('form'),
            external_link = $(".open-terminal");

        var action_close = function() {
            this_obj.fadeOut();
            this_obj.attr("class", "terminal closed");
        }

        var action_max = function() {
            this_obj.toggleClass("maximized");
        }

        var action_med = function() {
            this_obj.attr("class", "terminal");
        }

        var action_min = function() {
            this_obj.attr("class", "terminal minimized");
        }

        // Actions
        this_actions.find('a').each(function() {
            $(this).click(function(e) {
                e.preventDefault();
                e.stopPropagation();
                var this_link = $(this),
                    action = this_link.attr("data-action");

                if (action == "close") {
                    action_close();
                } else if (action == "max") {
                    action_max();
                } else if (action == "med") {
                    action_med();
                } else if (action == "min") {
                    action_min();
                }
                return false;
            });
        });

        external_link.click(function(e) {
            e.preventDefault();
            e.stopPropagation();
            this_obj.fadeIn();
            this_obj.attr("class", "terminal")
        })

        this_form.submit(function(e) {
            e.preventDefault();
            e.stopPropagation();
            alert('Must define callback');
            return false;
        });

        return this_obj;
    }
}(jQuery));