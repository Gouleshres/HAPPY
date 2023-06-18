let requiemLines;

let textBodies = [];
let engine;
let font;
let typeSize;

let windSlider;

function preload() {
  requiemLines = loadStrings('requiem.txt');
  font = loadFont('1.TTF');
}

function setup() {
  let canvas = createCanvas(1000/1.5, 1100/1.5);
  cursor(TEXT, 40, 40);
  textAlign(CENTER, BASELINE);
  textFont(font);
  typeSize = 30;
  
  //createSlider(min, max, [default value], [step])
  windSlider = createSlider(0, 7, 0, 0.5);
  
  engine = Matter.Engine.create();
  engine.world.gravity.y = 0;
  Matter.Runner.run(engine);
  
  for (let i = 0; i < requiemLines.length; i++) {
    let words = requiemLines[i].split(" ");
    let currentOffset = 0;
    let currentLetterOffset = 0;
    let prev = null;
    for (let j = 0; j < words.length; j++) {
      let wordWidth = textWidth(words[j]);
      let letters = words[j].split("");
      for (let k = 0; k < letters.length; k++) {
        let x = 70+currentLetterOffset+currentOffset;
        let y = 80+i*20;
        let letterWidth = textWidth(letters[k]);
        
        let bounds = font.textBounds(letters[k], x, y, typeSize);
        
        /*if (mouseIsPressed) {
          textBody = Matter.Bodies.rectangle(
            mouseX, 
            mouseY,
            letterWidth, bounds.h
          );
          textBody.restitution = 0.2;
          Matter.World.add(engine.world, textBody);

          textBodies.push(textBody);
        }*/
        
        textBody = Matter.Bodies.rectangle(
          x + letterWidth/2, 
          y,
          letterWidth, bounds.h
        );
        
        textBody.letterValue = letters[k];
        if (k == 0) {
          textBody.lineStart = true;
        } else {
          textBody.lineStart = false;
        }
        
        textBody.restitution = 0.8;
        Matter.World.add(engine.world, textBody);
        
        if (j == 0 && k == 0) {
          textBody.isStatic = true;
        } else if ((j == words.length - 1) && (k == letters.length - 1)) {
          textBody.isStatic = false;
        }

        textBodies.push(textBody);
        
        if (prev) {
          let constraint = Matter.Constraint.create({
            bodyA: prev,
            bodyB: textBody,
            stiffness: 0.3
          })  
          Matter.World.add(engine.world, constraint);
        }
        
        prev = textBody;
        
        currentLetterOffset += letterWidth + 1.75;
      }
      
      currentOffset += 3.75; 
      
    }
  }
  
  //Create boundaries
  let ground = Matter.Bodies.rectangle(width / 2, height+40, width*2, 100); 
  ground.isStatic = true;
  Matter.World.add(engine.world, ground);
  
  let ceiling = Matter.Bodies.rectangle(width / 2, -25, width*2, 100); 
  ground.isStatic = true;
  Matter.World.add(engine.world, ceiling);
  
  let wallLeft = Matter.Bodies.rectangle(-50, height/2, 100, height*2);
  wallLeft.isStatic = true;
  Matter.World.add(engine.world, wallLeft);
  
  let wallRight = Matter.Bodies.rectangle(width+50, height/2, 100, height*2);
  wallRight.isStatic = true;
  Matter.World.add(engine.world, wallRight);
  
  //Mouse interaction
  var canvasmouse = Matter.Mouse.create(canvas.elt);
  canvasmouse.pixelRatio = pixelDensity();
  var options = {
    mouse: canvasmouse
  }
  
  mConstraint = Matter.MouseConstraint.create(engine, options);
  Matter.World.add(engine.world, mConstraint);
}

function draw() {
  background(0);
  textSize(typeSize);
  fill(255);
  noStroke();

  wind = windSlider.value();
  engine.world.gravity.x = (wind)*noise(frameCount);
  engine.world.gravity.y = wind-(2*wind)*noise(frameCount+100000);
  
  for (let i = 0; i < textBodies.length; i++) {
    let textBody = textBodies[i];
    let prev;
    let v0;
        
    push();
    translate(textBody.position.x, textBody.position.y);
    
    if (textBody.lineStart == false) {
      prev = textBodies[i - 1];
      v0 = createVector(textBody.position.x - prev.position.x, textBody.position.y - prev.position.y);
      textBody.constraintAngle = v0.heading();
    } else {
      next = textBodies[i + 1];
      v0 = createVector(next.position.x - textBody.position.x, next.position.y - textBody.position.y);
      textBody.constraintAngle = v0.heading();
    }
    
    rotate(textBody.constraintAngle);
    
    text(textBody.letterValue, 0, 0);  
    pop();
  }

}