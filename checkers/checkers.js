function loadPageLayout()
{
    let boardDiv = document.getElementById("board");
    let isLightSquare = true;
    for(let row=0;row<8;row++)
    {
        for(let column=0;column<8;column++)
        {
            let squareNode = document.createElement("div");
            let imageNode = document.createElement("img");
            imageNode.src = (isLightSquare?"./storage/lightSquare.png":"./storage/darkSquare.png");
            isLightSquare = !isLightSquare;
            imageNode.className = "squareImage";
            squareNode.className = "square";
            squareNode.id = `${row},${column}`;
            squareNode.appendChild(imageNode);
            boardDiv.appendChild(squareNode);
        }
        //let lineBreakNode = document.createElement("br");
        //lineBreakNode.className = "boardLineBreak";
        //boardDiv.appendChild(lineBreakNode);
    }
}