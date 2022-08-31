
const items = document.getElementById('items');

const getProducts = () => {
  // recuperer les produits
  fetch("http://localhost:3000/api/products")
    .then((res) => res.json())
    .then((data) => {
      //Afficher les produits
      fillSection(data);
    })
    .catch((error) => {
      alert("Une erreur est survenue ! Veuillez contcater l'administrateur.");
    });
};
getProducts();
// Remplissage dynamique de la page index
function fillSection(products) {
  let html = "";
  products.forEach(element => {

    html = html + `<a href="./product.html?id=${element._id}">
            <article>
              <img src="${element.imageUrl}" alt="${element.altTxt}">
              <h3 class="productName">${element.name}</h3>
              <p class="productDescription">${element.description}</p>
            </article>
          </a> `;
  });
  // Ajout sur le DOM
  items.innerHTML = html;
}