function show_switch_context(data) {
  var container = $('#context_target');
  $.get(mustache_dir + 'context_switch.template', function(template, textStatus, jqXhr) {
    template = $(template).filter('#context-switch-template').html();
    // redraw svg on maximize or minimize window
    if(typeof(data) == "undefined") {
      data = JSON.parse($("#context_target").attr("data-data"));
    }
    $('#tab_context_button a').click();
    Mustache.parse(template);   // optional, speeds up future uses
    var rendered = Mustache.render(template, data);
    container.html(rendered).attr("data-data", JSON.stringify(data, null, 2));
    plot_context_radar(data.interfaces);
  });
}
