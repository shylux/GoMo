import SimpleHTTPServer
import urlparse, urllib
import SocketServer
import json
import sys, random
from collections import Counter

def enum(**enums):
  return type('Enum', (), enums)

GameState = enum(LOBBY=0, RUNNING=1)
LogAction = enum(GAME_RESET=0, PLAYER_JOIN=1, GAME_START=2, TURN=3, GAME_END=4)
class JFC:
  def __init__(self):
    self.log = []
    self.reset_game()
  def add_player(self, name):
    if self.state != GameState.LOBBY: return 'Game already started.'
    player = {'name': name, 'cards': [], 'id': len(self.players)+1}
    self.draw_cards(player)
    self.players.append(player)
    self.log_event(LogAction.PLAYER_JOIN, name)
  def get_player(self, player_id):
    return self.players[player_id-1]

  def do_turn(self, data):
    if self.state != GameState.RUNNING: return 'Game not started'
    try:
      x = int(data['x'])
      y = int(data['y'])
      player = self.get_player(self.turn_counter % len(self.players) + 1)
      field = self.board[y][x]
      #check if player has enough cards
      c = Counter(player['cards'])
      if c[field['color']] <= field['level']: return 'not enough cards'
      sub = Counter({field['color']: field['level']+1})
      c.subtract(sub)
      player['cards'] = list(c.elements())
      field['player_id'] = player['id']
      field['level'] += 1
      self.turn_counter += 1
      self.draw_cards(player)
      self.log_event(LogAction.TURN, {'x': x, 'y': y})
      if self.check_finish():
        print 'Game Finished'
        self.log_event(LogAction.GAME_END)
        self.reset_game()
      return None
    except:
      print "Unexpected error:", sys.exc_info()[0]
      return 'x and y not present or out of range'
  def draw_cards(self, player):
    while len(player['cards']) < 7:
      player['cards'].append(random.randrange(6))
    player['cards'] = sorted(player['cards'])

  def check_finish(self):
    for x in range(0, len(self.board) - 1):
      for y in range(0, len(self.board[0]) - 1):
        for dx in range(-1, 1):
          for dy in range(-1, 1):
            if dx == 0 and dy == 0: continue
            if self.check_finish_helper(x, y, dx, dy): return True
    return False
  def check_finish_helper(self, x, y, dx, dy):
    player = self.board[y][x]['player_id']
    for i in range(1, 4):
      if self.board[y+i*dy][x+i*dx]['player_id'] == 0 or self.board[y+i*dy][x+i*dx]['player_id'] != player: return False
    return True
  
  def start_game(self):
    if len(self.players) < 2:
      return 'at least 2 players required'
    self.state = GameState.RUNNING
    self.log_event(LogAction.GAME_START)
  def reset_game(self):
    self.turn_counter = 0
    self.board = [[] for _ in range(6)]
    self.players = []
    board_raw = [[0,1,2,3,4,5], [4,3,0,5,2,1], [2,5,4,1,0,3], [1,0,3,2,5,4], [5,2,1,4,3,0], [3,4,5,0,1,2]]
    for y in range(6):
      for x in range(6):
        self.board[y].append({'color': board_raw[y][x], 'player_id': 0, 'level': 0})
    self.state = GameState.LOBBY
    self.log_event(LogAction.GAME_RESET)
  def log_event(self, action, detail=None):
    if detail != None:
      self.log.append({'action': action, 'detail': detail})
    else:
      self.log.append({'action': action})


class GameHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
  def do_GET(self):
    parsedRequest = urlparse.urlparse(self.path)
    if parsedRequest.path == '/game':
      try:
        data_raw = urllib.unquote(parsedRequest.query)
        data = json.loads(data_raw)
        error = None
        if data['action'] == 'do_turn':
          error = gamestate.do_turn(data)
        elif data['action'] == 'join':
          error = gamestate.add_player(data['username'])
        elif data['action'] == 'startGame':
          error = gamestate.start_game()
        else:
          error = 'unknown action: ' + data['action']
      except:
        pass
        #print "Unexpected error:", sys.exc_info()[0]
        #error = 'Malformattet JSON or no "action" attribute'
      if error is None:
        self.send_game_state()
      else:
        self.send_game_error(error)
      return
    return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

  def json_response(self):
    self.send_response(200);
    self.send_header('Content-Type', 'application/json');
    self.end_headers()
  def send_game_state(self):
    self.wfile.write(json.dumps(gamestate.__dict__))
    self.wfile.close()
  def send_game_error(self, error_obj):
    self.wfile.write(json.dumps({'result': 'error', 'message': error_obj}))
    self.wfile.close()

class ReuseTCPServer(SocketServer.TCPServer):
  allow_reuse_address = True


gamestate = JFC()
PORT = 8080
server = ReuseTCPServer(('0.0.0.0', PORT), GameHandler)
print "running on port", PORT
server.serve_forever()
