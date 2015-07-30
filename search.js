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

function createFilenameFromURL(url){
  url = new URL(url);
  return url.host + url.pathname.replace(/[\/~]/g, "-");
}

function saveMusic(resource){
  // ダウンロード終了
  console.log("downloaded_1");
  changeProgressStatus(getURLFilename(resource.url), "完了");
  var fileName = createFilenameFromURL(resource.url);
  return new Promise((resolve, reject) => {
    console.log("attempt to save a blob as " + fileName);
    console.log(resource.blob);
    var req = storage.addNamed(resource.blob, fileName);
    req.onsuccess = function(){
      resolve(this.result);
    };
    req.onerror = function(){
      reject(this.error);
    };
  });
}

function fetchMusic(url){
  return new Promise((resolve, reject) => {
    console.log("start fetching from " + url);
    var req = new XMLHttpRequest({mozSystem: true});
    req.onload = () => {
      var blob = req.response;
      resolve({url: url, blob: blob}); 
    };
    req.onerror = (e) =>{
      reject(e);
    };
    req.addEventListener("progress", event => {
      changeProgressStatus(getURLFilename(url), "ダウンロード中(" + Math.floor(parseInt(event.loaded/event.total*10000)/100).toString() + "%)");
    });
    req.open("GET", url, true);
    req.responseType = "blob";
    req.send();
  });
}

function downloadMusic(url){
  return fetchMusic(url).then(saveMusic).then(name => {
    return new Promise((resolve, reject) => {
      resolve(name);
    });
  });
}

function getURLFilename(url) {
  var _url = new URL(url);
  var pathname = _url.pathname;
  return pathname.substring(pathname.lastIndexOf("/") + 1);
}

function showDownloadDialog(urlList){
  document.getElementById("show_dialog").click();
  var listElem = document.getElementById("progress_result");
  urlList.forEach(i => {
    listElem.appendChild(createProgressElement(getURLFilename(i), "ダウンロード中"));
  });
  console.log(urlList);
}

function createProgressElement(fileName, status) {
  var div = document.createElement("div");
  div.className = "progress";
  console.log(fileName);
  div.id = fileName;

  var st_e = document.createElement("div");
  st_e.className = "prog_status";
  st_e.textContent = status;
  st_e.style.float = "right";
  div.appendChild(st_e);

  var fName = document.createElement("div");
  fName.className = "prog_fn";
  fName.textContent = fileName;
  div.appendChild(fName);

  return div;
}

function changeProgressStatus(fileName, newStatus) {
  var elem = document.getElementById(fileName);
  if (elem) {
    elem.childNodes.toArray().filter(i => { return i.className == "prog_status"; })[0].textContent = newStatus;
  }
}

function hideDownloadDialog(){
  document.getElementById("hide_dialog").click();
  document.getElementById("progress_result").innerHTML = "";
}

function downloadAlbum(urlList){
  showDownloadDialog(urlList);
  Promise.all(urlList.map(downloadMusic)).then(() => {
    console.log("all files have been downloaded");
    hideDownloadDialog();
    window.location.href = "index.html#selectMusic";
  }, error => {
    console.error(error);
    hideDownloadDialog();
  });
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
