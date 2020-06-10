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
			displayAllTabs(ul);
		});
	});
}

function removeTab(event) {
	var tabId = +event.srcElement.id
	try {
		chrome.tabs.remove(tabId);
	} catch (e) {
		alert(e);
	}
}

function displayAllTabs(outputDiv) {
	// Loop over all windows and their tabs
	var tabs = [];
	// chrome.windows.getAll({ populate: true }, function(windowList) {
	chrome.windows.getCurrent({ populate: true }, function(currentWindow) {
		for (var j = 0; j < currentWindow.tabs.length; j++) {
			var tab = currentWindow.tabs[j];
			if (!tab.pinned) {
				tabs.push(tab);
			}
		}

		var dict = {}

		tabs.forEach(function(tab) {
			let url = new URL(tab.url);
			if (dict[url.origin] == undefined) {
				dict[url.origin] = {
					"url": url,
					"tabs": [] 
				}
			}
			dict[url.origin]["tabs"].push(tab)
		});

		// Display tab in list if it is in the same process
		tabs.forEach(function(tab) {
			displayTabInfo(tab, outputDiv);
		});
	});
}

// Print a link to a given tab
function displayTabInfo(tab, outputDiv) {

	
	var li = document.createElement('li');
	if (tab.favIconUrl != undefined) {
		var img = document.createElement('img');
		img.src = "chrome://favicon/" + tab.url
		li.appendChild(img)
	}
	

	li.appendChild(document.createTextNode(tab.title))

	let url = new URL(tab.url);

	// li.appendChild(document.createTextNode("pinned: "+ tab.pinned))
	li.appendChild(document.createTextNode(url.origin))


	var button = document.createElement('button');
	button.id = tab.id
	button.appendChild(document.createTextNode("Close"))
	button.addEventListener('click', removeTab)
	li.appendChild(button);


	outputDiv.appendChild(li)
	// outputDiv.innerHTML +=
	//   "<b><a href='#' onclick='showTab(window, " + tab.id +
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
