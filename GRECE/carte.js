var nbLignes = 16;
var nbColonnes = 20;
var colonnesInutiles = 4;

var rayon = 20;  // Mis à jour dans changeRayonHexagone() dans grece.js
var distance = 0;  // (Pour packer les hexagones) pour être accessible partout, calculée dans genereDamier() dans grece.js
var offsetX = 0;   // idem

var couleursRégions = {"Béotie": "#FFC0CB", "Attique": "lightcoral", "Argolide": "lightgreen", "Archaïe": "white", "Région_de_Delphes": "white"};
var couleursHoplites = {"Béotie": "coral", "Attique": "red", "Argolide": "#DFFF00"};
var couleurStratège = "#FF00FF";

var hexasMer1 = [11, 32, 53, 73, 74, 95, 115, 116, 137, 157, 158, 179, 123, 124, 126, 127, 140, 141, 142, 143, 144, 145, 146, 147, 148, 169, 170, 190, 191, 199, 219, 233, 234, 239, 255, 276, 279, 298];
var hexasMer2 = [160, 161, 162, 163, 164, 165, 166, 167, 168, 182, 183, 184, 185, 186, 187, 188, 189, 205, 206, 207, 208, 227, 228];
var hexasMer3 = [251, 252, 253, 271, 272, 273, 274, 275, 291, 292, 293, 294, 295, 296, 297, 311, 312, 313, 315, 316, 317, 318, 319];
var hexasMer = [...hexasMer1, ...hexasMer2, ...hexasMer3];
var hexasCachésOuest = [0, 1, 2, 3, 4, 20, 21, 22, 23, 24, 40, 41, 42, 43, 44, 60, 61, 62, 63, 64, 80, 81, 82, 83, 84, 100, 101, 102, 103, 104, 120, 121, 122, 123, 124, 140, 141, 142, 143, 144, 160, 161, 162, 163, 164, 180, 181, 182, 183, 184, 200, 201, 202, 203, 204, 220, 221, 222, 223, 224, 240, 241, 242, 243, 244, 260, 261, 262, 263, 264, 280, 281, 282, 283, 284, 300, 301, 302, 303, 304];
var hexasCachésNord = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 33, 34, 35, 36, 37, 38, 39, 54, 55, 56, 57, 58, 59, 75, 76, 77, 78, 79, 96, 97, 98, 99, 117, 118, 119, 138, 139, 159];
var Région_de_Delphes = [25, 26, 27, 45, 46, 47, 65, 66, 85, 86, 105, 125];
var Archaïe = [225, 245];
var Béotie = [28, 29, 30, 31, 48, 49, 50, 51, 52, 67, 68, 69, 70, 71, 72, 87, 88, 89, 90, 91, 92, 93, 94, 106, 107, 108, 109, 110, 111, 112, 113, 114, 126, 128, 129, 130, 131, 132, 133, 134, 149, 150, 151, 152, 153];
var Attique = [135, 136, 154, 155, 156, 174, 175, 176, 177, 178, 194, 195, 196, 197, 198, 215, 216, 217, 218, 235, 236, 237, 238, 254, 256, 257, 258, 259, 277, 278, 299];
var Argolide = [171, 172, 173, 192, 193, 209, 210, 211, 212, 213, 214, 226, 229, 230, 231, 232, 246, 247, 248, 249, 250, 265, 266, 267, 268, 269, 270, 285, 286, 287, 288, 289, 290, 305, 306, 307, 308, 309, 310];
console.log("Béotie :", Béotie.length, "Attique :", Attique.length, "Argolide :", Argolide.length);
var Delphes = 85;
var Thèbes = 132, Coronée = 90;
var Athènes = 236, Le_Pirée = 256;
var Corinthe = 248, Mégare = 232;
var Mont_Parnasse = 66;
var ports = [Le_Pirée, Corinthe, Mégare];
var cités = [Delphes, Thèbes, Coronée, Athènes, Le_Pirée, Corinthe, Mégare];
var toponymes = [[Delphes, "Delphes"], [Thèbes, "Thèbes"], [Coronée, "Coronée"], [Athènes, "Athènes"], [Le_Pirée, "Le Pirée"], [Corinthe, "Corinthe"], [Mégare, "Mégare"]];
var montagnes = [26, 27, 28, 29, 30, 65, 66, 67, 86, 87, 88, 128, 129, 130, 149, 171, 172, 173, 194, 195, 196, 209, 210, 211, 212, 229, 245, 246, 265, 266, 277, 285, 286, 305, 306, 309];
var Salamine = 254, Egine = 294;
var îles = [Salamine, Egine];
