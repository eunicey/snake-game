/*-------------------------------- Constants --------------------------------*/
const cellsInRowCol = 10 //must be square
const totalCells = cellsInRowCol ** 2
const boardArr = [...Array(totalCells).keys()] // should this go under Initialize?
const cellSz = '40px' //height and width
const glow = [0, 1, 2, 3, 4, 5]
const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

const speed = 250 //ms

const motionRules = {
  up : {
    oppDirection : 'down',
    idxAdd : -1*cellsInRowCol,
    border: createArray(0, 1, cellsInRowCol)
  },
  down : {
    oppDirection : 'up',
    idxAdd : cellsInRowCol,
    border: createArray(totalCells-cellsInRowCol, 1, cellsInRowCol)
  },
  left : {
    oppDirection : 'right',
    idxAdd : -1,
    border: createArray(0, cellsInRowCol, cellsInRowCol)
  },
  right : {
    oppDirection : 'left',
    idxAdd : 1,
    border: createArray(cellsInRowCol-1, cellsInRowCol, cellsInRowCol)
  }
}

/*-------------------------------- Variables --------------------------------*/
let apple, snake, cellEls, timerIntervalId, gameInProgress, gameOver, keyPress, message

/*------------------------ Cached Element References ------------------------*/

const resetBtnEl= document.getElementById('reset')
const boardEl = document.querySelector('.board')
const messageEl = document.querySelector('.message')
const scoreEl = document.querySelector('.score')

const eatSound = new Audio('../assets/homerEats.wav')
const loseSound = new Audio('../assets/homerDoh.mp3')
const winSound = new Audio('../assets/homerHappy.mp3')

/*----------------------------- Event Listeners -----------------------------*/

addEventListener('keydown', handleKeyPress) 
resetBtnEl.addEventListener('click', resetGame)

/*-------------------------------- Primary Functions --------------------------------*/
renderBoard() //Okay that this is outside of initialize? don't want to re-render with reset.
initialize()

// Initialize Game State
function initialize(){
  snake= {
    headIdx : 27, //should this be a constant?
    glowIdx: 0,
    bodyLength : 2, //should this be a constant b/c it doesn't change?
    grow: false,
  }

  apple = {
    idx: 29, //should this be a constant?
    consumed: 0,
    total: 5, //should this be a constant b/c it doesn't change?
  }

  direction= 'right'
  gameInProgress = false
  gameOver = false

  initializeSnake()
  render()
}

// Render Game
function render(){
  renderScore()
  renderMessage()
  renderSnake()
  renderApple()
}

// Run Game
function startGame(){
  timerIntervalId= setInterval(function(){
    checkForLoss()
    updateSnake()
    updateApple()
    checkForWin()
    render()
  }, speed)
}

/*-------------------------------- Handle Event Listeners --------------------------------*/
// Handle Key Presses
function handleKeyPress(evt){
  
  keyPress = evt.code

  // execute if key is one of the arrow keys
  if (arrowKeys.find(key => key === keyPress)){

    // make keyPress match variable keys (up, down,..)
    keyPress= keyPress.replace('Arrow','').toLowerCase() // why do I need to redeclare?
    
    // update direction only if it is not in the opposite direction of current motion
    if (keyPress !== motionRules[direction].oppDirection){
      direction = keyPress
    }

    // run game once first key is pressed
    if (!gameInProgress){
      gameInProgress = true
      startGame()
    }
  }
}

function resetGame(){

  // remove all apple and snake classes
  boardEl.querySelectorAll('.apple, .snake').forEach(el => el.classList.remove('apple','snake'))
  initialize()
}

/*-------------------------------- Update Model  --------------------------------*/

// Initialize Snake
function initializeSnake(){

  //create array that represent indices for body
  snake.body = createArray(snake.headIdx - snake.bodyLength, 1, snake.bodyLength)
}

// Update Snake Location
function updateSnake(){

    // add existing location to body array
    snake.body.push(snake.headIdx)

    // remove the first index of the snake body and cache it
    snake.grow ? snake.grow = false : snake.last = snake.body.shift()

    // update snake head location
    snake.headIdx += motionRules[direction].idxAdd
}

// Update Apple Location
function updateApple(){

  // if snake head overlaps with apple location:
  if (snake.headIdx === apple.idx){

    // increase apple consumed count
    ++apple.consumed

    // store existing location of apple
    apple.last = apple.idx

    // update apple location so that it does not coincide with current apple and snake locations
    const occupiedCells = [...snake.body, snake.headIdx, apple.idx]
    const emptyCells = boardArr.filter(cell => !occupiedCells.includes(cell))
    apple.idx = emptyCells[Math.floor(Math.random()* emptyCells.length)]

    // snake grows = snake tail location stays the same 
    snake.grow = true

    // increase snake glow level unless at max
    snake.glowIdx === glow.length ? glow.length : ++snake.glowIdx
  }
}

/*-------------------------------- Update View  --------------------------------*/

// Render Board
function renderBoard(){

  boardEl.style.gridTemplate= `repeat(${cellsInRowCol},${cellSz}) / repeat(${cellsInRowCol},${cellSz})`

  for (let i=0; i< totalCells; i++) {
    const cell = document.createElement('div'); //can this not be reused?
    cell.className = 'cell'
    boardEl.appendChild(cell)
  }  

  cellEls = document.querySelectorAll('.board > .cell') // can't add this to cached elements?
}

// Render Snake
function renderSnake(){

    // render full snake during initialization
    if (!gameInProgress){
      const snakeArray = [...snake.body, snake.headIdx]
      snakeArray.forEach(function(idx){
        cellEls[idx].classList.add('snake')
      })
    
    // update CSS for snake head and tail if player didn't lose
    } else {
      if (gameOver!== 'lose'){
        cellEls[snake.headIdx].classList.add('snake')
        cellEls[snake.last].classList.remove('snake')
      }
    }
  }

// Render Apple
function renderApple(){

  if (!gameOver){

    cellEls[apple.idx].classList.add('apple')

    // Remove CSS for previous apple (if it exists)
    if (apple.last) {
      cellEls[apple.last].classList.remove('apple')
    }

    if (snake.grow){
      eatSound.volume = .1
      eatSound.play()
    }
  }
}

// Check if player lost
function checkForLoss(){

  // Snake's head overlaps with board border and direction is No-No OR
  // Snake's head overlaps with body segment
  if (motionRules[direction].border.some((idx) => idx === snake.headIdx) ||
  snake.body.some((segment) => segment === snake.headIdx)){
    gameOver = 'lose'
    console.log('you lost')
    clearInterval(timerIntervalId)
  }
}

// Check if player won - all apples consumed
function checkForWin(){

  if (apple.consumed === apple.total){
    gameOver = 'win'
    console.log('you won')
    clearInterval(timerIntervalId)
  }
}

// render message
function renderMessage(){

  if (!gameInProgress){
    message = 'Press any arrow key to begin!'
  } else if (gameOver) {
    message = `You ${gameOver}!`
    if (gameOver === 'win'){
      winSound.volume = 0.1
      winSound.play()
    } else {
      loseSound.volume = 0.1
      loseSound.play()
    }
  } else {
    message = 'placeholder'
  }
  messageEl.textContent = message
}

function renderScore(){
  scoreEl.textContent = `${apple.consumed} of ${apple.total}`
}

/*-------------------------------- Generic Functions  --------------------------------*/

function createArray(init, step, repeat){
  return Array(repeat).fill(init).map((x, y) => x + y * step) 
}