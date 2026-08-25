const CHANNEL_NAME = "festlog-visits";

export function notifyVisitsUpdated() {
  window.dispatchEvent(new Event("visits:updated"));
  if (typeof BroadcastChannel !== "undefined") {
    new BroadcastChannel(CHANNEL_NAME).postMessage("updated");
  }
}

export function onVisitsUpdatedElsewhere(callback) {
  if (typeof BroadcastChannel === "undefined") {
    return () => {};
  }
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = callback;
  return () => channel.close();
}
