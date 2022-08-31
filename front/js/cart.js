// Ce tableau contient les selection du client( id, couleur, qté)
const arrayLocalStorage = getLocalStorage();

// Ce tableau va contenir les details des produits selectionnés a partir de l'api
let productsData = [];

//Parcourir le tableau vide mes selections
arrayLocalStorage.forEach(element => {
  fillProductData(element);
});

function fillProductData(element) {

  //Récupérer les details par id depuis l'api
  fetch(`http://localhost:3000/api/products/` + element.id)
    .then((res) => res.json())
    .then((product) => {
      //Combiner toutes les info dans un seul objet (api +qte + color)
      let selectedProduct = {
        ...product,
        color: element.color,
        quantity: element.quantity
      }
      //Stocker les articles dans le tableau final (à afficher)
      productsData.push(selectedProduct);
      fillSection();
    });


}

// Remplissage dynamique de la page panier (utilisation du DOM)
function fillSection() {
  let html = "";
  productsData.forEach(productData => {
    html = html + `<article class="cart__item" data-id="${productData._id}" data-color="${productData.color}">
        <div class="cart__item__img">
          <img src="${productData.imageUrl}" alt="${productData.altTxt}">
        </div>
        <div class="cart__item__content">
          <div class="cart__item__content__description">
            <h2>${productData.name}</h2>
            <p>${productData.color}</p>
            <p>${productData.price}€</p>
          </div>
          <div class="cart__item__content__settings">
            <div class="cart__item__content__settings__quantity">
              <p>Qté : </p>
              <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${productData.quantity}">
            </div>
            <div class="cart__item__content__settings__delete">
              <p class="deleteItem">Delete</p>
            </div>
          </div>
        </div>
      </article>`;


  });
  document.getElementById("cart__items").innerHTML = html;

  // add listener pour la liste des quantité
  let tableauQuantityItems = document.querySelectorAll(".itemQuantity");
  tableauQuantityItems.forEach(element => {

    element.addEventListener("change", function (event) {


      let newQty = parseInt(element.value);
      // Verifier si la quantité est bonne ou non !
      if (checkQty(newQty)) {
        // => quantité valide faire la mise à jour

        // recuperer l'id et la couleur depuis la dataset
        let id = element.closest(".cart__item").dataset.id;
        let color = element.closest(".cart__item").dataset.color;

        // Ajouter le produit dans le tableau 
        addQty(id, color, newQty);

        // Mise à jour du localstorage par le nouveau tableau
        setLocalStorage(arrayLocalStorage);
        CalculateSum();
      }


    });

  });

  // add Listener pour la liste des boutons delete
  let tableauDeleteItems = document.querySelectorAll(".deleteItem");
  tableauDeleteItems.forEach(element => {

    element.addEventListener("click", function (event) {

      alert("Êtes-vous sûr de vouloir supprimer cet article de votre panier ?")
      // recuperer l'id et la couleur depuis la dataset
      let id = element.closest(".cart__item").dataset.id;
      let color = element.closest(".cart__item").dataset.color;

      // Supprimer le produit du tableau 
      removeProduct(id, color);
      element.closest(".cart__item").remove();

      // Mise à jour du localstorage par le nouveau tableau
      setLocalStorage(arrayLocalStorage);

      



    });

  });

  CalculateSum();
  activateListenerOnForm();

}


// Activer le bouton commander

document.getElementById("order").addEventListener('click', event => {
  event.preventDefault();

  // Si pas de produit j'affiche une alerte
  if (productsData.length == 0) {
    alert("Votre panier est vide !!");
  }
  else {

    let form = document.querySelector(".cart__order__form");


    //Verifier si le formulaire est bien saisi ou non 
    if (validName(form.firstName) && validName(form.lastName) && validAddress(form.address) && validCity(form.city) && validEmail(form.email)) {
      // Si oui : je passe la commande 

      // preparer l'objet contact
      let contact = {
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        address: form.address.value,
        city: form.city.value,
        email: form.email.value,
      }

      // preparer le tableau des produits
      let arrayProductIds = [];

      arrayLocalStorage.forEach(element => {
        arrayProductIds.push(element.id);
      });

      // envoyer les produits et le contact à l'api

      let options = {
        method: 'POST',
        body: JSON.stringify({ contact: contact, products: arrayProductIds }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      };

      fetch('http://localhost:3000/api/products/order/', options)
        .then((response) => {
          // mettre la reponse en 200 - accepter/true
          if (response.ok) {
            return response.json();
          }
        })
        .then((data) => {
          localStorage.clear();
          document.location.href = `confirmation.html?orderId=${data.orderId}`;

        })
        .catch((error) => {
          alert(error.message);
        });
    }
    // si non une alerte ou un message informatif qui s'affiche 
    else {
      alert("Veuillez verifier le formulaire!! ")
    }

  }
});

function addQty(id, color, newQty) {

  let foundProductinLocalStorage = arrayLocalStorage.find(q => q.id === id && q.color === color);
  let foundProductinProductData = productsData.find(q => q._id === id && q.color === color);

  if (foundProductinLocalStorage) {
    foundProductinLocalStorage.quantity = newQty;

  }
  if (foundProductinProductData) {
    foundProductinProductData.quantity = newQty;
  }

}
// Fonction du bouton Delete (suppression de l'article)
function removeProduct(id, color) {
  // 
  let foundProduct = arrayLocalStorage.find(q => q.id === id && q.color === color);
  let foundProductinProductData = productsData.find(q => q._id === id && q.color === color);

  
    let position = arrayLocalStorage.indexOf(foundProduct);
    arrayLocalStorage.splice(position, 1);

    let position2 = productsData.indexOf(foundProductinProductData);
    productsData.splice(position2, 1);

 // Mettre à jour le document avec les valeurs calculées
    document.getElementById("totalPrice").textContent = position;
    document.getElementById("totalQuantity").textContent = position2;

}

//Vérification Quantitée
function checkQty(quantite) {
  if (quantite < 1 || quantite > 100) {
    alert("Veuillez choisir une quantité entre 1 et 100!!");
    return false;
  }
  else {
    return true;
  }

}
//Fonction de calcul des sommes (quantité, prix)
function CalculateSum() {
  // initialisation du compteur
  let sumPrice = 0;
  let sumQty = 0;
  productsData.forEach(element => {
    //calculer la somme qté et la somme des prix
    // console.log(parseFloat(element.price) +"/"+ parseInt(element.quantity));
    sumQty = sumQty + parseInt(element.quantity);
    sumPrice = sumPrice + (parseFloat(element.price) * parseInt(element.quantity));
  });
  // Mettre à jour le document avec les valeurs calculées
  document.getElementById("totalPrice").textContent = sumPrice;
  document.getElementById("totalQuantity").textContent = sumQty;

}


// Fonction d'activation des écoute sur le formulaire
function activateListenerOnForm() {
  let form = document.querySelector(".cart__order__form");
  // Ecoute de la modification du nom
  form.firstName.addEventListener('change', function () {
    validName(this);
  });

  // Ecoute de la modification du prénom
  form.lastName.addEventListener('change', function () {
    validName(this);
  });

  // Ecoute de la modification de l'adresse
  form.address.addEventListener('change', function () {
    validAddress(this);
  });

  // Ecoute de la modification de la ville
  form.city.addEventListener('change', function () {
    validCity(this);
  });

  // Ecoute de la modification de l'email
  form.email.addEventListener('change', function () {
    validEmail(this);
  });

}



//validation du prénom
function validName(inputName) {

  const charRegExp = /^(?=.{1,50}$)[a-z\u00C0-\u00FF]+(?:['-_.\s][a-z\u00C0-\u00FF]+)*$/i;

  let firstNameErrorMsg = inputName.nextElementSibling;

  if (charRegExp.test(inputName.value)) {
    firstNameErrorMsg.innerHTML = '';
    return true;
  } else {
    firstNameErrorMsg.innerHTML = 'Veuillez renseigner ce champ.';
    return false;
  }
}


//validation de l'adresse
function validAddress(inputAddress) {

  const regexLocation = /^[a-zA-Z0-9\u00C0-\u00FF\s,. '-]{3,}$/;

  let addressErrorMsg = inputAddress.nextElementSibling;

  if (regexLocation.test(inputAddress.value)) {
    addressErrorMsg.innerHTML = '';
    return true;
  } else {
    addressErrorMsg.innerHTML = 'Veuillez renseigner ce champ.';
    return false;
  }
}

//validation de la ville
function validCity(inputCity) {

  const charRegExp = /^(?=.{1,50}$)[a-z\u00C0-\u00FF]+(?:['-_.\s][a-z\u00C0-\u00FF]+)*$/i;

  let cityErrorMsg = inputCity.nextElementSibling;

  if (charRegExp.test(inputCity.value)) {
    cityErrorMsg.innerHTML = '';
    return true;
  } else {
    cityErrorMsg.innerHTML = 'Veuillez renseigner ce champ.';
    return false;
  }
}

//validation de l'email
function validEmail(inputEmail) {
  const regexEmail = /^[a-zA-Z0-9.-_]+[@]{1}[a-zA-Z0-9.-_]+[.]{1}[a-z]{2,10}$/;

  let emailErrorMsg = inputEmail.nextElementSibling;

  if (regexEmail.test(inputEmail.value)) {
    emailErrorMsg.innerHTML = '';
    return true;
  } else {
    emailErrorMsg.innerHTML = 'Veuillez renseigner votre email.';
    return false;
  }
}