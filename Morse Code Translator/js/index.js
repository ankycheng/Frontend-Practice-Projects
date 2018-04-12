let morseCode = "A;.-|B;-...|C;-.-.|D;-..|E;.|F;..-.|G;--.|H;....|I;..|J;.---|K;-.-|L;.-..|M;--|N;-.|O;---|P;.--.|Q;--.-|R;.-.|S;...|T;-|U;..-|V;...-|W;.--|X;-..-|Y;-.--|Z;--..|/;-..-.|1;.----|2;..---|3;...--|4;....-|5;.....|6;-....|7;--...|8;---..|9;----.|0;-----";

let morseList = morseCode.split("|");
for(let i = 0; i<morseList.length; i++){
  morseList[i] = morseList[i].split(";");
  $("ul.translist").append("<li>"+ morseList[i][0] + " "+ morseList[i][1] +"</li>")
};


//文章翻譯 -> 抓出個別的字

function findCode(letter){
  for(let i = 0; i<morseList.length; i++){
    if(letter == morseList[i][0]){
      return morseList[i][1];
    }
  }
  return letter;
};

function findLetter(code){
  for(let i = 0; i<morseList.length; i++){
    if(code == morseList[i][1]){
      return morseList[i][0];
    }
  }
  return code;
};

function translateToMorse(text){
  let result = "";
  text = text.toUpperCase();
  for(var i = 0; i<text.length ; i++){
    // console.log(text[i]);
    result += findCode(text[i]) + " "
  }
  return result;
};

function translateToEng(text){
  let result = "";
  text = text.split(" ");
  for(var i = 0; i<text.length ; i++){
    // console.log(text[i]);
    result += findLetter(text[i]);
  }
  return result;
};

$("#btnMorse").click(function(){
  let input = $("#input").val();
  let result = translateToMorse(input);
  $("#output").val(result);
  $("#output").css({
    backgroundColor: "#292B73"
  }).animate({
    backgroundColor: "transparent"
  },500);
  $(".symbol").velocity({
    rotateZ: ["0deg", "360deg"]
  });
});

$("#btnEng").click(function(){
  let input = $("#output").val();
  let result = translateToEng(input);
  $("#input").val(result);
  $("#input").css({
    backgroundColor: "#292B73"
  }).animate({
    backgroundColor: "transparent"
  },500);
  $(".symbol").velocity({
    rotateZ: ["0deg", "360deg"]
  });
});

$("#input").keyup(function(){
  let original = $("#input").val();
  let newText = original.toUpperCase().split(" ").join("");
  $("#input").val(newText);
  
});


function play(texts, nowindex){
  let word = texts[nowindex];
  let lastTime = 300;
  if(word == "."){
    lastTime = 400;
    $("audio.short")[0].play();
  }else if(word == "-"){
    lastTime = 600;
    $("audio.long")[0].play();
  }else{
    lastTime = 1000;
  };
  
  $(".playlist span").removeClass("playing");
  $(".playlist span").eq(nowindex).addClass("playing");
  
  if(texts.length>nowindex){
    playerTime = setTimeout(function(){
      play(texts,nowindex+1);
    },lastTime);
  }else{
    $(".playslist").html("");
  }
}

$("audio.short")[0].volume = 0.3;
$("audio.long")[0].volume = 0.3;

$("#btnPlay").click(function(){
  let texts = $("#output").val();
  $(".playlist").html("");
  for(let i=0; i<texts.length ; i++){
    $(".playlist").append("<span>" + texts[i] +"</span>")
  };
  play(texts,0);
});