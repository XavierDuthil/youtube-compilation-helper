var getCurrentVideoCache = null;
var getCurrentTrackCache = null;
var getCurrentTimeCache = null;
var getPausedCache = null;
var getTracklistCache = null;

function purgeCache() {
  getCurrentVideoCache = null;
  getCurrentTrackCache = null;
  getCurrentTimeCache = null;
  getPausedCache = null;
  getTracklistCache = null;
}

function refreshLabels(tabId, currentVideoLabel, currentTrackLabel, noTrackLabel) {
  chrome.tabs.sendMessage(tabId, "getCurrentVideo", function (response) {
    if (getCurrentVideoCache !== null && getCurrentVideoCache === response) {
      refreshCurrentTrack(tabId, currentVideoLabel, currentTrackLabel, noTrackLabel)
      return;
    }
    getCurrentVideoCache = response;

    if (response) {
      currentVideoLabel.textContent = response;
      currentTrackLabel.display = "block";
      refreshCurrentTrack(tabId, currentVideoLabel, currentTrackLabel, noTrackLabel)
    } else {
      currentVideoLabel.textContent = chrome.i18n.getMessage("noVideo");
      currentTrackLabel.setAttribute("style", "display: none");
      noTrackLabel.setAttribute("style", "display: none");
    }
  });
}

function refreshCurrentTrack(tabId, currentVideoLabel, currentTrackLabel, noTrackLabel) {
  chrome.tabs.sendMessage(tabId, "getCurrentTrack", function (response) {
    if (getCurrentTrackCache !== null && getCurrentTrackCache === response)
      return;
    getCurrentTrackCache = response;

    if (response) {
      currentVideoLabel.className = "secondaryTitle";
      currentTrackLabel.setAttribute("style", "display: block");
      currentTrackLabel.textContent = response;
      noTrackLabel.setAttribute("style", "display: none");
    } else {
      currentVideoLabel.className = "primaryTitle";
      currentTrackLabel.setAttribute("style", "display: none");
      noTrackLabel.setAttribute("style", "display: inline");
      noTrackLabel.textContent = chrome.i18n.getMessage("noTracklist");
    }
  });
}

function refreshCurrentTime(tabId, currentTimeLabel) {
  chrome.tabs.sendMessage(tabId, "getCurrentTime", function (response) {
    if (response) {
      var seconds = parseInt(response);

      if (getCurrentTimeCache !== null && getCurrentTimeCache === seconds)
        return;
      getCurrentTimeCache = seconds;

      var date = new Date(null);
      date.setSeconds(seconds);
      var dateISO = date.toISOString();
      var timeStr = seconds >= 3600 ? dateISO.substr(11, 8) : dateISO.substr(14, 5);

      currentTimeLabel.textContent = "[" + timeStr + "]";
      currentTimeLabel.setAttribute("style", "display: inline-block");
    } else {
      currentTimeLabel.setAttribute("style", "display: none");
    }
  });
}

function refreshPaused(tabId, playOrPauseButtonLabel) {
  chrome.tabs.sendMessage(tabId, "getPaused", function (paused) {
    if (getPausedCache !== null && getPausedCache === paused)
      return;
    getPausedCache = paused;

    if (paused) {
      playOrPauseButtonLabel.setAttribute('src', 'img/play.png');
    } else if (paused === false) {
      playOrPauseButtonLabel.setAttribute('src', 'img/pause.png');
    } else {
      playOrPauseButtonLabel.setAttribute('src', 'img/play_pause.png');
    }
  });
}

function refreshTracklist(tabId, tracklistTable) {
  chrome.tabs.sendMessage(tabId, "getTracklist", function (tracklist) {
    if (getTracklistCache !== null && JSON.stringify(getTracklistCache) === JSON.stringify(tracklist))
      return;
    getTracklistCache = tracklist;

    if (tracklist) {
      var tableContent = "<tbody><tr><th>N#</th><th>Title</th></tr>";
      for (var trackIdx in tracklist) {
        var trackInfo = tracklist[trackIdx];
        var trackNum = parseInt(trackIdx) + 1;
        trackNum = (trackNum < 10) ? ("0" + trackNum) : trackNum;
        tableContent += "<tr><td>" + trackNum + "</td><td>" + trackInfo["title"] + "</td></tr>";
      }

      tableContent += "</tbody>";
      tracklistTable.innerHTML = tableContent;
      tracklistTable.setAttribute("style", "display: table");
    } else {
      tracklistTable.setAttribute("style", "display: none");
    }
  });
}
