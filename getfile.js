function JSONPRequest() {
  this.send = function(url) {
    return new Promise(resolve => {
      var e = document.createElement("script");
      e.src = url;
      document.body.appendChild(e);
    });
  };
}