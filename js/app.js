/*-------------------------------- Constants --------------------------------*/
const totalCells = 50
const glow = [0, 1, 2, 3, 4, 5]
const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
const boardArr = [...Array(totalCells).keys()] // should this go under Initialize?

const motionRules = {
  up : {
    oppDirection : 'down',
    idxAdd : -5,
    border: []
  },
  down : {
    oppDirection : 'up',
    idxAdd : 5,
    border: []
  },
  left : {
    oppDirection : 'right',
    idxAdd : -1,
    border: []
  },
  right : {
    oppDirection : 'left',
    idxAdd : 1,
    border: []
  }
}

for (let i=0; i<=4; i++){
  motionRules.up.border.push(i)
}
for (let i=45; i<=49; i++){
  motionRules.down.border.push(i)
}
for (let i=0; i<=45; i+=5){
  motionRules.left.border.push(i)
}
for (let i=4; i<=49; i+=5){
  motionRules.right.border.push(i)
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
    headIdx : 26, //should this be a constant?
    body: [],
    glowIdx: 0,
    length : 2,
    grow: false,
  }

  apple = {
    idx: 29, //should this be a constant?
    consumed: 0,
    total: 10,
    gone: false
  }

  direction= 'right'
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
    keyPress= keyPress.replace('Arrow','').toLowerCase() // why do I need to redeclare?
    
    // do not register keypress if it's in the opposite direction of current motion)
    if (keyPress !== motionRules[direction].oppDirection){
      direction = keyPress
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
    // before updating snake head location, add existing location to body array
    snake.body.push(snake.headIdx)

    // remove the first index of the snake body and cache it
    snake.grow ? snake.grow = false : snake.last = snake.body.shift()

    snake.headIdx += motionRules[direction].idxAdd
}


// Update location of apple
function updateApple(){

  // apple eaten, update location of apple, update score, update snake size
  if (snake.headIdx === apple.idx){

    // increase apple consumed count
    ++apple.consumed

    // store existing location of apple
    apple.last = apple.idx

    // update apple location so that it does not coincide with current apple and snake locations
    const occupiedCells = [...snake.body, snake.headIdx, apple.idx]
    const emptyCells = boardArr.filter(cell => !occupiedCells.includes(cell))
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
    if (motionRules[direction].border.some((idx) => idx === snake.headIdx) ||
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