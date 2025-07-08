import Cell from "./Cell.js";
import { canvas, context } from "./global.js";
import Grid from "./Grid.js";

export default class Game {
    constructor(level) {
        this.currentLevel = level;
        this.grid = new Grid(5, 5)
        this.isDrawing = false;
        this.currentColor = null;
        this.currentPath = []; // chứa các điểm [x, y] đã đi
        this.paths = [];

        this.grid.setCell(0, 0, new Cell('red'))
        this.grid.setCell(4, 2, new Cell('red'))

        this.grid.setCell(1, 2, new Cell('blue'))
        this.grid.setCell(0, 2, new Cell('blue'))

        this.grid.setCell(0, 3, new Cell('green'))
        this.grid.setCell(4, 4, new Cell('green'))
    }

    run = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        this.grid.render();
        this.drawPath(this.currentPath, this.currentColor); // Vẽ đường đang kéo

        requestAnimationFrame(this.run)        
    }

    renderAllPaths() {
        for (const path of this.paths) {
            this.drawPath(path.points, path.color);
        }
    } 

    drawPath(points, color) {
        if (points.length < 2) return;
        context.beginPath();
        context.strokeStyle = color;
        context.lineWidth = 10;
        context.lineCap = "round";
        context.lineJoin = "round";

        const start = this.grid.getCenterCellPosition(...points[0]);
        context.moveTo(start.x, start.y);

        for (let i = 1; i < points.length; i++) {
            const pos = this.grid.getCenterCellPosition(...points[i]);
            context.lineTo(pos.x, pos.y);
        }

        context.stroke();
        context.closePath();
        context.strokeStyle = 'black'
        context.fillStyle = 'black'
        context.lineWidth = 1;
    }




    onMouseDown = (e) => {
        const [x, y] = this.getMouseCellPosition(e);
        const cell = this.grid.getCell(x, y);

        // Nếu bấm vào dot màu → khởi tạo path mới
        if (cell && cell.dotColor) {
            const existingPath = this.paths.find(p => p.color === cell.dotColor);
            const [p1, p2] = existingPath?.points ?? [];

            // Nếu path đã nối 2 dot → bỏ qua
            if (existingPath 
                && this.grid.getCell(...p1).dotColor 
                && this.grid.grid.getCell(...p2).dotColor) {
                return;
            }

            // Nếu có path nhưng chưa nối hoàn chỉnh → xóa
            if (existingPath) {
                this.paths = this.paths.filter(p => p.color !== cell.dotColor);
            }

            // Bắt đầu vẽ lại
            this.isDrawing = true;
            this.currentColor = cell.dotColor;
            this.currentPath = [[x, y]];
            return;
        }

        // Nếu bấm vào 1 ô trong path đã vẽ → tách path tại điểm đó
        for (const path of paths) {
            for (let i = 0; i < path.points.length; i++) {
                const [px, py] = path.points[i];
                if (px === x && py === y) {
                    // Nếu là dot đã nối → không làm gì
                    const startIsDot = this.grid.getCell(...path.points[0]).dotColor;
                    const endIsDot = this.grid.getCell(...path.points[path.points.length - 1]).dotColor;
                    if (startIsDot && endIsDot) return;

                    // Nếu là đoạn giữa → cắt path tại đó
                    path.points = path.points.slice(0, i + 1);
                    this.isDrawing = true;
                    this.currentColor = path.color;
                    this.currentPath = [...path.points];
                    this.paths = this.paths.filter(p => p !== path); // Xóa khỏi paths, đang vẽ lại
                    return;
                }
            }
        }
    }


    onMouseMove = (e) => {
        if (!this.isDrawing) return;

        const [x, y] = this.getMouseCellPosition(e);
        const last = this.currentPath[this.currentPath.length - 1];

        // Không phải ô kề thì bỏ qua
        const isAdjacent = Math.abs(x - last[0]) + Math.abs(y - last[1]) === 1;
        if (!isAdjacent) return;

        const cell = this.grid.getCell(x, y);
        if (!cell) return;


        // Nếu điểm cuối khác màu thì dừng
        if(cell.dotColor) {
            if(cell.dotColor !== this.currentColor) return;
        }

        // Nếu đi lui (quay lại ô trước)
        if (this.currentPath.length >= 2) {
            const prev = this.currentPath[this.currentPath.length - 2];
            if (x === prev[0] && y === prev[1]) {
                this.currentPath.pop(); // ← Quay lui
                return;
            }
        }

        // Nếu ô đã đi bởi màu khác → không đi được
        if (this.isCellInOtherPath(x, y, this.currentColor)) return;

        // Nếu chưa từng đi → thêm vào
        if (!this.currentPath.some(([cx, cy]) => cx === x && cy === y)) {
            this.currentPath.push([x, y]);
        }
    }

    onMouseUp = () => {

        this.isDrawing = false;
        
        if (this.currentPath.length > 1) {
            this.paths.push({
                color: this.currentColor,
                points: [...this.currentPath]
            });
        }
        this.currentColor = null;

        this.currentPath = [];

        if (this.isWin()) {
            setTimeout(() => {
                alert("🎉 You Win!");
            }, 100);
        }
        
    }

    isCellInOtherPath(x, y, color) {
        return this.paths.some(path => {
            if (path.color !== color) {
                return path.points.some(([px, py]) => px === x && py === y);
            }
            return false;
        });
    }
    getMouseCellPosition(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
    
        const cellX = Math.floor(mouseX / this.grid.cellSize.x);
        const cellY = Math.floor(mouseY / this.grid.cellSize.y);
    
        return [cellX, cellY];
    }


    
    isWin() {
        // 1. Lấy danh sách màu dot trên grid
        const dotColors = [];
        for (const cell of this.grid.cells) {
            if (cell.dotColor && !dotColors.includes(cell.dotColor)) {
                dotColors.push(cell.dotColor);
            }
        }

        // 2. Kiểm tra mỗi màu có đúng 1 path, nối giữa 2 dot
        for (const color of dotColors) {
            const path = this.paths.find(p => p.color === color);
            if (!path) return false;

            const startCell = this.grid.getCell(...path.points[0]);
            const endCell = this.grid.getCell(...path.points[path.points.length - 1]);

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

        const totalCells = this.grid.rows * this.grid.columns;
        if (coveredSet.size !== totalCells) return false;

        // ✅ Thắng
        return true;
    }

}