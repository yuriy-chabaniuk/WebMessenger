WebMessenger = function(configs) {
    var self = this;
    self.configs = {};
    self.events = [];
    self.messages = [];
    self.permission = null;

    self.init = function (configs) {
        self.requestPermissions();
        self.setConfigs(configs);
    }

    /**
     * Set configs from object.
     *
     * @param object options
     */
    self.setConfigs = function (options) {
        if (self.isObject(options)) {
            for (var prop in options) {
                self.config(prop, options[prop])
            }
        }
    }

    /**
     * get/set config.
     *
     * @param string key
     * @param value
     * @returns mixed|boolean
     */
    self.config = function (key, value) {
        var result = true;

        if (value) {
            self.configs.key = value;
        } else {
            result = self.configs.key;
        }

        return result;
    }

    /**
     *
     * @param string key
     * @param value
     * @returns {WebMessenger}
     */
    self.addConfig = function (key, value) {
        self.config(key, value);

        return self;
    }

    self.getVersion = function () {
        return '0.2';
    }

    /**
     * Check if browser supports push notifications.
     * @returns {boolean}
     */
    self.isSupported = function () {
        var isSupported = false;

        try {
            isSupported = !!(window.Notification || window.webkitNotifications || navigator.mozNotification || (window.external && window.external.msIsSiteMode() !== undefined));
        } catch (e) {

        }

        return isSupported;
    }

    /**
     * Handle permissions stuff.
     * @returns {boolean}
     */
    self.requestPermissions = function () {
        var result = false;

        if (self.isSupported() === true) {
            if (window.webkitNotifications) {
                var notifications = window.webkitNotifications;
            } else {
                var notifications = Notification;
            }

            if (notifications.permission === "granted") {
                self.permission = "granted";
            } else if (notifications.permission !== "denied") {
                notifications.requestPermission(function (permission) {
                    self.permission = permission;
                });
            }
        }

        return result;
    }

    self.isCallback = function (callback) {
        return (callback && callback.constructor === Function);
    }

    self.isObject = function (object) {
        return (object && object.constructor === Object);
    }

    self.isString = function (string) {
        return (string && string.constructor === String)
    }

    self.buildNotification = function (title, options) {
        var notification = null;
        options = self.prepareOptions(options);

        if (window.Notification) {
            notification =  new window.Notification(title, {
                icon: options.icon,
                body: options.body,
            });
        } else if (window.webkitNotifications) {
            notification = window.webkitNotifications.createNotification(options.icon, title, options.body);
            notification.show();
        } else if (navigator.mozNotification) {
            notification = navigator.mozNotification.createNotification(title, options.body, options.icon);
            notification.show();
        }

        return notification;
    }

    self.prepareOptions = function (options) {
        var result = {
            'body': '',
            'icon': ''
        };

        if (self.isString(options.icon)) {
            result.icon = options.icon;
        }

        if (self.isString(options.body)) {
            result.body = options.body;
        }

        return result;
    }

    self.validateOptions = function (options) {
        var isValid = false;

        if (self.isObject(options)) {
            isValid = true;
        }

        return isValid;
    }

    /**
     * Send push notification.
     *
     * @param string title
     * @param Object options
     */
    self.send = function (title, options) {
        if (self.permission === "granted" && self.validateOptions(options) === true) {
            var notification = self.buildNotification(title, options);

            for (var prop in self.events) {
                var handler = self.events[prop];
                if (self.isCallback(handler)) {
                    notification["on" + prop] = handler;
                }
            }
        }
    }

    /**
     * Attach event for notification. eg: click, close ...
     *
     * @param string event
     * @param callback handler
     * @returns {WebMessenger}
     */
    self.event = function (event, handler) {
        if (self.isCallback(handler)) {
            self.events[event] = handler;
        }

        return self;
    }

    /**
     * Wrapper for self.event();
     *
     * @param string event
     * @param callback handler
     * @returns {WebMessenger}
     */
    self.on = function (event, handler) {
        return self.event(event, handler);
    }

    /**
     * Wrapper for self.removeEvent();
     *
     * @param string event
     */
    self.off = function (event) {
        return self.removeEvent(event);
    }

    /**
     * Remove event from notification.
     *
     * @param string event
     * @returns {WebMessenger}
     */
    self.removeEvent = function (event) {
        self.events[event] = null;

        return self;
    }

    /**
     * Add message to queue.
     *
     * @param string title
     * @param object options
     * @param callback|null trigger
     * @returns {WebMessenger}
     */
    self.queue = function (title, options, trigger) {
        var queueMessage = {
            'title': title,
            'options': options,
            'trigger': trigger
        };

        self.messages.push(queueMessage);

        return self;
    }

    /**
     * Process queue. Apply trigger to send messages if need.
     *
     * @param callback trigger
     */
    self.processQueue = function (trigger) {
        for (var message in self.messages) {
            var queueMessage = self.messages[message];
            var send = false;

            if (self.isCallback(queueMessage.trigger)) {
                send = queueMessage.trigger.call();
            } else if (self.isCallback(trigger)) {
                send = trigger.call();
            } else {
                /* Send message if there are no triggers applied */
                send = true;
            }

            if (send === true) {
                self.send(queueMessage.title, queueMessage.options);
                /* We should remove message if it was already send. */
                delete self.messages[message];
            }
        }

        /* Filter out the queue until there are messages there */
        if (self.messages.length > 0) {
            setTimeout(function () {
                self.processQueue(trigger);
            }, self.config('queueTimeout'));
        }
    }

    self.init(configs);
}
