var enemies = []
/*--NODS--*/
var $game = document.querySelector('.wrapper')
var $info = document.querySelector('.info')
var $footer = document.querySelector('.wrapper-footer')
var $gameArea = document.querySelector('#game-area')
var $infoPanel = document.querySelector('.info-panel')
var $mask = document.querySelector('#mask')
/*--NODS TEXT--*/
var $scoreText = document.querySelector('.score')
var $missText = document.querySelector('.miss')
var $passedText = document.querySelector('.passed')
var $timeText = document.querySelector('.time')
var $accuracyText = document.querySelector('.accuracy')

var $goScoreText = document.querySelector('.go-score')
var $goMissText = document.querySelector('.go-miss')
var $goPassedText = document.querySelector('.go-passed')
var $goTimeText = document.querySelector('.go-time')
var $goAccuracyText = document.querySelector('.go-accuracy')
/*--VARIABLES--*/
var score = 0
var misses = 0
var passed = 0
var accuracy = 0
var currentTime = 0
var maxPassed = 5
var maxMisses = 3
var maxGameTime = 30

var isStarted = false
var startedInterval


changeInfoBoard()
$game.addEventListener('click', click)


function click(event) {
    var target = event.target
    console.log(target)
    var targetClassName = target.className
    var targetId = target.id

    if(targetId == 'start_button') {
        startGame()
        misses--
    }
    if(target.className == 'enemy') {
        var foundEnemy = enemies.find(function(enemy) {
            return enemy.enemy === target
        })
        destroy(foundEnemy.enemy)
        clearInterval(foundEnemy.interval)
        enemies.splice(enemies.indexOf(foundEnemy), 1)
        score++
        $scoreText.textContent = 'Очки: ' + score
        checkAccuracy()
    }
    if(target.className !== 'enemy' && isStarted) {
        misses++
        if(misses >= maxMisses) {
            endGame()
        }
        $missText.textContent = 'Промахов: ' + misses + '/' + maxMisses
        checkAccuracy()
    }
    if(targetId == 'ok_btn') {
        $mask.style.display = 'none'
    }
}

function startGame() {
    console.log(score, misses, passed, accuracy, currentTime, isStarted)
    isStarted = true;
    $info.style.display = 'none'
    $footer.style.display = 'none'
    $gameArea.style.display = 'block'
    $infoPanel.style.display = 'flex'
    var timestamp = Date.now()
    var renderInterval = setInterval(() => {
        if((Date.now() - timestamp) / 1000 > maxGameTime) {
            endGame()
            clearInterval(renderInterval)
        } else {
            $timeText.textContent = 'Осталось времени: ' + (maxGameTime - ((Date.now()-timestamp) / 1000)).toFixed(1)
            var trueOrFalse = getRandom(0,12) <= 1 ? true : false
            if(trueOrFalse) {
                render()
            }
            currentTime += .1
        }
    }, 100);
    startedInterval = renderInterval
    render()
}


function render() {
    var enemy = document.createElement('div')
    var gameSize = $gameArea.getBoundingClientRect()
    enemy.classList.add('enemy')
    enemy.style.width = enemy.style.height = '100px'
    var maxLeft = gameSize.width - parseInt(enemy.style.width)
    var maxTop = gameSize.height - parseInt(enemy.style.height)
    enemy.style.left = getRandom(0, maxLeft) + 'px'
    enemy.style.top = getRandom(0, maxTop) + 'px'
    enemy.style.transform = 'scale(0.00,0.00)'
    $gameArea.insertAdjacentElement('afterbegin', enemy)
    var time = 0
    var increase = true
    var timer = setInterval(function() {
        if(time >= 400) {
            clearInterval(timer)
            if(isStarted) {
                passed++
            }
            destroy(enemy)
            $passedText.textContent = 'Пропуск: '+ passed + '/' + maxPassed
        } else {
            var currentTransform = enemy.style.transform.substr(6,12).split(',')
            if(parseFloat(currentTransform[0]) < 1 && increase) {
                var x = (parseFloat(currentTransform[0])+.005)
                var y = (parseFloat(currentTransform[1])+.005)
                enemy.style.transform = 'scale('+ x + ','+ y + ')'
            } else {
                increase = false
                var x = (parseFloat(currentTransform[0])-.005)
                var y = (parseFloat(currentTransform[1])-.005)
                enemy.style.transform = 'scale('+ x + ','+ y + ')'
            }
            time++
        }
    }, 10)
    enemies.push({
        enemy: enemy,
        interval: timer,
    })
}

function checkAccuracy() {
    accuracy = score > 0 ? (misses > 0 ? 100 - (misses / score) * 100 : 100) : 0 
    $accuracyText.textContent = 'Точность: ' + Math.ceil(accuracy) + '%'
}

function destroy(enemy) {
    enemy.remove()
    if(passed >= maxPassed) {
        endGame()
    }
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max-min) + min)
}

function endGame() {
    isStarted = false
    clearInterval(startedInterval)
    $mask.style.display = 'block'
    $gameArea.style.display = 'none'
    $infoPanel.style.display = 'none'
    $info.style.display = 'flex'
    $footer.style.display = 'flex'

    $goScoreText.textContent = 'Очки: ' + score
    $goMissText.textContent = 'Промахов: ' + misses
    $goPassedText.textContent = 'Пропусков: ' + passed
    $goTimeText.textContent = 'Время: ' + currentTime.toFixed(1)
    $goAccuracyText.textContent = 'Точность: ' + accuracy.toFixed(1)
    saveProgress()
    nullify()
}

function saveProgress() {
    var obj = {
        score: score,
        misses: misses,
        passed: passed,
        accuracy: accuracy.toFixed(1),
        currentTime: currentTime.toFixed(1),
    }
    var ls = JSON.parse(localStorage.getItem('my_game'))
    if(ls == null) {
        localStorage.setItem('my_game', JSON.stringify([obj]))
    } else {
        ls.push(obj)
        localStorage.setItem('my_game', JSON.stringify(ls))
    }
    changeInfoBoard();
}

function getProgress() {
    var progress = JSON.parse(localStorage.getItem('my_game'))
    return progress != null ? progress : false
}

function changeInfoBoard() {
    var progress = getProgress()
    if(progress) {
        progress.reverse()
    }
    progress.length = 10
    if(progress) {
        var columns = document.querySelectorAll('.column')
        for(var i = 0; i< columns.length;i++) {
            columns[i].textContent = JSON.stringify(progress[i])
        }
    }
}

function nullify() {
    score = 0
    misses = 0
    passed = 0
    accuracy = 0
    currentTime = 0
    isStarted = false
} 