var scale=1,/*try 2 or 3 or 4 or 5*/
cnv,ctx,w,h,player,camera,Game,interval,score=0,hscore=0,bgsound,lsound,esound,playerbg=0,s,angle=-Math.PI/4,initSpeed=2*scale;
var MDT=16;
var mdt=MDT;
function yf(){
  getdata();
  document.body.removeChild(document.getElementById("loading"));
  cnv=document.getElementById("cnv");
  ctx=cnv.getContext("2d");
  w=cnv.offsetWidth;
  h=cnv.offsetHeight;
  if(w>document.body.offsetWidth){
    w=document.body.offsetWidth;
  }
  if(h>document.body.offsetHeight){
    h=document.body.offsetHeight;
  }
  bgsound=document.getElementById("bg");
  bgsound.volume=1;
  lsound=document.getElementById("l");
  lsound.volume=0;
  esound=document.getElementById("e");
  esound.volume=1;
  document.getElementById("menu").style="width:"+w+"px;height:"+h+"px;transform:translateX(-50%) translateY(-50%);";
  w*=scale;
  h*=scale;
  cnv.width=w;
  cnv.height=h;
  cnv.style="transform:translateX(-50%) translateY(-50%) scale("+(1/scale)+");";
  ctx.translate(w/2,h/2);
  ctx.rotate(angle)
  s=Math.sqrt(w*w+h*h);
  
  player=new Player();
  camera=new Camera();
  var menu={
    draw:function(){
      ctx.save()
      ctx.fillStyle="rgba(0,0,0,0.8)";
      if(Game.state==Game.states.START){
        ctx.rotate(-angle);
        ctx.fillRect(player.x-w/2,player.y-h/2,w,h);
      }else{
        bgsound.pause();
        bgsound.currentTime=0;
        ctx.fillRect(player.x-w,player.y-h,w*2,h*2);
      }
      ctx.restore()
    }
  };
  Game={
    map:[],
    speed:initSpeed,
    v:0,
    states:{PLAY:0,START:1,GAMEOVER:2},
    state:1,
    res:function(){
      clearInterval(interval);
      score=0;
      document.getElementById("menu").setAttribute("score",""+score);
      document.getElementById("msg1").innerText="Play";
      player.x-=camera.x;
      player.y-=camera.y;
      player.Particles=[];
      if(player.speedy()==0){
        player.speedy=()=>-Math.floor(Game.speed*dt/mdt);
        player.speedx=()=>0;
      }
      ctx.translate(camera.x,camera.y);
      camera.x=0;camera.y=0;
      this.map=[];
      generateMap(20);
      this.v=0;
      animate();
    },
    update:function(){
      if(player.Particles.length>200){
          player.Particles=player.Particles.splice(50)
      }
      player.update();
      camera.update();
      if(this.map[0].dir=="v"){
        if(this.map[0].y-this.map[0].t>player.y+h/2){
          this.map.shift();
          generateMap(1);
        }
      }else{
        if(this.map[0].y-this.map[0].w>player.y+h/2){
          this.map.shift();
          generateMap(1);
        }
      }
     try{
      if(bgsound.currentTime>=bgsound.duration-3){
        bgsound.currentTime=0;
      }
    }catch(e){}
    },
    draw:function(){
      for(i=0;i<this.map.length;i++){
        this.map[i].update();
        this.map[i].draw();
      }
      if(this.state!=this.states.PLAY)
        menu.draw()
      if(this.state!=this.states.GAMEOVER)
        player.draw();
      else{
        for(p=0;p<player.Particles.length;p++){
        try{
          player.Particles[p].update();
          player.Particles[p].draw();
        }catch(e){}
        }
      }
    }
  };
  generateMap(20);
  
  cnv.onclick=function(){
    changedir()
  }
  onkeydown=function(event){
    if(event.keyCode==32)
      changedir();
  }
animate();
}

let previousTimeStamp=0,dt;
function animate(){
  //if(interval) clearInterval(interval);
  //interval=setInterval(function(){run()},Game.speed);
  function step(timeStamp) {
   if (previousTimeStamp !== timeStamp) {
     dt=Math.floor(timeStamp-previousTimeStamp);
     if(dt>=Game.speed){
       document.getElementById("fps").textContent=Math.round(1000/dt)+"fps";
       run();
       previousTimeStamp = timeStamp;
     }
     window.requestAnimationFrame(step);
   } 
 }
 window.requestAnimationFrame(step);
}
function run(){
  ctx.clearRect(camera.x-s/2,camera.y-s/2,s,s);
  if(Game.state==Game.states.PLAY)
    Game.update();
  Game.draw();
}

/***Player***/
var Player=function(){
  this.x=0;
  this.y=0;
  this.r=25*scale;
  this.speedx=()=>0;
  this.speedy=()=>-Math.floor(Game.speed*dt/mdt);
  this.minScore=[0,25,50,100,150,500,1000];
  this.bgs=["#ffffff","#0099ff","#00ff99","#f22","#2f2","#ffcc00","#ffff00"];
  this.clrs=["rgba(250,250,240,1)","rgba(0,240,250,1)","rgba(0,250,220,1)","rgba(250,100,100,1)","rgba(0,250,0,1)","rgba(250,230,100,1)","rgba(250,250,200,1)"];
  this.bg=this.bgs[playerbg];
  this.clr=this.clrs[playerbg];
  this.p=new Path(0,0,0,0,"v",0,0);
  this.Particles=[];
};
Player.prototype.draw=function(){
  this.clr=this.clrs[playerbg];
  this.bg=this.bgs[playerbg];
  ctx.save();
  ctx.beginPath();
  ctx.shadowOffsetX=0;
  ctx.shadowOffsetY=0;
  ctx.shadowBlur=Math.random()*4*scale+4*scale;
  ctx.shadowColor=this.bg;
  ctx.fillStyle=this.bg;
  ctx.arc(this.x,this.y,this.r-this.p.linew/2,0,Math.PI*2);
  ctx.fill();
  ctx.restore();
  for(i=0;i<this.Particles.length;i++){
    this.Particles[i].update();
    this.Particles[i].draw();
  }
};
Player.prototype.update=function(){
  this.x+=this.speedx();
  this.y+=this.speedy();
  for(i=0;i<1;i++){
    var bg=this.clr;
  if(this.speedy()==0){
    this.Particles.push(new Particle(this.x,this.y,0,0,bg));
    //this.Particles.push(new Particle(this.x+this.r/5,this.y+i*this.r/(25*scale),0,0,bg));
  }else{
    this.Particles.push(new Particle(this.x,this.y,0,0,bg));
    //this.Particles.push(new Particle(this.x+i*this.r/(25*scale),this.y+this.r/5,0,0,bg));
  }
  }
}
/******/

/***Camera***/
var Camera=function(){
  this.x=0;
  this.y=0;
};
Camera.prototype.update=function(){
  ctx.translate(-player.speedx(),-player.speedy());
  this.x+=player.speedx();
  this.y+=player.speedy();
};
/******/

/***Path***/
var Path=function(x,y,w,t,dir,lw,lt){
  this.x=x-lw/2;
  this.y=y;
  this.w=w;
  this.t=t;
  this.dir=dir;
  this.lw=lw;
  this.lt=lt;
  this.linew=14*scale;
  this.bg="#235";
  this.shadow="rgba(0,0,0,.3)";
}
Path.prototype.draw=function(){
  ctx.strokeStyle="#ff9900";
  ctx.lineWidth=""+this.linew+"";
  if(this.dir=="h"){
    ctx.beginPath();
    ctx.fillStyle=this.bg;
    ctx.fillRect(this.x-this.lw,this.y-this.w-2,this.t+this.lw+2,this.w+4);
        ctx.fillStyle=this.shadow;
    ctx.fillRect(this.x-this.lw,this.y-this.w-2,this.t+this.lw+2,15*scale);
    ctx.beginPath();
    ctx.moveTo(this.x,this.y+this.linew/2);
    ctx.lineTo(this.x+this.t+this.linew,this.y+this.linew/2);
    ctx.moveTo(this.x,this.y-this.w);
    ctx.lineTo(this.x+this.t+this.linew,this.y-this.w);
    ctx.moveTo(this.x-this.lw,this.y);
    ctx.lineTo(this.x-this.lw,this.y-this.w);
    ctx.lineTo(this.x+this.linew,this.y-this.w);
  }else{
    ctx.beginPath();
    ctx.fillStyle=this.bg;
    ctx.fillRect(this.x,this.y-this.t,this.w,this.t+this.lw+2);
    ctx.beginPath();
    ctx.moveTo(this.x,this.y+this.linew/2);
    ctx.lineTo(this.x,this.y-this.t);
    ctx.moveTo(this.x+this.w,this.y);
    ctx.lineTo(this.x+this.w,this.y-this.t);
    ctx.moveTo(this.x+this.w,this.y);
    ctx.lineTo(this.x+this.w,this.y+this.lw+this.linew/2);
    ctx.lineTo(this.x,this.y+this.lw+this.linew/2);
  }
  ctx.stroke();
  ctx.closePath();
}
Path.prototype.update=function(){
if(Game.state!=Game.states.GAMEOVER){
  if(this.dir=="h"){
    if(player.y-player.r<=this.y-this.w && player.x-player.r>=this.x-this.lw && player.x-player.r<=this.x+this.t){
      Game.state=Game.states.GAMEOVER;
      explosion(player.x,player.y,"v");
      ongover();
    }
  }else{
    if(player.x+player.r>=this.x+this.w && player.y+player.r<=this.y+this.lw && player.y+player.r>=this.y-this.t){
      Game.state=Game.states.GAMEOVER;
      explosion(player.x,player.y,"h");
      ongover();
    }
  }
  }
}
/******/
/***Particle***/
var Particle=function(x,y,sx,sy,clr){
  this.x=x;this.y=y;
  this.s=Math.random()-Math.random()>0?1:-1;
  this.r=25*scale*(Math.random()*.3+.6);
  this.sx=(sx+Math.random()*this.r/40)*this.s;
  this.sy=(sy+Math.random()*this.r/40)*this.s;
  this.clr=clr;
};
Particle.prototype.draw=function(){
  ctx.beginPath();
  ctx.fillStyle=this.clr;
  ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
  ctx.fill();
}
Particle.prototype.update=function(){
  this.r*=Math.random()*0.1+0.95;
  this.x+=this.sx;
  this.y+=this.sy
  if(this.r>=1.2*25*scale || this.r<=6*scale){
    player.Particles.splice(player.Particles.indexOf(this),1);
  }
}
/******/

/***functions***/
function changedir(){
if(Game.state==Game.states.PLAY){
  if(player.speedy()==0){
    player.speedy=()=>-Math.floor(Game.speed*dt/mdt);
    player.speedx=()=>0;
  }else{
    player.speedx=()=>Math.floor(Game.speed*dt/mdt);
    player.speedy=()=>0;
  }
  /*"try{
    lsound.currentTime=0;
    lsound.play();
  }catch(e){}*/
  score++;
  if(score>hscore){
    hscore=score;
    savedata();
  }
  if(score%50==0 && Game.speed<10*scale){
    Game.speed+=scale;
  }
  document.getElementById("menu").setAttribute("score",""+score);
  document.getElementById("menu").setAttribute("hscore","High Score: "+hscore);
}else{
  Game.state--;
  if(Game.state==Game.states.START){
    Game.res();
    document.getElementById("menu").setAttribute("class","start");
  }else{
    document.getElementById("menu").setAttribute("class","play");
    try{
      document.getElementById("bg").play();
    }catch(e){}
  }
}
}
function generateMap(n){
  var pw=[100*scale,140*scale,120*scale,100*scale];
  var piw=2;
  var pt=[0*scale,180*scale,100*scale,50*scale,0*scale];
  var pit=5;
  if(Game.map.length==0){
    Game.map.push(new Path(0,h/2,pw[2]*1.2,(h*0.8>pt[0]*1.8 ? h*0.8 : pt[0]*1.8),"v",pw[0],pt[0]));
  }
  var maplength=Game.map.length;
  for(i=maplength;i<maplength+n;i++){
    var iw=Math.floor(Math.random()*piw);
    var ip=Math.floor(Math.random()*pit);
    var lpath=Game.map[i-1];
    if(lpath.dir=="h"){
      Game.map.push(new Path(lpath.x+lpath.t+lpath.w/2,lpath.y-lpath.w,pw[iw],pt[ip],"v",lpath.w,lpath.t));
    }else{
      Game.map.push(new Path(lpath.x+lpath.w*1.5,lpath.y-lpath.t,pw[iw],pt[ip],"h",lpath.w,lpath.t));
    }
  }
}
function ongover(){
  Game.speed=initSpeed;
  document.getElementById("menu").setAttribute("class","gover");
  document.getElementById("msg1").innerText="GameOver";
  document.getElementById("msg2").innerHTML=(score==hscore && score>0?"New Record":"High Score")+"</br><span style=\"font-size:40px;\">"+hscore+"<span>";
  document.getElementById("msg3").innerHTML=(score==hscore && score>0?"":"Your Score</br><span style=\"font-size:40px;\">"+score+"<span>");
}
function explosion(x,y,dir){
  try{
    esound.currentTime=0;
    esound.play();
  }catch(e){}
  var sx=0,sy=0;
  for(n=0;n<20;n++){
  if(dir=="h"){
    var nx=x+player.r;
    var ny=y;
    sx=-5*scale*Math.cos(Math.random()*Math.PI/2);
    sy=3*scale*Math.sin(Math.random()*Math.PI/2);
  }else{
    var nx=x;
    var ny=y-player.r;
    sx=-3*scale*Math.cos(-Math.random()*Math.PI/2);
    sy=-5*scale*Math.sin(-Math.random()*Math.PI/2);
  }
    player.Particles.push(new Particle(nx,ny,Math.random()*sx,Math.random()*sy,player.clr));
  }
}
function changeplayerbg(v){
  if(playerbg+v<0){
    playerbg=player.bgs.length-1;
  }else if(playerbg+v==player.bgs.length){
    playerbg=0;
  }else{
    playerbg+=v;
  }
  if(hscore>=player.minScore[playerbg]){
      document.getElementById("playbtn").style.display="";
      document.getElementById("minScore").style.display="none";
  }else{
    document.getElementById("playbtn").style.display="none";
    document.getElementById("minScore").style.display="";
      document.getElementById("minScore").textContent=player.minScore[playerbg];
  }
  savedata();
}
function savedata(){
  try{
    localStorage.setItem("zhscore",hscore);
    if(hscore>=player.minScore[playerbg]){
      localStorage.setItem("zplayerBg",playerbg);
    }
  }catch(e){}
}
function getdata(){
  try{
    if(localStorage.getItem("zhscore")){
      hscore=localStorage.getItem("zhscore");
      playerbg=1*localStorage.getItem("zplayerBg");
    }
  }catch(e){}
}
/******/
