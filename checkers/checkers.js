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
    constructor(position)
    {
        this.isBlackTurn = true;
        this.pieceCapturingInARow = null;
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
            rows = position.split("|");
            for (let row = 0; row < 8; row++)
            {
                this.rows[row] = rows[row].split(",");
            }
        }
    }
    //TODO ALL
    //implementing the rules!
    makeMove(move)
    {
        if (this.isLegalMove(move))
        {
            board.rows[move.destinationRow][move.destinationColumn] = board.rows[move.startRow][move.startColumn];
            board.rows[move.startRow][move.startColumn] = "E";
            return { isLegalMove: true, isGameOver: false, result: null };
        }
        else
        {
            return { isLegalMove: false, isGameOver: false, result: null };
        }
    }
    isLegalMove(move)
    {
        return true;//just to make all moves legal
        if(move.isMoveInMovesArray(this.getLegalMoves()))
            return true;
        else
            return false;
    }
    getLegalMoves()
    {
        let legalMoves = [];
        let piecesThatCanCapture = this.getPiecesThatCanCapture();
        if (this.pieceCapturingInARow)
        {
            legalMoves.push(this.getPieceLegalMoves(this.pieceCapturingInARow.row, this.pieceCapturingInARow.column));
            return legalMoves;
        }
        else if (piecesThatCanCapture.length > 0)
        {
            for(let piece of piecesThatCanCapture)
            {
                legalMoves.push(this.getPieceLegalMoves(piece.row, piece.column));
            }
            return legalMoves;
        }
        else
        {

        }
    }
    getPieceLegalMoves(row, column)
    {
        if (this.getPiece(row, column) == "B")
        {

        }

    }
    getPiecesThatCanCapture()
    {

    }
    getAllPieces()
    {

    }
    getPiece(row, column)
    {
        return this.rows[row][column];
    }
    isEmpty(row, column)
    {
        if (this.rows[row][column] == "E")
            return true;
        else
            return false;
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
        for(let move in movesArray)
        {
            if(this.equals(move))
                return true;
        }
        return false;
    }
    equals(otherMove)
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
}
//#region the class Square is deprecated!
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
//#endregion

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
        let destinationRow = destinationCords[0];
        let destinationColumn = destinationCords[1];
        let startRow = startCords[0];
        let startColumn = startCords[1];
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
        if (response.isGameOver)
        {
            switch (response.result)
            {
                case "R": alert("Red won!"); break;
                case "B": alert("Black won!"); break;
                case "D": alert("Draw!"); break;
                default: alert("Error! result not found"); break;
            }
            loadStartPosition();
        }
        else
        {
            loadPosition(board);
        }
    }
    else
    {
        alert("illegal move! try again");
    }
}
function loadPageLayout()
{
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
}
function loadStartPosition()
{
    board = new Board();
    loadPosition(board);
}