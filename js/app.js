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
let highScore = 0

/*------------------------ Cached Element References ------------------------*/

const resetBtnEl= document.getElementById('reset')
const boardEl = document.querySelector('.board')
const messageEl = document.querySelector('.message')
const gameScoreEl = document.querySelector('.gameScore')
const highScoreEl = document.querySelector('.highScore')

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
  homer= {
    headIdx : randBoardIdx(motion.left.border),
    glowIdx: 0,
    grow: false,
  }
  homer.body = [homer.headIdx-1]

  donut = {
    idx: Math.floor(Math.random() * totalCells),
    tally: 0,
    beatHighScore: false,
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

    // increase donut tally and check if highScore is beat
    ++donut.tally
    if (donut.tally> highScore) {
    highScore = donut.tally
    donut.beatHighScore = true
    }

    // store existing location of donut to clear CSS
    donut.last = donut.idx

    // update donut location so that it does not coincide with current donut and homer locations
    donut.idx= randBoardIdx([...homer.body, homer.headIdx, donut.idx])

    // homer grows = homer tail location stays the same 
    homer.grow = true

    // increase homer glow level unless at max
    homer.glowIdx === glow.length-1 ? glow.length-1 : ++homer.glowIdx
  }
}

// Check if player lost
function checkForLoss(){

  // Homer's head overlaps with board border and direction is No-No OR
  // Homer's head overlaps with body segment
  if (motion[direction].border.some((idx) => idx === homer.headIdx) ||
  homer.body.some((segment) => segment === homer.headIdx)){
    gameOver = true
    clearInterval(timerIntervalId)
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
     updateHead()

    // add .body to body location
    homer.body.forEach(function(idx){
      cellEls[idx].classList.add('homer','body')
    })

  } else {
  // } else if (!gameOver){

    // add '.head' to new head location and rotate head
    updateHead()
    
    // replace old head location with body CSS and update styling for body
    cellEls[homer.body[homer.body.length-1]].classList.replace('head', 'body')
    cellEls[homer.body[homer.body.length-1]].style.transform =''
    cellEls[homer.body[homer.body.length-1]].style.backgroundImage =''
    cellEls[homer.body[homer.body.length-1]].style.background = `linear-gradient(${motion[direction].headOrient}deg, #ffd521, ${glow[homer.glowIdx]}, #ffd521)`

    // remove body class in previous tail location
    cellEls[homer.last].classList.remove('homer', 'body')
    cellEls[homer.last].removeAttribute('style')
  }
  // if (gameOver){
  //   clearInterval(timerIntervalId)
  // }
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

// render message
function renderMessage(){

  if (!gameInProgress){
    message = 'Press any arrow key to begin!'
  } else if (gameOver) {
    if (donut.beatHighScore){
      message = `New High Score! ${highScore}`
      winSound.volume = 0.1
      winSound.play()
    } else {
      message =`High Score- ${highScore}`
      loseSound.volume = 0.1
      loseSound.play()
    }
  } else {
    message = ''
  }
  messageEl.textContent = message
}

function renderScore(){
  gameScoreEl.textContent = donut.tally
  if (gameOver){
    highScoreEl.textContent = highScore
  }

}

/*----------------------  Generic Functions  ---------------------------*/

function createArray(init, step, repeat){
  return Array(repeat).fill(init).map((x, y) => x + y * step) 
}

function randBoardIdx(occupiedCells){
  const emptyCells = boardArr.filter(cell => !occupiedCells.includes(cell))
  return emptyCells[Math.floor(Math.random()* emptyCells.length)]
}

function updateHead(){
  cellEls[homer.headIdx].classList.add('homer','head')
  cellEls[homer.headIdx].style.transform= `rotate(${motion[direction].headOrient}deg)`
  cellEls[homer.headIdx].style.backgroundImage = `url('/assets/homerHead.png'), linear-gradient(${motion[direction].headOrient}deg, #ffd521, ${glow[homer.glowIdx]}, #ffd521)`
}