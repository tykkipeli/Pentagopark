from datetime import datetime
from datetime import timedelta

class Game:
    def __init__(self, white, black, gameid):
        self.white = white
        self.black = black
        self.white_active = True
        self.black_active = True
        self.turn = white
        self.positions = [(0,0)]
        self.state = "kesken"
        self.lastkaanto = "none"
        self.movenumber = 0
        self.lasttimeUpdate = datetime.now()
        self.whiteTime = timedelta(seconds = 600)
        self.blackTime = timedelta(seconds = 600)
        self.gameid = gameid
        self.lastseenWhite = datetime.now()
        self.lastseenBlack = datetime.now()
        self.extraInformation = "none"
        self.chatsize = 50
        self.chat = [""]*self.chatsize
        self.chatsenders = [""]*50*self.chatsize
        self.playermessages = {}
        self.chatindex = 0
    
    def send_message(self, message, player):
        self.chat[self.chatindex] = message
        self.chatsenders[self.chatindex] = player
        for p in [self.white, self.black]:
            if p not in self.playermessages:
                self.playermessages[p] = []
            self.playermessages[p].append(self.chatindex)
        self.chatindex += 1
        self.chatindex %= self.chatsize

    def update_gamestate(self):
        if self.state != "kesken":
            return
        now = datetime.now()
        ero = now - self.lastseenWhite
        if ero.seconds >= 1:
            self.state = "mustan voitto"
            self.extraInformation = "Valkoinen jätti pelin"
        ero = now - self.lastseenBlack
        if ero.seconds >= 1:
            self.state = "valkoisen voitto"
            self.extraInformation = "Musta jätti pelin"
    
    def report_activity(self, player):
        if self.white == player:
            self.lastseenWhite = datetime.now()
        elif self.black == player:
            self.lastseenBlack = datetime.now()
            
    def has_active_players(self):
        now = datetime.now()
        ero = now - self.lastseenWhite
        if ero.seconds < 1:
            return True
        ero = now - self.lastseenBlack
        if ero.seconds < 1:
            return True
        return False
    
    def update_game_times(self):
        if self.state != "kesken":
            return
        now = datetime.now()
        ero = now - self.lasttimeUpdate
        self.lasttimeUpdate = now
        if self.turn == self.white:
            self.whiteTime -= ero
        else:
            self.blackTime -= ero
        if self.whiteTime < timedelta(seconds = 0):
            self.state = "mustan voitto"
            self.whiteTime = timedelta(seconds = 0)
        if self.blackTime < timedelta(seconds = 0):
            self.state = "valkoisen voitto"
            self.blackTime = timedelta(seconds = 0)
        
    def get_inactive_players(self):
        lista = []
        now = datetime.now()
        ero = now - self.lastseenWhite
        if not self.white_active or ero.seconds >= 1:
            lista.append(self.white)
        ero = now - self.lastseenBlack
        if not self.black_active or ero.seconds >= 1:
            lista.append(self.black)
        return lista
    
    def resign(self, player):
        if player == self.white:
            self.white_active = False
            self.state = "mustan voitto"
            self.extraInformation = "Valkoinen luovutti"
        elif player == self.black:
            self.black_active = False
            self.state = "valkoisen voitto"
            self.extraInformation = "Musta luovutti"
