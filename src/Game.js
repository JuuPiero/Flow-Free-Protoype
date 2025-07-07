import Grid from "./Grid.js";

class Game {
    constructor(level) {
        this.currentLevel = level;
        this.grid = new Grid(5, 5)
        this.isDrawing = false;
        this.currentColor = null;
        this.currentPath = []; // chứa các điểm [x, y] đã đi
        this.paths = [];
    }
}