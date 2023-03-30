class PositionMemory {
    constructor(game_mode, move_count, positions) {
        this.game_mode = game_mode;
        this.main_positions = [];
        this.other_positions = [];
        this.main_ind = 0;
        this.main_tail = move_count-1;
        this.other_ind = -1;
        this.other_tail = 0;
        for (var i = 0; i < 37; i++) {
            var temp = [BigInt(0), BigInt(0)];
            this.main_positions.push(temp);
            temp = [BigInt(0), BigInt(0)];
            this.other_positions.push(temp);
        }
    }
    
    make_move(white, black) {
        this.other_ind++;
        this.other_positions[this.other_ind][0] = BigInt(white);
        this.other_positions[this.other_ind][1] = BigInt(black);
        this.other_tail = this.other_ind;
    }
    
    prev() {
        if (this.other_ind >= 0) {
            this.other_ind--;
        } else {
            this.main_ind--;
        }
    }
    
    next_move(white, black) {
        if (this.other_ind == -1) {
            this.main_ind++;
            this.main_positions[this.main_ind][0] = BigInt(white);
            this.main_positions[this.main_ind][1] = BigInt(black);
        } else {
            this.other_ind++;
        }
    }
    
    has_next() {
        if (this.other_ind >= 0) {
            return this.other_ind < this.other_tail;
        } else {
            return this.main_ind < this.main_tail;
        }
    }
    
    has_prev() {
        return this.main_ind > 0 || this.other_ind > -1;
    }
    
    get_pos() {
        if (this.other_ind >= 0) {
            return this.other_positions[this.other_ind];
        }
        return this.main_positions[this.main_ind];
    }
    
    add_game_positions(positions) {
        console.log(positions);
        this.main_positions = positions;
    }
}
