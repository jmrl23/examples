/// <reference path="../node_modules/@types/serviceworker/index.d.ts" />

(function () {
  self.addEventListener('push', swPush);

  /** @param {PushEvent} event  */
  function swPush(event) {
    const data = event.data.json();

    event.waitUntil(
      self.registration.showNotification(data?.title ?? 'Notification', {
        body: data?.message?.toString?.(),
      }),
    );
  }
})();
