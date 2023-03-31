/*-------------------------------- Constants --------------------------------*/
//board array
const glow = [0, 1, 2, 3, 4, 5]
const totalApples = 5
const appleInitialLoc = 1290

const snakeStarter= {
  length : 5,
  headIdx : 1280,
  speed : 1000,
  radiation: 0
}

/*-------------------------------- Variables --------------------------------*/
let gameInProgress, gameOver, snake, apples

/*------------------------ Cached Element References ------------------------*/
// board tiles
// const leftArrow= 
const resetBtnEl= document.getElementById('reset')

/*----------------------------- Event Listeners -----------------------------*/

boardEl.addEventListener('click', handleClick) 
resetBtnEl.addEventListener('click', init)

/*-------------------------------- Functions --------------------------------*/
initialize()

// initialize game state
function initialize(){
  snake = snakeStarter
  snake.tailIndex = snake.headIdx - snake.length,

  apples = {
    appleIndex: appleInitialLoc,
    consumed: 0
  }
  gameInProgress = false

  resetDom()
  render()
}

// render game
function render(){
  renderBoard()
  renderSnake()
  renderApple()
  renderMessage()
  renderScore()
}

// render board
function renderBoard(){

}

// render snake
function renderSnake(){
// if in play, update snake location
// if lost, make snake red
}
// render apple
function renderApple(){

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

function handleClick(){
// update game state variables

checkGameEnd()
checkApple()
render()
}

function checkGameEnd(){
  // gameOver = true;
  // winner - update message
  // loser - if snake is outside board
}

function checkApple(){
  // apple eaten, update location of apple, update score, update snake size
}

function resetDom(){

}
