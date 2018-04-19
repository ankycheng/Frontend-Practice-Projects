console.clear();

let GameObject = function(position,size,selector){
  this.$el = $(selector);
  this.$el.css("position","absolute");
  this.position = position;
  this.size = size;
  this.updateCss();
};

//size在this.position裡面
GameObject.prototype.updateCss = function(){
  this.$el.css("left",this.position.x+"px");
  this.$el.css("top",this.position.y+"px");
  this.$el.css("width",this.size.width+"px");
  this.$el.css("height",this.size.height+"px");
};

GameObject.prototype.collide = function(otherObject){
  let pos = otherObject.position;
  //判斷otherObj是否在自己的寬度範圍內(this.position.x ~ this.position.x+this.size.width)
  let inXrange = pos.x >= this.position.x && pos.x < this.position.x+this.size.width;
  let inYrange = pos.y >= this.position.y && pos.y < this.position.y+this.size.height;
  return inXrange && inYrange;
};

let Ball = function(){
  this.init();
  GameObject.call(this, this.position, {width: 15, height: 15}, ".ball");
};

Ball.prototype = Object.create(GameObject.prototype);
Ball.prototype.constructor = Ball.constructor;

//初始化位置與x,y速度
Ball.prototype.init = function(){
  this.position = {x: 250, y: 250};
  let randomDeg = Math.random()*2*Math.PI;
  this.velocity = {
    x: Math.cos(randomDeg)*8,
    y: Math.sin(randomDeg)*8
  };
};


Ball.prototype.update = function(){
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  this.updateCss();
  if(this.position.x<0 || this.position.x+this.size.width>500){
    this.velocity.x =-this.velocity.x;
  }
  if(this.position.y<0 || this.position.y+this.size.height>500){
    this.velocity.y =-this.velocity.y;
  }
};

//不在此設定position,size, selector
let Board = function(position,size,selector){
  GameObject.call(this,position,size,selector);
};
Board.prototype = Object.create(GameObject.prototype);
Board.prototype.constructor = Board.constructor;
Board.prototype.update = function(){
  if(this.position.x+this.size.width>500){
    this.position.x = 500 - this.size.width;
  }
  if(this.position.x<0){
    this.position.x = 0;
  }
  this.updateCss();
};

let ball = new Ball();
let board1 = new Board({x:0,y:30},{width:100,height:15},".b1");
let board2 = new Board({x:0,y:455},{width:100,height:15},".b2");


let Game = function(){
  this.timer = null;
  this.initControl();
  this.control = [];
  this.score = 0;
};

//倒數開始
Game.prototype.startGame = function(){
  let time = 3;
  $("button").hide();
  ball.init();
  $(".infoText").text("Ready");
  this.timer = setInterval(()=>{
    $(".infoText").text(time);
    if(time<=0){
      $(".info").hide();
      clearInterval(this.timer);
      this.gameMain();
    }
    time--;
  },1000);
};

//key up & down 的listener 在windos下面
Game.prototype.initControl = function(){
  $(window).keydown((evt)=>{
    this.control[evt.key]=true;
  });
  $(window).keyup((evt)=>{
    this.control[evt.key]=false;
  });
  console.log(this.control);
};

//遊戲主程式
Game.prototype.gameMain = function(){
  this.timer = setInterval(()=>{
    if(board1.collide(ball)){
      console.log("hit board1");
      //y軸方向變為正，即是往下移動
      ball.velocity.y = Math.abs(ball.velocity.y);
      ball.velocity.x*=1.1;
      ball.velocity.y*=1.1;
      ball.velocity.x+=0.5-Math.random();
      ball.velocity.y+=0.5-Math.random();
    }
    if(board2.collide(ball)){
      console.log("hit board2");
      ball.velocity.y = -Math.abs(ball.velocity.y);
      this.score+=10;
    }
    if(this.control.ArrowLeft){
      board2.position.x-=16;
    }
    if(this.control.ArrowRight){
      board2.position.x+=16;
    }
    
    if(ball.position.y<0){
      console.log("you win");
      this.gameEnd("You Win");
    }
    if(ball.position.y+ ball.size.height>=500){
      console.log("you lose");
      this.gameEnd("You Lose");
    }
    
    //有趣的寫法
    board1.position.x+= ball.position.x > board1.position.x + board1.size.width/2+5?16:0;
    board1.position.x+= ball.position.x < board1.position.x + board1.size.width/2-5?-16:0;
    
    ball.update();
    board1.update();
    board2.update();
    
    $(".score").text("Score " + this.score);
  }, 30);
};


//可用$().html更改樣式
Game.prototype.gameEnd = function(msg){
  clearInterval(this.timer);
  $(".info").show();
  $("button").show();
  $(".infoText").html(msg+" <br> your score is "+this.score);
  this.score = 0;
};

let game = new Game();