const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
context.scale(20, 20);


const color = [
    null,
    "#ff0d72",
    "#0dc2ff",
    "#0dff72",
    "#f538ff",
    "#ff8e0d",
    "#ffe138",
    "#3877ff",
]
const player = {
    offset: {x: 0, y: 0},
    matrix: null,
    score: 0,
}
let pause = 0;

const arena = createMatrix(12, 20);
reset();

function arenaSweep() {
    let rowCount = 1;
    outer:for (let y = 0; y < arena.length; y++) {
        for (let x = 0; x < arena[y].length; x++) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        player.score = rowCount * 10;
        rowCount *= 2;
        y++;
    }
}

function updateScore() {
    const score = document.getElementById("score");
    console.log(player.score)
    score.innerHTML = `Score : ${player.score}`;
}

function createMatrix(w, h) {
    // 初始化矩阵，表示所有块的存放点
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createTile(type) {
    switch (type) {
        case "T":
            return [
                [0, 0, 0],
                [1, 1, 1],
                [0, 1, 0],
            ];
        case "L":
            return [
                [0, 2, 0],
                [0, 2, 0],
                [0, 2, 2],
            ];
        case "Z":
            return [
                [3, 3, 0],
                [0, 3, 3],
                [0, 0, 0],
            ];
        case "O":
            return [
                [4, 4],
                [4, 4],
            ];
        case "J":
            return [
                [0, 5, 0],
                [0, 5, 0],
                [5, 5, 0]

            ];
        case "I":
            return [
                [0, 6, 0],
                [0, 6, 0],
                [0, 6, 0]

            ]
        case "S":
            return [
                [0, 7, 7],
                [7, 7, 0],
                [0, 0, 0],
            ];
    }
}

// 初始新块，玩家重新下棋
function reset() {
    const pieces = "TLZOJIS";
    player.matrix = createTile(pieces[Math.random() * pieces.length | 0]);
    player.offset.y = 0;
    player.offset.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0)
    // 如果重置时就碰上了说明已经满了，全部清除
    if (collide(arena, player)) {
        player.score = 0;
        arena.forEach(row => row.fill(0));
    }
}

function playerRotate(dir) {
    const p = player.offset.x;
    let offset = 1;
    rotate(player.matrix, dir);
    //当前块的任何一部分触碰到东西时
    while (collide(arena, player)) {
        // 移动1
        player.offset.x += offset;
        // 将offset重置
        // 如果当前offset是正数，那么下一次就是反方向尝试
        // 且比上一次加1，避免来回跳步
        offset = -(offset + (offset > 0 ? 1 : -1));
        // 如果跳移量大于当前块的宽度，重置为转向前的形状，
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.offset.x = p;
            return;
        }
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < y; x++) {
            // 解构写法，将两数互换
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]]
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}


function collide(arena, player) {
    // 解构
    const [m, o] = [player.matrix, player.offset];
    // 循环遍历当前块数组
    for (let y = 0; y < m.length; y++) {
        for (let x = 0; x < m[y].length; x++) {
            // 如果当前下标不为0，且arena同样的位置也不为0复制
            if (m[y][x] !== 0 && arena[y + o.y]?.[x + o.x] !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0 && arena[y + player.offset.y]) {
                arena[y + player.offset.y][x + player.offset.x] = value;
            }
        })
    })
}


function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = color[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        })
    })
}

function drawArena() {
    arena.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = color[value];
                context.fillRect(x, y, 1, 1);
            }
        })
    })
}


function TileMove(offset) {
    player.offset.x += offset;
    if (collide(arena, player)) {
        player.offset.x += offset > 0 ? -1 : 1
    }
}

function tileDrop() {
    player.offset.y++;
    if (collide(arena, player)) {
        player.offset.y--;
        merge(arena, player);
        reset();
        // 碰撞时检测是否满了
        arenaSweep();
        //每次碰撞检查分数
        updateScore();
    }
    dropCounter = 0;
}

document.addEventListener("keydown", function (e) {
    if (pause) return;
    if (e.code === "KeyA") {
        TileMove(-1);
    } else if (e.code === "KeyD") {
        TileMove(1);
    } else if (e.code === "KeyS") {
        tileDrop();
    } else if (e.code === "ArrowRight") {
        playerRotate(-1);
    } else if (e.code === "ArrowLeft") {
        playerRotate(1);
    }
})

function draw() {
    context.fillStyle = `#000`;
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(player.matrix, player.offset);

}

let lastTime = 0;
const dropTime = 1000;
let dropCounter = 0;

function update(time = 0) {
    requestAnimationFrame(update);
    draw();
    drawArena();
    if (pause) return;
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropTime) tileDrop()
}

update();


document.querySelector(".pause").addEventListener("click", function (e) {
    pause ^= 1;
})
