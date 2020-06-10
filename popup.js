// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'unsafe-inline';

// Show a list of all tabs in the same process as this one.
function init() {
  chrome.windows.getCurrent({populate: true}, function(currentWindow) {
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
      var current = currentWindow.tabs.filter(function(tab) {
        return tab.active;
      })[0];
      
      var outputDiv = document.getElementById("tab-list");
      var titleDiv = document.getElementById("title");
      titleDiv.innerHTML = "<b>Tabs!</b>";

	  var ul = document.createElement('ul');
	  outputDiv.appendChild(ul);
      displayTabInfo(currentWindow.id, current, ul);
      displayAllTabs(current, ul);
    });
  });
}

function removeTab(event) {
	var tabId = +event.srcElement.id
	console.log("REMOVE TAB " + tabId)
  try {
    chrome.tabs.remove(tabId);
  } catch (e) {
    alert(e);
  }
}

function displayAllTabs(selectedTab, outputDiv) {
  // Loop over all windows and their tabs
  var tabs = [];
  // chrome.windows.getAll({ populate: true }, function(windowList) {
  chrome.windows.getCurrent({ populate: true }, function(currentWindow) {
    //for (var i = 0; i < windowList.length; i++) {
      for (var j = 0; j < currentWindow.tabs.length; j++) {
        var tab = currentWindow.tabs[j];
        if (tab.id != selectedTab.id) {
          tabs.push(tab);
        }
      }
    //}

    // Display tab in list if it is in the same process
    tabs.forEach(function(tab) {
      displayTabInfo(tab.windowId, tab, outputDiv);
    });
  });
}

// Print a link to a given tab
function displayTabInfo(windowId, tab, outputDiv) {
  //if (tab.favIconUrl != undefined) {
  //  outputDiv.innerHTML += "<img src='chrome://favicon/" + tab.url + "'>\n";
  //}
  var a = document.createElement('button');
  a.id = tab.id
  a.appendChild(document.createTextNode("Close"))
  a.addEventListener('click', removeTab)
  
  var li = document.createElement('li');
  //li.appendChild(document.createTextNode(tab.title))
  li.appendChild(a);
  outputDiv.appendChild(li)
  // outputDiv.innerHTML +=
  //   "<b><a href='#' onclick='showTab(window, " + windowId + ", " + tab.id +
  //   ")'>" + tab.title + "</a></b><br>\n" +
  //   "<i>" + tab.url + "</i><br>\n" + 
  //   "<button onclick=\"removeTab(" + tab.id + ");\">Close Tab</button>"
  //   ;
}

// Bring the selected tab to the front
function showTab(origWindow, windowId, tabId) {
  // TODO: Bring the window to the front.  (See http://crbug.com/31434)
  //chrome.windows.update(windowId, {focused: true});
  chrome.tabs.update(tabId, { selected: true });
  origWindow.close();
}

// Kick things off.
document.addEventListener('DOMContentLoaded', init);
