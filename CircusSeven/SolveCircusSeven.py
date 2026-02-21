from typing import Tuple, List

# Example : Nanjing Science and Technology Museum
# TILEA = ([1,2,3,4,5,6],"A")
# TILEB = ([1,4,3,6,5,2],"B")
# TILEC = ([1,4,6,2,3,5],"C")
# TILED = ([1,6,2,4,5,3],"D")
# TILEF = ([1,6,5,3,2,4],"F")
# TILEG = ([1,6,5,4,3,2],"G")
# TILEH = ([1,6,4,3,5,2],"H")
# TilesPile = [TILEA,TILEB,TILEC,TILED,TILEF,TILEG,TILEH]


# example: Drive Ya Nuts
#  https://www.jaapsch.net/puzzles/circus.htm
TilesPile = [
    (list(map(int, "123456")),"A"),
    (list(map(int, "143652")),"B"),
    (list(map(int, "146235")),"C"),
    (list(map(int, "162453")),"D"),
    (list(map(int, "164253")),"E"),
    (list(map(int, "165324")),"F"),
    (list(map(int, "165432")),"G")
]



TILEHEX = 6

def findCircus(answer:List[Tuple[int, Tuple[List[int],str]]], TilesPile:List[Tuple[List[int],str]]) ->None:
    for tile in TilesPile:
        lastHex = answer[-1][0]
        lastTile = answer[-1][1]
        lastIndex = lastTile[0].index(lastHex)

        nextTile = tile
        nextHex = lastTile[0][(lastIndex+2)% TILEHEX]
        answer.append( (nextHex, nextTile))
        if isAnswerIllegal(answer) :
            answer.pop()
            continue
        else :
            if (len(answer)<6):
                TilesAvailable = TilesPile.copy()
                TilesAvailable.remove(tile)
                findCircus(answer,TilesAvailable)
            else :
                # check circus with last tile
                TilesAvailable = TilesPile.copy()
                TilesAvailable.remove(tile)
                if isMidTileIllegal(answer, TilesAvailable[0]):
                    pass
            answer.pop()
            continue

def printAnswer(answer:List[Tuple[int, Tuple[List[int],str]]]) -> None:
    ans_str = ""
    for ele in answer :
        hex = ele[0]
        tile = ele[1]
        ans_str += "%d%s" % (hex,tile[1])
    print(ans_str)

def isAnswerIllegal(answer:List[Tuple[int, Tuple[List[int],str]]]) -> bool:
    lookup = set([])
    for ele in answer :
        tile = ele[1]
        hex = ele[0]
        index = tile[0].index(hex)
        hex_in_mid = tile[0][(index+1)% TILEHEX]
        if hex_in_mid in lookup :
            # print("X:",end='')
            # printAnswer(answer)
            return True
        else :
            lookup.add(hex_in_mid)

    if (len(answer)>=6):
        # check circus
        lastTile = answer[-1][1]
        lastHex = answer[-1][0]
        lastIndex = lastTile[0].index(lastHex)
        lastPairHex = lastTile[0][(lastIndex+2)% TILEHEX]
        
        firstHex =  answer[0][0]
        if lastPairHex != firstHex :
            # print("X:",end='')
            # printAnswer(answer)
            return True
        else :
            print("O:",end='')
            printAnswer(answer)
            return False
    return False

def isMidTileIllegal(answer:List[Tuple[int, Tuple[List[int],str]]], midTile:Tuple[List[int],str]) -> bool:
    
    firstTile = answer[0][1]
    firstHex = answer[0][0]
    firstIndex = firstTile[0].index(firstHex)
    first_hex_in_mid = firstTile[0][(firstIndex+1)% TILEHEX]
    
    index_mid = midTile[0].index(first_hex_in_mid)

    for ele in answer[1:-1] :
        tile = ele[1]
        hex = ele[0]
        index = tile[0].index(hex)
        hex_in_mid = tile[0][(index+1)% TILEHEX]
        
        index_mid = index_mid - 1
        if hex_in_mid != midTile[0][(index_mid)% TILEHEX] :
            # print("X:",end='')
            # printAnswer(answer)
            return True
    
    print("Y:",end='')
    printAnswer(answer)
    return False
        


for hex in [1,2,3,4,5,6] :
    Answer= []
    Answer.append( (hex, TilesPile[0]))
    TilesAvailable = TilesPile.copy()
    TilesAvailable.remove(TilesPile[0])
    findCircus(Answer,TilesAvailable)

for hex in [1,2,3,4,5,6] :
    Answer= []
    Answer.append( (hex, TilesPile[3]))
    TilesAvailable = TilesPile.copy()
    TilesAvailable.remove(TilesPile[3])
    findCircus(Answer,TilesAvailable)



