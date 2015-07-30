const endpoint = "https://itunes.apple.com/search";

function formatQueryParameters(parameters){
  var formatted = "";
  for(var key in parameters){
    formatted += key + "=" + parameters[key];
  }
  return encodeURIComponent(formatted);
}

function createQueryURL(parameters){
  return endpoint + "?" + formatQueryParameters(parameters);
}

function search(keyword){
  var parameters = {
    term: keyword,
    country: "ja",
    media: "podcast",
    entity: "podcast"
  }
  return new Promise((resolve, reject) => {
    var req = new XMLHttpRequest({mozSystem: true});
    req.onload = event => {
      resolve(req.response);
    }
    req.open("GET", createQueryURL(), true);
  });
}

function initialize(){
    var searchArea = document.querySelector(".form-search input[type=text]");
    var searchButton = document.querySelector(".form-search button");
    var noResultIndicator = document.querySelector(".alert-no-search-result");

    searchArea.addEventListener("focus", event => {
      noResultIndicator.hidden = true;
    });
    searchButton.addEventListener("click", event => {
      search(searchArea.value);
    });

    noResultIndicator.hidden = true;
}

window.addEventListener("load", initialize);
