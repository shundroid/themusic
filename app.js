var player = {
  initialize: function(){
    var initPlaybackControl = () => {
      this.playbackControl.pause.hide = function(){
        this.style.display = "none";
      };
      this.playbackControl.pause.show = function(){
        this.style.display = "block";
      };    
      this.playbackControl.play.hide = function(){
        this.style.display = "none";
      };
      this.playbackControl.play.show = function(){
        this.style.display = "block";
      };

      this.playbackControl.pause.addEventListener("click", event => {
        this.pause();
      });
      
      this.playbackControl.play.addEventListener("click", event => {
        this.play();
      });

      this.audio.addEventListener("pause", event => {
        this.playbackControl.pause.hide();
        this.playbackControl.play.show();
      });

      this.audio.addEventListener("abort", event => {
        this.playbackControl.pause.hide();
        this.playbackControl.play.show();
      });

      this.audio.addEventListener("play", event =>{
        this.playbackControl.play.hide();      
        this.playbackControl.pause.show();
      });

      this.playbackControl.pause.hide();
    };
    
    var initTimeControl = () => {
      this.timeControl.slider.min = 0;
    
      this.audio.addEventListener("loadedmetadata", event => {
        this.updateTime();
        this.timeControl.slider.max = this.audio.duration;
        this.timeControl.slider.value = 0;
        this.playbackControl.pause.hidden = true;
      });

      this.audio.addEventListener("timeupdate", event => {
        this.updateTime();
      });
      
      this.timeControl.slider.addEventListener("change", event =>{
        this.currentTime = this.timeControl.value;
        this.updateTime();
      });
    };

    var initVolumeControl = () => {
      var slider = this.volumeControl.slider;
      slider.min = 0;
      slider.max = 1;
      slider.step = 0.05;
      this.audio.volume = 0.5;
      slider.value = this.audio.volume;

      slider.addEventListener("change", event => {
        this.audio.volume = Number(slider.value);
      });
    };

    var initAudioChannel = () => {
      this.audio.mozAudioChannelType = "content";
      if(navigator.mozAudioChannelManager){
        navigator.mozAudioChannelManager.volumeControlChannel = "content";
      }
    };
    
    initPlaybackControl();
    initTimeControl();
    initVolumeControl();
    initAudioChannel();
  },
  audio: document.querySelector("#player audio"),
  set src(url){
    this.audio.src = url;
  },
  get src(){
    return this.audio.src;
  },
  get currentTime(){
    return this.audio.currentTime;
  },
  set currentTime(time){
    this.audio.currentTime = time;
  },
  get duration(){
    return this.audio.duration;
  },
  pause: function(){
    console.log("pause");
    this.audio.pause();
  },
  play: function(){
    console.log("play");
    this.audio.play();
  },
  updateTime: function(){
    this.timeControl.played = this.audio.currentTime;
    this.timeControl.remaining = this.audio.duration - this.audio.currentTime;
  },
  _artwork: document.querySelector("#player img"),
  get artwork(){
    return this._artwork.src;
  },
  set artwork(url){
    return this._artwork.src = url;
  },
  _title: document.querySelector("#title"),
  get title(){
    return this._title.textContent;
  },
  set title(title){
    this._title.textContent = title;
  },
  _artist: document.querySelector("#artist"),
  get artist(){
    return this._artist.textContent;
  },
  set artist(artist){
    return this._artist.textContent = artist;
  },
  timeControl: {
    _played: document.querySelector("#player .time > .played"),
    get played(){
      return this._played.textContent;
    },
    set played(time){
      this._played.textContent = this.formatTime(time);
    },
    _remaining: document.querySelector("#player .time > .remaining"),
    get ramaining(){
      return this._remaining.textContent; 
    },
    set remaining(remaining){
      this._remaining.textContent = this.formatTime(remaining);
    },
    slider: document.querySelector("#player .time > input[type=range]"),
    get value(){
      return this.slider.value;
    },
    set value(value){
      this.slider.value = value;
    },
    formatTime(sec){
      var min = Math.floor(sec / 60);
      sec = Math.floor(sec - min * 60);
      if(sec < 10){
        sec = "0" + sec;
      }
      return min + ":" + sec;
    }
  },
  volumeControl: {
    slider: document.querySelector("#player .volume-control > input[type=range]")
  },
  playbackControl: {
    play: document.querySelector("#player .playback-control > .btn-play"),
    pause: document.querySelector("#player .playback-control > .btn-pause"),
    fastForward: document.querySelector("#player .playback-control > .btn-fast-forward"),
    fastBackward: document.querySelector("#player .playback-control > .btn-fast-backward")
  }
};

function toSelectMusic(){
  return window.location.hash == "#selectMusic";
}

function setMusic(music){
  var a = (m) => {
    player.pause();
    player.artist = m.metadata.artist;
    player.title = m.metadata.title;
    console.log(m.metadata.picture);
    player.artwork = URL.createObjectURL(m.metadata.picture);
  }
  if (isfxos) {
    console.log(music);
    player.src = URL.createObjectURL(music.blob);
    a(music);
  } else {
    shunstrg.getBlob(music).then(m => {
      player.src = URL.createObjectURL(m.blob);
      a(m);
    });
  }
}

var shunstrg;
var onClickSelectMusic;
function pickMusic(){
  return new Promise((resolve, reject) =>{
    if (isfxos) {
      var req = new MozActivity({
        name: "pick",
        data: {
          type: "audio/mpeg"
        }
      });
      req.onsuccess = function(){
        resolve(this.result);
      };
      req.onerror = function(){
        reject(this.error);
      };
    } else {
      shunstrg.list().then(function(r) {
        //console.log(r);
        for (var i = 0; i < r.length; i++) {
          var btn = document.createElement("button");
          btn.type = "button";
          btn.className = "list-group-item select-music-item";
          btn.id = "select_" + i.toString();
          btn.addEventListener("click", selectMusicItem);
          btn.innerHTML = r[i];
          document.getElementById("music_select").appendChild(btn);
        }
        document.getElementById("show_dialog").click();
        onClickSelectMusic = t => {
          console.log("TT");
          resolve(t);
        };
      });
    }
  });
}

function selectMusic(){
  pickMusic().then(setMusic);
}

function selectMusicItem() {
  document.getElementById("music_selected_item").textContent = this.textContent;
}
function clickSelectMusic() {
  document.getElementById("hide_dialog").click();
  onClickSelectMusic(document.getElementById("music_selected_item").textContent);
}
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("music_select_btn").addEventListener("click", clickSelectMusic);
});
window.addEventListener("load", function() {
  shunstrg = new shunStorage();
  shunstrg.init();
  player.initialize();
  document.querySelector(".btn-select-music").addEventListener("click", event =>{
    selectMusic();
  });
  if(toSelectMusic()){
    selectMusic();
  }
});