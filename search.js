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
  var result_elem = document.getElementById("search_result");
  result_elem.style.display = "block";
  var result_artist = document.getElementById("search_result_artist");
  result_artist.innerHTML = ""; // 初期化
  document.getElementById("search_count").innerHTML = result.resultCount;
  for (var i = 0; i < result.resultCount; i++) {
    result_artist.appendChild(createArtistElement(result.results[i]));
    result_artist.appendChild(createSplit());
  }
}

function onClickDL() {
  /*
    this.dataset.feedには、xmlのデータが入っていて、
    その中に曲のデータが含まれている。
    まずajaxでxmlを読み込む
  */
  var req = new XMLHttpRequest({mozSystem: true});
  req.onload = event => {
    var dom_parser = new DOMParser();
    var document_obj = null;

    try {
      document_obj = dom_parser.parseFromString(req.response, "application/xml");
      // パースに失敗したか
      if(document_obj.getElementsByTagName("parsererror").length){
        document_obj = null;
      }
    }
    catch (e) {
      console.error(e);
    }
    if (document_obj) {
      var urls = [];
      var childs = document_obj.documentElement.childNodes[0].childNodes;
      for (var i = 0; i < childs.length; i++) {
        if (childs[i].tagName === "item") {
          for (var j = 0; j < childs[i].childNodes.length; j++) {
            if (childs[i].childNodes[j].tagName === "enclosure") {
              urls.push(childs[i].childNodes[j].getAttribute("url"));
            }
          }
        }
      }
      
    }
  };
  req.open("GET", this.dataset.feed);
  req.send();
  console.log(this.dataset.feed);
}

function createArtistElement(obj) {
  var elem = document.createElement("div");
  elem.className = "artist";

  var artwork = document.createElement("img");
  artwork.className = "artwork";
  artwork.src = obj.artworkUrl100;
  elem.appendChild(artwork);

  var dlbutton = document.createElement("button");
  dlbutton.className = "btn btn-default dlbutton";
  var i = document.createElement("i");
  i.className  = "glyphicon glyphicon-download-alt";
  dlbutton.appendChild(i);
  dlbutton.dataset.feed = obj.feedUrl;
  dlbutton.addEventListener("click", onClickDL);
  elem.appendChild(dlbutton);
  var artist_name = document.createElement("span");
  artist_name.className = "artist_name";
  artist_name.textContent = obj.artistName;
  elem.appendChild(artist_name);

  elem.appendChild(document.createElement("br"));

  var col_name = document.createElement("span");
  col_name.className = "col_name";
  col_name.textContent = obj.collectionName;
  elem.appendChild(col_name);

  return elem;
}

function createSplit() {
  var br = document.createElement("div");
  br.style.clear = "both";
  return br;
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
      resolve(JSON.parse(req.response));
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
