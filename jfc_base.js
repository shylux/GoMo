$(window).ready(resize);
$(window).resize(resize);

function resize() {
  var div = $('#board');
  div.css('height', div.width());
  $('.card').css('height', $('.card').width()*1.5);
}
