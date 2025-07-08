import Cell from "./Cell";


function generateRandomLevel(grid, numColors) {
    const rows = grid.rows;
    const cols = grid.columns;
    const usedPositions = new Set();
    const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'cyan'];

    function getRandomPosition() {
        let x, y, key;
        do {
            x = Math.floor(Math.random() * cols);
            y = Math.floor(Math.random() * rows);
            key = `${x},${y}`;
        } while (usedPositions.has(key));
        usedPositions.add(key);
        return { x, y };
    }

    for (let i = 0; i < numColors; i++) {
        const color = colors[i % colors.length];
        const p1 = getRandomPosition();
        const p2 = getRandomPosition();

        grid.setCell(p1.x, p1.y, new Cell(color));
        grid.setCell(p2.x, p2.y, new Cell(color));
    }
}


export {
    generateRandomLevel
}
