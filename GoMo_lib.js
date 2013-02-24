if (typeof GoMo !== 'object') GoMo = {};
(function() {
  GoMo.url = '/game';
  GoMo.connect = function(onsuccess, onerror) {
    GoMo.on_success = onsuccess;
    GoMo.on_error = onerror;
    interval = setInterval(GoMo.update, 2000);
  }
  GoMo.abort = function() {
    clearInterval(interval);
  }
  GoMo.request = function(senddata) {
    $.ajax({
      url: GoMo.url,
      data: JSON.stringify(senddata),
      contentType: 'application/json',
      dataType: 'json',
      type: 'GET',
      success: function(data, textStatus, jqXHR) {
        if (!data.result) {GoMo.on_error(textStatus); return;}
        if (data.result != 'success') {GoMo.on_error(data.result); return;}
        GoMo.on_success(data);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        GoMo.on_error(textStatus);
      }
    });
  }
  GoMo.join = function(username) {
    GoMo.request({'action': 'join', 'username': username});
  }
  GoMo.startGame = function() {
    GoMo.request({'action': 'startGame'});
  }
  GoMo.update = function() {
    GoMo.request({});
  }
  GoMo.do_turn = function(x, y) {
    GoMo.request({'x': x, 'y': y});
  }
}());
