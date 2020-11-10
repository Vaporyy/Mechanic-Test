"use strict";
var canvasContainer = document.getElementById('play_area');
var offsetLeft, offsetTop;
var stageWidth, stageHeight;
var canvas = document.getElementById('element_area');
var ctx = canvas.getContext('2d');
var gravity = 1;
window.addEventListener('resize', resizeCanvas);
canvas  .addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mouseup', onMouseUp);
canvas.addEventListener('mouseleave', onMouseUp);
resizeCanvas();
var disks = [];
var disksNum = 20;
var isMouseDown = false;
var mouseX = 0, mouseY = 0;
var draggedDisk = null;
createAllDisks();
requestAnimationFrame(render);

function onMouseDown(event){
    isMouseDown = true;
   mouseX =  event.clientX - offsetLeft;
   mouseY = event.clientY - offsetTop;

}
function onMouseUp(){
    isMouseDown = false;
    canvas.removeEventListener('mousemove', onDragDisk);
    draggedDisk = null;
}
function onDragDisk(event){
    mouseX = event.clientX - offsetLeft;
    mouseY = event.clientY - offsetTop;
}
function render() {
    // handle input
    manageInput();
    // update positions
    updateAllDisks();
    // resolve collisions
    checkAllCollisions();
    // draw
    ctx.clearRect(0, 0, stageWidth, stageHeight);
    drawAllDisks();
    requestAnimationFrame(render);
}
function checkAllCollisions(){
  var disk;
  for(var i = 0; i < disksNum; i++){
    disk = disks[i];
    disk.checkCollision(i, disks);
  }
}
function createAllDisks() {
    var disk;
    for (var i = 0; i < disksNum; i++) {
        disk = createDisk();
        disks.push(disk);
    }
}
function manageInput(){
    if(isMouseDown && draggedDisk == null){
        var disk;
        for(var i = 0; i < disksNum; i++){
            disk = disks[i];
            if(disk.containsPoint(mouseX, mouseY)){
                draggedDisk = disk;
                canvas.addEventListener('mousemove', onDragDisk);
                break;
            }
        }

    }
}
function updateAllDisks() {
    var disk;
    for (var i = 0; i < disksNum; i++) {
        disk = disks[i];
        disk.update();
    }
}
function drawAllDisks() {
    var disk;
    for (var i = 0; i < disksNum; i++) {
        disk = disks[i];
        disk.draw();
    }
}
function createDisk() {
    var disk = {};
    disk.colour = generateHex();
    disk.radius = 20;
    disk.friction = 0.1;
    disk.x = (Math.random() * (stageWidth - (2 * disk.radius))) + disk.radius;
    disk.y = (Math.random() * (stageHeight - (2 * disk.radius))) + disk.radius;
    disk.vx = Math.random() * 40 - 20;
    disk.vy = Math.random() * 40 - 20;
    disk.checkCollision = function(i, arr){
      for(var j = i+1 ; j < arr.length; j++){
        var diskB = arr[j];
        var dx = diskB.x - this.x;
        var dy = diskB.y - this.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        var minDist = this.radius + diskB.radius;
        if(dist < minDist){
          var angle = Math.atan2(dy, dx);
          var tx = this.x + Math.cos(angle) * minDist;
          var ty = this.y + Math.sin(angle) * minDist;
          var ax = (tx - diskB.x) * 0.5;
          var ay = (ty - diskB.y) * 0.5;
          diskB.vx += ax;
          diskB.vy += ay;
          this.vx -= ax;
          this.vy -= ay;
        }
      }

    }
    disk.containsPoint = function (x, y) {
        var dx = Math.abs(x - this.x);
        var dy = Math.abs(y - this.y);
        if(dx + dy < this.radius){
            return true
        }
    }
    disk.update = function () {
        if(this == draggedDisk){
            this.x = mouseX;
            this.y = mouseY;
            this.vx = this.vy = 0;

        }else{
            this.vy += gravity;
            var speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            var angle = Math.atan2(this.vy, this.vx);
            if (speed > this.friction) {
                speed -= this.friction;
            } else {
                speed = 0;
            }
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
            this.x += this.vx;
            this.y += this.vy;
            if (this.x - this.radius < 0) { // gone left
                this.x = this.radius;
                this.vx = -this.vx;
            } else if (this.x + this.radius > stageWidth) { // gone right
                this.x = stageWidth - this.radius;
                this.vx = -this.vx
            }
            if (this.y - this.radius < 0) { // gone up
                this.y = this.radius;
                this.vy = -this.vy;
            } else if (this.y + this.radius > stageHeight) { // gone down
                this.y = stageHeight - this.radius;
                this.vy = -this.vy;
            }
        }

    }
    disk.draw = function () {
        ctx.fillStyle = this.colour;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }
    return disk;
}

function resizeCanvas() {
    var cs = window.getComputedStyle(canvasContainer);
    stageWidth = canvas.width = parseInt(cs.getPropertyValue('width'), 10);
    stageHeight = canvas.height = parseInt(cs.getPropertyValue('height'), 10);
    offsetLeft = canvasContainer.offsetLeft;
    offsetTop = canvasContainer.offsetTop;
}
function generateHex() {
    var str = "0123456789ABCDEF";
    var result = "#";
    for (var i = 0; i < 6; i++) {
        result += str.charAt(Math.floor(Math.random() * 16));
    }
    return result;
}
