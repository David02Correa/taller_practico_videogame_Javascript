const canvas = document.querySelector('#game');
const game = canvas.getContext('2d');
const btnUp = document.querySelector('#up');
const btnLeft = document.querySelector('#left');
const btnRight = document.querySelector('#right');
const btnDown = document.querySelector('#down');
const spanLives = document.querySelector('#lives');
const spanTime = document.querySelector('#time');
const spanRecord = document.querySelector('#record');
const pResult = document.querySelector('#result')

let canvasSize;
let elementsSize;
let level = 0;
let lives = 3;

let timeStart;
let timePlayer;
let timeInterval;

const playerPosition = {
    x: undefined,
    y: undefined,
};
const giftPosition = {
    x: undefined,
    y: undefined,
};

let enemyPositions = [];


window.addEventListener('load', setCanvasSize);
window.addEventListener('resize', setCanvasSize);

function setCanvasSize(){
    
    if(window.innerHeight > window.innerWidth){

        canvasSize = window.innerWidth * 0.8;
    } else {
        canvasSize = window.innerHeight * 0.8;
    }
    canvasSize = Number(canvasSize.toFixed(0));
    canvas.setAttribute('width', canvasSize);

    canvas.setAttribute('height', canvasSize);

     elementsSize = canvasSize / 10;
     playerPosition.x = undefined;
     playerPosition.y = undefined;
     starGame()
}
function starGame(){

    enemyPositions.length = 0;
    console.log({canvasSize, elementsSize});

    game.font = elementsSize + 'px Verdana';
    game.textBaseline = 'top';

    const map = maps[level];

    if(!map){
        gameWin();
        return;
    }

    if(!timeStart){
        timeStart = Date.now();
        timeInterval = setInterval(showTime, 100)
        showRecord();
    }
    const mapRows = map.trim().split('\n');
    const mapRowsCols = mapRows.map(row => row.trim().split(''));
    console.log({map, mapRows,mapRowsCols});

    showLives();
    game.clearRect(0,0, canvasSize, canvasSize);

    mapRowsCols.forEach((row, rowI) => {
        row.forEach((col, colI) =>{
            const emoji = emojis[col];
            const posX = elementsSize * colI;
            const posY = elementsSize * rowI;
            
            if (col == 'O'){
              if(!playerPosition.x && !playerPosition.y){
                playerPosition.x = posX;
                playerPosition.y = posY;
              }
                
            } else if ( col == 'I'){
                giftPosition.x = posX
                giftPosition.y = posY
            } else if (col == 'X'){
                enemyPositions.push({
                   x: posX,
                   y: posY,
                })
            }

            game.fillText(emoji, posX, posY);
        })
        
    });

    // for (let row = 1; row <= 10; row++) {
    //     for (let col = 1; col <= 10; col++) {
    //         game.fillText(emojis[mapRowsCols[row-1][col-1]], elementsSize * (col - 1), elementsSize * (row - 1));
    //     }
    // }  
    
    movePlayer(); 
}

function movePlayer (){

    

    const giftCollisionX = playerPosition.x.toFixed(0) == giftPosition.x.toFixed(0);
    const giftCollisiony = playerPosition.y.toFixed(0) == giftPosition.y.toFixed(0);
    const giftCollision = giftCollisionX && giftCollisiony;
    if (giftCollision){
        console.log('¡Subiste de nivel!');
        levelWin(); // Llamamos a la función para cambiar de nivel
    }
    

    const enemyCollision = enemyPositions.find(enemy => {
        const enemyCollisionX = enemy.x.toFixed(0) == playerPosition.x.toFixed(0);
        const enemyCollisiony = enemy.y.toFixed(0) == playerPosition.y.toFixed(0);
        return enemyCollisionX && enemyCollisiony
    });
    if (enemyCollision){
        levelFail();
        
    }
    game.fillText(emojis['PLAYER'], playerPosition.x,
        playerPosition.y);
       
}

function levelWin (){
    console.log('subiste de nivel');
    
    level++;
    starGame()
    
}
function levelFail (){
    lives --;
   
    if(lives <= 0){
        level = 0;
        lives = 3;
        timeStart = undefined;
    }
    console.log('chocaste jaja burro');
    playerPosition.x = undefined;
    playerPosition.y = undefined;
    starGame();
   
    
}

function gameWin(){
    console.log('terminaste el juego');
    clearInterval(timeInterval);

    const recordTime = localStorage.getItem('record_time')
    const playerTime = Date.now() - timeStart;
    if(recordTime){
       
        if(recordTime >= playerTime){
            localStorage.setItem('record_time', playerTime);
            pResult.innerHTML ='superaste el record biennn';
           
        } else {
            pResult.innerHTML ='lo siento, no superaste el record';
            
        }
    } else {
        localStorage.setItem('record_time', playerTime);
        pResult.innerHTML = 'Nada mal para tu primera vez'
    }
    console.log({recordTime, playerTime});
    
}

function showLives (){
   const ArraydeCorazones = Array(lives).fill(emojis['CAGADA']);
   spanLives.innerHTML = "";
    ArraydeCorazones.forEach(heart => spanLives.append(heart));
    
}

function showTime(){
    spanTime.innerHTML = Date.now() - timeStart;
}
function showRecord(){
    spanRecord.innerHTML = localStorage.getItem('record_time')
}
window.addEventListener('keydown', moveByKeays);
btnUp.addEventListener('click',moveUp);
btnLeft.addEventListener('click',moveLeft);
btnRight.addEventListener('click',moveRight);
btnDown.addEventListener('click',moveDown);

function moveByKeays(event){
    if(event.key == 'ArrowUp')
        moveUp();
    else if (event.key == 'ArrowLeft')
        moveLeft();
    else if (event.key == 'ArrowRight')
        moveRight();
    else if (event.key == 'ArrowDown')
        moveDown();
    
}

function moveUp() {
    if (playerPosition.y - elementsSize >= 0) { 
        playerPosition.y -= elementsSize;
    
        
        updateGame(); // Redibujar sin reiniciar el juego
    }
}

function moveLeft() {
    if (playerPosition.x - elementsSize >= 0) { 
        playerPosition.x -= elementsSize;
    
        updateGame();
    }
}

function moveRight() {
    if (playerPosition.x + elementsSize <= canvasSize - elementsSize) { 
        playerPosition.x += elementsSize;
    
        updateGame();
    }
}

function moveDown() {
    if (playerPosition.y + elementsSize <= canvasSize - elementsSize) { 
        playerPosition.y += elementsSize;
    
        updateGame();
    }
}

// Nueva función para actualizar el juego sin reiniciarlo
function updateGame() {
    game.clearRect(0, 0, canvasSize, canvasSize); // Limpia el canvas
    drawMap(); // Redibuja el mapa
    movePlayer(); // Dibuja al jugador en su nueva posición
}

// Extraemos la lógica de dibujar el mapa en una función separada
function drawMap() {
    const map = maps[level];
    const mapRows = map.trim().split('\n');
    const mapRowsCols = mapRows.map(row => row.trim().split(''));

    mapRowsCols.forEach((row, rowI) => {
        row.forEach((col, colI) => {
            const emoji = emojis[col];
            const posX = elementsSize * colI;
            const posY = elementsSize * rowI;
            game.fillText(emoji, posX, posY);
        });
    });
}
