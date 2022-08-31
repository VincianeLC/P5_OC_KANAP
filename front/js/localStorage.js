function setLocalStorage(arrayCart) {
    // Panier recuperé sous format de tableau 
    let value = JSON.stringify(arrayCart);
    // Ajouter et/ ou mettre à jour la valeur dans le localstorage
    localStorage.setItem("cart", value);
}
// renvoi le tableau des articles
function getLocalStorage() {
    // etat initial : j'ai pas deja de panier 
    if (!localStorage.getItem("cart")) {
        // retourner un tableau vide 
        return [];
    }
    // etat t+1 : je dispose au minimum d'un article : j'ai un panier 
    else {
        // retourner le tableau des produits: la reconversion de l'objet json en tableau 
        // ce qu'on a dans le localstorage c'est la chaine de caracteres
        let value = localStorage.getItem("cart");
        // convertir value to Tableau d'article 
        return JSON.parse(value);
    }
}