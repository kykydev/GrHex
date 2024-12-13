
const socket = io('http://localhost:8888');



// ajouter des parties 

d3.select("#listeJoueurs").append("tr").attr("id","tr1").append("td").text("caca")
d3.select("#tr1").append("td").text("caca")
d3.select("#tr1")
.append("td")
.append("button")
.attr("class","btn-rejoindre")
.text("Rejoindre");

// creer une partie

console.log(d3.select("#nbJoueurs").property("value"))

console.log(d3.select("#nbTours").property("value"))