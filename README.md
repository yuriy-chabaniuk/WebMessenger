# Basic usage

Include js file in you project:

```js
<script type="text/javascript" src="web-messenger.js"></script>
```

## Sending basic message.

```js

var webMessenger = new WebMessenger();

webMessenger.send('Message title', {body: "New item was added.", icon: "icon.jpg"});
```

## Set event listeners.

```js

var webMessenger = new WebMessenger();

webMessenger.on("click", function () {
              /* Do something. */
          }).on("close", function () {
              /* Do something. */
          });

webMessenger.send('Message title', {body: "New item was added.", icon: "icon.jpg"});
```

## Remove event listeners.

```js
var webMessenger = new WebMessenger();

webMessenger.off("click"})
    .off("close");

webMessenger.send('Message title', {body: "New item was added.", icon: "icon.jpg"});
```

# Using queue.

```js
var webMessenger = new WebMessenger();

/* If callback return true message will be send. */

webMessenger.queue('title', { body: "body for MESSAGE 1", icon: "icon.jpg" }, function () {
            return false;
        })
         .queue('title', { body: "body for MESSAGE 2", icon: "icon.jpg" }, function () {
            return true;
        });

/* Message callback has higher priority. */
webMessenger.processQueue(function () {
    return true;
});

```

