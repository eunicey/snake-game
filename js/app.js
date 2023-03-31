/*-------------------------------- Constants --------------------------------*/
const totalCells = 50
const glow = [0, 1, 2, 3, 4, 5]
const totalApples = 5
const appleInitialLoc = 29

let border={
  ArrowUp:[],
  ArrowDown:[],
  ArrowLeft:[],
  ArrowRight:[]
}

for (let i=0; i<=4; i++){
  border.ArrowUp.push(i)
}
for (let i=45; i<=49; i++){
  border.ArrowDown.push(i)
}
for (let i=0; i<=45; i+=5){
  border.ArrowLeft.push(i)
}
for (let i=4; i<=49; i+=5){
  border.ArrowRight.push(i)
}

/*-------------------------------- Variables --------------------------------*/
let gameInProgress, gameOver, apples, cellEls, boardArr, keyPress, snake

/*------------------------ Cached Element References ------------------------*/

const resetBtnEl= document.getElementById('reset')
const boardEl = document.querySelector('.board')
const bodyEl = document.querySelector('body')

/*----------------------------- Event Listeners -----------------------------*/

addEventListener('keydown', handleKeyPress) 
resetBtnEl.addEventListener('click', initialize)

/*-------------------------------- Functions --------------------------------*/
initialize()

// initialize game state
function initialize(){
  snake= {
    length : 3,
    headIdx : 27,
    speed : 1000,
    radiation: 0,
    direction: 'ArrowRight',
    oppDirection: 'ArrowLeft',
    arr: []
  }

  apples = {
    idx: appleInitialLoc,
    consumed: 0
  }

  gameInProgress = false

  updateSnakeArray()
  resetDom()
  renderBoard()
  render()
}

function updateSnakeArray(){

  if (!gameInProgress){
    for (let i= snake.headIdx - snake.length +1; i<= snake.headIdx; i++) {
      snake.arr.push(i)
    }
  } else {

    if (keyPress === 'ArrowRight'){
      ++ snake.headIdx
      snake.oppDirection = 'ArrowLeft'
    } else if (keyPress === 'ArrowLeft'){
      -- snake.headIdx
      snake.oppDirection = 'ArrowRight'
    } else if (keyPress === 'ArrowUp'){
      snake.headIdx -= 5
      snake.oppDirection = 'ArrowDown'
    } else if (keyPress === 'ArrowDown'){
      snake.headIdx += 5
      snake.oppDirection = 'ArrowUp'
    }
    snake.arr.last = snake.arr.shift()
    snake.arr.push(snake.headIdx)
  }
} 

// render game
function render(){
  renderSnake()
  renderApple()
  renderMessage()
  renderScore()
}

// render board
function renderBoard(){
  for (let i=0; i< totalCells; i++) {
    let cell = document.createElement('div');
    cell.className = 'cell'
    // cell.setAttribute('id', i)
    cell.textContent = i;
    boardEl.appendChild(cell)
  }  
  cellEls = document.querySelectorAll('.board > .cell')
}

// render snake
function renderSnake(){

  snake.arr.forEach(function(idx){
    cellEls[idx].classList.add('snake')
  })

  if (gameInProgress) {
    cellEls[snake.arr.last].classList.remove('snake')
  }

  // if lost, make snake red
}

// render apple
function renderApple(){
  cellEls[apples.idx].classList.add('apple')
}

function handleKeyPress(evt){
  gameInProgress = true
  keyPress = evt.code

  if (keyPress !== snake.oppDirection){
    snake.direction = keyPress

    checkGameEnd()

    if (!gameOver){
      checkApple()
      updateSnakeArray()
      render()
    }
  }

}

function checkGameEnd(){

  //check if keyPress leads snake off board
  if (border[keyPress].some((idx) => idx === snake.headIdx)){
    gameOver = true
    console.log('gameover')
  }
  // winner - update message
  // loser - if snake is outside board
}

function checkApple(){
  // apple eaten, update location of apple, update score, update snake size

  if (snake.headIdx === apples.idx){
    ++apples.consumed
    apples.idx

  }
}

// render message
function renderMessage(){
  // how to start game
  // when player wins or loses
}

function renderScore(){
  // initial state
  // when score updates
}

function resetDom(){

}