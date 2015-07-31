window.addEventListener("load", function() {
  console.log("Hello World!");
});

var select_btn = document.getElementById("btn_select");
select_btn.addEventListener("click", () => {
  document.getElementById("file_select").click();
});
document.getElementById("file_select").onchange = function() {
	console.log(this.files);
	document.getElementById("audio_play").src = this.value;
	document.getElementById("audio_play").play();
};