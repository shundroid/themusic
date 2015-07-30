const endpoint = "https://itunes.apple.com/search";

function formatQueryParameters(parameters){
  var formatted = [];
  for(var key in parameters){
    formatted.push(key + "=" + parameters[key]);
  }
  return formatted.join("&");
}

function createQueryURL(parameters){
  return endpoint + "?" + formatQueryParameters(parameters);
}

function showSearchResult(result){
}

function search(keyword){
  var parameters = {
    term: encodeURIComponent(keyword),
    country: "jp",
    media: "podcast",
    entity: "podcast"
  };
  return new Promise((resolve, reject) => {
    console.log("send query");
    var req = new XMLHttpRequest({mozSystem: true});
    req.onload = event => {
      resolve(req.response);
    };
    req.open("GET", createQueryURL(parameters), true);
    req.send();
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
      search(searchArea.value).then(response => {
        console.log(response);
        showSearchResult(response);
      });
    });

    noResultIndicator.hidden = true;
}

window.addEventListener("load", initialize);
