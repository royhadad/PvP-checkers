class Board
{
    /*pieces:
        empty square = "E"
        black piece = "BP"
        black king = "BK"
        red piece = "RP"
        red king = "RK"
    */

    /*
    position format for constructor:
    if position is not defind, goes for regular board creation

    `E,BP,E,BP,E,BP,E,BP|
    E,BP,E,BP,E,BP,E,BP|
    BP,E,BP,E,BP,E,BP,E|
    E,BP,E,BP,E,BP,E,BP|
    E,BP,E,BP,E,BP,E,BP|
    E,RP,E,RP,E,RP,E,RP|
    RP,E,RP,E,RP,E,RP,E|
    E,RP,E,RP,E,RP,E,RP`
    */

    /*
    a friend is a piece that is of the color that is making the move
    an enemy is a piece that is of the color that is NOT making the move
    on the current turn
    */
    constructor(position)
    {
        this.isBlackTurn = true;
        this.pieceCapturingInARow = null;
        this.numberOfMovesWithoutProgress = 0;
        this.rows = [];
        if (!position)
        {
            for (let row = 0; row < 8; row++)
            {
                this.rows[row] = [];
                for (let column = 0; column < 8; column++)
                {
                    if (Board.prototype.isDarkSquare(row, column))
                    {
                        if (row <= 2)
                        {
                            this.rows[row][column] = "RP";
                        }
                        else if (row >= 5)
                        {
                            this.rows[row][column] = "BP";
                        }
                        else
                        {
                            this.rows[row][column] = "E";
                        }
                    }
                    else
                    {
                        this.rows[row][column] = "E";
                    }
                }
            }
        }
        else
        {
            let rows = position.split("|");
            for (let row = 0; row < 8; row++)
            {
                this.rows[row] = rows[row].split(",");
            }
        }
    }
    makeMove(move)
    {
        let originalTurn = this.isBlackTurn;
        let response = { isLegalMove: false, isGameOver: false, result: null };
        if (this.isLegalMove(move))
        {
            response.isLegalMove = true;
            this.actuallyMakeTheMove(move);
            let gameResult = this.getGameResult();
            if (gameResult != "not over")
            {
                response.isGameOver = true;
                response.result = gameResult;
                board.isBlackTurn = originalTurn;
            }
        }
        return response;
    }
    getGameResult()
    {
        let friends = this.getAllFriends();
        let enemies = this.getAllEnemies();
        if (enemies.length == 0)
            return this.isBlackTurn ? "B" : "R";
        if (friends.length == 0)
            return this.isBlackTurn ? "R" : "B";
        if (!this.doesOneOfThePiecesHaveALegalMove(friends))
            return this.isBlackTurn ? "R" : "B";
        if (this.numberOfMovesWithoutProgress == 31)
            return "D";
        return "not over";
    }
    doesOneOfThePiecesHaveALegalMove(pieces)
    {
        for (let piece of pieces)
        {
            if (this.getPieceCapturingMoves(piece.row, piece.column).length != 0 || this.getPieceNonCapturingMoves(piece.row, piece.column).length != 0)
                return true;
        }
        return false;
    }
    actuallyMakeTheMove(move)
    {
        let originalTurn = this.isBlackTurn;
        if (!this.isKing(move.startRow, move.startColumn))
            this.numberOfMovesWithoutProgress = 0;
        board.rows[move.destinationRow][move.destinationColumn] = board.rows[move.startRow][move.startColumn];
        board.rows[move.startRow][move.startColumn] = "E";
        if (move.isCapturingMove())
        {
            this.numberOfMovesWithoutProgress = 0;
            let capturedPieceSquare = move.getCapturedPieceSquare();
            board.rows[capturedPieceSquare.row][capturedPieceSquare.column] = "E";
            if (this.getPieceCapturingMoves(move.destinationRow, move.destinationColumn).length == 0)
            {
                this.isBlackTurn = !this.isBlackTurn;
                this.pieceCapturingInARow = null;
            }
            else
            {
                this.pieceCapturingInARow = new Square(move.destinationRow, move.destinationColumn);
            }
        }
        else
        {
            this.isBlackTurn = !this.isBlackTurn;
        }
        if (this.promoteToKings()) //returns wheter or not a king was promoted
        {
            this.isBlackTurn = !originalTurn;
            this.pieceCapturingInARow = null;
        }
        this.numberOfMovesWithoutProgress++;
    }
    isLegalMove(move)
    {
        if (move.isMoveInMovesArray(this.getLegalMoves()))
            return true;
        else
            return false;
    }
    getLegalMoves()
    {
        let legalMoves = [];
        let pieceMoves;
        let piecesThatCanCapture = this.getPiecesThatCanCapture();
        let piecesThatAreFriends = this.getAllFriends();
        if (this.pieceCapturingInARow)
        {
            pieceMoves = this.getPieceCapturingMoves(this.pieceCapturingInARow.row, this.pieceCapturingInARow.column);
            for (let move of pieceMoves)
                legalMoves.push(move);
            return legalMoves;
        }
        else if (piecesThatCanCapture.length > 0)
        {
            for (let piece of piecesThatCanCapture)
            {
                pieceMoves = this.getPieceCapturingMoves(piece.row, piece.column);
                for (let move of pieceMoves)
                    legalMoves.push(move);
            }
            return legalMoves;
        }
        else
        {
            for (let piece of piecesThatAreFriends)
            {
                pieceMoves = this.getPieceNonCapturingMoves(piece.row, piece.column);
                for (let move of pieceMoves)
                    legalMoves.push(move);
            }
            return legalMoves;
        }
    }
    getPieceCapturingMoves(row, column)
    {
        let moves = [];
        let rowForward;//equals to plus or minus 1, depending on what color is making the current move
        if (this.isRed(row, column))
            rowForward = 1;
        else
            rowForward = -1;

        if (this.isEnemy(row + rowForward, column + 1) && this.isEmpty(row + rowForward * 2, column + 2))
        {
            moves.push(new Move(row, column, row + rowForward * 2, column + 2));
        }
        if (this.isEnemy(row + rowForward, column - 1) && this.isEmpty(row + rowForward * 2, column - 2))
        {
            moves.push(new Move(row, column, row + rowForward * 2, column - 2));
        }
        if (this.isKing(row, column))
        {
            if (this.isEnemy(row - rowForward, column + 1) && this.isEmpty(row - rowForward * 2, column + 2))
            {
                moves.push(new Move(row, column, row - rowForward * 2, column + 2));
            }
            if (this.isEnemy(row - rowForward, column - 1) && this.isEmpty(row - rowForward * 2, column - 2))
            {
                moves.push(new Move(row, column, row - rowForward * 2, column - 2));
            }
        }
        return moves;
    }
    getPieceNonCapturingMoves(row, column)
    {
        let moves = [];
        let rowForward;//equals to plus or minus 1, depending on what color is making the current move
        if (this.isRed(row, column))
            rowForward = 1;
        else
            rowForward = -1;

        if (this.isEmpty(row + rowForward, column + 1))
        {
            moves.push(new Move(row, column, row + rowForward, column + 1));
        }
        if (this.isEmpty(row + rowForward, column - 1))
        {
            moves.push(new Move(row, column, row + rowForward, column - 1));
        }
        if (this.isKing(row, column))
        {
            if (this.isEmpty(row - rowForward, column + 1))
            {
                moves.push(new Move(row, column, row - rowForward, column + 1));
            }
            if (this.isEmpty(row - rowForward, column - 1))
            {
                moves.push(new Move(row, column, row - rowForward, column - 1));
            }
        }
        return moves;
    }
    getPiecesThatCanCapture()
    {
        let piecesThatCanCapture = [];
        let friends = this.getAllFriends();
        for (let friend of friends)
        {
            let rowForward;//equals to plus or minus 1, depending on what color is making the current move
            if (this.isRed(friend.row, friend.column))
                rowForward = 1;
            else
                rowForward = -1;

            if (this.isEnemy(friend.row + rowForward, friend.column + 1) && this.isEmpty(friend.row + rowForward * 2, friend.column + 2))
            {
                piecesThatCanCapture.push(friend);
            }
            else if (this.isEnemy(friend.row + rowForward, friend.column - 1) && this.isEmpty(friend.row + rowForward * 2, friend.column - 2))
            {
                piecesThatCanCapture.push(friend);
            }
            else if (this.isKing(friend.row, friend.column))
            {
                if (this.isEnemy(friend.row - rowForward, friend.column + 1) && this.isEmpty(friend.row - rowForward * 2, friend.column + 2))
                {
                    piecesThatCanCapture.push(friend);
                }
                else if (this.isEnemy(friend.row - rowForward, friend.column - 1) && this.isEmpty(friend.row - rowForward * 2, friend.column - 2))
                {
                    piecesThatCanCapture.push(friend);
                }
            }
        }
        return piecesThatCanCapture;
    }
    promoteToKings()
    {
        for (let column = 0; column < 8; column++)
        {
            if (this.getPiece(0, column) == "BP")
            {
                this.rows[0][column] = "BK";
                return true;
            }
            if (this.getPiece(7, column) == "RP")
            {
                this.rows[7][column] = "RK";
                return true;
            }
        }
        return false;
    }
    isSquareInBounds(row, column)
    {
        if (row >= 0 && row < 8 && column >= 0 && row < 8)
            return true;
        else
            return false;
    }
    getAllFriends()
    {
        let friends = [];
        for (let row = 0; row < 8; row++)
        {
            for (let column = 0; column < 8; column++)
            {
                if (this.isFriend(row, column))
                    friends.push(new Square(row, column));
            }
        }
        return friends;
    }
    getAllEnemies()
    {
        let enemies = [];
        for (let row = 0; row < 8; row++)
        {
            for (let column = 0; column < 8; column++)
            {
                if (this.isEnemy(row, column))
                    enemies.push(new Square(row, column));
            }
        }
        return enemies;
    }
    getPiece(row, column)
    {
        return this.rows[row][column];
    }
    isKing(row, column)
    {
        if (this.getPiece(row, column) == "BK" || this.getPiece(row, column) == "RK")
            return true;
    }
    isEmpty(row, column)
    {
        if (this.isSquareInBounds(row, column) && this.rows[row][column] == "E")
            return true;
        else
            return false;
    }
    isRed(row, column)
    {
        if (this.getPiece(row, column) == "RP" || this.getPiece(row, column) == "RK")
            return true;
        else
            return false;
    }
    isBlack(row, column)
    {
        if (this.getPiece(row, column) == "BP" || this.getPiece(row, column) == "BK")
            return true;
        else
            return false;
    }
    isEnemy(row, column)
    {
        if (!this.isSquareInBounds(row, column))
            return false;
        if (this.isBlackTurn)
            return this.isRed(row, column);
        else
            return this.isBlack(row, column);
    }
    isFriend(row, column)
    {
        if (this.isBlackTurn)
            return this.isBlack(row, column);
        else
            return this.isRed(row, column);
    }
}
Board.prototype.getImageUrlByName = (name) =>
{
    switch (name)
    {
        case "E": return null; break;
        case "BP": return "./storage/blackPiece.png"; break;
        case "RP": return "./storage/redPiece.png"; break;
        case "BK": return "./storage/blackKing.png"; break;
        case "RK": return "./storage/redKing.png"; break;
        default: throw new Error("invalid piece name, couldnt get url"); break;
    }
}
Board.prototype.isDarkSquare = (row, column) =>
{
    if ((row + column) % 2 == 1)
        return true;
    else
        return false;
}

class Move
{
    constructor(startRow, startColumn, destinationRow, destinationColumn)
    {
        if (startRow === undefined || startColumn === undefined || destinationRow === undefined || destinationColumn === undefined)
            throw new Error("rows or columns not configured for the new Move object");
        else
        {
            this.startRow = startRow;
            this.startColumn = startColumn;
            this.destinationRow = destinationRow;
            this.destinationColumn = destinationColumn;
        }
    }
    isMoveInMovesArray(movesArray)
    {
        for (let move of movesArray)
        {
            if (this.equals(move))
                return true;
        }
        return false;
    }
    equals(other)
    {
        if (this.startRow == other.startRow &&
            this.startColumn == other.startColumn &&
            this.destinationRow == other.destinationRow &&
            this.destinationColumn == other.destinationColumn)
        {
            return true;
        }
        else
            return false;
    }
    isCapturingMove()
    {
        if (Math.abs(this.startRow - this.destinationRow) == 2)
            return true;
        else
            return false;
    }
    getCapturedPieceSquare()
    {
        if (!this.isCapturingMove())
            return null;
        let row = (this.startRow + this.destinationRow) / 2;
        let column = (this.startColumn + this.destinationColumn) / 2;
        return new Square(row, column);
    }
}
class Square
{
    constructor(row, column)
    {
        if (row === undefined || column === undefined)
            throw new Error("row or column not configured for the new Square object");
        else
        {
            this.row = row;
            this.column = column;
        }
    }
    isDarkSquare()
    {
        if ((this.row + this.column) % 2 == 1)
            return true;
        else
            return false;
    }
}

//#region global variables
let board;


//#endregion

//#region drag functions
let movingPiece;
let movingPieceOriginalParent;
function moved(event)
{
    if (event.buttons != 1)
    {
        window.removeEventListener("mousemove", moved);
        window.removeEventListener("mouseup", moved);
        window.removeEventListener("mousedown", moved);
        window.removeEventListener("blur", moved);
        drop();
    }
    else
    {
        updateDraggedPieceLocation();
    }
}
function drop()
{
    let dropSquare = getMovingPieceSquare();
    if (dropSquare)
    {
        let destinationCords = dropSquare.id.split(",");
        let startCords = movingPieceOriginalParent.id.split(",");
        let destinationRow = parseInt(destinationCords[0]);
        let destinationColumn = parseInt(destinationCords[1]);
        let startRow = parseInt(startCords[0]);
        let startColumn = parseInt(startCords[1]);
        let move = new Move(startRow, startColumn, destinationRow, destinationColumn);
        transferMovingPieceBackToSquare(movingPieceOriginalParent);
        tryToMakeMoveAndUpdateBoard(move);
    }
    else
    {
        transferMovingPieceBackToSquare(movingPieceOriginalParent);
    }
}
//returns null if no square
function getMovingPieceSquare()
{
    let boardDiv = document.getElementById("board");
    let square;
    for (let row = 0; row < 8; row++)
    {
        for (let column = 0; column < 8; column++)
        {
            square = document.getElementById(row + "," + column);
            if (isPieceInsideOfSquare(movingPiece, square))
                return square;
        }
    }
    return null;
}
function isPieceInsideOfSquare(piece, square)
{
    let pieceX = piece.getBoundingClientRect().left;
    let pieceY = piece.getBoundingClientRect().top;
    let squareX = square.getBoundingClientRect().left;
    let squareY = square.getBoundingClientRect().top;
    let pieceMiddleX = pieceX + (piece.clientWidth / 2);
    let pieceMiddleY = pieceY + (piece.clientHeight / 2);
    return isPointInsideOfRectangle(pieceMiddleX, pieceMiddleY, squareX, squareY, square.clientWidth, square.clientHeight);
}
function isPointInsideOfRectangle(pointX, pointY, recX, recY, recWidth, recHeight)
{
    if (pointX > recX && pointX < (recX + recWidth) && pointY > recY && pointY < (recY + recHeight))   
    {
        return true;
    }
    else
        return false;
}
function transferMovingPieceToDocument()
{
    movingPiece.parentNode.removeChild(movingPiece);
    document.getElementsByTagName("body")[0].appendChild(movingPiece);
    movingPiece.style.zIndex = 5;
    movingPiece.style.width = movingPieceOriginalParent.clientWidth * 0.85 + "px";
    movingPiece.style.height = movingPieceOriginalParent.clientHeight * 0.85 + "px";
    movingPiece.style.cursor = "grabbing";
}
function transferMovingPieceBackToSquare(square)
{
    document.getElementsByTagName("body")[0].removeChild(movingPiece);
    square.appendChild(movingPiece);

    movingPiece.zIndex = 2;
    movingPiece.style.width = 85 + "%";
    movingPiece.style.height = 85 + "%";
    movingPiece.style.top = 7.5 + "%";
    movingPiece.style.left = 7.5 + "%";
    movingPiece.style.cursor = "grab";
}
function updateDraggedPieceLocation()
{
    //keeping the piece in the bounds of the window
    movingPiece.style.left = Math.max(0, Math.min((window.innerWidth - movingPiece.clientWidth), (event.clientX - (movingPiece.clientWidth / 2)))) + "px";
    movingPiece.style.top = Math.max(0, Math.min((window.innerHeight - movingPiece.clientHeight), (event.clientY - (movingPiece.clientHeight / 2)))) + "px";
}

//#endregion drag functions

function tryToMakeMoveAndUpdateBoard(move)
{
    let response = board.makeMove(move);
    if (response.isLegalMove)
    {
        loadPosition(board);
        if (response.isGameOver)
        {
            let callback = loadStartPosition;
            switch (response.result)
            {
                case "R": delayedAlert("Red won!", callback); break;
                case "B": delayedAlert("Black won!", callback); break;
                case "D": delayedAlert("Draw!", callback); break;
                default: delayedAlert("Error! result not found", callback); break;
            }
        }
    }
    else
    {

    }
}
function delayedAlert(message, callback)
{
    setTimeout(() =>
    {
        alert(message);
        if (callback)
            callback();
    }, 0);
}
function loadPageLayout()
{
    loadKingsImagesMomentery();//added
    let boardDiv = document.getElementById("board");
    let isDarkSquare = false;
    for (let row = 0; row < 8; row++)
    {
        for (let column = 0; column < 8; column++)
        {
            let squareNode = document.createElement("div");
            let imageNode = document.createElement("img");
            imageNode.src = (isDarkSquare ? "./storage/darkSquare.png" : "./storage/lightSquare.png");
            isDarkSquare = !isDarkSquare;
            imageNode.className = "squareImage";
            squareNode.className = "square";

            //drop stuff

            //end drop stuff

            squareNode.id = `${row},${column}`;
            squareNode.appendChild(imageNode);
            boardDiv.appendChild(squareNode);
        }
        let lineBreakNode = document.createElement("br");
        lineBreakNode.className = "boardLineBreak";
        boardDiv.appendChild(lineBreakNode);
        isDarkSquare = !isDarkSquare;
    }
    loadStartPosition();
}
function loadKingsImagesMomentery()
{
    let body = document.getElementsByTagName("body");
    let img1 = document.createElement("img");
    img1.src = "./storage/blackKing.png";
    body.appendChild(img1);
    body.removeChild(img1);
    img1.src = "./storage/redKing.png";
    body.appendChild(img1);
    body.removeChild(img1);
}
function loadPosition(board)
{
    let square;
    //clearing the board
    for (let row = 0; row < 8; row++)
    {
        for (let column = 0; column < 8; column++)
        {
            square = document.getElementById(row + "," + column);
            let squareChildren = Array.from(square.children);
            for (let child of squareChildren)
            {
                if (child.className != "squareImage")
                    square.removeChild(child);
            }
        }
    }

    //adding the new position to the board
    let imageUrl;
    let pieceImage;
    for (let row = 0; row < 8; row++)
    {
        for (let column = 0; column < 8; column++)
        {
            imageUrl = Board.prototype.getImageUrlByName(board.rows[row][column])
            if (imageUrl)
            {
                pieceImage = document.createElement("img");
                pieceImage.setAttribute("src", imageUrl);
                pieceImage.className = "pieceImage";
                pieceImage.id = row + "|" + column;

                //drag stuff
                pieceImage.addEventListener("mousedown", event =>
                {
                    event.stopPropagation();
                    if (event.button === 0 && event.buttons === 1)
                    {
                        movingPieceOriginalParent = event.target.parentNode;
                        movingPiece = event.target;

                        transferMovingPieceToDocument(movingPiece);
                        updateDraggedPieceLocation();
                        window.addEventListener("mousemove", moved);
                        window.addEventListener("mouseup", moved);
                        window.addEventListener("mousedown", moved);
                        window.addEventListener("blur", moved);
                        event.preventDefault(); // Prevent selection
                    }
                });
                //end drag stuff

                square = document.getElementById(row + "," + column);
                square.appendChild(pieceImage);
            }
        }
    }
    displayWhosMoveItIs(board);
}
function displayWhosMoveItIs(board)
{
    if (board.isBlackTurn)
    {
        document.querySelector("#black").style.backgroundColor = "black";
        document.querySelector("#red").style.backgroundColor = "white";

    }
    else
    {
        document.querySelector("#black").style.backgroundColor = "white";
        document.querySelector("#red").style.backgroundColor = "red";
    }
}
function loadStartPosition()
{
    let boardString = `
    E,E,E,E,E,E,E,E|
    BP,E,E,E,BP,E,E,E|
    E,E,E,E,E,E,E,E|
    E,E,E,E,E,E,E,E|
    E,E,E,E,E,E,E,E|
    E,E,E,E,RP,E,E,E|
    E,E,E,E,E,E,E,E|
    E,E,E,E,E,E,E,E`
        .replace(/\s/g, '');
    //board = new Board(boardString);
    board = new Board();
    loadPosition(board);
}
function restartGame()
{
    loadStartPosition();
}