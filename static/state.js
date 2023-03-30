class State {
    constructor(board) {
        this.movex = 0;
        this.movey = 0;
        this.movekaanto = "";
        this.mycolor = "";
        this.myTurn = false;
        this.siirtoTila = "klikkaa";
        this.pendingMove = null;
        this.board = board;
        
        this.animationRunning = false;
        this.animationTime = 1000;
        this.animationStarted = 0;
        this.activeNelio = null;
        this.suunta = "myotapaiva";
        this.movenumber = 0;
    }
    
    // returns true if new move was done
    clickAt(x,y) {
        if (this.siirtoTila == "klikkaa") this.updateClick(x,y);
        if (this.siirtoTila == "kaanna") {
            if (this.updateKaanna(x,y)) return true;
        }
        return false;
    }
    
    updateClick(x,y) {
        var position = this.board.positionAtCoordinates(x,y);
        if (position != null) {
            var i = position[0];
            var j = position[1];
            //console.log(this.board.board[i][j]);
            if (this.board.board[i][j] == "white" || this.board.board[i][j] == "black") return;
            this.board.board[i][j] = this.mycolor;
            this.pendingMove = [i,j];
            this.movex = i+1;
            this.movey = j+1;
            this.siirtoTila = "kaanna";
        }
    }
    
    updateKaanna(x,y) {
        var kaanto = this.board.getKaantoAtCoordinates(x,y);
        if (kaanto != null) {
            this.movekaanto = kaanto;
            // TODO pendingMove pitäisi muuttaa nulliksi vasta kun palvelimelta on saatu vastaus
            this.pendingMove = null;
            this.siirtoTila = "klikkaa";
            this.myTurn = false;
            return true;
            //makeMoveRequest();
        }
        return false;
    }
    
    update(res) {
        this.mycolor = res.color;
        if (res.yourturn == "yes") this.myTurn = true;
        else this.myTurn = false;
        this.board.update([BigInt(res.positionwhite), BigInt(res.positionblack)]);
        if (res.movenumber != this.movenumber) {
            this.animationStarted = Date.now();
            this.animationRunning = true; 
            var kaanto = res.lastkaanto;
            if (kaanto == "ylavasen-vasen") {
                this.activeNelio = "vasenyla";
                this.suunta = "vastapaiva";
            } else if (kaanto == "ylavasen-oikea") {
                this.activeNelio = "vasenyla";
                this.suunta = "myotapaiva";
            } else if (kaanto == "alavasen-vasen") {
                this.activeNelio = "vasenala";
                this.suunta = "vastapaiva";
            } else if (kaanto == "alavasen-oikea") {
                this.activeNelio = "vasenala";
                this.suunta = "myotapaiva";
            } else if (kaanto == "ylaoikea-vasen") {
                this.activeNelio = "oikeayla";
                this.suunta = "vastapaiva";
            } else if (kaanto == "ylaoikea-oikea") {
                this.activeNelio = "oikeayla";
                this.suunta = "myotapaiva";
            } else if (kaanto == "alaoikea-vasen") {
                this.activeNelio = "oikeaala";
                this.suunta = "vastapaiva";
            } else if (kaanto == "alaoikea-oikea") {
                this.activeNelio = "oikeaala";
                this.suunta = "myotapaiva";
            } else {
                this.animationRunning = false;
            }
        }
        this.movenumber = res.movenumber;
    }
}
