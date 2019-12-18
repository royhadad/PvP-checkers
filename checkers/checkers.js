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
        this.rows = [];
        if (!position)
        {
            for (let row = 0; row < 8; row++)
            {
                this.rows[row] = [];
                for (let column = 0; column < 8; column++)
                {
                    if ((new square(row, column)).isDarkSquare())
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

class square
{
    constructor(row, column)
    {
        if (row===undefined || column===undefined)
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
            imageNode.src = (isDarkSquare ? "./storage/lightSquare.png" : "./storage/darkSquare.png");
            isDarkSquare = !isDarkSquare;
            imageNode.className = "squareImage";
            squareNode.className = "square";
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
    let imageUrl;
    let pieceImage;
    for (let row = 0; row < 8; row++)
    {
        for (let column = 0; column < 8; column++)
        {
            imageUrl = Board.prototype.getImageUrlByName(board.rows[row][column])
            if(imageUrl)
            {
                pieceImage = document.createElement("img");
                pieceImage.setAttribute("src", imageUrl);
                pieceImage.className = "pieceImage";
                square = document.getElementById(row+","+column);
                square.appendChild(pieceImage);
            }
        }
    }
}
function loadStartPosition()
{
    board = new Board();
    //loadPosition(board);
}