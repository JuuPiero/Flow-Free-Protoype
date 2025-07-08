import Cell from "./src/Cell.js";
import { canvas, context } from "./src/global.js";
import Grid from "./src/Grid.js";


const grid = new Grid(5, 5);

grid.setCell(0, 0, new Cell('red'))
grid.setCell(4, 2, new Cell('red'))
grid.setCell(1, 2, new Cell('blue'))
grid.setCell(0, 2, new Cell('blue'))
grid.setCell(0, 3, new Cell('green'))
grid.setCell(4, 4, new Cell('green'))



let isDrawing = false;
let currentColor = null;
let currentPath = []; 
let paths = [];



function animate() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    grid.render()
    renderAllPaths();         // Vẽ các đường đã lưu
    drawPath(currentPath, currentColor); // Vẽ đường đang kéo
    requestAnimationFrame(animate);
}
animate()


canvas.addEventListener("mousedown", (e) => {
    const [x, y] = getMouseCellPosition(e);
    const cell = grid.getCell(x, y);

    // Nếu bấm vào dot màu → khởi tạo path mới
    if (cell && cell.dotColor) {
        const existingPath = paths.find(p => p.color === cell.dotColor);
        const [p1, p2] = existingPath?.points ?? [];

        // // Nếu path đã nối 2 dot → bỏ qua
        // if (existingPath && grid.getCell(...p1).dotColor && grid.getCell(...p2).dotColor) {
        //     return;
        // }

        // Nếu có path nhưng chưa nối hoàn chỉnh → xóa
        if (existingPath) {
            paths = paths.filter(p => p.color !== cell.dotColor);
        }

        // Bắt đầu vẽ lại
        isDrawing = true;
        currentColor = cell.dotColor;
        currentPath = [[x, y]];
        return;
    }

    // Nếu bấm vào 1 ô trong path đã vẽ → tách path tại điểm đó
    for (const path of paths) {
        for (let i = 0; i < path.points.length; i++) {
            const [px, py] = path.points[i];
            if (px === x && py === y) {
                // Nếu là dot đã nối → không làm gì
                const startIsDot = grid.getCell(...path.points[0]).dotColor;
                const endIsDot = grid.getCell(...path.points[path.points.length - 1]).dotColor;
                if (startIsDot && endIsDot) return;

                // Nếu là đoạn giữa → cắt path tại đó
                path.points = path.points.slice(0, i + 1);
                isDrawing = true;
                currentColor = path.color;
                currentPath = [...path.points];
                paths = paths.filter(p => p !== path); // Xóa khỏi paths, đang vẽ lại
                return;
            }
        }
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


    // Nếu điểm cuối khác màu thì dừng
    if(cell.dotColor) {
        if(cell.dotColor !== currentColor) return;
    }

    // Nếu đi lui (quay lại ô trước)
    if (currentPath.length >= 2) {
        const prev = currentPath[currentPath.length - 2];
        if (x === prev[0] && y === prev[1]) {
            currentPath.pop(); // ← Quay lui
            return;
        }
    }

    // Nếu ô đã đi bởi màu khác → không đi được
    if (isCellInOtherPath(x, y, currentColor)) return;

    // Nếu chưa từng đi → thêm vào
    if (!currentPath.some(([cx, cy]) => cx === x && cy === y)) {
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

    if (isWin()) {
        setTimeout(() => {
            alert("🎉 You Win!");
        }, 100);
    }
    
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

    const [x, y] = grid.getCenterCellPosition(...points[0]);
    context.moveTo(x, y);

    for (let i = 1; i < points.length; i++) {
        const [x, y] = grid.getCenterCellPosition(...points[i]);
        context.lineTo(x, y);
    }

    context.stroke();
    context.closePath();
    context.strokeStyle = 'black'
    context.fillStyle = 'black'
    context.lineWidth = 1;
}


function isWin() {
    // 1. Lấy danh sách màu dot trên grid
    const dotColors = [];
    for (const cell of grid.cells) {
        if (cell.dotColor && !dotColors.includes(cell.dotColor)) {
            dotColors.push(cell.dotColor);
        }
    }

    // 2. Kiểm tra mỗi màu có đúng 1 path, nối giữa 2 dot
    for (const color of dotColors) {
        const path = paths.find(p => p.color === color);
        if (!path) return false;

        const startCell = grid.getCell(...path.points[0]);
        const endCell = grid.getCell(...path.points[path.points.length - 1]);

        if (!startCell.dotColor || !endCell.dotColor) return false;
        if (startCell.dotColor !== color || endCell.dotColor !== color) return false;
    }

    // 3. Kiểm tra toàn bộ grid đã được phủ bởi path nào đó
    const coveredSet = new Set();
    for (const path of paths) {
        for (const [x, y] of path.points) {
            coveredSet.add(`${x},${y}`);
        }
    }

    const totalCells = grid.rows * grid.columns;
    if (coveredSet.size !== totalCells) return false;

    // ✅ Thắng
    return true;
}

