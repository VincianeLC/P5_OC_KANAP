// URL ACTUELLE avec orderId
const queryString = window.location.search;
// selectionner le paramètre qui est a été ajouté depuis l'adresse URL COMPLETE
const urlParams = new URLSearchParams(queryString);
if (urlParams.has("orderId")) {
  // selectionner iD et modifier par le paramètre à retourner.
  document.getElementById("orderId").innerText = urlParams.get("orderId");
}