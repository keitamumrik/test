const config = {
    type: Phaser.AUTO,
    width: 400,
    height: 400,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let board = [];
const boardSize = 8;
const tileSize = 50;
let currentPlayer = 'black';

const game = new Phaser.Game(config);

function preload() {
    // ここで必要な画像などをロードできます
}

function create() {
    this.add.graphics()
        .fillStyle(0x228B22, 1)  // ダークグリーンの背景に
        .fillRect(0, 0, boardSize * tileSize, boardSize * tileSize);

    drawGridLines(this);

    for (let y = 0; y < boardSize; y++) {
        board[y] = [];
        for (let x = 0; x < boardSize; x++) {
            const rect = this.add.rectangle(
                x * tileSize + tileSize / 2,
                y * tileSize + tileSize / 2,
                tileSize - 2,
                tileSize - 2,
                0x228B22
            );
            rect.setInteractive();
            rect.on('pointerdown', () => placeStone(x, y, this));
            board[y][x] = null;
        }
    }

    // 初期配置の石
    placeInitialStones(this);
    updateScore(this);
}

function drawGridLines(scene) {
    const lineColor = 0xDDDDCA;  // 白色の仕切り線

    const graphics = scene.add.graphics();
    graphics.lineStyle(2, lineColor);  // 線の太さを2ピクセル、色を白

    for (let i = 0; i <= boardSize; i++) {
        const pos = i * tileSize;
        // 垂直線
        graphics.moveTo(pos, 0);
        graphics.lineTo(pos, boardSize * tileSize);
        // 水平線
        graphics.moveTo(0, pos);
        graphics.lineTo(boardSize * tileSize, pos);
    }
    graphics.strokePath();
}

function update() {
    // ゲームの更新処理
}

function placeStone(x, y, scene) {
    if (board[y][x] !== null || !isValidMove(x, y, currentPlayer)) return;

    board[y][x] = currentPlayer;
    drawStone(x, y, currentPlayer, scene);

    flipStones(x, y, currentPlayer, scene);

    if (!hasValidMove(oppositePlayer(currentPlayer))) {
        if (!hasValidMove(currentPlayer)) {
            endGame(scene);
        } else {
            alert(`No valid move for ${oppositePlayer(currentPlayer)}. ${currentPlayer} plays again!`);
        }
    } else {
        currentPlayer = oppositePlayer(currentPlayer);
    }

    updateScore(scene);
}

function placeInitialStones(scene) {
    board[3][3] = 'white';
    board[3][4] = 'black';
    board[4][3] = 'black';
    board[4][4] = 'white';

    drawStone(3, 3, 'white', scene);
    drawStone(4, 3, 'black', scene);
    drawStone(3, 4, 'black', scene);
    drawStone(4, 4, 'white', scene);
}

function drawStone(x, y, player, scene) {
    let stoneColor = (player === 'black') ? 0x000000 : 0xffffff;
    scene.add.circle(x * tileSize + tileSize / 2, y * tileSize + tileSize / 2, tileSize / 2 - 1, stoneColor);
}

function isValidMove(x, y, player) {
    return directions.some(dir => canFlipInDirection(x, y, dir, player));
}

function canFlipInDirection(x, y, direction, player) {
    let [dx, dy] = direction;
    let nx = x + dx;
    let ny = y + dy;
    let foundOpponent = false;

    while (isValidPosition(nx, ny) && board[ny][nx] === oppositePlayer(player)) {
        foundOpponent = true;
        nx += dx;
        ny += dy;
    }

    return foundOpponent && isValidPosition(nx, ny) && board[ny][nx] === player;
}

function flipStones(x, y, player, scene) {
    directions.forEach(direction => {
        if (canFlipInDirection(x, y, direction, player)) {
            let [dx, dy] = direction;
            let nx = x + dx;
            let ny = y + dy;

            while (board[ny][nx] === oppositePlayer(player)) {
                board[ny][nx] = player;
                drawStone(nx, ny, player, scene);
                nx += dx;
                ny += dy;
            }
        }
    });
}

function oppositePlayer(player) {
    return (player === 'black') ? 'white' : 'black';
}

function isValidPosition(x, y) {
    return x >= 0 && x < boardSize && y >= 0 && y < boardSize;
}

function hasValidMove(player) {
    for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
            if (board[y][x] === null && isValidMove(x, y, player)) {
                return true;
            }
        }
    }
    return false;
}

function endGame(scene) {
    let blackCount = board.flat().filter(stone => stone === 'black').length;
    let whiteCount = board.flat().filter(stone => stone === 'white').length;

    if (blackCount > whiteCount) {
        alert(`Game over! Black wins: ${blackCount} to ${whiteCount}`);
    } else if (whiteCount > blackCount) {
        alert(`Game over! White wins: ${whiteCount} to ${blackCount}`);
    } else {
        alert(`Game over! It's a tie: ${blackCount} to ${whiteCount}`);
    }
}

function updateScore(scene) {
    let blackCount = board.flat().filter(stone => stone === 'black').length;
    let whiteCount = board.flat().filter(stone => stone === 'white').length;
    // すでに表示されたテキストを削除して新しいスコアを表示
    scene.children.list.filter(obj => obj.type === 'Text').forEach(text => text.destroy());
    scene.add.text(10, 410, `Black: ${blackCount}   White: ${whiteCount}`, { color: '#000000' });
}

// 八方向のチェック
const directions = [
    [0, 1],   // 上
    [1, 0],   // 右
    [0, -1],  // 下
    [-1, 0],  // 左
    [1, 1],   // 右下
    [-1, 1],  // 左下
    [1, -1],  // 右上
    [-1, -1]  // 左上
];