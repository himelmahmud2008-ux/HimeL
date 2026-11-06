(()=> {
const root=document.querySelector('#game'); if(!root)return;
const key=root.dataset.game, canvas=document.querySelector('canvas'),ctx=canvas.getContext('2d');
const configs={
'sky-patrol':['Sky Patrol','Dodge storm clouds and collect stars','dodge','✦'],
'neon-shooter':['Cosmic Pulse','Blast incoming space drones with energy pulses','shooter','✧'],
'jungle-dash':['Jungle Dash','Run, jump and collect jungle gems','runner','◆'],
'cyber-soccer':['Cyber Soccer','Score goals against the moving keeper','soccer','⚽'],
'drift-city':['Drift City','Steer through neon traffic and survive','racer','▰'],
'crystal-quest':['Crystal Quest','Collect crystals while avoiding roaming bots','collect','◇'],
'maze-runner':['Maze Runner','Find the exit before time runs out','maze','⌁'],
'tower-stack':['Tower Stack','Drop platforms and build the tallest tower','stack','▤'],
'bubble-pop':['Bubble Pop','Pop matching color bubbles for combos','pop','●'],
'pixel-platform':['Pixel Jumper','Jump between platforms and climb higher','platform','▰'],
'laser-dodge':['Laser Dodge','Move through shifting laser gates','dodge','╳'],
'orbital-defense':['Orbital Defense','Protect your core from incoming meteors','defense','◉'],
'wave-surfer':['Wave Surfer','Ride the waves and avoid floating rocks','runner','≈'],
'color-shift':['Color Shift','Pass through gates matching your color','switch','◒'],
'rocket-rescue':['Rocket Rescue','Pilot a rocket and rescue lost satellites','collect','✦'],
'drone-race':['Drone Race','Race through glowing checkpoints','racer','⌁']
};
const cfg=configs[key]||configs['sky-patrol'];document.title=cfg[0]+' — VORTEX';
const W=960,H=540;let w=W,h=H,player,items=[],parts=[],score=0,best=0,lives=3,tick=0,over=false,started=false,keys={},pointer={x:W/2,y:H-90,down:false},last=0,frame=0,level=1;
try{best=+(localStorage.getItem('vx-'+key)||0)}catch(e){}
function resize(){const r=canvas.getBoundingClientRect();canvas.width=Math.max(320,Math.floor(r.width*devicePixelRatio));canvas.height=Math.max(220,Math.floor(r.height*devicePixelRatio));w=canvas.width;h=canvas.height}
new ResizeObserver(resize).observe(canvas);resize();
const rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function reset(){player={x:w*.5,y:h*.78,vx:0,vy:0,r:Math.min(w,h)*.025,color:'#8efcff'};items=[];parts=[];score=0;lives=3;tick=0;over=false;started=true;level=1;document.querySelector('#pause').textContent='Ⅱ Pause';document.querySelector('#score').textContent='0';document.querySelector('#lives').textContent='♥♥♥';document.querySelector('#best').textContent=best;document.querySelector('#overlay').classList.add('hide')}
function burst(x,y,color,n=12){for(let i=0;i<n;i++)parts.push({x,y,vx:rand(-3,3)*devicePixelRatio,vy:rand(-3,3)*devicePixelRatio,life:rand(20,45),color})}
function spawn(){let type=cfg[2],r=rand(10,24)*devicePixelRatio;
let x=rand(r,w-r),y=-r;
items.push({x,y,r,vy:rand(2,4)*devicePixelRatio+level*.18,vx:rand(-1,1)*devicePixelRatio,kind:Math.random()<.24?'good':'bad',hue:rand(170,320),phase:rand(0,6)})}
function hit(a,b){return Math.hypot(a.x-b.x,a.y-b.y)<a.r+b.r}
function update(dt){if(!started||over)return;tick+=dt;frame++;
let sp=5*devicePixelRatio;
if(keys.ArrowLeft||keys.a)player.x-=sp*dt*60;if(keys.ArrowRight||keys.d)player.x+=sp*dt*60;
if(keys.ArrowUp||keys.w)player.y-=sp*dt*60;if(keys.ArrowDown||keys.s)player.y+=sp*dt*60;
if(pointer.down){player.x+=(pointer.x-player.x)*.16;player.y+=(pointer.y-player.y)*.16}
player.x=clamp(player.x,player.r,w-player.r);player.y=clamp(player.y,h*.28,h-player.r);
if(frame%Math.max(18,48-level*2)===0)spawn();
if(cfg[2]==='stack'&&frame%48===0)items.push({x:rand(100,w-100),y:rand(100,h*.45),r:rand(35,70),vy:0,kind:'good',hue:rand(170,300)});
if(cfg[2]==='pop'&&frame%12===0)items.push({x:rand(25,w-25),y:rand(40,h*.7),r:rand(16,30),vy:0,kind:'good',hue:Math.floor(rand(0,5))*65});
for(let i=items.length-1;i>=0;i--){let o=items[i];o.y+=o.vy*dt*60;o.x+=o.vx*dt*60;
if(cfg[2]==='maze'||cfg[2]==='switch')o.x+=Math.sin(frame*.025+o.phase)*1.4*devicePixelRatio;
if(hit(player,o)){if(o.kind==='good'){score+=10;burst(o.x,o.y,'#73ffe0',15)}else{lives--;burst(player.x,player.y,'#ff547e',20)}items.splice(i,1);if(lives<=0)finish();continue}
if(o.y>h+50){items.splice(i,1);if(o.kind==='bad'&&['dodge','runner','racer','defense'].includes(cfg[2])){lives--;if(lives<=0)finish()}}
}
if(cfg[2]==='shooter'&&keys[' ']){if(frame%10===0){items.push({x:player.x,y:player.y-35,r:8,vy:-9*devicePixelRatio,kind:'shot',hue:185})}}
if(cfg[2]==='shooter'){for(let i=items.length-1;i>=0;i--){let o=items[i];if(o.kind==='shot'){for(let j=items.length-1;j>=0;j--){let t=items[j];if(t.kind!=='shot'&&hit(o,t)){burst(t.x,t.y,'#ff69d4',10);items.splice(Math.max(i,j),1);items.splice(Math.min(i,j),1);score+=15;break}}}}}
if(frame%600===0)level++;
for(let i=parts.length-1;i>=0;i--){let p=parts[i];p.x+=p.vx;p.y+=p.vy;p.life--;if(p.life<=0)parts.splice(i,1)}
document.querySelector('#score').textContent=score;document.querySelector('#best').textContent=Math.max(best,score);document.querySelector('#lives').textContent='♥'.repeat(Math.max(0,lives));
}
function finish(){over=true;best=Math.max(best,score);try{localStorage.setItem('vx-'+key,best)}catch(e){}document.querySelector('#overlay').classList.remove('hide');document.querySelector('#result').textContent='Score: '+score+' · Best: '+best;document.querySelector('#start').textContent='PLAY AGAIN'}
function draw(){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,w,h);
let bg=ctx.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#090d25');bg.addColorStop(.55,'#151039');bg.addColorStop(1,'#060818');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
for(let i=0;i<75;i++){let x=(i*137+frame*.18)%w,y=(i*83+frame*.45)%h;ctx.fillStyle='rgba(190,220,255,'+(0.2+(i%4)*.13)+')';ctx.fillRect(x,y,2*devicePixelRatio,2*devicePixelRatio)}
ctx.strokeStyle='rgba(93,95,255,.14)';ctx.lineWidth=1;for(let x=0;x<w;x+=48*devicePixelRatio){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}for(let y=0;y<h;y+=48*devicePixelRatio){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
if(cfg[2]==='maze'){ctx.strokeStyle='rgba(111,245,255,.25)';ctx.lineWidth=12*devicePixelRatio;for(let i=0;i<8;i++){ctx.strokeRect((i%4)*w/4+30,h*.2+Math.floor(i/4)*h*.3,w/4-55,h*.22)}}
for(const o of items){ctx.save();ctx.translate(o.x,o.y);ctx.shadowBlur=24*devicePixelRatio;ctx.shadowColor=o.kind==='good'?'#6affdf':'#ff4c9a';ctx.fillStyle=o.kind==='good'?'#73ffe0':o.kind==='shot'?'#fff':'hsl('+o.hue+' 90% 62%)';ctx.beginPath();ctx.arc(0,0,o.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.8)';ctx.lineWidth=2*devicePixelRatio;ctx.stroke();ctx.restore()}
for(const p of parts){ctx.globalAlpha=p.life/45;ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,4*devicePixelRatio,4*devicePixelRatio)}ctx.globalAlpha=1;
ctx.save();ctx.translate(player.x,player.y);ctx.shadowBlur=30*devicePixelRatio;ctx.shadowColor='#65eaff';ctx.fillStyle='#d8ffff';ctx.strokeStyle='#57d9ff';ctx.lineWidth=3*devicePixelRatio;
if(['runner','platform'].includes(cfg[2])){ctx.fillRect(-player.r*.7,-player.r,player.r*1.4,player.r*2);ctx.strokeRect(-player.r*.7,-player.r,player.r*1.4,player.r*2)}
else if(cfg[2]==='soccer'){ctx.beginPath();ctx.arc(0,0,player.r*1.15,0,Math.PI*2);ctx.fill();ctx.stroke()}
else{ctx.beginPath();ctx.moveTo(0,-player.r*1.5);ctx.lineTo(player.r,player.r);ctx.lineTo(0,player.r*.5);ctx.lineTo(-player.r,player.r);ctx.closePath();ctx.fill();ctx.stroke()}
ctx.restore();
ctx.fillStyle='rgba(255,255,255,.7)';ctx.font='bold '+(13*devicePixelRatio)+'px system-ui';ctx.fillText(cfg[1],20*devicePixelRatio,h-18*devicePixelRatio);
}
function loop(t){let dt=Math.min(.033,(t-last)/1000||.016);last=t;update(dt);draw();requestAnimationFrame(loop)}requestAnimationFrame(loop);
window.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys[k]=true;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key))e.preventDefault();if(e.key==='Enter'&&(!started||over))reset()});
window.addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;keys[k]=false});
function pos(e){let r=canvas.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width*w;pointer.y=(e.clientY-r.top)/r.height*h}
canvas.addEventListener('pointerdown',e=>{pointer.down=true;pos(e)});canvas.addEventListener('pointermove',e=>{if(pointer.down)pos(e)});window.addEventListener('pointerup',()=>pointer.down=false);
document.querySelector('#start').addEventListener('click',reset);
document.querySelector('#pause').addEventListener('click',()=>{if(over)return;started=!started;document.querySelector('#pause').textContent=started?'Ⅱ Pause':'▶ Resume'});
document.querySelector('#back').addEventListener('click',()=>location.href='../index.html');
document.querySelector('#overlay').classList.remove('hide');document.querySelector('#result').textContent='Best score: '+best;document.querySelector('#best').textContent=best;
})();