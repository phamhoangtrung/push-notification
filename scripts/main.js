"use strict";

const pushButton = document.querySelector(".js-push-btn");
const copyBtn = document.getElementById("copy");
const subscriptionJson = document.querySelector(".js-subscription-json");
const subscriptionDetails = document.querySelector(".js-subscription-details");

let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

if ("serviceWorker" in navigator && "PushManager" in window) {
  console.log("Service Worker and Push is supported");
  navigator.serviceWorker
    .register("sw.js")
    .then((swReg) => {
      console.log("Service Worker is registered", swReg);

      swRegistration = swReg;
      initializeUI();
    })
    .catch((error) => {
      console.error("Service Worker Error", error);
    });
} else {
  console.warn("Push messaging is not supported");
  pushButton.textContent = "Push Not Supported";
}

function initializeUI() {
  pushButton.addEventListener("click", function () {
    pushButton.disabled = true;
    if (isSubscribed) {
      // TODO: Unsubscribe user
      unsubscribeUser();
    } else {
      subscribeUser();
    }
  });

  // Set the initial subscription value
  swRegistration.pushManager.getSubscription().then(function (subscription) {
    // get user subscription in the first initialize time
    isSubscribed = !(subscription === null);
    updateSubscriptionOnServer(subscription);

    if (isSubscribed) {
      console.log("User IS subscribed.");
    } else {
      console.log("User is NOT subscribed.");
    }

    updateBtn();
  });
}

function updateBtn() {
  if (Notification.permission === "denied") {
    // run when user click block in notification prompt
    pushButton.textContent = "Push Messaging Blocked.";
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  if (isSubscribed) {
    pushButton.textContent = "Disable Push Messaging";
  } else {
    pushButton.textContent = "Enable Push Messaging";
  }

  pushButton.disabled = false;
}

async function subscribeUser() {
  const res = await fetchAPI();
  const { publicVapidKey } = await res.json();
  const applicationServerKey = urlB64ToUint8Array(publicVapidKey);
  // Ask user to subscribe by display a notification prompt
  swRegistration.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey,
    })
    .then(function (subscription) {
      console.log("User is subscribed.");

      updateSubscriptionOnServer(subscription);

      isSubscribed = true;

      updateBtn();
    })
    .catch(function (err) {
      console.log("Failed to subscribe the user: ", err);
      updateBtn();
    });
}

function updateSubscriptionOnServer(subscription) {
  // TODO: Send subscription to application server
  if (subscription) {
    // sent JSON data to server
    subscriptionJson.textContent = JSON.stringify(subscription);
    subscriptionDetails.classList.remove("is-invisible");
  } else {
    subscriptionDetails.classList.add("is-invisible");
  }
}

function unsubscribeUser() {
  swRegistration.pushManager
    .getSubscription()
    .then(function (subscription) {
      if (subscription) {
        return subscription.unsubscribe();
      }
    })
    .catch(function (error) {
      console.log("Error unsubscribing", error);
    })
    .then(function () {
      updateSubscriptionOnServer(null);

      console.log("User is unsubscribed.");
      isSubscribed = false;

      updateBtn();
    });
}

copyBtn.addEventListener("click", () => {
  fetchAPI(
    {
      subscription: subscriptionJson.textContent,
      data: {
        title: "Notification",
        body: "Hello",
      },
    },
    "POST"
  );
});

function fetchAPI(body, method = "GET") {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (method !== "GET") {
    options.body = JSON.stringify(body);
  }

  const endpoint = "https://arcane-forest-87358.herokuapp.com/subscribe";
  return fetch(endpoint, options);
}
