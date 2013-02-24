$(function() {
	$('td').bind('click', function() {
		var x = $(this).attr('x');
		var y = $(this).parent().attr('y');
		gameserverrequest(
			{
        'action': 'do_turn',
				'x': x,
				'y': y
			}
		);
	});

	gameserverrequest({});

	setInterval("gameserverrequest({});", 10000);
});

function joinGame() {
  gameserverrequest(
      {
      'action': 'join',
      'username': $('#username').val()
      }
  );
}

function startGame() {
  gameserverrequest(
      {
      'action': 'startGame'
      }
  );
}

function gameserverrequest(request) {
	sreq = JSON.stringify(request);
	$.ajax({
		url: "http://192.168.1.2:8080/game",
		data: 	sreq,
		contentType: "application/json",
		dataType: 'json',
		type: 'GET',
		success: function(data, textStatus, jqXHR) {callback(data)}
	});
}

function callback(json) {
  if (typeof json.message != 'undefined') return;
	if (typeof json.board != 'undefined') {
		for (x=0; x < json.board.length ; x++) {
			for (y=0; y < json.board.length; y++) {
				var field = json.board[y][x];
				var point = $('#field').find('[y="'+y+'"]').find('[x="'+x+'"]');
				point.attr("color", field.color);
				var player = (field.player_id == 0) ? "free" : field.player_id;
				point.html("pl: "+player+"<br />lv: "+field.level);
			}
		}
	}
  id = json.turn_counter % json.players.length
  if (json.players.length > 0) {
  $('#status').html(json.players[id].name + " turn");}
  $('#cards').html("");
  for (i in json.players) {
    $('#cards').append(
    json.players[i].cards + " cards<br/>"
    );
  }
}
