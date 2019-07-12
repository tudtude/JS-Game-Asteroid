let asteroids, background, devShowBounding, display, displayContext, exploding, frames, friction, gameLves, laserDistan, laserMax, laserSpeed, level, lives, ship, roidNumber, roidSpeed, roidSize, shipHeight, shipBilnkDuration, shipInvisible, shipExplodeDuration, text, textAlpha, thrustShip, trunSpeed

display = document.getElementById('display')
display.width = 500
display.height = 500
displayContext = display.getContext('2d')

loadImage()

function loadImage() {
    init()
}

function init() {
    devShowBounding = true
    frames = 0
    shipHeight = 30
    shipExplodeDuration = .1
    shipInvisible = 5
    shipBilnkDuration = 0.1
    trunSpeed = 360 // trun speed degree per loop
    thrustShip = 1
    friction = 0.1
    roidNumber = 15               // starting asteroid number
    roidSpeed = 50
    roidSize = 50
    roidVert = 10
    roidJag = 0.2
    laserMax = 10
    laserSpeed = 500
    laserDistan = 0.6
    laserExplodeDuration = 0.1
    level = 0
    textFade = 2.5
    textFont = '40px sans-serif'
    gameLives = 3

    newGame()

    background = {
        show: backgroundShow
    }

    laser = []

    run()
}

function newGame() {
    lives = gameLives
    
    ship = newShip()
    asteroids = []
    newLevel()
}

function newLevel() {
    text = `Level : ${level + 1}`
    textAlpha = 1
    createAsteroids()
}

function show() {
    backgroundShow()
    shipShow()
    asteroidsShow()
    laserShow()
    textShow()
    livesDraw()
}

function update() {
    ship && ship.update()
    asteroidsUpdate()
    laserUpdate()
}

function run() {
    frames++
    show()
    update()
    requestAnimationFrame(run)
}

function backgroundShow() {
    displayContext.fillStyle = 'black'
    displayContext.fillRect(0, 0, display.width, display.height)
}

function newShip() {
    if( lives <= 0 ){
        gameOver()
        return
    }
    
    return {
        x: display.width / 2,
        y: display.height / 2,
        r: shipHeight / 2,
        a: Math.PI / 2,
        rotation: 0,
        show: shipShow,
        shipExplodeTime: 0,
        blinkTime: Math.floor(shipBilnkDuration * 30),
        blinkNumber: shipInvisible / shipBilnkDuration,
        update: shipUpdate,
        thrusting: false,
        canShoot: true,
        lasers: [],
        thrust: {
            x: 0,
            y: 0
        },
        dead: false
    }
}

function shipShow() {
    if( ship == undefined ) return
    if (exploding) {
        displayContext.fillStyle = 'red'
        displayContext.beginPath()
        displayContext.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2)
        displayContext.fill()
        displayContext.fillStyle = 'orange'
        displayContext.beginPath()
        displayContext.arc(ship.x, ship.y, ship.r * .8, 0, Math.PI * 2)
        displayContext.fill()
        displayContext.fillStyle = 'yellow'
        displayContext.beginPath()
        displayContext.arc(ship.x, ship.y, ship.r * .6, 0, Math.PI * 2)
        displayContext.fill()
        displayContext.fillStyle = 'white'
        displayContext.beginPath()
        displayContext.arc(ship.x, ship.y, ship.r * .4, 0, Math.PI * 2)
        displayContext.fill()

        if (ship.shipExplodeTime == 0) {
            if( ship.dead ){
                return
            }
            ship = newShip()
        }
        return
    }

    if (devShowBounding) {
        displayContext.strokeStyle = 'lime'
        displayContext.lineWidth = shipHeight / 30
        displayContext.beginPath()
        displayContext.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2)
        displayContext.stroke()
    }


    if (ship.blinkOn) {
        shipDraw( ship.x, ship.y, ship.a )
    }
    if (ship.blinkNumber > 0) {
        ship.blinkTime--
        if (ship.blinkTime == 0) {
            ship.blinkTime = Math.floor(shipBilnkDuration * 30)
            ship.blinkNumber--
        }
    }
}

function shipExplode() {
    ship.shipExplodeTime = Math.floor(shipExplodeDuration * 60)
}

function trustShow() {
    displayContext.fillStyle = 'red'
    displayContext.strokeStyle = 'yellow'
    displayContext.lineWidth = shipHeight / 5
    displayContext.beginPath()

    displayContext.moveTo(
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + .5 * Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - .5 * Math.cos(ship.a))
    )
    displayContext.lineTo(
        ship.x - 1.2 * ship.r * Math.cos(ship.a),
        ship.y + 1.2 * ship.r * Math.sin(ship.a)
    )
    displayContext.lineTo(
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - .5 * Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + .5 * Math.cos(ship.a))
    )
    displayContext.closePath()
    displayContext.stroke()
    displayContext.fill()
}

function shipUpdate() {
    ship.blinkOn = ship.blinkNumber % 2 == 0
    exploding = ship.shipExplodeTime > 0
    if (exploding) {
        ship.shipExplodeTime--
        return
    }

    ship.a += ship.rotation
    if (ship.thrusting) {
        ship.thrust.x += thrustShip * Math.cos(ship.a) / 60
        ship.thrust.y -= thrustShip * Math.sin(ship.a) / 60

        trustShow()

    } else {
        ship.thrust.x -= friction * ship.thrust.x / 60
        ship.thrust.y -= friction * ship.thrust.y / 60
    }

    if (ship.x < 0 - ship.r) {
        ship.x = display.width + ship.r
    } else if (ship.x > display.width + ship.r) {
        ship.x = 0 - ship.r
    }

    if (ship.y < 0 - ship.r) {
        ship.y = display.height - ship.r
    } else if (ship.y > display.height + ship.r) {
        ship.y = 0 - ship.r
    }


    ship.x += ship.thrust.x
    ship.y += ship.thrust.y 

}

function Asteroid(x, y, r) {
    let levelSpeed = 1 + 0.1 * level
    this.x = x
    this.y = y
    this.speedX = levelSpeed * Math.random() * roidSpeed / 60 * (Math.random() < 0.5 ? 1 : -1)
    this.speedY = levelSpeed * Math.random() * roidSpeed / 60 * (Math.random() < 0.5 ? 1 : -1)
    this.r = r
    this.a = Math.random() * Math.PI * 2
    this.vert = Math.floor(Math.random() * (roidVert + 1) + roidVert / 2)
    this.offset = []

    for (let i = 0; i < this.vert; i++) {
        this.offset.push(Math.random() * roidJag * 2 + 1 - roidJag)
    }
}

function createAsteroids() {

    for (let i = 0; i < roidNumber + level; i++) {
        let x, y
        do {
            x = Math.floor(Math.random() * display.width)
            y = Math.floor(Math.random() * display.height)
        } while (distanBTNObject(ship.x, ship.y, x, y) < roidSize * 2 + ship.r)
        asteroids.push(new Asteroid(x, y, Math.floor(roidSize / 2)))
    }
}

function destroyAsteroid(i) {
    let a = asteroids[i]
    if (a.r == Math.floor(roidSize / 2)) {
        asteroids.push(new Asteroid(a.x, a.y, Math.floor(roidSize / 4)))
        asteroids.push(new Asteroid(a.x, a.y, Math.floor(roidSize / 4)))
    } else if (a.r == Math.floor(roidSize / 4)) {
        asteroids.push(new Asteroid(a.x, a.y, Math.floor(roidSize / 8)))
        asteroids.push(new Asteroid(a.x, a.y, Math.floor(roidSize / 8)))
    }
    asteroids.splice(i, 1)
    if (asteroids.length == 0) {
        level++
        newLevel()
    }
}

function distanBTNObject(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
}

function asteroidsShow() {

    for (let i = 0; i < asteroids.length; i++) {
        let x = asteroids[i].x
        let y = asteroids[i].y
        let r = asteroids[i].r
        let a = asteroids[i].a
        let vert = asteroids[i].vert
        let offset = asteroids[i].offset

        displayContext.strokeStyle = 'gray'
        displayContext.lineWidth = shipHeight / 10
        displayContext.beginPath()
        displayContext.moveTo(
            x + r * offset[0] * Math.cos(a),
            y + r * offset[0] * Math.sin(a)
        )
        for (let j = 1; j < vert; j++) {
            displayContext.lineTo(
                x + r * offset[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offset[j] * Math.sin(a + j * Math.PI * 2 / vert)
            )
        }
        displayContext.closePath()
        displayContext.stroke()
        if (devShowBounding) {
            displayContext.strokeStyle = 'lime'
            displayContext.lineWidth = shipHeight / 40
            displayContext.beginPath()
            displayContext.arc(x, y, r, 0, Math.PI * 2)
            displayContext.stroke()
        }

    }
}

function asteroidsUpdate() {
    for (let i = 0; i < asteroids.length; i++) {
        let a = asteroids[i]
        a.x += a.speedX
        a.y += a.speedY

        if (a.x < 0 - a.r) {
            a.x = display.width + a.r
        } else if (a.x > display.width + a.r) {
            a.x = a.r
        }

        if (a.y < 0 - a.r) {
            a.y = display.height + a.r
        } else if (a.y > display.height + a.r) {
            a.y = a.r
        }
        
        
        if( ship !== undefined ){
            if (ship.blinkNumber == 0 && ship.shipExplodeTime  == 0 ) {
                if (distanBTNObject(a.x, a.y, ship.x, ship.y) < a.r + ship.r) {
                    if (ship.shipExplodeTime > 0) {
                        ship.shipExplodeTime--
                        continue
                    }
                    shipExplode()
                    lives --
                    destroyAsteroid(i)
                    break
                }
            }
        }
    }

}

function shootLaser() {
    if (ship.canShoot && ship.lasers.length < laserMax) {
        ship.lasers.push({
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: laserSpeed * Math.cos(ship.a) / 60,
            yv: laserSpeed * Math.sin(ship.a) / 60,
            dist: 0,
            explodeTime: 0
        })
    }
}

function laserShow() {
    
    if( !ship ) return 
    for (let i = 0; i < ship.lasers.length; i++) {
        let l = ship.lasers[i]
        if (l.explodeTime == 0) {
            displayContext.fillStyle = 'salmon'
            displayContext.beginPath()
            displayContext.arc(l.x, l.y, shipHeight / 10, 0, 2 * Math.PI)
            displayContext.fill()
        } else {
            displayContext.fillStyle = 'red'
            displayContext.beginPath()
            displayContext.arc(l.x, l.y, shipHeight, 0, 2 * Math.PI)
            displayContext.fill()
            displayContext.fillStyle = 'orange'
            displayContext.beginPath()
            displayContext.arc(l.x, l.y, shipHeight / 1.2, 0, 2 * Math.PI)
            displayContext.fill()
            displayContext.fillStyle = 'yellow'
            displayContext.beginPath()
            displayContext.arc(l.x, l.y, shipHeight / 1.4, 0, 2 * Math.PI)
            displayContext.fill()
        }
    }
}

function laserUpdate() {
    if( ship == undefined ) return
    for (let i = 0; i < ship.lasers.length; i++) {
        let l = ship.lasers[i]

        if (l.explodeTime > 0) {
            l.explodeTime--
            if (l.explodeTime == 0) {
                ship.lasers.splice(i, 1)
                continue
            }
        } else {
            l.x += l.xv
            l.y -= l.yv
            l.dist += Math.sqrt(Math.pow(l.xv, 2) + Math.pow(l.yv, 2))
        }

        if (l.dist > laserDistan * display.width) {
            ship.lasers.splice(i, 1)
            continue
        }

        if (l.x < 0) {
            l.x = display.width
        } else if (l.x > display.width) {
            l.x = 0
        }

        if (l.y < 0) {
            l.y = display.height
        } else if (l.y > display.height) {
            l.y = 0
        }

        for (let j = 0; j < asteroids.length; j++) {
            let a = asteroids[j]
            if (l.explodeTime == 0 && distanBTNObject(a.x, a.y, l.x, l.y) < a.r) {
                destroyAsteroid(j)
                l.explodeTime = Math.floor(laserExplodeDuration * 60)
            }
        }
    }
}

function textShow() {
    if (textAlpha >= 0) {
        displayContext.textAlign = 'center'
        displayContext.font = textFont
        displayContext.fillStyle = `rgba( 255,255,255, ${textAlpha})`
        displayContext.fillText(text, display.width / 2, display.height * .75)
        
        textAlpha -= ( 1/ textFade / 60)
    } else if( ship == undefined ){
        newGame()
    }
}

function shipDraw( x, y, a, color = false){
    displayContext.strokeStyle = 'white'
    displayContext.fillStyle = 'green'
    displayContext.lineWidth = shipHeight / 20
    displayContext.beginPath()
    displayContext.moveTo(
        x + 4 / 3 * shipHeight/2 * Math.cos(a),
        y - 4 / 3 * shipHeight/2 * Math.sin(a)
    )
    displayContext.lineTo(
        x - shipHeight/2 * (2 / 3 * Math.cos(a) + Math.sin(a)),
        y + shipHeight/2 * (2 / 3 * Math.sin(a) - Math.cos(a))
    )
    displayContext.lineTo(
        x - shipHeight/2 * (2 / 3 * Math.cos(a) - Math.sin(a)),
        y + shipHeight/2 * (2 / 3 * Math.sin(a) + Math.cos(a))
    )
    if( color ){
        displayContext.fill()
    }
    displayContext.closePath()
    displayContext.stroke()
}

function livesDraw(){
    for( let i = 0; i < lives; i ++ ){
        shipDraw( shipHeight + shipHeight * i + shipHeight*i/4, shipHeight , Math.PI/2, true)
    }
}

function gameOver(){
    ship.date = true
    text = 'Game Over'
    textAlpha = 1
}

///////////////////////


document.addEventListener('keydown', event => {
    if( !ship ){
        return 
    }
    switch (event.keyCode) {
        case 32:
            shootLaser()
            break
        case 37:
            ship.rotation = trunSpeed / 180 * Math.PI / 60
            break
        case 38:
            ship.thrusting = true
            break
        case 39:
            ship.rotation = -trunSpeed / 180 * Math.PI / 60
            break
    }
})

document.addEventListener('keyup', event => {
    
    if( !ship ){
        return 
    }
    switch (event.keyCode) {
        case 32:
            ship.canShoot = true
            break
        case 37:
            ship.rotation = 0
            break
        case 38:
            ship.thrusting = false
            break
        case 39:
            ship.rotation = 0
            break
    }

})
