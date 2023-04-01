/*-------------------------------- Constants --------------------------------*/
const totalCells = 50
const glow = [0, 1, 2, 3, 4, 5]
const appleInitialLoc = 28
const boardArr = [...Array(totalCells).keys()]

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
    length : 3,
    headIdx : 27,
    speed : 1000,
    radiation: 0,
    direction: 'ArrowRight',
    oppDirection: 'ArrowLeft',
    arr: []
  }

  apple = {
    idx: appleInitialLoc,
    consumed: 0,
    total: 5,
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
  renderSnake()
  renderApple()
  renderMessage()
  renderScore()
}

function startGame(){
  timerIntervalId= setInterval(doAll, 500)
}

function doAll(){
  checkForLoss()
  updateSnakeArray()
  updateApple()
  checkForWin()
  render()
}

function handleKeyPress(evt){
  if (!gameInProgress){
    startGame()
    gameInProgress = true
  }
  
  keyPress = evt.code

  if (keyPress !== snake.oppDirection){
    snake.direction = keyPress
    // checkForLoss()
    // updateSnakeArray()
    // updateApple()
    // checkForWin()
    // render()
  }
}

// Initialize snake
function initializeSnake(){
  for (let i= snake.headIdx - snake.length +1; i<= snake.headIdx; i++) {
    snake.arr.push(i)
  }
}

// Update location of snake
function updateSnakeArray(){

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
    snake.last = snake.arr.shift()
    snake.arr.push(snake.headIdx)
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
      const appleOptions = boardArr.filter(function(idx){
        return [...snake.arr, apple.idx].indexOf(idx) === -1
      }) 
      // randomly choose from the array  
      apple.idx = appleOptions[Math.floor(Math.random()* appleOptions.length)]
    }
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
    cellEls[snake.last].classList.remove('snake')
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

  // if keyPress leads snake off board, game over!
  if(keyPress){
    if (border[keyPress].some((idx) => idx === snake.headIdx)){
      gameOver = 'lose'
      console.log('you lost')
      clearInterval(timerIntervalId)
    }
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