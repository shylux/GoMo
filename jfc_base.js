$(window).ready(resize);
$(window).resize(resize);

function resize() {
  var div = $('#board');
  div.css('height', div.width());
  $('.card').css('height', $('.card').width()*1.5);
}

function updateGameState(data) {
  var currPlayer = GoMo.getCurrentPlayer();
  // show board
	for (x=0; x < data.board.length ; x++) {
		for (y=0; y < data.board.length; y++) {
			var datafield = data.board[y][x];
      var domfield = $('#board').find('[y="'+y+'"]').find('[x="'+x+'"]');
      domfield.addClass('color_' + datafield.color);
      domfield.html('p: '+datafield.player_id+'<br/>lv: '+datafield.level);
    }
  }
  if (typeof currPlayer !== 'undefined' && GoMo.player_id == currPlayer.id) {
    $('#board').addClass('active');
  } else {
    $('#board').removeClass('active');
  }

  // list players
  $('.player:not(.template, .join)').remove();
  for (i=0; i < data.players.length; i++) {
    var template = $('.player.template').clone().removeClass('template');
    template.find('.player_name').text(data.players[i].name);
    if (typeof currPlayer !== 'undefined' && i == currPlayer.id) template.addClass('active');
    if (i == GoMo.player_id) template.addClass('me');
    $('.player.join').before(template);
  }
  // show cards
  if (typeof GoMo.player_id !== 'undefined') {
    $('.card').remove();
    jQuery.each(data.players[GoMo.player_id].cards, function(index, value){
      $('#cards').append(
        $('<div></div>').addClass('card').addClass('color_'+value)
        );
    });
    resize();
  }
}
function showError(error_string) {
  //TODO create nice error window
  $('h1').text(error_string);
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

function join() {
  var username = $('#join').val();
  GoMo.join(username);
}
