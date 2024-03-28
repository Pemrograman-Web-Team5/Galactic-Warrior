//ukuran board 
let tileSize = 31;
let rows = 15;
let columns = 15;

let board;
let boardWidth = tileSize * columns; //32*16
let boardHeight = tileSize * rows; //32*16
let context;

//ukuran rocket
let rocketWidth = tileSize * 2;
let rocketHeight = tileSize * 2;
let rocketX = (tileSize * columns) / 2 - tileSize;
let rocketY = tileSize * rows - tileSize * 2;

//letak awal roket
let rocket = {
  x: rocketX,
  y: rocketY,
  width: rocketWidth,
  height: rocketHeight,
};

let rocketImg;
let rocketVelocityX = tileSize; //rocket moving speed

//ukuran alien
let alienArray = [];
let alienWidth = tileSize;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

//jumalh awal alien
let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; //jumlah alien yang harus dikalahkan
let alienVelocityX = 1; //kecepatan alien

//peluru
let bulletArray = [];
let bulletVelocity = -10; //kecepatan peluru

let score = 0; //score awal
let gameOver = false;

//game awal mulai
window.onload = function () {
  board = document.getElementById("board");
  board.width = boardWidth;
  board.height = boardHeight;
  context = board.getContext("2d"); //untuk menggambar board


  //muncul gambar 
  rocketImg = new Image();
  rocketImg.src = "./Asset/rocket.png";
  rocket.onload = function () {
    context.drawImage(
      rocketImg,
      rocket.x,
      rocket.y,
      rocket.width,
      rocket.height
    );
  };

  alienImg = new Image();
  alienImg.src = "./Asset/alien1.png";
  createAliens();

  //menggerakkan roket
  requestAnimationFrame(update);
  document.addEventListener("keydown", moveRocket);
  document.addEventListener("keyup", shoot);
  //memanggil button pause dan play
  document.getElementById("pauseButton").addEventListener("click", pauseGame);
  document.getElementById("playButton").addEventListener("click", playGame);
};

//update game
function update() {
  requestAnimationFrame(update);

  if (gameOver) {
    return;
  }

  context.clearRect(0, 0, board.width, board.height);

  //rocket
  context.drawImage(rocketImg, rocket.x, rocket.y, rocket.width, rocket.height);

  //alien
  for (let i = 0; i < alienArray.length; i++) {
    let alien = alienArray[i];
    if (alien.alive) {
      alien.x += alienVelocityX;

      // if alien menyentuh outline kanan kiri
      if (alien.x + alien.width >= board.width || alien.x <= 0) {
        alienVelocityX *= -1;
        alien.x += alienVelocityX * 2;

        //perpindahan alien kebawah
        for (let j = 0; j < alienArray.length; j++) {
          alienArray[j].y += alienHeight;
        }
      }
      context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

      if (alien.y >= rocket.y) {
        gameOver = true;
      }
    }
  }
  //peluru keluar terus menerus
  for (let i = 0; i < bulletArray.length; i++) {
    let bullet = bulletArray[i];
    bullet.y += bulletVelocity;
    context.fillStyle = "white";
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

    //peluru kena alien
    for (let j = 0; j < alienArray.length; j++) {
      let alien = alienArray[j];
      if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
        bullet.used = true;
        alien.alive = false;
        alienCount--;
        score += 100;
      }
    }
  }

  //peluru hilang ketika terkena alien dan outline atas
  while (
    bulletArray.length > 0 &&
    (bulletArray[0].used || bulletArray[0].y < 0)
  ) {
    bulletArray.shift(); //menghapus first element of array
  }

  //next level
  if (alienCount == 0) {
    //menambah jumlah alien dalam kolom dan baris sebanyak 1
    alienColumns = Math.min(alienColumns + 1, columns / 2 - 2); // cap at 16/2 -2 = 6
    alienRows = Math.min(alienRows + 1, rows - 4); //cap at 16-4 = 12
    alienVelocityX += 0.2; // menambah kecepatan alien per next level
    alienArray = [];
    bulletArray = [];
    createAliens();
  }

  //score
  context.fillStyle = "white";
  context.font = " bold 15px Open Sans";
  context.fillText("Score : " + score, 15, 25);
}

//perpindahan roket
function moveRocket(e) {
  if (gameOver) {
    return;
  }
  if (e.code == "ArrowLeft" && rocket.x - rocketVelocityX >= 0) {
    rocket.x -= rocketVelocityX; //pindah ke kiri
  } else if (
    e.code == "ArrowRight" &&
    rocket.x + rocketVelocityX + rocket.width <= board.width
  ) {
    rocket.x += rocketVelocityX; // pindah ke kanan
  }
}

//menampilkan alien
function createAliens() {
  for (let c = 0; c < alienColumns; c++) {
    for (let r = 0; r < alienRows; r++) {
      let alien = {
        img: alienImg,
        x: alienX + c * alienWidth,
        y: alienY + r * alienHeight,
        width: alienWidth,
        height: alienHeight,
        alive: true,
      };
      alienArray.push(alien);
    }
  }
  alienCount = alienArray.length;
}
// menembak
function shoot(e) {
  if (gameOver) {
    return;
  }
  if (e.code == "Space") {
    //shoot
    let bullet = {
      x: rocket.x + (rocketWidth * 15) / 32,
      y: rocket.y,
      width: tileSize / 8,
      height: tileSize / 2,
      used: false,
    };
    bulletArray.push(bullet);
  }
}
//mendeteksi tabrakan
function detectCollision(a, b) {
  return (
    a.x < b.x + b.width && // a's top left corner doesn't reach b's top right corner
    a.x + a.width > b.x && //a's top right corner passes b's top left corner
    a.y < b.y + b.height && //a's top left corner doesnt reach b's bottom left corner
    a.y + a.height > b.y
  ); // a's bottom left corner passes b's top left corner
}
// pause
function pauseGame() {
  gameOver = true;
}
//play
function playGame() {
  if (gameOver) {
    gameOver = false;
  }
}
