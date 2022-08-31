// je récupère la barre d'adresse sur la fenêtre
const urlParams = window.location.search;
// je créé un paramaètres de recherche pour mon url
const listParams = new URLSearchParams(urlParams);
// je récupère l'id du produit dans l'url
const productId = listParams.get("id");
//création d'un tableau 
let productData = [];
//Récupération des produits par leurs id sur l'API
const fetchProduct = async () => {
    await fetch(`http://localhost:3000/api/products/${productId}`)
        .then((res) => res.json())
        .then((product) => {
            fillSection(product);
        });
};
fetchProduct();
// Remplissage dynamique de la page produit (utilisation du DOM)
function fillSection(product) {
    // Sélection par classe et insertion
    document.querySelector(".item__img").innerHTML = ` <img src="${product.imageUrl}" alt="${product.altTxt}"> `;
    // Sélection par id et insertion 
    document.getElementById("title").textContent = product.name;
    document.getElementById("price").textContent = product.price;
    document.getElementById("description").textContent = product.description;
    //Mise en place de l'option couleur et quantité
    let html = document.getElementById("colors").innerHTML;
    product.colors.forEach(element => {
        html += `<option value="${element}">${element}</option>`;
    });
    document.getElementById("colors").innerHTML = html;
    // activer le controle de la couleur et la qté lors de l'ajout dans panier 
    document.getElementById("colors").addEventListener("change", function (event) {
        checkColor();
    });
    document.getElementById("quantity").addEventListener("change", function (event) {
        checkQty();
    });
    // activer l'écoute au click pour l'ajout au panier
    document.getElementById("addToCart").addEventListener("click", function (event) {
        event.stopPropagation();
        event.preventDefault();
        //Utilisation des fonctions de vérifications
        let validcolor = checkColor();
        let validQty = checkQty();
        // alerte pour ajout au panier
        alert("Vos articles ont été ajoutés au panier !")
        // si les deux sont valid 
        if (validQty && validcolor) {
            //on prepare un objet avec lid et la couleur et la qte 
            const product = {
                id: productId,
                color: document.getElementById("colors").value,
                quantity: parseInt(document.getElementById("quantity").value)
            };
            // on recupere le tableau des prduits
            let arrayLocalStorage = getLocalStorage();
            // Ajouter le produit dans le tableau 
            ajouterAuPanier(product, arrayLocalStorage);
            // Mise à jour du localstorage par le nouveau tableau
            setLocalStorage(arrayLocalStorage);
        }
    });
    //Vérification Couleur
    function checkColor() {

        if (document.getElementById("colors").value === "") {
            alert("Veuillez choisir une couleur!!");
            return false;
        }
        else {
            return true;
        }
    }
    //Vérification Quantitée
    function checkQty() {
        if (parseInt(document.getElementById("quantity").value) < 1
            || parseInt(document.getElementById("quantity").value) > 100) {
            alert("Veuillez choisir une quantité entre 1 et 100!!");
            return false;
        }
        else {
            return true;
        }
    }
}
// Calcul de la quantitée totale
function checkSumQty(quantite, oldQte) {
    if (quantite < 1
        || quantite > 100) {
        alert("Attention vous avez deja choisi " + oldQte + " articles dans le panier!!");
        return false;
    }
    else {
        return true;
    }
}
// Fonction d'ajout au panier
function ajouterAuPanier(produit, tableau) {
    // je créé une variable qui vérifie si un produit a un id et une couleur identique dans mon tableau
    let positionProduit = tableau.findIndex(item => item.id === produit.id && item.color === produit.color);
    // s'il existe  index> -1
    if (positionProduit >= 0) {
        // s'il n'existe pas je dois l'ajouter mais je dois incrementer la qte
        // solution 1
        let oldQte = tableau[positionProduit].quantity;
        let newQte = produit.quantity;
        let somme = oldQte + newQte;
        if (checkSumQty(somme, oldQte))
            tableau[positionProduit].quantity = somme;

    }
    else {
        //Inserer le produit dans le tableau que s'il n'existe pas 
        tableau.push(produit);
    }
}
