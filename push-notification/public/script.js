(function () {
  async function initServiceWorker() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const serviceWorker = await navigator.serviceWorker.register('/sw.js');

      if (Notification.permission === 'granted') {
        // get VAPID public key
        const applicationServerKey = await (
          await fetch('/webhook/push/key')
        ).text();
        await subscribePush(serviceWorker, applicationServerKey);
      }

      return;
    }

    console.warn('Push unsupported');
  }

  /**
   * @param {ServiceWorkerRegistration} serviceWorker
   * @param {string} applicationServerKey
   * */
  async function subscribePush(serviceWorker, applicationServerKey) {
    const previousSubscription =
      await serviceWorker.pushManager.getSubscription();
    if (previousSubscription) {
      await Promise.all([
        // unregister previous subscription to the backend
        fetch(
          `/webhook/push/unsubscribe?endpoint=${encodeURIComponent(
            previousSubscription.endpoint,
          )}`,
          { method: 'DELETE' },
        ),
        // unsubscribe from the previous susbcription
        previousSubscription.unsubscribe(),
      ]);
    }

    // new subscription
    const subscription = await serviceWorker.pushManager.subscribe({
      applicationServerKey,
      userVisibleOnly: true,
    });
    // register new subscription to the backend
    await fetch('/webhook/push/subscribe', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(subscription),
    });

    console.log('Push ready');
    return subscription;
  }

  async function init() {
    if ('Notification' in window) {
      // make sure you grant this
      await Notification.requestPermission();
    }
    await initServiceWorker();

    // enable button
    /** @type {HTMLButtonElement | null} */
    const button = document.querySelector('button#btn');
    button?.removeAttribute('disabled');
  }
  void init();
})();
