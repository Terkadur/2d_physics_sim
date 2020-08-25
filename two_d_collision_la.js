particles = [];
function setup() {
  createCanvas(1152, 1152);
  _fr_ = 64;
  frameRate(_fr_);
  _cpt_ = 100; //calcs per tick
  _scale_ = 32;
  // -----------------------  i, m,  p,                   v,                    r
  particles[0] = new Particle(0, 1,  createVector(2, 6),  createVector(0, 0),   1);
  particles[1] = new Particle(1, 4,  createVector(16,9),  createVector(0, 0),   2);
  particles[2] = new Particle(2, 9,  createVector(19,17), createVector(0, 0),   5);
  particles[3] = new Particle(3, 12, createVector(8, 10), createVector(12,-17), 6);
  particles[4] = new Particle(4, 5,  createVector(12,27), createVector(0, 0),   3);
}


function draw() {

  //walls
  background(196);
  fill(0);
  strokeWeight(0);
  rect(64, 64, width - 128, height - 128);
  
  strokeWeight(4);
  for (let n = 64; n <= width - 64; n += _scale_) {
    line(n, height - 64, n, height - 48);
  }
  for (let n = 64; n <= height - 64; n += _scale_) {
    line(48, n, 64, n);
  }
  
  //move particles
  for (let j = 0; j < _cpt_; j++) {
    for (let i = 0; i < particles.length; i++) {
      particles[i].move();
    }
  }
  let energy = 0;
  //show particles
  for (let i = 0; i < particles.length; i++) {
    particles[i].show();
    
    energy += 0.5 * particles[i].m * particles[i].v.dot(particles[i].v);
  }
  print(energy);
}

function Particle(i, m, p, v, r) {
  this.i = i;
  this.m = m;
  this.p = p;
  this.v = v;
  this.r = r;
  
  this.show = function() {
    let _x_ = this.p.x*_scale_ + 64;
    let _y_ = height - (this.p.y*_scale_ + 64);
    let _r_ = this.r*_scale_;
    
    strokeWeight(0);
    fill(255);
    ellipse(_x_, _y_, 2*_r_);
    
    textAlign(CENTER, CENTER);
    textSize(32);
    fill(0);
    text(this.m, _x_, _y_);
  };
  
  this.move = function() {
    if (this.p.x < 0 + this.r || this.p.x > 32 - this.r) {
      this.v.x *= -1;
    }
    
    if (this.p.y < 0 + this.r|| this.p.y > 32 - this.r) {
      this.v.y *= -1;
    }
    this.collide();   
    this.p = p5.Vector.add(this.p, p5.Vector.div(this.v, _fr_*_cpt_));
  };
  
  this.collide = function() {
    for (let j = 0; j < particles.length; j++) {
      let that = particles[j];
      if (j <= this.i) {
        continue;
      }
      
      let _r_ = this.r + that.r;
      let disp = p5.Vector.sub(that.p, this.p);
      
      if (disp.mag() <= _r_) {
        let this_a_sc = this.v.dot(disp)/disp.mag();
        let that_a_sc = that.v.dot(disp)/disp.mag();
        let this_a = p5.Vector.mult(disp, this_a_sc/disp.mag());
        let that_a = p5.Vector.mult(disp, that_a_sc/disp.mag());
        
        let p = this.m*this_a_sc + that.m*that_a_sc;
        let K = 0.5*(this.m*this_a_sc*this_a_sc + that.m*that_a_sc*that_a_sc);
        
        let A = 0.5*this.m + 0.5*this.m*this.m/that.m;
        let B = -p*this.m/that.m;
        let C = 0.5*p*p/that.m - K;
        let poss = quad_form(A, B, C);
        
        if (abs(poss[0] - this_a_sc) < abs(poss[1] - this_a_sc)) {
          this_a_sc = poss[1];
        } else {
          this_a_sc = poss[0];
        }
        
        that_a_sc = (p - this.m*this_a_sc)/that.m;
        
        let this_a_new = p5.Vector.mult(disp, this_a_sc/disp.mag());
        let that_a_new = p5.Vector.mult(disp, that_a_sc/disp.mag());
        
        this.v.sub(this_a);
        this.v.add(this_a_new);
        
        that.v.sub(that_a);
        that.v.add(that_a_new);
      }
    }
  };
}

function quad_form(a, b, c) {
  numer1 = -b;
  numer2 = sqrt(b*b - 4*a*c);
  denom = 2*a;
  
  return [(numer1 + numer2)/denom, (numer1 - numer2)/denom];
}
