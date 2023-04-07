/*-------------------------------- Constants --------------------------------*/
const cellsInRowCol = 15
const totalCells = cellsInRowCol ** 2
const cellSz = '25px'

const glow = ['#ffd521', '#d8db1b', '#b1e216', '#63ef0b', '#15fc00']
const baseColor = ['#ffd521', '#f3d71f', '#e8d91e', '#dcdb1c', '#d0dd1a']

const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']
const headDir = "url('/images/homerHead.png')"

// parameters to deal with motion direction
const motion = {
  up : {
    oppDirection : 'down',
    wall: createArray(0, 1, cellsInRowCol),
    headIdxAdd : -1*cellsInRowCol,
    headOrient : 270,
    tailCurve : '0 0 2vmin 2vmin',
  },
  down : {
    oppDirection : 'up',
    wall: createArray(totalCells-cellsInRowCol, 1, cellsInRowCol),
    headIdxAdd : cellsInRowCol,
    headOrient: 90,
    tailCurve : '2vmin 2vmin 0 0',
  },
  left : {
    oppDirection : 'right',
    wall: createArray(0, cellsInRowCol, cellsInRowCol),
    headIdxAdd : -1,
    headOrient : 180,
    tailCurve : '0 2vmin 2vmin 0',
  },
  right : {
    oppDirection : 'left',
    wall : createArray(cellsInRowCol-1, cellsInRowCol, cellsInRowCol),
    headIdxAdd : 1,
    headOrient : 0,
    tailCurve : '2vmin 0 0 2vmin',
  }
}

/*-------------------------------- Variables --------------------------------*/

let donut, homer, cellEls, timerIntervalId, gameInProgress, gameOver, message, boardArr, keyIsPressed
let highScore = 0

/*------------------------ Cached Element References ------------------------*/

const resetBtnEl= document.getElementById('reset')
const boardEl = document.querySelector('.board')
const messageEl = document.querySelector('.message')
const scoreEl = document.querySelector('.score')

const eatSound = new Audio('../audio/homerEats.wav')
const loseSound = new Audio('../audio/homerDoh.mp3')
const winSound = new Audio('../audio/homerHappy.mp3')
const backSound = new Audio('../audio/simpsonsTheme.m4a')

/*----------------------------- Event Listeners -----------------------------*/

addEventListener('keydown', handleKeyPress) 
resetBtnEl.addEventListener('click', resetGame)

/*-------------------------Primary Functions --------------------------------*/
renderBoard()

initialize()

// Initialize Game State
function initialize(){

  gameInProgress = false
  gameOver = false
  direction= 'right'
  keyIsPressed = false

  donut = {
    idx : Math.floor(Math.random() * totalCells),
    tally : 0,
  }

  homer= {
    headIdx : randBoardIdx([...motion.left.wall, ...motion.right.wall, donut.idx]),
    glowIdx : 0,
    grow : false,
    speed : 250,
    bodyDir : [direction],
  }
  homer.bodyIdx = [homer.headIdx-1]

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
  }, homer.speed)
}

/*-------------------------------- Handle Event Listeners --------------------------------*/
// Handle Key Presses
function handleKeyPress(evt){
  
  let keyPress = evt.code

  // execute if key is one of the arrow keys
  if (arrowKeys.find(key => key === keyPress)){

    // make keyPress match variable keys (up, down,..)
    keyPress= keyPress.replace('Arrow','').toLowerCase()
    
    // update direction only if it is not in the opposite direction of current motion and other key isn't already pressed
    if (keyPress !== motion[direction].oppDirection && !keyIsPressed){
      direction = keyPress
      keyIsPressed= true
    }

    // run game once first key is pressed
    if (!gameInProgress){
      gameInProgress = true
      playBackgroundSound()
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

    // append old head location to body array
    homer.bodyIdx.push(homer.headIdx)
    homer.bodyDir.push(direction)

    // remove the first index of the homer body and cache it
    if (homer.grow){
      homer.grow = false
    } else {
      homer.last = homer.bodyIdx.shift()
      homer.bodyDir.shift()
    } 

    // update homer head location
    homer.headIdx += motion[direction].headIdxAdd
}

// Update Donut Location
function updateDonut(){

  // if homer head overlaps with donut location:
  if (homer.headIdx === donut.idx){

    // increase donut tally
    ++donut.tally

    // store existing location of donut to clear CSS
    donut.last = donut.idx

    // update donut location so that it does not coincide with current donut and homer locations
    donut.idx= randBoardIdx([...homer.bodyIdx, homer.headIdx, donut.idx])

    // homer grows = homer tail location stays the same 
    homer.grow = true

    // increase homer glow level unless at max
    homer.glowIdx === glow.length-1 ? glow.length-1 : ++homer.glowIdx

    // reduce timerInterval
    homer.speed -= 10
    clearInterval(timerIntervalId)
    startGame()
  }
}

// Check if player lost:
// Homer's head overlaps with board wall and direction is No-No OR
// Homer's head overlaps with body segment
function checkForLoss(){

  if (motion[direction].wall.some((idx) => idx === homer.headIdx) ||
  homer.bodyIdx.some((segment) => segment === homer.headIdx)) {
    gameOver = true
    clearInterval(timerIntervalId)
    backSound.pause()
  }

}

/*-------------------------------- Update View  --------------------------------*/

// Render Homer
function renderHomer(){

  if (!gameOver){
    // add .head to head element and style it
    updateHead()

    // update curve in new tail location
    cellEls[homer.bodyIdx[0]].style.borderRadius = motion[homer.bodyDir[0]].tailCurve

    if (!gameInProgress) {

      // add .body to body elements
      homer.bodyIdx.forEach(function(idx){
        cellEls[idx].classList.add('homer','body')
      })

    } else {

      // replace old head element with body CSS and update styling for body
      cellEls[homer.bodyIdx[homer.bodyIdx.length-1]].classList.replace('head', 'body')
      cellEls[homer.bodyIdx[homer.bodyIdx.length-1]].style.transform =''
      cellEls[homer.bodyIdx[homer.bodyIdx.length-1]].style.background = `linear-gradient(${motion[direction].headOrient}deg, ${baseColor[homer.glowIdx]}, ${glow[homer.glowIdx]}, ${baseColor[homer.glowIdx]})`

      // reset previous tail element
      cellEls[homer.last].classList.remove('homer', 'body')
      cellEls[homer.last].removeAttribute('style')

      if (homer.grow){
        eatSound.volume = .1
        eatSound.play()
      }

      keyIsPressed= false
    }
  }
}

// Render Donut
function renderDonut(){

  if (!gameOver){

    cellEls[donut.idx].classList.add('donut')

    // Remove CSS for previous donut location (if it exists)
    if (donut.hasOwnProperty('last')) {
      cellEls[donut.last].classList.remove('donut')
    }

  }
}

// Render Message
function renderMessage(){

  if (!gameInProgress){
    message = 'Press any arrow key to begin'

  } else if (gameOver) {

    if (donut.tally> highScore) {
      highScore = donut.tally
      message = `New High Score! -- ${highScore}`
      winSound.volume = 0.1
      winSound.play()

    } else {
      loseSound.volume = 0.1
      loseSound.play()
    }

  } else {
    message =`High Score - ${highScore}`
  }

  messageEl.textContent = message
}

// Render Score
function renderScore(){
  scoreEl.textContent = donut.tally
}

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

/*----------------------  Generic Functions  ---------------------------*/

// Create an array with length [repeat] and values starting with [init] at [step] intervals 
function createArray(init, step, repeat){
  return Array(repeat).fill(init).map((x, y) => x + y * step) 
}

// Randomly choose an index in the board array that does not overlap with any index in [occupiedCells]
function randBoardIdx(occupiedCells){
  const emptyCells = boardArr.filter(cell => !occupiedCells.includes(cell))
  return emptyCells[Math.floor(Math.random()* emptyCells.length)]
}

// Update cell with head class and styling
function updateHead(){

  cellEls[homer.headIdx].classList.add('homer','head')

  // If moving left, flip face horizontally. Otherwise, rotate face.
  if (direction === 'left'){
    cellEls[homer.headIdx].style.transform= "scaleX(-1)"
  } else {
    cellEls[homer.headIdx].style.transform= `rotate(${motion[direction].headOrient}deg)`
  }

  cellEls[homer.headIdx].style.background = `${headDir}, linear-gradient(${motion[direction].headOrient}deg, ${baseColor[homer.glowIdx]}, ${glow[homer.glowIdx]}, ${baseColor[homer.glowIdx]})`
  cellEls[homer.headIdx].style.backgroundSize = cellSz
}

function playBackgroundSound(){
  backSound.currentTime = 0
  backSound.volume = .1
  backSound.loop = true
  backSound.play()
}