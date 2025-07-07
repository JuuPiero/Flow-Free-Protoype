import Cell from "./Cell.js";
import { canvas, context, DOT_RADIUS } from "./global.js";
import { Vector2D } from "./Math.js";

export default class Grid {
    constructor(rows, columns) {
        this.rows = rows
        this.columns = columns
        this.cells = []
        this.currentColor = null
        this.pathsDrawn = {}

        this.cellSize = new Vector2D(canvas.width / columns, canvas.height / rows)
        for (let i = 0; i < this.rows * this.columns; i++) {
            this.cells.push(new Cell())
        }
    }
    
    getCell(x, y) {
        return this.cells[y * this.columns + x]
    }
    setCell(x, y, cell) {
        this.cells[y * this.columns + x] = cell
    }

    render() {
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                const cell = this.getCell(x, y);
                context.beginPath()
                context.rect(x * this.cellSize.x, y * this.cellSize.x, this.cellSize.x, this.cellSize.x)
                context.stroke()
                context.closePath()
                if(cell.dotColor) {
                    this.renderDot(x, y, cell.dotColor)
                }
            }
        }
     
    }

    renderDot(x, y, color) {
        const position = this.getCenterCellPosition(x, y)
        context.beginPath()
        context.strokeStyle = color
        context.fillStyle = color
        context.arc(position.x, position.y, DOT_RADIUS, 0, Math.PI * 2)
        context.fill()
        context.stroke()
        context.closePath()
        context.strokeStyle = 'black'
        context.fillStyle = 'black'
    }


    getCenterCellPosition(x, y) {
        return new Vector2D(x * this.cellSize.x + (this.cellSize.x / 2) , y * this.cellSize.y + (this.cellSize.y / 2) )
    }
}