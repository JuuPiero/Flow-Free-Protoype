import Cell from "./src/Cell.js";
import { canvas, context } from "./src/global.js";
import Grid from "./src/Grid.js";
import { Vector2D } from "./src/Math.js";


const grid = new Grid(5, 5);

grid.setCell(0, 0, new Cell('red'))
grid.setCell(3, 2, new Cell('red'))

grid.setCell(1, 2, new Cell('blue'))
grid.setCell(4, 3, new Cell('blue'))

grid.setCell(0, 3, new Cell('green'))
grid.setCell(4, 4, new Cell('green'))


let isDrawing = false;
let currentColor = null;
let currentPath = []; // chứa các điểm [x, y] đã đi
let paths = [];



function animate() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    grid.render()
    // renderCurrentPath()
    renderAllPaths();         // Vẽ các đường đã lưu
    drawPath(currentPath, currentColor); // Vẽ đường đang kéo
    requestAnimationFrame(animate);
}
animate()



canvas.addEventListener("mousedown", (e) => {
    const [x, y] = getMouseCellPosition(e);
    const cell = grid.getCell(x, y);

    if (cell && cell.dotColor) {
        isDrawing = true;
        currentColor = cell.dotColor;
        currentPath = [[x, y]];
    }
  
})

canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;

    const [x, y] = getMouseCellPosition(e);
    const last = currentPath[currentPath.length - 1];

    // Không phải ô kề thì bỏ qua
    const isAdjacent = Math.abs(x - last[0]) + Math.abs(y - last[1]) === 1;
    if (!isAdjacent) return;

    const cell = grid.getCell(x, y);
    if (!cell) return;

    // Nếu đã đi qua rồi thì bỏ
    if (cell.pathColor && cell.pathColor !== currentColor) return;

    // Nếu chưa từng đi → tô
    if (!cell.pathColor) {
        cell.pathColor = currentColor;
        currentPath.push([x, y]);
    }
});
function isCellInOtherPath(x, y, color) {
    return paths.some(path => {
        if (path.color !== color) {
            return path.points.some(([px, py]) => px === x && py === y);
        }
        return false;
    });
}
canvas.addEventListener("mouseup", () => {

    isDrawing = false;
    
    if (currentPath.length > 1) {
        paths.push({
            color: currentColor,
            points: [...currentPath]
        });
    }
    currentColor = null;

    currentPath = [];
    console.log(paths);
    
});



function getMouseCellPosition(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const cellX = Math.floor(mouseX / grid.cellSize.x);
    const cellY = Math.floor(mouseY / grid.cellSize.y);

    return [cellX, cellY];
}

function renderAllPaths() {
    for (const path of paths) {
        drawPath(path.points, path.color);
    }
}


function drawPath(points, color) {
    if (points.length < 2) return;

    context.beginPath();
    context.strokeStyle = color;
    context.lineWidth = 10;
    context.lineCap = "round";
    context.lineJoin = "round";

    const start = grid.getCenterCellPosition(...points[0]);
    context.moveTo(start.x, start.y);

    for (let i = 1; i < points.length; i++) {
        const pos = grid.getCenterCellPosition(...points[i]);
        context.lineTo(pos.x, pos.y);
    }

    context.stroke();
    context.closePath();
    context.strokeStyle = 'black'
    context.fillStyle = 'black'
    context.lineWidth = 1;
}