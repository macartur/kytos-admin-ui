;(function() {

  $(".terminal").kterminal();

  $(".left-nav-toggle>a").click(function(e){
    e.preventDefault();
    $("body").toggleClass("mobile");
    return false;
  })

}());
