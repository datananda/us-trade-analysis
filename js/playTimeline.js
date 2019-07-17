var myInterval;

function playTimeline() {
  //clear previous timers
  pauseTimeline();

  // start timer
  myInterval = setInterval(function() {
    if (document.getElementById("slider").value < 48) {
      document.getElementById("slider").value = parseInt(document.getElementById("slider").value) + 1;
      changeSlider(0);      
    }
    else {
      pauseTimeline();
    }
  }, 1000);
}

function pauseTimeline() {
  clearInterval(myInterval);
}

function restartTimeline() {
  pauseTimeline();
  document.getElementById("slider").value = 0;
  changeSlider(500);
}