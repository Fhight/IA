var w=800;
var h=400;
var jugador;
var fondo;
var newGame = true;

var bala, balaD=false, nave;
var bala2, balaD2 = false, nave2;
//Direccion 1=izquierda 2=derecha
var salto, izquierda, derecha, direccion = 1;
var menu;

var velocidadBala;
var despBala;
var velocidadBala2 = 203;
var despBala2;
var despBala2x;
var estatusAire;
var estatuSuelo;
var avanzo;
var quieto;
var nnNetwork2 , nnEntrenamiento2, nnSalida2, datosEntrenamiento2=[];
var nnNetwork , nnEntrenamiento, nnSalida, datosEntrenamiento=[];
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
    
    nnNetwork =  new synaptic.Architect.Perceptron(2, 6, 6, 2);
    nnEntrenamiento = new synaptic.Trainer(nnNetwork);

    nnNetwork2 =  new synaptic.Architect.Perceptron(2, 6, 6, 2);
    nnEntrenamiento2 = new synaptic.Trainer(nnNetwork2);

}

function enRedNeural(){
    nnEntrenamiento.train(datosEntrenamiento, {rate: 0.0003, iterations: 10000, shuffle: true});
}

function redNeuronalAvanzar(){
    nnEntrenamiento2.train(datosEntrenamiento2, {rate: 0.0003, iterations: 10000, shuffle: true});
}

function datosDeEntrenamiento(param_entrada){

    // console.log("Entrada",param_entrada[0]+" "+param_entrada[1]);
    nnSalida = nnNetwork.activate(param_entrada);
    var aire=Math.round( nnSalida[0]*100 );
    var piso=Math.round( nnSalida[1]*100 );
    // console.log("Valor ","En el Aire %: "+ aire + " En el suelo %: " + piso );
    return nnSalida[0]>=nnSalida[1];
}

function datosDeEntrenamientoBala2(param_entrada){    
    // console.log("Entrada2",param_entrada[0]);
    nnSalida2 = nnNetwork2.activate(param_entrada);
    var avanzo=Math.round( nnSalida2[0]*100 );
    var quieto=Math.round( nnSalida2[1]*100 );
    // console.log("Valor ","Avanzo %: "+ avanzo + " Quietos %: " + quieto );    
    return nnSalida2[0] >= nnSalida2[1];
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
                datosEntrenamiento2 = [];
                modoAuto = false;
                newGame = true;
            }else if (mouse_x >=menu_x1 && mouse_x <=menu_x2 && mouse_y >=menu_y1+90 && mouse_y <=menu_y2) {
                newGame = true;
                if(!eCompleto) {
                    console.log('entrenamiento: ', datosEntrenamiento.length)
                    console.log('entrenamiento2: ', datosEntrenamiento2.length)
                    enRedNeural();
                    redNeuronalAvanzar();
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
    jugador.body.position.x = 50;

    bala.body.velocity.x = 0;
    bala.position.x = w-100;

    bala2.body.velocity.y = velocidadBala2;
    bala2.position.y = h-350;
    // bala2.body.velocity.y = velocidadBala2;
    // bala2.position.y = h-350;
    // bala2.position.x = jugador.position.x + Math.random(-1, 1);
    balaD2=false;
    balaD=false;
    // balaD2=false;
}

function saltar(){
    jugador.body.velocity.y = -270;
}

function moverDerecha(){
    if( jugador.body.position.x < 100)
        jugador.body.position.x += 10;
}

function moverDerecha2(){
    
    if( jugador.body.position.x < 100)
        jugador.body.position.x += 20;
}


function update() {

    if(newGame){
        newGame = false;
        jugador.body.position.x = 50;
        nave2.position.x = 50;
        bala2.position.x = 50;
        bala2.position.y = h-350;
    }

    fondo.tilePosition.x -= 1; 

    juego.physics.arcade.collide(bala, jugador, colisionH, null, this);
    juego.physics.arcade.collide(bala2, jugador, colisionH, null, this);

    estatuSuelo = 1;
    estatusAire = 0;
    avanzo = 0;
    quieto = 1;

    if(!jugador.body.onFloor()) {
        estatuSuelo = 0;
        estatusAire = 1;
    }
    if( jugador.body.position.x > 50){
        avanzo = 1;
        quieto = 0;
    }
	bala2.body.velocity.y = velocidadBala2;
    despBala = Math.floor( jugador.position.x - bala.position.x );
    //Devuelve cuanto falta para que la bala impacte al jugador
    despBala2 = Math.floor( jugador.position.y - bala2.position.y );
    despBala2x = Math.floor( jugador.position.x - bala2.position.x );

    if( modoAuto==false && derecha.isDown &&  jugador.body.onFloor() ){
        moverDerecha();
    }

    if( modoAuto==false && salto.isDown &&  jugador.body.onFloor() ){
        saltar();
    }
    
    if( modoAuto == true  && bala.position.x>0 && jugador.body.onFloor()) {

        if( datosDeEntrenamientoBala2( [despBala2, velocidadBala2] )  ){   
            
                moverDerecha2();
        }

        if( datosDeEntrenamiento( [despBala , velocidadBala] ) ){
            saltar();
        }
    }

    if( balaD==false ){
        disparo();
    }

    if( bala.position.x <= 0  ){
        resetVariables();
    }

    if( balaD2==false ){ 
        disparo2();
    }
    
    if( modoAuto ==false  && bala.position.x > 0 ){

        datosEntrenamiento.push({
                'input' :  [despBala , velocidadBala],
                'output':  [estatusAire , estatuSuelo]  
        });       
   }

   if( modoAuto == false && bala2.position.y > 50 ){
        datosEntrenamiento2.push({
                'input' :  [despBala2, velocidadBala2],
                'output':  [avanzo, quieto]  
        });        
   }
}


function disparo(){
    velocidadBala =  -1 * velocidadRandom(300,400);
    bala.body.velocity.y = 0 ;
    bala.body.velocity.x = velocidadBala ;
    balaD=true;
    balaD2=true;
}

function disparo2(){
    bala2.body.velocity.y = velocidadBala2;
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
