// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use-strict';

// Show a list of all tabs in the same process as this one.
function init() {
	//chrome.windows.getCurrent({populate: true}, function(currentWindow) {
		// chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
		// 	var current = currentWindow.tabs.filter(function(tab) {
		// 		return tab.active;
		// 	})[0];
			
		//});
	//});
	var titleDiv = document.getElementById("title");
	titleDiv.innerHTML = "<b>Tabs!</b>";

	chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
		buildUI();
	});
	chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
		buildUI();
	});
	chrome.tabs.onCreated.addListener(function (tab) {
		buildUI();
	});
	buildUI();
}

function buildUI() {
	var outputDiv = document.getElementById("tab-list");
	while (outputDiv.lastElementChild) {
		outputDiv.removeChild(outputDiv.lastElementChild);
	}
	var ul = document.createElement('ul');
	outputDiv.appendChild(ul);
	displayAllTabs(ul);
}

function removeTabs(event) {
	var tabIds = event.srcElement.id.split`,`.map(x=>+x)
	try {
		chrome.tabs.remove(tabIds, function() {
			// buildUI();
		});
	} catch (e) {
		alert(e);
	}
}

function groupTabs(event) {
	var tabIds = event.srcElement.id.split`,`.map(x=>+x)
	try {
		chrome.tabs.move(tabIds, {"index": -1}, function(tabs) {
			// buildUI();
		});
	} catch (e) {
		alert(e);
	}
}

function isValidUrl(urlStr) {
	if (urlStr == undefined) { 
		return false; 
	}
	try {
		var url = new URL(urlStr);
		return true;
	} catch (e) {
		return false;
	}
	return false;
}

function displayAllTabs(outputDiv) {
	// Loop over all windows and their tabs
	var tabs = [];
	
	chrome.windows.getCurrent({ populate: true }, function(currentWindow) {
		for (var j = 0; j < currentWindow.tabs.length; j++) {
			var tab = currentWindow.tabs[j];
			if (!tab.pinned) {
				tabs.push(tab);
			}
		}

		var dict = {}
		var grouped = []

		tabs.filter(tab => isValidUrl(tab.url)).forEach(function(tab) {
			var url = new URL(tab.url);
			if (dict[url.origin] == undefined) {
				dict[url.origin] = {
					"url": url,
					"tabs": [],
					"tabIds": [] 
				}
				grouped.push(dict[url.origin])
			}
			dict[url.origin]["tabs"].push(tab)
			dict[url.origin]["tabIds"].push(tab.id)
		});
		// sort
		grouped.sort((a, b) => (a.tabIds.length > b.tabIds.length) ? -1 : 1)
		// Display tab in list if it is in the same process
		grouped.forEach(function(value) {
			displayTabInfo(value["tabs"][0], value["tabIds"], value["url"].origin, outputDiv);
		});
	});
}

// Print a link to a given tab
function displayTabInfo(tab, tabIds, origin, outputDiv) {

	
	var li = document.createElement('li');
	var img = document.createElement('img');
	img.src = "chrome://favicon/" + tab.url
	li.appendChild(img)
	
	li.appendChild(document.createTextNode(" ("+tabIds.length+") "+ origin +" "))


	var groupButton = document.createElement('button');
	groupButton.id = tabIds
	groupButton.innerHTML = "->"
	groupButton.addEventListener('click', groupTabs)
	li.appendChild(groupButton);


	var closeButton = document.createElement('button');
	closeButton.id = tabIds
	closeButton.innerHTML = "Close"
	closeButton.addEventListener('click', removeTabs)
	li.appendChild(closeButton);


	outputDiv.appendChild(li)
}

// Kick things off.
document.addEventListener('DOMContentLoaded', init);
