console.clear();

let blockdata = [
  {selector: ".block1",name:"1",pitch:"1"},
  {selector: ".block2",name:"2",pitch:"2"},
  {selector: ".block3",name:"3",pitch:"3"},
  {selector: ".block4",name:"4",pitch:"4"}
];

var soundsetdata = [
  {name: "correct", sets:[1,3,5,8]},
  {name: "wrong", sets: [2,4,5.5,7]}
];

let levelDatas = [
  "12",
  "1234",
  "12324",
  "231234",
  "41233412",
  "41323134132",
  "2342341231231232",
  "41243132221234442213423",
  "331231232324441242413232124123"
];

let Blocks = function(blockAssign, setAssign){
  this.allOn = false;
  this.blocks = blockAssign.map((d,i)=>({
    name: d.name,
    el: $(d.selector),
    audio: this.getAudioObject(d.pitch)
  }));
  this.soundSets = setAssign.map((d,i)=>({
    name: d.name,
    sets: d.sets.map((pitch) => this.getAudioObject(pitch))
  }));
  
};

Blocks.prototype.flash = function(note){
  let block = this.blocks.find(d=>d.name==note);
  if(block){
    block.audio.currentTime = 0;
    block.audio.play();
    block.el.addClass("active");
    setTimeout(()=>{
      if(this.allOn == false){
        block.el.removeClass("active");    
      }
    },100)
  }
};
Blocks.prototype.turnAllOn = function(){
  this.allOn = true;
  this.blocks.forEach((block)=>{
    block.el.addClass("active");
  });
};
Blocks.prototype.turnAllOff = function(){
  this.allOn = false;
  this.blocks.forEach((block)=>{
    block.el.removeClass("active");
  });
};
Blocks.prototype.getAudioObject = function(pitch){
  return new Audio("https://awiclass.monoame.com/pianosound/set/"+ pitch+".wav");
};
Blocks.prototype.playSet = function(type){
  let sets = this.soundSets.find(set => set.name==type).sets;
  sets.forEach((obj)=>{
    obj.currentTime = 0;
    obj.play();
  })
};

let blocks = new Blocks(blockdata,soundsetdata);

let Game = function(){
  this.blocks = new Blocks(blockdata,soundsetdata);
  this.levels = levelDatas;
  this.currentLevel = 0;
  this.playInterval = 400;
  this.mode = "waiting";
};

Game.prototype.loadLevels = function(){
  let _this = this;
  $.ajax({
    url: "https://2017.awiclass.monoame.com/api/demo/memorygame/leveldata",
    success: function(res){
      _this.levels = res;
    }
  })
}
Game.prototype.startLevel = function(){
  this.showMessage("Level "+this.currentLevel);
  let leveldata = this.levels[this.currentLevel]
  this.startGame(leveldata);
};
Game.prototype.showMessage = function(mes){
  console.log(mes);
  $(".status").text(mes);
};
Game.prototype.startGame = function(answer){
  this.mode = "gamePlay";
  this.answer = answer;
  let notes = this.answer.split("");
  this.showStatus("");
  this.timer =setInterval(()=>{
    let char = notes.shift();
    // console.log(char);
    this.playNote(char);
    if (!notes.length){
      console.log("audio play end");
      this.startUserInput();
      clearInterval(this.timer);
    }
  },this.playInterval)
}
Game.prototype.playNote = function(note){
  console.log(note);
  this.blocks.flash(note);
};
Game.prototype.startUserInput = function(){
  this.userInput = "";
  this.mode = "userInput";
}
Game.prototype.userSendInput = function(inputChar){
  if(this.mode == "userInput"){
    let tempString = this.userInput+inputChar;
    this.playNote(inputChar);
    this.showStatus(tempString);
    if(this.answer.indexOf(tempString)==0){
      console.log("GJ!");
      if(this.answer == tempString){
        console.log("Correct!");
        this.showMessage("Correct!");
        // this.blocks.playSet("correct");
        this.mode = "waiting";
        this.currentLevel+=1;
        setTimeout(()=>{
          this.startLevel();
        },1000);
      }
    }else{
      console.log("wrong");
      this.showMessage("Wrong!");
      this.mode = "waiting";
      // this.blocks.playSet("wrong");
      this.currentLevel=0;
      setTimeout(()=>{
        this.startLevel();
      },1000);
    }
    console.log(tempString);
    this.userInput+= inputChar;
  }
};
Game.prototype.showStatus = function(tempString){
  $(".inputStatus").html("");
  this.answer.split("").forEach((d,i)=>{
    let circle = $("<div class='circle'></div>");
    if(i<tempString.length){
      circle.addClass("correct");
    };
    $(".inputStatus").append(circle);
  });
  if (tempString==""){
    this.blocks.turnAllOff();
  };
  
  if(tempString == this.answer){
    $(".inputStatus").addClass("correct");
    setTimeout(()=>{
      this.blocks.turnAllOn();
      this.blocks.playSet("correct");
    },500);
  }else{
    $(".inputStatus").removeClass("correct");
  }
  if(this.answer.indexOf(tempString)!=0){
    $(".inputStatus").addClass("wrong");
    setTimeout(()=>{
      this.blocks.turnAllOn();
      this.blocks.playSet("wrong");
    },500);
  }else{
    $(".inputStatus").removeClass("wrong");
  }
};
let game = new Game();

setTimeout(()=>{
  game.startLevel();
},500);