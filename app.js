window.addEventListener("load", function() {
  console.log("Hello World!");
});

var select_btn = document.getElementById("btn_select");
select_btn.addEventListener("click", () => {
  //document.getElementById("file_select").click();
  var activity = new MozActivity({
  	name: "pick",
  	data: {
      type: "audio/mpeg"
  	}
  });
  activity.onsuccess = function() {
  	console.log("SUCCESS");
  	var audioUrl = URL.createObjectURL(this.result.blob);
  	console.log(audioUrl);
  	var audio = new Audio(audioUrl);
  	audio.play();
  };
});
// document.getElementById("file_select").onchange = function() {
// 	console.log(this.files);
// 	document.getElementById("audio_play").src = this.value;
// 	document.getElementById("audio_play").play();
// };