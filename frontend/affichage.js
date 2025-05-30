const socket = io();

//-------------------Création d'hexagone sous forme de tableau de points----------------------------------------
/**
 * creer une liste des points des hexagones
 * @param {Number} rayon 
 * @returns {Array} - la liste des points 
 */
function creerHexagone(rayon) {
    var points = new Array();
    for (var i = 0; i < 6; i++) {
        var angle = i * Math.PI / 3;
        var x = Math.sin(angle) * rayon + 40;
        var y = -Math.cos(angle) * rayon + 40;
        points.push([Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
    }
    return points;
}

//-------------------Création du damier d'hexagones----------------------------------------


/** 
 * créer un damier dans une div donnée
 * @param {number} nbColumns - nombre de colonnes
 * @param {number} nbLines - nombre de lignes
 * @param {number} rayon - rayon des hexagones
 * @param {number} idDamier - identifiant du damier
 * @param {number} idHexa - identifiant des hexagones
*/
function créerDamier(nbColumns, nbLines, rayon, idDamier, idHexa) {
    // console.log("idDamier : " + idDamier)
    document.getElementById(idDamier).style.visibility = "visible";
    document.getElementById(idDamier).innerHTML = "";
    Hexagone = creerHexagone(rayon);

    for (var l = 0; l < nbLines; l++) {
        for (var c = 0; c < nbColumns; c++) {
            var d = "";
            var x, y;

            for (var i = 0; i < 6; i++) {
                h = Hexagone[i];
                x = h[0] + (Hexagone[1][0] - Hexagone[0][0]) * l * 2;
                if (c % 2 == 1) {
                    x += (Hexagone[1][0] - Hexagone[0][0]);
                }
                y = h[1] + (Hexagone[1][1] - Hexagone[0][1]) * c * 3;

                if (i == 0) {
                    d += "M" + x + "," + y + " L";
                } else {
                    d += x + "," + y + " ";
                }
            }
            d += "Z";



            d3.select("#" + idDamier)
                .append("path")
                .attr("d", d)
                .attr("stroke", "transparent")
                .attr("shape-rendering", "crispEdges")
                .attr("id", idHexa + (l * nbColumns + c))
                .attr("class", "hexagones    ")

                .on("mouseover", function () {
                    d3.select(this)
                        .attr("stroke", "orange")
                        .style("stroke-width", 2);
                })

                .on("mouseout", function () {
                    d3.select(this)
                        .attr("stroke", "transparent")
                });
        }
    }
}

//-------------------Coloriage d'un hexagone----------------------------------------
/**
 * actualise la texture/couleur d'un hexagone
 * @param {String} id - id de l'hexagone (position)
 * @param {String} couleur 
 * @param {String} idHexa - type d'hexagone (mini, h, prev)
 */
function fill(id, couleur, idHexa) {
    d3.select(("#" + idHexa + id)).attr("fill", couleur);
}
//-------------------Fonction d'actualisation des textures du damier-----------------
/**
 * actualise les textures des hexagones
 * @param {Number} longueur 
 * @param {Number} largeur 
 * @param {Array} jeu - liste des terrains  
 * @param {String} idHexa - type d'Hexagone
 */
function actualiserDamier(longueur, largeur, jeu, idHexa) {
    for (i = 0; i < longueur * largeur; i++) {
        switch (jeu[i][0]) {
            case "?":
                var stringyahou = jeu[i].substring(1)
                fill(i, "url(#" + stringyahou + "-pattern)", idHexa)
                d3.select("#h" + i).style("filter", "brightness(0.3")
                break
            case "!":

                var stringyahou = jeu[i].substring(2)
                fill(i, "url(#" + stringyahou + "-pattern)", idHexa)
                // console.log("lag " + jeu[i][1]);
                switch (jeu[i][1]) {
                    case "1":
                        d3.select("#h" + i).style("filter", "brightness(0.9) sepia(1) saturate(5) hue-rotate(30deg)");
                        break
                    case "2":
                        d3.select("#h" + i).style("filter", "brightness(0.6) sepia(1) saturate(5) hue-rotate(30deg)");


                        break
                    default:
                        d3.select("#h" + i).style("filter", "brightness(0.3) sepia(1) saturate(5) hue-rotate(30deg)");
                }

                // d3.select("#h" + i).style("filter", "sepia(1) ");
                break
            default:
                fill(i, "url(#" + jeu[i] + "-pattern)", idHexa)
        }
    }
}

/**
 * ajoute une texture à un hexagone 
 * @param {String} id - id de l'hexagone
 * @param {String} url - lien vers la texture
 * @param {String} selected - id de la div du damier 
 */
function ajouterTextures(id, url, selected) {
    let defs = d3.select("#" + selected).append("defs");

    // Plaines
    defs.append("pattern")
        .attr("id", id)
        .attr("width", 1)
        .attr("height", 1)
        .attr("patternContentUnits", "objectBoundingBox")
        .append("image")
        .attr("xlink:href", url)
        .attr("width", 1)
        .attr("height", 1)
        .attr("preserveAspectRatio", "none");
}
/**
 * ajoute les textures d'un damier
 * @param {String} selected - div où les textures doivent être ajouté
 */
function appelsAjoutTextures(selected) {

    var images = [

        //Plaines
        { id: "plaine_1-pattern", url: "/img/textures/plaines/plaine_1.jpg" },
        { id: "plaine_2-pattern", url: "/img/textures/plaines/plaine_2.jpg" },
        { id: "plaine_3-pattern", url: "/img/textures/plaines/plaine_3.jpg" },
        { id: "plaine_4-pattern", url: "/img/textures/plaines/plaine_4.jpg" },

        //Forets
        //1 arbres
        { id: "foret1_1-pattern", url: "/img/textures/forets/foret1_1.jpg" },
        { id: "foret1_2-pattern", url: "/img/textures/forets/foret1_2.jpg" },
        { id: "foret1_3-pattern", url: "/img/textures/forets/foret1_3.jpg" },
        { id: "foret1_4-pattern", url: "/img/textures/forets/foret1_4.jpg" },

        //2 arbres
        { id: "foret2_1-pattern", url: "/img/textures/forets/foret2_1.jpg" },
        { id: "foret2_2-pattern", url: "/img/textures/forets/foret2_2.jpg" },
        { id: "foret2_3-pattern", url: "/img/textures/forets/foret2_3.jpg" },
        { id: "foret2_4-pattern", url: "/img/textures/forets/foret2_4.jpg" },

        //3 arbres
        { id: "foret3_1-pattern", url: "/img/textures/forets/foret3_1.jpg" },
        { id: "foret3_2-pattern", url: "/img/textures/forets/foret3_2.jpg" },
        { id: "foret3_3-pattern", url: "/img/textures/forets/foret3_3.jpg" },
        { id: "foret3_4-pattern", url: "/img/textures/forets/foret3_4.jpg" },

        //Montagnes
        { id: "montagne-pattern", url: "/img/textures/montagnes/montagne.jpg" },

        //Eau
        { id: "eau-pattern", url: "/img/textures/eaux/eau.jpg" },

        //Sables
        { id: "sable-pattern", url: "/img/textures/sables/sable.jpg" },

        //Carrieres
        { id: "carriere_1-pattern", url: "/img/textures/carrieres/carriere_1.jpg" },
        { id: "carriere_2-pattern", url: "/img/textures/carrieres/carriere_2.jpg" },
        { id: "carriere_3-pattern", url: "/img/textures/carrieres/carriere_3.jpg" }
    ]

    for (let terrain of images) {
        ajouterTextures(terrain.id, terrain.url, selected);
    }

}

//-------------------Fonctions pour afficher les unités-----------------

/**
 * affiche une unitée sur le damier
 * @param {Object} unite - Object ayant les attributs name, couleur, position, etc
 * @param {String} dam - id du damier sur lequel mettre l'unité 
 * @param {Number} opacity - détermine l'opacité de l'unité
 * @param {Function} eventClick - fonction executé lors d'un click sur l'unité
 * @param {Function} eventOut - fonction executé lorsque le curseur quitte l'unité
 */
function afficherUnites(unite, dam, opacity = 1,eventClick=()=>{},eventOut=()=>{}) {
    let hexagone = document.getElementById("h" + unite.position);
    if (hexagone) {
        let bbox = hexagone.getBBox();

        let couleur = unite.couleur;
        switch (couleur) {
            case "rouge":
                couleur = "darkred";
                break;
            case "vert":
                couleur = "green";
                break;
            case "bleu":
                couleur = "blue";
                break;
            case "jaune":
                couleur = "yellow";
                break;
            case "blanc":
                couleur = "aliceblue"
                break
        }

        let image = d3.select("#" + dam)
            .append("image")
            .attr("class", "unite")
            .attr("xlink:href", `/img/personnages/${unite.couleur}/${unite.name.toLowerCase()}.png`)
            .attr("x", `${bbox.x - 10}`)
            .attr("y", `${bbox.y - 15}`)
            .attr("width", "70")
            .attr("height", "80")
            .attr("id", "uni" + unite.position)
            .on("click", () => {
                eventClick();

                if (unite.type == "unit") {
                    image.transition()
                    .duration(100)
                    .style("filter", "brightness(1000%) saturate(0%)")
                    .on("end", () => {
                    image.style("filter", "none");
                    });
                }

            })
            .on("mouseover", () => {
                fstatsUnite(unite);
                d3.select(hexagone)
                    .attr("stroke", `${couleur}`)
                    .style("stroke-width", 2);
            })
            .on("mouseout", () => {
                eventOut();

                d3.select(hexagone)
                    .attr("stroke", "transparent")
                    .style("stroke-width", 0)

               
            })
            .style("opacity", opacity); // opacité c'est entre 0 et 1

        if (terrain[unite.position].startsWith("!")) {
            image.style("filter", "grayscale(100%)");
        }

        if (unite.type != "building") {

            maxhp = unite.maxhp;
            hp = unite.hp;
            pourcentage = hp / maxhp;
            couleurbarre = "green";
            tailleinterieur = 40 * pourcentage;

            if (pourcentage < 0.8) {
                couleurbarre = "orange"
            }

            if (pourcentage < 0.4) {
                couleurbarre = "red"
            }

            //Contour
            d3.select("#" + dam)
                .append("rect")
                .attr("x", `${bbox.x}`)
                .attr("y", `${bbox.y}`)
                .attr("width", "5")
                .attr("height", "40")
                .attr("id", "barrecontour" + unite.position)
                .attr("fill", "black");

            //Intérieur
            d3.select("#" + dam)
                .append("rect")
                .attr("x", `${bbox.x}`)
                .attr("y", `${bbox.y + (40 - tailleinterieur)}`)
                .attr("width", "4")
                .attr("height", `${tailleinterieur}`)
                .attr("id", "barreinterieur" + unite.position)
                .attr("fill", couleurbarre);
        }

    } else {
        console.log("L'élément avec l'ID h" + unite.position + " n'existe pas.");
    }

}

function deplacerUnitesAnim(caseDepart, caseArrivee, fun) {
    let image = d3.select("#uni" + caseDepart);

    let BBoxDepart = document.getElementById("h" + caseDepart).getBBox();
    let BBoxArrivee = document.getElementById("h" + caseArrivee).getBBox();

    let deltaX = BBoxArrivee.x - BBoxDepart.x;
    let deltaY = BBoxArrivee.y - BBoxDepart.y;

    d3.select("#barrecontour" + caseDepart).remove();
    d3.select("#barreinterieur" + caseDepart).remove();

    image.transition()
        .duration(500)
        .attr("x", BBoxDepart.x + deltaX - 10)
        .attr("y", BBoxDepart.y + deltaY - 15)
        .on("end", () => {
            image.attr("id", "uni" + caseArrivee);
            image.classed("unite", true);

            fun();


        });
}

function tuerUniteAnim(caseUnite, fun) {
    let image = d3.select("#uni" + caseUnite);

    image.transition()
        .duration(1000)
        .style("filter", "brightness(0) saturate(1000%) contrast(100%) sepia(1) hue-rotate(0deg)")
        .style("opacity", 0)
        .on("end", () => {
            image.remove();
            fun();
        });

}

function recolteAnim(ressource, numcase) {
    let hexagone = document.getElementById("h" + numcase);

    if (hexagone) {
        let bbox = hexagone.getBBox();

        let imgress = d3.select("#ress" + numcase);

        if (imgress.empty()) {
            d3.select("#jeu")
                .append("image")
                .attr("class", "ress")
                .attr("xlink:href", `/img/autre/${ressource}.png`)
                .attr("x", `${bbox.x - 10}`)
                .attr("y", `${bbox.y - 15}`)
                .attr("width", "70")
                .attr("height", "80")
                .attr("id", "ress" + numcase);
        }

        let image = d3.select("#ress" + numcase);

        image.transition().duration(0);

        image.transition()
            .duration(1000)
            .attr("y", bbox.y - 125)
            .style("opacity", 0)
            .on("end", () => {
                image.remove();
            });
    }
}

function attaqueAnim(caseDepart, caseArrivee, chiffre, fun) {
    let image = d3.select("#uni" + caseDepart);
    let ennemi = d3.select("#uni" + caseArrivee);
    const filtreennemi = ennemi.style("filter");

    let BBoxDepart = document.getElementById("h" + caseDepart).getBBox();
    let BBoxArrivee = document.getElementById("h" + caseArrivee).getBBox();

    let deltaX = (BBoxArrivee.x - BBoxDepart.x) / 2;
    let deltaY = (BBoxArrivee.y - BBoxDepart.y) / 2;

    decalage = 0;
    if (chiffre.length == 2) {
        decalage += 10;
    }

    image.transition()
        .duration(250)
        .attr("x", BBoxDepart.x + deltaX - 10)
        .attr("y", BBoxDepart.y + deltaY - 15)
        .on("end", () => {

            d3.select("#jeu")
                .append("text")
                .attr("class", "degat")
                .attr("x", (BBoxDepart.x + (deltaX * 2)) + decalage)
                .attr("y", (BBoxDepart.y + (deltaY * 2)))
                .attr("font-size", "30px")
                .attr("fill", "red")
                .attr("id", "degat" + caseArrivee)
                .text(chiffre)

            ennemi.transition()
                .duration(150)
                .style("filter", "brightness(0.5) sepia(1) saturate(5) hue-rotate(-50deg)")
                .on("end", () => {
                    ennemi.style("filter", filtreennemi);
                });

            image.transition()
                .duration(250)
                .attr("x", BBoxDepart.x - 10)
                .attr("y", BBoxDepart.y - 15);

            let degat = d3.select("#degat" + caseArrivee);

            degat.transition().duration(0);

            degat.transition()
                .duration(1000)
                .attr("y", (BBoxDepart.y + (deltaY * 2)) - 125)
                .style("opacity", 0)
                .on("end", () => {
                    degat.remove();
                    fun();
                });
        });

}

/**
 * affiche les stats d'une unité lors d'un mouseover sur la div à droite
 * @param {Object} unite - Object ayant les attributs name, attack, hp, defense
 */
function fstatsUnite(unite) {
    let stats = d3.select("#unitStats");
    stats.selectAll("*").remove();

    stats.append("p").attr("id", "uniteName").text("Nom : " + unite.name);
    stats.append("p").attr("id", "position").text("Position : " + unite.position);
    stats.append("p").attr("id", "uniteHp").text("Points de vie : " + unite.hp);

    if (unite.type !== "building") {
        stats.append("p").attr("id", "mov").text("Mouvement : " + unite.movement);
        stats.append("p").attr("id", "uniteAttack").text("Attaque : " + unite.attack);
        stats.append("p").attr("id", "uniteDefence").text("Défense : " + unite.defense);
    }

    if (unite.wood !== undefined) { stats.append("div").attr("id", "uniteWood").text("Bois : " + unite.wood); }
    if (unite.stone !== undefined) { stats.append("div").attr("id", "uniteStone").text("Pierres : " + unite.stone); }
    if (unite.copper !== undefined) { stats.append("div").attr("id", "uniteCuivre").text("Cuivre : " + unite.copper); }
    if (unite.tin !== undefined) { stats.append("div").attr("id", "uniteTin").text("Etain : " + unite.tin); }
    if (unite.fish !== undefined) { stats.append("div").attr("id", "uniteFish").text("Poissons : " + unite.fish + " de valeur valeur " + unite.fishValue); }

    if (unite.buildingInfos) {
        if (unite.buildingInfos.coûtBois !== undefined) { stats.append("div").attr("id", "uniteWoodCost").text("Coût en bois : " + unite.buildingInfos.coûtBois); }
        if (unite.buildingInfos.coûtPierre !== undefined) { stats.append("div").attr("id", "uniteStoneCost").text("Coût en pierre : " + unite.buildingInfos.coûtPierre); }
        if (unite.buildingInfos.coûtCuivre !== undefined) { stats.append("div").attr("id", "uniteCopperCost").text("Coût en cuivre : " + unite.buildingInfos.coûtCuivre); }
        if (unite.buildingInfos.coûtEtain !== undefined) { stats.append("div").attr("id", "uniteTinCost").text("Coût en étain : " + unite.buildingInfos.coûtEtain); }
    }
    if (unite.currentBuilding != undefined) { stats.append("div").attr("id", "uniteCurrentBuilding").text("Chantier en " + unite.currentBuilding); }
    if (unite.base != undefined) { stats.append("div").attr("id", "uniteCurrentBase").text("Base: " + unite.base); }
    if (unite.phase != undefined) {
        if (unite.phase == "getRessources") { stats.append("div").attr("id", "unitePhase").text("Cherche des ressources"); }
        if (unite.phase == "buildBuilding") { stats.append("div").attr("id", "unitePhase").text("Construit un bâtiment"); }
    }

    if (unite.type !== "building" && unite.owner == socket.idJoueur) {
        let unimode = stats.append("div").attr("id", "unimode");
        unimode.append("p").attr("id", "uniteMode").text("Stratégie : ");
        const selectMode = unimode.append("select").attr("class", "inputDA").attr("id", "uniteSelectMode")
            .selectAll("option").data(["Agression", "Modere", "Prudence"]).enter().append("option").text(d => d).attr("value", d => d);

        unimode.append("button").attr("id", "uniteModeButton").attr("class", "inputDA").text("Appliquer").on("click", function () {
            const selectedMode = d3.select("#uniteSelectMode").property("value");
            console.log(selectedMode.toLowerCase());
            console.log(unite.position);
            socket.emit("Stratégie", { position: unite.position, newStrat: selectedMode.toLowerCase() });
        });
    }
}

/**
 * affiche les stats d'un bâtiment lors d'un mouseover
 * @param {Object} batiment
 */
function fstatsBatiment(batiment) {
    // let statsimg = d3.select("#statsUnite");
    // statsimg.selectAll("*").remove();
    // statsimg.append("img")
    //     .attr("src", "img/personnages/rouge/" + batiment.nom.toLowerCase() + ".png")
    //     .attr("width", 180).attr("height", 150);

    let stats = d3.select("#unitStats");
    stats.selectAll("*").remove();

    stats.append("p").text("Nom : " + batiment.nom);
    stats.append("p").text("Coût en Or : " + batiment.coûtOr);
    stats.append("p").text("Coût en Bois : " + batiment.coûtBois);
    stats.append("p").text("Coût en Pierre : " + batiment.coûtPierre);
    stats.append("p").text("Coût en Cuivre : " + batiment.coûtCuivre);
    stats.append("p").text("Tours pour construire : " + batiment.turnsToBuild);
}
//Prend en entrée une position et des informations relatives à la partie et renvoie les directions dans lesquelles il y a un mur adjacent
//Retour:tableau de strings parmis ["droite","gauche","hautdroite","hautgauche","basdroite","basgauche"]
function mursAdjacentes(pos, width, height, board) {
    pos = parseInt(pos, 10);
    width = parseInt(width, 10)
    height = parseInt(height, 10)
    var retour = [];
    if (board[pos] == undefined || board[pos].name != "Mur") { return retour }
    var row = pos % height;
    var col = Math.floor(pos / height);
    if (col > 0) { // not left
        if (!retour.includes("gauche") && board[pos - height] != undefined && board[pos - height].name == "Mur") { retour.push("gauche") }; // left
    }
    if (col < width - 1) { // not right
        if (!retour.includes("droite") && board[pos + height] != undefined && board[pos + height].name == "Mur") { retour.push("droite") }; // right
    }


    if (col % 2 == 0) {//even col   

        if (row % 2 == 0) {//even row
            if (row > 0) {
                if (col > 0) { if (!retour.includes("hautgauche") && board[pos - height - 1] != undefined && board[pos - height - 1].name == "Mur") { retour.push("hautgauche") }; }
                if (!retour.includes("hautdroite") && board[pos - 1] != undefined && board[pos - 1].name == "Mur") { retour.push("hautdroite") }; // left

            }
            if (row < height - 1) {
                if (col > 0) { if (!retour.includes("basgauche") && board[pos - height + 1] != undefined && board[pos - height + 1].name == "Mur") { retour.push("basgauche") }; }
                if (!retour.includes("basdroite") && board[pos + 1] != undefined && board[pos + 1].name == "Mur") { retour.push("basdroite") }; // left



            }
        }
        if (row % 2 != 0) {
            if (row > 0) {
                if (col > 0) {
                    if (!retour.includes("hautdroite") && board[pos + height - 1] != undefined && board[pos + height - 1].name == "Mur") { retour.push("hautdroite") }; // left
                }
                if (!retour.includes("hautgauche") && board[pos - 1] != undefined && board[pos - 1].name == "Mur") { retour.push("hautgauche") };

            }
            if (row < height - 1) {
                if (col < width - 1) {
                    if (!retour.includes("basdroite") && board[pos + height + 1] != undefined && board[pos + height + 1].name == "Mur") { retour.push("basdroite") }; // left
                }
                if (!retour.includes("basgauche") && board[pos + 1] != undefined && board[pos + 1].name == "Mur") { retour.push("basgauche") }
            }
        }
    }
    if (col % 2 != 0) {//odd column

        if (row % 2 == 0) {//even row
            if (row > 0) {
                if (col > 0) {
                    if (!retour.includes("hautgauche") && board[pos - height - 1] != undefined && board[pos - height - 1].name == "Mur") { retour.push("hautgauche") };
                }
                if (!retour.includes("hautdroite") && board[pos - 1] != undefined && board[pos - 1].name == "Mur") { retour.push("hautdroite") }
            }

            if (row < height - 1) {
                if (col > 0) { if (!retour.includes("basgauche") && board[pos - height + 1] != undefined && board[pos - height + 1].name == "Mur") { retour.push("basgauche") } }
                if (!retour.includes("basdroite") && board[pos + 1] != undefined && board[pos + 1].name == "Mur") { retour.push("basdroite") }
            }
        }
        if (row % 2 != 0) {//odd row

            if (row > 0) {
                if (col < width - 1) {
                    if (!retour.includes("hautdroite") && board[pos + height - 1] != undefined && board[pos + height - 1].name == "Mur") { retour.push("hautdroite") }
                }
                if (!retour.includes("hautgauche") && board[pos - 1] != undefined && board[pos - 1].name == "Mur") { retour.push("hautgauche") }
            }
            if (row < height - 1) {
                if (col > 0) { if (!retour.includes("basdroite") && board[pos + height + 1] != undefined && board[pos + height + 1].name == "Mur") { retour.push("basdroite") } }
                if (!retour.includes("basgauche") && board[pos + 1] != undefined && board[pos + 1].name == "Mur") { retour.push("basgauche") }


            }
        }
    }


    var retouryahou = []
    if (retour.length == 0) { retouryahou = ["centre"] } else { retouryahou.push("centre") }
    if (retour.includes("hautdroite")) { retouryahou.push("hautdroite") }
    if (retour.includes("hautgauche")) { retouryahou.push("hautgauche") }
    if (retour.includes("droite")) { retouryahou.push("droite") }
    if (retour.includes("gauche")) { retouryahou.push("gauche") }
    if (retour.includes("basdroite")) { retouryahou.push("basdroite") }
    if (retour.includes("basgauche")) { retouryahou.push("basgauche") }

    return retouryahou;




}

//Prend en entrée des informations relatives à la partie, un type de mur et une position et dessine le bon mur
//Types de murs: bois, pierre
function dessineMur(pos, width, height, board, type, unite) {
    let directions = mursAdjacentes(pos, width, height, board);
    let hexagone = document.getElementById("h" + pos);
    let bbox = hexagone.getBBox();

    const murs = {
        "hautgauche": "murhautgauche.png",
        "hautdroite": "murhautdroite.png",
        "gauche": "murgauche.png",
        "droite": "murdroite.png",
        "basgauche": "murbasgauche.png",
        "basdroite": "murbasdroite.png",
        "centre": "mur.png",
    };

    directions.forEach(direction => {
        if (murs[direction]) {
            let image = d3.select("#jeu")
                .append("image")
                .attr("class", "unite")
                .attr("xlink:href", `/img/murs/${murs[direction]}`)
                .attr("x", `${bbox.x - 10}`)
                .attr("y", `${bbox.y - 15}`)
                .attr("width", "70")
                .attr("height", "80")
                .attr("id", "uni" + pos)
                .on("mouseover", () => {
                    fstatsUnite(board[pos]);
                    d3.select(hexagone)
                        .attr("stroke", `orange`)
                        .style("stroke-width", 2);
                })
                .on("mouseout", () => {
                    d3.select(hexagone)
                        .attr("stroke", "transparent")
                        .style("stroke-width", 0);
                });

            if ((terrain[pos]).startsWith("!")) {
                image.style("filter", "grayscale(100%)");
            }

        }
    });
}

function dialogue(message, unite, couleur) {
    let vueDialogue = d3.select("#vueDialogue");
    vueDialogue.selectAll("*").remove();
    vueDialogue.style("display", "block");

    vueDialogue.on("click", () => {
        vueDialogue.style("display", "none");
    });

    vueDialogue.html(`
            <div class="DialogueContainer">
                <img src="img/personnages/${couleur}/${unite.toLowerCase()}.png" class="DialogueImage">
                <div class="DialogueContainerTexte">
                    <div class="DialogueContainerTitre">
                        <p>${unite.charAt(0).toUpperCase() + unite.slice(1)}</p>  
                    </div>
                    <p id="dialogueText"></p>
                </div>
            </div>
    `);

    let dialogueImage = document.querySelector(".DialogueImage");
    dialogueImage.style.position = "relative";
    dialogueImage.style.bottom = "-100px";
    dialogueImage.style.transition = "bottom 0.5s ease-out";

    setTimeout(() => {
        dialogueImage.style.bottom = "0";
    }, 0);

    let dialogueText = document.getElementById("dialogueText");
    let index = 0;

    function AjouteLettre() {
        if (index < message.length) {
            dialogueText.textContent += message.charAt(index);
            index++;
            setTimeout(AjouteLettre, 25);
        }
    }

    AjouteLettre();
}

/**
 * ajoute les unités sur le damier avec la fonction afficherUnites
 * @param {Object} board - une liste d'unité
 * @param {String} dam - le nom de la div du damier
 */
function ajouterUnites(board, dam, width, height) {
    for (let position of Object.keys(board)) {

        if (board[position].name == "Mur") {
            // console.log("mur"+position)
            dessineMur(position, width, height, board)
        }
        else {
            afficherUnites(board[position], dam);
        }
    }
}




/**
 * affiche la liste des parties sur le menu principal
 * @param {Array} data - liste de parties
 */
function afficherListeParties(data) {
    const tutorielContainer = document.querySelector(".rejoindrecontainer");
    tutorielContainer.innerHTML = "";

    if (data.length === 0) {
        const textContainer = document.createElement("div");
        textContainer.classList.add("textcontainer");
        const message = document.createElement("p");
        message.textContent = "Aucune partie";
        textContainer.appendChild(message);
        tutorielContainer.appendChild(textContainer);
    } else {
        data.forEach((partie, index) => {
            const partieContainer = document.createElement("div");
            partieContainer.classList.add(index % 2 === 0 ? "partiecontainer1" : "partiecontainer2");

            const infoGame = document.createElement("div");
            infoGame.classList.add("infoGame");

            const nomPartie = document.createElement("p");
            nomPartie.textContent = `Nom de la partie : ${partie.nom}`;
            infoGame.appendChild(nomPartie);

            const nbJoueurs = document.createElement("p");
            nbJoueurs.textContent = `Joueurs : ${partie.currentPlayers}/${partie.nbJoueurs}`;
            infoGame.appendChild(nbJoueurs);

            const nbTours = document.createElement("p");
            nbTours.textContent = `Tours : ${partie.nbTours}`;
            infoGame.appendChild(nbTours);

            const map = document.createElement("p");
            map.textContent = `Carte : ${partie.map || "Inconnue"}`;
            infoGame.appendChild(map);

            partieContainer.appendChild(infoGame);
            tutorielContainer.appendChild(partieContainer);

            partieContainer.addEventListener("click", () => {
                socket.emit("rejoindreLobby", partie.idPartie);
            });
        });
    }
}



/**
 * affiche le nom de la partie haut de la page
 * @param {String} nom 
 */
function afficherNomPartie(nom) {
    d3.select("#nomPartie").text(nom)

}

//-------------------Fonction qui déplace vue damier selon boutons/touches-----------------

/**
 * créer les événement pour se déplacer sur la carte 
 * @param {string} id 
 */
function setupBoutonScroll(id) {
    let scrollAmount = 15;
    const plateaujeu = document.getElementById(id);

    let btnGaucheEnfonce = false;

    let btnDroitEnfonce = false;

    let btnHautEnfonce = false;

    let btnBasEnfonce = false

    function scrollEnfonce() {
        if (btnHautEnfonce) {
            d3.select("#" + id).property("scrollTop", d3.select("#" + id).property("scrollTop") - scrollAmount);
            setTimeout(scrollEnfonce, 100);
        }
        if (btnBasEnfonce) {
            d3.select("#" + id).property("scrollTop", d3.select("#" + id).property("scrollTop") + scrollAmount);
            setTimeout(scrollEnfonce, 100);
        }
        if (btnGaucheEnfonce) {
            d3.select("#" + id).property("scrollLeft", d3.select("#" + id).property("scrollLeft") - scrollAmount);
            setTimeout(scrollEnfonce, 100);
        }
        if (btnDroitEnfonce) {
            d3.select("#" + id).property("scrollLeft", d3.select("#" + id).property("scrollLeft") + scrollAmount);
            setTimeout(scrollEnfonce, 100);
        }
    }

    document.addEventListener("keydown", function (e) {
        switch (e.key) {
            case "z":
                btnHautEnfonce = true;
                scrollEnfonce();
                break;
            case "s":
                btnBasEnfonce = true;
                scrollEnfonce();
                break;
            case "q":
                btnGaucheEnfonce = true;
                scrollEnfonce();
                break;
            case "d":
                btnDroitEnfonce = true;
                scrollEnfonce();
                break;
        }
    });

    document.addEventListener("keyup", function (e) {
        switch (e.key) {
            case "z":
                btnHautEnfonce = false;
                break;
            case "s":
                btnBasEnfonce = false;
                break;
            case "q":
                btnGaucheEnfonce = false;
                break;
            case "d":
                btnDroitEnfonce = false;
                break;
        }
    });
}

//-------------------Fonction qui permet de déplacer les composants-----------------

function rendreDeplacable(element, conteneur) {
    let estEnDeplacement = false;
    let decalageX, decalageY;
    let estImageCliquee = false;

    const rectConteneur = conteneur.getBoundingClientRect();

    element.addEventListener('mousedown', (e) => {

        if (e.target.tagName === 'IMG' || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            estImageCliquee = true;
            return;
        }

        e.preventDefault();

        estEnDeplacement = true;

        decalageX = e.clientX - element.offsetLeft;
        decalageY = e.clientY - element.offsetTop;

        element.style.zIndex = 10000;
    });

    document.addEventListener('mousemove', (e) => {
        if (estEnDeplacement && !estImageCliquee) {
            let nouvelleX = e.clientX - decalageX;
            let nouvelleY = e.clientY - decalageY;

            nouvelleX = Math.max(rectConteneur.left, Math.min(nouvelleX, rectConteneur.right - element.offsetWidth));
            nouvelleY = Math.max(rectConteneur.top, Math.min(nouvelleY, rectConteneur.bottom - element.offsetHeight));

            element.style.left = `${nouvelleX - rectConteneur.left}px`;
            element.style.top = `${nouvelleY - rectConteneur.top}px`;
        }
    });

    document.addEventListener('mouseup', () => {
        if (estEnDeplacement) {
            estEnDeplacement = false;
            element.style.zIndex = 5000;
        }
        estImageCliquee = false;
    });
}


function tutorielJSON(data) {
    //class tutorielContainer
    let tutorielContainer = document.createElement("div");
    tutorielContainer.className = "tutorielContainer";
    tutorielContainer.id = "tuto";

    //class titreTutoContainer
    let titreContainer = document.createElement("div");
    titreContainer.className = "titreTutoContainer";

    let index = 0;
    for (let key in data) {
        let item = data[key];
        let numeroTitre = (index % 2 === 0) ? "1" : "2";

        let titreTutoContainer = document.createElement("div");
        titreTutoContainer.className = `titreTuto${numeroTitre}`;
        titreTutoContainer.id = `tuto${key}`;
        titreTutoContainer.onclick = () => {
            //je recup contenututotexte et les p associés
            let obtention = d3.select("#obtention");
            obtention.text(item.obtention);
            let utilisation = d3.select("#utilisation");
            utilisation.text(item.utilisation);
        }

        let titreTutoImage = document.createElement("div");
        titreTutoImage.className = "titreTutoImage";
        let img = document.createElement("img");
        img.src = item.image;
        img.id = `imgTuto${key}`;
        titreTutoImage.appendChild(img);

        let titreTutoText = document.createElement("div");
        titreTutoText.className = "titreTutoText";
        let p = document.createElement("p");
        p.id = `titreTuto${key}`;
        p.textContent = item.titre;
        titreTutoText.appendChild(p);

        titreTutoContainer.appendChild(titreTutoImage);
        titreTutoContainer.appendChild(titreTutoText);
        titreContainer.appendChild(titreTutoContainer);

        index++;
    }

    tutorielContainer.appendChild(titreContainer);

        //class contenuTutoContainer
        let contenuTutoContainer = document.createElement("div");
        contenuTutoContainer.className = "contenuTutoContainer";
    
        let sections = [
            { title: "Comment l'obtenir?", id: "obtention" },
            { title: "Comment l'utiliser?", id: "utilisation" }
        ];
    
        sections.forEach(section => {
            let contenuTuto = document.createElement("div");
            contenuTuto.className = "contenuTuto";
    
            let contenuTutoTitre = document.createElement("div");
            contenuTutoTitre.className = "contenuTutoTitre";
            contenuTutoTitre.innerHTML = `<p>${section.title}</p>`;
    
            let contenuTutoTexte = document.createElement("div");
            contenuTutoTexte.className = "contenuTutoTexte";
            contenuTutoTexte.id = section.id;
    
            let p = document.createElement("p");
            p.id = section.id;
            p.textContent = "En cliquant sur un élément du tutoriel, tu auras la réponse a cette question.";
            contenuTutoTexte.appendChild(p);
    
            contenuTuto.appendChild(contenuTutoTitre);
            contenuTuto.appendChild(contenuTutoTexte);
    
            contenuTutoContainer.appendChild(contenuTuto);
        });
    
        tutorielContainer.appendChild(contenuTutoContainer);

    document.body.appendChild(tutorielContainer);
}


/**
 * Permet de réinitialiser les filtres d'un terrain parcouru par un chemin
 * @param {Object} terrain - clé valeur : numéro de case , type de terrain
 * @param {Array} chemin - liste de numéro de case 
 */
function resetFiltreDamier(terrain,chemin){
    for (let i = 0; i < chemin.length; ++i) {
        d3.select("#h" + chemin[i]).style("filter", null);
        if (terrain[chemin[i]][0] == '?') {
            d3.select("#h" + chemin[i]).style("filter", "brightness(0.3")

        }
        else if (terrain[chemin[i]][0] == '!') {
            switch (terrain[chemin[i]][1]) {
                case "1":
                    d3.select("#h" + chemin[i]).style("filter", "brightness(0.9) sepia(1) saturate(5) hue-rotate(30deg)");
                    break
                case "2":
                    d3.select("#h" + chemin[i]).style("filter", "brightness(0.6) sepia(1) saturate(5) hue-rotate(30deg)");
                    break
                default:
                    d3.select("#h" + chemin[i]).style("filter", "brightness(0.3) sepia(1) saturate(5) hue-rotate(30deg)");
            }
            //d3.select("#h" + path[i]).style("filter", "sepia(1)").attr("id", "brouillard");
        }

        
    }
}