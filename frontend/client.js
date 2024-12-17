
const socket = io('http://localhost:8888');


//-------------------Fonction qui déplace vue damier selon la position de la souris-----------------

function setupScroll(id){
    var x ;
    var y ;
    document.addEventListener("mousemove",(event)=>{
        x = event.clientX
        y = event.clientY
    })

    
    const plateaujeu = document.getElementById(id);
    function scroll() {
        let threshold = 150;
        let scrollAmount = 15;
        const rect = plateaujeu.getBoundingClientRect();
            if(x >= rect.right - threshold && x<rect.right){ 
                d3.select("#"+id).property("scrollLeft", d3.select("#"+id).property("scrollLeft") +scrollAmount);
            }else if(x <= rect.left + threshold && x>rect.left){
                d3.select("#"+id).property("scrollLeft", d3.select("#"+id).property("scrollLeft") -scrollAmount);
            }

            if(y <= rect.top + threshold && y>rect.top){
                d3.select("#"+id).property("scrollTop", d3.select("#"+id).property("scrollTop") -scrollAmount);
            }else  if(y >= rect.bottom - threshold  && y<rect.bottom){
                d3.select("#"+id).property("scrollTop", d3.select("#"+id).property("scrollTop") +scrollAmount);
            }


    }   
    return setInterval(scroll, 30);
}


//------------------------------MAIN---------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {
    


    // attributs global
    let cite;
    let map;

    // attributs du joueur
    let idPartie;
    let nomPartie;
    let idJoueur;
    let maCite;
    let pseudo;

    const beotie = document.getElementById("beotie");
    const attique = document.getElementById("attique");
    const argolide = document.getElementById("argolide");

    const pseudoInput = document.getElementById("usernameInput")

    socket.emit("getListeParties","")
    socket.on("getListeParties",data=>{
        afficherListeParties(data);

    });

    function  refreshGame(){
        console.log("je rafraichi")
        if (idPartie==undefined){
            socket.emit("getListeParties","")
           setTimeout(refreshGame, 1000);;
        }

    }
    refreshGame();

    

    // créer une partie
    document.getElementById("creerPartie").addEventListener("click",()=>{
        const nbJoueurs = document.getElementById("nbJoueurs");
        const nbTours = document.getElementById("nbTours");
        socket.emit("creerPartie",{"nbJoueurs":parseInt(nbJoueurs.value),"nbTours":parseInt(nbTours.value)});

        document.querySelector('.accueil').style.display = 'none';
        document.querySelector('.rejoindrePartie').style.display = 'block';

    });

    // rejoindre le lobby
    document.getElementById("rejoindrePartie").addEventListener("click",()=>{
        pseudo = pseudoInput.value;
        socket.emit("rejoindrePartie",{"idPartie":idPartie,"idJoueur":idJoueur,"maCite":maCite,nom:pseudoInput.value});
    });
    
    
    beotie.addEventListener("click",()=>{
        maCite = "beotie";
        fill(cite.beotie,"red","prev");
        fill(cite.attique,"url(#"+map.terrain[cite.attique]+"-pattern","prev");
        fill(cite.argolide,"url(#"+map.terrain[cite.argolide]+"-pattern","prev");
    });

    attique.addEventListener("click",()=>{
        maCite = "attique"
        fill(cite.attique,"red","prev");
        fill(cite.beotie,"url(#"+map.terrain[cite.beotie]+"-pattern","prev");
        fill(cite.argolide,"url(#"+map.terrain[cite.argolide]+"-pattern","prev");
    });

    argolide.addEventListener("click",()=>{
        maCite = "argolide"
        fill(cite.argolide,"red","prev");
        fill(cite.beotie,"url(#"+map.terrain[cite.beotie]+"-pattern","prev");
        fill(cite.attique,"url(#"+map.terrain[cite.attique]+"-pattern","prev");
    }); 

   socket.on("lobbyPartie",(data)=>{
        //{"terrain":la map,"width":int,"height":int,"positionsCites":{"béotie":215,"attique":1072,"argolide":297},"idPartie":int,"idJoueur":int}

        
        document.querySelector('.accueil').style.display = 'none';
        document.querySelector('.rejoindrePartie').style.display = 'block';

    
        créerDamier(data.map.height,data.map.width,32,"jeuprev","prev");
        appelsAjoutTextures("jeuprev")
        actualiserDamier(data.map.width,data.map.height,data.map.terrain,"prev");

        cite = data.positionCites;
        map = data.map;
        idPartie= data.idPartie;
        nomPartie = data.nom
        idJoueur = data.idJoueur;


        setupScroll("damierPrev");
        afficherNomPartie(nomPartie);
   });

   socket.on("erreurRejoindreLobby",()=>{
    console.log("peut pas rejoindre aaa")
   });

    socket.on("rejoindrePartie",data=>{
        if (data){
            document.getElementById("droiteAll").innerHTML="";
            d3.select("#droiteAll").append("div").text("Connecté en tant que "+pseudo);

            switch(maCite){
                case "beotie":
                    fill(cite.beotie,"green","prev");
                    break;
                default:
                    fill(cite[maCite],"green","prev");
            }
        }
    });

   

socket.on("commencerPartie",data=>{
    document.querySelector('.rejoindrePartie').innerHTML=""
    document.querySelector('.rejoindrePartie').style.display = 'none';
    document.querySelector('.partie').style.display = 'block';

    socket.emit("demandeDamier",idJoueur)
})


socket.on("demandeDamier",data=>{
    console.log(data)
    terrain = data.terrain
    board = terrain.board
    créerDamier(data.height,data.width,32,"jeu","h") // damier de jeu
    
    actualiserDamier(data.width,data.height,data.terrain,"h")
    appelsAjoutTextures("jeu");
    setupScroll("damierjeu")
    ajouterUnites(data.board,"jeu")


})


});

