var btn1 = document.getElementById("btn1");
var btn2 = document.getElementById("btn2");
var btn3 = document.getElementById("btn3");
var btn4 = document.getElementById("btn4");
var btn5 = document.getElementById("btn5");
var btn6 = document.getElementById("btn6");
var insane=new Audio("music/Insane - AP Dhillon.mp3");
var blueEye=new Audio("music/Blue Eyes - Yo Yo Honey Singh (PagalWorld.com).mp3");
var Age19=new Audio("music/Age-19-Jass-Manak.mp3");
var letMeDown = new Audio("music/Let-Me-Down-Slowly(PaglaSongs).mp3");
var Animal= new Audio("music/Maroon 5 Animals.mp3 Song Download.mp3");
var fedUp=new Audio("music/Bazanji Fed Up .mp3")


btn1.onclick = function()
{
    var change = document.getElementById("btn1");
    if(insane.paused == true){
        
    insane.play();
    change.innerHTML = "&#9724;";
      }else{
        insane.pause();
     change.innerHTML = "&#9658;";
      }
      
     
     
}
btn2.onclick = function()
{
    var change = document.getElementById("btn2");
    if(blueEye.paused == true){
    blueEye.play();
    change.innerHTML = "&#9724;";
      }
      else{
     blueEye.pause();
     change.innerHTML = "&#9658;";
    }
}
btn3.onclick = function()
{
    var change = document.getElementById("btn3");
    if(letMeDown.paused){
        letMeDown.play();
        change.innerHTML = "&#9724;";
      }else
      {
        letMeDown.pause();
        change.innerHTML = "&#9658;";
      }
      
}
btn4.onclick = function()
{
    var change = document.getElementById("btn4");
    if(fedUp.paused){
        fedUp.play();
        change.innerHTML = "&#9724;";
      }else
      {
        fedUp.pause();
        change.innerHTML = "&#9658;";
      }
     
}
btn5.onclick = function()
{
    var change = document.getElementById("btn5");
    if(Age19.paused){
        Age19.play();
        change.innerHTML = "&#9724;";
      }else
      {
        Age19.pause();
        change.innerHTML = "&#9658;";
      }
      
}
btn6.onclick = function()
{
    var change = document.getElementById("btn6");
    if(Animal.paused){
        Animal.play();
        change.innerHTML = "&#9724;";
      }else
      {
        Animal.pause();
        change.innerHTML = "&#9658;";
      }
      
}


