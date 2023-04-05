/*-------------------------------- Constants --------------------------------*/
const cellsInRowCol = 20 //must be even number to so board is square
const totalCells = cellsInRowCol ** 2
const cellSz = '4vmin' //height and width
const glow = ['#ffd521', '#d8db1b', '#b1e216', '#63ef0b', '#15fc00']
const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
const speed = 250 //ms

// parameters to deal with motion direction
const motion = {
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
let donut, homer, cellEls, timerIntervalId, gameInProgress, gameOver, keyPress, message, boardArr

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
renderBoard()

initialize()

// Initialize Game State
function initialize(){
  // const occupiedCells = [...homer.body, homer.headIdx, donut.idx]
  // const emptyCells = boardArr.filter(cell => !occupiedCells.includes(cell))
  // donut.idx = emptyCells[Math.floor(Math.random()* emptyCells.length)]

  homer= {
    headIdx : 26,
    body: [25],
    glowIdx: 0,
    grow: false,
  }

  donut = {
    idx: Math.floor(Math.random() * totalCells),
    consumed: 0,
    total: 5, //should this be a constant b/c it doesn't change?
  }

  direction= 'right'
  gameInProgress = false
  gameOver = false

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
    keyPress= keyPress.replace('Arrow','').toLowerCase()
    
    // update direction only if it is not in the opposite direction of current motion
    if (keyPress !== motion[direction].oppDirection){
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

// Update Homer Location
function updateHomer(){

    // add existing location to body array
    homer.body.push(homer.headIdx)

    // remove the first index of the homer body and cache it
    homer.grow ? homer.grow = false : homer.last = homer.body.shift()

    // update homer head location
    homer.headIdx += motion[direction].idxAdd
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
    homer.glowIdx === glow.length-1 ? glow.length-1 : ++homer.glowIdx
  }
}

/*-------------------------------- Update View  --------------------------------*/

// Render Board
function renderBoard(){

  boardArr = [...Array(totalCells).keys()]

  boardEl.style.gridTemplate= `repeat(${cellsInRowCol},${cellSz}) / repeat(${cellsInRowCol},${cellSz})`

  for (let i=0; i< totalCells; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell'
    boardEl.appendChild(cell)
  }  

  cellEls = document.querySelectorAll('.board > .cell')
}

// Render Homer
function renderHomer(){

  if (!gameInProgress){

     // add .head to head location and style it
    cellEls[homer.headIdx].classList.add('homer','head')
    cellEls[homer.headIdx].style.transform= `rotate(${motion[direction].headOrient}deg)`
    cellEls[homer.headIdx].style.backgroundImage = `url('/assets/homerHead.png'), linear-gradient(${motion[direction].headOrient}deg, #ffd521, ${glow[homer.glowIdx]}, #ffd521)`

    // add .body to body location
    homer.body.forEach(function(idx){
      cellEls[idx].classList.add('homer','body')
    })

  } else if (gameOver!== 'lose'){

    // add '.head' to new head location and rotate head
    cellEls[homer.headIdx].classList.add('homer','head')
    cellEls[homer.headIdx].style.transform= `rotate(${motion[direction].headOrient}deg)`
    cellEls[homer.headIdx].style.backgroundImage = `url('/assets/homerHead.png'), linear-gradient(${motion[direction].headOrient}deg, #ffd521, ${glow[homer.glowIdx]}, #ffd521)`
    
    // replace old head location with body CSS and update styling for body
    cellEls[homer.body[homer.body.length-1]].classList.replace('head', 'body')
    cellEls[homer.body[homer.body.length-1]].style.transform =''
    cellEls[homer.body[homer.body.length-1]].style.backgroundImage =''
    cellEls[homer.body[homer.body.length-1]].style.background = `linear-gradient(${motion[direction].headOrient}deg, #ffd521, ${glow[homer.glowIdx]}, #ffd521)`

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
  if (motion[direction].border.some((idx) => idx === homer.headIdx) ||
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