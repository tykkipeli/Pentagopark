
def laske_mask(x,y):
    return 1 << ((x - 1) * 7 + y - 1)

def make_move(x,y, board):
    #print(x,y,board, laske_mask(x,y))
    return board | laske_mask(x,y)

def loytyy_viiden_suora(x):
    if ((x << 1) & (x >> 1) & (x << 2) & (x >> 2) & x) != 0:
        return True
    if ((x << 7) & (x >> 7) & (x << 14) & (x >> 14) & x) != 0:
        return True
    if ((x << 6) & (x >> 6) & (x << 12) & (x >> 12) & x) != 0:
        return True
    if ((x << 8) & (x >> 8) & (x << 16) & (x >> 16) & x) != 0:
        return True
    return False

def kaannaVasemmalle(x, y, board):
    kopio = board
    for i in range(-1,2):
        for j in range(-1,2):
            bitti = (laske_mask(i+x, j+y) & board)
            if bitti != 0:
                kopio |= laske_mask(-j+x, i+y)
            else:
                kopio &= (~laske_mask(-j+x, i+y))
    return kopio

def kaannaOikealle(x, y, board):
    kopio = board
    for i in range(-1,2):
        for j in range(-1,2):
            bitti = (laske_mask(i+x, j+y) & board)
            if bitti != 0:
                kopio |= laske_mask(j+x, -i+y)
            else:
                kopio &= (~laske_mask(j+x, -i+y))
    return kopio

def teeKaanto(kaanto, board):
    if kaanto == "ylavasen-vasen":
        return kaannaVasemmalle(2,2,board)
    elif kaanto == "ylavasen-oikea":
        return kaannaOikealle(2,2,board)
    elif kaanto == "ylaoikea-vasen":
        return kaannaVasemmalle(2,5, board)
    elif kaanto == "ylaoikea-oikea":
        return kaannaOikealle(2,5, board)
    elif kaanto == "alavasen-vasen":
        return kaannaVasemmalle(5,2, board)
    elif kaanto == "alavasen-oikea":
        return kaannaOikealle(5,2, board)
    elif kaanto == "alaoikea-vasen":
        return kaannaVasemmalle(5,5, board)
    elif kaanto == "alaoikea-oikea":
        return kaannaOikealle(5,5, board)
    return "invalid kaanto"
       

# 0 is white
def symboliKohdassa(x,y, board):
    mask = laske_mask(x,y)
    if mask & board[0] != 0:
        return "0"
    if mask & board[1] != 0:
        return "X"
    return " "

def tulosta(board):
    for i in range(1,7):
        for j in range(1,7):
            print(symboliKohdassa(i,j,board), end ="")
            print("|", end="")
        print("")
    print("")
    
def make_whole_move(x, y, board, vuoro):
    if vuoro == 1:
        return (board[0], make_move(x,y, board[vuoro]))
    else:
        return (make_move(x,y, board[vuoro]), board[1])
    
# 0 = valkoisen vuoro    
def deduct_turn(board):
    if bin(board[0]).count('1') == bin(board[1]).count('1'):
        return 0
    return 1
    
def tee_siirto_ja_kaanto(x,y,kaanto, board):
    #print(deduct_turn(board))
    #print(board)
    board = make_whole_move(x,y,board, deduct_turn(board))
    #print(board)
    return (teeKaanto(kaanto,board[0]), teeKaanto(kaanto, board[1]))

def get_result(board):
    if loytyy_viiden_suora(board[0]) and loytyy_viiden_suora(board[1]):
        return "tasapeli"
    if loytyy_viiden_suora(board[0]):
        return "valkoisen voitto"
    if loytyy_viiden_suora(board[1]):
        return "mustan voitto"
    if bin(board[0]).count('1') + bin(board[1]).count('1') == 36:
        return "tasapeli"
    return "kesken"
    
def testailu():
    board = (0,0)
    vuoro = 0
    while True:
        x = int(input("Anna x\n"))
        y = int(input("Anna y \n"))
        print("Vuoro : " + str(vuoro))
        print(bin(board[vuoro]), bin(make_move(x,y, board[vuoro])))
        if vuoro == 1:
            board = (board[0], make_move(x,y, board[vuoro]))
        else:
            board = (make_move(x,y, board[vuoro]), board[1])
        vuoro = 1 - vuoro
        tulosta(board)
        print(bin(board[0]), bin(board[1]))

#testailu()

tulosta((65536,0))
tulosta((4,1))
tulosta((4,0))

