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
