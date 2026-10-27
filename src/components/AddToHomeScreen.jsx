import React, { useEffect, useState } from "react";
import { Bell, BellOff, Download } from "lucide-react";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";

// VAPID public key - you need to generate this (see instructions below)
const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || "";

const AddToHomeScreen = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Handle install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Check notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }

    // Check if already subscribed
    checkSubscription();

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const checkSubscription = async () => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    }
  };

  const handleAddToHomeScreen = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    }
  };

  const urlBase64ToUint8Array = (base64String) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeToNotifications = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push notifications are not supported in your browser");
      return;
    }

    setLoading(true);

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission !== "granted") {
        alert("Please allow notifications to receive health reminders");
        setLoading(false);
        return;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Send subscription to server
      const user = JSON.parse(localStorage.getItem("loggedInUser"));
      if (user?.token) {
        await fetch(`${API_BASE}/api/push/subscribe`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys: {
              p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("p256dh")))),
              auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey("auth")))),
            },
          }),
        });
      }

      setIsSubscribed(true);
      alert("Notifications enabled! You'll receive health reminders.");
    } catch (error) {
      console.error("Failed to subscribe:", error);
      alert("Failed to enable notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromNotifications = async () => {
    setLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push
        await subscription.unsubscribe();

        // Remove from server
        const user = JSON.parse(localStorage.getItem("loggedInUser"));
        if (user?.token) {
          await fetch(`${API_BASE}/api/push/unsubscribe`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          });
        }
      }

      setIsSubscribed(false);
      alert("Notifications disabled.");
    } catch (error) {
      console.error("Failed to unsubscribe:", error);
    } finally {
      setLoading(false);
    }
  };

  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem("loggedInUser");

  // Don't show anything if no features available
  if (!deferredPrompt && (!isLoggedIn || !("Notification" in window))) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {/* Install App Button */}
      {deferredPrompt && (
        <button
          onClick={handleAddToHomeScreen}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 hover:bg-blue-700 transition"
        >
          <Download className="w-4 h-4" />
          Install App
        </button>
      )}

      {/* Notification Toggle Button */}
      {isLoggedIn && "Notification" in window && (
        <button
          onClick={isSubscribed ? unsubscribeFromNotifications : subscribeToNotifications}
          disabled={loading}
          className={`px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition ${
            isSubscribed
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-600 text-white hover:bg-gray-700"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? (
            <span className="animate-spin">...</span>
          ) : isSubscribed ? (
            <>
              <Bell className="w-4 h-4" />
              Notifications On
            </>
          ) : (
            <>
              <BellOff className="w-4 h-4" />
              Enable Notifications
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default AddToHomeScreen;
