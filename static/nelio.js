class Nelio {
    constructor(nimi,x,y,img, signx, signy, boardx, boardy, sivu) {
        this.nimi = nimi;
        this.x = x;
        this.y = y;
        this.sivu = sivu;
        this.angle = 0;
        this.angleDelta = 0;
        this.img = img;
        this.signx = signx;
        this.signy = signy;
        this.boardx = boardx;
        this.boardy = boardy;
    }
    
    draw(ctx, board, state) {
        var kuulaRotateAngle = 0;
        if (this.nimi == state.activeNelio) {
            if (state.animationRunning) {
                var currentTime = Date.now();
                var elapsed = currentTime - state.animationStarted;
                this.angleDelta = (elapsed/state.animationTime) * Math.PI;
                if (state.suunta == "vastapaiva") this.angleDelta *= -1;
                kuulaRotateAngle = this.angleDelta;
                if (state.suunta == "vastapaiva") kuulaRotateAngle += Math.PI/2;
                else kuulaRotateAngle -= Math.PI/2;
            }
            if (Math.abs(this.angleDelta) > Math.PI/2) {
                if (this.angleDelta > 0) this.angleDelta = Math.PI/2;
                else this.angleDelta = -Math.PI/2;
                this.angle += this.angleDelta;
                this.angleDelta = 0;
                state.animationRunning = false;
            }
        }
        
        var hypotenuusa = Math.sqrt(2)*this.sivu/2;
        var shift = Math.abs(hypotenuusa*Math.cos(Math.PI/4) - hypotenuusa*Math.cos(Math.PI/4 - (this.angleDelta - Math.floor(this.angleDelta/(Math.PI/2))*(Math.PI/2))));
        ctx.save();
        ctx.translate(this.x + this.sivu/2 + shift*this.signx, this.y + this.sivu/2 + shift*this.signy);
        ctx.rotate(this.angle + this.angleDelta);
        ctx.drawImage(this.img, -this.sivu/2, -this.sivu/2, this.sivu, this.sivu);
        
        ctx.restore();
        ctx.save();
        ctx.translate(this.x + this.sivu/2 + shift*this.signx, this.y + this.sivu/2 + shift*this.signy);
        ctx.rotate(kuulaRotateAngle);
        
        this.drawKuulat(ctx, board, state);
        ctx.restore();
    }
    
    drawKuulat(ctx, board, state) {
        ctx.translate(-this.sivu/2, -this.sivu/2);
        for (var i = 0; i < 3; i++) {
            for (var j = 0; j < 3; j++) {
                ctx.beginPath();
                var x = this.sivu/3;
                if (state.pendingMove != null && state.pendingMove[0] === this.boardx + i && state.pendingMove[1] === this.boardy + j) {
                    ctx.fillStyle = state.mycolor;
                    ctx.arc(x/2 + j*x, x/2 + i*x, 20, 0, Math.PI*2);
                } else if (board[this.boardx + i][this.boardy + j] == "tyhjavalittu") {
                    ctx.fillStyle = 'grey';
                    ctx.arc(x/2 + j*x, x/2 + i*x, 20, 0, Math.PI*2);
                } else if (board[this.boardx + i][this.boardy + j] == "white") {
                    ctx.fillStyle = "white";
                    ctx.arc(x/2 + j*x, x/2 + i*x, 20, 0, Math.PI*2);
                } else if (board[this.boardx + i][this.boardy + j] == "black") {
                    ctx.fillStyle = "black";
                    ctx.arc(x/2 + j*x, x/2 + i*x, 20, 0, Math.PI*2);
                }
                ctx.fill();
            }
        }
    }
}
