# 乒乓球遊戲過程記錄

## 版面設置

### 版面配置的目標

1. 遊戲版面`.game`包含兩個部分：
    1. 兩個board(`.b1`與`.b2`)、ball
    2. 資訊部分包括`.info`（Start Game）與`button`（點集開始遊戲）
    3. `.grade`顯示得分
2. 畫面編排：
    1. `html`&`body`置中，佔比100%，使用flex水平、垂直置中
    2. `.game`為長寬500px的正方形，設背景、邊框樣式
    3. `.info`置中以及`.grade`一些微調

### 實做

1. HTML
    ```html
    <div class="game">
    <div class="board b1"></div>
    <div class="board b2"></div>
    <div class="ball"></div>
    <div class="info">
        <h2 class="infoText">Start Game</h2>
        <button class="start" onclick="game.startGame()">Start</button>
    </div>
    <div class="grade"></div>
    </div>
    ```
2. CSS
    ```sass
    html,body
    display: flex
    justify-content: center
    align-items: center
    width: 100%
    height: 100%
    background-color: #222
    color: white
    .game
    border: solid 5px rgba(white,0.2)
    width: 500px
    height: 500px
    position: relative
    background-color: #222
    .board
        background-color: #FF644E
    .ball
        background-color: #fff
    .info
    width: 100%
    height: 100%
    position: absolute
    left: 0
    top: 0
    display: flex
    justify-content: center
    align-items: center
    flex-direction: column
    background-color: #222
    color: white
    button
        border: none
        padding: 10px 20px
    .grade
    padding: 10px
    ```

## 建立遊戲物件

### 建立遊戲物件-目標

1. 設定選擇器、位置、大小、css
2. 設定`this.updateCss()`方法
3. 增加updateCss()方法，更新遊戲物件狀態，包含位置與大小
4. 增加collide(otherObject)方法，偵測物件碰撞

### 建立遊戲物件-實做

```Javascript
//-------[類別] 遊戲物件
var GameObject = function (position,size,selector){
  this.$el = $(selector)
  this.position = position
  this.size = size
  this.$el.css("position","absolute")
  this.updateCss()
}
//更新遊戲物件(資料->實際的css)
GameObject.prototype.updateCss = function(){
  this.$el.css("left",this.position.x+"px")
  this.$el.css("top",this.position.y+"px")
  this.$el.css("width",this.size.width+"px")
  this.$el.css("height",this.size.height+"px")
}
//偵測遊戲物件碰撞
GameObject.prototype.collide = function(otherObject){
  let pos = otherObject.position
  let inXrange = pos.x >= this.position.x && pos.x <= this.position.x + this.size.width
  let inYrange =  pos.y >= this.position.y && pos.y <= this.position.y + this.size.height
  return inXrange && inYrange
}
```

## 建立球`(Ball)`（繼承遊戲物件）

### 建立球-目標

1. 使用`call()`方法繼承`GameObject`
2. 呼叫`this.init()`初始化
3. 建立`Ball.prototype.update()`方法
4. 建立`Ball.prototype.init()`方法
5. 綁定`Ball.prototype`到`GameObject.prototype`上
6. 將`Ball`的`constructor`綁訂在自己的建構子身上

### 建立球-實做

```Javascript
//-------[類別] 球 -- //繼承遊戲物件
var Ball = function(){
  this.init()
  GameObject.call(this,
    this.position,
    {width: 15, height: 15},
    ".ball"
  )
}
Ball.prototype = Object.create(GameObject.prototype)
Ball.prototype.constructor = Ball.constructor
//將速度加上球的位置 / 反彈偵測 / 以及更新
Ball.prototype.update = function(){
  this.position.x += this.velocity.x
  this.position.y += this.velocity.y
  this.updateCss()
  if (this.position.x <0 || this.position.x > 500){
    this.velocity.x=-this.velocity.x
  }
  if (this.position.y <0 || this.position.y > 500){
    this.velocity.y=-this.velocity.y
  }
}
Ball.prototype.init = function(){
  this.position = { x:250 , y:250 }
  var randomDeg = Math.random()*2*Math.PI
  this.velocity = {
    x: Math.cos(randomDeg)*8,
    y: Math.sin(randomDeg)*8
  }
}
```

## 建立版子`Board()`（繼承遊戲物件）

### 建立版子-目標

1. 使用`call()`方法繼承`GameObject`
2. 綁定`Ball.prototype`到`GameObject.prototype`上
3. 將`Ball`的`constructor`綁訂在自己的建構子身上
4. 建立`Board.prototype.update()`方法更新版子位置與處理版子超出邊界問題。

### 建立版子-實做

```Javascript
//-------[類別] 板子 -- //繼承遊戲物件
var Board = function(position,size,selector){
  GameObject.call(this,position,size,selector)
}
Board.prototype = Object.create(GameObject.prototype)
Board.prototype.constructor = Board.constructor

//檢查板子是否超出邊界與更新
Board.prototype.update = function(){
  if (this.position.x<0){
    this.position.x = 0
  }
  if (this.position.x + this.size.width>500){
    this.position.x = 500 - this.size.width
  }
  this.updateCss()
}
```

## 建立遊戲`(Game)`類別

### 建立遊戲-目標

1. 建立遊戲類別，包含：`timer`, `grade`, `control`與呼叫`this.initControl()`方法
2. 建立`Game.prototype.startGame()`執行倒數遊戲畫面
3. 建立`Game.prototype.initControl()`控制鍵盤事件，當按下的時候將`this.control[evt.key]`設定為`true`
4. 建立`Game.prototype.startGameMain()`處理遊戲內容，主要為一個0.03秒的`setInterval()`，處理
    1. `.board1`與`.board2`的撞擊
    2. 求碰到上下邊界判斷輸贏
    3. 由`this.control()`控制左右移動
    4. 電腦跟著球移動
    5. 更新`ball`,`board1`與`board2`的位置
    6. 更新分數
5. 建立`Game.prototype.endGame()`處理遊戲結束事件，清除計時器、顯示`.info`與`.button`與成績，將`this.grade`歸零

### 建立遊戲-實做

1. 建立遊戲類別

```Javascript
//-------[類別] 遊戲
var Game = function (){
  this.timer = null
  this.initControl()
  this.control = {}
  this.grade=0
}
```

2. 建立`Game.prototype.startGame()`執行倒數遊戲畫面

```Javascript
//開始遊戲倒數
Game.prototype.startGame = function(){
  let time = 3
  let _this = this
  $("button").hide()
  ball.init()
  $(".infoText").text("Ready")
  this.timer = setInterval(function(){
    $(".infoText").text(time)
    if (time<=0){
      $(".info").hide()
      clearInterval( _this.timer )
      _this.startGameMain()
    }
    time--
  },1000)
}
```

3. 建立`Game.prototype.initControl()`控制鍵盤事件，當按下的時候將`this.control[evt.key]`設定為`true`

```Javascript
//設置鍵盤控制
Game.prototype.initControl = function(){
  let _this = this
  $(window).keydown(function(evt){
    _this.control[evt.key]=true
  })
  $(window).keyup(function(evt){
    _this.control[evt.key]=false
  })
}
```

4. 遊戲內容

```Javascript
Game.prototype.startGameMain = function(){
  let _this = this
  this.timer = setInterval(function(){
    if (board1.collide(ball)){
      console.log("Hit Board 1!")
      ball.velocity.y = Math.abs(ball.velocity.y)
      ball.velocity.x*=1.1
      ball.velocity.y*=1.1
      ball.velocity.x+=0.5-Math.random()
      ball.velocity.y+=0.5-Math.random()
    }
    if (board2.collide(ball)){
      console.log("Hit Board 2!")
      ball.velocity.y = - Math.abs(ball.velocity.y)
      _this.grade+=10
    }
    if (ball.position.y<=0){
      _this.endGame("Computer lose")
    }
    if (ball.position.y>=500){
      _this.endGame("You lose")
    }
    if (_this.control["ArrowLeft"]){
      board2.position.x-=8
    }
    if (_this.control["ArrowRight"]){
      board2.position.x+=8
    }
    //自動移動的對手
    board1.position.x+= ball.position.x > board1.position.x+board1.size.width/2+5? 8:0
    board1.position.x+= ball.position.x < board1.position.x+board1.size.width/2-5? -8:0
    ball.update()
    board1.update()
    board2.update()
    $(".grade").text(_this.grade)
  },30)
}
```

5. 遊戲結束

```Javascript
Game.prototype.endGame = function(result){
  clearInterval(this.timer)
  $(".info").show()
  $("button").show()
  $(".infoText").html(result+"<br>Score: "+ this.grade)
  this.grade=0
}
```