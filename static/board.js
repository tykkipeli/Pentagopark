class Board {
    constructor() {
        this.board = new Array(6);
        this.board_pos = new Array(6);
        this.koko = 50;
        this.offset = this.koko;
        this.vali = this.koko;
        this.kuula_paikan_koko = this.koko/5;
        this.kuula_koko = this.koko*3/10;
        this.tunnistus_sade = this.koko/5;
        this.kaanto_tunnistus_sade = this.koko/3
        this.sisasize = 2*this.offset + 5*this.vali;
        this.ulkosize = 2*this.offset + 5*this.vali + 2*this.offset;
        this.kaanto_pos = {};
        this.kaanto_napit = ["ylavasen-vasen","ylavasen-oikea","ylaoikea-vasen","ylaoikea-oikea","alavasen-vasen","alavasen-oikea","alaoikea-vasen","alaoikea-oikea"];
        this.pieces = {};
        this.alustaBoard(this.offset, this.vali);
        this.alustaKaantoPos(this.offset, this.sisasize);
        this.alustaPieces();
    }
    
    alustaPieces() {
        this.pieces["vasenyla"] = new Nelio("vasenyla", this.offset,this.offset,document.getElementById("vasenyla"),-1,-1,0,0, this.sisasize/2);
        this.pieces["oikeayla"] = new Nelio("oikeayla", this.offset + this.sisasize/2, this.offset,document.getElementById("oikeayla"),1,-1,0,3,this.sisasize/2);
        this.pieces["vasenala"] = new Nelio("vasenala", this.offset, this.offset + this.sisasize/2,document.getElementById("vasenala"),-1,1,3,0,this.sisasize/2);
        this.pieces["oikeaala"] = new Nelio("oikeaala", this.offset + this.sisasize/2,this.offset + this.sisasize/2,document.getElementById("oikeaala"),1,1,3,3,this.sisasize/2);
    }
    
    alustaBoard(offset, vali) {
        for (var i = 0; i < 6; i++) {
            this.board[i] = new Array(6);
            this.board_pos[i] = new Array(6);
            var v = this.sisasize/6.0;
            for (var j = 0; j < 6; j++) {
                this.board[i][j] = "tyhja";
                this.board_pos[i][j] = {x: offset + v/2 + j*v, y: offset + v/2 + i*v};
            }
        }
    }
    alustaKaantoPos(offset, sisasize) {
        this.kaanto_pos["ylavasen-vasen"] = {x: offset/2 , y: 3*offset };
        this.kaanto_pos["ylavasen-oikea"] = {x: 3*offset , y: offset/2 };
        this.kaanto_pos["ylaoikea-vasen"] = {x: 6*offset , y: offset/2 };
        this.kaanto_pos["ylaoikea-oikea"] = {x: sisasize + 1.5*offset , y: 3*offset };
        this.kaanto_pos["alavasen-vasen"] = {x: 3*offset , y: sisasize + 1.5*offset };
        this.kaanto_pos["alavasen-oikea"] = {x: offset/2 , y: 6*offset };
        this.kaanto_pos["alaoikea-vasen"] = {x: sisasize + 1.5*offset , y: 6*offset };
        this.kaanto_pos["alaoikea-oikea"] = {x: 6*offset , y: sisasize + 1.5*offset};
    }
    
    positionAtCoordinates(x,y) {
        for (var i = 0; i < 6; i++) {
            for (var j = 0; j < 6; j++) {
                if (Math.abs(this.board_pos[i][j].x - x) < this.tunnistus_sade && Math.abs(this.board_pos[i][j].y - y) < this.tunnistus_sade) return [i,j];
            }
        }
        return null;
    }
    
    getKaantoAtCoordinates(x,y) {
        for (const i in this.kaanto_napit) {
            var kaanto = this.kaanto_napit[i];
            if (Math.abs(this.kaanto_pos[kaanto].x - x) < this.kaanto_tunnistus_sade && Math.abs(this.kaanto_pos[kaanto].y - y) < this.kaanto_tunnistus_sade) return kaanto;
        }
        return null;
    }
    
    update(bitboard) {
        console.log(bitboard);
        for (var i = 0; i < 6; i++) {
            for (var j = 0; j < 6; j++) {
                if (this.board[i][j] != "tyhjavalittu") this.board[i][j] = symboliKohdassa(BigInt(i+1),BigInt(j+1),bitboard);
            }
        }
    }
    
    updateHover(x,y) {
        for (var i = 0; i < 6; i++) {
            for (var j = 0; j < 6; j++) {
                if (this.board[i][j] == "white" || this.board[i][j] == "black") continue;
                if (Math.abs(this.board_pos[i][j].x - x) < this.tunnistus_sade && Math.abs(this.board_pos[i][j].y - y) < this.tunnistus_sade) {
                    this.board[i][j] = "tyhjavalittu";
                    //console.log(i + " " + j);
                } else {
                    this.board[i][j] = "tyhja";
                }
            }
        }
    }
    
    draw(ctx, state) {
        ctx.fillStyle = '#9bc777';
        ctx.fillRect(0, 0, this.ulkosize, this.ulkosize);
        this.drawNeliot(ctx, state);
        this.drawKaantoNapit(ctx);
        //this.drawRasti(ctx, this.offset, this.vali);
    }
    
    drawNeliot(ctx, state) {
        for (const i in this.pieces) {
            var piece = this.pieces[i];
            piece.draw(ctx, this.board, state); 
        }
    }
    
    
    //Onko turha?
    drawKuulat(ctx,state, offset, vali, kuula_koko, kuula_paikan_koko) {
        for (var i = 0; i < 6; i++) {
            for (var j = 0; j < 6; j++) {
                ctx.beginPath();
                var koko = kuula_koko;
                if (state.pendingMove != null && state.pendingMove[0] === i && state.pendingMove[1] === j) {
                    ctx.fillStyle = state.mycolor;
                } else if (this.board[i][j] === "tyhja") {
                    ctx.fillStyle = 'grey';
                    koko = kuula_paikan_koko;
                } else if (this.board[i][j] === "tyhjavalittu") {
                    ctx.fillStyle = 'grey';
                    koko = kuula_paikan_koko + 5;
                } else if (this.board[i][j] === "white") {
                    ctx.fillStyle = 'white';
                } else {
                    ctx.fillStyle = 'black';
                }
                ctx.arc(2*offset+ j*vali, 2*offset+ i*vali, koko, 0, Math.PI*2);
                ctx.fill();
            }
        }
    }
    
    drawKaantoNapit(ctx) {
        for (const i in this.kaanto_napit) {
            var kaanto = this.kaanto_napit[i];
            ctx.beginPath();
            ctx.fillStyle = 'blue';
            ctx.arc(this.kaanto_pos[kaanto].x, this.kaanto_pos[kaanto].y, this.kaanto_tunnistus_sade, 0, Math.PI*2);
            ctx.fill();
        }
    }
    
    
    //Onko turha?
    drawRasti(ctx, offset, vali) {
        ctx.beginPath();
        ctx.moveTo(2*offset - 0.5*vali, 2*offset + vali*2.5);
        ctx.lineWidth = 10;
        ctx.lineTo(2*offset + 5.5*vali, 2*offset + vali*2.5);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(2*offset + vali*2.5, 2*offset - 0.5*vali);
        ctx.lineWidth = 10;
        ctx.lineTo(2*offset + vali*2.5, 2*offset + 5.5*vali);
        ctx.stroke();
    }
}
