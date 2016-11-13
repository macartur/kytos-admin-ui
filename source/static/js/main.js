;(function() {

  $(".terminal").kterminal();

  $("[type='checkbox'], [type='radio']").bootstrapSwitch();

  $("a,div").focus(function(){
    $(this).blur();
  })

  // carroussel
  $('.owl-carousel').owlCarousel({
    margin:10,
    nav:true,
  });

  // Change the selector if needed
  var $table = $('table.scroll'),
      $bodyCells = $table.find('tbody tr:first').children(),
      colWidth;

  update_tabs_sizes();

  function resize_topology_svg() {
    $("#topology-chart").width($('#chart').width());
    $("#topology-chart svg").attr("width", $('#chart').width());
  }

  function resize_chart_container() {
    $("#chart").height($(window).height() - $('.navbar').height());
    $("#background-map").height($(window).height() - $('.navbar').height());
  }

  $(window).on('resize', function() {
    update_tabs_sizes();
    // Adjust the width of thead cells when window resizes
    // Get the tbody columns width array
    colWidth = $bodyCells.map(function() {
        return $(this).width();
    }).get();

    // Set the width of thead columns
    $table.find('thead tr').children().each(function(i, v) {
        $(v).width(colWidth[i]);
    });

    resize_chart_container();
    resize_topology_svg();

  }).trigger('resize');

}());

$(window).ready(function(){
  update_tabs_sizes();

  if (default_settings.enable_log) {
    $('#enable_log').prop('checked', true).change();
  } else {
    $('#enable_log').prop('checked', false).change();
  }

  if (default_settings.show_topology) {
    $('#show_topology').prop('checked', true).change();
    $('#topology-chart').show();
  } else {
    $('#show_topology').prop('checked', false).change();
    $('#topology-chart').hide();
  }

  if (default_settings.show_map) {
    $('#show_map').prop('checked', true).change();
    $('#background-map').show();
  } else {
    $('#show_map').prop('checked', false).change();
    $('#background-map').hide();
  }

  $('#map_opacity').bootstrapSlider({
    formatter: function(value) {
      return "Map opacity of " + value;
    }
  })
    .on('slide', function(current) {
      $('#background-map').css('opacity', current.value);
    })
    .on('change', function(current) {
      $('#background-map').css('opacity', current.value.newValue);
    });

  $('.owl-carousel').owlCarousel({
    margin:10,
    nav:true
  })

  load_layouts();
  draw_background_map(draw_topology);

});

$(document).ready(function() {
  var i = 1;
  $('.progress-hosts .circle').removeClass().addClass('circle');
  $('.progress-hosts .bar').removeClass().addClass('bar');
  setInterval(function() {
    $('.progress-hosts .circle:nth-of-type(' + i + ')').addClass('active');
    $('.progress-hosts .circle:nth-of-type(' + (i - 1) + ')').removeClass('active').addClass('done');
    $('.progress-hosts .circle:nth-of-type(' + (i - 1) + ') .label').html('&#10003;');
    $('.progress-hosts .bar:nth-of-type(' + (i - 1) + ')').addClass('active');
    $('.progress-hosts .bar:nth-of-type(' + (i - 2) + ')').removeClass('active').addClass('done');
    i++;
    if (i == 0) {
      $('.progress-hosts .bar').removeClass().addClass('bar');
      $('.progress-hosts div.circle').removeClass().addClass('circle');
      i = 1;
    }
  }, 1000);
});
