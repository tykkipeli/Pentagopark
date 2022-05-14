function laske_mask(x,y) {
    return (BigInt(1) << ((BigInt(x) - BigInt(1)) * BigInt(7) + BigInt(y) - BigInt(1)));
}

function symboliKohdassa(x,y, bitboard){
    mask = laske_mask(x,y);
    if ((mask & bitboard[0]) != 0) return "white";
    if ((mask & bitboard[1]) != 0) return "black";
    return "tyhja";
}

function make_move(x,y, bitboard) {
    return BigInt(bitboard | laske_mask(x,y));
}
    
function kaannaVasemmalle(x,y, board) {
    var kopio = board;
    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            var bitti = (laske_mask(BigInt(i)+x, BigInt(j)+y) & board);
            if (bitti != 0) {
                kopio |= laske_mask(-BigInt(j)+x, BigInt(i)+y);
            } else {
                kopio &= (~laske_mask(-BigInt(j)+x, BigInt(i)+y));
            }
        }
    }
    return kopio;
}
    
function kaannaOikealle(x,y, board) {
    var kopio = board;
    for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
            var bitti = (laske_mask(BigInt(i)+x, BigInt(j)+y) & board);
            if (bitti != 0) {
                kopio |= laske_mask(BigInt(j)+x, -BigInt(i)+y);
            } else {
                kopio &= (~laske_mask(BigInt(j)+x, -BigInt(i)+y));
            }
        }
    }
    return kopio;
}

function teeKaanto(kaanto, board) {
    if (kaanto == "ylavasen-vasen") {
        return kaannaVasemmalle(BigInt(2),BigInt(2),board);
    } else if (kaanto == "ylavasen-oikea") {
        return kaannaOikealle(BigInt(2),BigInt(2),board);
    } else if (kaanto == "ylaoikea-vasen") {
        return kaannaVasemmalle(BigInt(2),BigInt(5),board);
    } else if (kaanto == "ylaoikea-oikea") {
        return kaannaOikealle(BigInt(2),BigInt(5),board);
    } else if (kaanto == "alavasen-vasen") {
        return kaannaVasemmalle(BigInt(5),BigInt(2),board);
    } else if (kaanto == "alavasen-oikea") {
        return kaannaOikealle(BigInt(5),BigInt(2),board);
    } else if (kaanto == "alaoikea-vasen") {
        return kaannaVasemmalle(BigInt(5),BigInt(5),board);
    } else if (kaanto == "alaoikea-oikea") {
        return kaannaOikealle(BigInt(5),BigInt(5),board);
    }
    return "invalid kaanto";
}

    
function make_whole_move(x, y, board, vuoro) {
    if (vuoro == 1) {
        ans = [board[0], make_move(x,y, board[vuoro])];
        return ans;
    } else {
        ans = [make_move(x,y, board[vuoro]), board[1]]
        return ans;
    }
}
    
function count_set_bits(x) {
    var mask = BigInt(1);
    var ans = 0;
    for (var i = 0; i < 64; i++) {
        if ((mask & x) != 0) ans++;
        mask = mask << BigInt(1);
    }
    return ans;
}    
    
function deduct_turn(board) {
    if (count_set_bits(board[0]) == count_set_bits(board[1])) return 0;
    return 1;
}


function make_whole_turn(kaanto, board) {
    var ans = [teeKaanto(kaanto,board[0]), teeKaanto(kaanto, board[1])];
    return ans;
}

function tee_siirto_ja_kaanto(x, y, kaanto, board) {
    uusboard = make_whole_move(x,y,board, deduct_turn(board));
    ans = [teeKaanto(kaanto,uusboard[0]), teeKaanto(kaanto, uusboard[1])]
    return ans;
}


function convert_to_bitboard(board) {
    bitboard = [BigInt(0), BigInt(0)];
    for (var i = 0; i < 6; i++) {
        for (var j = 0; j < 6; j++) {
            if (board[i][j] == "white") {
                bitboard[0] = make_move(i+1,j+1,bitboard[0]);
            } else if (board[i][j] == "black") {
                bitboard[1] = make_move(i+1,j+1,bitboard[1]);
            }
        }
    }
    return bitboard;
}

var kaannot = ["ylavasen-vasen", "ylavasen-oikea", "ylaoikea-vasen", "ylaoikea-oikea", "alavasen-vasen", "alavasen-oikea", "alaoikea-vasen", "alaoikea-oikea"];

function getMoveDescription(board, white, black) {
    for (var k = 0; k < 8; k++) {
        var kaannetty = make_whole_turn(kaannot[k], board);
        var diff = count_set_bits(kaannetty[0] ^ white) + count_set_bits(kaannetty[1] ^ black);
        if (diff > 1) continue;
        for (var i = 1; i <= 6; i++) {
            for (var j = 1; j <= 6; j++) {
                var result = tee_siirto_ja_kaanto(i,j,kaannot[k],board);
                if (result[0] == white && result[1] == black) {
                    var merkki = String.fromCharCode('a'.charCodeAt() + j - 1);
                    var numero = 7-i;
                    return merkki + numero + " " + kaannot[k];
                }
            }
        }
    }
    return "virhe" + "(" + board[0] + "," + board[1] + ") (" + white + "," + black + ")";
}

function getMoveKaanto(board, white, black) {
    for (var k = 0; k < 8; k++) {
        var kaannetty = make_whole_turn(kaannot[k], board);
        var diff = count_set_bits(kaannetty[0] ^ white) + count_set_bits(kaannetty[1] ^ black);
        if (diff > 1) continue;
        for (var i = 1; i <= 6; i++) {
            for (var j = 1; j <= 6; j++) {
                var result = tee_siirto_ja_kaanto(i,j,kaannot[k],board);
                if (result[0] == white && result[1] == black) {
                    return kaannot[k];
                }
            }
        }
    }
    return "virhe" + "(" + board[0] + "," + board[1] + ") (" + white + "," + black + ")";
}




