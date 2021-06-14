
function error (message) {
    alert(message);
}

function playSound(soundName) {
    //check if mobile or desktop

	//check if html5 audio will work
	if (typeof Audio != "undefined") {
		new Audio('sounds/'+soundName+'.wav').play() ;
	}
	else {
		error("no sound API to play: " + soundName);
	}
    
}

//drawString canvas function
CanvasRenderingContext2D.prototype.drawString=function(s, f, x, y){
    y=Math.round(y);
    var z=x=Math.round(x),t,i,j;
    if(!f.f){
        f.f=[t=0],i=0,j=f.w.length;
        while(++i<j)f.f[i]=t+=f.w[i-1]*zoom;
    }
    s=s.split(''),i=0,j=s.length;
    while(i<j)if((t=f.c.indexOf(s[i++]))>=0)
        this.drawImage(f,f.f[t],0,f.w[t]*zoom,f.height,x,y,f.w[t]*zoom,f.height),x+=f.w[t]*zoom;
    else if(s[i-1]=='\n')x=z,y+=f.h;
}

//adds a function to capitalize the first letter of a string
String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

//random chance
function chance (input) {
    if (Math.random() * input < 1)
        return true;
}

function getOffset(obj) {
    var offsetLeft = 0;
    var offsetTop = 0;
    do {
        if (!isNaN(obj.offsetLeft)) {
            offsetLeft += obj.offsetLeft;
        }
        if (!isNaN(obj.offsetTop)) {
            offsetTop += obj.offsetTop;
        }
    } while(obj = obj.offsetParent );
    return {left: offsetLeft, top: offsetTop};
}

//sorts an array of objects based on one of the properties
function sortByKey(array, key) {
//clone array to temp array
    var tempArray = array.slice(0);
    tempArray.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
    return tempArray;
}

var resize = function( img, scale ) {
// Takes an image and a scaling factor and returns the scaled image

// The original image is drawn into an offscreen canvas of the same size
// and copied, pixel by pixel into another offscreen canvas with the
// new size.

    var widthScaled = img.width * scale;
    var heightScaled = img.height * scale;

    var orig = document.createElement('canvas');
    orig.width = img.width;
    orig.height = img.height;
    var origCtx = orig.getContext('2d');
    origCtx.drawImage(img, 0, 0);
    var origPixels = origCtx.getImageData(0, 0, img.width, img.height);

    var scaled = document.createElement('canvas');
    scaled.width = widthScaled;
    scaled.height = heightScaled;
    var scaledCtx = scaled.getContext('2d');
    var scaledPixels = scaledCtx.getImageData( 0, 0, widthScaled, heightScaled );

    for( var y = 0; y < heightScaled; y++ ) {
        for( var x = 0; x < widthScaled; x++ ) {
            var index = (Math.floor(y / scale) * img.width + Math.floor(x / scale)) * 4;
            var indexScaled = (y * widthScaled + x) * 4;
            scaledPixels.data[ indexScaled ] = origPixels.data[ index ];
            scaledPixels.data[ indexScaled+1 ] = origPixels.data[ index+1 ];
            scaledPixels.data[ indexScaled+2 ] = origPixels.data[ index+2 ];
            scaledPixels.data[ indexScaled+3 ] = origPixels.data[ index+3 ];
        }
    }
    scaledCtx.putImageData( scaledPixels, 0, 0 );
    return scaled;
}

function init() {

    //basic variables
    tileSize = 16;
    room_width = 9;
    room_height = 9;
    currentScreen = 'title';
    bgColor = '#222';
    guiTopSize = 14;
    guiBottomSize = 75;
    margin = 4;
    buttonWidth = 44;
    buttonHeight = 30;
    gameWidth = room_width*tileSize;
    gameHeight = room_height*tileSize + guiTopSize + guiBottomSize + margin*2;
    windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    windowHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    guiPadding = 5;
    version = '1.0.0';
    groundTiles = [];
    blockInput = false;

    mobile = false;
    mobile = true;

    //identify canvas
    canvas = document.getElementById('main');
    context = canvas.getContext('2d');

    totalHeight = (guiPadding + guiTopSize + room_height * tileSize + margin * 2 + guiPadding * 2 + buttonHeight * 2);
	
    //center
    //center = Math.round(canvas.width / 2);
	console.log('cw',canvas.width)
    center = Math.floor(windowWidth / 2);
	
    if (mobile) {

        //set zoom equal to how many game heights we can fit in the window height
        zoom = Math.floor(windowHeight / totalHeight);

        //this offset tells you how many pixels over you need to move to be centered
        offset = center - gameWidth * zoom / 2;
        verticalOffset = Math.round((windowHeight - totalHeight * zoom) / 2);

        //resize canvas to fit zoom
        canvas.width = windowWidth;
        canvas.height = windowHeight;
    }
    else {


        //set zoom equal to how many game heights we can fit in the window height
        zoom = Math.floor(windowHeight*0.66 / totalHeight);

        //this offset tells you how many pixels over you need to move to be centered
        offset = zoom * 20;
        verticalOffset = Math.round(zoom*20);

        //resize canvas to fit zoom
        canvas.width = (gameWidth+40)*zoom;
        canvas.height = (gameHeight+40)*zoom;
    }

    console.log({zoom: zoom, offset: offset, verticalOffset: verticalOffset, canvasWidth: canvas.width, canvasHeight: canvas.height, center: center, totalHeight: totalHeight})



    //player object
    player = {
        x: 5,
        y: 4,
    }

    //gui variables

    guiOffset = (guiPadding + guiTopSize + room_height * tileSize + margin*2) * zoom;
    guiOffset2 = guiOffset + (guiPadding + buttonHeight) * zoom;

    //all button info
    button = {
        left: {
            x: offset,
            right: offset+buttonWidth*zoom,
            y: guiOffset2+verticalOffset,
            bottom: guiOffset2 + buttonHeight*zoom+verticalOffset,
        },
        right: {
            x: offset + (gameWidth-buttonWidth)*zoom,
            right: offset + (gameWidth)*zoom,
            y: guiOffset2+verticalOffset,
            bottom: guiOffset2 + buttonHeight*zoom+verticalOffset,
        },
        up: {
            x: center-buttonWidth/2*zoom,
            right: center+buttonWidth/2*zoom,
            y: guiOffset+verticalOffset,
            bottom: guiOffset + buttonHeight*zoom+verticalOffset,
        },
        down: {
            x: center-buttonWidth/2*zoom,
            right: center+buttonWidth/2*zoom,
            y: guiOffset2+verticalOffset,
            bottom: guiOffset2 + buttonHeight*zoom+verticalOffset,
        },
        teleport: {
            x: offset,
            right: offset+buttonWidth*zoom,
            y: guiOffset+verticalOffset,
            bottom: guiOffset + buttonHeight*zoom+verticalOffset,
        },
        bomb: {
            x: offset + (gameWidth-buttonWidth)*zoom,
            right: offset + (gameWidth)*zoom,
            y: guiOffset+verticalOffset,
            bottom: guiOffset + buttonHeight*zoom+verticalOffset,
        },
        play: {
            x: center-32*zoom,
            right: center+32*zoom,
            y: 132*zoom+verticalOffset,
            bottom: 164*zoom+verticalOffset,
        },
        bottomLeft: {
            x: offset+4*zoom,
            right: offset+68*zoom,
            y: canvas.height-36*zoom-verticalOffset ,
            bottom: canvas.height-4*zoom-verticalOffset ,
        },
        bottomRight: {
            x: canvas.width-offset-68*zoom,
            right: canvas.width-offset-4*zoom,
            y: canvas.height-36*zoom-verticalOffset ,
            bottom: canvas.height-4*zoom-verticalOffset ,
        },
        bottomCenter: {
            x: center-32*zoom,
            right: center+32*zoom,
            y: canvas.height-36*zoom-verticalOffset ,
            bottom: canvas.height-4*zoom-verticalOffset ,
        },
        website: {
            x: center-40*zoom,
            right: center+40*zoom,
            y: 100*zoom+verticalOffset ,
            bottom: 130*zoom+verticalOffset ,
        },
        twitter: {
            x: center-40*zoom,
            right: center+40*zoom,
            y: 150*zoom+verticalOffset ,
            bottom: 180*zoom+verticalOffset ,
        },
    }

    console.log()

    //if the user has not played the game before
    if (!window.localStorage.getItem("playedBefore")) {

        //if the high score variable hasn't been set yet, set it to 0
        if (!window.localStorage.getItem("highscore"))
            window.localStorage.setItem("highscore", 0);
    }


    //add first time function here
    //set variable firstTime
    //send analytics to server with ip/uuid/model/version number

    //array of robots, objects, tiles
    robots=[], objects=[], tileGraphics = [];

    loadImg();
    addListeners();

};

function openLink (url) {
    if (mobile)
        navigator.app.loadUrl(url, {openExternal: true});
    else
        window.open(url);
    //window.open('http://samkeddy.com', '_system', 'location=yes');
}

function addListeners() {

    //add listener for touch
    canvas.addEventListener("click", function (event) {
        var x, y;

        //assign x and y
        if (event.x != undefined && event.y != undefined) {
            x = event.x;
            y = event.y;
        }
        else // Firefox method to get the position
        {
            x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        //offset the coordinates by the position of the canvas
        x -= getOffset(canvas).left;
        y -= getOffset(canvas).top;

        //do something based on what screen we're on
        switch (currentScreen) {

            case 'ingame':
                //clicked within game area
                if (y > guiTopSize * zoom && y < (guiTopSize + room_height * tileSize) * zoom) {
                    input('wait');
                }
                //clicked left button
                else if (x > button.left.x && x < button.left.right && y > button.left.y && y < button.left.bottom ) {
                    input('left');
                }
                //clicked right button
                else if (x > button.right.x && x < button.right.right && y > button.right.y && y < button.right.bottom ) {
                    input('right');
                }
                //clicked up button
                else if (x > button.up.x && x < button.up.right && y > button.up.y && y < button.up.bottom ) {
                    input('up');
                }
                //clicked down button
                else if (x > button.down.x && x < button.down.right && y > button.down.y && y < button.down.bottom ) {
                    input('down');
                }
                //clicked teleport button
                else if (x > button.teleport.x && x < button.teleport.right && y > button.teleport.y && y < button.teleport.bottom ) {
                    input('teleport');
                }
                //clicked bomb button
                else if (x > button.bomb.x && x < button.bomb.right && y > button.bomb.y && y < button.bomb.bottom ) {
                    input('bomb');
                }
                break;
            case 'win':
                level += 1;
                startLevel(level);
                break;
            case 'lose':
                //clicked back button
                if (x > button.bottomLeft.x && x < button.bottomLeft.right && y > button.bottomLeft.y && y < button.bottomLeft.bottom ) {
                    currentScreen = 'title';
                    drawMap();
                    playSound('select');
                }
                //clicked play game button
                else if (x > button.bottomRight.x && x < button.bottomRight.right && y > button.bottomRight.y && y < button.bottomRight.bottom ) {
                    newGame();
                }
                break;
            case 'title':

                //clicked play game button
                if (x > button.play.x && x < button.play.right && y > button.play.y && y < button.play.bottom ) {
                    if (!window.localStorage.getItem("readTutorialOnce")) {
                        window.localStorage.setItem("readTutorialOnce", true);
                        tutorialPage=1;
                        currentScreen = 'tutorial';
                        tutorialFrame = 0;
                        tutorialFrameTimer = setInterval(function(){ tutorialFrame = (tutorialFrame == 0 ? 1 : 0);drawMap(); }, 1000);
                        drawMap();
                        playSound('select');
                    }
                    else
                        newGame();
                }
                //clicked how to play button
                else if (x > button.bottomLeft.x && x < button.bottomLeft.right && y > button.bottomLeft.y && y < button.bottomLeft.bottom ) {
                    window.localStorage.setItem("readTutorialOnce", true);
                    tutorialPage=1;
                    currentScreen = 'tutorial';
                    tutorialFrame = 0;
                    tutorialFrameTimer = setInterval(function(){ tutorialFrame = (tutorialFrame == 0 ? 1 : 0); drawMap(); }, 1000);
                    drawMap();
                    playSound('select');
                }
                //clicked about button
                else if (x > button.bottomRight.x && x < button.bottomRight.right && y > button.bottomRight.y && y < button.bottomRight.bottom ) {
                    currentScreen = 'about';
                    drawMap();
                    playSound('select');
                }
                break;
            case 'about':
                //clicked website button
                if (x > button.website.x && x < button.website.right && y > button.website.y && y < button.website.bottom ) {
                    openLink('http://samkeddy.com/');
                }
                //clicked twitter button
                else if (x > button.twitter.x && x < button.twitter.right && y > button.twitter.y && y < button.twitter.bottom ) {
                    openLink('https://twitter.com/skeddles/');
                }
                //clicked back button
                else if (x > button.bottomLeft.x && x < button.bottomLeft.right && y > button.bottomLeft.y && y < button.bottomLeft.bottom ) {
                    currentScreen = 'title';
                    drawMap();
                    playSound('select');
                }
                break;
            case 'tutorial':
                //clicked back button
                if (x > button.bottomLeft.x && x < button.bottomLeft.right && y > button.bottomLeft.y && y < button.bottomLeft.bottom ) {
                    if (tutorialPage == 1) {
                        currentScreen = 'title';
                        clearTimeout(tutorialFrameTimer);
                        drawMap();

                    }
                    else if (tutorialPage == 2) {
                        tutorialPage = 1;
                        tutorialFrame = 0;
                        drawMap();
                    }
                    else {
                        tutorialPage = 2;
                        tutorialFrame = 0;
                        drawMap();
                    }
                    playSound('select');
                }
                //clicked play game button
                else if (x > button.bottomRight.x && x < button.bottomRight.right && y > button.bottomRight.y && y < button.bottomRight.bottom ) {
                    if (tutorialPage == 1) {
                        tutorialPage = 2;
                        tutorialFrame = 0;
                        drawMap();
                        playSound('select');
                    }
                    else if (tutorialPage == 2) {
                        tutorialPage = 3;
                        tutorialFrame = 0;
                        drawMap();
                        playSound('select');
                    }
                    else {
                        clearTimeout(tutorialFrameTimer);
                        newGame();
                    }

                }
                break;

        }
    });

//add listener for key strokes
    addEventListener("keyup", function(e) {
        console.log(currentScreen)
        switch (currentScreen) {
            case 'ingame':
                console.log(e)
                switch (e.keyCode) {
                    //left, a
                    case 37:
                    case 65:
                        input('left');
                        break;
                    //right, d
                    case 39:
                    case 68:
                        input('right');
                        break;
                    //up, w
                    case 38:
                    case 87:
                        input('up');
                        break;
                    //down, s
                    case 40:
                    case 83:
                        input('down');
                        break;
                    //r (restart)
                    case 82:
                        newGame();
                        break;
                    //b (bomb)
                    case 66:
                        input('bomb');
                        break;
                    //space, t (teleport)
                    case 32:
                    case 84:
                        input('teleport');
                        break;
                    //enter (stay)
                    case 13:
                        input('wait');
                        break;
                }
                break;
            case 'win':
                level += 1;
                startLevel(level);
                break;
            case 'lose':
                newGame();
                break;
        }
    });

}

function loadImg() {


//Define small skinny font
    smallskinny12=new Image();
    smallskinny12.src='images/font_smallskinny12.png';

//array of all sprites
    sprites = [
        'images/player.png',
        'images/robot.png',
        'images/explosion.png',
        'images/button-left.png',
        'images/button-right.png',
        'images/button-up.png',
        'images/button-down.png',
        'images/button-teleport.png',
        'images/button-bomb.png',
        'images/frame.png',
        'images/frame.png', //10
        'images/title-text.png',
        'images/button.png',
        'images/button-big-left.png',
        'images/button-big-right.png',
        'images/rubble1.png',
        'images/rubble2.png',
        'images/rubble3.png',
        'images/rubble4.png',
        'images/ground.png', //19
        'images/tutorial_1_1.png', //20
        'images/tutorial_1_2.png',
        'images/tutorial_2_1.png',
        'images/tutorial_2_2.png',
        'images/tutorial_3_1.png',
        'images/tutorial_3_2.png',
        'images/about.png', //26
        'images/button-website.png',
        'images/button-twitter.png',
    ];

    var    tileGraphicsLoaded = 0;

    for (var i = 0; i < sprites.length; i++) {
        tileGraphics[i] = new Image();
        tileGraphics[i].src = sprites[i];
        tileGraphics[i].onload = function() {


// Once the image is loaded increment the loaded graphics count and check if all images are ready.
            tileGraphicsLoaded++;
            if (tileGraphicsLoaded === sprites.length) {

                smallskinny12 = resize(smallskinny12, zoom);
                smallskinny12.c='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789!@#$%^&*()-=[]\\;\',./_+{}|:"<>?`~';
                smallskinny12.w=[5,5,4,5,5,4,5,5,2,3,5,2,6,5,5,5,5,4,5,3,5,6,6,6,5,4,5,5,5,5,4,4,5,5,4,5,5,4,6,6,5,5,5,5,5,6,5,6,6,6,6,6,2,5,4,5,5,5,5,5,5,5,5,2,8,6,6,8,6,6,4,3,3,5,5,4,4,4,3,2,3,2,4,5,6,5,5,2,2,4,5,5,5,3,5];
                smallskinny12.h=84;

//resize the images to fit zoom
                for (var i = 0; i < tileGraphics.length; i++) {
                    tileGraphics[i] = resize(tileGraphics[i], zoom);
                }
                drawMap();
//newGame();
            }
        }
    }

}

function drawMap() {

    switch (currentScreen) {
        case 'ingame':
            var drawTile;

            // Clear the  canvas
            context.fillStyle = bgColor;
            context.fillRect(0,0,windowWidth,windowHeight);

            //draw bg
            context.fillStyle = '#ccc';
            context.fillRect(offset,(guiTopSize*zoom)+verticalOffset,room_width*tileSize*zoom,(room_height*tileSize+margin*2)*zoom);

            //textures
            for (var i = 0; i < room_width+1; i++) {
                for (var j = 0; j < room_height+1; j++) {
                    context.drawImage(
                        tileGraphics[19],
                        groundTiles[i][j] * tileSize * zoom,
                        0,
                        16*zoom,
                        16*zoom,
                        offset + (i * tileSize - tileSize/2 + 1) * zoom,
                        (j * tileSize + guiTopSize + margin - tileSize/4)*zoom+verticalOffset,
                        16*zoom,
                        16*zoom
                    );
                }
            }

            //draw player
            context.drawImage(tileGraphics[0], offset + (player.x * tileSize) * zoom, player.y * tileSize * zoom + (guiTopSize+margin)*zoom +verticalOffset);

            //draw all robots by looping through the robot array
            for (var i = 0; i < robots.length; i++) {
                context.drawImage(tileGraphics[1], offset + (robots[i].x * tileSize) * zoom, robots[i].y * tileSize * zoom + (guiTopSize+margin)*zoom+verticalOffset);
            }

            //reorder objects array by their y coordinate to show depth
            sortedObjects = sortByKey(objects,'y');


            //draw all objects by looping through the object array
            for (var i = 0; i < sortedObjects.length; i++) {
                context.drawImage(tileGraphics[sortedObjects[i].type], offset + (sortedObjects[i].x * tileSize + sortedObjects[i].xOffset) * zoom, sortedObjects[i].y * tileSize * zoom + (guiTopSize+margin + sortedObjects[i].yOffset)*zoom+verticalOffset);
            }

            //draw frame
            context.drawImage(tileGraphics[9], offset-(tileSize-1)*zoom, (guiTopSize-tileSize)*zoom +verticalOffset);

            //draw gui
            //top gui
            context.drawString('Score: '+score, smallskinny12,  offset + 5*zoom, 2*zoom+verticalOffset);
            //draw level, move it 5 pixels left if it's greater than 9
            if (level < 11)
                context.drawString('Level: '+(level-1), smallskinny12,  offset + 110*zoom, 2*zoom+verticalOffset);
            else
                context.drawString('Level: '+(level-1), smallskinny12,  offset + 105*zoom, 2*zoom+verticalOffset);


            //left
            context.drawImage(tileGraphics[3], button.left.x, button.left.y);
            //right
            context.drawImage(tileGraphics[4], button.right.x, button.right.y);
            //up
            context.drawImage(tileGraphics[5], button.up.x, button.up.y);
            //down
            context.drawImage(tileGraphics[6], button.down.x, button.down.y);

            //teleport
            context.drawImage(tileGraphics[7], button.teleport.x, button.teleport.y);
            context.drawString(teleports.toString(), smallskinny12,  button.teleport.x + 32*zoom, button.teleport.y+18*zoom);

            //bombs
            context.drawImage(tileGraphics[8], button.bomb.x, button.bomb.y );
            context.drawString(bombs.toString(), smallskinny12,   button.bomb.x + 32*zoom, button.bomb.y+18*zoom );
            break;
        case 'win':
            context.fillStyle = bgColor;
            context.fillRect(0,0,windowWidth,windowHeight);
            context.drawString('You escaped the robots on level '+(level-1)+'! ', smallskinny12,  offset+3*zoom, 70*zoom );
            context.drawString('Tap anywhere to continue. ', smallskinny12,  offset+15*zoom, 120*zoom );
            break;
        case 'lose':
            context.fillStyle = bgColor;
            context.fillRect(0,0,windowWidth,windowHeight);
            context.drawString('The robots won. All hope is lost.', smallskinny12,  offset+10*zoom, 70*zoom);
            context.drawString('Your score: '+score.toString(), smallskinny12,  offset+45*zoom, 90*zoom);
            context.drawString('High score: '+window.localStorage.getItem("highscore"), smallskinny12,  offset+45*zoom, 110*zoom);
            //back button
            context.drawImage(tileGraphics[13],button.bottomLeft.x, button.bottomLeft.y);
            context.drawString('back', smallskinny12,  button.bottomLeft.x+26*zoom, button.bottomLeft.y + 9*zoom );
            //play game button
            context.drawImage(tileGraphics[14],button.bottomRight.x, button.bottomRight.y);
            context.drawString('play again', smallskinny12,  button.bottomRight.x+10*zoom, button.bottomRight.y + 9*zoom );

            break;
        case 'title':
            context.fillStyle = bgColor;
            context.fillRect(0,0,windowWidth,windowHeight);
            context.drawImage(tileGraphics[11],offset, 10*zoom+verticalOffset);

            //play game button
            context.drawImage(tileGraphics[14],button.play.x, button.play.y);
            context.drawString('play game', smallskinny12,  button.play.x+9*zoom, button.play.y + 9*zoom);

            //draw high score if it's greater than 0
            if (window.localStorage.getItem("highscore") > 0)
                context.drawString('High score: '+window.localStorage.getItem("highscore"),smallskinny12, button.play.x+2*zoom, button.play.y + 48*zoom);

            //how to play button
            context.drawImage(tileGraphics[12],button.bottomLeft.x, button.bottomLeft.y);
            context.drawString('how to play', smallskinny12,  button.bottomLeft.x+10*zoom, button.bottomLeft.y + 9*zoom);

            //about button
            context.drawImage(tileGraphics[12],button.bottomRight.x, button.bottomRight.y);
            context.drawString('about', smallskinny12,  button.bottomRight.x+20*zoom, button.bottomRight.y + 9*zoom);

            //if this is the users first time playing
            //we do this here instead of init so that we can take a screenshot
            if (window.localStorage.getItem("loggedFirstTime")) {

                xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                    if (xhttp.readyState == 4 && xhttp.status == 200) {
                        if (xhttp.responseText == 'success') {
                            window.localStorage.setItem("loggedFirstTime",true);
                        }
                    }
                };
                xhttp.open("POST", "http://samkeddy.com/log/kra-firsttime.php", true);
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp.send('model='+device.model +
                    '&cordova='+device.cordova +
                    '&platform='+device.platform +
                    '&uuid='+device.uuid +
                    '&androidversion='+device.version +
                    '&width='+windowWidth +
                    '&height='+windowHeight +
                    '&zoom='+zoom +
                    '&gameversion='+version +
                    '&screenshot='+canvas.toDataURL()
                );
            }

            break;
        case 'tutorial':
            context.fillStyle = bgColor;
            context.fillRect(0,0,windowWidth,windowHeight);

            if (tutorialPage == 1) {
                //drawTut
                context.drawImage(tileGraphics[20+tutorialFrame],offset, 10*zoom+verticalOffset);

                //back button
                context.drawImage(tileGraphics[13],button.bottomLeft.x, button.bottomLeft.y);
                context.drawString('back', smallskinny12,  button.bottomLeft.x+26*zoom, button.bottomLeft.y + 9*zoom );
                //play game button
                context.drawImage(tileGraphics[14],button.bottomRight.x, button.bottomRight.y);
                context.drawString('next', smallskinny12,  button.bottomRight.x+20*zoom, button.bottomRight.y + 9*zoom );
            }
            else if (tutorialPage == 2) {
                //drawTut
                context.drawImage(tileGraphics[22+tutorialFrame],offset, 10*zoom+verticalOffset);

                //back button
                context.drawImage(tileGraphics[13],button.bottomLeft.x, button.bottomLeft.y);
                context.drawString('back', smallskinny12,  button.bottomLeft.x+26*zoom, button.bottomLeft.y + 9*zoom );
                //play game button
                context.drawImage(tileGraphics[14],button.bottomRight.x, button.bottomRight.y);
                context.drawString('next', smallskinny12,  button.bottomRight.x+20*zoom, button.bottomRight.y + 9*zoom );
            }
            else if (tutorialPage == 3) {
                //drawTut
                context.drawImage(tileGraphics[24+tutorialFrame],offset, 10*zoom+verticalOffset);

                //back button
                context.drawImage(tileGraphics[13],button.bottomLeft.x, button.bottomLeft.y);
                context.drawString('back', smallskinny12,  button.bottomLeft.x+26*zoom, button.bottomLeft.y + 9*zoom );
                //play game button
                context.drawImage(tileGraphics[14],button.bottomRight.x, button.bottomRight.y);
                context.drawString('play game', smallskinny12,  button.bottomRight.x+10*zoom, button.bottomRight.y + 9*zoom );
            }

            break;
        case 'about':
            context.fillStyle = bgColor;
            context.fillRect(0,0,windowWidth,windowHeight);
            context.drawString('about', smallskinny12,  button.play.x+13*zoom, button.play.y + 9*zoom );

            //info text
            context.drawImage(tileGraphics[26],offset, 10*zoom+verticalOffset);

            //buttons
            context.drawImage(tileGraphics[27],button.website.x, button.website.y);
            context.drawImage(tileGraphics[28],button.twitter.x, button.twitter.y);

            //version number
            context.drawString('version '+version, smallskinny12, center +10*zoom , verticalOffset+220*zoom );

            //back button
            context.drawImage(tileGraphics[13],button.bottomLeft.x, button.bottomLeft.y);
            context.drawString('back', smallskinny12,  button.bottomLeft.x+26*zoom, button.bottomLeft.y + 9*zoom );
            break;
    }


}

function spaceFree(x,y) {
    for (var i = objects.length - 1; i >= 0 ; i--) {
        if (objects[i].x == x && objects[i].y == y)
            return false;
    }

    return true;
}

function input(action) {
//stop input from being processed when it's no supposed to be
    if (blockInput) return;

    switch (action) {

//left
        case 'left':
            if (player.x > 0 && spaceFree(player.x-1,player.y)) {
                player.x--;
                move();
            }
            break;
//right
        case 'right':
            if (player.x < room_width-1 && spaceFree(player.x+1,player.y)) {
                player.x++;
                move();
            }
            break;
//up
        case 'up':
            if (player.y > 0 && spaceFree(player.x,player.y-1)) {
                player.y--;
                move();
            }
            break;
//down
        case 'down':
            if (player.y < room_height-1 && spaceFree(player.x,player.y+1)) {
                player.y++;
                move();
            }
            break;
//r (restart)
        case 'restart':
            newGame();
            break;
//b (bomb)
        case 'bomb':
            if (bombs > 0) {
                bombs--;
                function destroyRobot(i) {
                    var newRubble = objects.push({type: 2, x: robots[i].x, y: robots[i].y, solid: true, xOffset: -2, yOffset: -6}) -1;
                    console.log('bomb start exploding: ' + newRubble);
                    console.log(objects);
                    setTimeout(function (rubbleId) {
                        console.log('bomb stop exploding: ' + rubbleId);
                        objects[rubbleId].type = Math.floor((Math.random() * 4) + 15);
                        objects[rubbleId].xOffset = 0;
                        objects[rubbleId].yOffset = 0;
                        drawMap();
                    }, 500, newRubble);
                    robots.splice(i,1);
                    score+=10;
                }
//check for any robots around player
                for (var i = robots.length - 1; i >= 0 ; i--) {
                    if (robots.length > 0 && robots[i].x == player.x - 1 && robots[i].y == player.y + 1) {destroyRobot(i); continue;} //left down
                    if (robots.length > 0 && robots[i].x == player.x - 1 && robots[i].y == player.y) {destroyRobot(i); continue;} //left
                    if (robots.length > 0 && robots[i].x == player.x - 1 && robots[i].y == player.y - 1) {destroyRobot(i); continue;} //left up
                    if (robots.length > 0 && robots[i].x == player.x && robots[i].y == player.y - 1) {destroyRobot(i); continue;}//up
                    if (robots.length > 0 && robots[i].x == player.x + 1 && robots[i].y == player.y - 1) {destroyRobot(i); continue;}//right up
                    if (robots.length > 0 && robots[i].x == player.x + 1 && robots[i].y == player.y) {destroyRobot(i); continue;} //right
                    if (robots.length > 0 && robots[i].x == player.x + 1 && robots[i].y == player.y + 1) {destroyRobot(i); continue;} //right down
                    if (robots.length > 0 && robots[i].x == player.x && robots[i].y == player.y + 1) {destroyRobot(i); continue;} //down
                }
                move(true);
            }

            break;
//space (teleport)
        case 'teleport':
            if (teleports > 0) {
                teleports--;
                var teleportCoordinates = emptySpace();
                player.x = teleportCoordinates.x;
                player.y = teleportCoordinates.y;
                playSound('teleport');
                drawMap();
            }
            break;
//enter
        case 'wait':
            move();
            break;
    }
}

function move(explosion) {

//if explosion is not set, set it to false
    explosion = explosion || false;

//increment moves, decrement score
    moves += 1;
    if (score > 0)
        score --;

//move all robots
    for (var i = 0; i < robots.length; i++) {
//keep track of which direction is the closest, and what the distance is
        var shortest, direction;

//default (no move, player will be hit)
        shortest = distanceFromPlayer(robots[i].x,robots[i].y);
        direction = 'none';

//left
        if (distanceFromPlayer(robots[i].x-1,robots[i].y) < shortest) {
            shortest = distanceFromPlayer(robots[i].x-1,robots[i].y);
            direction = 'left';
        }

//left+up
        if (distanceFromPlayer(robots[i].x-1,robots[i].y-1) < shortest) {
            shortest = distanceFromPlayer(robots[i].x-1,robots[i].y-1);
            direction = 'left-up';
        }

//up
        if (distanceFromPlayer(robots[i].x,robots[i].y-1) < shortest) {
            shortest = distanceFromPlayer(robots[i].x,robots[i].y-1);
            direction = 'up';
        }

//right-up
        if (distanceFromPlayer(robots[i].x+1,robots[i].y-1) < shortest) {
            shortest = distanceFromPlayer(robots[i].x+1,robots[i].y-1);
            direction = 'right-up';
        }

//right
        if (distanceFromPlayer(robots[i].x+1,robots[i].y) < shortest) {
            shortest = distanceFromPlayer(robots[i].x+1,robots[i].y);
            direction = 'right';
        }

//right-down
        if (distanceFromPlayer(robots[i].x+1,robots[i].y+1) < shortest) {
            shortest = distanceFromPlayer(robots[i].x+1,robots[i].y+1);
            direction = 'right-down';
        }

//down
        if (distanceFromPlayer(robots[i].x,robots[i].y+1) < shortest) {
            shortest = distanceFromPlayer(robots[i].x,robots[i].y+1);
            direction = 'down';
        }

//left-down
        if (distanceFromPlayer(robots[i].x-1,robots[i].y+1) < shortest) {
            shortest = distanceFromPlayer(robots[i].x-1,robots[i].y+1);
            direction = 'left-down';
        }

//move the robot
        switch (direction) {
            case 'left':
                robots[i].x--;
                break;
            case 'left-up':
                robots[i].x--;
                robots[i].y--;
                break;
            case 'up':
                robots[i].y--;
                break;
            case 'right-up':
                robots[i].x++;
                robots[i].y--;
                break;
            case 'right':
                robots[i].x++;
                break;
            case 'right-down':
                robots[i].x++;
                robots[i].y++;
                break;
            case 'down':
                robots[i].y++;
                break;
            case 'left-down':
                robots[i].x--;
                robots[i].y++;
                break;
        }
    }

//check for player death
//by looping through all robots and comparing their coordinates to the players
    for (var i = 0; i < robots.length; i++) {
        if (robots[i].x == player.x && robots[i].y == player.y) {
            gameOver(score);
            return;
        }
    }



//check all robots for collisions with objects
    checkRobots:
        for (var i = robots.length - 1; i >= 0 ; i--) {

//check objects
            for (var j = 0; j < objects.length; j++) {
//only check solid objects
                if (objects[j].solid == true) {
//check for matching coordinates
                    if (robots[i].x == objects[j].x && robots[i].y == objects[j].y) {
                        score+=10;
                        robots.splice(i, 1);

//change to an explosion temporarily
                        objects[j].type = 2;
                        objects[j].xOffset = -2;
                        objects[j].yOffset = -6;

                        explosion=true;
                        console.log('rubble start exploding: ' + j);
                        setTimeout(function (explosionId) {
                            console.log('rubble stop exploding: ' + explosionId);
                            objects[explosionId].type = Math.floor((Math.random() * 4) + 15);
                            objects[explosionId].xOffset = 0;
                            objects[explosionId].yOffset = 0;
                            drawMap();
                        }, 500, j);

                        continue checkRobots;
                    }
                }
            }
        }

    //check for robot collision
    checkRobot:
        for (var i = robots.length - 1; i >= 0 ; i--) {

            //loop through other robots
            for (var j = robots.length - 1; j >= 0 ; j--) {
                //no need to compare a robot to itself, so skip it
                if (!robots[i] || i == j) continue;

                //if their coordinates match
                if (robots[i].x == robots[j].x && robots[i].y == robots[j].y) {

                    var destroyX = robots[i].x;
                    var destroyY = robots[i].y;

                    //loop through robots and destroy any whose coordinates match these (just in case more than just these 2 collide)
                    for (var k = robots.length - 1; k >= 0 ; k--) {

                        if (destroyX == robots[k].x && destroyY == robots[k].y) {
                            robots.splice(k, 1);
                            score+=10;
                        }

                    }

                    explosion=true;

                    //add a rubble object
                    var newRubble = objects.push({type: 2, x: destroyX, y: destroyY, solid: true, xOffset: -2, yOffset: -6}) -1;
                    console.log('collision start exploding: ' + newRubble);
                    setTimeout(function (rubbleId) {
                        console.log('collision stop exploding: ' + rubbleId);
                        objects[rubbleId].type = Math.floor((Math.random() * 4) + 15);
                        objects[rubbleId].xOffset = 0;
                        objects[rubbleId].yOffset = 0;
                        drawMap();
                    }, 500, newRubble);
                    continue checkRobot;
                }
            }

        }
//check for win
    if (robots.length == 0) {
        blockInput = true;
        setTimeout(function() {
            if (level<=79)
                currentScreen='win';
            else
                currentScreen='lose';
            playSound('win');
            drawMap();
            blockInput = false;
        }, 1200);
    }

    if (explosion)
        playSound('explosion');
    else
        playSound('move');

    drawMap();
}

function emptySpace() {
    var x, y, found=false;

    //check an empty space
    tryspace:
        do {
            //try a random coordinate
            x = Math.floor(Math.random() * room_width);
            y = Math.floor(Math.random() * room_height);

            //make sure it's not the players coordinate
            if (x == player.x && y == player.y)
                continue tryspace;

            //make sure it's not any robot's coordinate
            for (var i = 0; i < robots.length; i++) {
                if (x == robots[i].x && y == robots[i].y)
                    continue tryspace;
            }
            //make sure it's not any object's coordinate
            for (var i = 0; i < objects.length; i++) {
                if (x == objects[i].x && y == objects[i].y)
                    continue tryspace;
            }
            //if it reached this point, then nothing is in that square
            found = true;
        }
        while (found != true);

    return {x: x, y: y};
}

function distanceFromPlayer (x,y) {
    return Math.sqrt(Math.pow((x - player.x),2) + Math.pow(y - player.y,2));
}

function newGame() {
    playSound('start');

    score=0;
    teleports=1;
    bombs=1;
    startLevel(2);
}

function startLevel (numberOfRobots) {
    moves = 0;
    bombs+=1;
    teleports+=1;
    robots = [];
    objects = [];
    level = numberOfRobots;


    player = {
        x: Math.floor(Math.random() * room_width),
        y: Math.floor(Math.random() * room_height),
    }

    //for the number of requested robots, add a robot to the array with random coordinates
    for (var i = numberOfRobots; i>0; i--)
        robots.push(emptySpace());


    /*
     player = {x: 4, y:4}
     robots = [
     {x: 3, y:3},
     {x: 3, y:4},
     {x: 3, y:5},
     {x: 4, y:3},
     {x: 5, y:3},
     {x: 4, y:5},
     {x: 5, y:4},
     {x: 5, y:5},

     {x: 2, y:1},
     {x: 3, y:1},
     {x: 4, y:1},
     {x: 5, y:1},
     {x: 6, y:1},

     {x: 2, y:7},
     {x: 3, y:7},
     {x: 4, y:7},
     {x: 5, y:7},
     {x: 6, y:7},

     ];
     */
//randomize ground tiles
    for (var i = 0; i < room_height+1; i++) {
        var tempArray = [];
        for (var j = 0; j < room_width+1; j++) {
            tempArray.push(Math.floor(Math.random() * 49));
        }
        groundTiles.push(tempArray);
    }

//make sure we are going to display the in game screen
    currentScreen='ingame';

//draw map
    drawMap();
}

function gameOver (score) {
    if (score>window.localStorage.getItem("highscore"))
        window.localStorage.setItem("highscore", score);
    playSound('lose');
    currentScreen='lose';
    drawMap();

}




