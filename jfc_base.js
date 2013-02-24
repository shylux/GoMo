$(window).ready(resize);
$(window).resize(resize);

function resize() {
  var div = $('#board');
  div.css('height', div.width());
  $('.card').css('height', $('.card').width()*1.5);
}

function updateGameState(data) {
	for (x=0; x < data.board.length ; x++) {
		for (y=0; y < data.board.length; y++) {
			var datafield = data.board[y][x];
      var domfield = $('#board').find('[y="'+y+'"]').find('[x="'+x+'"]');
      domfield.addClass('color_' + datafield.color);
      domfield.html('player: '+datafield.player_id+'<br/>level: '+datafield.level);
    }
  }
  //TODO
}
function showError(error_string) {
  //TODO create nice error window
  alert(error_string);
}

$(window).ready(function() {
  // add x and y coordinates to tr and td to identify them later on
  $('#board tr').each(function(y, value) {
    $(this).attr('y', y);
    $(this).find('td').each(function(x, value) {
      $(this).attr('x', x);
    });
  });
  GoMo.connect(updateGameState, showError);
});
