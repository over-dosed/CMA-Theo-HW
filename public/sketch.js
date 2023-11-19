//------------------------------------------------
// Demo in which two mobile phones share p5.js "touches" 
// events (multi-touch finger positions).
// See https://p5js.org/reference/#/p5/touches
// This is sketch.js, a.k.a the client side.

var socket = io(); // the networking library
var clientData = {}; // stores this particular client's data
var serverData = {}; // stores other users' data from the server
var status = "unknown"; // or 'approve' or 'reject', depending on whether the server lets you in

// RGB color backgrounds for the two players
var colors = [[120,200,255],[255,120,180]]

//set a client human or animal; 0 = human ; 1 = hu-an-1 ； 2 = hu-an-2 ； 3 = animal ; 4 = an-hu-1 ; 5 = an-hu-2
var type = 0;

// test for load video


let dog_gif;
let dog_imgX = 100;
let dog_imgY = 220;

let finger_img;
// let finger_imgX = 100;
// let finger_imgY = 220;
let finger_imgX = 130;
let finger_imgY = 50;

// control gif duration
let gifDuration = 2100;
let startTime;
let gif_isPlaying = false;

// let typeParagraph

function preload() {
  // dog_statc = loadImage("https://cdn.glitch.global/3e2d5884-c269-4118-b3e6-258da1755a62/first_frame_dog.png?v=1700204809424");
  dog_gif = loadImage("https://cdn.glitch.global/3e2d5884-c269-4118-b3e6-258da1755a62/ezgif-4-gif_150.gif?v=1700206725955");
  finger_img = loadImage("https://cdn.glitch.global/3e2d5884-c269-4118-b3e6-258da1755a62/ezgif-2-b992d2fb14.jpg?v=1700213966104");
}

//------------------------------------------------
// The main p5.js setup
function setup() {
  createCanvas(windowWidth, windowHeight);
  
  dog_gif.filter(GRAY);
  dog_gif.pause();
  
}

//------------------------------------------------
// The main p5.js draw loop
//
function draw() {
  background (255);
  
  // dog_gif.play();
  // image(video, 0, 0);
  // stroke(255);
  // line(mouseX, mouseY, 0,0); 
  
  // 1. Handle problematic network statuses. Shouldn't happen often.
  if (status == "reject"){
    showMyErrorScreen("Sorry, room is full!\nPlease come back later...");
    return;
  } else if (status == "unknown"){
    showMyErrorScreen("Waiting for server to usher you...");
    return;
  }
  
  // test show type
  let textContent_above;
  textContent_above = "YOU ARE"
  textSize(50);
  fill("red");
  textAlign(LEFT);
  text(textContent_above, 80, 50); // 在画布上绘制文本
  
  let textContent_below;
  textSize(80);
  fill("black");
  textAlign(LEFT);
  if (type < 3) {
    textContent_below = "HUMAN";
    text(textContent_below, 50, 600); // 在画布上绘制文本
  } else {
    textContent_below = "DOG";
    text(textContent_below, 100, 600); // 在画布上绘制文本
  }
  
  
  
  
  // show dog gif and finger image
  image(dog_gif, dog_imgX, dog_imgY);
  image(finger_img, finger_imgX, finger_imgY);
  
  // 计算已经过的时间
  let elapsedTime = millis() - startTime;
  
  // 如果已经过了指定的时间，则暂停播放
  if (elapsedTime >= gifDuration && gif_isPlaying) {
    gif_isPlaying = false;
    dog_gif.pause();
  }
  
  
  // 2. Update touches data: 
  // Collect all the touches info and update this client's data.
  // Then send this client's data the server
  clientData.touches = touches;
  socket.emit('client-update', clientData);

  // 3. Fetch the other player's data. Since this demo only allows 
  // two players, we just grab the first item in the table. 
  // Use a loop to iterate serverData if you want more than
  // two players (check out sensors-chorus or sensors-rooms)
  let otherData = serverData[Object.keys(serverData)[0]];
  
  // 4. Draw the players' fingertips.
  // drawTouchesData(colors[0],otherData);
  // drawTouchesData(colors[1],clientData);
  
  // move images
  if (type < 3){
    drawforBoth(type, clientData);
  } else {
    drawforBoth(type, otherData);
  }
  
}

//------------------------------------------------
// Visualize "touches" (fingertips)
//
function drawTouchesData(color, data){
  if (!data || !data.touches){
    return;
  }
  
  for (var i = 0; i < data.touches.length; i++){
    // Note: The '...' below is the JavaScript ES6 "spread" syntax.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
    // Useful for handling a variable number of arguments.
    fill(...color);
    
    stroke(255);
    circle(data.touches[i].x,data.touches[i].y,90);
  }
}

function drawforBoth(type, data){
  if (!data || !data.touches){
    return;
  }
  
  for (var i = 0; i < data.touches.length; i++){
    
    dog_imgX = data.touches[i].x - 100;
    dog_imgY = data.touches[i].y - 100;
    finger_imgX = data.touches[i].x - 70;
    finger_imgY = data.touches[i].y - 270;
    
  }
  
  // if human, not display finger image
  if (type < 3){
    finger_imgX = -300;
    finger_imgY = -300;
  }
  
  
}

//------------------------------------------------
// Show an error screen if there's a network problem.
function showMyErrorScreen(msg){
  textSize(18);
  background(0);
  fill(255);
  noStroke();
  textAlign(CENTER);
  text(msg,width/2,height/2);
}

//------------------------------------------------
// These event handlers are used by p5.js. See, e.g.
// https://p5js.org/reference/#/p5/touchStarted, etc.
//
function touchStarted(){
  var fs = fullscreen();
  if (!fs) {
    /* 
      Uncomment the line below to put your app in fullscreen.
      Note, on some devices, being in fullscreen can make it 
      awkward to access useful things like the page-refresh button.
      Perhaps just use this for final documentation.
    */
    fullscreen(true); 
    // dog_gif.play();
  }
  return false;
}



function touchMoved(){
  return false;
}



function touchEnded() {
  
  // if (playGif){
  //   playGif = false;
  //   dog_gif.pause();
  // } else {
  //   playGif = true;
  //   dog_gif.play();
  // }
  
  if (type >= 3){
    playGif();
    changeType();
  }
  
  return false;
}

function playGif(){
  dog_gif.play();
  startTime = millis();
  gif_isPlaying = true;
  return false;
}

function changeType(){
  type = (type + 1) % 6;
  socket.emit('client-update-type', type);
  return false;
}

// prevents the mobile browser from processing some default
// touch events, like swiping left for "back" or scrolling the page.
document.ontouchmove = function(event) {
    event.preventDefault();
};

function windowResized() { //this detects when the window is resized, such as entering fullscreen mode, or changing orientation of the device.
  resizeCanvas(windowWidth, windowHeight); //resizes the canvas to the new dimensions 
}

//------------------------------------------------
// Event handlers for the Socket library. 
// You probably won't need to change these. 
//
socket.on('connection-approve-human', function(data){
  // Update status when server tells us when 
  // they approve our request to join a room
  status = "approve-human";
  type = 0;
})
socket.on('connection-approve-animal', function(data){
  // Update status when server tells us when 
  // they approve our request to join a room
  status = "approve-animal";
  type = 3;
})
socket.on('connection-reject', function(data){
  // Update status when server tells us when 
  // they reject our request to join a room
  status = "reject";
})
socket.on('server-update',function(data){
  // Update our copy of the other players' data
  // everytime the server sends us an update
  serverData = data;
})
socket.on('server-update-type',function(data){
  // Update our copy of the other players' data
  // everytime the server sends us an update
  type = data;
  playGif();
})

// It could happen that you might need to restart the server. 
// For example, if you encounter the “room is full” message while debugging.
// If you put the magic word “crash” in the url (like: http://myapp.glitch.me/?crash)
// then the client will send a message to server to tell it to crash and restart.
if (window.location.href.includes("crash")){
  alert("crash!")
  socket.emit("crash-the-server");
}


//================================================
// Don't delete these 'comments'; they are necessary to make p5.js work with Glitch.com.
// First of all, shut glitch up about p5's global namespace pollution using this magic comment:
/* global describe p5 setup draw P2D WEBGL ARROW CROSS HAND MOVE TEXT WAIT HALF_PI PI QUARTER_PI TAU TWO_PI DEGREES RADIANS DEG_TO_RAD RAD_TO_DEG CORNER CORNERS RADIUS RIGHT LEFT CENTER TOP BOTTOM BASELINE POINTS LINES LINE_STRIP LINE_LOOP TRIANGLES TRIANGLE_FAN TRIANGLE_STRIP QUADS QUAD_STRIP TESS CLOSE OPEN CHORD PIE PROJECT SQUARE ROUND BEVEL MITER RGB HSB HSL AUTO ALT BACKSPACE CONTROL DELETE DOWN_ARROW ENTER ESCAPE LEFT_ARROW OPTION RETURN RIGHT_ARROW SHIFT TAB UP_ARROW BLEND REMOVE ADD DARKEST LIGHTEST DIFFERENCE SUBTRACT EXCLUSION MULTIPLY SCREEN REPLACE OVERLAY HARD_LIGHT SOFT_LIGHT DODGE BURN THRESHOLD GRAY OPAQUE INVERT POSTERIZE DILATE ERODE BLUR NORMAL ITALIC BOLD BOLDITALIC LINEAR QUADRATIC BEZIER CURVE STROKE FILL TEXTURE IMMEDIATE IMAGE NEAREST REPEAT CLAMP MIRROR LANDSCAPE PORTRAIT GRID AXES frameCount deltaTime focused cursor frameRate getFrameRate setFrameRate noCursor displayWidth displayHeight windowWidth windowHeight width height fullscreen pixelDensity displayDensity getURL getURLPath getURLParams pushStyle popStyle popMatrix pushMatrix registerPromisePreload camera perspective ortho frustum createCamera setCamera setAttributes createCanvas resizeCanvas noCanvas createGraphics blendMode noLoop loop push pop redraw applyMatrix resetMatrix rotate rotateX rotateY rotateZ scale shearX shearY translate arc ellipse circle line point quad rect square triangle ellipseMode noSmooth rectMode smooth strokeCap strokeJoin strokeWeight bezier bezierDetail bezierPoint bezierTangent curve curveDetail curveTightness curvePoint curveTangent beginContour beginShape bezierVertex curveVertex endContour endShape quadraticVertex vertex alpha blue brightness color green hue lerpColor lightness red saturation background clear colorMode fill noFill noStroke stroke erase noErase createStringDict createNumberDict storeItem getItem clearStorage removeItem select selectAll removeElements createDiv createP createSpan createImg createA createSlider createButton createCheckbox createSelect createRadio createColorPicker createInput createFileInput createVideo createAudio VIDEO AUDIO createCapture createElement deviceOrientation accelerationX accelerationY accelerationZ pAccelerationX pAccelerationY pAccelerationZ rotationX rotationY rotationZ pRotationX pRotationY pRotationZ pRotateDirectionX pRotateDirectionY pRotateDirectionZ turnAxis setMoveThreshold setShakeThreshold isKeyPressed keyIsPressed key keyCode keyIsDown movedX movedY mouseX mouseY pmouseX pmouseY winMouseX winMouseY pwinMouseX pwinMouseY mouseButton mouseIsPressed requestPointerLock exitPointerLock touches createImage saveCanvas saveGif saveFrames loadImage image tint noTint imageMode pixels blend copy filter get loadPixels set updatePixels loadJSON loadStrings loadTable loadXML loadBytes httpGet httpPost httpDo createWriter save saveJSON saveJSONObject saveJSONArray saveStrings saveTable writeFile downloadFile abs ceil constrain dist exp floor lerp log mag map max min norm pow round sq sqrt fract createVector noise noiseDetail noiseSeed randomSeed random randomGaussian acos asin atan atan2 cos sin tan degrees radians angleMode textAlign textLeading textSize textStyle textWidth textAscent textDescent loadFont text textFont append arrayCopy concat reverse shorten shuffle sort splice subset float int str boolean byte char unchar hex unhex join match matchAll nf nfc nfp nfs split splitTokens trim day hour minute millis month second year plane box sphere cylinder cone ellipsoid torus orbitControl debugMode noDebugMode ambientLight specularColor directionalLight pointLight lights lightFalloff spotLight noLights loadModel model loadShader createShader shader resetShader normalMaterial texture textureMode textureWrap ambientMaterial emissiveMaterial specularMaterial shininess remove canvas drawingContext*/
// Also socket.io:
/* global describe io*/
// Now any other lint errors will be your own problem.