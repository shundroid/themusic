const endpoint = "https://itunes.apple.com/search";
var storage = navigator.getDeviceStorage("music");

Array.prototype.flatten = function(){
  return Array.prototype.concat.apply([], this);
};
Array.prototype.toArray = function(){
  return this;
};

NodeList.prototype.toArray = function(){
  return Array.prototype.slice.call(this);
};

function downloadMusic(url){
  console.log(url);
}

function downloadAlbum(urlList){
  urlList.forEach(downloadMusic);
}

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

function findChannel(elm){
  var result = {};
  for(var i = 0; i < elm.childNodes.length; i++){
    if(elm.childNodes[i].tagName == "channel"){
      result = elm.childNodes[i];
      break;
    }
  }
  return result;

}

function findMusicList(documentElement){
  return (findChannel(documentElement).childNodes || []).toArray();
}

function hasEnclosure(elm){
  return elm.tagName == "enclosure";
}

function isItem(elm){
  return elm.tagName == "item";
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
      var urls = findMusicList(document_obj.documentElement).filter(isItem).map(item => {
        return item.childNodes.toArray();
      }).flatten().filter(hasEnclosure).map(item => {
        return item.getAttribute("url");
      });
      downloadAlbum(urls);
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
