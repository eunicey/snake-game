/*-------------------------------- Constants --------------------------------*/
const totalCells = 50
const appleInitialLoc = 29
const glow = [0, 1, 2, 3, 4, 5]
const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
const boardArr = [...Array(totalCells).keys()] // should this go under Initialize?

let border ={
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
let gameInProgress, gameOver, apple, cellEls, keyPress, snake, timerIntervalId

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
    headIdx : 26,
    body: [],
    glowIdx: 0,
    length : 2,
    grow: false,
    direction: 'ArrowRight',
    oppDirection: 'ArrowLeft'
  }

  apple = {
    idx: appleInitialLoc,
    consumed: 0,
    total: 10,
    gone: false
  }

  gameInProgress = false

  initializeSnake()
  resetDom()
  renderBoard()
  render()
}

// render game
function render(){
  renderMessage()
  renderScore()
  renderSnake()
  renderApple()
}

function startGame(){
  timerIntervalId= setInterval(function(){
    checkForLoss()
    updateSnakeArray()
    updateApple()
    checkForWin()
    render()
  }, 500)
}

function handleKeyPress(evt){
  
  keyPress = evt.code
  // execute if key is one of the arrow keys
  if (arrowKeys.find(key => key === keyPress)){

    // do not register keypress if it's in the opposite direction of current motion)
    if (keyPress !== snake.oppDirection){
      snake.direction = keyPress
    }
    if (!gameInProgress){
      gameInProgress = true
      startGame()
    }
  }
}

// Initialize snake
function initializeSnake(){
  for (let i= snake.headIdx - snake.length +1; i< snake.headIdx; i++) {
    snake.body.push(i)
  }
}

// Update location of snake
function updateSnakeArray(){

    snake.body.push(snake.headIdx)

    if (snake.direction  === 'ArrowRight'){
      ++ snake.headIdx
      snake.oppDirection = 'ArrowLeft'
    } else if (snake.direction  === 'ArrowLeft'){
      -- snake.headIdx
      snake.oppDirection = 'ArrowRight'
    } else if (snake.direction  === 'ArrowUp'){
      snake.headIdx -= 5
      snake.oppDirection = 'ArrowDown'
    } else if (snake.direction  === 'ArrowDown'){
      snake.headIdx += 5
      snake.oppDirection = 'ArrowUp'
    }
    if (!snake.grow){
      snake.last = snake.body.shift()
    } else {
      snake.grow = false
    }
}


// Update location of apple
function updateApple(){

  // apple eaten, update location of apple, update score, update snake size
  if (snake.headIdx === apple.idx){

    // increase apple consumed count
    ++apple.consumed

    // store existing location of apple
    apple.last = apple.idx

    // create an array of possible indices for next apple that do not coincide with existing apple index and snake location
    const occupiedCells = [...snake.body, snake.headIdx, apple.idx]
    const emptyCells = boardArr.filter(cell => !occupiedCells.includes(cell))

    // randomly choose from the array  
    apple.idx = emptyCells[Math.floor(Math.random()* emptyCells.length)]

    // update snake: tail idx remains the same (snake grows) and snake glow level increases (if not at max)
    snake.grow = true
    snake.glowIdx === glow.length ? glow.length : ++snake.glowIdx
  }
}

// render board
function renderBoard(){

  for (let i=0; i< totalCells; i++) {
    let cell = document.createElement('div');
    cell.className = 'cell'
    cell.textContent = i;
    boardEl.appendChild(cell)
  }  

  cellEls = document.querySelectorAll('.board > .cell')
}

// render snake
function renderSnake(){
    if (gameOver!== 'lose'){
      // if (!gameOver){
        let snakeArray = [...snake.body, snake.headIdx]
        snakeArray.forEach(function(idx){
          cellEls[idx].classList.add('snake')
        })

      // ignore this during initilizae process
      if (gameInProgress){
          cellEls[snake.last].classList.remove('snake')
      }
  }
}

// render apple
function renderApple(){

  if (!gameOver){
    cellEls[apple.idx].classList.add('apple')

    if (apple.last) {
      cellEls[apple.last].classList.remove('apple')
    }
  }
}

function checkForLoss(){

  // if snake is moving off board, game over!
  // if snake's head overlaps with it's body, game over
    if (border[snake.direction].some((idx) => idx === snake.headIdx) ||
    snake.body.some((segment) => segment === snake.headIdx)){
      gameOver = 'lose'
      console.log('you lost')
      clearInterval(timerIntervalId)
    }
}

function checkForWin(){

  // if all apples are consumed, game over
  if (apple.consumed === apple.total){
    gameOver = 'won'
    console.log('you won')
    clearInterval(timerIntervalId)
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