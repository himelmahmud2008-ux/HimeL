(()=>{
const c=document.getElementById('world'),x=c.getContext('2d'),overlay=document.getElementById('overlay');
const WORLD={w:2600,h:2100},player={x:1300,y:1050,r:17,hp:100,speed:3.2};
let cam={x:0,y:0},keys={},mouse={x:0,y:0,down:false},shots=[],drones=[],cores=[],particles=[],score=0,started=false,done=false,last=0,frame=0,mobileMove=null;
const buildings=[];
for(let row=0;row<7;row++)for(let col=0;col<9;col++){let bx=100+col*280,by=100+row*280;if(Math.abs(bx-1300)<250&&Math.abs(by-1050)<250)continue;buildings.push({x:bx,y:by,w:150+(col%3)*22,h:130+(row%3)*25,hue:(row*40+col*22)%360})}
function resize(){let r=c.getBoundingClientRect();c.width=Math.max(320,Math.floor(r.width*devicePixelRatio));c.height=Math.max(260,Math.floor(r.height*devicePixelRatio))}
new ResizeObserver(resize).observe(c);resize();
const rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function spawn(){for(let i=0;i<8;i++)drones.push({x:rand(100,WORLD.w-100),y:rand(100,WORLD.h-100),r:15,hp:2,speed:rand(.65,1.1),phase:rand(0,6)});for(let i=0;i<5;i++)cores.push({x:rand(150,WORLD.w-150),y:rand(150,WORLD.h-150),r:12,got:false})}
function reset(){player.x=1300;player.y=1050;player.hp=100;shots=[];drones=[];cores=[];particles=[];score=0;frame=0;done=false;started=true;spawn();overlay.classList.add('hide');hud()}
function hud(){document.getElementById('energy').textContent=Math.max(0,Math.round(player.hp));document.getElementById('cores').textContent=cores.filter(o=>o.got).length;document.getElementById('drones').textContent=drones.length;document.getElementById('best').textContent=score}
function circleRect(cx,cy,r,b){let px=clamp(cx,b.x,b.x+b.w),py=clamp(cy,b.y,b.y+b.h);return Math.hypot(cx-px,cy-py)<r}
function blocked(nx,ny){return buildings.some(b=>circleRect(nx,ny,player.r,b))}
function burst(px,py,color){for(let i=0;i<10;i++)particles.push({x:px,y:py,vx:rand(-2,2),vy:rand(-2,2),life:30,color})}
function move(dt){let dx=(keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0),dy=(keys.s||keys.ArrowDown?1:0)-(keys.w||keys.ArrowUp?1:0);if(mobileMove){dx+=mobileMove.dx;dy+=mobileMove.dy}let n=Math.hypot(dx,dy)||1;dx=dx/n*player.speed*dt*60;dy=dy/n*player.speed*dt*60;if(!blocked(player.x+dx,player.y))player.x=clamp(player.x+dx,20,WORLD.w-20);if(!blocked(player.x,player.y+dy))player.y=clamp(player.y+dy,20,WORLD.h-20)}
function update(dt){if(!started||done)return;frame++;move(dt);if(mouse.down&&frame%9===0){let tx=mouse.x+cam.x,ty=mouse.y+cam.y,a=Math.atan2(ty-player.y,tx-player.x);shots.push({x:player.x+Math.cos(a)*22,y:player.y+Math.sin(a)*22,vx:Math.cos(a)*10,vy:Math.sin(a)*10,life:55})}
for(let i=shots.length-1;i>=0;i--){let s=shots[i];s.x+=s.vx*dt*60;s.y+=s.vy*dt*60;s.life--;let hit=false;for(let j=drones.length-1;j>=0;j--){let d=drones[j];if(Math.hypot(s.x-d.x,s.y-d.y)<d.r+5){d.hp--;shots.splice(i,1);hit=true;burst(d.x,d.y,'#ff70dd');if(d.hp<=0){drones.splice(j,1);score+=100}break}}if(!hit&&(s.life<=0||s.x<0||s.y<0||s.x>WORLD.w||s.y>WORLD.h))shots.splice(i,1)}
for(const d of drones){let a=Math.atan2(player.y-d.y,player.x-d.x);d.x+=Math.cos(a)*d.speed*dt*60;d.y+=Math.sin(a)*d.speed*dt*60;if(Math.hypot(player.x-d.x,player.y-d.y)<player.r+d.r){player.hp-=.18*dt*60}}
for(const o of cores){if(!o.got&&Math.hypot(player.x-o.x,player.y-o.y)<player.r+o.r+8){o.got=true;score+=250;burst(o.x,o.y,'#65ffe3')}}
for(let i=particles.length-1;i>=0;i--){let p=particles[i];p.x+=p.vx;p.y+=p.vy;p.life--;if(p.life<=0)particles.splice(i,1)}
cam.x=clamp(player.x-c.width/2,0,WORLD.w-c.width);cam.y=clamp(player.y-c.height/2,0,WORLD.h-c.height);
hud();if(player.hp<=0||cores.every(o=>o.got)){done=true;overlay.classList.remove('hide');overlay.querySelector('h2').textContent=player.hp<=0?'MISSION FAILED':'CITY SECURED';overlay.querySelectorAll('p')[0].textContent='Score: '+score+' · Data cores: '+cores.filter(o=>o.got).length+'/5';overlay.querySelector('button').textContent='PLAY AGAIN'}}
function draw(){let w=c.width,h=c.height;x.clearRect(0,0,w,h);x.save();x.scale(devicePixelRatio,devicePixelRatio);let cw=w/devicePixelRatio,ch=h/devicePixelRatio;x.translate(-cam.x/devicePixelRatio,-cam.y/devicePixelRatio);x.fillStyle='#101c25';x.fillRect(0,0,WORLD.w,WORLD.h);
x.fillStyle='#182b35';for(let i=0;i<9;i++){x.fillRect(i*280,0,72,WORLD.h)}for(let i=0;i<8;i++){x.fillRect(0,i*280,WORLD.w,72)}
x.strokeStyle='#45616a55';x.setLineDash([16,18]);for(let i=0;i<9;i++){x.beginPath();x.moveTo(i*280+36,0);x.lineTo(i*280+36,WORLD.h);x.stroke()}for(let i=0;i<8;i++){x.beginPath();x.moveTo(0,i*280+36);x.lineTo(WORLD.w,i*280+36);x.stroke()}x.setLineDash([]);
for(const b of buildings){let g=x.createLinearGradient(b.x,b.y,b.x+b.w,b.y+b.h);g.addColorStop(0,'hsl('+b.hue+' 48% 22%)');g.addColorStop(1,'#101426');x.fillStyle=g;x.shadowBlur=16;x.shadowColor='hsl('+b.hue+' 90% 50%)';x.fillRect(b.x,b.y,b.w,b.h);x.shadowBlur=0;x.strokeStyle='hsl('+b.hue+' 80% 65% / .5)';x.strokeRect(b.x,b.y,b.w,b.h);x.fillStyle='#8deaff77';for(let wx=b.x+16;wx<b.x+b.w-8;wx+=28)for(let wy=b.y+18;wy<b.y+b.h-8;wy+=27)x.fillRect(wx,wy,9,10)}
for(const o of cores)if(!o.got){x.shadowBlur=28;x.shadowColor='#5effdf';x.fillStyle='#7bffe8';x.beginPath();x.arc(o.x,o.y,o.r+Math.sin(frame*.1)*3,0,Math.PI*2);x.fill();x.shadowBlur=0}
for(const d of drones){x.shadowBlur=20;x.shadowColor='#ff4fa9';x.fillStyle='#ff65b7';x.beginPath();x.arc(d.x,d.y,d.r,0,Math.PI*2);x.fill();x.fillStyle='#fff';x.fillRect(d.x-5,d.y-3,10,5);x.shadowBlur=0}
for(const s of shots){x.fillStyle='#a6ffff';x.shadowBlur=16;x.shadowColor='#6dfaff';x.beginPath();x.arc(s.x,s.y,5,0,Math.PI*2);x.fill();x.shadowBlur=0}
for(const p of particles){x.globalAlpha=p.life/30;x.fillStyle=p.color;x.fillRect(p.x,p.y,4,4)}x.globalAlpha=1;
x.shadowBlur=25;x.shadowColor='#61edff';x.fillStyle='#d8ffff';x.beginPath();x.arc(player.x,player.y,player.r,0,Math.PI*2);x.fill();x.strokeStyle='#54eaff';x.lineWidth=3;x.stroke();x.shadowBlur=0;
x.restore();
}
function loop(t){let dt=Math.min(.04,(t-last)/1000||.016);last=t;update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
window.addEventListener('keydown',e=>{keys[e.key]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault()});window.addEventListener('keyup',e=>keys[e.key]=false);
function coords(e){let r=c.getBoundingClientRect();mouse.x=(e.clientX-r.left)/r.width*c.width/devicePixelRatio;mouse.y=(e.clientY-r.top)/r.height*c.height/devicePixelRatio}
c.addEventListener('pointerdown',e=>{coords(e);if(e.clientX<c.getBoundingClientRect().left+c.getBoundingClientRect().width*.42&&e.pointerType==='touch'){mobileMove={dx:0,dy:0,startX:e.clientX,startY:e.clientY}}else mouse.down=true});
c.addEventListener('pointermove',e=>{coords(e);if(mobileMove){let r=c.getBoundingClientRect();mobileMove.dx=clamp((e.clientX-mobileMove.startX)/70,-1,1);mobileMove.dy=clamp((e.clientY-mobileMove.startY)/70,-1,1)}});
window.addEventListener('pointerup',()=>{mouse.down=false;mobileMove=null});
document.getElementById('start').addEventListener('click',reset);
})();