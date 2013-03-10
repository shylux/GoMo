$(window).ready(resize);
$(window).resize(resize);

function resize() {
  $('#board').css('height', $('#board').width());
  $('.card').css('height', $('.card').width()*1.5);
}

function updateGameState(data) {
  var currPlayer = GoMo.getCurrentPlayer();
  // show board
	for (x=0; x < data.board.length ; x++) {
		for (y=0; y < data.board.length; y++) {
			var datafield = data.board[y][x];
      var domfield = $('#board').find('[data-y="'+y+'"]').find('[data-x="'+x+'"]');
      domfield.addClass('color_' + datafield.color);
      domfield.html('p: '+datafield.player_id+'<br/>lv: '+datafield.level);
    }
  }
  // check if its your turn
  if (typeof currPlayer !== 'undefined' && GoMo.getPlayerId() == currPlayer.id) {
    $('#board').addClass('active');
  } else {
    $('#board').removeClass('active');
  }

  // check if game is running
  $('#start').css('display', (data.state == 0) ? 'block' : 'none');
  $('#reset').css('display', (data.state == 1) ? 'block' : 'none');

  // list players
  $('.player:not(.template, .join)').remove();
  for (i=0; i < data.players.length; i++) {
    var template = $('.player.template').clone().removeClass('template');
    template.find('.player_name').text(data.players[i].name);
    if (typeof currPlayer !== 'undefined' && i == currPlayer.id) template.addClass('active');
    if (i == GoMo.getPlayerId()) template.addClass('me');
    $('.player.join').before(template);
  }
  // show cards
  $('.card').remove();
  if (GoMo.getPlayerId()) {
    jQuery.each(data.players[GoMo.getPlayerId()].cards, function(index, value){
      $('#cards').append(
        $('<div></div>').addClass('card').addClass('color_'+value)
        );
    });
    resize();
  }
}
function showError(error_string) {
  $('#error').text(error_string).slideDown().delay(500).slideUp();
}

$(window).ready(function() {
  // add x and y coordinates to tr and td to identify them later on
  $('#board tr').each(function(y, value) {
    $(this).attr('data-y', y);
    $(this).find('td').each(function(x, value) {
      $(this).attr('data-x', x);
    });
  });
  GoMo.connect(updateGameState, showError);
  // add click handler for board
  $('#board td').bind('click', function() {
    if ($('#board').hasClass('active')) {
      GoMo.do_turn($(this).attr('data-x'), $(this).parent().attr('data-y'));
    }
  });
});

function join() {
  var username = $('#join').val();
  GoMo.join(username);
}
