function appelsAjoutTextures(){
    
    var images = [
        
        //Plaines
        {id : "plaine_1-pattern", url : "/img/textures/plaines/plaine_1.jpg"},
        {id : "plaine_2-pattern", url : "/img/textures/plaines/plaine_2.jpg"},
        {id : "plaine_3-pattern", url : "/img/textures/plaines/plaine_3.jpg"},
        {id : "plaine_4-pattern", url : "/img/textures/plaines/plaine_4.jpg"},

        //Forets
        //1 arbres
        {id : "foret1_1-pattern", url : "/img/textures/forets/foret1_1.jpg"},
        {id : "foret1_2-pattern", url : "/img/textures/forets/foret1_2.jpg"},
        {id : "foret1_3-pattern", url : "/img/textures/forets/foret1_3.jpg"},
        {id : "foret1_4-pattern", url : "/img/textures/forets/foret1_4.jpg"},

        //2 arbres
        {id : "foret2_1-pattern", url : "/img/textures/forets/foret2_1.jpg"},
        {id : "foret2_2-pattern", url : "/img/textures/forets/foret2_2.jpg"},
        {id : "foret2_3-pattern", url : "/img/textures/forets/foret2_3.jpg"},
        {id : "foret2_4-pattern", url : "/img/textures/forets/foret2_4.jpg"},

        //3 arbres
        {id : "foret3_1-pattern", url : "/img/textures/forets/foret3_1.jpg"},
        {id : "foret3_2-pattern", url : "/img/textures/forets/foret3_2.jpg"},
        {id : "foret3_3-pattern", url : "/img/textures/forets/foret3_3.jpg"},
        {id : "foret3_4-pattern", url : "/img/textures/forets/foret3_4.jpg"},
        
        //Montagnes
        {id : "montagne-pattern", url : "/img/textures/montagnes/montagne.jpg"},

        //Eau
        {id : "eau-pattern", url : "/img/textures/eaux/eau.jpg"},

        //Sables
        {id : "sable-pattern", url : "/img/textures/sables/sable.jpg"},

        //Carrieres
        {id : "carriere_1-pattern", url : "/img/textures/carrieres/carriere_1.jpg"},
        {id : "carriere_2-pattern", url : "/img/textures/carrieres/carriere_2.jpg"},
        {id : "carriere_3-pattern", url : "/img/textures/carrieres/carriere_3.jpg"}
    ]

    for(let terrain of images){
        ajouterTextures(terrain.id,terrain.url);
    }
    
}