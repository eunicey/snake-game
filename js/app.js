/*-------------------------------- Constants --------------------------------*/
const cellsInRowCol = 24 //must be square
const totalCells = cellsInRowCol ** 2
const boardArr = [...Array(totalCells).keys()] // should this go under Initialize?
const cellSz = '3vmin' //height and width
const glow = ['#ffd521', '#ebd81e', '#d8db1b', '#c4df19', '#b1e216', '#15fc00']
const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

const speed = 250 //ms

const motionRules = {
  up : {
    oppDirection : 'down',
    idxAdd : -1*cellsInRowCol,
    border: createArray(0, 1, cellsInRowCol),
    headOrient: 270,
  },
  down : {
    oppDirection : 'up',
    idxAdd : cellsInRowCol,
    border: createArray(totalCells-cellsInRowCol, 1, cellsInRowCol),
    headOrient: 90,
  },
  left : {
    oppDirection : 'right',
    idxAdd : -1,
    border: createArray(0, cellsInRowCol, cellsInRowCol),
    headOrient: 180,
  },
  right : {
    oppDirection : 'left',
    idxAdd : 1,
    border: createArray(cellsInRowCol-1, cellsInRowCol, cellsInRowCol),
    headOrient: 0,
  }
}

/*-------------------------------- Variables --------------------------------*/
let donut, homer, cellEls, timerIntervalId, gameInProgress, gameOver, keyPress, message

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

/*-------------------------Primary Functions --------------------------------*/
renderBoard() //Okay that this is outside of initialize? don't want to re-render with reset.
initialize()

// Initialize Game State
function initialize(){
  homer= {
    headIdx : 26, //should this be a constant?
    glowIdx: 0,
    bodyLength : 2, //should this be a constant b/c it doesn't change?
    grow: false,
  }

  donut = {
    idx: 29, //should this be a constant?
    consumed: 0,
    total: 5, //should this be a constant b/c it doesn't change?
  }

  direction= 'right'
  gameInProgress = false
  gameOver = false

  initializeHomer()
  render()
}

// Render Game
function render(){
  renderScore()
  renderMessage()
  renderHomer()
  renderDonut()
}

// Run Game
function startGame(){
  timerIntervalId= setInterval(function(){
    checkForLoss()
    updateHomer()
    updateDonut()
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

  // remove all donut and homer classes
  boardEl.querySelectorAll('.donut, .homer').forEach(function(el){
    el.classList.value = 'cell'
    el.removeAttribute('style')
  })
  clearInterval(timerIntervalId)
  initialize()
}

/*-------------------------------- Update Model  --------------------------------*/

// Initialize Homer
function initializeHomer(){

  //create array that represent indices for body
  homer.body = createArray(homer.headIdx - homer.bodyLength, 1, homer.bodyLength)
}

// Update Homer Location
function updateHomer(){

    // add existing location to body array
    homer.body.push(homer.headIdx)

    // remove the first index of the homer body and cache it
    homer.grow ? homer.grow = false : homer.last = homer.body.shift()

    // update homer head location
    homer.headIdx += motionRules[direction].idxAdd
}

// Update Donut Location
function updateDonut(){

  // if homer head overlaps with donut location:
  if (homer.headIdx === donut.idx){

    // increase donut consumed count
    ++donut.consumed

    // store existing location of donut
    donut.last = donut.idx

    // update donut location so that it does not coincide with current donut and homer locations
    const occupiedCells = [...homer.body, homer.headIdx, donut.idx]
    const emptyCells = boardArr.filter(cell => !occupiedCells.includes(cell))
    donut.idx = emptyCells[Math.floor(Math.random()* emptyCells.length)]

    // homer grows = homer tail location stays the same 
    homer.grow = true

    // increase homer glow level unless at max
    homer.glowIdx === glow.length ? glow.length : ++homer.glowIdx
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

// Render Homer
function renderHomer(){

  if (!gameInProgress){

     // add .head to head location and style it
    cellEls[homer.headIdx].classList.add('homer','head')
    cellEls[homer.headIdx].style.transform= `rotate(${motionRules[direction].headOrient}deg)`

    // add .body to body location
    homer.body.forEach(function(idx){
      cellEls[idx].classList.add('homer','body')
    })

  } else if (gameOver!== 'lose'){

    // add '.head' to new head location and rotate head
    cellEls[homer.headIdx].classList.add('homer','head')
    cellEls[homer.headIdx].style.transform= `rotate(${motionRules[direction].headOrient}deg)`
    
    // replace old head location with body CSS and update styling for body
    cellEls[homer.body[homer.body.length-1]].classList.replace('head', 'body')
    cellEls[homer.body[homer.body.length-1]].style.transform =''
    cellEls[homer.body[homer.body.length-1]].style.background = `linear-gradient(90deg, #ffd521, ${glow[homer.glowIdx]}, #ffd521)`

    // remove body class in previous tail location
    cellEls[homer.last].classList.remove('homer', 'body')
    cellEls[homer.last].removeAttribute('style')
  }
}

// Render Donut
function renderDonut(){

  if (!gameOver){

    cellEls[donut.idx].classList.add('donut')

    // Remove CSS for previous target (if it exists)
    if (donut.hasOwnProperty('last')) {
      cellEls[donut.last].classList.remove('donut')
    }

    if (homer.grow){
      eatSound.volume = .1
      eatSound.play()
    }
  }
}

// Check if player lost
function checkForLoss(){

  // Homer's head overlaps with board border and direction is No-No OR
  // Homer's head overlaps with body segment
  if (motionRules[direction].border.some((idx) => idx === homer.headIdx) ||
  homer.body.some((segment) => segment === homer.headIdx)){
    gameOver = 'lose'
    clearInterval(timerIntervalId)
  }
}

// Check if player won - all donuts consumed
function checkForWin(){

  if (donut.consumed === donut.total){
    gameOver = 'win'
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
    message = ''
  }
  messageEl.textContent = message
}

function renderScore(){
  scoreEl.textContent = `${donut.consumed} of ${donut.total}`
}

/*----------------------  Generic Functions  ---------------------------*/

function createArray(init, step, repeat){
  return Array(repeat).fill(init).map((x, y) => x + y * step) 
}