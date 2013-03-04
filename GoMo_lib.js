if (typeof GoMo !== 'object') GoMo = {};
(function() {
  GoMo.last_data = undefined;
  GoMo.url = '/game';
  GoMo.connect = function(onsuccess, onerror) {
    GoMo.on_success = onsuccess;
    GoMo.on_error = onerror;
    interval = setInterval(GoMo.update, 2000);
    GoMo.update();
  }
  GoMo.abort = function() {
    clearInterval(interval);
  }
  GoMo.request = function(senddata, onsuccess) {
    if (localStorage.getItem('player_name') !== null) {
      senddata.name = localStorage.getItem('player_name');
      senddata.password = localStorage.getItem('player_password');
    }
    $.ajax({
      url: GoMo.url,
      data: JSON.stringify(senddata),
      contentType: 'application/json',
      dataType: 'json',
      type: 'GET',
      success: function(data, textStatus, jqXHR) {
        if (!data.result) {GoMo.on_error(textStatus); return;}
        if (data.result != 'success') {GoMo.on_error(data.result); return;}
        GoMo.last_data = data;
        if (data.you == undefined) localStorage.clear();
        if (typeof onsuccess !== 'undefined') {
          onsuccess(data)
        } else {
          GoMo.on_success(data);
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        GoMo.on_error(textStatus);
      }
    });
  }
  GoMo.join = function(username) {
    GoMo.request(
        {'action': 'join', 'name': username},
        function(data) {
          localStorage.setItem('player_id', data.you.id);
          localStorage.setItem('player_name', data.you.name);
          localStorage.setItem('player_password', data.you.password);
          GoMo.on_success(data);
        }
        );
  }
  GoMo.startGame = function() {
    GoMo.request({'action': 'startGame'});
  }
  GoMo.resetGame = function() {
    GoMo.request({'action': 'resetGame'});
  }
  GoMo.update = function() {
    GoMo.request({});
  }
  GoMo.do_turn = function(x, y) {
    GoMo.request({'action': 'do_turn', 'x': x, 'y': y});
  }
  GoMo.getCurrentPlayer = function() {
    return GoMo.last_data.players[
      GoMo.last_data.turn_counter % GoMo.last_data.players.length
      ];
  }
  GoMo.getPlayerId = function() {
    return localStorage.getItem('player_id');
  }
}());
