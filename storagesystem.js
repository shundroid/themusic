function shunStorage() {
  var idb;
  var openReq;
  var db;
  var _event;
  var isInit = false;
  this.init = function() {
    return new Promise(success => {
      idb = window.indexedDB;
      openReq = idb.open(DB_NAME, DB_V);
      openReq.onupgradeneeded = event => {
        console.log("upgradeneed");
        db = event.target.result;
        var s = db.createObjectStore("mystore", { keyPath: "mykey" });
        s.createIndex("myvalueIndex", "myvalue");
      };
      openReq.onsuccess = event => {
        console.log("success!");
        isInit = true;
        _event = event;
        db = event.target.result;
        success(event);
      }
    });
  }

  this.existStorage = function(f) {
    return new Promise(fn => {
      var a = function(event) {
        var key = f;
        var t = db.transaction(["mystore"], "readwrite");
        var s = t.objectStore("mystore");
        var r = s.get(key);
        r.onsuccess = function(e) {
          if (e.target.result === undefined) {
            // 存在しない
            fn(false);
          } else {
            fn(true);
          }
        }
      };
      if (!isInit) {
        s$.init().then(a);
      } else {
        a(_event);
      }
    });
  };

  this.save = function(blob, name, onsuccess, onerror) {
    var a = function(event) {
      console.log("onsuccess");
      db = event.target.result;

      var key = "shundroid";
      var value = "hohohoge";

      var t = db.transaction(["mystore"], "readwrite");
      var s = t.objectStore("mystore");
      var r = s.put({ mykey: name, myvalue: blob });
      r.onsuccess = event => {
        // localStorageにkeyだけ入れとく
        localStorage.setItem(S + name, "1");
        if (onsuccess !== null) onsuccess();
      };
    }
    if (!isInit) {
      s$.init().then(a);
    } else {
      a(_event);
    }
  };

  this.cursor = function() {
    var a = e => {
      console.log("onsuccess");
      db = e.target.result;

      var t = db.transaction(["mystore"], "readwrite");
      var s = t.objectStore("mystore");
      var r = s.openCursor();
      r.onsuccess = event => {
        if (event.target.result == null) {
          return;
        }
        var cursor = event.target.result;
        var data = cursor.value;
        console.log(cursor.key);
        console.log(data.myvalue);
        cursor.continue();
      }
    };
    if (!isInit) {
      s$.init().then(a);
    } else {
      a(_event);
    }
  };

  this.delete = function(k) {
    var a = function(e) {
      var key = k;
      var t = db.transaction(["mystore"], "readwrite");
      var store = t.objectStore("mystore");
      var r = store.delete(key);
      localStorage.removeItem(S + key);
      r.onsuccess = () => {
        console.log("delete successed!");
      }
    }
    if (!isInit) {
      s$.init().then(a);
    } else {
      a();
    }
  }

  this.list = function() {
    return new Promise(fx => {
      var a = event => {
        var t = db.transaction(["mystore"], "readwrite");
        var s = t.objectStore("mystore");
        var r = s.openCursor();

        var result = [];
        r.onsuccess = e => {
          if (e.target.result == null) {
            fx(result);
            return;
          }
          var cursor = e.target.result;
          result.push(cursor.key);
          cursor.continue();
        }
      };
      if (!isInit) {
        s$.init().then(a);
      } else {
        a(_event);
      }
    });
  }

  this.getBlob = function(k) {
    return new Promise(resolve => {
      var key = k;
      var transaction = db.transaction(["mystore"], "readwrite");
      var store = transaction.objectStore("mystore");
      var request = store.get(key);
      request.onsuccess = function (event) {
        if (event.target.result === undefined) {
          // キーが存在しない場合の処理
        } else {
          // 取得成功
         resolve(event.target.result.myvalue);
        }
      };
    });
  }
};

var s$ = new shunStorage();
