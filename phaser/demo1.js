var w=800;
var h=400;
var jugador;
var fondo;

var bala, balaD=false, nave;
var bala2, balaD2 = false, nave2;

var salto;
var izquierda;
var derecha;

var menu;

var velocidadBala;
var velocidadBala2;
var despBala;
var despBala2;
var estatusAire;
var estatuSuelo;

var nnNetwork , nnEntrenamiento, nnSalida, nnSalida2, datosEntrenamiento=[];
var modoAuto = false, eCompleto=false;



var juego = new Phaser.Game(w, h, Phaser.CANVAS, '', { preload: preload, create: create, update: update, render:render});

function preload() {
    juego.load.image('fondo', 'assets/game/fondo.jpg');
    juego.load.spritesheet('mono', 'assets/sprites/altair.png',32 ,48);
    juego.load.image('nave', 'assets/game/ufo.png');    
    juego.load.image('bala', 'assets/sprites/purple_ball.png');
    juego.load.image('menu', 'assets/game/menu.png');
}



function create() {

    juego.physics.startSystem(Phaser.Physics.ARCADE);
    juego.physics.arcade.gravity.y = 800;
    juego.time.desiredFps = 30;

    fondo = juego.add.tileSprite(0, 0, w, h, 'fondo');

    nave = juego.add.sprite(w-100, h-70, 'nave');
    nave2 = juego.add.sprite(20, h-400, 'nave');

    bala = juego.add.sprite(w-100, h, 'bala');
    bala2 = juego.add.sprite(55, h-350, 'bala');

    jugador = juego.add.sprite(50, h, 'mono');


    juego.physics.enable(jugador);
    jugador.body.collideWorldBounds = true;
    var corre = jugador.animations.add('corre',[8,9,10,11]);
    jugador.animations.play('corre', 10, true);

    juego.physics.enable(bala);
    bala.body.collideWorldBounds = true;

    juego.physics.enable(bala2);
    bala2.body.collideWorldBounds = true;

    pausaL = juego.add.text(w - 100, 20, 'Pausa', { font: '20px Arial', fill: '#fff' });
    pausaL.inputEnabled = true;
    pausaL.events.onInputUp.add(pausa, self);
    juego.input.onDown.add(mPausa, self);

    salto = juego.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    izquierda = juego.input.keyboard.addKey(Phaser.Keyboard.A)
    derecha = juego.input.keyboard.addKey(Phaser.Keyboard.D)

    nnNetwork =  new synaptic.Architect.Perceptron(2,3,3,2);
    nnEntrenamiento = new synaptic.Trainer(nnNetwork);

}

function enRedNeural(){
    nnEntrenamiento.train(datosEntrenamiento, {rate: 0.03, iterations: 10000, shuffle: true});
}


function datosDeEntrenamiento(param_entrada, param_entrada2){

    console.log("Entrada",param_entrada[0]+" "+param_entrada[1]+" "+param_entrada2[0]+" "+param_entrada2[1]);
    nnSalida = nnNetwork.activate(param_entrada);
    var aire=Math.round( nnSalida[0]*100 );
    var piso=Math.round( nnSalida[1]*100 );
    
    nnSalida2 = nnNetwork.activate(param_entrada);
    var aire2=Math.round( nnSalida2[0]*100 );
    var piso2=Math.round( nnSalida2[1]*100 );
    console.log(nnSalida2)

    console.log("Valor ","En el salida %:  %: " + aire );
    return nnSalida[0]>=nnSalida[1];
//	return aire>80;

}



function pausa(){
    juego.paused = true;
    menu = juego.add.sprite(w/2,h/2, 'menu');
    menu.anchor.setTo(0.5, 0.5);
}

function mPausa(event){
    if(juego.paused){
        var menu_x1 = w/2 - 270/2, menu_x2 = w/2 + 270/2,
            menu_y1 = h/2 - 180/2, menu_y2 = h/2 + 180/2;

        var mouse_x = event.x  ,
            mouse_y = event.y  ;

        if(mouse_x > menu_x1 && mouse_x < menu_x2 && mouse_y > menu_y1 && mouse_y < menu_y2 ){
            if(mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1 && mouse_y <=menu_y1+90){
                eCompleto=false;
                datosEntrenamiento = [];
                modoAuto = false;
            }else if (mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1+90 && mouse_y <=menu_y2) {
                if(!eCompleto) {
                    console.log("","Entrenamiento "+ datosEntrenamiento.length +" valores" );
                    enRedNeural();
                    eCompleto=true;
                }
                modoAuto = true;
            }

            menu.destroy();
            resetVariables();
            juego.paused = false;

        }
    }
}


function resetVariables(){
    jugador.body.velocity.x=0;
    jugador.body.velocity.y=0;
    bala.body.velocity.x = 0;
    bala.position.x = w-100;
    // jugador.position.x=50;
    
    bala2.body.velocity.y = 0;
    bala2.position.y = h-350;

    balaD=false;
    balaD2=false;
}


function saltar(){
    jugador.body.velocity.y = -270;
}

function moverIzquierda(){
    jugador.body.position.x += -5;
}

function moverDerecha(){
    jugador.body.position.x += 5;
}

function update() {

    fondo.tilePosition.x -= 1; 
    juego.physics.arcade.collide(bala, jugador, colisionH, null, this);
    juego.physics.arcade.collide(bala2, jugador, colisionH, null, this);

    estatuSuelo = 1;
    estatusAire = 0;

    if(!jugador.body.onFloor()) {
        estatuSuelo = 0;
        estatusAire = 1;
    }
	
    despBala = Math.floor( jugador.position.x - bala.position.x );
    despBala2 = Math.floor( jugador.position.y - bala2.position.y );

    if( modoAuto==false && izquierda.isDown &&  jugador.body.onFloor() ){
        moverIzquierda();
    }

    if( modoAuto==false && derecha.isDown &&  jugador.body.onFloor() ){
        moverDerecha();
    }

    if( modoAuto==false && salto.isDown &&  jugador.body.onFloor() ){
        saltar();
    }
    //Jugador debe moverse a la derecha si bala2.position.y es mayor o igual a 250
    if( modoAuto == true  && bala.position.x>0 && bala2.position.y > 240 && jugador.body.onFloor()) {

<<<<<<< HEAD
        if( datosDeEntrenamiento( [despBala , velocidadBala] )  ){
=======
        if( datosDeEntrenamiento( [despBala , velocidadBala], [despBala2, velocidadBala2] )  ){
            moverDerecha();
>>>>>>> 4d1bc50a9f668276cda727ea15759aa57f565880
            saltar();
        }
    }

    if( balaD==false){
        disparo();
    }

    if( balaD2 == false){
        disparo2();
    }

    if( bala.position.x <= 0 && bala2.position.y >= 0){
        resetVariables();
    }
    
    if( modoAuto ==false  && bala.position.x > 0 ){

        datosEntrenamiento.push({
<<<<<<< HEAD
                'input' :  [despBala , velocidadBala],
=======
                'input' :  [despBala , velocidadBala, despBala2, velocidadBala2],
>>>>>>> 4d1bc50a9f668276cda727ea15759aa57f565880
            'output':  [estatusAire, estatuSuelo ]  
        });

        console.log(despBala, + " " +velocidadBala, + " "+ estatusAire,+" "+  estatuSuelo);
   }

}


function disparo(){
    velocidadBala =  -1 * velocidadRandom(300,700);
    bala.body.velocity.y = 0 ;
    bala.body.velocity.x = velocidadBala ;
    balaD=true;
}

function disparo2(){
    velocidadBala2 =  -1 * velocidadRandom(700,800);
    bala2.body.velocity.y = velocidadBala2 ;
    bala2.body.velocity.x = 0 ;
    balaD2=true;
}

function colisionH(){
    pausa();
}

function velocidadRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function render(){

}
