

const buildings = [//Liste des bâtiments qui est ensuite envoyée au client par socket dans app.js
  {"nom":"Mur","url":"Mur","coûtOr":10,"coûtBois":0,"coûtPierre":10,"coûtEtain":0,"coûtCuivre":0, "turnsToBuild":1},
    {"nom":"Tour","url":"tour","coûtOr":15,"coûtBois":20,"coûtPierre":15,"coûtEtain":0,"coûtCuivre":0, "turnsToBuild":1},
    {"nom":"Forge","url":"Forge","coûtOr":0,"coûtBois":5,"coûtPierre":10,"coûtEtain":0,"coûtCuivre":0, "turnsToBuild":1},
    {"nom":"Champ","url":"Champ","coûtOr":0,"coûtBois":15,"coûtPierre":0,"coûtEtain":0,"coûtCuivre":0, "turnsToBuild":1},
    {"nom":"Maison","url":"Maison","coûtOr":0,"coûtBois":12,"coûtPierre":10,"coûtEtain":0,"coûtCuivre":0, "turnsToBuild":1},
    {"nom":"Mine","url":"Mine","coûtOr":35,"coûtBois":25,"coûtPierre":25,"coûtEtain":0,"coûtCuivre":0, "turnsToBuild":2},
    {"nom":"Entrepôt","url":"Entrepôt","coûtOr":15,"coûtBois":15,"coûtPierre":10,"coûtEtain":0,"coûtCuivre":0, "turnsToBuild":2},
    {"nom":"Hôtel de ville","url":"Hôtel de ville","coûtOr":100,"coûtBois":50,"coûtPierre":50,"coûtEtain":0,"coûtCuivre":20, "turnsToBuild":5},
    {"nom":"Cabane","url":"cabane","coûtOr":0,"coûtBois":15,"coûtPierre":10,"coûtEtain":1,"coûtCuivre":0, "turnsToBuild":1},
    {"nom":"Port","url":"port","coûtOr":10,"coûtBois":25,"coûtPierre":20,"coûtEtain":0,"coûtCuivre":0, "turnsToBuild":3},
  ]




module.exports = { buildings };
