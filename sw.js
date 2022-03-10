/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, serviceworker, es6 */

'use strict';

self.addEventListener('push', function (event) {
	const body = event.data.text()
	console.log('[Service Worker] Push Received.');
	console.log(`[Service Worker] Push had this data: "${body}"`);

	const title = 'Push Codelab';
	// https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
	const options = {
		body,
		icon: 'images/icon.png',
		badge: 'images/badge.png',
		"vibrate": [200, 100, 200, 100, 200, 100, 400],
		"actions": [
			{ "action": "yes", "title": "Yes" },
			{ "action": "no", "title": "No" },
		],
		data: {
			url: "/about.html" // "/" is current domain
		}
	}

	// //	https://developers.google.com/web/ilt/pwa/introduction-to-push-notifications#when_to_show_notifications
	// clients.matchAll().then(function (c) {
	// 	// user not currently visiting our app
	// 	if (c.length === 0) {
	// 		// Show notification
	// 		const notificationPromise = self.registration.showNotification(title, options);
	// 		event.waitUntil(notificationPromise);
	// 	} else {
	// 		// Send a message to the page to update the UI
	// 		console.log('Application is already open!');
	// 	}
	// });

	const notificationPromise = self.registration.showNotification(title, options);
	event.waitUntil(notificationPromise);
});


self.addEventListener('notificationclick', function (event) {
	console.log('[Service Worker] Notification click Received.');
	const { action, notification } = event
	const { data } = notification

	notification.close();
	if (action === 'yes') {
		navigateOnYes(data.url)
	}

	// https://developers.google.com/web/ilt/pwa/introduction-to-push-notifications#hiding_notifications_on_page_focus
	self.registration.getNotifications().then(function (notifications) {
		// close all notifications on your site
		notifications.forEach(function (notification) {
			notification.close();
		});
	});
});

// https://developers.google.com/web/ilt/pwa/introduction-to-push-notifications#notifications_and_tabs
function navigateOnYes(url) {
	// get all client that open your app
	clients.matchAll().then(function (clis) {
		// find first client that now visible on your browser
		var client = clis.find(c => c.visibilityState === 'visible');
		if (client !== undefined) {
			// navigate and focus that tabs
			client.navigate(url);
			client.focus();
		} else {
			// there are no visible windows. Open one.
			clients.openWindow(url);
		}
	});
}
