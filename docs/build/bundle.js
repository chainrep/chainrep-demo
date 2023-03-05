
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    // Adapted from https://github.com/then/is-promise/blob/master/index.js
    // Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE
    function is_promise(value) {
        return !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
        return style.sheet;
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty$1() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function xlink_attr(node, attribute, value) {
        node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash$1(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash$1(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { ownerNode } = info.stylesheet;
                // there is no ownerNode if it runs on jsdom.
                if (ownerNode)
                    detach(ownerNode);
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately after the component has been updated.
     *
     * The first time the callback runs will be after the initial `onMount`
     */
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait$1() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        const options = { direction: 'in' };
        let config = fn(node, params, options);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config(options);
                    wait$1().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        const options = { direction: 'out' };
        let config = fn(node, params, options);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait$1().then(() => {
                // @ts-ignore
                config = config(options);
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        const options = { direction: 'both' };
        let config = fn(node, params, options);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait$1().then(() => {
                        // @ts-ignore
                        config = config(options);
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.55.1' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    function construct_svelte_component_dev(component, props) {
        const error_message = 'this={...} of <svelte:component> should specify a Svelte component.';
        try {
            const instance = new component(props);
            if (!instance.$$ || !instance.$set || !instance.$on || !instance.$destroy) {
                throw new Error(error_message);
            }
            return instance;
        }
        catch (err) {
            const { message } = err;
            if (typeof message === 'string' && message.indexOf('is not a constructor') !== -1) {
                throw new Error(error_message);
            }
            else {
                throw err;
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* Do NOT modify this file; see /src.ts/_admin/update-version.ts */
    /**
     *  The current version of Ethers.
     */
    const version = "6.0.8";

    /**
     *  Property helper functions.
     *
     *  @_subsection api/utils:Properties  [about-properties]
     */
    function checkType(value, type, name) {
        const types = type.split("|").map(t => t.trim());
        for (let i = 0; i < types.length; i++) {
            switch (type) {
                case "any":
                    return;
                case "bigint":
                case "boolean":
                case "number":
                case "string":
                    if (typeof (value) === type) {
                        return;
                    }
            }
        }
        const error = new Error(`invalid value for type ${type}`);
        error.code = "INVALID_ARGUMENT";
        error.argument = `value.${name}`;
        error.value = value;
        throw error;
    }
    /**
     *  Resolves to a new object that is a copy of %%value%%, but with all
     *  values resolved.
     */
    async function resolveProperties(value) {
        const keys = Object.keys(value);
        const results = await Promise.all(keys.map((k) => Promise.resolve(value[k])));
        return results.reduce((accum, v, index) => {
            accum[keys[index]] = v;
            return accum;
        }, {});
    }
    /**
     *  Assigns the %%values%% to %%target%% as read-only values.
     *
     *  It %%types%% is specified, the values are checked.
     */
    function defineProperties(target, values, types) {
        for (let key in values) {
            let value = values[key];
            const type = (types ? types[key] : null);
            if (type) {
                checkType(value, type, key);
            }
            Object.defineProperty(target, key, { enumerable: true, value, writable: false });
        }
    }

    /**
     *  About Errors.
     *
     *  @_section: api/utils/errors:Errors  [about-errors]
     */
    function stringify(value) {
        if (value == null) {
            return "null";
        }
        if (Array.isArray(value)) {
            return "[ " + (value.map(stringify)).join(", ") + " ]";
        }
        if (value instanceof Uint8Array) {
            const HEX = "0123456789abcdef";
            let result = "0x";
            for (let i = 0; i < value.length; i++) {
                result += HEX[value[i] >> 4];
                result += HEX[value[i] & 0xf];
            }
            return result;
        }
        if (typeof (value) === "object" && typeof (value.toJSON) === "function") {
            return stringify(value.toJSON());
        }
        switch (typeof (value)) {
            case "boolean":
            case "symbol":
                return value.toString();
            case "bigint":
                return BigInt(value).toString();
            case "number":
                return (value).toString();
            case "string":
                return JSON.stringify(value);
            case "object": {
                const keys = Object.keys(value);
                keys.sort();
                return "{ " + keys.map((k) => `${stringify(k)}: ${stringify(value[k])}`).join(", ") + " }";
            }
        }
        return `[ COULD NOT SERIALIZE ]`;
    }
    /**
     *  Returns true if the %%error%% matches an error thrown by ethers
     *  that matches the error %%code%%.
     *
     *  In TypeScript envornoments, this can be used to check that %%error%%
     *  matches an EthersError type, which means the expected properties will
     *  be set.
     *
     *  @See [ErrorCodes](api:ErrorCode)
     *  @example
     *    try {
     *      // code....
     *    } catch (e) {
     *      if (isError(e, "CALL_EXCEPTION")) {
     *          // The Type Guard has validated this object
     *          console.log(e.data);
     *      }
     *    }
     */
    function isError(error, code) {
        return (error && error.code === code);
    }
    /**
     *  Returns true if %%error%% is a [[CallExceptionError].
     */
    function isCallException(error) {
        return isError(error, "CALL_EXCEPTION");
    }
    /**
     *  Returns a new Error configured to the format ethers emits errors, with
     *  the %%message%%, [[api:ErrorCode]] %%code%% and additioanl properties
     *  for the corresponding EthersError.
     *
     *  Each error in ethers includes the version of ethers, a
     *  machine-readable [[ErrorCode]], and depneding on %%code%%, additional
     *  required properties. The error message will also include the %%meeage%%,
     *  ethers version, %%code%% and all aditional properties, serialized.
     */
    function makeError(message, code, info) {
        {
            const details = [];
            if (info) {
                if ("message" in info || "code" in info || "name" in info) {
                    throw new Error(`value will overwrite populated values: ${stringify(info)}`);
                }
                for (const key in info) {
                    const value = (info[key]);
                    //                try {
                    details.push(key + "=" + stringify(value));
                    //                } catch (error: any) {
                    //                console.log("MMM", error.message);
                    //                    details.push(key + "=[could not serialize object]");
                    //                }
                }
            }
            details.push(`code=${code}`);
            details.push(`version=${version}`);
            if (details.length) {
                message += " (" + details.join(", ") + ")";
            }
        }
        let error;
        switch (code) {
            case "INVALID_ARGUMENT":
                error = new TypeError(message);
                break;
            case "NUMERIC_FAULT":
            case "BUFFER_OVERRUN":
                error = new RangeError(message);
                break;
            default:
                error = new Error(message);
        }
        defineProperties(error, { code });
        if (info) {
            Object.assign(error, info);
        }
        return error;
    }
    /**
     *  Throws an EthersError with %%message%%, %%code%% and additional error
     *  %%info%% when %%check%% is falsish..
     *
     *  @see [[api:makeError]]
     */
    function assert$1(check, message, code, info) {
        if (!check) {
            throw makeError(message, code, info);
        }
    }
    /**
     *  A simple helper to simply ensuring provided arguments match expected
     *  constraints, throwing if not.
     *
     *  In TypeScript environments, the %%check%% has been asserted true, so
     *  any further code does not need additional compile-time checks.
     */
    function assertArgument(check, message, name, value) {
        assert$1(check, message, "INVALID_ARGUMENT", { argument: name, value: value });
    }
    function assertArgumentCount(count, expectedCount, message) {
        if (message == null) {
            message = "";
        }
        if (message) {
            message = ": " + message;
        }
        assert$1(count >= expectedCount, "missing arguemnt" + message, "MISSING_ARGUMENT", {
            count: count,
            expectedCount: expectedCount
        });
        assert$1(count <= expectedCount, "too many arguemnts" + message, "UNEXPECTED_ARGUMENT", {
            count: count,
            expectedCount: expectedCount
        });
    }
    const _normalizeForms = ["NFD", "NFC", "NFKD", "NFKC"].reduce((accum, form) => {
        try {
            // General test for normalize
            /* c8 ignore start */
            if ("test".normalize(form) !== "test") {
                throw new Error("bad");
            }
            ;
            /* c8 ignore stop */
            if (form === "NFD") {
                const check = String.fromCharCode(0xe9).normalize("NFD");
                const expected = String.fromCharCode(0x65, 0x0301);
                /* c8 ignore start */
                if (check !== expected) {
                    throw new Error("broken");
                }
                /* c8 ignore stop */
            }
            accum.push(form);
        }
        catch (error) { }
        return accum;
    }, []);
    /**
     *  Throws if the normalization %%form%% is not supported.
     */
    function assertNormalize(form) {
        assert$1(_normalizeForms.indexOf(form) >= 0, "platform missing String.prototype.normalize", "UNSUPPORTED_OPERATION", {
            operation: "String.prototype.normalize", info: { form }
        });
    }
    /**
     *  Many classes use file-scoped values to guard the constructor,
     *  making it effectively private. This facilitates that pattern
     *  by ensuring the %%givenGaurd%% matches the file-scoped %%guard%%,
     *  throwing if not, indicating the %%className%% if provided.
     */
    function assertPrivate(givenGuard, guard, className) {
        if (className == null) {
            className = "";
        }
        if (givenGuard !== guard) {
            let method = className, operation = "new";
            if (className) {
                method += ".";
                operation += " " + className;
            }
            assert$1(false, `private constructor; use ${method}from* methods`, "UNSUPPORTED_OPERATION", {
                operation
            });
        }
    }

    /**
     *  Some data helpers.
     *
     *
     *  @_subsection api/utils:Data Helpers  [about-data]
     */
    function _getBytes(value, name, copy) {
        if (value instanceof Uint8Array) {
            if (copy) {
                return new Uint8Array(value);
            }
            return value;
        }
        if (typeof (value) === "string" && value.match(/^0x([0-9a-f][0-9a-f])*$/i)) {
            const result = new Uint8Array((value.length - 2) / 2);
            let offset = 2;
            for (let i = 0; i < result.length; i++) {
                result[i] = parseInt(value.substring(offset, offset + 2), 16);
                offset += 2;
            }
            return result;
        }
        assertArgument(false, "invalid BytesLike value", name || "value", value);
    }
    /**
     *  Get a typed Uint8Array for %%value%%. If already a Uint8Array
     *  the original %%value%% is returned; if a copy is required use
     *  [[getBytesCopy]].
     *
     *  @see: getBytesCopy
     */
    function getBytes(value, name) {
        return _getBytes(value, name, false);
    }
    /**
     *  Get a typed Uint8Array for %%value%%, creating a copy if necessary
     *  to prevent any modifications of the returned value from being
     *  reflected elsewhere.
     *
     *  @see: getBytes
     */
    function getBytesCopy(value, name) {
        return _getBytes(value, name, true);
    }
    /**
     *  Returns true if %%value%% is a valid [[HexString]].
     *
     *  If %%length%% is ``true`` or a //number//, it also checks that
     *  %%value%% is a valid [[DataHexString]] of %%length%% (if a //number//)
     *  bytes of data (e.g. ``0x1234`` is 2 bytes).
     */
    function isHexString(value, length) {
        if (typeof (value) !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
            return false;
        }
        if (typeof (length) === "number" && value.length !== 2 + 2 * length) {
            return false;
        }
        if (length === true && (value.length % 2) !== 0) {
            return false;
        }
        return true;
    }
    /**
     *  Returns true if %%value%% is a valid representation of arbitrary
     *  data (i.e. a valid [[DataHexString]] or a Uint8Array).
     */
    function isBytesLike(value) {
        return (isHexString(value, true) || (value instanceof Uint8Array));
    }
    const HexCharacters = "0123456789abcdef";
    /**
     *  Returns a [[DataHexString]] representation of %%data%%.
     */
    function hexlify(data) {
        const bytes = getBytes(data);
        let result = "0x";
        for (let i = 0; i < bytes.length; i++) {
            const v = bytes[i];
            result += HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f];
        }
        return result;
    }
    /**
     *  Returns a [[DataHexString]] by concatenating all values
     *  within %%data%%.
     */
    function concat(datas) {
        return "0x" + datas.map((d) => hexlify(d).substring(2)).join("");
    }
    /**
     *  Returns the length of %%data%%, in bytes.
     */
    function dataLength(data) {
        if (isHexString(data, true)) {
            return (data.length - 2) / 2;
        }
        return getBytes(data).length;
    }
    /**
     *  Returns a [[DataHexString]] by slicing %%data%% from the %%start%%
     *  offset to the %%end%% offset.
     *
     *  By default %%start%% is 0 and %%end%% is the length of %%data%%.
     */
    function dataSlice(data, start, end) {
        const bytes = getBytes(data);
        if (end != null && end > bytes.length) {
            assert$1(false, "cannot slice beyond data bounds", "BUFFER_OVERRUN", {
                buffer: bytes, length: bytes.length, offset: end
            });
        }
        return hexlify(bytes.slice((start == null) ? 0 : start, (end == null) ? bytes.length : end));
    }
    function zeroPad(data, length, left) {
        const bytes = getBytes(data);
        assert$1(length >= bytes.length, "padding exceeds data length", "BUFFER_OVERRUN", {
            buffer: new Uint8Array(bytes),
            length: length,
            offset: length + 1
        });
        const result = new Uint8Array(length);
        result.fill(0);
        if (left) {
            result.set(bytes, length - bytes.length);
        }
        else {
            result.set(bytes, 0);
        }
        return hexlify(result);
    }
    /**
     *  Return the [[DataHexString]] of %%data%% padded on the **left**
     *  to %%length%% bytes.
     *
     *  If %%data%% already exceeds %%length%%, a [[BufferOverrunError]] is
     *  thrown.
     *
     *  This pads data the same as **values** are in Solidity
     *  (e.g. ``uint128``).
     */
    function zeroPadValue(data, length) {
        return zeroPad(data, length, true);
    }

    /**
     *  Some mathematic operations.
     *
     *  @_subsection: api/utils:Math Helpers  [about-maths]
     */
    const BN_0$8 = BigInt(0);
    const BN_1$3 = BigInt(1);
    //const BN_Max256 = (BN_1 << BigInt(256)) - BN_1;
    // IEEE 754 support 53-bits of mantissa
    const maxValue = 0x1fffffffffffff;
    /**
     *  Convert %%value%% from a twos-compliment representation of %%width%%
     *  bits to its value.
     *
     *  If the highest bit is ``1``, the result will be negative.
     */
    function fromTwos(_value, _width) {
        const value = getUint(_value, "value");
        const width = BigInt(getNumber(_width, "width"));
        assert$1((value >> width) === BN_0$8, "overflow", "NUMERIC_FAULT", {
            operation: "fromTwos", fault: "overflow", value: _value
        });
        // Top bit set; treat as a negative value
        if (value >> (width - BN_1$3)) {
            const mask = (BN_1$3 << width) - BN_1$3;
            return -(((~value) & mask) + BN_1$3);
        }
        return value;
    }
    /**
     *  Convert %%value%% to a twos-compliment representation of
     *  %%width%% bits.
     *
     *  The result will always be positive.
     */
    function toTwos(_value, _width) {
        let value = getBigInt(_value, "value");
        const width = BigInt(getNumber(_width, "width"));
        const limit = (BN_1$3 << (width - BN_1$3));
        if (value < BN_0$8) {
            value = -value;
            assert$1(value <= limit, "too low", "NUMERIC_FAULT", {
                operation: "toTwos", fault: "overflow", value: _value
            });
            const mask = (BN_1$3 << width) - BN_1$3;
            return ((~value) & mask) + BN_1$3;
        }
        else {
            assert$1(value < limit, "too high", "NUMERIC_FAULT", {
                operation: "toTwos", fault: "overflow", value: _value
            });
        }
        return value;
    }
    /**
     *  Mask %%value%% with a bitmask of %%bits%% ones.
     */
    function mask(_value, _bits) {
        const value = getUint(_value, "value");
        const bits = BigInt(getNumber(_bits, "bits"));
        return value & ((BN_1$3 << bits) - BN_1$3);
    }
    /**
     *  Gets a BigInt from %%value%%. If it is an invalid value for
     *  a BigInt, then an ArgumentError will be thrown for %%name%%.
     */
    function getBigInt(value, name) {
        switch (typeof (value)) {
            case "bigint": return value;
            case "number":
                assertArgument(Number.isInteger(value), "underflow", name || "value", value);
                assertArgument(value >= -maxValue && value <= maxValue, "overflow", name || "value", value);
                return BigInt(value);
            case "string":
                try {
                    if (value === "") {
                        throw new Error("empty string");
                    }
                    if (value[0] === "-" && value[1] !== "-") {
                        return -BigInt(value.substring(1));
                    }
                    return BigInt(value);
                }
                catch (e) {
                    assertArgument(false, `invalid BigNumberish string: ${e.message}`, name || "value", value);
                }
        }
        assertArgument(false, "invalid BigNumberish value", name || "value", value);
    }
    function getUint(value, name) {
        const result = getBigInt(value, name);
        assert$1(result >= BN_0$8, "unsigned value cannot be negative", "NUMERIC_FAULT", {
            fault: "overflow", operation: "getUint", value
        });
        return result;
    }
    const Nibbles = "0123456789abcdef";
    /*
     * Converts %%value%% to a BigInt. If %%value%% is a Uint8Array, it
     * is treated as Big Endian data.
     */
    function toBigInt(value) {
        if (value instanceof Uint8Array) {
            let result = "0x0";
            for (const v of value) {
                result += Nibbles[v >> 4];
                result += Nibbles[v & 0x0f];
            }
            return BigInt(result);
        }
        return getBigInt(value);
    }
    /**
     *  Gets a //number// from %%value%%. If it is an invalid value for
     *  a //number//, then an ArgumentError will be thrown for %%name%%.
     */
    function getNumber(value, name) {
        switch (typeof (value)) {
            case "bigint":
                assertArgument(value >= -maxValue && value <= maxValue, "overflow", name || "value", value);
                return Number(value);
            case "number":
                assertArgument(Number.isInteger(value), "underflow", name || "value", value);
                assertArgument(value >= -maxValue && value <= maxValue, "overflow", name || "value", value);
                return value;
            case "string":
                try {
                    if (value === "") {
                        throw new Error("empty string");
                    }
                    return getNumber(BigInt(value), name);
                }
                catch (e) {
                    assertArgument(false, `invalid numeric string: ${e.message}`, name || "value", value);
                }
        }
        assertArgument(false, "invalid numeric value", name || "value", value);
    }
    /**
     *  Converts %%value%% to a number. If %%value%% is a Uint8Array, it
     *  is treated as Big Endian data. Throws if the value is not safe.
     */
    function toNumber(value) {
        return getNumber(toBigInt(value));
    }
    /**
     *  Converts %%value%% to a Big Endian hexstring, optionally padded to
     *  %%width%% bytes.
     */
    function toBeHex(_value, _width) {
        const value = getUint(_value, "value");
        let result = value.toString(16);
        if (_width == null) {
            // Ensure the value is of even length
            if (result.length % 2) {
                result = "0" + result;
            }
        }
        else {
            const width = getNumber(_width, "width");
            assert$1(width * 2 >= result.length, `value exceeds width (${width} bits)`, "NUMERIC_FAULT", {
                operation: "toBeHex",
                fault: "overflow",
                value: _value
            });
            // Pad the value to the required width
            while (result.length < (width * 2)) {
                result = "0" + result;
            }
        }
        return "0x" + result;
    }
    /**
     *  Converts %%value%% to a Big Endian Uint8Array.
     */
    function toBeArray(_value) {
        const value = getUint(_value, "value");
        if (value === BN_0$8) {
            return new Uint8Array([]);
        }
        let hex = value.toString(16);
        if (hex.length % 2) {
            hex = "0" + hex;
        }
        const result = new Uint8Array(hex.length / 2);
        for (let i = 0; i < result.length; i++) {
            const offset = i * 2;
            result[i] = parseInt(hex.substring(offset, offset + 2), 16);
        }
        return result;
    }
    /**
     *  Returns a [[HexString]] for %%value%% safe to use as a //Quantity//.
     *
     *  A //Quantity// does not have and leading 0 values unless the value is
     *  the literal value `0x0`. This is most commonly used for JSSON-RPC
     *  numeric values.
     */
    function toQuantity(value) {
        let result = hexlify(isBytesLike(value) ? value : toBeArray(value)).substring(2);
        while (result.startsWith("0")) {
            result = result.substring(1);
        }
        if (result === "") {
            result = "0";
        }
        return "0x" + result;
    }

    /**
     *  The [Base58 Encoding](link-base58) scheme allows a **numeric** value
     *  to be encoded as a compact string using a radix of 58 using only
     *  alpha-numeric characters. Confusingly similar characters are omitted
     *  (i.e. ``"l0O"``).
     *
     *  Note that Base58 encodes a **numeric** value, not arbitrary bytes,
     *  since any zero-bytes on the left would get removed. To mitigate this
     *  issue most schemes that use Base58 choose specific high-order values
     *  to ensure non-zero prefixes.
     *
     *  @_subsection: api/utils:Base58 Encoding [about-base58]
     */
    const Alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    BigInt(0);
    const BN_58 = BigInt(58);
    /**
     *  Encode %%value%% as a Base58-encoded string.
     */
    function encodeBase58(_value) {
        let value = toBigInt(getBytes(_value));
        let result = "";
        while (value) {
            result = Alphabet[Number(value % BN_58)] + result;
            value /= BN_58;
        }
        return result;
    }

    // utils/base64-browser
    function decodeBase64(textData) {
        textData = atob(textData);
        const data = new Uint8Array(textData.length);
        for (let i = 0; i < textData.length; i++) {
            data[i] = textData.charCodeAt(i);
        }
        return getBytes(data);
    }
    function encodeBase64(_data) {
        const data = getBytes(_data);
        let textData = "";
        for (let i = 0; i < data.length; i++) {
            textData += String.fromCharCode(data[i]);
        }
        return btoa(textData);
    }

    /**
     *  Explain events...
     *
     *  @_section api/utils/events:Events  [about-events]
     */
    /**
     *  When an [[EventEmitterable]] triggers a [[Listener]], the
     *  callback always ahas one additional argument passed, which is
     *  an **EventPayload**.
     */
    class EventPayload {
        /**
         *  The event filter.
         */
        filter;
        /**
         *  The **EventEmitterable**.
         */
        emitter;
        #listener;
        /**
         *  Create a new **EventPayload** for %%emitter%% with
         *  the %%listener%% and for %%filter%%.
         */
        constructor(emitter, listener, filter) {
            this.#listener = listener;
            defineProperties(this, { emitter, filter });
        }
        /**
         *  Unregister the triggered listener for future events.
         */
        async removeListener() {
            if (this.#listener == null) {
                return;
            }
            await this.emitter.off(this.filter, this.#listener);
        }
    }

    /**
     *  Using strings in Ethereum (or any security-basd system) requires
     *  additional care. These utilities attempt to mitigate some of the
     *  safety issues as well as provide the ability to recover and analyse
     *  strings.
     *
     *  @_subsection api/utils:Strings and UTF-8  [about-strings]
     */
    function errorFunc(reason, offset, bytes, output, badCodepoint) {
        assertArgument(false, `invalid codepoint at offset ${offset}; ${reason}`, "bytes", bytes);
    }
    function ignoreFunc(reason, offset, bytes, output, badCodepoint) {
        // If there is an invalid prefix (including stray continuation), skip any additional continuation bytes
        if (reason === "BAD_PREFIX" || reason === "UNEXPECTED_CONTINUE") {
            let i = 0;
            for (let o = offset + 1; o < bytes.length; o++) {
                if (bytes[o] >> 6 !== 0x02) {
                    break;
                }
                i++;
            }
            return i;
        }
        // This byte runs us past the end of the string, so just jump to the end
        // (but the first byte was read already read and therefore skipped)
        if (reason === "OVERRUN") {
            return bytes.length - offset - 1;
        }
        // Nothing to skip
        return 0;
    }
    function replaceFunc(reason, offset, bytes, output, badCodepoint) {
        // Overlong representations are otherwise "valid" code points; just non-deistingtished
        if (reason === "OVERLONG") {
            assertArgument(typeof (badCodepoint) === "number", "invalid bad code point for replacement", "badCodepoint", badCodepoint);
            output.push(badCodepoint);
            return 0;
        }
        // Put the replacement character into the output
        output.push(0xfffd);
        // Otherwise, process as if ignoring errors
        return ignoreFunc(reason, offset, bytes);
    }
    /**
     *  A handful of popular, built-in UTF-8 error handling strategies.
     *
     *  **``"error"``** - throws on ANY illegal UTF-8 sequence or
     *  non-canonical (overlong) codepoints (this is the default)
     *
     *  **``"ignore"``** - silently drops any illegal UTF-8 sequence
     *  and accepts non-canonical (overlong) codepoints
     *
     *  **``"replace"``** - replace any illegal UTF-8 sequence with the
     *  UTF-8 replacement character (i.e. ``"\\ufffd"``) and accepts
     *  non-canonical (overlong) codepoints
     *
     *  @returns: Record<"error" | "ignore" | "replace", Utf8ErrorFunc>
     */
    const Utf8ErrorFuncs = Object.freeze({
        error: errorFunc,
        ignore: ignoreFunc,
        replace: replaceFunc
    });
    // http://stackoverflow.com/questions/13356493/decode-utf-8-with-javascript#13691499
    function getUtf8CodePoints(_bytes, onError) {
        if (onError == null) {
            onError = Utf8ErrorFuncs.error;
        }
        const bytes = getBytes(_bytes, "bytes");
        const result = [];
        let i = 0;
        // Invalid bytes are ignored
        while (i < bytes.length) {
            const c = bytes[i++];
            // 0xxx xxxx
            if (c >> 7 === 0) {
                result.push(c);
                continue;
            }
            // Multibyte; how many bytes left for this character?
            let extraLength = null;
            let overlongMask = null;
            // 110x xxxx 10xx xxxx
            if ((c & 0xe0) === 0xc0) {
                extraLength = 1;
                overlongMask = 0x7f;
                // 1110 xxxx 10xx xxxx 10xx xxxx
            }
            else if ((c & 0xf0) === 0xe0) {
                extraLength = 2;
                overlongMask = 0x7ff;
                // 1111 0xxx 10xx xxxx 10xx xxxx 10xx xxxx
            }
            else if ((c & 0xf8) === 0xf0) {
                extraLength = 3;
                overlongMask = 0xffff;
            }
            else {
                if ((c & 0xc0) === 0x80) {
                    i += onError("UNEXPECTED_CONTINUE", i - 1, bytes, result);
                }
                else {
                    i += onError("BAD_PREFIX", i - 1, bytes, result);
                }
                continue;
            }
            // Do we have enough bytes in our data?
            if (i - 1 + extraLength >= bytes.length) {
                i += onError("OVERRUN", i - 1, bytes, result);
                continue;
            }
            // Remove the length prefix from the char
            let res = c & ((1 << (8 - extraLength - 1)) - 1);
            for (let j = 0; j < extraLength; j++) {
                let nextChar = bytes[i];
                // Invalid continuation byte
                if ((nextChar & 0xc0) != 0x80) {
                    i += onError("MISSING_CONTINUE", i, bytes, result);
                    res = null;
                    break;
                }
                res = (res << 6) | (nextChar & 0x3f);
                i++;
            }
            // See above loop for invalid continuation byte
            if (res === null) {
                continue;
            }
            // Maximum code point
            if (res > 0x10ffff) {
                i += onError("OUT_OF_RANGE", i - 1 - extraLength, bytes, result, res);
                continue;
            }
            // Reserved for UTF-16 surrogate halves
            if (res >= 0xd800 && res <= 0xdfff) {
                i += onError("UTF16_SURROGATE", i - 1 - extraLength, bytes, result, res);
                continue;
            }
            // Check for overlong sequences (more bytes than needed)
            if (res <= overlongMask) {
                i += onError("OVERLONG", i - 1 - extraLength, bytes, result, res);
                continue;
            }
            result.push(res);
        }
        return result;
    }
    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    /**
     *  Returns the UTF-8 byte representation of %%str%%.
     *
     *  If %%form%% is specified, the string is normalized.
     */
    function toUtf8Bytes(str, form) {
        if (form != null) {
            assertNormalize(form);
            str = str.normalize(form);
        }
        let result = [];
        for (let i = 0; i < str.length; i++) {
            const c = str.charCodeAt(i);
            if (c < 0x80) {
                result.push(c);
            }
            else if (c < 0x800) {
                result.push((c >> 6) | 0xc0);
                result.push((c & 0x3f) | 0x80);
            }
            else if ((c & 0xfc00) == 0xd800) {
                i++;
                const c2 = str.charCodeAt(i);
                assertArgument(i < str.length && ((c2 & 0xfc00) === 0xdc00), "invalid surrogate pair", "str", str);
                // Surrogate Pair
                const pair = 0x10000 + ((c & 0x03ff) << 10) + (c2 & 0x03ff);
                result.push((pair >> 18) | 0xf0);
                result.push(((pair >> 12) & 0x3f) | 0x80);
                result.push(((pair >> 6) & 0x3f) | 0x80);
                result.push((pair & 0x3f) | 0x80);
            }
            else {
                result.push((c >> 12) | 0xe0);
                result.push(((c >> 6) & 0x3f) | 0x80);
                result.push((c & 0x3f) | 0x80);
            }
        }
        return new Uint8Array(result);
    }
    //export 
    function _toUtf8String(codePoints) {
        return codePoints.map((codePoint) => {
            if (codePoint <= 0xffff) {
                return String.fromCharCode(codePoint);
            }
            codePoint -= 0x10000;
            return String.fromCharCode((((codePoint >> 10) & 0x3ff) + 0xd800), ((codePoint & 0x3ff) + 0xdc00));
        }).join("");
    }
    /**
     *  Returns the string represented by the UTF-8 data %%bytes%%.
     *
     *  When %%onError%% function is specified, it is called on UTF-8
     *  errors allowing recovery using the [[Utf8ErrorFunc]] API.
     *  (default: [error](Utf8ErrorFuncs))
     */
    function toUtf8String(bytes, onError) {
        return _toUtf8String(getUtf8CodePoints(bytes, onError));
    }

    // @TODO: timeout is completely ignored; start a Promise.any with a reject?
    async function getUrl(req, _signal) {
        const protocol = req.url.split(":")[0].toLowerCase();
        assert$1(protocol === "http" || protocol === "https", `unsupported protocol ${protocol}`, "UNSUPPORTED_OPERATION", {
            info: { protocol },
            operation: "request"
        });
        assert$1(!req.credentials || req.allowInsecureAuthentication, "insecure authorized connections unsupported", "UNSUPPORTED_OPERATION", {
            operation: "request"
        });
        let signal = undefined;
        if (_signal) {
            const controller = new AbortController();
            signal = controller.signal;
            _signal.addListener(() => { controller.abort(); });
        }
        const init = {
            method: req.method,
            headers: new Headers(Array.from(req)),
            body: req.body || undefined,
            signal
        };
        const resp = await fetch(req.url, init);
        const headers = {};
        resp.headers.forEach((value, key) => {
            headers[key.toLowerCase()] = value;
        });
        const respBody = await resp.arrayBuffer();
        const body = (respBody == null) ? null : new Uint8Array(respBody);
        return {
            statusCode: resp.status,
            statusMessage: resp.statusText,
            headers, body
        };
    }

    /**
     *  Explain fetching here...
     *
     *  @_section api/utils/fetching:Fetching Web Content  [about-fetch]
     */
    const MAX_ATTEMPTS = 12;
    const SLOT_INTERVAL = 250;
    // The global FetchGetUrlFunc implementation.
    let getUrlFunc = getUrl;
    const reData = new RegExp("^data:([^;:]*)?(;base64)?,(.*)$", "i");
    const reIpfs = new RegExp("^ipfs:/\/(ipfs/)?(.*)$", "i");
    // If locked, new Gateways cannot be added
    let locked$2 = false;
    // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URLs
    async function dataGatewayFunc(url, signal) {
        try {
            const match = url.match(reData);
            if (!match) {
                throw new Error("invalid data");
            }
            return new FetchResponse(200, "OK", {
                "content-type": (match[1] || "text/plain"),
            }, (match[2] ? decodeBase64(match[3]) : unpercent(match[3])));
        }
        catch (error) {
            return new FetchResponse(599, "BAD REQUEST (invalid data: URI)", {}, null, new FetchRequest(url));
        }
    }
    /**
     *  Returns a [[FetchGatewayFunc]] for fetching content from a standard
     *  IPFS gateway hosted at %%baseUrl%%.
     */
    function getIpfsGatewayFunc(baseUrl) {
        async function gatewayIpfs(url, signal) {
            try {
                const match = url.match(reIpfs);
                if (!match) {
                    throw new Error("invalid link");
                }
                return new FetchRequest(`${baseUrl}${match[2]}`);
            }
            catch (error) {
                return new FetchResponse(599, "BAD REQUEST (invalid IPFS URI)", {}, null, new FetchRequest(url));
            }
        }
        return gatewayIpfs;
    }
    const Gateways = {
        "data": dataGatewayFunc,
        "ipfs": getIpfsGatewayFunc("https:/\/gateway.ipfs.io/ipfs/")
    };
    const fetchSignals = new WeakMap();
    /**
     *  @_ignore
     */
    class FetchCancelSignal {
        #listeners;
        #cancelled;
        constructor(request) {
            this.#listeners = [];
            this.#cancelled = false;
            fetchSignals.set(request, () => {
                if (this.#cancelled) {
                    return;
                }
                this.#cancelled = true;
                for (const listener of this.#listeners) {
                    setTimeout(() => { listener(); }, 0);
                }
                this.#listeners = [];
            });
        }
        addListener(listener) {
            assert$1(!this.#cancelled, "singal already cancelled", "UNSUPPORTED_OPERATION", {
                operation: "fetchCancelSignal.addCancelListener"
            });
            this.#listeners.push(listener);
        }
        get cancelled() { return this.#cancelled; }
        checkSignal() {
            assert$1(!this.cancelled, "cancelled", "CANCELLED", {});
        }
    }
    // Check the signal, throwing if it is cancelled
    function checkSignal(signal) {
        if (signal == null) {
            throw new Error("missing signal; should not happen");
        }
        signal.checkSignal();
        return signal;
    }
    /**
     *  Represents a request for a resource using a URI.
     *
     *  By default, the supported schemes are ``HTTP``, ``HTTPS``, ``data:``,
     *  and ``IPFS:``.
     *
     *  Additional schemes can be added globally using [[registerGateway]].
     *
     *  @example:
     *    req = new FetchRequest("https://www.ricmoo.com")
     *    resp = await req.send()
     *    resp.body.length
     *    //_result:
     */
    class FetchRequest {
        #allowInsecure;
        #gzip;
        #headers;
        #method;
        #timeout;
        #url;
        #body;
        #bodyType;
        #creds;
        // Hooks
        #preflight;
        #process;
        #retry;
        #signal;
        #throttle;
        /**
         *  The fetch URI to requrest.
         */
        get url() { return this.#url; }
        set url(url) {
            this.#url = String(url);
        }
        /**
         *  The fetch body, if any, to send as the request body. //(default: null)//
         *
         *  When setting a body, the intrinsic ``Content-Type`` is automatically
         *  set and will be used if **not overridden** by setting a custom
         *  header.
         *
         *  If %%body%% is null, the body is cleared (along with the
         *  intrinsic ``Content-Type``) and the .
         *
         *  If %%body%% is a string, the intrincis ``Content-Type`` is set to
         *  ``text/plain``.
         *
         *  If %%body%% is a Uint8Array, the intrincis ``Content-Type`` is set to
         *  ``application/octet-stream``.
         *
         *  If %%body%% is any other object, the intrincis ``Content-Type`` is
         *  set to ``application/json``.
         */
        get body() {
            if (this.#body == null) {
                return null;
            }
            return new Uint8Array(this.#body);
        }
        set body(body) {
            if (body == null) {
                this.#body = undefined;
                this.#bodyType = undefined;
            }
            else if (typeof (body) === "string") {
                this.#body = toUtf8Bytes(body);
                this.#bodyType = "text/plain";
            }
            else if (body instanceof Uint8Array) {
                this.#body = body;
                this.#bodyType = "application/octet-stream";
            }
            else if (typeof (body) === "object") {
                this.#body = toUtf8Bytes(JSON.stringify(body));
                this.#bodyType = "application/json";
            }
            else {
                throw new Error("invalid body");
            }
        }
        /**
         *  Returns true if the request has a body.
         */
        hasBody() {
            return (this.#body != null);
        }
        /**
         *  The HTTP method to use when requesting the URI. If no method
         *  has been explicitly set, then ``GET`` is used if the body is
         *  null and ``POST`` otherwise.
         */
        get method() {
            if (this.#method) {
                return this.#method;
            }
            if (this.hasBody()) {
                return "POST";
            }
            return "GET";
        }
        set method(method) {
            if (method == null) {
                method = "";
            }
            this.#method = String(method).toUpperCase();
        }
        /**
         *  The headers that will be used when requesting the URI. All
         *  keys are lower-case.
         *
         *  This object is a copy, so any chnages will **NOT** be reflected
         *  in the ``FetchRequest``.
         *
         *  To set a header entry, use the ``setHeader`` method.
         */
        get headers() {
            const headers = Object.assign({}, this.#headers);
            if (this.#creds) {
                headers["authorization"] = `Basic ${encodeBase64(toUtf8Bytes(this.#creds))}`;
            }
            if (this.allowGzip) {
                headers["accept-encoding"] = "gzip";
            }
            if (headers["content-type"] == null && this.#bodyType) {
                headers["content-type"] = this.#bodyType;
            }
            if (this.body) {
                headers["content-length"] = String(this.body.length);
            }
            return headers;
        }
        /**
         *  Get the header for %%key%%, ignoring case.
         */
        getHeader(key) {
            return this.headers[key.toLowerCase()];
        }
        /**
         *  Set the header for %%key%% to %%value%%. All values are coerced
         *  to a string.
         */
        setHeader(key, value) {
            this.#headers[String(key).toLowerCase()] = String(value);
        }
        /**
         *  Clear all headers, resetting all intrinsic headers.
         */
        clearHeaders() {
            this.#headers = {};
        }
        [Symbol.iterator]() {
            const headers = this.headers;
            const keys = Object.keys(headers);
            let index = 0;
            return {
                next: () => {
                    if (index < keys.length) {
                        const key = keys[index++];
                        return {
                            value: [key, headers[key]], done: false
                        };
                    }
                    return { value: undefined, done: true };
                }
            };
        }
        /**
         *  The value that will be sent for the ``Authorization`` header.
         *
         *  To set the credentials, use the ``setCredentials`` method.
         */
        get credentials() {
            return this.#creds || null;
        }
        /**
         *  Sets an ``Authorization`` for %%username%% with %%password%%.
         */
        setCredentials(username, password) {
            assertArgument(!username.match(/:/), "invalid basic authentication username", "username", "[REDACTED]");
            this.#creds = `${username}:${password}`;
        }
        /**
         *  Enable and request gzip-encoded responses. The response will
         *  automatically be decompressed. //(default: true)//
         */
        get allowGzip() {
            return this.#gzip;
        }
        set allowGzip(value) {
            this.#gzip = !!value;
        }
        /**
         *  Allow ``Authentication`` credentials to be sent over insecure
         *  channels. //(default: false)//
         */
        get allowInsecureAuthentication() {
            return !!this.#allowInsecure;
        }
        set allowInsecureAuthentication(value) {
            this.#allowInsecure = !!value;
        }
        /**
         *  The timeout (in milliseconds) to wait for a complere response.
         *  //(default: 5 minutes)//
         */
        get timeout() { return this.#timeout; }
        set timeout(timeout) {
            assertArgument(timeout >= 0, "timeout must be non-zero", "timeout", timeout);
            this.#timeout = timeout;
        }
        /**
         *  This function is called prior to each request, for example
         *  during a redirection or retry in case of server throttling.
         *
         *  This offers an opportunity to populate headers or update
         *  content before sending a request.
         */
        get preflightFunc() {
            return this.#preflight || null;
        }
        set preflightFunc(preflight) {
            this.#preflight = preflight;
        }
        /**
         *  This function is called after each response, offering an
         *  opportunity to provide client-level throttling or updating
         *  response data.
         *
         *  Any error thrown in this causes the ``send()`` to throw.
         *
         *  To schedule a retry attempt (assuming the maximum retry limit
         *  has not been reached), use [[response.throwThrottleError]].
         */
        get processFunc() {
            return this.#process || null;
        }
        set processFunc(process) {
            this.#process = process;
        }
        /**
         *  This function is called on each retry attempt.
         */
        get retryFunc() {
            return this.#retry || null;
        }
        set retryFunc(retry) {
            this.#retry = retry;
        }
        /**
         *  Create a new FetchRequest instance with default values.
         *
         *  Once created, each property may be set before issuing a
         *  ``.send()`` to make teh request.
         */
        constructor(url) {
            this.#url = String(url);
            this.#allowInsecure = false;
            this.#gzip = true;
            this.#headers = {};
            this.#method = "";
            this.#timeout = 300000;
            this.#throttle = {
                slotInterval: SLOT_INTERVAL,
                maxAttempts: MAX_ATTEMPTS
            };
        }
        toString() {
            return `<FetchRequest method=${JSON.stringify(this.method)} url=${JSON.stringify(this.url)} headers=${JSON.stringify(this.headers)} body=${this.#body ? hexlify(this.#body) : "null"}>`;
        }
        /**
         *  Update the throttle parameters used to determine maximum
         *  attempts and exponential-backoff properties.
         */
        setThrottleParams(params) {
            if (params.slotInterval != null) {
                this.#throttle.slotInterval = params.slotInterval;
            }
            if (params.maxAttempts != null) {
                this.#throttle.maxAttempts = params.maxAttempts;
            }
        }
        async #send(attempt, expires, delay, _request, _response) {
            if (attempt >= this.#throttle.maxAttempts) {
                return _response.makeServerError("exceeded maximum retry limit");
            }
            assert$1(getTime$1() <= expires, "timeout", "TIMEOUT", {
                operation: "request.send", reason: "timeout", request: _request
            });
            if (delay > 0) {
                await wait(delay);
            }
            let req = this.clone();
            const scheme = (req.url.split(":")[0] || "").toLowerCase();
            // Process any Gateways
            if (scheme in Gateways) {
                const result = await Gateways[scheme](req.url, checkSignal(_request.#signal));
                if (result instanceof FetchResponse) {
                    let response = result;
                    if (this.processFunc) {
                        checkSignal(_request.#signal);
                        try {
                            response = await this.processFunc(req, response);
                        }
                        catch (error) {
                            // Something went wrong during processing; throw a 5xx server error
                            if (error.throttle == null || typeof (error.stall) !== "number") {
                                response.makeServerError("error in post-processing function", error).assertOk();
                            }
                            // Ignore throttling
                        }
                    }
                    return response;
                }
                req = result;
            }
            // We have a preflight function; update the request
            if (this.preflightFunc) {
                req = await this.preflightFunc(req);
            }
            const resp = await getUrlFunc(req, checkSignal(_request.#signal));
            let response = new FetchResponse(resp.statusCode, resp.statusMessage, resp.headers, resp.body, _request);
            if (response.statusCode === 301 || response.statusCode === 302) {
                // Redirect
                try {
                    const location = response.headers.location || "";
                    return req.redirect(location).#send(attempt + 1, expires, 0, _request, response);
                }
                catch (error) { }
                // Things won't get any better on another attempt; abort
                return response;
            }
            else if (response.statusCode === 429) {
                // Throttle
                if (this.retryFunc == null || (await this.retryFunc(req, response, attempt))) {
                    const retryAfter = response.headers["retry-after"];
                    let delay = this.#throttle.slotInterval * Math.trunc(Math.random() * Math.pow(2, attempt));
                    if (typeof (retryAfter) === "string" && retryAfter.match(/^[1-9][0-9]*$/)) {
                        delay = parseInt(retryAfter);
                    }
                    return req.clone().#send(attempt + 1, expires, delay, _request, response);
                }
            }
            if (this.processFunc) {
                checkSignal(_request.#signal);
                try {
                    response = await this.processFunc(req, response);
                }
                catch (error) {
                    // Something went wrong during processing; throw a 5xx server error
                    if (error.throttle == null || typeof (error.stall) !== "number") {
                        response.makeServerError("error in post-processing function", error).assertOk();
                    }
                    // Throttle
                    let delay = this.#throttle.slotInterval * Math.trunc(Math.random() * Math.pow(2, attempt));
                    if (error.stall >= 0) {
                        delay = error.stall;
                    }
                    return req.clone().#send(attempt + 1, expires, delay, _request, response);
                }
            }
            return response;
        }
        /**
         *  Resolves to the response by sending the request.
         */
        send() {
            assert$1(this.#signal == null, "request already sent", "UNSUPPORTED_OPERATION", { operation: "fetchRequest.send" });
            this.#signal = new FetchCancelSignal(this);
            return this.#send(0, getTime$1() + this.timeout, 0, this, new FetchResponse(0, "", {}, null, this));
        }
        /**
         *  Cancels the inflight response, causing a ``CANCELLED``
         *  error to be rejected from the [[send]].
         */
        cancel() {
            assert$1(this.#signal != null, "request has not been sent", "UNSUPPORTED_OPERATION", { operation: "fetchRequest.cancel" });
            const signal = fetchSignals.get(this);
            if (!signal) {
                throw new Error("missing signal; should not happen");
            }
            signal();
        }
        /**
         *  Returns a new [[FetchRequest]] that represents the redirection
         *  to %%location%%.
         */
        redirect(location) {
            // Redirection; for now we only support absolute locataions
            const current = this.url.split(":")[0].toLowerCase();
            const target = location.split(":")[0].toLowerCase();
            // Don't allow redirecting:
            // - non-GET requests
            // - downgrading the security (e.g. https => http)
            // - to non-HTTP (or non-HTTPS) protocols [this could be relaxed?]
            assert$1(this.method === "GET" && (current !== "https" || target !== "http") && location.match(/^https?:/), `unsupported redirect`, "UNSUPPORTED_OPERATION", {
                operation: `redirect(${this.method} ${JSON.stringify(this.url)} => ${JSON.stringify(location)})`
            });
            // Create a copy of this request, with a new URL
            const req = new FetchRequest(location);
            req.method = "GET";
            req.allowGzip = this.allowGzip;
            req.timeout = this.timeout;
            req.#headers = Object.assign({}, this.#headers);
            if (this.#body) {
                req.#body = new Uint8Array(this.#body);
            }
            req.#bodyType = this.#bodyType;
            // Do not forward credentials unless on the same domain; only absolute
            //req.allowInsecure = false;
            // paths are currently supported; may want a way to specify to forward?
            //setStore(req.#props, "creds", getStore(this.#pros, "creds"));
            return req;
        }
        /**
         *  Create a new copy of this request.
         */
        clone() {
            const clone = new FetchRequest(this.url);
            // Preserve "default method" (i.e. null)
            clone.#method = this.#method;
            // Preserve "default body" with type, copying the Uint8Array is present
            if (this.#body) {
                clone.#body = this.#body;
            }
            clone.#bodyType = this.#bodyType;
            // Preserve "default headers"
            clone.#headers = Object.assign({}, this.#headers);
            // Credentials is readonly, so we copy internally
            clone.#creds = this.#creds;
            if (this.allowGzip) {
                clone.allowGzip = true;
            }
            clone.timeout = this.timeout;
            if (this.allowInsecureAuthentication) {
                clone.allowInsecureAuthentication = true;
            }
            clone.#preflight = this.#preflight;
            clone.#process = this.#process;
            clone.#retry = this.#retry;
            return clone;
        }
        /**
         *  Locks all static configuration for gateways and FetchGetUrlFunc
         *  registration.
         */
        static lockConfig() {
            locked$2 = true;
        }
        /**
         *  Get the current Gateway function for %%scheme%%.
         */
        static getGateway(scheme) {
            return Gateways[scheme.toLowerCase()] || null;
        }
        /**
         *  Use the %%func%% when fetching URIs using %%scheme%%.
         *
         *  This method affects all requests globally.
         *
         *  If [[lockConfig]] has been called, no change is made and this
         *  throws.
         */
        static registerGateway(scheme, func) {
            scheme = scheme.toLowerCase();
            if (scheme === "http" || scheme === "https") {
                throw new Error(`cannot intercept ${scheme}; use registerGetUrl`);
            }
            if (locked$2) {
                throw new Error("gateways locked");
            }
            Gateways[scheme] = func;
        }
        /**
         *  Use %%getUrl%% when fetching URIs over HTTP and HTTPS requests.
         *
         *  This method affects all requests globally.
         *
         *  If [[lockConfig]] has been called, no change is made and this
         *  throws.
         */
        static registerGetUrl(getUrl) {
            if (locked$2) {
                throw new Error("gateways locked");
            }
            getUrlFunc = getUrl;
        }
        /**
         *  Creates a function that can "fetch" data URIs.
         *
         *  Note that this is automatically done internally to support
         *  data URIs, so it is not necessary to register it.
         *
         *  This is not generally something that is needed, but may
         *  be useful in a wrapper to perfom custom data URI functionality.
         */
        static createDataGateway() {
            return dataGatewayFunc;
        }
        /**
         *  Creates a function that will fetch IPFS (unvalidated) from
         *  a custom gateway baseUrl.
         *
         *  The default IPFS gateway used internally is
         *  ``"https:/\/gateway.ipfs.io/ipfs/"``.
         */
        static createIpfsGatewayFunc(baseUrl) {
            return getIpfsGatewayFunc(baseUrl);
        }
    }
    /**
     *  The response for a FetchREquest.
     */
    class FetchResponse {
        #statusCode;
        #statusMessage;
        #headers;
        #body;
        #request;
        #error;
        toString() {
            return `<FetchResponse status=${this.statusCode} body=${this.#body ? hexlify(this.#body) : "null"}>`;
        }
        /**
         *  The response status code.
         */
        get statusCode() { return this.#statusCode; }
        /**
         *  The response status message.
         */
        get statusMessage() { return this.#statusMessage; }
        /**
         *  The response headers. All keys are lower-case.
         */
        get headers() { return Object.assign({}, this.#headers); }
        /**
         *  The response body, or ``null`` if there was no body.
         */
        get body() {
            return (this.#body == null) ? null : new Uint8Array(this.#body);
        }
        /**
         *  The response body as a UTF-8 encoded string, or the empty
         *  string (i.e. ``""``) if there was no body.
         *
         *  An error is thrown if the body is invalid UTF-8 data.
         */
        get bodyText() {
            try {
                return (this.#body == null) ? "" : toUtf8String(this.#body);
            }
            catch (error) {
                assert$1(false, "response body is not valid UTF-8 data", "UNSUPPORTED_OPERATION", {
                    operation: "bodyText", info: { response: this }
                });
            }
        }
        /**
         *  The response body, decoded as JSON.
         *
         *  An error is thrown if the body is invalid JSON-encoded data
         *  or if there was no body.
         */
        get bodyJson() {
            try {
                return JSON.parse(this.bodyText);
            }
            catch (error) {
                assert$1(false, "response body is not valid JSON", "UNSUPPORTED_OPERATION", {
                    operation: "bodyJson", info: { response: this }
                });
            }
        }
        [Symbol.iterator]() {
            const headers = this.headers;
            const keys = Object.keys(headers);
            let index = 0;
            return {
                next: () => {
                    if (index < keys.length) {
                        const key = keys[index++];
                        return {
                            value: [key, headers[key]], done: false
                        };
                    }
                    return { value: undefined, done: true };
                }
            };
        }
        constructor(statusCode, statusMessage, headers, body, request) {
            this.#statusCode = statusCode;
            this.#statusMessage = statusMessage;
            this.#headers = Object.keys(headers).reduce((accum, k) => {
                accum[k.toLowerCase()] = String(headers[k]);
                return accum;
            }, {});
            this.#body = ((body == null) ? null : new Uint8Array(body));
            this.#request = (request || null);
            this.#error = { message: "" };
        }
        /**
         *  Return a Response with matching headers and body, but with
         *  an error status code (i.e. 599) and %%message%% with an
         *  optional %%error%%.
         */
        makeServerError(message, error) {
            let statusMessage;
            if (!message) {
                message = `${this.statusCode} ${this.statusMessage}`;
                statusMessage = `CLIENT ESCALATED SERVER ERROR (${message})`;
            }
            else {
                statusMessage = `CLIENT ESCALATED SERVER ERROR (${this.statusCode} ${this.statusMessage}; ${message})`;
            }
            const response = new FetchResponse(599, statusMessage, this.headers, this.body, this.#request || undefined);
            response.#error = { message, error };
            return response;
        }
        /**
         *  If called within a [request.processFunc](FetchRequest-processFunc)
         *  call, causes the request to retry as if throttled for %%stall%%
         *  milliseconds.
         */
        throwThrottleError(message, stall) {
            if (stall == null) {
                stall = -1;
            }
            else {
                assertArgument(Number.isInteger(stall) && stall >= 0, "invalid stall timeout", "stall", stall);
            }
            const error = new Error(message || "throttling requests");
            defineProperties(error, { stall, throttle: true });
            throw error;
        }
        /**
         *  Get the header value for %%key%%, ignoring case.
         */
        getHeader(key) {
            return this.headers[key.toLowerCase()];
        }
        /**
         *  Returns true of the response has a body.
         */
        hasBody() {
            return (this.#body != null);
        }
        /**
         *  The request made for this response.
         */
        get request() { return this.#request; }
        /**
         *  Returns true if this response was a success statusCode.
         */
        ok() {
            return (this.#error.message === "" && this.statusCode >= 200 && this.statusCode < 300);
        }
        /**
         *  Throws a ``SERVER_ERROR`` if this response is not ok.
         */
        assertOk() {
            if (this.ok()) {
                return;
            }
            let { message, error } = this.#error;
            if (message === "") {
                message = `server response ${this.statusCode} ${this.statusMessage}`;
            }
            assert$1(false, message, "SERVER_ERROR", {
                request: (this.request || "unknown request"), response: this, error
            });
        }
    }
    function getTime$1() { return (new Date()).getTime(); }
    function unpercent(value) {
        return toUtf8Bytes(value.replace(/%([0-9a-f][0-9a-f])/gi, (all, code) => {
            return String.fromCharCode(parseInt(code, 16));
        }));
    }
    function wait(delay) {
        return new Promise((resolve) => setTimeout(resolve, delay));
    }

    //See: https://github.com/ethereum/wiki/wiki/RLP
    function hexlifyByte(value) {
        let result = value.toString(16);
        while (result.length < 2) {
            result = "0" + result;
        }
        return "0x" + result;
    }
    function unarrayifyInteger(data, offset, length) {
        let result = 0;
        for (let i = 0; i < length; i++) {
            result = (result * 256) + data[offset + i];
        }
        return result;
    }
    function _decodeChildren(data, offset, childOffset, length) {
        const result = [];
        while (childOffset < offset + 1 + length) {
            const decoded = _decode(data, childOffset);
            result.push(decoded.result);
            childOffset += decoded.consumed;
            assert$1(childOffset <= offset + 1 + length, "child data too short", "BUFFER_OVERRUN", {
                buffer: data, length, offset
            });
        }
        return { consumed: (1 + length), result: result };
    }
    // returns { consumed: number, result: Object }
    function _decode(data, offset) {
        assert$1(data.length !== 0, "data too short", "BUFFER_OVERRUN", {
            buffer: data, length: 0, offset: 1
        });
        const checkOffset = (offset) => {
            assert$1(offset <= data.length, "data short segment too short", "BUFFER_OVERRUN", {
                buffer: data, length: data.length, offset
            });
        };
        // Array with extra length prefix
        if (data[offset] >= 0xf8) {
            const lengthLength = data[offset] - 0xf7;
            checkOffset(offset + 1 + lengthLength);
            const length = unarrayifyInteger(data, offset + 1, lengthLength);
            checkOffset(offset + 1 + lengthLength + length);
            return _decodeChildren(data, offset, offset + 1 + lengthLength, lengthLength + length);
        }
        else if (data[offset] >= 0xc0) {
            const length = data[offset] - 0xc0;
            checkOffset(offset + 1 + length);
            return _decodeChildren(data, offset, offset + 1, length);
        }
        else if (data[offset] >= 0xb8) {
            const lengthLength = data[offset] - 0xb7;
            checkOffset(offset + 1 + lengthLength);
            const length = unarrayifyInteger(data, offset + 1, lengthLength);
            checkOffset(offset + 1 + lengthLength + length);
            const result = hexlify(data.slice(offset + 1 + lengthLength, offset + 1 + lengthLength + length));
            return { consumed: (1 + lengthLength + length), result: result };
        }
        else if (data[offset] >= 0x80) {
            const length = data[offset] - 0x80;
            checkOffset(offset + 1 + length);
            const result = hexlify(data.slice(offset + 1, offset + 1 + length));
            return { consumed: (1 + length), result: result };
        }
        return { consumed: 1, result: hexlifyByte(data[offset]) };
    }
    /**
     *  Decodes %%data%% into the structured data it represents.
     */
    function decodeRlp(_data) {
        const data = getBytes(_data, "data");
        const decoded = _decode(data, 0);
        assertArgument(decoded.consumed === data.length, "unexpected junk after rlp payload", "data", _data);
        return decoded.result;
    }

    //See: https://github.com/ethereum/wiki/wiki/RLP
    function arrayifyInteger(value) {
        const result = [];
        while (value) {
            result.unshift(value & 0xff);
            value >>= 8;
        }
        return result;
    }
    function _encode(object) {
        if (Array.isArray(object)) {
            let payload = [];
            object.forEach(function (child) {
                payload = payload.concat(_encode(child));
            });
            if (payload.length <= 55) {
                payload.unshift(0xc0 + payload.length);
                return payload;
            }
            const length = arrayifyInteger(payload.length);
            length.unshift(0xf7 + length.length);
            return length.concat(payload);
        }
        const data = Array.prototype.slice.call(getBytes(object, "object"));
        if (data.length === 1 && data[0] <= 0x7f) {
            return data;
        }
        else if (data.length <= 55) {
            data.unshift(0x80 + data.length);
            return data;
        }
        const length = arrayifyInteger(data.length);
        length.unshift(0xb7 + length.length);
        return length.concat(data);
    }
    const nibbles = "0123456789abcdef";
    /**
     *  Encodes %%object%% as an RLP-encoded [[DataHexString]].
     */
    function encodeRlp(object) {
        let result = "0x";
        for (const v of _encode(object)) {
            result += nibbles[v >> 4];
            result += nibbles[v & 0xf];
        }
        return result;
    }

    /**
     * @_ignore:
     */
    const WordSize = 32;
    const Padding = new Uint8Array(WordSize);
    // Properties used to immediate pass through to the underlying object
    // - `then` is used to detect if an object is a Promise for await
    const passProperties$1 = ["then"];
    const _guard$2 = {};
    function throwError(name, error) {
        const wrapped = new Error(`deferred error during ABI decoding triggered accessing ${name}`);
        wrapped.error = error;
        throw wrapped;
    }
    /**
     *  A [[Result]] is a sub-class of Array, which allows accessing any
     *  of its values either positionally by its index or, if keys are
     *  provided by its name.
     *
     *  @_docloc: api/abi
     */
    class Result extends Array {
        #names;
        /**
         *  @private
         */
        constructor(...args) {
            // To properly sub-class Array so the other built-in
            // functions work, the constructor has to behave fairly
            // well. So, in the event we are created via fromItems()
            // we build the read-only Result object we want, but on
            // any other input, we use the default constructor
            // constructor(guard: any, items: Array<any>, keys?: Array<null | string>);
            const guard = args[0];
            let items = args[1];
            let names = (args[2] || []).slice();
            let wrap = true;
            if (guard !== _guard$2) {
                items = args;
                names = [];
                wrap = false;
            }
            // Can't just pass in ...items since an array of length 1
            // is a special case in the super.
            super(items.length);
            items.forEach((item, index) => { this[index] = item; });
            // Find all unique keys
            const nameCounts = names.reduce((accum, name) => {
                if (typeof (name) === "string") {
                    accum.set(name, (accum.get(name) || 0) + 1);
                }
                return accum;
            }, (new Map()));
            // Remove any key thats not unique
            this.#names = Object.freeze(items.map((item, index) => {
                const name = names[index];
                if (name != null && nameCounts.get(name) === 1) {
                    return name;
                }
                return null;
            }));
            if (!wrap) {
                return;
            }
            // A wrapped Result is immutable
            Object.freeze(this);
            // Proxy indices and names so we can trap deferred errors
            return new Proxy(this, {
                get: (target, prop, receiver) => {
                    if (typeof (prop) === "string") {
                        // Index accessor
                        if (prop.match(/^[0-9]+$/)) {
                            const index = getNumber(prop, "%index");
                            if (index < 0 || index >= this.length) {
                                throw new RangeError("out of result range");
                            }
                            const item = target[index];
                            if (item instanceof Error) {
                                throwError(`index ${index}`, item);
                            }
                            return item;
                        }
                        // Pass important checks (like `then` for Promise) through
                        if (passProperties$1.indexOf(prop) >= 0) {
                            return Reflect.get(target, prop, receiver);
                        }
                        const value = target[prop];
                        if (value instanceof Function) {
                            // Make sure functions work with private variables
                            // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy#no_private_property_forwarding
                            return function (...args) {
                                return value.apply((this === receiver) ? target : this, args);
                            };
                        }
                        else if (!(prop in target)) {
                            // Possible name accessor
                            return target.getValue.apply((this === receiver) ? target : this, [prop]);
                        }
                    }
                    return Reflect.get(target, prop, receiver);
                }
            });
        }
        /**
         *  Returns the Result as a normal Array.
         *
         *  This will throw if there are any outstanding deferred
         *  errors.
         */
        toArray() {
            const result = [];
            this.forEach((item, index) => {
                if (item instanceof Error) {
                    throwError(`index ${index}`, item);
                }
                result.push(item);
            });
            return result;
        }
        /**
         *  Returns the Result as an Object with each name-value pair.
         *
         *  This will throw if any value is unnamed, or if there are
         *  any outstanding deferred errors.
         */
        toObject() {
            return this.#names.reduce((accum, name, index) => {
                assert$1(name != null, "value at index ${ index } unnamed", "UNSUPPORTED_OPERATION", {
                    operation: "toObject()"
                });
                // Add values for names that don't conflict
                if (!(name in accum)) {
                    accum[name] = this.getValue(name);
                }
                return accum;
            }, {});
        }
        /**
         *  @_ignore
         */
        slice(start, end) {
            if (start == null) {
                start = 0;
            }
            if (start < 0) {
                start += this.length;
                if (start < 0) {
                    start = 0;
                }
            }
            if (end == null) {
                end = this.length;
            }
            if (end < 0) {
                end += this.length;
                if (end < 0) {
                    end = 0;
                }
            }
            if (end > this.length) {
                end = this.length;
            }
            const result = [], names = [];
            for (let i = start; i < end; i++) {
                result.push(this[i]);
                names.push(this.#names[i]);
            }
            return new Result(_guard$2, result, names);
        }
        /**
         *  @_ignore
         */
        filter(callback, thisArg) {
            const result = [], names = [];
            for (let i = 0; i < this.length; i++) {
                const item = this[i];
                if (item instanceof Error) {
                    throwError(`index ${i}`, item);
                }
                if (callback.call(thisArg, item, i, this)) {
                    result.push(item);
                    names.push(this.#names[i]);
                }
            }
            return new Result(_guard$2, result, names);
        }
        /**
         *  Returns the value for %%name%%.
         *
         *  Since it is possible to have a key whose name conflicts with
         *  a method on a [[Result]] or its superclass Array, or any
         *  JavaScript keyword, this ensures all named values are still
         *  accessible by name.
         */
        getValue(name) {
            const index = this.#names.indexOf(name);
            if (index === -1) {
                return undefined;
            }
            const value = this[index];
            if (value instanceof Error) {
                throwError(`property ${JSON.stringify(name)}`, value.error);
            }
            return value;
        }
        /**
         *  Creates a new [[Result]] for %%items%% with each entry
         *  also accessible by its corresponding name in %%keys%%.
         */
        static fromItems(items, keys) {
            return new Result(_guard$2, items, keys);
        }
    }
    function getValue$1(value) {
        let bytes = toBeArray(value);
        assert$1(bytes.length <= WordSize, "value out-of-bounds", "BUFFER_OVERRUN", { buffer: bytes, length: WordSize, offset: bytes.length });
        if (bytes.length !== WordSize) {
            bytes = getBytesCopy(concat([Padding.slice(bytes.length % WordSize), bytes]));
        }
        return bytes;
    }
    /**
     *  @_ignore
     */
    class Coder {
        // The coder name:
        //   - address, uint256, tuple, array, etc.
        name;
        // The fully expanded type, including composite types:
        //   - address, uint256, tuple(address,bytes), uint256[3][4][],  etc.
        type;
        // The localName bound in the signature, in this example it is "baz":
        //   - tuple(address foo, uint bar) baz
        localName;
        // Whether this type is dynamic:
        //  - Dynamic: bytes, string, address[], tuple(boolean[]), etc.
        //  - Not Dynamic: address, uint256, boolean[3], tuple(address, uint8)
        dynamic;
        constructor(name, type, localName, dynamic) {
            defineProperties(this, { name, type, localName, dynamic }, {
                name: "string", type: "string", localName: "string", dynamic: "boolean"
            });
        }
        _throwError(message, value) {
            assertArgument(false, message, this.localName, value);
        }
    }
    /**
     *  @_ignore
     */
    class Writer {
        // An array of WordSize lengthed objects to concatenation
        #data;
        #dataLength;
        constructor() {
            this.#data = [];
            this.#dataLength = 0;
        }
        get data() {
            return concat(this.#data);
        }
        get length() { return this.#dataLength; }
        #writeData(data) {
            this.#data.push(data);
            this.#dataLength += data.length;
            return data.length;
        }
        appendWriter(writer) {
            return this.#writeData(getBytesCopy(writer.data));
        }
        // Arrayish item; pad on the right to *nearest* WordSize
        writeBytes(value) {
            let bytes = getBytesCopy(value);
            const paddingOffset = bytes.length % WordSize;
            if (paddingOffset) {
                bytes = getBytesCopy(concat([bytes, Padding.slice(paddingOffset)]));
            }
            return this.#writeData(bytes);
        }
        // Numeric item; pad on the left *to* WordSize
        writeValue(value) {
            return this.#writeData(getValue$1(value));
        }
        // Inserts a numeric place-holder, returning a callback that can
        // be used to asjust the value later
        writeUpdatableValue() {
            const offset = this.#data.length;
            this.#data.push(Padding);
            this.#dataLength += WordSize;
            return (value) => {
                this.#data[offset] = getValue$1(value);
            };
        }
    }
    /**
     *  @_ignore
     */
    class Reader {
        // Allows incomplete unpadded data to be read; otherwise an error
        // is raised if attempting to overrun the buffer. This is required
        // to deal with an old Solidity bug, in which event data for
        // external (not public thoguh) was tightly packed.
        allowLoose;
        #data;
        #offset;
        constructor(data, allowLoose) {
            defineProperties(this, { allowLoose: !!allowLoose });
            this.#data = getBytesCopy(data);
            this.#offset = 0;
        }
        get data() { return hexlify(this.#data); }
        get dataLength() { return this.#data.length; }
        get consumed() { return this.#offset; }
        get bytes() { return new Uint8Array(this.#data); }
        #peekBytes(offset, length, loose) {
            let alignedLength = Math.ceil(length / WordSize) * WordSize;
            if (this.#offset + alignedLength > this.#data.length) {
                if (this.allowLoose && loose && this.#offset + length <= this.#data.length) {
                    alignedLength = length;
                }
                else {
                    assert$1(false, "data out-of-bounds", "BUFFER_OVERRUN", {
                        buffer: getBytesCopy(this.#data),
                        length: this.#data.length,
                        offset: this.#offset + alignedLength
                    });
                }
            }
            return this.#data.slice(this.#offset, this.#offset + alignedLength);
        }
        // Create a sub-reader with the same underlying data, but offset
        subReader(offset) {
            return new Reader(this.#data.slice(this.#offset + offset), this.allowLoose);
        }
        // Read bytes
        readBytes(length, loose) {
            let bytes = this.#peekBytes(0, length, !!loose);
            this.#offset += bytes.length;
            // @TODO: Make sure the length..end bytes are all 0?
            return bytes.slice(0, length);
        }
        // Read a numeric values
        readValue() {
            return toBigInt(this.readBytes(WordSize));
        }
        readIndex() {
            return toNumber(this.readBytes(WordSize));
        }
    }

    function number(n) {
        if (!Number.isSafeInteger(n) || n < 0)
            throw new Error(`Wrong positive integer: ${n}`);
    }
    function bool(b) {
        if (typeof b !== 'boolean')
            throw new Error(`Expected boolean, not ${b}`);
    }
    function bytes(b, ...lengths) {
        if (!(b instanceof Uint8Array))
            throw new TypeError('Expected Uint8Array');
        if (lengths.length > 0 && !lengths.includes(b.length))
            throw new TypeError(`Expected Uint8Array of length ${lengths}, not of length=${b.length}`);
    }
    function hash(hash) {
        if (typeof hash !== 'function' || typeof hash.create !== 'function')
            throw new Error('Hash should be wrapped by utils.wrapConstructor');
        number(hash.outputLen);
        number(hash.blockLen);
    }
    function exists(instance, checkFinished = true) {
        if (instance.destroyed)
            throw new Error('Hash instance has been destroyed');
        if (checkFinished && instance.finished)
            throw new Error('Hash#digest() has already been called');
    }
    function output(out, instance) {
        bytes(out);
        const min = instance.outputLen;
        if (out.length < min) {
            throw new Error(`digestInto() expects output buffer of length at least ${min}`);
        }
    }
    const assert = {
        number,
        bool,
        bytes,
        hash,
        exists,
        output,
    };

    var _nodeResolve_empty = {};

    var nodeCrypto = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': _nodeResolve_empty
    });

    /*! noble-hashes - MIT License (c) 2022 Paul Miller (paulmillr.com) */
    const u32 = (arr) => new Uint32Array(arr.buffer, arr.byteOffset, Math.floor(arr.byteLength / 4));
    // Cast array to view
    const createView = (arr) => new DataView(arr.buffer, arr.byteOffset, arr.byteLength);
    // The rotate right (circular right shift) operation for uint32
    const rotr = (word, shift) => (word << (32 - shift)) | (word >>> shift);
    const isLE = new Uint8Array(new Uint32Array([0x11223344]).buffer)[0] === 0x44;
    // There is almost no big endian hardware, but js typed arrays uses platform specific endianness.
    // So, just to be sure not to corrupt anything.
    if (!isLE)
        throw new Error('Non little-endian hardware is not supported');
    Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, '0'));
    function utf8ToBytes(str) {
        if (typeof str !== 'string') {
            throw new TypeError(`utf8ToBytes expected string, got ${typeof str}`);
        }
        return new TextEncoder().encode(str);
    }
    function toBytes(data) {
        if (typeof data === 'string')
            data = utf8ToBytes(data);
        if (!(data instanceof Uint8Array))
            throw new TypeError(`Expected input type is Uint8Array (got ${typeof data})`);
        return data;
    }
    // For runtime check if class implements interface
    class Hash {
        // Safe version that clones internal state
        clone() {
            return this._cloneInto();
        }
    }
    function wrapConstructor(hashConstructor) {
        const hashC = (message) => hashConstructor().update(toBytes(message)).digest();
        const tmp = hashConstructor();
        hashC.outputLen = tmp.outputLen;
        hashC.blockLen = tmp.blockLen;
        hashC.create = () => hashConstructor();
        return hashC;
    }
    function wrapConstructorWithOpts(hashCons) {
        const hashC = (msg, opts) => hashCons(opts).update(toBytes(msg)).digest();
        const tmp = hashCons({});
        hashC.outputLen = tmp.outputLen;
        hashC.blockLen = tmp.blockLen;
        hashC.create = (opts) => hashCons(opts);
        return hashC;
    }

    // HMAC (RFC 2104)
    class HMAC extends Hash {
        constructor(hash, _key) {
            super();
            this.finished = false;
            this.destroyed = false;
            assert.hash(hash);
            const key = toBytes(_key);
            this.iHash = hash.create();
            if (!(this.iHash instanceof Hash))
                throw new TypeError('Expected instance of class which extends utils.Hash');
            const blockLen = (this.blockLen = this.iHash.blockLen);
            this.outputLen = this.iHash.outputLen;
            const pad = new Uint8Array(blockLen);
            // blockLen can be bigger than outputLen
            pad.set(key.length > this.iHash.blockLen ? hash.create().update(key).digest() : key);
            for (let i = 0; i < pad.length; i++)
                pad[i] ^= 0x36;
            this.iHash.update(pad);
            // By doing update (processing of first block) of outer hash here we can re-use it between multiple calls via clone
            this.oHash = hash.create();
            // Undo internal XOR && apply outer XOR
            for (let i = 0; i < pad.length; i++)
                pad[i] ^= 0x36 ^ 0x5c;
            this.oHash.update(pad);
            pad.fill(0);
        }
        update(buf) {
            assert.exists(this);
            this.iHash.update(buf);
            return this;
        }
        digestInto(out) {
            assert.exists(this);
            assert.bytes(out, this.outputLen);
            this.finished = true;
            this.iHash.digestInto(out);
            this.oHash.update(out);
            this.oHash.digestInto(out);
            this.destroy();
        }
        digest() {
            const out = new Uint8Array(this.oHash.outputLen);
            this.digestInto(out);
            return out;
        }
        _cloneInto(to) {
            // Create new instance without calling constructor since key already in state and we don't know it.
            to || (to = Object.create(Object.getPrototypeOf(this), {}));
            const { oHash, iHash, finished, destroyed, blockLen, outputLen } = this;
            to = to;
            to.finished = finished;
            to.destroyed = destroyed;
            to.blockLen = blockLen;
            to.outputLen = outputLen;
            to.oHash = oHash._cloneInto(to.oHash);
            to.iHash = iHash._cloneInto(to.iHash);
            return to;
        }
        destroy() {
            this.destroyed = true;
            this.oHash.destroy();
            this.iHash.destroy();
        }
    }
    /**
     * HMAC: RFC2104 message authentication code.
     * @param hash - function that would be used e.g. sha256
     * @param key - message key
     * @param message - message data
     */
    const hmac = (hash, key, message) => new HMAC(hash, key).update(message).digest();
    hmac.create = (hash, key) => new HMAC(hash, key);

    // Polyfill for Safari 14
    function setBigUint64(view, byteOffset, value, isLE) {
        if (typeof view.setBigUint64 === 'function')
            return view.setBigUint64(byteOffset, value, isLE);
        const _32n = BigInt(32);
        const _u32_max = BigInt(0xffffffff);
        const wh = Number((value >> _32n) & _u32_max);
        const wl = Number(value & _u32_max);
        const h = isLE ? 4 : 0;
        const l = isLE ? 0 : 4;
        view.setUint32(byteOffset + h, wh, isLE);
        view.setUint32(byteOffset + l, wl, isLE);
    }
    // Base SHA2 class (RFC 6234)
    class SHA2 extends Hash {
        constructor(blockLen, outputLen, padOffset, isLE) {
            super();
            this.blockLen = blockLen;
            this.outputLen = outputLen;
            this.padOffset = padOffset;
            this.isLE = isLE;
            this.finished = false;
            this.length = 0;
            this.pos = 0;
            this.destroyed = false;
            this.buffer = new Uint8Array(blockLen);
            this.view = createView(this.buffer);
        }
        update(data) {
            assert.exists(this);
            const { view, buffer, blockLen } = this;
            data = toBytes(data);
            const len = data.length;
            for (let pos = 0; pos < len;) {
                const take = Math.min(blockLen - this.pos, len - pos);
                // Fast path: we have at least one block in input, cast it to view and process
                if (take === blockLen) {
                    const dataView = createView(data);
                    for (; blockLen <= len - pos; pos += blockLen)
                        this.process(dataView, pos);
                    continue;
                }
                buffer.set(data.subarray(pos, pos + take), this.pos);
                this.pos += take;
                pos += take;
                if (this.pos === blockLen) {
                    this.process(view, 0);
                    this.pos = 0;
                }
            }
            this.length += data.length;
            this.roundClean();
            return this;
        }
        digestInto(out) {
            assert.exists(this);
            assert.output(out, this);
            this.finished = true;
            // Padding
            // We can avoid allocation of buffer for padding completely if it
            // was previously not allocated here. But it won't change performance.
            const { buffer, view, blockLen, isLE } = this;
            let { pos } = this;
            // append the bit '1' to the message
            buffer[pos++] = 0b10000000;
            this.buffer.subarray(pos).fill(0);
            // we have less than padOffset left in buffer, so we cannot put length in current block, need process it and pad again
            if (this.padOffset > blockLen - pos) {
                this.process(view, 0);
                pos = 0;
            }
            // Pad until full block byte with zeros
            for (let i = pos; i < blockLen; i++)
                buffer[i] = 0;
            // Note: sha512 requires length to be 128bit integer, but length in JS will overflow before that
            // You need to write around 2 exabytes (u64_max / 8 / (1024**6)) for this to happen.
            // So we just write lowest 64 bits of that value.
            setBigUint64(view, blockLen - 8, BigInt(this.length * 8), isLE);
            this.process(view, 0);
            const oview = createView(out);
            this.get().forEach((v, i) => oview.setUint32(4 * i, v, isLE));
        }
        digest() {
            const { buffer, outputLen } = this;
            this.digestInto(buffer);
            const res = buffer.slice(0, outputLen);
            this.destroy();
            return res;
        }
        _cloneInto(to) {
            to || (to = new this.constructor());
            to.set(...this.get());
            const { blockLen, buffer, length, finished, destroyed, pos } = this;
            to.length = length;
            to.pos = pos;
            to.finished = finished;
            to.destroyed = destroyed;
            if (length % blockLen)
                to.buffer.set(buffer);
            return to;
        }
    }

    // Choice: a ? b : c
    const Chi = (a, b, c) => (a & b) ^ (~a & c);
    // Majority function, true if any two inpust is true
    const Maj = (a, b, c) => (a & b) ^ (a & c) ^ (b & c);
    // Round constants:
    // first 32 bits of the fractional parts of the cube roots of the first 64 primes 2..311)
    // prettier-ignore
    const SHA256_K = new Uint32Array([
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ]);
    // Initial state (first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19):
    // prettier-ignore
    const IV = new Uint32Array([
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ]);
    // Temporary buffer, not used to store anything between runs
    // Named this way because it matches specification.
    const SHA256_W = new Uint32Array(64);
    class SHA256 extends SHA2 {
        constructor() {
            super(64, 32, 8, false);
            // We cannot use array here since array allows indexing by variable
            // which means optimizer/compiler cannot use registers.
            this.A = IV[0] | 0;
            this.B = IV[1] | 0;
            this.C = IV[2] | 0;
            this.D = IV[3] | 0;
            this.E = IV[4] | 0;
            this.F = IV[5] | 0;
            this.G = IV[6] | 0;
            this.H = IV[7] | 0;
        }
        get() {
            const { A, B, C, D, E, F, G, H } = this;
            return [A, B, C, D, E, F, G, H];
        }
        // prettier-ignore
        set(A, B, C, D, E, F, G, H) {
            this.A = A | 0;
            this.B = B | 0;
            this.C = C | 0;
            this.D = D | 0;
            this.E = E | 0;
            this.F = F | 0;
            this.G = G | 0;
            this.H = H | 0;
        }
        process(view, offset) {
            // Extend the first 16 words into the remaining 48 words w[16..63] of the message schedule array
            for (let i = 0; i < 16; i++, offset += 4)
                SHA256_W[i] = view.getUint32(offset, false);
            for (let i = 16; i < 64; i++) {
                const W15 = SHA256_W[i - 15];
                const W2 = SHA256_W[i - 2];
                const s0 = rotr(W15, 7) ^ rotr(W15, 18) ^ (W15 >>> 3);
                const s1 = rotr(W2, 17) ^ rotr(W2, 19) ^ (W2 >>> 10);
                SHA256_W[i] = (s1 + SHA256_W[i - 7] + s0 + SHA256_W[i - 16]) | 0;
            }
            // Compression function main loop, 64 rounds
            let { A, B, C, D, E, F, G, H } = this;
            for (let i = 0; i < 64; i++) {
                const sigma1 = rotr(E, 6) ^ rotr(E, 11) ^ rotr(E, 25);
                const T1 = (H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i]) | 0;
                const sigma0 = rotr(A, 2) ^ rotr(A, 13) ^ rotr(A, 22);
                const T2 = (sigma0 + Maj(A, B, C)) | 0;
                H = G;
                G = F;
                F = E;
                E = (D + T1) | 0;
                D = C;
                C = B;
                B = A;
                A = (T1 + T2) | 0;
            }
            // Add the compressed chunk to the current hash value
            A = (A + this.A) | 0;
            B = (B + this.B) | 0;
            C = (C + this.C) | 0;
            D = (D + this.D) | 0;
            E = (E + this.E) | 0;
            F = (F + this.F) | 0;
            G = (G + this.G) | 0;
            H = (H + this.H) | 0;
            this.set(A, B, C, D, E, F, G, H);
        }
        roundClean() {
            SHA256_W.fill(0);
        }
        destroy() {
            this.set(0, 0, 0, 0, 0, 0, 0, 0);
            this.buffer.fill(0);
        }
    }
    /**
     * SHA2-256 hash function
     * @param message - data that would be hashed
     */
    const sha256 = wrapConstructor(() => new SHA256());

    const U32_MASK64 = BigInt(2 ** 32 - 1);
    const _32n = BigInt(32);
    // We are not using BigUint64Array, because they are extremely slow as per 2022
    function fromBig(n, le = false) {
        if (le)
            return { h: Number(n & U32_MASK64), l: Number((n >> _32n) & U32_MASK64) };
        return { h: Number((n >> _32n) & U32_MASK64) | 0, l: Number(n & U32_MASK64) | 0 };
    }
    function split(lst, le = false) {
        let Ah = new Uint32Array(lst.length);
        let Al = new Uint32Array(lst.length);
        for (let i = 0; i < lst.length; i++) {
            const { h, l } = fromBig(lst[i], le);
            [Ah[i], Al[i]] = [h, l];
        }
        return [Ah, Al];
    }
    const toBig = (h, l) => (BigInt(h >>> 0) << _32n) | BigInt(l >>> 0);
    // for Shift in [0, 32)
    const shrSH = (h, l, s) => h >>> s;
    const shrSL = (h, l, s) => (h << (32 - s)) | (l >>> s);
    // Right rotate for Shift in [1, 32)
    const rotrSH = (h, l, s) => (h >>> s) | (l << (32 - s));
    const rotrSL = (h, l, s) => (h << (32 - s)) | (l >>> s);
    // Right rotate for Shift in (32, 64), NOTE: 32 is special case.
    const rotrBH = (h, l, s) => (h << (64 - s)) | (l >>> (s - 32));
    const rotrBL = (h, l, s) => (h >>> (s - 32)) | (l << (64 - s));
    // Right rotate for shift===32 (just swaps l&h)
    const rotr32H = (h, l) => l;
    const rotr32L = (h, l) => h;
    // Left rotate for Shift in [1, 32)
    const rotlSH = (h, l, s) => (h << s) | (l >>> (32 - s));
    const rotlSL = (h, l, s) => (l << s) | (h >>> (32 - s));
    // Left rotate for Shift in (32, 64), NOTE: 32 is special case.
    const rotlBH = (h, l, s) => (l << (s - 32)) | (h >>> (64 - s));
    const rotlBL = (h, l, s) => (h << (s - 32)) | (l >>> (64 - s));
    // JS uses 32-bit signed integers for bitwise operations which means we cannot
    // simple take carry out of low bit sum by shift, we need to use division.
    // Removing "export" has 5% perf penalty -_-
    function add(Ah, Al, Bh, Bl) {
        const l = (Al >>> 0) + (Bl >>> 0);
        return { h: (Ah + Bh + ((l / 2 ** 32) | 0)) | 0, l: l | 0 };
    }
    // Addition with more than 2 elements
    const add3L = (Al, Bl, Cl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0);
    const add3H = (low, Ah, Bh, Ch) => (Ah + Bh + Ch + ((low / 2 ** 32) | 0)) | 0;
    const add4L = (Al, Bl, Cl, Dl) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0);
    const add4H = (low, Ah, Bh, Ch, Dh) => (Ah + Bh + Ch + Dh + ((low / 2 ** 32) | 0)) | 0;
    const add5L = (Al, Bl, Cl, Dl, El) => (Al >>> 0) + (Bl >>> 0) + (Cl >>> 0) + (Dl >>> 0) + (El >>> 0);
    const add5H = (low, Ah, Bh, Ch, Dh, Eh) => (Ah + Bh + Ch + Dh + Eh + ((low / 2 ** 32) | 0)) | 0;
    // prettier-ignore
    const u64 = {
        fromBig, split, toBig,
        shrSH, shrSL,
        rotrSH, rotrSL, rotrBH, rotrBL,
        rotr32H, rotr32L,
        rotlSH, rotlSL, rotlBH, rotlBL,
        add, add3L, add3H, add4L, add4H, add5H, add5L,
    };

    // Round contants (first 32 bits of the fractional parts of the cube roots of the first 80 primes 2..409):
    // prettier-ignore
    const [SHA512_Kh, SHA512_Kl] = u64.split([
        '0x428a2f98d728ae22', '0x7137449123ef65cd', '0xb5c0fbcfec4d3b2f', '0xe9b5dba58189dbbc',
        '0x3956c25bf348b538', '0x59f111f1b605d019', '0x923f82a4af194f9b', '0xab1c5ed5da6d8118',
        '0xd807aa98a3030242', '0x12835b0145706fbe', '0x243185be4ee4b28c', '0x550c7dc3d5ffb4e2',
        '0x72be5d74f27b896f', '0x80deb1fe3b1696b1', '0x9bdc06a725c71235', '0xc19bf174cf692694',
        '0xe49b69c19ef14ad2', '0xefbe4786384f25e3', '0x0fc19dc68b8cd5b5', '0x240ca1cc77ac9c65',
        '0x2de92c6f592b0275', '0x4a7484aa6ea6e483', '0x5cb0a9dcbd41fbd4', '0x76f988da831153b5',
        '0x983e5152ee66dfab', '0xa831c66d2db43210', '0xb00327c898fb213f', '0xbf597fc7beef0ee4',
        '0xc6e00bf33da88fc2', '0xd5a79147930aa725', '0x06ca6351e003826f', '0x142929670a0e6e70',
        '0x27b70a8546d22ffc', '0x2e1b21385c26c926', '0x4d2c6dfc5ac42aed', '0x53380d139d95b3df',
        '0x650a73548baf63de', '0x766a0abb3c77b2a8', '0x81c2c92e47edaee6', '0x92722c851482353b',
        '0xa2bfe8a14cf10364', '0xa81a664bbc423001', '0xc24b8b70d0f89791', '0xc76c51a30654be30',
        '0xd192e819d6ef5218', '0xd69906245565a910', '0xf40e35855771202a', '0x106aa07032bbd1b8',
        '0x19a4c116b8d2d0c8', '0x1e376c085141ab53', '0x2748774cdf8eeb99', '0x34b0bcb5e19b48a8',
        '0x391c0cb3c5c95a63', '0x4ed8aa4ae3418acb', '0x5b9cca4f7763e373', '0x682e6ff3d6b2b8a3',
        '0x748f82ee5defb2fc', '0x78a5636f43172f60', '0x84c87814a1f0ab72', '0x8cc702081a6439ec',
        '0x90befffa23631e28', '0xa4506cebde82bde9', '0xbef9a3f7b2c67915', '0xc67178f2e372532b',
        '0xca273eceea26619c', '0xd186b8c721c0c207', '0xeada7dd6cde0eb1e', '0xf57d4f7fee6ed178',
        '0x06f067aa72176fba', '0x0a637dc5a2c898a6', '0x113f9804bef90dae', '0x1b710b35131c471b',
        '0x28db77f523047d84', '0x32caab7b40c72493', '0x3c9ebe0a15c9bebc', '0x431d67c49c100d4c',
        '0x4cc5d4becb3e42b6', '0x597f299cfc657e2a', '0x5fcb6fab3ad6faec', '0x6c44198c4a475817'
    ].map(n => BigInt(n)));
    // Temporary buffer, not used to store anything between runs
    const SHA512_W_H = new Uint32Array(80);
    const SHA512_W_L = new Uint32Array(80);
    class SHA512 extends SHA2 {
        constructor() {
            super(128, 64, 16, false);
            // We cannot use array here since array allows indexing by variable which means optimizer/compiler cannot use registers.
            // Also looks cleaner and easier to verify with spec.
            // Initial state (first 32 bits of the fractional parts of the square roots of the first 8 primes 2..19):
            // h -- high 32 bits, l -- low 32 bits
            this.Ah = 0x6a09e667 | 0;
            this.Al = 0xf3bcc908 | 0;
            this.Bh = 0xbb67ae85 | 0;
            this.Bl = 0x84caa73b | 0;
            this.Ch = 0x3c6ef372 | 0;
            this.Cl = 0xfe94f82b | 0;
            this.Dh = 0xa54ff53a | 0;
            this.Dl = 0x5f1d36f1 | 0;
            this.Eh = 0x510e527f | 0;
            this.El = 0xade682d1 | 0;
            this.Fh = 0x9b05688c | 0;
            this.Fl = 0x2b3e6c1f | 0;
            this.Gh = 0x1f83d9ab | 0;
            this.Gl = 0xfb41bd6b | 0;
            this.Hh = 0x5be0cd19 | 0;
            this.Hl = 0x137e2179 | 0;
        }
        // prettier-ignore
        get() {
            const { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
            return [Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl];
        }
        // prettier-ignore
        set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl) {
            this.Ah = Ah | 0;
            this.Al = Al | 0;
            this.Bh = Bh | 0;
            this.Bl = Bl | 0;
            this.Ch = Ch | 0;
            this.Cl = Cl | 0;
            this.Dh = Dh | 0;
            this.Dl = Dl | 0;
            this.Eh = Eh | 0;
            this.El = El | 0;
            this.Fh = Fh | 0;
            this.Fl = Fl | 0;
            this.Gh = Gh | 0;
            this.Gl = Gl | 0;
            this.Hh = Hh | 0;
            this.Hl = Hl | 0;
        }
        process(view, offset) {
            // Extend the first 16 words into the remaining 64 words w[16..79] of the message schedule array
            for (let i = 0; i < 16; i++, offset += 4) {
                SHA512_W_H[i] = view.getUint32(offset);
                SHA512_W_L[i] = view.getUint32((offset += 4));
            }
            for (let i = 16; i < 80; i++) {
                // s0 := (w[i-15] rightrotate 1) xor (w[i-15] rightrotate 8) xor (w[i-15] rightshift 7)
                const W15h = SHA512_W_H[i - 15] | 0;
                const W15l = SHA512_W_L[i - 15] | 0;
                const s0h = u64.rotrSH(W15h, W15l, 1) ^ u64.rotrSH(W15h, W15l, 8) ^ u64.shrSH(W15h, W15l, 7);
                const s0l = u64.rotrSL(W15h, W15l, 1) ^ u64.rotrSL(W15h, W15l, 8) ^ u64.shrSL(W15h, W15l, 7);
                // s1 := (w[i-2] rightrotate 19) xor (w[i-2] rightrotate 61) xor (w[i-2] rightshift 6)
                const W2h = SHA512_W_H[i - 2] | 0;
                const W2l = SHA512_W_L[i - 2] | 0;
                const s1h = u64.rotrSH(W2h, W2l, 19) ^ u64.rotrBH(W2h, W2l, 61) ^ u64.shrSH(W2h, W2l, 6);
                const s1l = u64.rotrSL(W2h, W2l, 19) ^ u64.rotrBL(W2h, W2l, 61) ^ u64.shrSL(W2h, W2l, 6);
                // SHA256_W[i] = s0 + s1 + SHA256_W[i - 7] + SHA256_W[i - 16];
                const SUMl = u64.add4L(s0l, s1l, SHA512_W_L[i - 7], SHA512_W_L[i - 16]);
                const SUMh = u64.add4H(SUMl, s0h, s1h, SHA512_W_H[i - 7], SHA512_W_H[i - 16]);
                SHA512_W_H[i] = SUMh | 0;
                SHA512_W_L[i] = SUMl | 0;
            }
            let { Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl } = this;
            // Compression function main loop, 80 rounds
            for (let i = 0; i < 80; i++) {
                // S1 := (e rightrotate 14) xor (e rightrotate 18) xor (e rightrotate 41)
                const sigma1h = u64.rotrSH(Eh, El, 14) ^ u64.rotrSH(Eh, El, 18) ^ u64.rotrBH(Eh, El, 41);
                const sigma1l = u64.rotrSL(Eh, El, 14) ^ u64.rotrSL(Eh, El, 18) ^ u64.rotrBL(Eh, El, 41);
                //const T1 = (H + sigma1 + Chi(E, F, G) + SHA256_K[i] + SHA256_W[i]) | 0;
                const CHIh = (Eh & Fh) ^ (~Eh & Gh);
                const CHIl = (El & Fl) ^ (~El & Gl);
                // T1 = H + sigma1 + Chi(E, F, G) + SHA512_K[i] + SHA512_W[i]
                // prettier-ignore
                const T1ll = u64.add5L(Hl, sigma1l, CHIl, SHA512_Kl[i], SHA512_W_L[i]);
                const T1h = u64.add5H(T1ll, Hh, sigma1h, CHIh, SHA512_Kh[i], SHA512_W_H[i]);
                const T1l = T1ll | 0;
                // S0 := (a rightrotate 28) xor (a rightrotate 34) xor (a rightrotate 39)
                const sigma0h = u64.rotrSH(Ah, Al, 28) ^ u64.rotrBH(Ah, Al, 34) ^ u64.rotrBH(Ah, Al, 39);
                const sigma0l = u64.rotrSL(Ah, Al, 28) ^ u64.rotrBL(Ah, Al, 34) ^ u64.rotrBL(Ah, Al, 39);
                const MAJh = (Ah & Bh) ^ (Ah & Ch) ^ (Bh & Ch);
                const MAJl = (Al & Bl) ^ (Al & Cl) ^ (Bl & Cl);
                Hh = Gh | 0;
                Hl = Gl | 0;
                Gh = Fh | 0;
                Gl = Fl | 0;
                Fh = Eh | 0;
                Fl = El | 0;
                ({ h: Eh, l: El } = u64.add(Dh | 0, Dl | 0, T1h | 0, T1l | 0));
                Dh = Ch | 0;
                Dl = Cl | 0;
                Ch = Bh | 0;
                Cl = Bl | 0;
                Bh = Ah | 0;
                Bl = Al | 0;
                const All = u64.add3L(T1l, sigma0l, MAJl);
                Ah = u64.add3H(All, T1h, sigma0h, MAJh);
                Al = All | 0;
            }
            // Add the compressed chunk to the current hash value
            ({ h: Ah, l: Al } = u64.add(this.Ah | 0, this.Al | 0, Ah | 0, Al | 0));
            ({ h: Bh, l: Bl } = u64.add(this.Bh | 0, this.Bl | 0, Bh | 0, Bl | 0));
            ({ h: Ch, l: Cl } = u64.add(this.Ch | 0, this.Cl | 0, Ch | 0, Cl | 0));
            ({ h: Dh, l: Dl } = u64.add(this.Dh | 0, this.Dl | 0, Dh | 0, Dl | 0));
            ({ h: Eh, l: El } = u64.add(this.Eh | 0, this.El | 0, Eh | 0, El | 0));
            ({ h: Fh, l: Fl } = u64.add(this.Fh | 0, this.Fl | 0, Fh | 0, Fl | 0));
            ({ h: Gh, l: Gl } = u64.add(this.Gh | 0, this.Gl | 0, Gh | 0, Gl | 0));
            ({ h: Hh, l: Hl } = u64.add(this.Hh | 0, this.Hl | 0, Hh | 0, Hl | 0));
            this.set(Ah, Al, Bh, Bl, Ch, Cl, Dh, Dl, Eh, El, Fh, Fl, Gh, Gl, Hh, Hl);
        }
        roundClean() {
            SHA512_W_H.fill(0);
            SHA512_W_L.fill(0);
        }
        destroy() {
            this.buffer.fill(0);
            this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        }
    }
    class SHA512_256 extends SHA512 {
        constructor() {
            super();
            // h -- high 32 bits, l -- low 32 bits
            this.Ah = 0x22312194 | 0;
            this.Al = 0xfc2bf72c | 0;
            this.Bh = 0x9f555fa3 | 0;
            this.Bl = 0xc84c64c2 | 0;
            this.Ch = 0x2393b86b | 0;
            this.Cl = 0x6f53b151 | 0;
            this.Dh = 0x96387719 | 0;
            this.Dl = 0x5940eabd | 0;
            this.Eh = 0x96283ee2 | 0;
            this.El = 0xa88effe3 | 0;
            this.Fh = 0xbe5e1e25 | 0;
            this.Fl = 0x53863992 | 0;
            this.Gh = 0x2b0199fc | 0;
            this.Gl = 0x2c85b8aa | 0;
            this.Hh = 0x0eb72ddc | 0;
            this.Hl = 0x81c52ca2 | 0;
            this.outputLen = 32;
        }
    }
    class SHA384 extends SHA512 {
        constructor() {
            super();
            // h -- high 32 bits, l -- low 32 bits
            this.Ah = 0xcbbb9d5d | 0;
            this.Al = 0xc1059ed8 | 0;
            this.Bh = 0x629a292a | 0;
            this.Bl = 0x367cd507 | 0;
            this.Ch = 0x9159015a | 0;
            this.Cl = 0x3070dd17 | 0;
            this.Dh = 0x152fecd8 | 0;
            this.Dl = 0xf70e5939 | 0;
            this.Eh = 0x67332667 | 0;
            this.El = 0xffc00b31 | 0;
            this.Fh = 0x8eb44a87 | 0;
            this.Fl = 0x68581511 | 0;
            this.Gh = 0xdb0c2e0d | 0;
            this.Gl = 0x64f98fa7 | 0;
            this.Hh = 0x47b5481d | 0;
            this.Hl = 0xbefa4fa4 | 0;
            this.outputLen = 48;
        }
    }
    const sha512 = wrapConstructor(() => new SHA512());
    wrapConstructor(() => new SHA512_256());
    wrapConstructor(() => new SHA384());

    /* Browser Crypto Shims */
    function getGlobal() {
        if (typeof self !== 'undefined') {
            return self;
        }
        if (typeof window !== 'undefined') {
            return window;
        }
        if (typeof global !== 'undefined') {
            return global;
        }
        throw new Error('unable to locate global object');
    }
    const anyGlobal = getGlobal();
    anyGlobal.crypto || anyGlobal.msCrypto;
    function createHmac(_algo, key) {
        const algo = ({ sha256, sha512 }[_algo]);
        assertArgument(algo != null, "invalid hmac algorithm", "algorithm", _algo);
        return hmac.create(algo, key);
    }

    /**
     *  An **HMAC** enables verification that a given key was used
     *  to authenticate a payload.
     *
     *  See: [[link-wiki-hmac]]
     *
     *  @_subsection: api/crypto:HMAC  [about-hmac]
     */
    let locked$1 = false;
    const _computeHmac = function (algorithm, key, data) {
        return createHmac(algorithm, key).update(data).digest();
    };
    let __computeHmac = _computeHmac;
    /**
     *  Return the HMAC for %%data%% using the %%key%% key with the underlying
     *  %%algo%% used for compression.
     *
     *  @example:
     *    key = id("some-secret")
     *
     *    // Compute the HMAC
     *    computeHmac("sha256", key, "0x1337")
     *    //_result:
     *
     *    // To compute the HMAC of UTF-8 data, the data must be
     *    // converted to UTF-8 bytes
     *    computeHmac("sha256", key, toUtf8Bytes("Hello World"))
     *    //_result:
     *
     */
    function computeHmac(algorithm, _key, _data) {
        const key = getBytes(_key, "key");
        const data = getBytes(_data, "data");
        return hexlify(__computeHmac(algorithm, key, data));
    }
    computeHmac._ = _computeHmac;
    computeHmac.lock = function () { locked$1 = true; };
    computeHmac.register = function (func) {
        if (locked$1) {
            throw new Error("computeHmac is locked");
        }
        __computeHmac = func;
    };
    Object.freeze(computeHmac);

    // Various per round constants calculations
    const [SHA3_PI, SHA3_ROTL, _SHA3_IOTA] = [[], [], []];
    const _0n$1 = BigInt(0);
    const _1n$1 = BigInt(1);
    const _2n$1 = BigInt(2);
    const _7n = BigInt(7);
    const _256n = BigInt(256);
    const _0x71n = BigInt(0x71);
    for (let round = 0, R = _1n$1, x = 1, y = 0; round < 24; round++) {
        // Pi
        [x, y] = [y, (2 * x + 3 * y) % 5];
        SHA3_PI.push(2 * (5 * y + x));
        // Rotational
        SHA3_ROTL.push((((round + 1) * (round + 2)) / 2) % 64);
        // Iota
        let t = _0n$1;
        for (let j = 0; j < 7; j++) {
            R = ((R << _1n$1) ^ ((R >> _7n) * _0x71n)) % _256n;
            if (R & _2n$1)
                t ^= _1n$1 << ((_1n$1 << BigInt(j)) - _1n$1);
        }
        _SHA3_IOTA.push(t);
    }
    const [SHA3_IOTA_H, SHA3_IOTA_L] = u64.split(_SHA3_IOTA, true);
    // Left rotation (without 0, 32, 64)
    const rotlH = (h, l, s) => s > 32 ? u64.rotlBH(h, l, s) : u64.rotlSH(h, l, s);
    const rotlL = (h, l, s) => s > 32 ? u64.rotlBL(h, l, s) : u64.rotlSL(h, l, s);
    // Same as keccakf1600, but allows to skip some rounds
    function keccakP(s, rounds = 24) {
        const B = new Uint32Array(5 * 2);
        // NOTE: all indices are x2 since we store state as u32 instead of u64 (bigints to slow in js)
        for (let round = 24 - rounds; round < 24; round++) {
            // Theta θ
            for (let x = 0; x < 10; x++)
                B[x] = s[x] ^ s[x + 10] ^ s[x + 20] ^ s[x + 30] ^ s[x + 40];
            for (let x = 0; x < 10; x += 2) {
                const idx1 = (x + 8) % 10;
                const idx0 = (x + 2) % 10;
                const B0 = B[idx0];
                const B1 = B[idx0 + 1];
                const Th = rotlH(B0, B1, 1) ^ B[idx1];
                const Tl = rotlL(B0, B1, 1) ^ B[idx1 + 1];
                for (let y = 0; y < 50; y += 10) {
                    s[x + y] ^= Th;
                    s[x + y + 1] ^= Tl;
                }
            }
            // Rho (ρ) and Pi (π)
            let curH = s[2];
            let curL = s[3];
            for (let t = 0; t < 24; t++) {
                const shift = SHA3_ROTL[t];
                const Th = rotlH(curH, curL, shift);
                const Tl = rotlL(curH, curL, shift);
                const PI = SHA3_PI[t];
                curH = s[PI];
                curL = s[PI + 1];
                s[PI] = Th;
                s[PI + 1] = Tl;
            }
            // Chi (χ)
            for (let y = 0; y < 50; y += 10) {
                for (let x = 0; x < 10; x++)
                    B[x] = s[y + x];
                for (let x = 0; x < 10; x++)
                    s[y + x] ^= ~B[(x + 2) % 10] & B[(x + 4) % 10];
            }
            // Iota (ι)
            s[0] ^= SHA3_IOTA_H[round];
            s[1] ^= SHA3_IOTA_L[round];
        }
        B.fill(0);
    }
    class Keccak extends Hash {
        // NOTE: we accept arguments in bytes instead of bits here.
        constructor(blockLen, suffix, outputLen, enableXOF = false, rounds = 24) {
            super();
            this.blockLen = blockLen;
            this.suffix = suffix;
            this.outputLen = outputLen;
            this.enableXOF = enableXOF;
            this.rounds = rounds;
            this.pos = 0;
            this.posOut = 0;
            this.finished = false;
            this.destroyed = false;
            // Can be passed from user as dkLen
            assert.number(outputLen);
            // 1600 = 5x5 matrix of 64bit.  1600 bits === 200 bytes
            if (0 >= this.blockLen || this.blockLen >= 200)
                throw new Error('Sha3 supports only keccak-f1600 function');
            this.state = new Uint8Array(200);
            this.state32 = u32(this.state);
        }
        keccak() {
            keccakP(this.state32, this.rounds);
            this.posOut = 0;
            this.pos = 0;
        }
        update(data) {
            assert.exists(this);
            const { blockLen, state } = this;
            data = toBytes(data);
            const len = data.length;
            for (let pos = 0; pos < len;) {
                const take = Math.min(blockLen - this.pos, len - pos);
                for (let i = 0; i < take; i++)
                    state[this.pos++] ^= data[pos++];
                if (this.pos === blockLen)
                    this.keccak();
            }
            return this;
        }
        finish() {
            if (this.finished)
                return;
            this.finished = true;
            const { state, suffix, pos, blockLen } = this;
            // Do the padding
            state[pos] ^= suffix;
            if ((suffix & 0x80) !== 0 && pos === blockLen - 1)
                this.keccak();
            state[blockLen - 1] ^= 0x80;
            this.keccak();
        }
        writeInto(out) {
            assert.exists(this, false);
            assert.bytes(out);
            this.finish();
            const bufferOut = this.state;
            const { blockLen } = this;
            for (let pos = 0, len = out.length; pos < len;) {
                if (this.posOut >= blockLen)
                    this.keccak();
                const take = Math.min(blockLen - this.posOut, len - pos);
                out.set(bufferOut.subarray(this.posOut, this.posOut + take), pos);
                this.posOut += take;
                pos += take;
            }
            return out;
        }
        xofInto(out) {
            // Sha3/Keccak usage with XOF is probably mistake, only SHAKE instances can do XOF
            if (!this.enableXOF)
                throw new Error('XOF is not possible for this instance');
            return this.writeInto(out);
        }
        xof(bytes) {
            assert.number(bytes);
            return this.xofInto(new Uint8Array(bytes));
        }
        digestInto(out) {
            assert.output(out, this);
            if (this.finished)
                throw new Error('digest() was already called');
            this.writeInto(out);
            this.destroy();
            return out;
        }
        digest() {
            return this.digestInto(new Uint8Array(this.outputLen));
        }
        destroy() {
            this.destroyed = true;
            this.state.fill(0);
        }
        _cloneInto(to) {
            const { blockLen, suffix, outputLen, rounds, enableXOF } = this;
            to || (to = new Keccak(blockLen, suffix, outputLen, enableXOF, rounds));
            to.state32.set(this.state32);
            to.pos = this.pos;
            to.posOut = this.posOut;
            to.finished = this.finished;
            to.rounds = rounds;
            // Suffix can change in cSHAKE
            to.suffix = suffix;
            to.outputLen = outputLen;
            to.enableXOF = enableXOF;
            to.destroyed = this.destroyed;
            return to;
        }
    }
    const gen = (suffix, blockLen, outputLen) => wrapConstructor(() => new Keccak(blockLen, suffix, outputLen));
    gen(0x06, 144, 224 / 8);
    /**
     * SHA3-256 hash function
     * @param message - that would be hashed
     */
    gen(0x06, 136, 256 / 8);
    gen(0x06, 104, 384 / 8);
    gen(0x06, 72, 512 / 8);
    gen(0x01, 144, 224 / 8);
    /**
     * keccak-256 hash function. Different from SHA3-256.
     * @param message - that would be hashed
     */
    const keccak_256 = gen(0x01, 136, 256 / 8);
    gen(0x01, 104, 384 / 8);
    gen(0x01, 72, 512 / 8);
    const genShake = (suffix, blockLen, outputLen) => wrapConstructorWithOpts((opts = {}) => new Keccak(blockLen, suffix, opts.dkLen === undefined ? outputLen : opts.dkLen, true));
    genShake(0x1f, 168, 128 / 8);
    genShake(0x1f, 136, 256 / 8);

    /**
     *  Cryptographic hashing functions
     *
     *  @_subsection: api/crypto:Hash Functions [about-crypto-hashing]
     */
    let locked = false;
    const _keccak256 = function (data) {
        return keccak_256(data);
    };
    let __keccak256 = _keccak256;
    /**
     *  Compute the cryptographic KECCAK256 hash of %%data%%.
     *
     *  The %%data%% **must** be a data representation, to compute the
     *  hash of UTF-8 data use the [[id]] function.
     *
     *  @returns DataHexstring
     *  @example:
     *    keccak256("0x")
     *    //_result:
     *
     *    keccak256("0x1337")
     *    //_result:
     *
     *    keccak256(new Uint8Array([ 0x13, 0x37 ]))
     *    //_result:
     *
     *    // Strings are assumed to be DataHexString, otherwise it will
     *    // throw. To hash UTF-8 data, see the note above.
     *    keccak256("Hello World")
     *    //_error:
     */
    function keccak256(_data) {
        const data = getBytes(_data, "data");
        return hexlify(__keccak256(data));
    }
    keccak256._ = _keccak256;
    keccak256.lock = function () { locked = true; };
    keccak256.register = function (func) {
        if (locked) {
            throw new TypeError("keccak256 is locked");
        }
        __keccak256 = func;
    };
    Object.freeze(keccak256);

    /*! noble-secp256k1 - MIT License (c) 2019 Paul Miller (paulmillr.com) */
    const _0n = BigInt(0);
    const _1n = BigInt(1);
    const _2n = BigInt(2);
    const _3n = BigInt(3);
    const _8n = BigInt(8);
    const CURVE = Object.freeze({
        a: _0n,
        b: BigInt(7),
        P: BigInt('0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f'),
        n: BigInt('0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141'),
        h: _1n,
        Gx: BigInt('55066263022277343669578718895168534326250603453777594175500187360389116729240'),
        Gy: BigInt('32670510020758816978083085130507043184471273380659243275938904335757337482424'),
        beta: BigInt('0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee'),
    });
    const divNearest = (a, b) => (a + b / _2n) / b;
    const endo = {
        beta: BigInt('0x7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee'),
        splitScalar(k) {
            const { n } = CURVE;
            const a1 = BigInt('0x3086d221a7d46bcde86c90e49284eb15');
            const b1 = -_1n * BigInt('0xe4437ed6010e88286f547fa90abfe4c3');
            const a2 = BigInt('0x114ca50f7a8e2f3f657c1108d9d44cfd8');
            const b2 = a1;
            const POW_2_128 = BigInt('0x100000000000000000000000000000000');
            const c1 = divNearest(b2 * k, n);
            const c2 = divNearest(-b1 * k, n);
            let k1 = mod(k - c1 * a1 - c2 * a2, n);
            let k2 = mod(-c1 * b1 - c2 * b2, n);
            const k1neg = k1 > POW_2_128;
            const k2neg = k2 > POW_2_128;
            if (k1neg)
                k1 = n - k1;
            if (k2neg)
                k2 = n - k2;
            if (k1 > POW_2_128 || k2 > POW_2_128) {
                throw new Error('splitScalarEndo: Endomorphism failed, k=' + k);
            }
            return { k1neg, k1, k2neg, k2 };
        },
    };
    const fieldLen = 32;
    const groupLen = 32;
    const hashLen = 32;
    const compressedLen = fieldLen + 1;
    const uncompressedLen = 2 * fieldLen + 1;
    function weierstrass(x) {
        const { a, b } = CURVE;
        const x2 = mod(x * x);
        const x3 = mod(x2 * x);
        return mod(x3 + a * x + b);
    }
    const USE_ENDOMORPHISM = CURVE.a === _0n;
    class ShaError extends Error {
        constructor(message) {
            super(message);
        }
    }
    function assertJacPoint(other) {
        if (!(other instanceof JacobianPoint))
            throw new TypeError('JacobianPoint expected');
    }
    class JacobianPoint {
        constructor(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        static fromAffine(p) {
            if (!(p instanceof Point)) {
                throw new TypeError('JacobianPoint#fromAffine: expected Point');
            }
            if (p.equals(Point.ZERO))
                return JacobianPoint.ZERO;
            return new JacobianPoint(p.x, p.y, _1n);
        }
        static toAffineBatch(points) {
            const toInv = invertBatch(points.map((p) => p.z));
            return points.map((p, i) => p.toAffine(toInv[i]));
        }
        static normalizeZ(points) {
            return JacobianPoint.toAffineBatch(points).map(JacobianPoint.fromAffine);
        }
        equals(other) {
            assertJacPoint(other);
            const { x: X1, y: Y1, z: Z1 } = this;
            const { x: X2, y: Y2, z: Z2 } = other;
            const Z1Z1 = mod(Z1 * Z1);
            const Z2Z2 = mod(Z2 * Z2);
            const U1 = mod(X1 * Z2Z2);
            const U2 = mod(X2 * Z1Z1);
            const S1 = mod(mod(Y1 * Z2) * Z2Z2);
            const S2 = mod(mod(Y2 * Z1) * Z1Z1);
            return U1 === U2 && S1 === S2;
        }
        negate() {
            return new JacobianPoint(this.x, mod(-this.y), this.z);
        }
        double() {
            const { x: X1, y: Y1, z: Z1 } = this;
            const A = mod(X1 * X1);
            const B = mod(Y1 * Y1);
            const C = mod(B * B);
            const x1b = X1 + B;
            const D = mod(_2n * (mod(x1b * x1b) - A - C));
            const E = mod(_3n * A);
            const F = mod(E * E);
            const X3 = mod(F - _2n * D);
            const Y3 = mod(E * (D - X3) - _8n * C);
            const Z3 = mod(_2n * Y1 * Z1);
            return new JacobianPoint(X3, Y3, Z3);
        }
        add(other) {
            assertJacPoint(other);
            const { x: X1, y: Y1, z: Z1 } = this;
            const { x: X2, y: Y2, z: Z2 } = other;
            if (X2 === _0n || Y2 === _0n)
                return this;
            if (X1 === _0n || Y1 === _0n)
                return other;
            const Z1Z1 = mod(Z1 * Z1);
            const Z2Z2 = mod(Z2 * Z2);
            const U1 = mod(X1 * Z2Z2);
            const U2 = mod(X2 * Z1Z1);
            const S1 = mod(mod(Y1 * Z2) * Z2Z2);
            const S2 = mod(mod(Y2 * Z1) * Z1Z1);
            const H = mod(U2 - U1);
            const r = mod(S2 - S1);
            if (H === _0n) {
                if (r === _0n) {
                    return this.double();
                }
                else {
                    return JacobianPoint.ZERO;
                }
            }
            const HH = mod(H * H);
            const HHH = mod(H * HH);
            const V = mod(U1 * HH);
            const X3 = mod(r * r - HHH - _2n * V);
            const Y3 = mod(r * (V - X3) - S1 * HHH);
            const Z3 = mod(Z1 * Z2 * H);
            return new JacobianPoint(X3, Y3, Z3);
        }
        subtract(other) {
            return this.add(other.negate());
        }
        multiplyUnsafe(scalar) {
            const P0 = JacobianPoint.ZERO;
            if (typeof scalar === 'bigint' && scalar === _0n)
                return P0;
            let n = normalizeScalar(scalar);
            if (n === _1n)
                return this;
            if (!USE_ENDOMORPHISM) {
                let p = P0;
                let d = this;
                while (n > _0n) {
                    if (n & _1n)
                        p = p.add(d);
                    d = d.double();
                    n >>= _1n;
                }
                return p;
            }
            let { k1neg, k1, k2neg, k2 } = endo.splitScalar(n);
            let k1p = P0;
            let k2p = P0;
            let d = this;
            while (k1 > _0n || k2 > _0n) {
                if (k1 & _1n)
                    k1p = k1p.add(d);
                if (k2 & _1n)
                    k2p = k2p.add(d);
                d = d.double();
                k1 >>= _1n;
                k2 >>= _1n;
            }
            if (k1neg)
                k1p = k1p.negate();
            if (k2neg)
                k2p = k2p.negate();
            k2p = new JacobianPoint(mod(k2p.x * endo.beta), k2p.y, k2p.z);
            return k1p.add(k2p);
        }
        precomputeWindow(W) {
            const windows = USE_ENDOMORPHISM ? 128 / W + 1 : 256 / W + 1;
            const points = [];
            let p = this;
            let base = p;
            for (let window = 0; window < windows; window++) {
                base = p;
                points.push(base);
                for (let i = 1; i < 2 ** (W - 1); i++) {
                    base = base.add(p);
                    points.push(base);
                }
                p = base.double();
            }
            return points;
        }
        wNAF(n, affinePoint) {
            if (!affinePoint && this.equals(JacobianPoint.BASE))
                affinePoint = Point.BASE;
            const W = (affinePoint && affinePoint._WINDOW_SIZE) || 1;
            if (256 % W) {
                throw new Error('Point#wNAF: Invalid precomputation window, must be power of 2');
            }
            let precomputes = affinePoint && pointPrecomputes.get(affinePoint);
            if (!precomputes) {
                precomputes = this.precomputeWindow(W);
                if (affinePoint && W !== 1) {
                    precomputes = JacobianPoint.normalizeZ(precomputes);
                    pointPrecomputes.set(affinePoint, precomputes);
                }
            }
            let p = JacobianPoint.ZERO;
            let f = JacobianPoint.BASE;
            const windows = 1 + (USE_ENDOMORPHISM ? 128 / W : 256 / W);
            const windowSize = 2 ** (W - 1);
            const mask = BigInt(2 ** W - 1);
            const maxNumber = 2 ** W;
            const shiftBy = BigInt(W);
            for (let window = 0; window < windows; window++) {
                const offset = window * windowSize;
                let wbits = Number(n & mask);
                n >>= shiftBy;
                if (wbits > windowSize) {
                    wbits -= maxNumber;
                    n += _1n;
                }
                const offset1 = offset;
                const offset2 = offset + Math.abs(wbits) - 1;
                const cond1 = window % 2 !== 0;
                const cond2 = wbits < 0;
                if (wbits === 0) {
                    f = f.add(constTimeNegate(cond1, precomputes[offset1]));
                }
                else {
                    p = p.add(constTimeNegate(cond2, precomputes[offset2]));
                }
            }
            return { p, f };
        }
        multiply(scalar, affinePoint) {
            let n = normalizeScalar(scalar);
            let point;
            let fake;
            if (USE_ENDOMORPHISM) {
                const { k1neg, k1, k2neg, k2 } = endo.splitScalar(n);
                let { p: k1p, f: f1p } = this.wNAF(k1, affinePoint);
                let { p: k2p, f: f2p } = this.wNAF(k2, affinePoint);
                k1p = constTimeNegate(k1neg, k1p);
                k2p = constTimeNegate(k2neg, k2p);
                k2p = new JacobianPoint(mod(k2p.x * endo.beta), k2p.y, k2p.z);
                point = k1p.add(k2p);
                fake = f1p.add(f2p);
            }
            else {
                const { p, f } = this.wNAF(n, affinePoint);
                point = p;
                fake = f;
            }
            return JacobianPoint.normalizeZ([point, fake])[0];
        }
        toAffine(invZ) {
            const { x, y, z } = this;
            const is0 = this.equals(JacobianPoint.ZERO);
            if (invZ == null)
                invZ = is0 ? _8n : invert(z);
            const iz1 = invZ;
            const iz2 = mod(iz1 * iz1);
            const iz3 = mod(iz2 * iz1);
            const ax = mod(x * iz2);
            const ay = mod(y * iz3);
            const zz = mod(z * iz1);
            if (is0)
                return Point.ZERO;
            if (zz !== _1n)
                throw new Error('invZ was invalid');
            return new Point(ax, ay);
        }
    }
    JacobianPoint.BASE = new JacobianPoint(CURVE.Gx, CURVE.Gy, _1n);
    JacobianPoint.ZERO = new JacobianPoint(_0n, _1n, _0n);
    function constTimeNegate(condition, item) {
        const neg = item.negate();
        return condition ? neg : item;
    }
    const pointPrecomputes = new WeakMap();
    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        _setWindowSize(windowSize) {
            this._WINDOW_SIZE = windowSize;
            pointPrecomputes.delete(this);
        }
        hasEvenY() {
            return this.y % _2n === _0n;
        }
        static fromCompressedHex(bytes) {
            const isShort = bytes.length === 32;
            const x = bytesToNumber(isShort ? bytes : bytes.subarray(1));
            if (!isValidFieldElement(x))
                throw new Error('Point is not on curve');
            const y2 = weierstrass(x);
            let y = sqrtMod(y2);
            const isYOdd = (y & _1n) === _1n;
            if (isShort) {
                if (isYOdd)
                    y = mod(-y);
            }
            else {
                const isFirstByteOdd = (bytes[0] & 1) === 1;
                if (isFirstByteOdd !== isYOdd)
                    y = mod(-y);
            }
            const point = new Point(x, y);
            point.assertValidity();
            return point;
        }
        static fromUncompressedHex(bytes) {
            const x = bytesToNumber(bytes.subarray(1, fieldLen + 1));
            const y = bytesToNumber(bytes.subarray(fieldLen + 1, fieldLen * 2 + 1));
            const point = new Point(x, y);
            point.assertValidity();
            return point;
        }
        static fromHex(hex) {
            const bytes = ensureBytes(hex);
            const len = bytes.length;
            const header = bytes[0];
            if (len === fieldLen)
                return this.fromCompressedHex(bytes);
            if (len === compressedLen && (header === 0x02 || header === 0x03)) {
                return this.fromCompressedHex(bytes);
            }
            if (len === uncompressedLen && header === 0x04)
                return this.fromUncompressedHex(bytes);
            throw new Error(`Point.fromHex: received invalid point. Expected 32-${compressedLen} compressed bytes or ${uncompressedLen} uncompressed bytes, not ${len}`);
        }
        static fromPrivateKey(privateKey) {
            return Point.BASE.multiply(normalizePrivateKey(privateKey));
        }
        static fromSignature(msgHash, signature, recovery) {
            const { r, s } = normalizeSignature(signature);
            if (![0, 1, 2, 3].includes(recovery))
                throw new Error('Cannot recover: invalid recovery bit');
            const h = truncateHash(ensureBytes(msgHash));
            const { n } = CURVE;
            const radj = recovery === 2 || recovery === 3 ? r + n : r;
            const rinv = invert(radj, n);
            const u1 = mod(-h * rinv, n);
            const u2 = mod(s * rinv, n);
            const prefix = recovery & 1 ? '03' : '02';
            const R = Point.fromHex(prefix + numTo32bStr(radj));
            const Q = Point.BASE.multiplyAndAddUnsafe(R, u1, u2);
            if (!Q)
                throw new Error('Cannot recover signature: point at infinify');
            Q.assertValidity();
            return Q;
        }
        toRawBytes(isCompressed = false) {
            return hexToBytes(this.toHex(isCompressed));
        }
        toHex(isCompressed = false) {
            const x = numTo32bStr(this.x);
            if (isCompressed) {
                const prefix = this.hasEvenY() ? '02' : '03';
                return `${prefix}${x}`;
            }
            else {
                return `04${x}${numTo32bStr(this.y)}`;
            }
        }
        toHexX() {
            return this.toHex(true).slice(2);
        }
        toRawX() {
            return this.toRawBytes(true).slice(1);
        }
        assertValidity() {
            const msg = 'Point is not on elliptic curve';
            const { x, y } = this;
            if (!isValidFieldElement(x) || !isValidFieldElement(y))
                throw new Error(msg);
            const left = mod(y * y);
            const right = weierstrass(x);
            if (mod(left - right) !== _0n)
                throw new Error(msg);
        }
        equals(other) {
            return this.x === other.x && this.y === other.y;
        }
        negate() {
            return new Point(this.x, mod(-this.y));
        }
        double() {
            return JacobianPoint.fromAffine(this).double().toAffine();
        }
        add(other) {
            return JacobianPoint.fromAffine(this).add(JacobianPoint.fromAffine(other)).toAffine();
        }
        subtract(other) {
            return this.add(other.negate());
        }
        multiply(scalar) {
            return JacobianPoint.fromAffine(this).multiply(scalar, this).toAffine();
        }
        multiplyAndAddUnsafe(Q, a, b) {
            const P = JacobianPoint.fromAffine(this);
            const aP = a === _0n || a === _1n || this !== Point.BASE ? P.multiplyUnsafe(a) : P.multiply(a);
            const bQ = JacobianPoint.fromAffine(Q).multiplyUnsafe(b);
            const sum = aP.add(bQ);
            return sum.equals(JacobianPoint.ZERO) ? undefined : sum.toAffine();
        }
    }
    Point.BASE = new Point(CURVE.Gx, CURVE.Gy);
    Point.ZERO = new Point(_0n, _0n);
    function sliceDER(s) {
        return Number.parseInt(s[0], 16) >= 8 ? '00' + s : s;
    }
    function parseDERInt(data) {
        if (data.length < 2 || data[0] !== 0x02) {
            throw new Error(`Invalid signature integer tag: ${bytesToHex(data)}`);
        }
        const len = data[1];
        const res = data.subarray(2, len + 2);
        if (!len || res.length !== len) {
            throw new Error(`Invalid signature integer: wrong length`);
        }
        if (res[0] === 0x00 && res[1] <= 0x7f) {
            throw new Error('Invalid signature integer: trailing length');
        }
        return { data: bytesToNumber(res), left: data.subarray(len + 2) };
    }
    function parseDERSignature(data) {
        if (data.length < 2 || data[0] != 0x30) {
            throw new Error(`Invalid signature tag: ${bytesToHex(data)}`);
        }
        if (data[1] !== data.length - 2) {
            throw new Error('Invalid signature: incorrect length');
        }
        const { data: r, left: sBytes } = parseDERInt(data.subarray(2));
        const { data: s, left: rBytesLeft } = parseDERInt(sBytes);
        if (rBytesLeft.length) {
            throw new Error(`Invalid signature: left bytes after parsing: ${bytesToHex(rBytesLeft)}`);
        }
        return { r, s };
    }
    class Signature$1 {
        constructor(r, s) {
            this.r = r;
            this.s = s;
            this.assertValidity();
        }
        static fromCompact(hex) {
            const arr = hex instanceof Uint8Array;
            const name = 'Signature.fromCompact';
            if (typeof hex !== 'string' && !arr)
                throw new TypeError(`${name}: Expected string or Uint8Array`);
            const str = arr ? bytesToHex(hex) : hex;
            if (str.length !== 128)
                throw new Error(`${name}: Expected 64-byte hex`);
            return new Signature$1(hexToNumber(str.slice(0, 64)), hexToNumber(str.slice(64, 128)));
        }
        static fromDER(hex) {
            const arr = hex instanceof Uint8Array;
            if (typeof hex !== 'string' && !arr)
                throw new TypeError(`Signature.fromDER: Expected string or Uint8Array`);
            const { r, s } = parseDERSignature(arr ? hex : hexToBytes(hex));
            return new Signature$1(r, s);
        }
        static fromHex(hex) {
            return this.fromDER(hex);
        }
        assertValidity() {
            const { r, s } = this;
            if (!isWithinCurveOrder(r))
                throw new Error('Invalid Signature: r must be 0 < r < n');
            if (!isWithinCurveOrder(s))
                throw new Error('Invalid Signature: s must be 0 < s < n');
        }
        hasHighS() {
            const HALF = CURVE.n >> _1n;
            return this.s > HALF;
        }
        normalizeS() {
            return this.hasHighS() ? new Signature$1(this.r, mod(-this.s, CURVE.n)) : this;
        }
        toDERRawBytes() {
            return hexToBytes(this.toDERHex());
        }
        toDERHex() {
            const sHex = sliceDER(numberToHexUnpadded(this.s));
            const rHex = sliceDER(numberToHexUnpadded(this.r));
            const sHexL = sHex.length / 2;
            const rHexL = rHex.length / 2;
            const sLen = numberToHexUnpadded(sHexL);
            const rLen = numberToHexUnpadded(rHexL);
            const length = numberToHexUnpadded(rHexL + sHexL + 4);
            return `30${length}02${rLen}${rHex}02${sLen}${sHex}`;
        }
        toRawBytes() {
            return this.toDERRawBytes();
        }
        toHex() {
            return this.toDERHex();
        }
        toCompactRawBytes() {
            return hexToBytes(this.toCompactHex());
        }
        toCompactHex() {
            return numTo32bStr(this.r) + numTo32bStr(this.s);
        }
    }
    function concatBytes(...arrays) {
        if (!arrays.every((b) => b instanceof Uint8Array))
            throw new Error('Uint8Array list expected');
        if (arrays.length === 1)
            return arrays[0];
        const length = arrays.reduce((a, arr) => a + arr.length, 0);
        const result = new Uint8Array(length);
        for (let i = 0, pad = 0; i < arrays.length; i++) {
            const arr = arrays[i];
            result.set(arr, pad);
            pad += arr.length;
        }
        return result;
    }
    const hexes = Array.from({ length: 256 }, (v, i) => i.toString(16).padStart(2, '0'));
    function bytesToHex(uint8a) {
        if (!(uint8a instanceof Uint8Array))
            throw new Error('Expected Uint8Array');
        let hex = '';
        for (let i = 0; i < uint8a.length; i++) {
            hex += hexes[uint8a[i]];
        }
        return hex;
    }
    const POW_2_256 = BigInt('0x10000000000000000000000000000000000000000000000000000000000000000');
    function numTo32bStr(num) {
        if (typeof num !== 'bigint')
            throw new Error('Expected bigint');
        if (!(_0n <= num && num < POW_2_256))
            throw new Error('Expected number 0 <= n < 2^256');
        return num.toString(16).padStart(64, '0');
    }
    function numTo32b(num) {
        const b = hexToBytes(numTo32bStr(num));
        if (b.length !== 32)
            throw new Error('Error: expected 32 bytes');
        return b;
    }
    function numberToHexUnpadded(num) {
        const hex = num.toString(16);
        return hex.length & 1 ? `0${hex}` : hex;
    }
    function hexToNumber(hex) {
        if (typeof hex !== 'string') {
            throw new TypeError('hexToNumber: expected string, got ' + typeof hex);
        }
        return BigInt(`0x${hex}`);
    }
    function hexToBytes(hex) {
        if (typeof hex !== 'string') {
            throw new TypeError('hexToBytes: expected string, got ' + typeof hex);
        }
        if (hex.length % 2)
            throw new Error('hexToBytes: received invalid unpadded hex' + hex.length);
        const array = new Uint8Array(hex.length / 2);
        for (let i = 0; i < array.length; i++) {
            const j = i * 2;
            const hexByte = hex.slice(j, j + 2);
            const byte = Number.parseInt(hexByte, 16);
            if (Number.isNaN(byte) || byte < 0)
                throw new Error('Invalid byte sequence');
            array[i] = byte;
        }
        return array;
    }
    function bytesToNumber(bytes) {
        return hexToNumber(bytesToHex(bytes));
    }
    function ensureBytes(hex) {
        return hex instanceof Uint8Array ? Uint8Array.from(hex) : hexToBytes(hex);
    }
    function normalizeScalar(num) {
        if (typeof num === 'number' && Number.isSafeInteger(num) && num > 0)
            return BigInt(num);
        if (typeof num === 'bigint' && isWithinCurveOrder(num))
            return num;
        throw new TypeError('Expected valid private scalar: 0 < scalar < curve.n');
    }
    function mod(a, b = CURVE.P) {
        const result = a % b;
        return result >= _0n ? result : b + result;
    }
    function pow2(x, power) {
        const { P } = CURVE;
        let res = x;
        while (power-- > _0n) {
            res *= res;
            res %= P;
        }
        return res;
    }
    function sqrtMod(x) {
        const { P } = CURVE;
        const _6n = BigInt(6);
        const _11n = BigInt(11);
        const _22n = BigInt(22);
        const _23n = BigInt(23);
        const _44n = BigInt(44);
        const _88n = BigInt(88);
        const b2 = (x * x * x) % P;
        const b3 = (b2 * b2 * x) % P;
        const b6 = (pow2(b3, _3n) * b3) % P;
        const b9 = (pow2(b6, _3n) * b3) % P;
        const b11 = (pow2(b9, _2n) * b2) % P;
        const b22 = (pow2(b11, _11n) * b11) % P;
        const b44 = (pow2(b22, _22n) * b22) % P;
        const b88 = (pow2(b44, _44n) * b44) % P;
        const b176 = (pow2(b88, _88n) * b88) % P;
        const b220 = (pow2(b176, _44n) * b44) % P;
        const b223 = (pow2(b220, _3n) * b3) % P;
        const t1 = (pow2(b223, _23n) * b22) % P;
        const t2 = (pow2(t1, _6n) * b2) % P;
        const rt = pow2(t2, _2n);
        const xc = (rt * rt) % P;
        if (xc !== x)
            throw new Error('Cannot find square root');
        return rt;
    }
    function invert(number, modulo = CURVE.P) {
        if (number === _0n || modulo <= _0n) {
            throw new Error(`invert: expected positive integers, got n=${number} mod=${modulo}`);
        }
        let a = mod(number, modulo);
        let b = modulo;
        let x = _0n, u = _1n;
        while (a !== _0n) {
            const q = b / a;
            const r = b % a;
            const m = x - u * q;
            b = a, a = r, x = u, u = m;
        }
        const gcd = b;
        if (gcd !== _1n)
            throw new Error('invert: does not exist');
        return mod(x, modulo);
    }
    function invertBatch(nums, p = CURVE.P) {
        const scratch = new Array(nums.length);
        const lastMultiplied = nums.reduce((acc, num, i) => {
            if (num === _0n)
                return acc;
            scratch[i] = acc;
            return mod(acc * num, p);
        }, _1n);
        const inverted = invert(lastMultiplied, p);
        nums.reduceRight((acc, num, i) => {
            if (num === _0n)
                return acc;
            scratch[i] = mod(acc * scratch[i], p);
            return mod(acc * num, p);
        }, inverted);
        return scratch;
    }
    function bits2int_2(bytes) {
        const delta = bytes.length * 8 - groupLen * 8;
        const num = bytesToNumber(bytes);
        return delta > 0 ? num >> BigInt(delta) : num;
    }
    function truncateHash(hash, truncateOnly = false) {
        const h = bits2int_2(hash);
        if (truncateOnly)
            return h;
        const { n } = CURVE;
        return h >= n ? h - n : h;
    }
    let _sha256Sync;
    let _hmacSha256Sync;
    class HmacDrbg {
        constructor(hashLen, qByteLen) {
            this.hashLen = hashLen;
            this.qByteLen = qByteLen;
            if (typeof hashLen !== 'number' || hashLen < 2)
                throw new Error('hashLen must be a number');
            if (typeof qByteLen !== 'number' || qByteLen < 2)
                throw new Error('qByteLen must be a number');
            this.v = new Uint8Array(hashLen).fill(1);
            this.k = new Uint8Array(hashLen).fill(0);
            this.counter = 0;
        }
        hmac(...values) {
            return utils.hmacSha256(this.k, ...values);
        }
        hmacSync(...values) {
            return _hmacSha256Sync(this.k, ...values);
        }
        checkSync() {
            if (typeof _hmacSha256Sync !== 'function')
                throw new ShaError('hmacSha256Sync needs to be set');
        }
        incr() {
            if (this.counter >= 1000)
                throw new Error('Tried 1,000 k values for sign(), all were invalid');
            this.counter += 1;
        }
        async reseed(seed = new Uint8Array()) {
            this.k = await this.hmac(this.v, Uint8Array.from([0x00]), seed);
            this.v = await this.hmac(this.v);
            if (seed.length === 0)
                return;
            this.k = await this.hmac(this.v, Uint8Array.from([0x01]), seed);
            this.v = await this.hmac(this.v);
        }
        reseedSync(seed = new Uint8Array()) {
            this.checkSync();
            this.k = this.hmacSync(this.v, Uint8Array.from([0x00]), seed);
            this.v = this.hmacSync(this.v);
            if (seed.length === 0)
                return;
            this.k = this.hmacSync(this.v, Uint8Array.from([0x01]), seed);
            this.v = this.hmacSync(this.v);
        }
        async generate() {
            this.incr();
            let len = 0;
            const out = [];
            while (len < this.qByteLen) {
                this.v = await this.hmac(this.v);
                const sl = this.v.slice();
                out.push(sl);
                len += this.v.length;
            }
            return concatBytes(...out);
        }
        generateSync() {
            this.checkSync();
            this.incr();
            let len = 0;
            const out = [];
            while (len < this.qByteLen) {
                this.v = this.hmacSync(this.v);
                const sl = this.v.slice();
                out.push(sl);
                len += this.v.length;
            }
            return concatBytes(...out);
        }
    }
    function isWithinCurveOrder(num) {
        return _0n < num && num < CURVE.n;
    }
    function isValidFieldElement(num) {
        return _0n < num && num < CURVE.P;
    }
    function kmdToSig(kBytes, m, d, lowS = true) {
        const { n } = CURVE;
        const k = truncateHash(kBytes, true);
        if (!isWithinCurveOrder(k))
            return;
        const kinv = invert(k, n);
        const q = Point.BASE.multiply(k);
        const r = mod(q.x, n);
        if (r === _0n)
            return;
        const s = mod(kinv * mod(m + d * r, n), n);
        if (s === _0n)
            return;
        let sig = new Signature$1(r, s);
        let recovery = (q.x === sig.r ? 0 : 2) | Number(q.y & _1n);
        if (lowS && sig.hasHighS()) {
            sig = sig.normalizeS();
            recovery ^= 1;
        }
        return { sig, recovery };
    }
    function normalizePrivateKey(key) {
        let num;
        if (typeof key === 'bigint') {
            num = key;
        }
        else if (typeof key === 'number' && Number.isSafeInteger(key) && key > 0) {
            num = BigInt(key);
        }
        else if (typeof key === 'string') {
            if (key.length !== 2 * groupLen)
                throw new Error('Expected 32 bytes of private key');
            num = hexToNumber(key);
        }
        else if (key instanceof Uint8Array) {
            if (key.length !== groupLen)
                throw new Error('Expected 32 bytes of private key');
            num = bytesToNumber(key);
        }
        else {
            throw new TypeError('Expected valid private key');
        }
        if (!isWithinCurveOrder(num))
            throw new Error('Expected private key: 0 < key < n');
        return num;
    }
    function normalizePublicKey(publicKey) {
        if (publicKey instanceof Point) {
            publicKey.assertValidity();
            return publicKey;
        }
        else {
            return Point.fromHex(publicKey);
        }
    }
    function normalizeSignature(signature) {
        if (signature instanceof Signature$1) {
            signature.assertValidity();
            return signature;
        }
        try {
            return Signature$1.fromDER(signature);
        }
        catch (error) {
            return Signature$1.fromCompact(signature);
        }
    }
    function getPublicKey(privateKey, isCompressed = false) {
        return Point.fromPrivateKey(privateKey).toRawBytes(isCompressed);
    }
    function recoverPublicKey(msgHash, signature, recovery, isCompressed = false) {
        return Point.fromSignature(msgHash, signature, recovery).toRawBytes(isCompressed);
    }
    function isProbPub(item) {
        const arr = item instanceof Uint8Array;
        const str = typeof item === 'string';
        const len = (arr || str) && item.length;
        if (arr)
            return len === compressedLen || len === uncompressedLen;
        if (str)
            return len === compressedLen * 2 || len === uncompressedLen * 2;
        if (item instanceof Point)
            return true;
        return false;
    }
    function getSharedSecret(privateA, publicB, isCompressed = false) {
        if (isProbPub(privateA))
            throw new TypeError('getSharedSecret: first arg must be private key');
        if (!isProbPub(publicB))
            throw new TypeError('getSharedSecret: second arg must be public key');
        const b = normalizePublicKey(publicB);
        b.assertValidity();
        return b.multiply(normalizePrivateKey(privateA)).toRawBytes(isCompressed);
    }
    function bits2int(bytes) {
        const slice = bytes.length > fieldLen ? bytes.slice(0, fieldLen) : bytes;
        return bytesToNumber(slice);
    }
    function bits2octets(bytes) {
        const z1 = bits2int(bytes);
        const z2 = mod(z1, CURVE.n);
        return int2octets(z2 < _0n ? z1 : z2);
    }
    function int2octets(num) {
        return numTo32b(num);
    }
    function initSigArgs(msgHash, privateKey, extraEntropy) {
        if (msgHash == null)
            throw new Error(`sign: expected valid message hash, not "${msgHash}"`);
        const h1 = ensureBytes(msgHash);
        const d = normalizePrivateKey(privateKey);
        const seedArgs = [int2octets(d), bits2octets(h1)];
        if (extraEntropy != null) {
            if (extraEntropy === true)
                extraEntropy = utils.randomBytes(fieldLen);
            const e = ensureBytes(extraEntropy);
            if (e.length !== fieldLen)
                throw new Error(`sign: Expected ${fieldLen} bytes of extra data`);
            seedArgs.push(e);
        }
        const seed = concatBytes(...seedArgs);
        const m = bits2int(h1);
        return { seed, m, d };
    }
    function finalizeSig(recSig, opts) {
        const { sig, recovery } = recSig;
        const { der, recovered } = Object.assign({ canonical: true, der: true }, opts);
        const hashed = der ? sig.toDERRawBytes() : sig.toCompactRawBytes();
        return recovered ? [hashed, recovery] : hashed;
    }
    function signSync(msgHash, privKey, opts = {}) {
        const { seed, m, d } = initSigArgs(msgHash, privKey, opts.extraEntropy);
        const drbg = new HmacDrbg(hashLen, groupLen);
        drbg.reseedSync(seed);
        let sig;
        while (!(sig = kmdToSig(drbg.generateSync(), m, d, opts.canonical)))
            drbg.reseedSync();
        return finalizeSig(sig, opts);
    }
    Point.BASE._setWindowSize(8);
    const crypto = {
        node: nodeCrypto,
        web: typeof self === 'object' && 'crypto' in self ? self.crypto : undefined,
    };
    const TAGGED_HASH_PREFIXES = {};
    const utils = {
        bytesToHex,
        hexToBytes,
        concatBytes,
        mod,
        invert,
        isValidPrivateKey(privateKey) {
            try {
                normalizePrivateKey(privateKey);
                return true;
            }
            catch (error) {
                return false;
            }
        },
        _bigintTo32Bytes: numTo32b,
        _normalizePrivateKey: normalizePrivateKey,
        hashToPrivateKey: (hash) => {
            hash = ensureBytes(hash);
            const minLen = groupLen + 8;
            if (hash.length < minLen || hash.length > 1024) {
                throw new Error(`Expected valid bytes of private key as per FIPS 186`);
            }
            const num = mod(bytesToNumber(hash), CURVE.n - _1n) + _1n;
            return numTo32b(num);
        },
        randomBytes: (bytesLength = 32) => {
            if (crypto.web) {
                return crypto.web.getRandomValues(new Uint8Array(bytesLength));
            }
            else if (crypto.node) {
                const { randomBytes } = crypto.node;
                return Uint8Array.from(randomBytes(bytesLength));
            }
            else {
                throw new Error("The environment doesn't have randomBytes function");
            }
        },
        randomPrivateKey: () => utils.hashToPrivateKey(utils.randomBytes(groupLen + 8)),
        precompute(windowSize = 8, point = Point.BASE) {
            const cached = point === Point.BASE ? point : new Point(point.x, point.y);
            cached._setWindowSize(windowSize);
            cached.multiply(_3n);
            return cached;
        },
        sha256: async (...messages) => {
            if (crypto.web) {
                const buffer = await crypto.web.subtle.digest('SHA-256', concatBytes(...messages));
                return new Uint8Array(buffer);
            }
            else if (crypto.node) {
                const { createHash } = crypto.node;
                const hash = createHash('sha256');
                messages.forEach((m) => hash.update(m));
                return Uint8Array.from(hash.digest());
            }
            else {
                throw new Error("The environment doesn't have sha256 function");
            }
        },
        hmacSha256: async (key, ...messages) => {
            if (crypto.web) {
                const ckey = await crypto.web.subtle.importKey('raw', key, { name: 'HMAC', hash: { name: 'SHA-256' } }, false, ['sign']);
                const message = concatBytes(...messages);
                const buffer = await crypto.web.subtle.sign('HMAC', ckey, message);
                return new Uint8Array(buffer);
            }
            else if (crypto.node) {
                const { createHmac } = crypto.node;
                const hash = createHmac('sha256', key);
                messages.forEach((m) => hash.update(m));
                return Uint8Array.from(hash.digest());
            }
            else {
                throw new Error("The environment doesn't have hmac-sha256 function");
            }
        },
        sha256Sync: undefined,
        hmacSha256Sync: undefined,
        taggedHash: async (tag, ...messages) => {
            let tagP = TAGGED_HASH_PREFIXES[tag];
            if (tagP === undefined) {
                const tagH = await utils.sha256(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
                tagP = concatBytes(tagH, tagH);
                TAGGED_HASH_PREFIXES[tag] = tagP;
            }
            return utils.sha256(tagP, ...messages);
        },
        taggedHashSync: (tag, ...messages) => {
            if (typeof _sha256Sync !== 'function')
                throw new ShaError('sha256Sync is undefined, you need to set it');
            let tagP = TAGGED_HASH_PREFIXES[tag];
            if (tagP === undefined) {
                const tagH = _sha256Sync(Uint8Array.from(tag, (c) => c.charCodeAt(0)));
                tagP = concatBytes(tagH, tagH);
                TAGGED_HASH_PREFIXES[tag] = tagP;
            }
            return _sha256Sync(tagP, ...messages);
        },
        _JacobianPoint: JacobianPoint,
    };
    Object.defineProperties(utils, {
        sha256Sync: {
            configurable: false,
            get() {
                return _sha256Sync;
            },
            set(val) {
                if (!_sha256Sync)
                    _sha256Sync = val;
            },
        },
        hmacSha256Sync: {
            configurable: false,
            get() {
                return _hmacSha256Sync;
            },
            set(val) {
                if (!_hmacSha256Sync)
                    _hmacSha256Sync = val;
            },
        },
    });

    /**
     *  A constant for the zero address.
     *
     *  (**i.e.** ``"0x0000000000000000000000000000000000000000"``)
     */
    const ZeroAddress = "0x0000000000000000000000000000000000000000";

    /**
     *  A constant for the zero hash.
     *
     *  (**i.e.** ``"0x0000000000000000000000000000000000000000000000000000000000000000"``)
     */
    const ZeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000";

    // Constants
    const BN_0$7 = BigInt(0);
    const BN_1$2 = BigInt(1);
    const BN_2$2 = BigInt(2);
    const BN_27$1 = BigInt(27);
    const BN_28$1 = BigInt(28);
    const BN_35$1 = BigInt(35);
    const _guard$1 = {};
    function toUint256(value) {
        return zeroPadValue(toBeArray(value), 32);
    }
    /**
     *  A Signature  @TODO
     *
     *
     *  @_docloc: api/crypto:Signing
     */
    class Signature {
        #r;
        #s;
        #v;
        #networkV;
        /**
         *  The ``r`` value for a signautre.
         *
         *  This represents the ``x`` coordinate of a "reference" or
         *  challenge point, from which the ``y`` can be computed.
         */
        get r() { return this.#r; }
        set r(value) {
            assertArgument(dataLength(value) === 32, "invalid r", "value", value);
            this.#r = hexlify(value);
        }
        /**
         *  The ``s`` value for a signature.
         */
        get s() { return this.#s; }
        set s(_value) {
            assertArgument(dataLength(_value) === 32, "invalid r", "value", _value);
            const value = hexlify(_value);
            assertArgument(parseInt(value.substring(0, 3)) < 8, "non-canonical s", "value", value);
            this.#s = value;
        }
        /**
         *  The ``v`` value for a signature.
         *
         *  Since a given ``x`` value for ``r`` has two possible values for
         *  its correspondin ``y``, the ``v`` indicates which of the two ``y``
         *  values to use.
         *
         *  It is normalized to the values ``27`` or ``28`` for legacy
         *  purposes.
         */
        get v() { return this.#v; }
        set v(value) {
            const v = getNumber(value, "value");
            assertArgument(v === 27 || v === 28, "invalid v", "v", value);
            this.#v = v;
        }
        /**
         *  The EIP-155 ``v`` for legacy transactions. For non-legacy
         *  transactions, this value is ``null``.
         */
        get networkV() { return this.#networkV; }
        /**
         *  The chain ID for EIP-155 legacy transactions. For non-legacy
         *  transactions, this value is ``null``.
         */
        get legacyChainId() {
            const v = this.networkV;
            if (v == null) {
                return null;
            }
            return Signature.getChainId(v);
        }
        /**
         *  The ``yParity`` for the signature.
         *
         *  See ``v`` for more details on how this value is used.
         */
        get yParity() {
            return (this.v === 27) ? 0 : 1;
        }
        /**
         *  The [[link-eip-2098]] compact representation of the ``yParity``
         *  and ``s`` compacted into a single ``bytes32``.
         */
        get yParityAndS() {
            // The EIP-2098 compact representation
            const yParityAndS = getBytes(this.s);
            if (this.yParity) {
                yParityAndS[0] |= 0x80;
            }
            return hexlify(yParityAndS);
        }
        /**
         *  The [[link-eip-2098]] compact representation.
         */
        get compactSerialized() {
            return concat([this.r, this.yParityAndS]);
        }
        /**
         *  The serialized representation.
         */
        get serialized() {
            return concat([this.r, this.s, (this.yParity ? "0x1c" : "0x1b")]);
        }
        /**
         *  @private
         */
        constructor(guard, r, s, v) {
            assertPrivate(guard, _guard$1, "Signature");
            this.#r = r;
            this.#s = s;
            this.#v = v;
            this.#networkV = null;
        }
        [Symbol.for('nodejs.util.inspect.custom')]() {
            return `Signature { r: "${this.r}", s: "${this.s}", yParity: ${this.yParity}, networkV: ${this.networkV} }`;
        }
        /**
         *  Returns a new identical [[Signature]].
         */
        clone() {
            const clone = new Signature(_guard$1, this.r, this.s, this.v);
            if (this.networkV) {
                clone.#networkV = this.networkV;
            }
            return clone;
        }
        /**
         *  Returns a representation that is compatible with ``JSON.stringify``.
         */
        toJSON() {
            const networkV = this.networkV;
            return {
                _type: "signature",
                networkV: ((networkV != null) ? networkV.toString() : null),
                r: this.r, s: this.s, v: this.v,
            };
        }
        /**
         *  Compute the chain ID from the ``v`` in a legacy EIP-155 transactions.
         *
         *  @example:
         *    Signature.getChainId(45)
         *    //_result:
         *
         *    Signature.getChainId(46)
         *    //_result:
         */
        static getChainId(v) {
            const bv = getBigInt(v, "v");
            // The v is not an EIP-155 v, so it is the unspecified chain ID
            if ((bv == BN_27$1) || (bv == BN_28$1)) {
                return BN_0$7;
            }
            // Bad value for an EIP-155 v
            assertArgument(bv >= BN_35$1, "invalid EIP-155 v", "v", v);
            return (bv - BN_35$1) / BN_2$2;
        }
        /**
         *  Compute the ``v`` for a chain ID for a legacy EIP-155 transactions.
         *
         *  Legacy transactions which use [[link-eip-155]] hijack the ``v``
         *  property to include the chain ID.
         *
         *  @example:
         *    Signature.getChainIdV(5, 27)
         *    //_result:
         *
         *    Signature.getChainIdV(5, 28)
         *    //_result:
         *
         */
        static getChainIdV(chainId, v) {
            return (getBigInt(chainId) * BN_2$2) + BigInt(35 + v - 27);
        }
        /**
         *  Compute the normalized legacy transaction ``v`` from a ``yParirty``,
         *  a legacy transaction ``v`` or a legacy [[link-eip-155]] transaction.
         *
         *  @example:
         *    // The values 0 and 1 imply v is actually yParity
         *    Signature.getNormalizedV(0)
         *    //_result:
         *
         *    // Legacy non-EIP-1559 transaction (i.e. 27 or 28)
         *    Signature.getNormalizedV(27)
         *    //_result:
         *
         *    // Legacy EIP-155 transaction (i.e. >= 35)
         *    Signature.getNormalizedV(46)
         *    //_result:
         *
         *    // Invalid values throw
         *    Signature.getNormalizedV(5)
         *    //_error:
         */
        static getNormalizedV(v) {
            const bv = getBigInt(v);
            if (bv === BN_0$7 || bv === BN_27$1) {
                return 27;
            }
            if (bv === BN_1$2 || bv === BN_28$1) {
                return 28;
            }
            assertArgument(bv >= BN_35$1, "invalid v", "v", v);
            // Otherwise, EIP-155 v means odd is 27 and even is 28
            return (bv & BN_1$2) ? 27 : 28;
        }
        /**
         *  Creates a new [[Signature]].
         *
         *  If no %%sig%% is provided, a new [[Signature]] is created
         *  with default values.
         *
         *  If %%sig%% is a string, it is parsed.
         */
        static from(sig) {
            function assertError(check, message) {
                assertArgument(check, message, "signature", sig);
            }
            if (sig == null) {
                return new Signature(_guard$1, ZeroHash, ZeroHash, 27);
            }
            if (typeof (sig) === "string") {
                const bytes = getBytes(sig, "signature");
                if (bytes.length === 64) {
                    const r = hexlify(bytes.slice(0, 32));
                    const s = bytes.slice(32, 64);
                    const v = (s[0] & 0x80) ? 28 : 27;
                    s[0] &= 0x7f;
                    return new Signature(_guard$1, r, hexlify(s), v);
                }
                if (bytes.length === 65) {
                    const r = hexlify(bytes.slice(0, 32));
                    const s = bytes.slice(32, 64);
                    assertError((s[0] & 0x80) === 0, "non-canonical s");
                    const v = Signature.getNormalizedV(bytes[64]);
                    return new Signature(_guard$1, r, hexlify(s), v);
                }
                assertError(false, "invlaid raw signature length");
            }
            if (sig instanceof Signature) {
                return sig.clone();
            }
            // Get r
            const _r = sig.r;
            assertError(_r != null, "missing r");
            const r = toUint256(_r);
            // Get s; by any means necessary (we check consistency below)
            const s = (function (s, yParityAndS) {
                if (s != null) {
                    return toUint256(s);
                }
                if (yParityAndS != null) {
                    assertError(isHexString(yParityAndS, 32), "invalid yParityAndS");
                    const bytes = getBytes(yParityAndS);
                    bytes[0] &= 0x7f;
                    return hexlify(bytes);
                }
                assertError(false, "missing s");
            })(sig.s, sig.yParityAndS);
            assertError((getBytes(s)[0] & 0x80) == 0, "non-canonical s");
            // Get v; by any means necessary (we check consistency below)
            const { networkV, v } = (function (_v, yParityAndS, yParity) {
                if (_v != null) {
                    const v = getBigInt(_v);
                    return {
                        networkV: ((v >= BN_35$1) ? v : undefined),
                        v: Signature.getNormalizedV(v)
                    };
                }
                if (yParityAndS != null) {
                    assertError(isHexString(yParityAndS, 32), "invalid yParityAndS");
                    return { v: ((getBytes(yParityAndS)[0] & 0x80) ? 28 : 27) };
                }
                if (yParity != null) {
                    switch (yParity) {
                        case 0: return { v: 27 };
                        case 1: return { v: 28 };
                    }
                    assertError(false, "invalid yParity");
                }
                assertError(false, "missing v");
            })(sig.v, sig.yParityAndS, sig.yParity);
            const result = new Signature(_guard$1, r, s, v);
            if (networkV) {
                result.#networkV = networkV;
            }
            // If multiple of v, yParity, yParityAndS we given, check they match
            assertError(!("yParity" in sig && sig.yParity !== result.yParity), "yParity mismatch");
            assertError(!("yParityAndS" in sig && sig.yParityAndS !== result.yParityAndS), "yParityAndS mismatch");
            return result;
        }
    }

    /**
     *  Add details about signing here.
     *
     *  @_subsection: api/crypto:Signing  [about-signing]
     */
    //const N = BigInt("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
    // Make noble-secp256k1 sync
    utils.hmacSha256Sync = function (key, ...messages) {
        return getBytes(computeHmac("sha256", key, concat(messages)));
    };
    /**
     *  A **SigningKey** provides high-level access to the elliptic curve
     *  cryptography (ECC) operations and key management.
     */
    class SigningKey {
        #privateKey;
        /**
         *  Creates a new **SigningKey** for %%privateKey%%.
         */
        constructor(privateKey) {
            assertArgument(dataLength(privateKey) === 32, "invalid private key", "privateKey", "[REDACTED]");
            this.#privateKey = hexlify(privateKey);
        }
        /**
         *  The private key.
         */
        get privateKey() { return this.#privateKey; }
        /**
         *  The uncompressed public key.
         *
         * This will always begin with the prefix ``0x04`` and be 132
         * characters long (the ``0x`` prefix and 130 hexadecimal nibbles).
         */
        get publicKey() { return SigningKey.computePublicKey(this.#privateKey); }
        /**
         *  The compressed public key.
         *
         *  This will always begin with either the prefix ``0x02`` or ``0x03``
         *  and be 68 characters long (the ``0x`` prefix and 33 hexadecimal
         *  nibbles)
         */
        get compressedPublicKey() { return SigningKey.computePublicKey(this.#privateKey, true); }
        /**
         *  Return the signature of the signed %%digest%%.
         */
        sign(digest) {
            assertArgument(dataLength(digest) === 32, "invalid digest length", "digest", digest);
            const [sigDer, recid] = signSync(getBytesCopy(digest), getBytesCopy(this.#privateKey), {
                recovered: true,
                canonical: true
            });
            const sig = Signature$1.fromHex(sigDer);
            return Signature.from({
                r: toBeHex("0x" + sig.r.toString(16), 32),
                s: toBeHex("0x" + sig.s.toString(16), 32),
                v: (recid ? 0x1c : 0x1b)
            });
        }
        /**
         *  Returns the [[link-wiki-ecdh]] shared secret between this
         *  private key and the %%other%% key.
         *
         *  The %%other%% key may be any type of key, a raw public key,
         *  a compressed/uncompressed pubic key or aprivate key.
         *
         *  Best practice is usually to use a cryptographic hash on the
         *  returned value before using it as a symetric secret.
         *
         *  @example:
         *    sign1 = new SigningKey(id("some-secret-1"))
         *    sign2 = new SigningKey(id("some-secret-2"))
         *
         *    // Notice that privA.computeSharedSecret(pubB)...
         *    sign1.computeSharedSecret(sign2.publicKey)
         *    //_result:
         *
         *    // ...is equal to privB.computeSharedSecret(pubA).
         *    sign2.computeSharedSecret(sign1.publicKey)
         *    //_result:
         */
        computeSharedSecret(other) {
            const pubKey = SigningKey.computePublicKey(other);
            console.log(pubKey);
            return hexlify(getSharedSecret(getBytesCopy(this.#privateKey), getBytes(pubKey)));
        }
        /**
         *  Compute the public key for %%key%%, optionally %%compressed%%.
         *
         *  The %%key%% may be any type of key, a raw public key, a
         *  compressed/uncompressed public key or private key.
         *
         *  @example:
         *    sign = new SigningKey(id("some-secret"));
         *
         *    // Compute the uncompressed public key for a private key
         *    SigningKey.computePublicKey(sign.privateKey)
         *    //_result:
         *
         *    // Compute the compressed public key for a private key
         *    SigningKey.computePublicKey(sign.privateKey, true)
         *    //_result:
         *
         *    // Compute the uncompressed public key
         *    SigningKey.computePublicKey(sign.publicKey, false);
         *    //_result:
         *
         *    // Compute the Compressed a public key
         *    SigningKey.computePublicKey(sign.publicKey, true);
         *    //_result:
         */
        static computePublicKey(key, compressed) {
            let bytes = getBytes(key, "key");
            // private key
            if (bytes.length === 32) {
                const pubKey = getPublicKey(bytes, !!compressed);
                return hexlify(pubKey);
            }
            // raw public key; use uncompressed key with 0x04 prefix
            if (bytes.length === 64) {
                const pub = new Uint8Array(65);
                pub[0] = 0x04;
                pub.set(bytes, 1);
                bytes = pub;
            }
            const point = Point.fromHex(bytes);
            return hexlify(point.toRawBytes(compressed));
        }
        /**
         *  Returns the public key for the private key which produced the
         *  %%signature%% for the given %%digest%%.
         *
         *  @example:
         *    key = new SigningKey(id("some-secret"))
         *    digest = id("hello world")
         *    sig = key.sign(digest)
         *
         *    // Notice the signer public key...
         *    key.publicKey
         *    //_result:
         *
         *    // ...is equal to the recovered public key
         *    SigningKey.recoverPublicKey(digest, sig)
         *    //_result:
         *
         */
        static recoverPublicKey(digest, signature) {
            assertArgument(dataLength(digest) === 32, "invalid digest length", "digest", digest);
            const sig = Signature.from(signature);
            const der = Signature$1.fromCompact(getBytesCopy(concat([sig.r, sig.s]))).toDERRawBytes();
            const pubKey = recoverPublicKey(getBytesCopy(digest), der, sig.yParity);
            if (pubKey != null) {
                return hexlify(pubKey);
            }
            assertArgument(false, "invalid signautre for digest", "signature", signature);
        }
        /**
         *  Returns the point resulting from adding the ellipic curve points
         *  %%p0%% and %%p1%%.
         *
         *  This is not a common function most developers should require, but
         *  can be useful for certain privacy-specific techniques.
         *
         *  For example, it is used by [[HDNodeWallet]] to compute child
         *  addresses from parent public keys and chain codes.
         */
        static addPoints(p0, p1, compressed) {
            const pub0 = Point.fromHex(SigningKey.computePublicKey(p0).substring(2));
            const pub1 = Point.fromHex(SigningKey.computePublicKey(p1).substring(2));
            return "0x" + pub0.add(pub1).toHex(!!compressed);
        }
    }

    const BN_0$6 = BigInt(0);
    const BN_36 = BigInt(36);
    function getChecksumAddress(address) {
        //    if (!isHexString(address, 20)) {
        //        logger.throwArgumentError("invalid address", "address", address);
        //    }
        address = address.toLowerCase();
        const chars = address.substring(2).split("");
        const expanded = new Uint8Array(40);
        for (let i = 0; i < 40; i++) {
            expanded[i] = chars[i].charCodeAt(0);
        }
        const hashed = getBytes(keccak256(expanded));
        for (let i = 0; i < 40; i += 2) {
            if ((hashed[i >> 1] >> 4) >= 8) {
                chars[i] = chars[i].toUpperCase();
            }
            if ((hashed[i >> 1] & 0x0f) >= 8) {
                chars[i + 1] = chars[i + 1].toUpperCase();
            }
        }
        return "0x" + chars.join("");
    }
    // See: https://en.wikipedia.org/wiki/International_Bank_Account_Number
    // Create lookup table
    const ibanLookup = {};
    for (let i = 0; i < 10; i++) {
        ibanLookup[String(i)] = String(i);
    }
    for (let i = 0; i < 26; i++) {
        ibanLookup[String.fromCharCode(65 + i)] = String(10 + i);
    }
    // How many decimal digits can we process? (for 64-bit float, this is 15)
    // i.e. Math.floor(Math.log10(Number.MAX_SAFE_INTEGER));
    const safeDigits = 15;
    function ibanChecksum(address) {
        address = address.toUpperCase();
        address = address.substring(4) + address.substring(0, 2) + "00";
        let expanded = address.split("").map((c) => { return ibanLookup[c]; }).join("");
        // Javascript can handle integers safely up to 15 (decimal) digits
        while (expanded.length >= safeDigits) {
            let block = expanded.substring(0, safeDigits);
            expanded = parseInt(block, 10) % 97 + expanded.substring(block.length);
        }
        let checksum = String(98 - (parseInt(expanded, 10) % 97));
        while (checksum.length < 2) {
            checksum = "0" + checksum;
        }
        return checksum;
    }
    const Base36 = (function () {
        const result = {};
        for (let i = 0; i < 36; i++) {
            const key = "0123456789abcdefghijklmnopqrstuvwxyz"[i];
            result[key] = BigInt(i);
        }
        return result;
    })();
    function fromBase36(value) {
        value = value.toLowerCase();
        let result = BN_0$6;
        for (let i = 0; i < value.length; i++) {
            result = result * BN_36 + Base36[value[i]];
        }
        return result;
    }
    /**
     *  Returns a normalized and checksumed address for %%address%%.
     *  This accepts non-checksum addresses, checksum addresses and
     *  [[getIcapAddress]] formats.
     *
     *  The checksum in Ethereum uses the capitalization (upper-case
     *  vs lower-case) of the characters within an address to encode
     *  its checksum, which offers, on average, a checksum of 15-bits.
     *
     *  If %%address%% contains both upper-case and lower-case, it is
     *  assumed to already be a checksum address and its checksum is
     *  validated, and if the address fails its expected checksum an
     *  error is thrown.
     *
     *  If you wish the checksum of %%address%% to be ignore, it should
     *  be converted to lower-case (i.e. ``.toLowercase()``) before
     *  being passed in. This should be a very rare situation though,
     *  that you wish to bypass the safegaurds in place to protect
     *  against an address that has been incorrectly copied from another
     *  source.
     *
     *  @example:
     *    // Adds the checksum (via upper-casing specific letters)
     *    getAddress("0x8ba1f109551bd432803012645ac136ddd64dba72")
     *    //_result:
     *
     *    // Converts ICAP address and adds checksum
     *    getAddress("XE65GB6LDNXYOFTX0NSV3FUWKOWIXAMJK36");
     *    //_result:
     *
     *    // Throws an error if an address contains mixed case,
     *    // but the checksum fails
     *    getAddress("0x8Ba1f109551bD432803012645Ac136ddd64DBA72")
     *    //_error:
     */
    function getAddress(address) {
        assertArgument(typeof (address) === "string", "invalid address", "address", address);
        if (address.match(/^(0x)?[0-9a-fA-F]{40}$/)) {
            // Missing the 0x prefix
            if (!address.startsWith("0x")) {
                address = "0x" + address;
            }
            const result = getChecksumAddress(address);
            // It is a checksummed address with a bad checksum
            assertArgument(!address.match(/([A-F].*[a-f])|([a-f].*[A-F])/) || result === address, "bad address checksum", "address", address);
            return result;
        }
        // Maybe ICAP? (we only support direct mode)
        if (address.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {
            // It is an ICAP address with a bad checksum
            assertArgument(address.substring(2, 4) === ibanChecksum(address), "bad icap checksum", "address", address);
            let result = fromBase36(address.substring(4)).toString(16);
            while (result.length < 40) {
                result = "0" + result;
            }
            return getChecksumAddress("0x" + result);
        }
        assertArgument(false, "invalid address", "address", address);
    }

    // http://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed
    /**
     *  Returns the address that would result from a ``CREATE`` for %%tx%%.
     *
     *  This can be used to compute the address a contract will be
     *  deployed to by an EOA when sending a deployment transaction (i.e.
     *  when the ``to`` address is ``null``).
     *
     *  This can also be used to compute the address a contract will be
     *  deployed to by a contract, by using the contract's address as the
     *  ``to`` and the contract's nonce.
     *
     *  @example
     *    from = "0x8ba1f109551bD432803012645Ac136ddd64DBA72";
     *    nonce = 5;
     *
     *    getCreateAddress({ from, nonce });
     *    //_result:
     */
    function getCreateAddress(tx) {
        const from = getAddress(tx.from);
        const nonce = getBigInt(tx.nonce, "tx.nonce");
        let nonceHex = nonce.toString(16);
        if (nonceHex === "0") {
            nonceHex = "0x";
        }
        else if (nonceHex.length % 2) {
            nonceHex = "0x0" + nonceHex;
        }
        else {
            nonceHex = "0x" + nonceHex;
        }
        return getAddress(dataSlice(keccak256(encodeRlp([from, nonceHex])), 12));
    }

    /**
     *  Returns true if %%value%% is an object which implements the
     *  [[Addressable]] interface.
     *
     *  @example:
     *    // Wallets and AbstractSigner sub-classes
     *    isAddressable(Wallet.createRandom())
     *    //_result:
     *
     *    // Contracts
     *    contract = new Contract("dai.tokens.ethers.eth", [ ], provider)
     *    isAddressable(contract)
     *    //_result:
     */
    function isAddressable(value) {
        return (value && typeof (value.getAddress) === "function");
    }
    async function checkAddress(target, promise) {
        const result = await promise;
        if (result == null || result === "0x0000000000000000000000000000000000000000") {
            assert$1(typeof (target) !== "string", "unconfigured name", "UNCONFIGURED_NAME", { value: target });
            assertArgument(false, "invalid AddressLike value; did not resolve to a value address", "target", target);
        }
        return getAddress(result);
    }
    /**
     *  Resolves to an address for the %%target%%, which may be any
     *  supported address type, an [[Addressable]] or a Promise which
     *  resolves to an address.
     *
     *  If an ENS name is provided, but that name has not been correctly
     *  configured a [[UnconfiguredNameError]] is thrown.
     *
     *  @example:
     *    addr = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
     *
     *    // Addresses are return synchronously
     *    resolveAddress(addr, provider)
     *    //_result:
     *
     *    // Address promises are resolved asynchronously
     *    resolveAddress(Promise.resolve(addr))
     *    //_result:
     *
     *    // ENS names are resolved asynchronously
     *    resolveAddress("dai.tokens.ethers.eth", provider)
     *    //_result:
     *
     *    // Addressable objects are resolved asynchronously
     *    contract = new Contract(addr, [ ])
     *    resolveAddress(contract, provider)
     *    //_result:
     *
     *    // Unconfigured ENS names reject
     *    resolveAddress("nothing-here.ricmoo.eth", provider)
     *    //_error:
     *
     *    // ENS names require a NameResolver object passed in
     *    // (notice the provider was omitted)
     *    resolveAddress("nothing-here.ricmoo.eth")
     *    //_error:
     */
    function resolveAddress(target, resolver) {
        if (typeof (target) === "string") {
            if (target.match(/^0x[0-9a-f]{40}$/i)) {
                return getAddress(target);
            }
            assert$1(resolver != null, "ENS resolution requires a provider", "UNSUPPORTED_OPERATION", { operation: "resolveName" });
            return checkAddress(target, resolver.resolveName(target));
        }
        else if (isAddressable(target)) {
            return checkAddress(target, target.getAddress());
        }
        else if (target && typeof (target.then) === "function") {
            return checkAddress(target, target);
        }
        assertArgument(false, "unsupported addressable value", "target", target);
    }

    /**
     *  About typed...
     *
     *  @_subsection: api/abi:Typed Values
     */
    const _gaurd = {};
    function n(value, width) {
        let signed = false;
        if (width < 0) {
            signed = true;
            width *= -1;
        }
        // @TODO: Check range is valid for value
        return new Typed(_gaurd, `${signed ? "" : "u"}int${width}`, value, { signed, width });
    }
    function b(value, size) {
        // @TODO: Check range is valid for value
        return new Typed(_gaurd, `bytes${(size) ? size : ""}`, value, { size });
    }
    const _typedSymbol = Symbol.for("_ethers_typed");
    class Typed {
        type;
        value;
        #options;
        _typedSymbol;
        constructor(gaurd, type, value, options) {
            if (options == null) {
                options = null;
            }
            assertPrivate(_gaurd, gaurd, "Typed");
            defineProperties(this, { _typedSymbol, type, value });
            this.#options = options;
            // Check the value is valid
            this.format();
        }
        format() {
            if (this.type === "array") {
                throw new Error("");
            }
            else if (this.type === "dynamicArray") {
                throw new Error("");
            }
            else if (this.type === "tuple") {
                return `tuple(${this.value.map((v) => v.format()).join(",")})`;
            }
            return this.type;
        }
        defaultValue() {
            return 0;
        }
        minValue() {
            return 0;
        }
        maxValue() {
            return 0;
        }
        isBigInt() {
            return !!(this.type.match(/^u?int[0-9]+$/));
        }
        isData() {
            return this.type.startsWith("bytes");
        }
        isString() {
            return (this.type === "string");
        }
        get tupleName() {
            if (this.type !== "tuple") {
                throw TypeError("not a tuple");
            }
            return this.#options;
        }
        // Returns the length of this type as an array
        // - `null` indicates the length is unforced, it could be dynamic
        // - `-1` indicates the length is dynamic
        // - any other value indicates it is a static array and is its length
        get arrayLength() {
            if (this.type !== "array") {
                throw TypeError("not an array");
            }
            if (this.#options === true) {
                return -1;
            }
            if (this.#options === false) {
                return (this.value).length;
            }
            return null;
        }
        static from(type, value) {
            return new Typed(_gaurd, type, value);
        }
        static uint8(v) { return n(v, 8); }
        static uint16(v) { return n(v, 16); }
        static uint24(v) { return n(v, 24); }
        static uint32(v) { return n(v, 32); }
        static uint40(v) { return n(v, 40); }
        static uint48(v) { return n(v, 48); }
        static uint56(v) { return n(v, 56); }
        static uint64(v) { return n(v, 64); }
        static uint72(v) { return n(v, 72); }
        static uint80(v) { return n(v, 80); }
        static uint88(v) { return n(v, 88); }
        static uint96(v) { return n(v, 96); }
        static uint104(v) { return n(v, 104); }
        static uint112(v) { return n(v, 112); }
        static uint120(v) { return n(v, 120); }
        static uint128(v) { return n(v, 128); }
        static uint136(v) { return n(v, 136); }
        static uint144(v) { return n(v, 144); }
        static uint152(v) { return n(v, 152); }
        static uint160(v) { return n(v, 160); }
        static uint168(v) { return n(v, 168); }
        static uint176(v) { return n(v, 176); }
        static uint184(v) { return n(v, 184); }
        static uint192(v) { return n(v, 192); }
        static uint200(v) { return n(v, 200); }
        static uint208(v) { return n(v, 208); }
        static uint216(v) { return n(v, 216); }
        static uint224(v) { return n(v, 224); }
        static uint232(v) { return n(v, 232); }
        static uint240(v) { return n(v, 240); }
        static uint248(v) { return n(v, 248); }
        static uint256(v) { return n(v, 256); }
        static uint(v) { return n(v, 256); }
        static int8(v) { return n(v, -8); }
        static int16(v) { return n(v, -16); }
        static int24(v) { return n(v, -24); }
        static int32(v) { return n(v, -32); }
        static int40(v) { return n(v, -40); }
        static int48(v) { return n(v, -48); }
        static int56(v) { return n(v, -56); }
        static int64(v) { return n(v, -64); }
        static int72(v) { return n(v, -72); }
        static int80(v) { return n(v, -80); }
        static int88(v) { return n(v, -88); }
        static int96(v) { return n(v, -96); }
        static int104(v) { return n(v, -104); }
        static int112(v) { return n(v, -112); }
        static int120(v) { return n(v, -120); }
        static int128(v) { return n(v, -128); }
        static int136(v) { return n(v, -136); }
        static int144(v) { return n(v, -144); }
        static int152(v) { return n(v, -152); }
        static int160(v) { return n(v, -160); }
        static int168(v) { return n(v, -168); }
        static int176(v) { return n(v, -176); }
        static int184(v) { return n(v, -184); }
        static int192(v) { return n(v, -192); }
        static int200(v) { return n(v, -200); }
        static int208(v) { return n(v, -208); }
        static int216(v) { return n(v, -216); }
        static int224(v) { return n(v, -224); }
        static int232(v) { return n(v, -232); }
        static int240(v) { return n(v, -240); }
        static int248(v) { return n(v, -248); }
        static int256(v) { return n(v, -256); }
        static int(v) { return n(v, -256); }
        static bytes1(v) { return b(v, 1); }
        static bytes2(v) { return b(v, 2); }
        static bytes3(v) { return b(v, 3); }
        static bytes4(v) { return b(v, 4); }
        static bytes5(v) { return b(v, 5); }
        static bytes6(v) { return b(v, 6); }
        static bytes7(v) { return b(v, 7); }
        static bytes8(v) { return b(v, 8); }
        static bytes9(v) { return b(v, 9); }
        static bytes10(v) { return b(v, 10); }
        static bytes11(v) { return b(v, 11); }
        static bytes12(v) { return b(v, 12); }
        static bytes13(v) { return b(v, 13); }
        static bytes14(v) { return b(v, 14); }
        static bytes15(v) { return b(v, 15); }
        static bytes16(v) { return b(v, 16); }
        static bytes17(v) { return b(v, 17); }
        static bytes18(v) { return b(v, 18); }
        static bytes19(v) { return b(v, 19); }
        static bytes20(v) { return b(v, 20); }
        static bytes21(v) { return b(v, 21); }
        static bytes22(v) { return b(v, 22); }
        static bytes23(v) { return b(v, 23); }
        static bytes24(v) { return b(v, 24); }
        static bytes25(v) { return b(v, 25); }
        static bytes26(v) { return b(v, 26); }
        static bytes27(v) { return b(v, 27); }
        static bytes28(v) { return b(v, 28); }
        static bytes29(v) { return b(v, 29); }
        static bytes30(v) { return b(v, 30); }
        static bytes31(v) { return b(v, 31); }
        static bytes32(v) { return b(v, 32); }
        static address(v) { return new Typed(_gaurd, "address", v); }
        static bool(v) { return new Typed(_gaurd, "bool", !!v); }
        static bytes(v) { return new Typed(_gaurd, "bytes", v); }
        static string(v) { return new Typed(_gaurd, "string", v); }
        static array(v, dynamic) {
            throw new Error("not implemented yet");
        }
        static tuple(v, name) {
            throw new Error("not implemented yet");
        }
        static overrides(v) {
            return new Typed(_gaurd, "overrides", Object.assign({}, v));
        }
        /**
         *  Returns true only if %%value%% is a [[Typed]] instance.
         */
        static isTyped(value) {
            return (value && value._typedSymbol === _typedSymbol);
        }
        /**
         *  If the value is a [[Typed]] instance, validates the underlying value
         *  and returns it, otherwise returns value directly.
         *
         *  This is useful for functions that with to accept either a [[Typed]]
         *  object or values.
         */
        static dereference(value, type) {
            if (Typed.isTyped(value)) {
                if (value.type !== type) {
                    throw new Error(`invalid type: expecetd ${type}, got ${value.type}`);
                }
                return value.value;
            }
            return value;
        }
    }

    /**
     *  @_ignore
     */
    class AddressCoder extends Coder {
        constructor(localName) {
            super("address", "address", localName, false);
        }
        defaultValue() {
            return "0x0000000000000000000000000000000000000000";
        }
        encode(writer, _value) {
            let value = Typed.dereference(_value, "string");
            try {
                value = getAddress(value);
            }
            catch (error) {
                return this._throwError(error.message, _value);
            }
            return writer.writeValue(value);
        }
        decode(reader) {
            return getAddress(toBeHex(reader.readValue(), 20));
        }
    }

    /**
     *  Clones the functionality of an existing Coder, but without a localName
     *
     *  @_ignore
     */
    class AnonymousCoder extends Coder {
        coder;
        constructor(coder) {
            super(coder.name, coder.type, "_", coder.dynamic);
            this.coder = coder;
        }
        defaultValue() {
            return this.coder.defaultValue();
        }
        encode(writer, value) {
            return this.coder.encode(writer, value);
        }
        decode(reader) {
            return this.coder.decode(reader);
        }
    }

    /**
     *  @_ignore
     */
    function pack(writer, coders, values) {
        let arrayValues = [];
        if (Array.isArray(values)) {
            arrayValues = values;
        }
        else if (values && typeof (values) === "object") {
            let unique = {};
            arrayValues = coders.map((coder) => {
                const name = coder.localName;
                assert$1(name, "cannot encode object for signature with missing names", "INVALID_ARGUMENT", { argument: "values", info: { coder }, value: values });
                assert$1(!unique[name], "cannot encode object for signature with duplicate names", "INVALID_ARGUMENT", { argument: "values", info: { coder }, value: values });
                unique[name] = true;
                return values[name];
            });
        }
        else {
            assertArgument(false, "invalid tuple value", "tuple", values);
        }
        assertArgument(coders.length === arrayValues.length, "types/value length mismatch", "tuple", values);
        let staticWriter = new Writer();
        let dynamicWriter = new Writer();
        let updateFuncs = [];
        coders.forEach((coder, index) => {
            let value = arrayValues[index];
            if (coder.dynamic) {
                // Get current dynamic offset (for the future pointer)
                let dynamicOffset = dynamicWriter.length;
                // Encode the dynamic value into the dynamicWriter
                coder.encode(dynamicWriter, value);
                // Prepare to populate the correct offset once we are done
                let updateFunc = staticWriter.writeUpdatableValue();
                updateFuncs.push((baseOffset) => {
                    updateFunc(baseOffset + dynamicOffset);
                });
            }
            else {
                coder.encode(staticWriter, value);
            }
        });
        // Backfill all the dynamic offsets, now that we know the static length
        updateFuncs.forEach((func) => { func(staticWriter.length); });
        let length = writer.appendWriter(staticWriter);
        length += writer.appendWriter(dynamicWriter);
        return length;
    }
    /**
     *  @_ignore
     */
    function unpack(reader, coders) {
        let values = [];
        let keys = [];
        // A reader anchored to this base
        let baseReader = reader.subReader(0);
        coders.forEach((coder) => {
            let value = null;
            if (coder.dynamic) {
                let offset = reader.readIndex();
                let offsetReader = baseReader.subReader(offset);
                try {
                    value = coder.decode(offsetReader);
                }
                catch (error) {
                    // Cannot recover from this
                    if (isError(error, "BUFFER_OVERRUN")) {
                        throw error;
                    }
                    value = error;
                    value.baseType = coder.name;
                    value.name = coder.localName;
                    value.type = coder.type;
                }
            }
            else {
                try {
                    value = coder.decode(reader);
                }
                catch (error) {
                    // Cannot recover from this
                    if (isError(error, "BUFFER_OVERRUN")) {
                        throw error;
                    }
                    value = error;
                    value.baseType = coder.name;
                    value.name = coder.localName;
                    value.type = coder.type;
                }
            }
            if (value == undefined) {
                throw new Error("investigate");
            }
            values.push(value);
            keys.push(coder.localName || null);
        });
        return Result.fromItems(values, keys);
    }
    /**
     *  @_ignore
     */
    class ArrayCoder extends Coder {
        coder;
        length;
        constructor(coder, length, localName) {
            const type = (coder.type + "[" + (length >= 0 ? length : "") + "]");
            const dynamic = (length === -1 || coder.dynamic);
            super("array", type, localName, dynamic);
            defineProperties(this, { coder, length });
        }
        defaultValue() {
            // Verifies the child coder is valid (even if the array is dynamic or 0-length)
            const defaultChild = this.coder.defaultValue();
            const result = [];
            for (let i = 0; i < this.length; i++) {
                result.push(defaultChild);
            }
            return result;
        }
        encode(writer, _value) {
            const value = Typed.dereference(_value, "array");
            if (!Array.isArray(value)) {
                this._throwError("expected array value", value);
            }
            let count = this.length;
            if (count === -1) {
                count = value.length;
                writer.writeValue(value.length);
            }
            assertArgumentCount(value.length, count, "coder array" + (this.localName ? (" " + this.localName) : ""));
            let coders = [];
            for (let i = 0; i < value.length; i++) {
                coders.push(this.coder);
            }
            return pack(writer, coders, value);
        }
        decode(reader) {
            let count = this.length;
            if (count === -1) {
                count = reader.readIndex();
                // Check that there is *roughly* enough data to ensure
                // stray random data is not being read as a length. Each
                // slot requires at least 32 bytes for their value (or 32
                // bytes as a link to the data). This could use a much
                // tighter bound, but we are erroring on the side of safety.
                assert$1(count * WordSize <= reader.dataLength, "insufficient data length", "BUFFER_OVERRUN", { buffer: reader.bytes, offset: count * WordSize, length: reader.dataLength });
            }
            let coders = [];
            for (let i = 0; i < count; i++) {
                coders.push(new AnonymousCoder(this.coder));
            }
            return unpack(reader, coders);
        }
    }

    /**
     *  @_ignore
     */
    class BooleanCoder extends Coder {
        constructor(localName) {
            super("bool", "bool", localName, false);
        }
        defaultValue() {
            return false;
        }
        encode(writer, _value) {
            const value = Typed.dereference(_value, "bool");
            return writer.writeValue(value ? 1 : 0);
        }
        decode(reader) {
            return !!reader.readValue();
        }
    }

    /**
     *  @_ignore
     */
    class DynamicBytesCoder extends Coder {
        constructor(type, localName) {
            super(type, type, localName, true);
        }
        defaultValue() {
            return "0x";
        }
        encode(writer, value) {
            value = getBytesCopy(value);
            let length = writer.writeValue(value.length);
            length += writer.writeBytes(value);
            return length;
        }
        decode(reader) {
            return reader.readBytes(reader.readIndex(), true);
        }
    }
    /**
     *  @_ignore
     */
    class BytesCoder extends DynamicBytesCoder {
        constructor(localName) {
            super("bytes", localName);
        }
        decode(reader) {
            return hexlify(super.decode(reader));
        }
    }

    /**
     *  @_ignore
     */
    class FixedBytesCoder extends Coder {
        size;
        constructor(size, localName) {
            let name = "bytes" + String(size);
            super(name, name, localName, false);
            defineProperties(this, { size }, { size: "number" });
        }
        defaultValue() {
            return ("0x0000000000000000000000000000000000000000000000000000000000000000").substring(0, 2 + this.size * 2);
        }
        encode(writer, _value) {
            let data = getBytesCopy(Typed.dereference(_value, this.type));
            if (data.length !== this.size) {
                this._throwError("incorrect data length", _value);
            }
            return writer.writeBytes(data);
        }
        decode(reader) {
            return hexlify(reader.readBytes(this.size));
        }
    }

    const Empty = new Uint8Array([]);
    /**
     *  @_ignore
     */
    class NullCoder extends Coder {
        constructor(localName) {
            super("null", "", localName, false);
        }
        defaultValue() {
            return null;
        }
        encode(writer, value) {
            if (value != null) {
                this._throwError("not null", value);
            }
            return writer.writeBytes(Empty);
        }
        decode(reader) {
            reader.readBytes(0);
            return null;
        }
    }

    const BN_0$5 = BigInt(0);
    const BN_1$1 = BigInt(1);
    const BN_MAX_UINT256$1 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
    /**
     *  @_ignore
     */
    class NumberCoder extends Coder {
        size;
        signed;
        constructor(size, signed, localName) {
            const name = ((signed ? "int" : "uint") + (size * 8));
            super(name, name, localName, false);
            defineProperties(this, { size, signed }, { size: "number", signed: "boolean" });
        }
        defaultValue() {
            return 0;
        }
        encode(writer, _value) {
            let value = getBigInt(Typed.dereference(_value, this.type));
            // Check bounds are safe for encoding
            let maxUintValue = mask(BN_MAX_UINT256$1, WordSize * 8);
            if (this.signed) {
                let bounds = mask(maxUintValue, (this.size * 8) - 1);
                if (value > bounds || value < -(bounds + BN_1$1)) {
                    this._throwError("value out-of-bounds", _value);
                }
                value = toTwos(value, 8 * WordSize);
            }
            else if (value < BN_0$5 || value > mask(maxUintValue, this.size * 8)) {
                this._throwError("value out-of-bounds", _value);
            }
            return writer.writeValue(value);
        }
        decode(reader) {
            let value = mask(reader.readValue(), this.size * 8);
            if (this.signed) {
                value = fromTwos(value, this.size * 8);
            }
            return value;
        }
    }

    /**
     *  @_ignore
     */
    class StringCoder extends DynamicBytesCoder {
        constructor(localName) {
            super("string", localName);
        }
        defaultValue() {
            return "";
        }
        encode(writer, _value) {
            return super.encode(writer, toUtf8Bytes(Typed.dereference(_value, "string")));
        }
        decode(reader) {
            return toUtf8String(super.decode(reader));
        }
    }

    /**
     *  @_ignore
     */
    class TupleCoder extends Coder {
        coders;
        constructor(coders, localName) {
            let dynamic = false;
            const types = [];
            coders.forEach((coder) => {
                if (coder.dynamic) {
                    dynamic = true;
                }
                types.push(coder.type);
            });
            const type = ("tuple(" + types.join(",") + ")");
            super("tuple", type, localName, dynamic);
            defineProperties(this, { coders: Object.freeze(coders.slice()) });
        }
        defaultValue() {
            const values = [];
            this.coders.forEach((coder) => {
                values.push(coder.defaultValue());
            });
            // We only output named properties for uniquely named coders
            const uniqueNames = this.coders.reduce((accum, coder) => {
                const name = coder.localName;
                if (name) {
                    if (!accum[name]) {
                        accum[name] = 0;
                    }
                    accum[name]++;
                }
                return accum;
            }, {});
            // Add named values
            this.coders.forEach((coder, index) => {
                let name = coder.localName;
                if (!name || uniqueNames[name] !== 1) {
                    return;
                }
                if (name === "length") {
                    name = "_length";
                }
                if (values[name] != null) {
                    return;
                }
                values[name] = values[index];
            });
            return Object.freeze(values);
        }
        encode(writer, _value) {
            const value = Typed.dereference(_value, "tuple");
            return pack(writer, this.coders, value);
        }
        decode(reader) {
            return unpack(reader, this.coders);
        }
    }

    /**
     *  A simple hashing function which operates on UTF-8 strings to
     *  compute an 32-byte irentifier.
     *
     *  This simply computes the [UTF-8 bytes](toUtf8Bytes) and computes
     *  the [[keccak256]].
     *
     *  @example:
     *    id("hello world")
     *    //_result:
     */
    function id(value) {
        return keccak256(toUtf8Bytes(value));
    }

    function decode_arithmetic(bytes) {
    	let pos = 0;
    	function u16() { return (bytes[pos++] << 8) | bytes[pos++]; }
    	
    	// decode the frequency table
    	let symbol_count = u16();
    	let total = 1;
    	let acc = [0, 1]; // first symbol has frequency 1
    	for (let i = 1; i < symbol_count; i++) {
    		acc.push(total += u16());
    	}

    	// skip the sized-payload that the last 3 symbols index into
    	let skip = u16();
    	let pos_payload = pos;
    	pos += skip;

    	let read_width = 0;
    	let read_buffer = 0; 
    	function read_bit() {
    		if (read_width == 0) {
    			// this will read beyond end of buffer
    			// but (undefined|0) => zero pad
    			read_buffer = (read_buffer << 8) | bytes[pos++];
    			read_width = 8;
    		}
    		return (read_buffer >> --read_width) & 1;
    	}

    	const N = 31;
    	const FULL = 2**N;
    	const HALF = FULL >>> 1;
    	const QRTR = HALF >> 1;
    	const MASK = FULL - 1;

    	// fill register
    	let register = 0;
    	for (let i = 0; i < N; i++) register = (register << 1) | read_bit();

    	let symbols = [];
    	let low = 0;
    	let range = FULL; // treat like a float
    	while (true) {
    		let value = Math.floor((((register - low + 1) * total) - 1) / range);
    		let start = 0;
    		let end = symbol_count;
    		while (end - start > 1) { // binary search
    			let mid = (start + end) >>> 1;
    			if (value < acc[mid]) {
    				end = mid;
    			} else {
    				start = mid;
    			}
    		}
    		if (start == 0) break; // first symbol is end mark
    		symbols.push(start);
    		let a = low + Math.floor(range * acc[start]   / total);
    		let b = low + Math.floor(range * acc[start+1] / total) - 1;
    		while (((a ^ b) & HALF) == 0) {
    			register = (register << 1) & MASK | read_bit();
    			a = (a << 1) & MASK;
    			b = (b << 1) & MASK | 1;
    		}
    		while (a & ~b & QRTR) {
    			register = (register & HALF) | ((register << 1) & (MASK >>> 1)) | read_bit();
    			a = (a << 1) ^ HALF;
    			b = ((b ^ HALF) << 1) | HALF | 1;
    		}
    		low = a;
    		range = 1 + b - a;
    	}
    	let offset = symbol_count - 4;
    	return symbols.map(x => { // index into payload
    		switch (x - offset) {
    			case 3: return offset + 0x10100 + ((bytes[pos_payload++] << 16) | (bytes[pos_payload++] << 8) | bytes[pos_payload++]);
    			case 2: return offset + 0x100 + ((bytes[pos_payload++] << 8) | bytes[pos_payload++]);
    			case 1: return offset + bytes[pos_payload++];
    			default: return x - 1;
    		}
    	});
    }	

    // returns an iterator which returns the next symbol
    function read_payload(v) {
    	let pos = 0;
    	return () => v[pos++];
    }
    function read_compressed_payload(s) {
    	return read_payload(decode_arithmetic(unsafe_atob(s)));
    }

    // unsafe in the sense:
    // expected well-formed Base64 w/o padding 
    function unsafe_atob(s) {
    	let lookup = [];
    	[...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'].forEach((c, i) => lookup[c.charCodeAt(0)] = i);
    	let n = s.length;
    	let ret = new Uint8Array((6 * n) >> 3);
    	for (let i = 0, pos = 0, width = 0, carry = 0; i < n; i++) {
    		carry = (carry << 6) | lookup[s.charCodeAt(i)];
    		width += 6;
    		if (width >= 8) {
    			ret[pos++] = (carry >> (width -= 8));
    		}
    	}
    	return ret;
    }

    // eg. [0,1,2,3...] => [0,-1,1,-2,...]
    function signed(i) { 
    	return (i & 1) ? (~i >> 1) : (i >> 1);
    }

    function read_deltas(n, next) {
    	let v = Array(n);
    	for (let i = 0, x = 0; i < n; i++) v[i] = x += signed(next());
    	return v;
    }

    // [123][5] => [0 3] [1 1] [0 0]
    function read_sorted(next, prev = 0) {
    	let ret = [];
    	while (true) {
    		let x = next();
    		let n = next();
    		if (!n) break;
    		prev += x;
    		for (let i = 0; i < n; i++) {
    			ret.push(prev + i);
    		}
    		prev += n + 1;
    	}
    	return ret;
    }

    function read_sorted_arrays(next) {
    	return read_array_while(() => { 
    		let v = read_sorted(next);
    		if (v.length) return v;
    	});
    }

    // returns map of x => ys
    function read_mapped(next) {
    	let ret = [];
    	while (true) {
    		let w = next();
    		if (w == 0) break;
    		ret.push(read_linear_table(w, next));
    	}
    	while (true) {
    		let w = next() - 1;
    		if (w < 0) break;
    		ret.push(read_replacement_table(w, next));
    	}
    	return ret.flat();
    }

    // read until next is falsy
    // return array of read values
    function read_array_while(next) {
    	let v = [];
    	while (true) {
    		let x = next(v.length);
    		if (!x) break;
    		v.push(x);
    	}
    	return v;
    }

    // read w columns of length n
    // return as n rows of length w
    function read_transposed(n, w, next) {
    	let m = Array(n).fill().map(() => []);
    	for (let i = 0; i < w; i++) {
    		read_deltas(n, next).forEach((x, j) => m[j].push(x));
    	}
    	return m;
    }
     
    // returns [[x, ys], [x+dx, ys+dy], [x+2*dx, ys+2*dy], ...]
    // where dx/dy = steps, n = run size, w = length of y
    function read_linear_table(w, next) {
    	let dx = 1 + next();
    	let dy = next();
    	let vN = read_array_while(next);
    	let m = read_transposed(vN.length, 1+w, next);
    	return m.flatMap((v, i) => {
    		let [x, ...ys] = v;
    		return Array(vN[i]).fill().map((_, j) => {
    			let j_dy = j * dy;
    			return [x + j * dx, ys.map(y => y + j_dy)];
    		});
    	});
    }

    // return [[x, ys...], ...]
    // where w = length of y
    function read_replacement_table(w, next) { 
    	let n = 1 + next();
    	let m = read_transposed(n, 1+w, next);
    	return m.map(v => [v[0], v.slice(1)]);
    }

    // created 2023-01-26T08:54:35.886Z
    var r = read_compressed_payload('AEIRrQh1DccBuQJ+APkBMQDiASoAnADQAHQAngBmANQAaACKAEQAgwBJAHcAOQA9ACoANQAmAGMAHgAvACgAJQAWACwAGQAjAB8ALwAVACgAEQAdAAkAHAARABgAFwA7ACcALAAtADcAEwApABAAHQAfABAAGAAeABsAFwAUBLoF3QEXE7k3ygXaALgArkYBbgCsCAPMAK6GNjY2NjFiAQ0ODBDyAAQHRgbrOAVeBV8APTI5B/a9GAUNz8gAFQPPBeelYALMCjYCjqgCht8/lW+QAsXSAoP5ASbmEADytAFIAjSUCkaWAOoA6QocAB7bwM8TEkSkBCJ+AQQCQBjED/IQBjDwDASIbgwDxAeuBzQAsgBwmO+snIYAYgaaAioG8AAiAEIMmhcCqgLKQiDWCMIwA7gCFAIA9zRyqgCohB8AHgQsAt4dASQAwBnUBQEQIFM+CZ4JjyUiIVbATOqDSQAaABMAHAAVclsAKAAVAE71HN89+gI5X8qc5jUKFyRfVAJfPfMAGgATABwAFXIgY0CeAMPyACIAQAzMFsKqAgHavwViBekC0KYCxLcCClMjpGwUehp0TPwAwhRuAugAEjQ0kBfQmAKBggETIgDEFG4C6AASNAFPUCyYTBEDLgIFMBDecB60Ad5KAHgyEn4COBYoAy4uwD5yAEDoAfwsAM4OqLwBImqIALgMAAwCAIraUAUi3HIeAKgu2AGoBgYGBgYrNAOiAG4BCiA+9Dd7BB8eALEBzgIoAgDmMhJ6OvpQtzOoLjVPBQAGAS4FYAVftr8FcDtkQhlBWEiee5pmZqH/EhoDzA4s+H4qBKpSAlpaAnwisi4BlqqsPGIDTB4EimgQANgCBrJGNioCBzACQGQAcgFoJngAiiQgAJwBUL4ALnAeAbbMAz40KEoEWgF2YAZsAmwA+FAeAzAIDABQSACyAABkAHoAMrwGDvr2IJSGBgAQKAAwALoiTgHYAeIOEjiXf4HvABEAGAA7AEQAPzp3gNrHEGYQYwgFTRBMc0EVEgKzD60L7BEcDNgq0tPfADSwB/IDWgfyA1oDWgfyB/IDWgfyA1oDWgNaA1ocEfAh2scQZg9PBHQFlQWSBN0IiiZQEYgHLwjZVBR0JRxOA0wBAyMsSSM7mjMSJUlME00KCAM2SWyufT8DTjGyVPyQqQPSMlY5cwgFHngSpwAxD3ojNbxOhXpOcacKUk+1tYZJaU5uAsU6rz//CigJmm/Cd1UGRBAeJ6gQ+gw2AbgBPg3wS9sE9AY+BMwfgBkcD9CVnwioLeAM8CbmLqSAXSP4KoYF8Ev3POALUFFrD1wLaAnmOmaBUQMkARAijgrgDTwIcBD2CsxuDegRSAc8A9hJnQCoBwQLFB04FbgmE2KvCww5egb+GvkLkiayEyx6/wXWGiQGUAEsGwIA0i7qhbNaNFwfT2IGBgsoI8oUq1AjDShAunhLGh4HGCWsApRDc0qKUTkeliH5PEANaS4WUX8H+DwIGVILhDyhRq5FERHVPpA9SyJMTC8EOIIsMieOCdIPiAy8fHUBXAkkCbQMdBM0ERo3yAg8BxwwlycnGAgkRphgnQT6ogP2E9QDDgVCCUQHFgO4HDATMRUsBRCBJ9oC9jbYLrYCklaDARoFzg8oH+IQU0fjDuwIngJoA4Yl7gAwFSQAGiKeCEZmAGKP21MILs4IympvI3cDahTqZBF2B5QOWgeqHDYVwhzkcMteDoYLKKayCV4BeAmcAWIE5ggMNV6MoyBEZ1aLWxieIGRBQl3/AjQMaBWiRMCHewKOD24SHgE4AXYHPA0EAnoR8BFuEJgI7oYHNbgz+zooBFIhhiAUCioDUmzRCyom/Az7bAGmEmUDDzRAd/FnrmC5JxgABxwyyEFjIfQLlU/QDJ8axBhFVDEZ5wfCA/Ya9iftQVoGAgOmBhY6UDPxBMALbAiOCUIATA6mGgfaGG0KdIzTATSOAbqcA1qUhgJykgY6Bw4Aag6KBXzoACACqgimAAgA0gNaADwCsAegABwAiEQBQAMqMgEk6AKSA5YINM4BmDIB9iwEHsYMGAD6Om5NAsO0AoBtZqUF4FsCkQJMOAFQKAQIUUpUA7J05ADeAE4GFuJKARiuTc4d5kYB4nIuAMoA/gAIOAcIRAHQAfZwALoBYgs0CaW2uAFQ7CwAhgAYbgHaAowA4AA4AIL0AVYAUAVc/AXWAlJMARQ0Gy5aZAG+AyIBNgEQAHwGzpCozAoiBHAH1gIQHhXkAu8xB7gEAyLiE9BCyAK94VgAMhkKOwqqCqlgXmM2CTR1PVMAER+rPso/UQVUO1Y7WztWO1s7VjtbO1Y7WztWO1sDmsLlwuUKb19IYe4MqQ3XRMs6TBPeYFRgNRPLLboUxBXRJVkZQBq/Jwgl51UMDwct1mYzCC80eBe/AEIpa4NEY4keMwpOHOpTlFT7LR4AtEulM7INrxsYREMFSnXwYi0WEQolAmSEAmJFXlCyAF43IwKh+gJomwJmDAKfhzgeDgJmPgJmKQRxBIIDfxYDfpU5CTl6GjmFOiYmAmwgAjI5OA0CbcoCbbHyjQI2akguAWoA4QDkAE0IB5sMkAEBDsUAELgCdzICdqVCAnlORgJ4vSBf3kWxRvYCfEICessCfQwCfPNIA0iAZicALhhJW0peGBpKzwLRBALQz0sqA4hSA4fpRMiRNQLypF0GAwOxS9FMMCgG0k1PTbICi0ICitvEHgogRmoIugKOOgKOX0OahAKO3AKOX3tRt1M4AA1S11SIApP+ApMPAOwAH1UhVbJV0wksHimYiTLkeGlFPjwCl6IC77VYJKsAXCgClpICln+fAKxZr1oMhFAAPgKWuAKWUVxHXNQCmc4CmWdczV0KHAKcnjnFOqACnBkCn54CnruNACASNC0SAp30Ap6VALhAYTdh8gKe1gKgcQGsAp6iIgKeUahjy2QqKC4CJ7ICJoECoP4CoE/aAqYyAqXRAqgCAIACp/Vof2i0AAZMah9q1AKs5gKssQKtagKtBQJXIAJV3wKx5NoDH1FsmgKywBACsusabONtZm1LYgMl0AK2Xz5CbpMDKUgCuGECuUoYArktenA5cOQCvRwDLbUDMhQCvotyBQMzdAK+HXMlc1ICw84CwwdzhXROOEh04wM8qgADPJ0DPcICxX8CxkoCxhOMAshsVALIRwLJUgLJMQJkoALd1Xh8ZHixeShL0wMYpmcFAmH3GfaVJ3sOXpVevhQCz24Cz28yTlbV9haiAMmwAs92ASztA04Vfk4IAtwqAtuNAtJSA1JfA1NiAQQDVY+AjEIDzhnwY0h4AoLRg5AC2soC2eGEE4RMpz8DhqgAMgNkEYZ0XPwAWALfaALeu3Z6AuIy7RcB8zMqAfSeAfLVigLr9gLpc3wCAur8AurnAPxKAbwC7owC65+WrZcGAu5CA4XjmHxw43GkAvMGAGwDjhmZlgL3FgORcQOSigL3mwL53AL4aZofmq6+OpshA52GAv79AR4APJ8fAJ+2AwWQA6ZtA6bcANTIAwZtoYuiCAwDDEwBIAEiB3AGZLxqCAC+BG7CFI4ethAAGng8ACYDNrIDxAwQA4yCAWYqJACM8gAkAOamCqKUCLoGIqbIBQCuBRjCBfAkREUEFn8Fbz5FRzJCKEK7X3gYX8MAlswFOQCQUyCbwDstYDkYutYONhjNGJDJ/QVeBV8FXgVfBWoFXwVeBV8FXgVfBV4FXwVeBV9NHAjejG4JCQkKa17wMgTQA7gGNsLCAMIErsIA7kcwFrkFTT5wPndCRkK9X3w+X+8AWBgzsgCNBcxyzAOm7kaBRC0qCzIdLj08fnTfccH4GckscAFy13U3HgVmBXHJyMm/CNZQYgcHBwqDXoSSxQA6P4gAChbYBuy0KgwAjMoSAwgUAOVsJEQrJlFCuELDSD8qXy5gPS4/KgnIRAUKSz9KPn8+iD53PngCkELDUElCX9JVVnFUETNyWzYCcQASdSZf5zpBIgluogppKjJDJC1CskLDMswIzANf0BUmNRAPEAMGAQYpfqTfcUE0UR7JssmzCWzI0tMKZ0FmD+wQqhgAk5QkTEIsG7BtQM4/Cjo/Sj53QkYcDhEkU05zYjM0Wui8GQqE9CQyQkYcZA9REBU6W0pJPgs7SpwzCogiNEJGG/wPWikqHzc4BwyPaPBlCnhk0GASYDQqdQZKYCBACSIlYLoNCXIXbFVgVBgIBQZk7mAcYJxghGC6YFJgmG8WHga8FdxcsLxhC0MdsgHCMtTICSYcByMKJQGAAnMBNjecWYcCAZEKv04hAOsqdJUR0RQErU3xAaICjqNWBUdmAP4ARBEHOx1egRKsEysmwbZOAFYTOwMAHBO+NVsC2RJLbBEiAN9VBnwEESVhADgAvQKhLgsWdrIgAWIBjQoDA+D0FgaxBlEGwAAky1ywYRC7aBOQCy1GDsIBwgEpCU4DYQUvLy8nJSYoMxktDSgTlABbAnVel1CcCHUmBA94TgHadRbVWCcgsLdN8QcYBVNmAP4ARBEHgQYNK3MRjhKsPzc0zrZdFBIAZsMSAGpKblAoIiLGADgAvQKhLi1CFdUClxiCAVDCWM90eY7epaIO/KAVRBvzEuASDQ8iAwHOCUEQmgwXMhM9EgBCALrVAQkAqwDoAJuRNgAbAGIbzTVzfTEUyAIXCUIrStroIyUSG4QCggTIEbHxcwA+QDQOrT8u1agjB8IQABBBLtUYIAB9suEjD8IhThzUqHclAUQqZiMC8qAPBFPz6x9sDMMNAQhDCkUABccLRAJSDcIIww1DLtWoMQrDCUMPkhroBCIOwgyYCCILwhZCAKcQwgsFGKd74wA7cgtCDEMAAq0JwwUi1/UMBQ110QaCAAfCEmIYEsMBCADxCAAAexViDRbSG/x2F8IYQgAuwgLyqMIAHsICXCcxhgABwgAC6hVDFcIr8qPCz6hCCgKlJ1IAAmIA5+QZwqViFb/LAPsaggioBRH/dwDfwqfCGOIBGsKjknl5BwKpoooAEsINGxIAA5oAbcINAAvCp0IIGkICwQionNEPAgfHqUIFAOGCL71txQNPAAPyABXCAAcCAAnCAGmSABrCAA7CCRjCjnAWAgABYgAOcgAuUiUABsIAF8IIKAANUQC6wi0AA8IADqIq8gCyYQAcIgAbwgAB8gqoAAXNCxwV4gAHogBCwgEJAGnCAAuCAB3CAAjCCagABdEAbqYZ3ACYCCgABdEAAUIAB+IAHaIIKAAGoQAJggAbMgBtIgDmwocACGIACEIAFMIDAGkCCSgABtEA45IACUILqA7L+2YAB0IAbqNATwBOAArCCwADQgAJtAM+AAciABmCAAISpwIACiIACkIACgKn8gbCAAkiAAMSABBCBwAUQgARcgAPkgAN8gANwgAZEg0WIgAVQgBuoha6AcIAwQATQgBpMhEA4VIAAkIABFkAF4IFIgAG1wAYwgQlAYIvWQBATAC2DwcUDHkALzF3AasMCGUCcyoTBgQQDnZSc2YxkCYFhxsFaTQ9A6gKuwYI3wAdAwIKdQF9eU5ZGygDVgIcRQEzBgp6TcSCWYFHADAAOAgAAgAAAFoR4gCClzMBMgB97BQYOU0IUQBeDAAIVwEOkdMAf0IEJ6wAYQDdHACcbz4mkgDUcrgA1tsBHQ/JfHoiH10kENgBj5eyKVpaVE8ZQ8mQAAAAhiM+RzAy5xieVgB5ATAsNylJIBYDN1wE/sz1AFJs4wBxAngCRhGBOs54NTXcAgEMFxkmCxsOsrMAAAMCBAICABnRAgAqAQAFBQUFBQUEBAQEBAQDBAUGBwgDBAQEBAMBASEAigCNAJI8AOcAuADZAKFDAL8ArwCqAKUA6wCjANcAoADkAQUBAADEAH4AXwDPANEBAADbAO8AjQCmAS4A5wDcANkKAAgOMTrZ2dnZu8Xh0tXTSDccAU8BWTRMAVcBZgFlAVgBSVBISm0SAVAaDA8KOT0SDQAmEyosLjE9Pz9CQkJDRBNFBSNWVlZWWFhXWC5ZWlxbWyJiZmZlZ2Ypa211dHd3d3d3d3l5eXl5eXl5eXl5e3t8e3phAEPxAEgAmQB3ADEAZfcAjQBWAFYANgJz7gCKAAT39wBjAJLxAJ4ATgBhAGP+/q8AhACEAGgAVQCwACMAtQCCAj0CQAD7AOYA/QD9AOcA/gDoAOgA5wDlAC4CeAFQAT8BPQFTAT0BPQE9ATgBNwE3ATcBGwFXFgAwDwcAAFIeER0KHB0VAI0AlQClAFAAaR8CMAB1AG4AlgMSAyQxAx5IRU4wAJACTgDGAlYCoQC/ApMCkwKTApMCkwKTAogCkwKTApMCkwKTApMCkgKSApUCnQKUApMCkwKRApECkQKQAnIB0QKUApoCkwKTApIbfhACAPsKA5oCXgI3HAFRFToC3RYPMBgBSzwYUpYBeKlBAWZeAQIDPEwBAwCWMB4flnEAMGcAcAA1AJADm8yS8LWLYQzBMhXJARgIpNx7MQsEKmEBuQDkhYeGhYeFiImJhYqNi4WMj42HjomPiZCFkYWShZORlIWVhZaJl4WYhZmFmoWbipyPnYmehQCJK6cAigRCBD8EQQREBEIESARFBEAERgRIBEcEQwRFBEgAqgOOANBYANYCEwD9YQD9ASAA/QD7APsA/AD72wOLKmzFAP0A+wD7APwA+yMAkGEA/QCQASAA/QCQAvMA/QCQ2wOLKmzFIwD+YQEgAP0A/QD7APsA/AD7AP4A+wD7APwA+9sDiypsxSMAkGEBIAD9AJAA/QCQAvMA/QCQ2wOLKmzFIwJKAT0CUQFAAlLIA6UC8wOl2wOLKmzFIwCQYQEgA6UAkAOlAJAC8wOlAJDbA4sqbMUjBDcAkAQ4AJANlDh0JwEzAJAHRXUKKgEEAM1hCQBbYQAFGjkJAJAJRN8AUAkAkAkAnW0/6mOd3brkH5dB9mNQ/eNThoJ1CP8EZzy46pMulzRpOAZDJDXL2yXaVtAh1MxM82zfnsL/FXSaOaxJlgv345IW0Dfon3fzkx0WByY6wfCroENsWq/bORcfBvtlWbGzP5ju+gqE1DjyFssbkkSeqLAdrCkLOfItA7XNe1PctDPFKoNd/aZ6IQq6JTB6IrDBZ5/nJIbTHMeaaIWRoDvc42ORs9KtvcQWZd+Nv1D2C/hrzaOrFUjpItLWRI4x3GmzQqZbVH5LoCEJpk3hzt1pmM7bPitwOPG8gTKLVFszSrDZyLmfq8LkwkSUhIQlN4nFJUEhU2N7NBTOGk4Y2q9A2M7ps8jcevOKfycp9u3DyCe9hCt7i5HV8U5pm5LnVnKnyzbIyAN/LU4aqT3JK+e9JsdusAsUCgAuCnc4IwbgPBg4EPGOv5gR8D+96c8fLb09f7L6ON2k+Zxe/Y0AYoZIZ8yuu1At7f70iuSFoFmyPpwDU/4lQ+mHkFmq/CwtE7A979KNdD8zaHSx4HoxWsM8vl+2brNxN0QtIUvOfNGAYyv1R5DaM1JAR0C+Ugp6/cNq4pUDyDPKJjFeP4/L1TBoOJak3PVlmDCi/1oF8k1mnzTCz15BdAvmFjQrjide74m2NW1NG/qRrzhbNwwejlhnPfRn4mIfYmXzj5Fbu3C2TUpnYg+djp65dxZJ8XhwUqJ8JYrrR4WtrHKdKjz0i77K+QitukOAZSfFIwvBr1GKYpSukYTqF4gNtgaNDqh78ZDH4Qerglo3VpTLT0wOglaX6bDNhfs04jHVcMfCHwIb+y5bAaBvh2RARFYEjxjr1xTfU09JEjdY1vfcPrPVmnBBSDPj9TcZ1V/Dz8fvy0WLWZM0JPbRL0hLSPeVoC8hgQIGaeE6AYVZnnqm62/wt00pDl5Nw/nDo+bF1tC4qo5DryXVn8ffL3kuT51e+VcBTGiibvP+vqX50dppfxyNORSr48S5WXV8fzcsgjRQH6zjl+nuUYFVloiEnZOPDpHD/7ILh3JuFCdvAi2ANXYXjTDA5Up6YLihbc7d+dBlI9+mdgr8m8+3/Dp26W/Jssn7b9/pOEP4i+/9TsPI9m2NfNKwEI35mqKV+HpZ+W69Y8sM/sIA9Ltvhd+evQTUUfSkYxki28/CBT0cT96HrlrSrE+V9RzhskX0CsDsCfHffBVybkxmHOFOgaUurWNQ2AcZbi1WjkZzYArWZBHFd1SYwtqQ0DIZt7OV40ewQxCr/LgxAc8dLJeAJFseWJq9XiOp21hLv/HhsFbYbg3zCR8JmonZjhuKYrS/KJc30vnOL2CM+GfogNWug2DstZPzauCNeeD8zlP8wxPyfLHYQB/J+wQE3aDpXH/5tdIQpLn3JXNJYZFiXInGB7FqxRxHYJ/re/lHprE5sngUMm11uOIA3bbtkk06I8DYxuwPD+e4sAeNfor0DkWmiCQFiNptkmiD2xGO1kIKGr/Tuu4bHe6z2NaS7Ih0c+Gpv+QbLY9ea122BXNSitM41sxUSlnWl+uJBIFoLqt66v/VfGIQos2lzhOOLDuScVxcyrqH3/FI4vaYB0b8gFHLXtxyX/9JpUCYNwlLZ1v5CeB99l0F795R5wl5UHRq1OYyKqsoIY07wJz2CT0TOf5/JRBPtJIIk5pOJ60SHayS9kMSKbI3fLLYztsY3B4MlSyoEfc9gL4yJVrPo+OGGunCK4p15UbCArJP/PQgUWDW4l+2P/tCqRRy2flIZL/nVeY/vyAfILUM5qEGfcFXXXrAit7skwDEFnD7mL1ATtyrz7HcodhzP7gShFhazIPm7X0+mTCeSWfrOr5WcvJfip19JRRLfXjuQpQjcNCuXo8kqkxQ68ukJQoxlnfjevc0WcKnGpUvyY54eJTS1IRWDqfHANukJLw56ts5yS6Nea7IrL6/78aKmZsch4Q694ujxgx5+0PhlGpzWimajpvkBOOUQlHLkJorzqu4e768L9nJtZWYturb7dsBxjzlNhd/gZcBuRgIUSdgZjg7Rx+f/zLcs4mAa3qDbJNUQVNbSg+dm0L3KH1uhesTPaErVYjZ8Isvfr+zfiX3DT0PlaOv+hdGvLUIlKSEcYHPMs0NtTGzyqMe74yciNFdAVZVzol/XtLsEqivKqfW7zWTCNCvZkPnnBlMv3UHW5RNNEJfuyR3MvYH/9E6gcts5GAwKIgCaBQ+V2Eh9O0IJkxFksPI1V9obqDKCpmPM55mLd+VQgRqgD+9XvsUxjbh/AXXPxOpc0FXFyJzc85aa1VQZa90LAWR4oinrBaOBr8DymCpFbdXMTn7Cv18S0hMR7T/o5VkRqN1g1/dvaDdZsRArO3bopkfee4efLF+hyVdcX4u3aNGTkWvLRafW+sXPktA1lla4UkSB7uJIULfxy/RAflk2miyw9xq9uVGgCNzqCv4iX+AUchfMkZdEgRZ9TZ+1CPTH2jXjMXjFl/+bEPzSjM7zPKKWhyZUgQG1lpp+DNz+Zz+85kD59q99U5R4B3vuI9WenCWqroy2U2Ruq6I+di5N/v9SmYnqJ5H1HLWCbIg6iVrn3s2gFBVFhrc1zzNqoFe275K3Jy1T0Mc5yeE1iRwO2b1L/j/S8jyvGDz6B3NMFEHErGHMM2+oJ5LobazyWEitdgMjQnsd0cjYrCqRpx8idpfwRq6hz/LleX6obpuJh/AGIu4sxD35hwkIEr5ShH8xro7tTDYK1GPHGylK6rp7NCG0lMr7YqwziMUBwXv0zPW667f3/IRLJRD7mkuwUP6mpkxyVjNlcBiAX12r//+WTuzWxsue7bsjRp7xFjpR2tRLqGHLvjYt3TpeybR82K61iLn+pOSWDfUv/HU8ecBtML+Gbz0v9vmlxSgZeBBzbGeP1KSqsH14ZM2kibgDhbS21hIALSOYFCE9LY+2CNvtzT2QuSJMiKP3zwvvs+/JkDwTg0jHVE0XH//U0nu5HKQtCL2KGDQYUgT7qIMVN/OoWqEz1oeG4wG7InZg47NE7rfHB2i7rkpYCUzaPfVtDYgTEPNpa8gXHI2Pp8A6YB8OYHkXDZMMcOL3rJD0Hxk+mRlsSJ12/7T52IcFst5zRc7uDJtQTXBdm9GvsvyXcBbMfKXWqsDSeEnFyPUXZGTafti4a0it8SN1qXxzBmzj+gVZ/FojNy+x73AuuqtJ/oaMZF6m5kbW6ItpfnUT/BrQunS+gLjTTUz0d8jTMpAfFQ40RQi9uM5qdFYzqk85hqSH1zsPOhiO5CN+hNZvL/RIs7m7LyLDuV80ZtyHHqVEngTVPBctHQhmcPjM30m1veDmHCXEpjybWAbgj3TqLUPNazzdHgxYmNuT7trWFcGOi7iTeL5YeK2yp2H98yoLN+skqhffZI/5n/ivceo44wJRY8bzC6DGwdgkMOulYhzW5m6OKyK2Mg+E3YE19L8ngE08TdAuNu0mIzd6kw0i03zzm4oqfVSZjZyxXnBhvt0v89EmnArya/UvHQrdQxBDAJagK2y+OqgBqzQ4FnUeiKfb7HFoUvFSknWhwq58TpBlVRZ0B0A7QWz7X4GLHcbdh5kFI/PKJ91OEh/kmnMEdh+Z23myFH8sXjR/KaHttrpz80N+bl0HM17RX48UjUWslrYHYW7oiHVgcGqTBoTrqK4JYwTTArFO1/APJ8DnEYf+wD92Dw15a9wrPxyJA88yYcv9RypzXLKAWmMuE0KAtIGjfKx1GbRQIq0AkttuRpBO7p4SGrTZuAOat3hTxXEcIKh3HgC1d88K7bz1+Jsi+y7tL/7zc0ZxCBB3hSxvP90GkUp1Lm2wuESafZyFy4Opir+o3gMWtDSuLF3LRHXTUGkKQtvARnwam8BuKv8Q2fHH/cEwPCQd3dhzgri8eTezRsQoGz6ha+S4E7ZzDB/LXwl04vA70NeVsf5rmv1TLvcQSNIBk3U6Qh6Bm+0905B91hopTLnTJRWZkUmbckEw0woG81azyw6LZaBL5Qx2HPvd3LHGLpN6mPZlto50NwW2zFOkgoPKV1gr142teD9aok2HNkPMepl3NIi78ShnAlJCzjZplteUoqz0+iUEOym1LZGGFHMBkc6/5f+sRCCFZZW6KrEby64o/ZfefQAPP6b5ko2fuujIv7uonIKXN6XiJsZmcOeGxteQ+b/ope3Z1HFeXYoW1AJrU/OiCpsyQP1Pr1BdQKFzS0oYnLCAweSnIh7qMFMRBMY7BcnJ5oskUbbRNiosqMzCYUAZPbo8tjCCsCBm5SoGcTHBMXcE+yQpl/OfBkcTw3oa4X7V+ohEh/Zkcv0cqc8sY40IsOW6lLiIrvYND/exZbRlOMgaHvb/QQKaY0k6Aamee2o3LVARCbIP4RoSd7u3CXkG+Iz6iFLfsN38F9xU4n3ueeVgiRs3jw70SMWu1QzDdiLsKtU1qvaLhv7dUbnLimdqYG+pa2aRZ8A6Q9JSr3yTs1MiAvfFHPQJTiqpI/hVUMmL6gPj6eL7lH0IkLCNcaogBA0TGfO0wO6ddf8Fju0L3YbRrWe8J3IewsNBCbpC2b6etQRJnSGLuWDiFoBez9hJHw6+bMQQGQS8YV/kzQ5AFHEqPaMgOjyR5zaHtlOBI4mjo8gdNItHUHQ7Bzq/E/xV1B+L0uoRcLIEj4hcv0yWQTwWLHzoFrvEZPygABpc4rnVjhfcBw5wOvaVVtgiG5qjklrTY1ZaXHkasyVYBd+lgo6zEHMumfK8XR2eD0cVn5w8l1uxGz2ACwtFob/CTV/TUx1kCKp+QROanLrNBiSPTxAf1eOFE+JifgAJ+pyrFqS/0wKlPWUVKlB2Bhu1Ggx2cvfdiR49VIsgBNnE75pf5lpFaQuz8+VPreUd/HLlW8kDSr25AnETsVRrOycLBPYD9/j/7Z0KKdOjtrM71AT+VsjD3D97aUDP5WrHp1DWghsk/lS/hp2VMwo0eqoEerLL/4/SlmyjStwWVDqF6jHC89niCwr1tMSe8GxeC9wjzMKmE7ZtdHOWqqc1OoTI24eVQc++crbyxSU4TxiB+vWoaAUpYQxZ06KKIPq6EvN/rN4DZ0/tQWYVqZ3FTIftPBfIuOWX3PonIKTUArpSvfmQRpkWD00wc3AQS98i4ZYaUbI+DGv90tuEKRjb2ocfdddC21YGUATYQmzelz7JqWBAQqKrWYdWEJlfPeRFZHtUm2MaISZsoOvURowxJKveGRegmBiKZ3d1cMFioJL33RoIKT0eDeK8FH/ybAhZU5TQIsWYmjyeT7EOLL5xZuRPf4qRIo6bbLtFOV6SX60fR8Smys/u1D5DjkmHJyr/woVAvBP2dxGo9gH1LgIm8XlFF1KSYvfj+0w7aTEfoFpcO+Jv3Ssbv8wwkED5JEC+jdln2dzToPNRtWiPbRb8f8G4aZX1j/2Vdbu7jM3gAVD5BKR+yJaOwLtwJodwjWu5di47tnNs9ahpnCUzVMObQfbTqMNs64MGANlgyihKjhwZ6p1Jsnro0/SfkOk6wx+HgUB6Mz9cUiF7KrJkhxnOVjCCcqPZglIojIRoDtkd2AkLNZC88GdP2qZV/1N6PBAe+fpgWZ36oHnewQ8CHdXcxbwQVjOn8U3qD9+e7FzWpg135vgdEMZ9fH5agDnNzdjKFZQ4tDsJs/S6Lk8FqjFJpHMjaRU6FI/DBDM0g+RRkxNoUvm14JAn5dgd6aVHt1aMkSXiJVenbm2FfrIEaFKHtm1erv1BJ5056ULL8AMGLmHav4yxg6F6n5oBq7bdP6zEr6f+QTDJ/KE1XfoG24JvVk2GL7Fb+me27otVFnq1e/2wEuqv6X+2zLQuJQszy5YJi/M5888fMy34L6z8ykD5sCHgzliAoAtEeoaFmnPT63kOYrZWspxYzqQBu/QKNyQ8e4QwKJUCVazmIUp6/zpLA3bWH2ch7QZN0rzWGxMRl3K1osWeETxL95TZSG/atM8LB9B92/71+g9UGWDPfD+lu/KdOQ85rocuHe91/gHA/iprG9PZ2juX49kaRxZ+1/sB3Ck35eWYBFsmCl0wC4QZWX5c5QMuSAEz1CJj0JWArSReV4D/vrgLw+EyhBB6aA4+B34PdlDaTLpm9q9Pkl+bzVWrSO+7uVrIECzsvk8RcmfmNSJretRcoI7ZcIfAqwciU9nJ8O4u1EgkcMOzC/MM2l6OYZRrGcqXCitp4LPXruVPzeD402JGV9grZyz9wJolMLC/YCcWs9CjiWv+DNRLaoSgD5M8T4PzmG8cXYM4jPo5SG1wY3QK/4wzVPrc33wI+AcGI//yXgvyBjocGrl768DMaYCGglwIit4r6t6ulwhwHJ4KeV3VHjspXXG4DIlDR2HNFvPaqkBViIvr433qZPuUINp6oi1LyVVC+EE1j6+wab8uPMeAo6e9uWYequvZynhnYazrvrDQJVkK3KZRoSR5BHi6vOC+AVCujMiQ1GVzGDZ4RFv8jFm7z5CU0iPH2JeXqUzqaKKP4P7osPkcIL99Y7fP3l+TzeFXO2kSpLIJW51oEY8DRIhqexGnxj0nmtGOseStuViIE2mJge45LENf77xjuI7egRNpzthNiajnuqikg0aQS1JqlIZf+hwSUlOp8BEQ0y3xiTOJkohBP3eyYiPDlZpFY88EWOpp4+hC/tQdhrQ56h2VJ2XA6vhPAbj+wH6iA2XYuTvRV25N8wNPQuA0Vzzem2ADZPFK2vr8l0I3GTV3fUN4S6FFYygW2Pu98f+lsgPf67rwVCbgMFAACW3P10GbxnK3SNuNK+VlPRiL7U3dK1o3spH/MFfDkgXuXjxDTxJrYctqHdwUg4rhUCNA13lGjuhJDatpFb/mExsBWS46aLFtROqVm8xQNPXK6A2rRfazJSWpIyh+FMmorXPXYnHQ7YLOmD4B5QTI8rzp7OomiarnaFs5syYjQ0ucc7g1/JzT446IFlDtpUL7DP9bLRCLJryUvi5R71/qX7ycqRSwunQ7+tfJz44Na3aJNszaMEZ/BV4iOGopabYdmvAPe+kIdGCNq5Q8fg8Ld0VNNXV0ZiiGej7zSA+pexy6wKC5k4rZa0k+qaN8bKq3oJWMQCSGaK7PrwMvA8t8BZTzjDqXcFTAIeRtl0SdlGSuAziVXItFcgAkeqwuNsbsrUZFcU6KUZLmvG415kHa0AwMFW2cNSUvPR0U9iCPh0nyslT92B5slYXiDWeSXvxHXItvjI8z5KCIVTIHqGZsbDBTr7WdHzcUAI1ipR86H3o0p2wPhfp7xg9oWOxWIK4a5BWdaV9OAPc0XuvlbwitCVtZDzZxGhIOl77ZgrRYR7LZQFE+Ih23hW3gI914ekkjgbKCi2bsqSAvij6GGj5p+k6evQtJp3qVh9vg+jiJvFCGcKBCITMWpqHZNKfE6IT0dKntS0rhu0DB5D9qIS0/RboNLsx2DlRMlx1QIBeBpHJNKdCL9uWM9eS7RJXKNOpraULtutuJYOl0apdE4LxfsyRSZb6fJkd51SHrI7lLB4vEg4fifJ1dqcWSeY4DgcyjrUcymK+gd3o+qj+3gHKWlLVdMUr3IeF8aClYBq+eeCV9Y7n1Ye8yL7rEvxY7jAlLwucKQ51pu59N8we8XwrbXPChBHXP4LnD3kDwQ85w1DKghtwvpO609fZOrPq8Q7GOOAjHhfR5VqvpoFne8oMHbCrWb1L0IdATo+h1PFeLLI8wc+FEyftLvskCdOtxKfAx3IEJXzBfWTKq5viKP/uu99dxnEpoNJhRtjSZGwOTWr7Ys44++P58O+nkYxd1Gcqm8G3Gh7AHSCxiPNyJWijI/lECrKrAXgBqkRShvdkd7IfoqUlziFDiglx+jdHnmRVmGnk3p/3n78M/HkzFUGZOS07cPnPn9jAnBWl4qDrB1ECf9idIKOdkJTKcZ690nuLW2yDsqwNpgrlT+wx2gv+Engha74lfVqbwqS15FRwuFDfq3bVCZcPy78TL2pH/DOdHeL9MFAtyybQNwHaO781rnJZAhR4M+AYWoSoa0EjQ99xivreM+FKwd7Jp/FC2vvvcq1z3RnRau/BM5KGkBPBSUBOzTNdfaJS/PWTDb1jRSgn2MuY3pVZbY9peHBVI3Ce/u70hg4f7MCVeAjYJfzTkDVLuB6jyjZs5Kko3u39ozgLK4LuwSbUrNIU5cl6Bs3De62AE084XRsm64Gs5W1ofxsWIZ9cYl8PNa5zQHl9ls5aiIKN0rHIIzBnLr03Kle2qq+n/gLDAzvF89vdZCvUFEHRoi9n33O3i49UWyeHP+ZAeRf+psM867nfqON092zE4Pj7AbLtvIUFJFr1y9Le0CL2flc7LUqbgGzOw4/q3vA/cJO5JeI8S+8bc1Y7pqYSzoEWSFn5G7EoPHTGHPMU6SeLKEeli+i8dHY3lWxSrIOU2y0TNo1SeRYewhVx05OXeVDf0xhHNckqp0arRk+bgToeSaHbVZ5nj3IH3m2oayt3sXY78qSPcDpc/5C7VXDRj6bROvvBG5JCsKl/yeMPAUn1flMsmr/FaFdb7gVUXnhLa+/Ilj87PpCC6rILQ6wkIP1ywEg0PztSEzbsJoRwQzDaxkiTN27YDnsy/YKfe6jKcqZWs64skzUAHIt+nXxju0dUVtbCSDAUXYw78Yd4bJKuYU8gbzLzgL4XIUC2HcPIVCUYvM7cybOBFVBdeGR4cOVB7QbGnohTRpiPrGqi1a8QXFBYqENawROuR43OG8dl+Jx4TpwAoi2kkPXW7b/ARSs4DO/z4H6oTIUpN3+/K6Iuc49C4/Uf1NxQTEE91VP8RnLKTpxjywMe2VxM1l4YGXSFY80HUAKIdqczBnnLMPklFV8mrr5hFDypn5TAT00ruU6AjDPNvncoVzX4ac6wAzTwrNH7oz1XLH1wzjQs5k7hcNLbznXQGB7M+rXxKtZXPrz1Ar+OxYGDkJvElknZsHD/IcxRd7ujmmLYpDDbverynroCnSKVQWEGjHL57PaI/WokvhYRpPMk4ni2EUhjDuIF+IU2R0fs40i+66bw8sz8OzyC2eFAxxicd2n5Juta2eWa9KtObD7xLmPvtK+8cjQt+NLjcZCTt+Ss9p1od0bklVgaIV1qJbWxUOr6iUzLDzFefYxAtyRcBr53IaDB25n60KQdhroQWMUpuWSUpELSFxiu4vgQeRoEZe78/ua3TlrszB8sLVZoecnV9YMYz+HkZA/pLqbFhzurB52Wl/WEM6sVk4q04OnzWZFi76JkcGgeeUyYUIwhCDMdIfTUdD4wQpYm3LBw0sp33CVK2q305jeyzgGnBzSMXjesm4XjcEhhrjPSLtwqqoaFCqD5DlHYhoTVafWtBUQXoNfDk19IFxq8sImCcqgMhOToIZUO2530aasY908dMX2nTMFjgv+lapdI8k/e0a7pFw6X3Tgf0m99bbCpOzVgRu2Dw/13CehVfFj+8BeKP6SZV4g/qiX42NWP568PzMajFm2ANmKtHjEIAIc2hc1iecBR9elGP4LmAQwAVmZT8kWc7JSY0ag583ch/Z16krGrjn2YdIaa22egy4/niU6m0WAG3K/yP65cfL//CP+JzcnoLHQFb/KJQeBrEbR1/IKo+YOFXWIQ8ghNxYdMwa49NeXzFqFOIXTmk3w/v5KneS8sGHiPGACh0DE9a1uLAochB79g3IqYObhlswemMucZnAE7dBkp5OAfToa5gHFbIPcec0fVWEOOLftQXsuffyv3wo1LWDDm+SyNMWgSEWtjMyYkjLjTkUtmj7DQlfbpHf38lDvoEN9d2ALxnWCjph4jvfEIRbHvltKbvE2BiYlz45mnJPeFrwZcBny3k0/pyXNrSbEIWvvZw14Y0Fqy4tba1Fu0yNNYaf47jfnz7VCCxKsrJz5oz3F8jXUdQqFu+gDq6EzvKDipXf/3NmcsCC74VB3OgHPgN7W9cU54pjGFDMfifl3m5Vhy21uk1U2nYCrddrifkpwGLYmLSSQAAjC6M3yB1fc6KHpgDnMXh2bYX2ns+Qma+DBgyCkZ0TqZK8Mp2Sryx7HdMM74X9hrwYhQbwlK+zgATAXRzQyS+hK4OTnP17/cyJ2WzY6DChYWGJYXGCnEdMswF5VTYQdSyTpdLXYuh+x2Qr7DR3H2x+YdP0qsLAzYJIWKwrrKkpBgWCmgNCn5t+QbWqf/LoLuvjgDFLtMoxNK5axIA9kammelvwh5ZI52ktrEm/OVEESPQPZGHAIhP7oWDBnGnuzG45XOTpZWsxwNO4UiyxH8riTvQq4JVq5GwX3yqVCbSR0ef/gVYDgiYaiD2EAAxuEPKyXTp/HhL96eVTpaDqFEoV2x1PP/UMcs/XqeGc1gZQG1ot6YxaIEWHanYavH9YdLFjlyU5yrYALVg/sxBjT39oD+BIXvf4LTbvvvpX3srxckEX1XAM9s2uajUTlpPq32mcx4T+sibdQEHQV2WmgwMhbYovh7WWTPfLF03ZbV5a+ElsSIyH6kgJ8+D6aN/6f+ZstkZOYZYx9GbagcrEqwNblz0iZ9NTyvIAeNn3Oup7rtyD4wVE0PoqcnR/LoSK1s1esmOGPjs3zHB8xW4iL8IrhqAJfsWNBYW9TGR11C3KZJaN7MP4O5Ykmpvw94hHzVmsYA68RQdFYfPlFOgCNBoSdy5ODcv11l9bLs135M4okEc4/e8hQczcz2PWipIVSBxa/5sr9xyTFbjG4xm8f4LmrAhD1uEDGrFDl/6X7Nw7/WZPW7fZJGYN8eZ68Td5KGfJyKjD+pTysvTi+8Q8R0L9wKAxAUrYswdvAuiNeenxSplQZjYTxbcH/wP97fOY215SozY3UDRhv7lomztURB2O2UriTX3oAiTKoInkHQietZyhBQ9wMTVHgMrxOP5T/0gN14eFTz0m2D6/iJMbXYGHdIkKEGV2Voa8k/hVNvAVAZKrDEXthUxotwYkYysTDk8j27XEVy+4a30jopuAp5+/xWYb0ne6lwKZwR3j6kDXroOOtrHqWlkJHSWLoPEQJQo/ARzR8UBZSckmeBPn3gJwY62Zo2dyy1AyRRDQBFAJKH9KX+7auP8U8XDo7mMSzq5ZxmaJ5bLpNg4ZM7938SAjMHcu1yB4+lkHnVLnIp86AOPgigH+ZFDRq1QuKWK3pK5JkLDJdakj176NCbjXDASt1h/t1p+GHyKbAoevHSnHuPfoBmQ3nJrDjOhPfwVYi8V5r0KB8BsrfFu8BvhYCbNrvCVnd4Q8RktqIR/ZilioC6g3++L7PHzuXa8NFSF5zd+ISzGLTjrfaKXsBFCkkK0ksSDbl91yXUghMFOskQBeUoo7o3wuIsE29goRIORuJ4b1jSumvR0gR8B21iyW1G4FqHkZOlWz9zq5FnaJX1WbeAxe2DfGSAnw4cqDwg3LFalk6eH89Sdc41Fr6voEa0hfwdkb54yOM7WevDugT1FRzEqdg9zZZ44ZAKGH3ZyqFve3SE4UDN6tLmIFTdIwMrtYRXWBQDB7vvqOuYj7cN31av64+jg/g1uce+am3TOl0cUUL6s0l35FJ9p8vJcG+G8lAFqC0pdmd/aaWYpqDLvB5LEasLMgbPN2N+Wvkh6HYxPOrZEfoxQX/67AzcWOR0K3eYGOgQhyWL7cwKGlxmY/E2b8CKi6Ssgok+7B+zTtq/DXmaDAHRnwbwvCDJ9pITO5RQgBuprEWT0avZv7QjbzITYD8Fzgy4TSYG3z9tLso0Z7MfgHDLKU+kHrzxWkBPwJRydKMXG4AaCA7mlAmjzpNhGOrMGZGZlHSjPbmO5jPd/lKBrViZ0BaXMmqaFOwA/f03O04qQX6MSVA37+SA5Pne/KP7caLJKuOCJXoXpzArUrYesMVc/RXnOv03YrwKgPlR2SjpqIycyulmodZBy6gVc1jA9y6lJqWgR6SY6tc24sVcYuh2GaTeikYJnhr2d6BiL3oLx8M8wuJBdI3FRVIIAx4XougScOw2xWgwUoSYKeLUHc310kVBzSE/vFeHAjlUil8KZftctMgwGjwrhMbjDbK4rB32fTe9jnsqijdp5kOwkD9+klel+lNh3joAFQ');
    const FENCED = new Map([[8217,"apostrophe"],[8260,"fraction slash"],[12539,"middle dot"]]);

    function hex_cp(cp) {
    	return cp.toString(16).toUpperCase().padStart(2, '0');
    }

    function quote_cp(cp) {
    	return `{${hex_cp(cp)}}`; // raffy convention: like "\u{X}" w/o the "\u"
    }

    /*
    export function explode_cp(s) {
    	return [...s].map(c => c.codePointAt(0));
    }
    */
    function explode_cp(s) { // this is about 2x faster
    	let cps = [];
    	for (let pos = 0, len = s.length; pos < len; ) {
    		let cp = s.codePointAt(pos);
    		pos += cp < 0x10000 ? 1 : 2;
    		cps.push(cp);
    	}
    	return cps;
    }

    function str_from_cps(cps) {
    	const chunk = 4096;
    	let len = cps.length;
    	if (len < chunk) return String.fromCodePoint(...cps);
    	let buf = [];
    	for (let i = 0; i < len; ) {
    		buf.push(String.fromCodePoint(...cps.slice(i, i += chunk)));
    	}
    	return buf.join('');
    }

    // reverse polyfill

    function nf(cps, form) {
    	return explode_cp(str_from_cps(cps).normalize(form));
    }

    function nfc(cps) {
    	return nf(cps, 'NFC');
    }
    function nfd(cps) {
    	return nf(cps, 'NFD');
    }
    const FE0F = 0xFE0F;
    const STOP_CH = '.';
    const UNIQUE_PH = 1;
    const HYPHEN = 0x2D;

    function read_set() {
    	return new Set(read_sorted(r));
    }
    const MAPPED = new Map(read_mapped(r)); 
    const IGNORED = read_set(); // ignored characters are not valid, so just read raw codepoints
    /*
    // direct include from payload is smaller that the decompression code
    const FENCED = new Map(read_array_while(() => {
    	let cp = r();
    	if (cp) return [cp, read_str(r())];
    }));
    */
    const CM = read_set();
    const ESCAPE = read_set(); // characters that should not be printed
    read_set();
    const CHUNKS = read_sorted_arrays(r);
    function read_chunked() {
    	// deduplicated sets + uniques
    	return new Set([read_sorted(r).map(i => CHUNKS[i]), read_sorted(r)].flat(2));
    }
    const UNRESTRICTED = r();
    const GROUPS = read_array_while(i => {
    	// minifier property mangling seems unsafe
    	// so these are manually renamed to single chars
    	let N = read_array_while(r).map(x => x+0x60);
    	if (N.length) {
    		let R = i >= UNRESTRICTED; // first arent restricted
    		N[0] -= 32; // capitalize
    		N = str_from_cps(N);
    		if (R) N=`Restricted[${N}]`;
    		let P = read_chunked(); // primary
    		let Q = read_chunked(); // secondary
    		let V = [...P, ...Q].sort((a, b) => a-b); // derive: sorted valid
    		let M = r()-1; // combining mark
    		// code currently isn't needed
    		/*if (M < 0) { // whitelisted
    			M = new Map(read_array_while(() => {
    				let i = r();
    				if (i) return [V[i-1], read_array_while(() => {
    					let v = read_array_while(r);
    					if (v.length) return v.map(x => x-1);
    				})];
    			}));
    		}*/
    		return {N, P, M, R, V: new Set(V)};
    	}
    });
    const WHOLE_VALID = read_set();
    const WHOLE_MAP = new Map();
    // decode compressed wholes
    [...WHOLE_VALID, ...read_set()].sort((a, b) => a-b).map((cp, i, v) => {
    	let d = r(); 
    	let w = v[i] = d ? v[i-d] : {V: [], M: new Map()};
    	w.V.push(cp); // add to member set
    	if (!WHOLE_VALID.has(cp)) {
    		WHOLE_MAP.set(cp, w);  // register with whole map
    	}
    });
    // compute confusable-extent complements
    for (let {V, M} of new Set(WHOLE_MAP.values())) {
    	// connect all groups that have each whole character
    	let recs = [];
    	for (let cp of V) {
    		let gs = GROUPS.filter(g => g.V.has(cp));
    		let rec = recs.find(({G}) => gs.some(g => G.has(g)));
    		if (!rec) {
    			rec = {G: new Set(), V: []};
    			recs.push(rec);
    		}
    		rec.V.push(cp);
    		gs.forEach(g => rec.G.add(g));
    	}
    	// per character cache groups which are not a member of the extent
    	let union = recs.flatMap(({G}) => [...G]);
    	for (let {G, V} of recs) {
    		let complement = new Set(union.filter(g => !G.has(g)));
    		for (let cp of V) {
    			M.set(cp, complement);
    		}
    	}
    }
    let union = new Set(); // exists in 1+ groups
    let multi = new Set(); // exists in 2+ groups
    for (let g of GROUPS) {
    	for (let cp of g.V) {
    		(union.has(cp) ? multi : union).add(cp);
    	}
    }
    // dual purpose WHOLE_MAP: return placeholder if unique non-confusable
    for (let cp of union) {
    	if (!WHOLE_MAP.has(cp) && !multi.has(cp)) {
    		WHOLE_MAP.set(cp, UNIQUE_PH);
    	}
    }
    const VALID = new Set([...union, ...nfd(union)]); // possibly valid

    // decode emoji
    const EMOJI_SORTED = read_sorted(r);
    //const EMOJI_SOLO = new Set(read_sorted(r).map(i => EMOJI_SORTED[i])); // not needed
    const EMOJI_ROOT = read_emoji_trie([]);
    function read_emoji_trie(cps) {
    	let B = read_array_while(() => {
    		let keys = read_sorted(r).map(i => EMOJI_SORTED[i]);
    		if (keys.length) return read_emoji_trie(keys);
    	}).sort((a, b) => b.Q.size - a.Q.size); // sort by likelihood
    	let temp = r();
    	let V = temp % 3; // valid (0 = false, 1 = true, 2 = weird)
    	temp = (temp / 3)|0;
    	let F = temp & 1; // allow FE0F
    	temp >>= 1;
    	let S = temp & 1; // save
    	let C = temp & 2; // check
    	return {B, V, F, S, C, Q: new Set(cps)};
    }
    //console.log(performance.now() - t0);

    // free tagging system
    class Emoji extends Array {
    	get is_emoji() { return true; }
    }

    // create a safe to print string 
    // invisibles are escaped
    // leading cm uses placeholder
    function safe_str_from_cps(cps, quoter = quote_cp) {
    	//if (Number.isInteger(cps)) cps = [cps];
    	//if (!Array.isArray(cps)) throw new TypeError(`expected codepoints`);
    	let buf = [];
    	if (is_combining_mark(cps[0])) buf.push('◌');
    	let prev = 0;
    	let n = cps.length;
    	for (let i = 0; i < n; i++) {
    		let cp = cps[i];
    		if (should_escape(cp)) {
    			buf.push(str_from_cps(cps.slice(prev, i)));
    			buf.push(quoter(cp));
    			prev = i + 1;
    		}
    	}
    	buf.push(str_from_cps(cps.slice(prev, n)));
    	return buf.join('');
    }

    // if escaped: {HEX}
    //       else: "x" {HEX}
    function quoted_cp(cp) {
    	return (should_escape(cp) ? '' : `"${safe_str_from_cps([cp])}" `) + quote_cp(cp);
    }

    function check_label_extension(cps) {
    	if (cps.length >= 4 && cps[2] == HYPHEN && cps[3] == HYPHEN) {
    		throw new Error('invalid label extension');
    	}
    }
    function check_leading_underscore(cps) {
    	const UNDERSCORE = 0x5F;
    	for (let i = cps.lastIndexOf(UNDERSCORE); i > 0; ) {
    		if (cps[--i] !== UNDERSCORE) {
    			throw new Error('underscore allowed only at start');
    		}
    	}
    }
    // check that a fenced cp is not leading, trailing, or touching another fenced cp
    function check_fenced(cps) {
    	let cp = cps[0];
    	let prev = FENCED.get(cp);
    	if (prev) throw error_placement(`leading ${prev}`);
    	let n = cps.length;
    	let last = -1;
    	for (let i = 1; i < n; i++) {
    		cp = cps[i];
    		let match = FENCED.get(cp);
    		if (match) {
    			if (last == i) throw error_placement(`${prev} + ${match}`);
    			last = i + 1;
    			prev = match;
    		}
    	}
    	if (last == n) throw error_placement(`trailing ${prev}`);
    }

    // note: set(s) cannot be exposed because they can be modified
    function is_combining_mark(cp) {
    	return CM.has(cp);
    }
    function should_escape(cp) {
    	return ESCAPE.has(cp);
    }

    function ens_normalize(name) {
    	return flatten(ens_split(name));
    }

    function ens_split(name, preserve_emoji) {
    	let offset = 0;
    	// https://unicode.org/reports/tr46/#Validity_Criteria 4.1 Rule 4
    	// "The label must not contain a U+002E ( . ) FULL STOP."
    	return name.split(STOP_CH).map(label => {
    		let input = explode_cp(label);
    		let info = {
    			input,
    			offset, // codepoint, not substring!
    		};
    		offset += input.length + 1; // + stop
    		let norm;
    		try {
    			let tokens = info.tokens = process(input, nfc); // if we parse, we get [norm and mapped]
    			let token_count = tokens.length;
    			let type;
    			if (!token_count) { // the label was effectively empty (could of had ignored characters)
    				// 20230120: change to strict
    				// https://discuss.ens.domains/t/ens-name-normalization-2nd/14564/59
    				//norm = [];
    				//type = 'None'; // use this instead of next match, "ASCII"
    				throw new Error(`empty label`);
    			} else {
    				let chars = tokens[0];
    				let emoji = token_count > 1 || chars.is_emoji;
    				if (!emoji && chars.every(cp => cp < 0x80)) { // special case for ascii
    					norm = chars;
    					check_leading_underscore(norm);
    					// only needed for ascii
    					// 20230123: matches matches WHATWG, see note 3.3
    					check_label_extension(norm);
    					// cant have fenced
    					// cant have cm
    					// cant have wholes
    					// see derive: assert ascii fast path
    					type = 'ASCII';
    				} else {
    					if (emoji) { // there is at least one emoji
    						info.emoji = true; 
    						chars = tokens.flatMap(x => x.is_emoji ? [] : x); // all of the nfc tokens concat together
    					}
    					norm = tokens.flatMap(x => !preserve_emoji && x.is_emoji ? filter_fe0f(x) : x);
    					check_leading_underscore(norm);
    					if (!chars.length) { // theres no text, just emoji
    						type = 'Emoji';
    					} else {
    						if (CM.has(norm[0])) throw error_placement('leading combining mark');
    						for (let i = 1; i < token_count; i++) { // we've already checked the first token
    							let cps = tokens[i];
    							if (!cps.is_emoji && CM.has(cps[0])) { // every text token has emoji neighbors, eg. EtEEEtEt...
    								throw error_placement(`emoji + combining mark: "${str_from_cps(tokens[i-1])} + ${safe_str_from_cps([cps[0]])}"`);
    							}
    						}
    						check_fenced(norm);
    						let unique = [...new Set(chars)];
    						let [g] = determine_group(unique); // take the first match
    						// see derive: "Matching Groups have Same CM Style"
    						// alternative: could form a hybrid type: Latin/Japanese/...	
    						check_group(g, chars); // need text in order
    						check_whole(g, unique); // only need unique text (order would be required for multiple-char confusables)
    						type = g.N;
    						// 20230121: consider exposing restricted flag
    						// it's simpler to just check for 'Restricted'
    						// or even better: type.endsWith(']')
    						//if (g.R) info.restricted = true;
    					}
    				}
    			}
    			info.type = type;
    		} catch (err) {
    			info.error = err; // use full error object
    		}
    		info.output = norm;
    		return info;
    	});
    }

    function check_whole(group, unique) {
    	let maker;
    	let shared = []; // TODO: can this be avoided?
    	for (let cp of unique) {
    		let whole = WHOLE_MAP.get(cp);
    		if (whole === UNIQUE_PH) return; // unique, non-confusable
    		if (whole) {
    			let set = whole.M.get(cp); // groups which have a character that look-like this character
    			maker = maker ? maker.filter(g => set.has(g)) : [...set];
    			if (!maker.length) return; // confusable intersection is empty
    		} else {
    			shared.push(cp); 
    		}
    	}
    	if (maker) {
    		// we have 1+ confusable
    		// check if any of the remaning groups
    		// contain the shared characters too
    		for (let g of maker) {
    			if (shared.every(cp => g.V.has(cp))) {
    				throw new Error(`whole-script confusable: ${group.N}/${g.N}`);
    			}
    		}
    	}
    }

    // assumption: unique.size > 0
    // returns list of matching groups
    function determine_group(unique) {
    	let groups = GROUPS;
    	for (let cp of unique) {
    		// note: we need to dodge CM that are whitelisted
    		// but that code isn't currently necessary
    		let gs = groups.filter(g => g.V.has(cp));
    		if (!gs.length) {
    			if (groups === GROUPS) {
    				// the character was composed of valid parts
    				// but it's NFC form is invalid
    				throw error_disallowed(cp); // this should be rare
    			} else {
    				// there is no group that contains all these characters
    				// throw using the highest priority group that matched
    				// https://www.unicode.org/reports/tr39/#mixed_script_confusables
    				throw error_group_member(groups[0], cp);
    			}
    		}
    		groups = gs;
    		if (gs.length == 1) break; // there is only one group left
    	}
    	// there are at least 1 group(s) with all of these characters
    	return groups;
    }

    // throw on first error
    function flatten(split) {
    	return split.map(({input, error, output}) => {
    		if (error) {
    			// don't print label again if just a single label
    			let msg = error.message;
    			throw new Error(split.length == 1 ? msg : `Invalid label "${safe_str_from_cps(input)}": ${msg}`);
    		}
    		return str_from_cps(output);
    	}).join(STOP_CH);
    }


    function error_disallowed(cp) {
    	// TODO: add cp to error?
    	return new Error(`disallowed character: ${quoted_cp(cp)}`); 
    }
    function error_group_member(g, cp) {
    	let quoted = quoted_cp(cp);
    	let gg = GROUPS.find(g => g.P.has(cp));
    	if (gg) {
    		quoted = `${gg.N} ${quoted}`;
    	}
    	return new Error(`illegal mixture: ${g.N} + ${quoted}`);
    }
    function error_placement(where) {
    	return new Error(`illegal placement: ${where}`);
    }

    // assumption: cps.length > 0
    // assumption: cps[0] isn't a CM
    function check_group(g, cps) {
    	let {V, M} = g;
    	for (let cp of cps) {
    		if (!V.has(cp)) {
    			throw error_group_member(g, cp);
    		}
    	}
    	if (M >= 0) {
    		// we know it can't be cm leading
    		// we know the previous character isn't an emoji
    		let decomposed = nfd(cps);
    		for (let i = 1, e = decomposed.length; i < e; i++) {
    			if (CM.has(cps[i])) {
    				let j = i + 1;
    				while (j < e && CM.has(cps[j])) j++;
    				if (j - i > M) {
    					throw new Error(`too many combining marks: ${g.N} "${str_from_cps(cps.slice(i-1, j))}" (${j-i}/${M})`);
    				}
    				i = j;
    			}
    		}
    	}
    	// *** this code currently isn't needed ***
    	/*
    	let cm_whitelist = M instanceof Map;
    	for (let i = 0, e = cps.length; i < e; ) {
    		let cp = cps[i++];
    		let seqs = cm_whitelist && M.get(cp);
    		if (seqs) { 
    			// list of codepoints that can follow
    			// if this exists, this will always be 1+
    			let j = i;
    			while (j < e && CM.has(cps[j])) j++;
    			let cms = cps.slice(i, j);
    			let match = seqs.find(seq => !compare_arrays(seq, cms));
    			if (!match) throw new Error(`disallowed combining mark sequence: "${safe_str_from_cps([cp, ...cms])}"`);
    			i = j;
    		} else if (!V.has(cp)) {
    			// https://www.unicode.org/reports/tr39/#mixed_script_confusables
    			let quoted = quoted_cp(cp);
    			for (let cp of cps) {
    				let u = UNIQUE.get(cp);
    				if (u && u !== g) {
    					// if both scripts are restricted this error is confusing
    					// because we don't differentiate RestrictedA from RestrictedB 
    					if (!u.R) quoted = `${quoted} is ${u.N}`;
    					break;
    				}
    			}
    			throw new Error(`disallowed ${g.N} character: ${quoted}`);
    			//throw new Error(`disallowed character: ${quoted} (expected ${g.N})`);
    			//throw new Error(`${g.N} does not allow: ${quoted}`);
    		}
    	}
    	if (!cm_whitelist) {
    		let decomposed = nfd(cps);
    		for (let i = 1, e = decomposed.length; i < e; i++) { // we know it can't be cm leading
    			if (CM.has(cps[i])) {
    				let j = i + 1;
    				while (j < e && CM.has(cps[j])) j++;
    				if (j - i > M) {
    					throw new Error(`too many combining marks: "${str_from_cps(cps.slice(i-1, j))}" (${j-i}/${M})`);
    				}
    				i = j;
    			}
    		}
    	}
    	*/
    }

    // given a list of codepoints
    // returns a list of lists, where emoji are a fully-qualified (as Array subclass)
    // eg. explode_cp("abc💩d") => [[61, 62, 63], Emoji[1F4A9, FE0F], [64]]
    function process(input, nf) {
    	let ret = [];
    	let chars = [];
    	input = input.slice().reverse(); // flip so we can pop
    	while (input.length) {
    		let emoji = consume_emoji_reversed(input);
    		if (emoji) {
    			if (chars.length) {
    				ret.push(nf(chars));
    				chars = [];
    			}
    			ret.push(emoji);
    		} else {
    			let cp = input.pop();
    			if (VALID.has(cp)) {
    				chars.push(cp);
    			} else {
    				let cps = MAPPED.get(cp);
    				if (cps) {
    					chars.push(...cps);
    				} else if (!IGNORED.has(cp)) {
    					throw error_disallowed(cp);
    				}
    			}
    		}
    	}
    	if (chars.length) {
    		ret.push(nf(chars));
    	}
    	return ret;
    }

    function filter_fe0f(cps) {
    	return cps.filter(cp => cp != FE0F);
    }

    // given array of codepoints
    // returns the longest valid emoji sequence (or undefined if no match)
    // *MUTATES* the supplied array
    // allows optional FE0F
    // disallows interleaved ignored characters
    // fills (optional) eaten array with matched codepoints
    function consume_emoji_reversed(cps, eaten) {
    	let node = EMOJI_ROOT;
    	let emoji;
    	let saved;
    	let stack = [];
    	let pos = cps.length;
    	if (eaten) eaten.length = 0; // clear input buffer (if needed)
    	while (pos) {
    		let cp = cps[--pos];
    		node = node.B.find(x => x.Q.has(cp));
    		if (!node) break;
    		if (node.S) { // remember
    			saved = cp;
    		} else if (node.C) { // check exclusion
    			if (cp === saved) break;
    		}
    		stack.push(cp);
    		if (node.F) {
    			stack.push(FE0F);
    			if (pos > 0 && cps[pos - 1] == FE0F) pos--; // consume optional FE0F
    		}
    		if (node.V) { // this is a valid emoji (so far)
    			emoji = conform_emoji_copy(stack, node);
    			if (eaten) eaten.push(...cps.slice(pos).reverse()); // copy input (if needed)
    			cps.length = pos; // truncate
    		}
    	}
    	/*
    	// *** this code currently isn't needed ***
    	if (!emoji) {
    		let cp = cps[cps.length-1];
    		if (EMOJI_SOLO.has(cp)) {
    			if (eaten) eaten.push(cp);
    			emoji = Emoji.of(cp);
    			cps.pop();
    		}
    	}
    	*/
    	return emoji;
    }

    // create a copy and fix any unicode quirks
    function conform_emoji_copy(cps, node) {
    	let copy = Emoji.from(cps); // copy stack
    	if (node.V == 2) copy.splice(1, 1); // delete FE0F at position 1 (see: make.js)
    	return copy;
    }

    const Zeros = new Uint8Array(32);
    Zeros.fill(0);
    function checkComponent(comp) {
        assertArgument(comp.length !== 0, "invalid ENS name; empty component", "comp", comp);
        return comp;
    }
    function ensNameSplit(name) {
        const bytes = toUtf8Bytes(ensNormalize(name));
        const comps = [];
        if (name.length === 0) {
            return comps;
        }
        let last = 0;
        for (let i = 0; i < bytes.length; i++) {
            const d = bytes[i];
            // A separator (i.e. "."); copy this component
            if (d === 0x2e) {
                comps.push(checkComponent(bytes.slice(last, i)));
                last = i + 1;
            }
        }
        // There was a stray separator at the end of the name
        assertArgument(last < bytes.length, "invalid ENS name; empty component", "name", name);
        comps.push(checkComponent(bytes.slice(last)));
        return comps;
    }
    /**
     *  Returns the ENS %%name%% normalized.
     */
    function ensNormalize(name) {
        try {
            return ens_normalize(name);
        }
        catch (error) {
            assertArgument(false, `invalid ENS name (${error.message})`, "name", name);
        }
    }
    /**
     *  Returns the [[link-namehash]] for %%name%%.
     */
    function namehash(name) {
        assertArgument(typeof (name) === "string", "invalid ENS name; not a string", "name", name);
        let result = Zeros;
        const comps = ensNameSplit(name);
        while (comps.length) {
            result = keccak256(concat([result, keccak256((comps.pop()))]));
        }
        return hexlify(result);
    }
    /**
     *  Returns the DNS encoded %%name%%.
     *
     *  This is used for various parts of ENS name resolution, such
     *  as the wildcard resolution.
     */
    function dnsEncode(name) {
        return hexlify(concat(ensNameSplit(name).map((comp) => {
            // DNS does not allow components over 63 bytes in length
            if (comp.length > 63) {
                throw new Error("invalid DNS encoded entry; length exceeds 63 bytes");
            }
            const bytes = new Uint8Array(comp.length + 1);
            bytes.set(comp, 1);
            bytes[0] = bytes.length - 1;
            return bytes;
        }))) + "00";
    }

    function accessSetify(addr, storageKeys) {
        return {
            address: getAddress(addr),
            storageKeys: storageKeys.map((storageKey, index) => {
                assertArgument(isHexString(storageKey, 32), "invalid slot", `storageKeys[${index}]`, storageKey);
                return storageKey.toLowerCase();
            })
        };
    }
    /**
     *  Returns a [[AccessList]] from any ethers-supported access-list structure.
     */
    function accessListify(value) {
        if (Array.isArray(value)) {
            return value.map((set, index) => {
                if (Array.isArray(set)) {
                    assertArgument(set.length === 2, "invalid slot set", `value[${index}]`, set);
                    return accessSetify(set[0], set[1]);
                }
                assertArgument(set != null && typeof (set) === "object", "invalid address-slot set", "value", value);
                return accessSetify(set.address, set.storageKeys);
            });
        }
        assertArgument(value != null && typeof (value) === "object", "invalid access list", "value", value);
        const result = Object.keys(value).map((addr) => {
            const storageKeys = value[addr].reduce((accum, storageKey) => {
                accum[storageKey] = true;
                return accum;
            }, {});
            return accessSetify(addr, Object.keys(storageKeys).sort());
        });
        result.sort((a, b) => (a.address.localeCompare(b.address)));
        return result;
    }

    /**
     *  Returns the address for the %%key%%.
     *
     *  The key may be any standard form of public key or a private key.
     */
    function computeAddress(key) {
        let pubkey;
        if (typeof (key) === "string") {
            pubkey = SigningKey.computePublicKey(key, false);
        }
        else {
            pubkey = key.publicKey;
        }
        return getAddress(keccak256("0x" + pubkey.substring(4)).substring(26));
    }
    /**
     *  Returns the recovered address for the private key that was
     *  used to sign %%digest%% that resulted in %%signature%%.
     */
    function recoverAddress(digest, signature) {
        return computeAddress(SigningKey.recoverPublicKey(digest, signature));
    }

    const BN_0$4 = BigInt(0);
    const BN_2$1 = BigInt(2);
    const BN_27 = BigInt(27);
    const BN_28 = BigInt(28);
    const BN_35 = BigInt(35);
    const BN_MAX_UINT = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
    function handleAddress(value) {
        if (value === "0x") {
            return null;
        }
        return getAddress(value);
    }
    function handleAccessList(value, param) {
        try {
            return accessListify(value);
        }
        catch (error) {
            assertArgument(false, error.message, param, value);
        }
    }
    function handleNumber(_value, param) {
        if (_value === "0x") {
            return 0;
        }
        return getNumber(_value, param);
    }
    function handleUint(_value, param) {
        if (_value === "0x") {
            return BN_0$4;
        }
        const value = getBigInt(_value, param);
        assertArgument(value <= BN_MAX_UINT, "value exceeds uint size", param, value);
        return value;
    }
    function formatNumber(_value, name) {
        const value = getBigInt(_value, "value");
        const result = toBeArray(value);
        assertArgument(result.length <= 32, `value too large`, `tx.${name}`, value);
        return result;
    }
    function formatAccessList(value) {
        return accessListify(value).map((set) => [set.address, set.storageKeys]);
    }
    function _parseLegacy(data) {
        const fields = decodeRlp(data);
        assertArgument(Array.isArray(fields) && (fields.length === 9 || fields.length === 6), "invalid field count for legacy transaction", "data", data);
        const tx = {
            type: 0,
            nonce: handleNumber(fields[0], "nonce"),
            gasPrice: handleUint(fields[1], "gasPrice"),
            gasLimit: handleUint(fields[2], "gasLimit"),
            to: handleAddress(fields[3]),
            value: handleUint(fields[4], "value"),
            data: hexlify(fields[5]),
            chainId: BN_0$4
        };
        // Legacy unsigned transaction
        if (fields.length === 6) {
            return tx;
        }
        const v = handleUint(fields[6], "v");
        const r = handleUint(fields[7], "r");
        const s = handleUint(fields[8], "s");
        if (r === BN_0$4 && s === BN_0$4) {
            // EIP-155 unsigned transaction
            tx.chainId = v;
        }
        else {
            // Compute the EIP-155 chain ID (or 0 for legacy)
            let chainId = (v - BN_35) / BN_2$1;
            if (chainId < BN_0$4) {
                chainId = BN_0$4;
            }
            tx.chainId = chainId;
            // Signed Legacy Transaction
            assertArgument(chainId !== BN_0$4 || (v === BN_27 || v === BN_28), "non-canonical legacy v", "v", fields[6]);
            tx.signature = Signature.from({
                r: zeroPadValue(fields[7], 32),
                s: zeroPadValue(fields[8], 32),
                v
            });
            tx.hash = keccak256(data);
        }
        return tx;
    }
    function _serializeLegacy(tx, sig) {
        const fields = [
            formatNumber(tx.nonce || 0, "nonce"),
            formatNumber(tx.gasPrice || 0, "gasPrice"),
            formatNumber(tx.gasLimit || 0, "gasLimit"),
            ((tx.to != null) ? getAddress(tx.to) : "0x"),
            formatNumber(tx.value || 0, "value"),
            (tx.data || "0x"),
        ];
        let chainId = BN_0$4;
        if (tx.chainId != null) {
            // A chainId was provided; if non-zero we'll use EIP-155
            chainId = getBigInt(tx.chainId, "tx.chainId");
            // We have a chainId in the tx and an EIP-155 v in the signature,
            // make sure they agree with each other
            assertArgument(!sig || sig.networkV == null || sig.legacyChainId === chainId, "tx.chainId/sig.v mismatch", "sig", sig);
        }
        else if (sig) {
            // No chainId provided, but the signature is signing with EIP-155; derive chainId
            const legacy = sig.legacyChainId;
            if (legacy != null) {
                chainId = legacy;
            }
        }
        // Requesting an unsigned transaction
        if (!sig) {
            // We have an EIP-155 transaction (chainId was specified and non-zero)
            if (chainId !== BN_0$4) {
                fields.push(toBeArray(chainId));
                fields.push("0x");
                fields.push("0x");
            }
            return encodeRlp(fields);
        }
        // We pushed a chainId and null r, s on for hashing only; remove those
        let v = BigInt(27 + sig.yParity);
        if (chainId !== BN_0$4) {
            v = Signature.getChainIdV(chainId, sig.v);
        }
        else if (BigInt(sig.v) !== v) {
            assertArgument(false, "tx.chainId/sig.v mismatch", "sig", sig);
        }
        fields.push(toBeArray(v));
        fields.push(toBeArray(sig.r));
        fields.push(toBeArray(sig.s));
        return encodeRlp(fields);
    }
    function _parseEipSignature(tx, fields, serialize) {
        let yParity;
        try {
            yParity = handleNumber(fields[0], "yParity");
            if (yParity !== 0 && yParity !== 1) {
                throw new Error("bad yParity");
            }
        }
        catch (error) {
            assertArgument(false, "invalid yParity", "yParity", fields[0]);
        }
        const r = zeroPadValue(fields[1], 32);
        const s = zeroPadValue(fields[2], 32);
        const signature = Signature.from({ r, s, yParity });
        tx.signature = signature;
    }
    function _parseEip1559(data) {
        const fields = decodeRlp(getBytes(data).slice(1));
        assertArgument(Array.isArray(fields) && (fields.length === 9 || fields.length === 12), "invalid field count for transaction type: 2", "data", hexlify(data));
        const maxPriorityFeePerGas = handleUint(fields[2], "maxPriorityFeePerGas");
        const maxFeePerGas = handleUint(fields[3], "maxFeePerGas");
        const tx = {
            type: 2,
            chainId: handleUint(fields[0], "chainId"),
            nonce: handleNumber(fields[1], "nonce"),
            maxPriorityFeePerGas: maxPriorityFeePerGas,
            maxFeePerGas: maxFeePerGas,
            gasPrice: null,
            gasLimit: handleUint(fields[4], "gasLimit"),
            to: handleAddress(fields[5]),
            value: handleUint(fields[6], "value"),
            data: hexlify(fields[7]),
            accessList: handleAccessList(fields[8], "accessList"),
        };
        // Unsigned EIP-1559 Transaction
        if (fields.length === 9) {
            return tx;
        }
        tx.hash = keccak256(data);
        _parseEipSignature(tx, fields.slice(9));
        return tx;
    }
    function _serializeEip1559(tx, sig) {
        const fields = [
            formatNumber(tx.chainId || 0, "chainId"),
            formatNumber(tx.nonce || 0, "nonce"),
            formatNumber(tx.maxPriorityFeePerGas || 0, "maxPriorityFeePerGas"),
            formatNumber(tx.maxFeePerGas || 0, "maxFeePerGas"),
            formatNumber(tx.gasLimit || 0, "gasLimit"),
            ((tx.to != null) ? getAddress(tx.to) : "0x"),
            formatNumber(tx.value || 0, "value"),
            (tx.data || "0x"),
            (formatAccessList(tx.accessList || []))
        ];
        if (sig) {
            fields.push(formatNumber(sig.yParity, "yParity"));
            fields.push(toBeArray(sig.r));
            fields.push(toBeArray(sig.s));
        }
        return concat(["0x02", encodeRlp(fields)]);
    }
    function _parseEip2930(data) {
        const fields = decodeRlp(getBytes(data).slice(1));
        assertArgument(Array.isArray(fields) && (fields.length === 8 || fields.length === 11), "invalid field count for transaction type: 1", "data", hexlify(data));
        const tx = {
            type: 1,
            chainId: handleUint(fields[0], "chainId"),
            nonce: handleNumber(fields[1], "nonce"),
            gasPrice: handleUint(fields[2], "gasPrice"),
            gasLimit: handleUint(fields[3], "gasLimit"),
            to: handleAddress(fields[4]),
            value: handleUint(fields[5], "value"),
            data: hexlify(fields[6]),
            accessList: handleAccessList(fields[7], "accessList")
        };
        // Unsigned EIP-2930 Transaction
        if (fields.length === 8) {
            return tx;
        }
        tx.hash = keccak256(data);
        _parseEipSignature(tx, fields.slice(8));
        return tx;
    }
    function _serializeEip2930(tx, sig) {
        const fields = [
            formatNumber(tx.chainId || 0, "chainId"),
            formatNumber(tx.nonce || 0, "nonce"),
            formatNumber(tx.gasPrice || 0, "gasPrice"),
            formatNumber(tx.gasLimit || 0, "gasLimit"),
            ((tx.to != null) ? getAddress(tx.to) : "0x"),
            formatNumber(tx.value || 0, "value"),
            (tx.data || "0x"),
            (formatAccessList(tx.accessList || []))
        ];
        if (sig) {
            fields.push(formatNumber(sig.yParity, "recoveryParam"));
            fields.push(toBeArray(sig.r));
            fields.push(toBeArray(sig.s));
        }
        return concat(["0x01", encodeRlp(fields)]);
    }
    /**
     *  A **Transaction** describes an operation to be executed on
     *  Ethereum by an Externally Owned Account (EOA). It includes
     *  who (the [[to]] address), what (the [[data]]) and how much (the
     *  [[value]] in ether) the operation should entail.
     *
     *  @example:
     *    tx = new Transaction()
     *    //_result:
     *
     *    tx.data = "0x1234";
     *    //_result:
     */
    class Transaction {
        #type;
        #to;
        #data;
        #nonce;
        #gasLimit;
        #gasPrice;
        #maxPriorityFeePerGas;
        #maxFeePerGas;
        #value;
        #chainId;
        #sig;
        #accessList;
        /**
         *  The transaction type.
         *
         *  If null, the type will be automatically inferred based on
         *  explicit properties.
         */
        get type() { return this.#type; }
        set type(value) {
            switch (value) {
                case null:
                    this.#type = null;
                    break;
                case 0:
                case "legacy":
                    this.#type = 0;
                    break;
                case 1:
                case "berlin":
                case "eip-2930":
                    this.#type = 1;
                    break;
                case 2:
                case "london":
                case "eip-1559":
                    this.#type = 2;
                    break;
                default:
                    assertArgument(false, "unsupported transaction type", "type", value);
            }
        }
        /**
         *  The name of the transaction type.
         */
        get typeName() {
            switch (this.type) {
                case 0: return "legacy";
                case 1: return "eip-2930";
                case 2: return "eip-1559";
            }
            return null;
        }
        /**
         *  The ``to`` address for the transaction or ``null`` if the
         *  transaction is an ``init`` transaction.
         */
        get to() { return this.#to; }
        set to(value) {
            this.#to = (value == null) ? null : getAddress(value);
        }
        /**
         *  The transaction nonce.
         */
        get nonce() { return this.#nonce; }
        set nonce(value) { this.#nonce = getNumber(value, "value"); }
        /**
         *  The gas limit.
         */
        get gasLimit() { return this.#gasLimit; }
        set gasLimit(value) { this.#gasLimit = getBigInt(value); }
        /**
         *  The gas price.
         *
         *  On legacy networks this defines the fee that will be paid. On
         *  EIP-1559 networks, this should be ``null``.
         */
        get gasPrice() {
            const value = this.#gasPrice;
            if (value == null && (this.type === 0 || this.type === 1)) {
                return BN_0$4;
            }
            return value;
        }
        set gasPrice(value) {
            this.#gasPrice = (value == null) ? null : getBigInt(value, "gasPrice");
        }
        /**
         *  The maximum priority fee per unit of gas to pay. On legacy
         *  networks this should be ``null``.
         */
        get maxPriorityFeePerGas() {
            const value = this.#maxPriorityFeePerGas;
            if (value == null) {
                if (this.type === 2) {
                    return BN_0$4;
                }
                return null;
            }
            return value;
        }
        set maxPriorityFeePerGas(value) {
            this.#maxPriorityFeePerGas = (value == null) ? null : getBigInt(value, "maxPriorityFeePerGas");
        }
        /**
         *  The maximum total fee per unit of gas to pay. On legacy
         *  networks this should be ``null``.
         */
        get maxFeePerGas() {
            const value = this.#maxFeePerGas;
            if (value == null) {
                if (this.type === 2) {
                    return BN_0$4;
                }
                return null;
            }
            return value;
        }
        set maxFeePerGas(value) {
            this.#maxFeePerGas = (value == null) ? null : getBigInt(value, "maxFeePerGas");
        }
        /**
         *  The transaction data. For ``init`` transactions this is the
         *  deployment code.
         */
        get data() { return this.#data; }
        set data(value) { this.#data = hexlify(value); }
        /**
         *  The amount of ether to send in this transactions.
         */
        get value() { return this.#value; }
        set value(value) {
            this.#value = getBigInt(value, "value");
        }
        /**
         *  The chain ID this transaction is valid on.
         */
        get chainId() { return this.#chainId; }
        set chainId(value) { this.#chainId = getBigInt(value); }
        /**
         *  If signed, the signature for this transaction.
         */
        get signature() { return this.#sig || null; }
        set signature(value) {
            this.#sig = (value == null) ? null : Signature.from(value);
        }
        /**
         *  The access list.
         *
         *  An access list permits discounted (but pre-paid) access to
         *  bytecode and state variable access within contract execution.
         */
        get accessList() {
            const value = this.#accessList || null;
            if (value == null) {
                if (this.type === 1 || this.type === 2) {
                    return [];
                }
                return null;
            }
            return value;
        }
        set accessList(value) {
            this.#accessList = (value == null) ? null : accessListify(value);
        }
        /**
         *  Creates a new Transaction with default values.
         */
        constructor() {
            this.#type = null;
            this.#to = null;
            this.#nonce = 0;
            this.#gasLimit = BigInt(0);
            this.#gasPrice = null;
            this.#maxPriorityFeePerGas = null;
            this.#maxFeePerGas = null;
            this.#data = "0x";
            this.#value = BigInt(0);
            this.#chainId = BigInt(0);
            this.#sig = null;
            this.#accessList = null;
        }
        /**
         *  The transaction hash, if signed. Otherwise, ``null``.
         */
        get hash() {
            if (this.signature == null) {
                return null;
            }
            return keccak256(this.serialized);
        }
        /**
         *  The pre-image hash of this transaction.
         *
         *  This is the digest that a [[Signer]] must sign to authorize
         *  this transaction.
         */
        get unsignedHash() {
            return keccak256(this.unsignedSerialized);
        }
        /**
         *  The sending address, if signed. Otherwise, ``null``.
         */
        get from() {
            if (this.signature == null) {
                return null;
            }
            return recoverAddress(this.unsignedHash, this.signature);
        }
        /**
         *  The public key of the sender, if signed. Otherwise, ``null``.
         */
        get fromPublicKey() {
            if (this.signature == null) {
                return null;
            }
            return SigningKey.recoverPublicKey(this.unsignedHash, this.signature);
        }
        /**
         *  Returns true if signed.
         *
         *  This provides a Type Guard that properties requiring a signed
         *  transaction are non-null.
         */
        isSigned() {
            //isSigned(): this is SignedTransaction {
            return this.signature != null;
        }
        /**
         *  The serialized transaction.
         *
         *  This throws if the transaction is unsigned. For the pre-image,
         *  use [[unsignedSerialized]].
         */
        get serialized() {
            assert$1(this.signature != null, "cannot serialize unsigned transaction; maybe you meant .unsignedSerialized", "UNSUPPORTED_OPERATION", { operation: ".serialized" });
            switch (this.inferType()) {
                case 0:
                    return _serializeLegacy(this, this.signature);
                case 1:
                    return _serializeEip2930(this, this.signature);
                case 2:
                    return _serializeEip1559(this, this.signature);
            }
            assert$1(false, "unsupported transaction type", "UNSUPPORTED_OPERATION", { operation: ".serialized" });
        }
        /**
         *  The transaction pre-image.
         *
         *  The hash of this is the digest which needs to be signed to
         *  authorize this transaction.
         */
        get unsignedSerialized() {
            switch (this.inferType()) {
                case 0:
                    return _serializeLegacy(this);
                case 1:
                    return _serializeEip2930(this);
                case 2:
                    return _serializeEip1559(this);
            }
            assert$1(false, "unsupported transaction type", "UNSUPPORTED_OPERATION", { operation: ".unsignedSerialized" });
        }
        /**
         *  Return the most "likely" type; currently the highest
         *  supported transaction type.
         */
        inferType() {
            return (this.inferTypes().pop());
        }
        /**
         *  Validates the explicit properties and returns a list of compatible
         *  transaction types.
         */
        inferTypes() {
            // Checks that there are no conflicting properties set
            const hasGasPrice = this.gasPrice != null;
            const hasFee = (this.maxFeePerGas != null || this.maxPriorityFeePerGas != null);
            const hasAccessList = (this.accessList != null);
            //if (hasGasPrice && hasFee) {
            //    throw new Error("transaction cannot have gasPrice and maxFeePerGas");
            //}
            if (this.maxFeePerGas != null && this.maxPriorityFeePerGas != null) {
                assert$1(this.maxFeePerGas >= this.maxPriorityFeePerGas, "priorityFee cannot be more than maxFee", "BAD_DATA", { value: this });
            }
            //if (this.type === 2 && hasGasPrice) {
            //    throw new Error("eip-1559 transaction cannot have gasPrice");
            //}
            assert$1(!hasFee || (this.type !== 0 && this.type !== 1), "transaction type cannot have maxFeePerGas or maxPriorityFeePerGas", "BAD_DATA", { value: this });
            assert$1(this.type !== 0 || !hasAccessList, "legacy transaction cannot have accessList", "BAD_DATA", { value: this });
            const types = [];
            // Explicit type
            if (this.type != null) {
                types.push(this.type);
            }
            else {
                if (hasFee) {
                    types.push(2);
                }
                else if (hasGasPrice) {
                    types.push(1);
                    if (!hasAccessList) {
                        types.push(0);
                    }
                }
                else if (hasAccessList) {
                    types.push(1);
                    types.push(2);
                }
                else {
                    types.push(0);
                    types.push(1);
                    types.push(2);
                }
            }
            types.sort();
            return types;
        }
        /**
         *  Returns true if this transaction is a legacy transaction (i.e.
         *  ``type === 0``).
         *
         *  This provides a Type Guard that the related properties are
         *  non-null.
         */
        isLegacy() {
            return (this.type === 0);
        }
        /**
         *  Returns true if this transaction is berlin hardform transaction (i.e.
         *  ``type === 1``).
         *
         *  This provides a Type Guard that the related properties are
         *  non-null.
         */
        isBerlin() {
            return (this.type === 1);
        }
        /**
         *  Returns true if this transaction is london hardform transaction (i.e.
         *  ``type === 2``).
         *
         *  This provides a Type Guard that the related properties are
         *  non-null.
         */
        isLondon() {
            return (this.type === 2);
        }
        /**
         *  Create a copy of this transaciton.
         */
        clone() {
            return Transaction.from(this);
        }
        /**
         *  Return a JSON-friendly object.
         */
        toJSON() {
            const s = (v) => {
                if (v == null) {
                    return null;
                }
                return v.toString();
            };
            return {
                type: this.type,
                to: this.to,
                //            from: this.from,
                data: this.data,
                nonce: this.nonce,
                gasLimit: s(this.gasLimit),
                gasPrice: s(this.gasPrice),
                maxPriorityFeePerGas: s(this.maxPriorityFeePerGas),
                maxFeePerGas: s(this.maxFeePerGas),
                value: s(this.value),
                chainId: s(this.chainId),
                sig: this.signature ? this.signature.toJSON() : null,
                accessList: this.accessList
            };
        }
        /**
         *  Create a **Transaction** from a serialized transaction or a
         *  Transaction-like object.
         */
        static from(tx) {
            if (tx == null) {
                return new Transaction();
            }
            if (typeof (tx) === "string") {
                const payload = getBytes(tx);
                if (payload[0] >= 0x7f) { // @TODO: > vs >= ??
                    return Transaction.from(_parseLegacy(payload));
                }
                switch (payload[0]) {
                    case 1: return Transaction.from(_parseEip2930(payload));
                    case 2: return Transaction.from(_parseEip1559(payload));
                }
                assert$1(false, "unsupported transaction type", "UNSUPPORTED_OPERATION", { operation: "from" });
            }
            const result = new Transaction();
            if (tx.type != null) {
                result.type = tx.type;
            }
            if (tx.to != null) {
                result.to = tx.to;
            }
            if (tx.nonce != null) {
                result.nonce = tx.nonce;
            }
            if (tx.gasLimit != null) {
                result.gasLimit = tx.gasLimit;
            }
            if (tx.gasPrice != null) {
                result.gasPrice = tx.gasPrice;
            }
            if (tx.maxPriorityFeePerGas != null) {
                result.maxPriorityFeePerGas = tx.maxPriorityFeePerGas;
            }
            if (tx.maxFeePerGas != null) {
                result.maxFeePerGas = tx.maxFeePerGas;
            }
            if (tx.data != null) {
                result.data = tx.data;
            }
            if (tx.value != null) {
                result.value = tx.value;
            }
            if (tx.chainId != null) {
                result.chainId = tx.chainId;
            }
            if (tx.signature != null) {
                result.signature = Signature.from(tx.signature);
            }
            if (tx.accessList != null) {
                result.accessList = tx.accessList;
            }
            if (tx.hash != null) {
                assertArgument(result.isSigned(), "unsigned transaction cannot define hash", "tx", tx);
                assertArgument(result.hash === tx.hash, "hash mismatch", "tx", tx);
            }
            if (tx.from != null) {
                assertArgument(result.isSigned(), "unsigned transaction cannot define from", "tx", tx);
                assertArgument(result.from.toLowerCase() === (tx.from || "").toLowerCase(), "from mismatch", "tx", tx);
            }
            return result;
        }
    }

    //import { TypedDataDomain, TypedDataField } from "@ethersproject/providerabstract-signer";
    const padding = new Uint8Array(32);
    padding.fill(0);
    const BN__1 = BigInt(-1);
    const BN_0$3 = BigInt(0);
    const BN_1 = BigInt(1);
    const BN_MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
    function hexPadRight(value) {
        const bytes = getBytes(value);
        const padOffset = bytes.length % 32;
        if (padOffset) {
            return concat([bytes, padding.slice(padOffset)]);
        }
        return hexlify(bytes);
    }
    const hexTrue = toBeHex(BN_1, 32);
    const hexFalse = toBeHex(BN_0$3, 32);
    const domainFieldTypes = {
        name: "string",
        version: "string",
        chainId: "uint256",
        verifyingContract: "address",
        salt: "bytes32"
    };
    const domainFieldNames = [
        "name", "version", "chainId", "verifyingContract", "salt"
    ];
    function checkString(key) {
        return function (value) {
            assertArgument(typeof (value) === "string", `invalid domain value for ${JSON.stringify(key)}`, `domain.${key}`, value);
            return value;
        };
    }
    const domainChecks = {
        name: checkString("name"),
        version: checkString("version"),
        chainId: function (value) {
            return getBigInt(value, "domain.chainId");
        },
        verifyingContract: function (value) {
            try {
                return getAddress(value).toLowerCase();
            }
            catch (error) { }
            assertArgument(false, `invalid domain value "verifyingContract"`, "domain.verifyingContract", value);
        },
        salt: function (value) {
            const bytes = getBytes(value, "domain.salt");
            assertArgument(bytes.length === 32, `invalid domain value "salt"`, "domain.salt", value);
            return hexlify(bytes);
        }
    };
    function getBaseEncoder(type) {
        // intXX and uintXX
        {
            const match = type.match(/^(u?)int(\d*)$/);
            if (match) {
                const signed = (match[1] === "");
                const width = parseInt(match[2] || "256");
                assertArgument(width % 8 === 0 && width !== 0 && width <= 256 && (match[2] == null || match[2] === String(width)), "invalid numeric width", "type", type);
                const boundsUpper = mask(BN_MAX_UINT256, signed ? (width - 1) : width);
                const boundsLower = signed ? ((boundsUpper + BN_1) * BN__1) : BN_0$3;
                return function (_value) {
                    const value = getBigInt(_value, "value");
                    assertArgument(value >= boundsLower && value <= boundsUpper, `value out-of-bounds for ${type}`, "value", value);
                    return toBeHex(toTwos(value, 256), 32);
                };
            }
        }
        // bytesXX
        {
            const match = type.match(/^bytes(\d+)$/);
            if (match) {
                const width = parseInt(match[1]);
                assertArgument(width !== 0 && width <= 32 && match[1] === String(width), "invalid bytes width", "type", type);
                return function (value) {
                    const bytes = getBytes(value);
                    assertArgument(bytes.length === width, `invalid length for ${type}`, "value", value);
                    return hexPadRight(value);
                };
            }
        }
        switch (type) {
            case "address": return function (value) {
                return zeroPadValue(getAddress(value), 32);
            };
            case "bool": return function (value) {
                return ((!value) ? hexFalse : hexTrue);
            };
            case "bytes": return function (value) {
                return keccak256(value);
            };
            case "string": return function (value) {
                return id(value);
            };
        }
        return null;
    }
    function encodeType(name, fields) {
        return `${name}(${fields.map(({ name, type }) => (type + " " + name)).join(",")})`;
    }
    class TypedDataEncoder {
        primaryType;
        #types;
        get types() {
            return JSON.parse(this.#types);
        }
        #fullTypes;
        #encoderCache;
        constructor(types) {
            this.#types = JSON.stringify(types);
            this.#fullTypes = new Map();
            this.#encoderCache = new Map();
            // Link struct types to their direct child structs
            const links = new Map();
            // Link structs to structs which contain them as a child
            const parents = new Map();
            // Link all subtypes within a given struct
            const subtypes = new Map();
            Object.keys(types).forEach((type) => {
                links.set(type, new Set());
                parents.set(type, []);
                subtypes.set(type, new Set());
            });
            for (const name in types) {
                const uniqueNames = new Set();
                for (const field of types[name]) {
                    // Check each field has a unique name
                    assertArgument(!uniqueNames.has(field.name), `duplicate variable name ${JSON.stringify(field.name)} in ${JSON.stringify(name)}`, "types", types);
                    uniqueNames.add(field.name);
                    // Get the base type (drop any array specifiers)
                    const baseType = (field.type.match(/^([^\x5b]*)(\x5b|$)/))[1] || null;
                    assertArgument(baseType !== name, `circular type reference to ${JSON.stringify(baseType)}`, "types", types);
                    // Is this a base encoding type?
                    const encoder = getBaseEncoder(baseType);
                    if (encoder) {
                        continue;
                    }
                    assertArgument(parents.has(baseType), `unknown type ${JSON.stringify(baseType)}`, "types", types);
                    // Add linkage
                    parents.get(baseType).push(name);
                    links.get(name).add(baseType);
                }
            }
            // Deduce the primary type
            const primaryTypes = Array.from(parents.keys()).filter((n) => (parents.get(n).length === 0));
            assertArgument(primaryTypes.length !== 0, "missing primary type", "types", types);
            assertArgument(primaryTypes.length === 1, `ambiguous primary types or unused types: ${primaryTypes.map((t) => (JSON.stringify(t))).join(", ")}`, "types", types);
            defineProperties(this, { primaryType: primaryTypes[0] });
            // Check for circular type references
            function checkCircular(type, found) {
                assertArgument(!found.has(type), `circular type reference to ${JSON.stringify(type)}`, "types", types);
                found.add(type);
                for (const child of links.get(type)) {
                    if (!parents.has(child)) {
                        continue;
                    }
                    // Recursively check children
                    checkCircular(child, found);
                    // Mark all ancestors as having this decendant
                    for (const subtype of found) {
                        subtypes.get(subtype).add(child);
                    }
                }
                found.delete(type);
            }
            checkCircular(this.primaryType, new Set());
            // Compute each fully describe type
            for (const [name, set] of subtypes) {
                const st = Array.from(set);
                st.sort();
                this.#fullTypes.set(name, encodeType(name, types[name]) + st.map((t) => encodeType(t, types[t])).join(""));
            }
        }
        getEncoder(type) {
            let encoder = this.#encoderCache.get(type);
            if (!encoder) {
                encoder = this.#getEncoder(type);
                this.#encoderCache.set(type, encoder);
            }
            return encoder;
        }
        #getEncoder(type) {
            // Basic encoder type (address, bool, uint256, etc)
            {
                const encoder = getBaseEncoder(type);
                if (encoder) {
                    return encoder;
                }
            }
            // Array
            const match = type.match(/^(.*)(\x5b(\d*)\x5d)$/);
            if (match) {
                const subtype = match[1];
                const subEncoder = this.getEncoder(subtype);
                return (value) => {
                    assertArgument(!match[3] || parseInt(match[3]) === value.length, `array length mismatch; expected length ${parseInt(match[3])}`, "value", value);
                    let result = value.map(subEncoder);
                    if (this.#fullTypes.has(subtype)) {
                        result = result.map(keccak256);
                    }
                    return keccak256(concat(result));
                };
            }
            // Struct
            const fields = this.types[type];
            if (fields) {
                const encodedType = id(this.#fullTypes.get(type));
                return (value) => {
                    const values = fields.map(({ name, type }) => {
                        const result = this.getEncoder(type)(value[name]);
                        if (this.#fullTypes.has(type)) {
                            return keccak256(result);
                        }
                        return result;
                    });
                    values.unshift(encodedType);
                    return concat(values);
                };
            }
            assertArgument(false, `unknown type: ${type}`, "type", type);
        }
        encodeType(name) {
            const result = this.#fullTypes.get(name);
            assertArgument(result, `unknown type: ${JSON.stringify(name)}`, "name", name);
            return result;
        }
        encodeData(type, value) {
            return this.getEncoder(type)(value);
        }
        hashStruct(name, value) {
            return keccak256(this.encodeData(name, value));
        }
        encode(value) {
            return this.encodeData(this.primaryType, value);
        }
        hash(value) {
            return this.hashStruct(this.primaryType, value);
        }
        _visit(type, value, callback) {
            // Basic encoder type (address, bool, uint256, etc)
            {
                const encoder = getBaseEncoder(type);
                if (encoder) {
                    return callback(type, value);
                }
            }
            // Array
            const match = type.match(/^(.*)(\x5b(\d*)\x5d)$/);
            if (match) {
                assertArgument(!match[3] || parseInt(match[3]) === value.length, `array length mismatch; expected length ${parseInt(match[3])}`, "value", value);
                return value.map((v) => this._visit(match[1], v, callback));
            }
            // Struct
            const fields = this.types[type];
            if (fields) {
                return fields.reduce((accum, { name, type }) => {
                    accum[name] = this._visit(type, value[name], callback);
                    return accum;
                }, {});
            }
            assertArgument(false, `unknown type: ${type}`, "type", type);
        }
        visit(value, callback) {
            return this._visit(this.primaryType, value, callback);
        }
        static from(types) {
            return new TypedDataEncoder(types);
        }
        static getPrimaryType(types) {
            return TypedDataEncoder.from(types).primaryType;
        }
        static hashStruct(name, types, value) {
            return TypedDataEncoder.from(types).hashStruct(name, value);
        }
        static hashDomain(domain) {
            const domainFields = [];
            for (const name in domain) {
                const type = domainFieldTypes[name];
                assertArgument(type, `invalid typed-data domain key: ${JSON.stringify(name)}`, "domain", domain);
                domainFields.push({ name, type });
            }
            domainFields.sort((a, b) => {
                return domainFieldNames.indexOf(a.name) - domainFieldNames.indexOf(b.name);
            });
            return TypedDataEncoder.hashStruct("EIP712Domain", { EIP712Domain: domainFields }, domain);
        }
        static encode(domain, types, value) {
            return concat([
                "0x1901",
                TypedDataEncoder.hashDomain(domain),
                TypedDataEncoder.from(types).hash(value)
            ]);
        }
        static hash(domain, types, value) {
            return keccak256(TypedDataEncoder.encode(domain, types, value));
        }
        // Replaces all address types with ENS names with their looked up address
        static async resolveNames(domain, types, value, resolveName) {
            // Make a copy to isolate it from the object passed in
            domain = Object.assign({}, domain);
            // Look up all ENS names
            const ensCache = {};
            // Do we need to look up the domain's verifyingContract?
            if (domain.verifyingContract && !isHexString(domain.verifyingContract, 20)) {
                ensCache[domain.verifyingContract] = "0x";
            }
            // We are going to use the encoder to visit all the base values
            const encoder = TypedDataEncoder.from(types);
            // Get a list of all the addresses
            encoder.visit(value, (type, value) => {
                if (type === "address" && !isHexString(value, 20)) {
                    ensCache[value] = "0x";
                }
                return value;
            });
            // Lookup each name
            for (const name in ensCache) {
                ensCache[name] = await resolveName(name);
            }
            // Replace the domain verifyingContract if needed
            if (domain.verifyingContract && ensCache[domain.verifyingContract]) {
                domain.verifyingContract = ensCache[domain.verifyingContract];
            }
            // Replace all ENS names with their address
            value = encoder.visit(value, (type, value) => {
                if (type === "address" && ensCache[value]) {
                    return ensCache[value];
                }
                return value;
            });
            return { domain, value };
        }
        static getPayload(domain, types, value) {
            // Validate the domain fields
            TypedDataEncoder.hashDomain(domain);
            // Derive the EIP712Domain Struct reference type
            const domainValues = {};
            const domainTypes = [];
            domainFieldNames.forEach((name) => {
                const value = domain[name];
                if (value == null) {
                    return;
                }
                domainValues[name] = domainChecks[name](value);
                domainTypes.push({ name, type: domainFieldTypes[name] });
            });
            const encoder = TypedDataEncoder.from(types);
            const typesWithDomain = Object.assign({}, types);
            assertArgument(typesWithDomain.EIP712Domain == null, "types must not contain EIP712Domain type", "types.EIP712Domain", types);
            typesWithDomain.EIP712Domain = domainTypes;
            // Validate the data structures and types
            encoder.encode(value);
            return {
                types: typesWithDomain,
                domain: domainValues,
                primaryType: encoder.primaryType,
                message: encoder.visit(value, (type, value) => {
                    // bytes
                    if (type.match(/^bytes(\d*)/)) {
                        return hexlify(getBytes(value));
                    }
                    // uint or int
                    if (type.match(/^u?int/)) {
                        return getBigInt(value).toString();
                    }
                    switch (type) {
                        case "address":
                            return value.toLowerCase();
                        case "bool":
                            return !!value;
                        case "string":
                            assertArgument(typeof (value) === "string", "invalid string", "value", value);
                            return value;
                    }
                    assertArgument(false, "unsupported type", "type", type);
                })
            };
        }
    }

    /**
     *  About frgaments...
     *
     *  @_subsection api/abi/abi-coder:Fragments  [about-fragments]
     */
    // [ "a", "b" ] => { "a": 1, "b": 1 }
    function setify(items) {
        const result = new Set();
        items.forEach((k) => result.add(k));
        return Object.freeze(result);
    }
    // Visibility Keywords
    const _kwVisib = "constant external internal payable private public pure view";
    const KwVisib = setify(_kwVisib.split(" "));
    const _kwTypes = "constructor error event fallback function receive struct";
    const KwTypes = setify(_kwTypes.split(" "));
    const _kwModifiers = "calldata memory storage payable indexed";
    const KwModifiers = setify(_kwModifiers.split(" "));
    const _kwOther = "tuple returns";
    // All Keywords
    const _keywords = [_kwTypes, _kwModifiers, _kwOther, _kwVisib].join(" ");
    const Keywords = setify(_keywords.split(" "));
    // Single character tokens
    const SimpleTokens = {
        "(": "OPEN_PAREN", ")": "CLOSE_PAREN",
        "[": "OPEN_BRACKET", "]": "CLOSE_BRACKET",
        ",": "COMMA", "@": "AT"
    };
    // Parser regexes to consume the next token
    const regexWhitespacePrefix = new RegExp("^(\\s*)");
    const regexNumberPrefix = new RegExp("^([0-9]+)");
    const regexIdPrefix = new RegExp("^([a-zA-Z$_][a-zA-Z0-9$_]*)");
    // Parser regexs to check validity
    const regexId = new RegExp("^([a-zA-Z$_][a-zA-Z0-9$_]*)$");
    const regexType = new RegExp("^(address|bool|bytes([0-9]*)|string|u?int([0-9]*))$");
    class TokenString {
        #offset;
        #tokens;
        get offset() { return this.#offset; }
        get length() { return this.#tokens.length - this.#offset; }
        constructor(tokens) {
            this.#offset = 0;
            this.#tokens = tokens.slice();
        }
        clone() { return new TokenString(this.#tokens); }
        reset() { this.#offset = 0; }
        #subTokenString(from = 0, to = 0) {
            return new TokenString(this.#tokens.slice(from, to).map((t) => {
                return Object.freeze(Object.assign({}, t, {
                    match: (t.match - from),
                    linkBack: (t.linkBack - from),
                    linkNext: (t.linkNext - from),
                }));
            }));
        }
        // Pops and returns the value of the next token, if it is a keyword in allowed; throws if out of tokens
        popKeyword(allowed) {
            const top = this.peek();
            if (top.type !== "KEYWORD" || !allowed.has(top.text)) {
                throw new Error(`expected keyword ${top.text}`);
            }
            return this.pop().text;
        }
        // Pops and returns the value of the next token if it is `type`; throws if out of tokens
        popType(type) {
            if (this.peek().type !== type) {
                throw new Error(`expected ${type}; got ${JSON.stringify(this.peek())}`);
            }
            return this.pop().text;
        }
        // Pops and returns a "(" TOKENS ")"
        popParen() {
            const top = this.peek();
            if (top.type !== "OPEN_PAREN") {
                throw new Error("bad start");
            }
            const result = this.#subTokenString(this.#offset + 1, top.match + 1);
            this.#offset = top.match + 1;
            return result;
        }
        // Pops and returns the items within "(" ITEM1 "," ITEM2 "," ... ")"
        popParams() {
            const top = this.peek();
            if (top.type !== "OPEN_PAREN") {
                throw new Error("bad start");
            }
            const result = [];
            while (this.#offset < top.match - 1) {
                const link = this.peek().linkNext;
                result.push(this.#subTokenString(this.#offset + 1, link));
                this.#offset = link;
            }
            this.#offset = top.match + 1;
            return result;
        }
        // Returns the top Token, throwing if out of tokens
        peek() {
            if (this.#offset >= this.#tokens.length) {
                throw new Error("out-of-bounds");
            }
            return this.#tokens[this.#offset];
        }
        // Returns the next value, if it is a keyword in `allowed`
        peekKeyword(allowed) {
            const top = this.peekType("KEYWORD");
            return (top != null && allowed.has(top)) ? top : null;
        }
        // Returns the value of the next token if it is `type`
        peekType(type) {
            if (this.length === 0) {
                return null;
            }
            const top = this.peek();
            return (top.type === type) ? top.text : null;
        }
        // Returns the next token; throws if out of tokens
        pop() {
            const result = this.peek();
            this.#offset++;
            return result;
        }
        toString() {
            const tokens = [];
            for (let i = this.#offset; i < this.#tokens.length; i++) {
                const token = this.#tokens[i];
                tokens.push(`${token.type}:${token.text}`);
            }
            return `<TokenString ${tokens.join(" ")}>`;
        }
    }
    function lex(text) {
        const tokens = [];
        const throwError = (message) => {
            const token = (offset < text.length) ? JSON.stringify(text[offset]) : "$EOI";
            throw new Error(`invalid token ${token} at ${offset}: ${message}`);
        };
        let brackets = [];
        let commas = [];
        let offset = 0;
        while (offset < text.length) {
            // Strip off any leading whitespace
            let cur = text.substring(offset);
            let match = cur.match(regexWhitespacePrefix);
            if (match) {
                offset += match[1].length;
                cur = text.substring(offset);
            }
            const token = { depth: brackets.length, linkBack: -1, linkNext: -1, match: -1, type: "", text: "", offset, value: -1 };
            tokens.push(token);
            let type = (SimpleTokens[cur[0]] || "");
            if (type) {
                token.type = type;
                token.text = cur[0];
                offset++;
                if (type === "OPEN_PAREN") {
                    brackets.push(tokens.length - 1);
                    commas.push(tokens.length - 1);
                }
                else if (type == "CLOSE_PAREN") {
                    if (brackets.length === 0) {
                        throwError("no matching open bracket");
                    }
                    token.match = brackets.pop();
                    (tokens[token.match]).match = tokens.length - 1;
                    token.depth--;
                    token.linkBack = commas.pop();
                    (tokens[token.linkBack]).linkNext = tokens.length - 1;
                }
                else if (type === "COMMA") {
                    token.linkBack = commas.pop();
                    (tokens[token.linkBack]).linkNext = tokens.length - 1;
                    commas.push(tokens.length - 1);
                }
                else if (type === "OPEN_BRACKET") {
                    token.type = "BRACKET";
                }
                else if (type === "CLOSE_BRACKET") {
                    // Remove the CLOSE_BRACKET
                    let suffix = tokens.pop().text;
                    if (tokens.length > 0 && tokens[tokens.length - 1].type === "NUMBER") {
                        const value = tokens.pop().text;
                        suffix = value + suffix;
                        (tokens[tokens.length - 1]).value = getNumber(value);
                    }
                    if (tokens.length === 0 || tokens[tokens.length - 1].type !== "BRACKET") {
                        throw new Error("missing opening bracket");
                    }
                    (tokens[tokens.length - 1]).text += suffix;
                }
                continue;
            }
            match = cur.match(regexIdPrefix);
            if (match) {
                token.text = match[1];
                offset += token.text.length;
                if (Keywords.has(token.text)) {
                    token.type = "KEYWORD";
                    continue;
                }
                if (token.text.match(regexType)) {
                    token.type = "TYPE";
                    continue;
                }
                token.type = "ID";
                continue;
            }
            match = cur.match(regexNumberPrefix);
            if (match) {
                token.text = match[1];
                token.type = "NUMBER";
                offset += token.text.length;
                continue;
            }
            throw new Error(`unexpected token ${JSON.stringify(cur[0])} at position ${offset}`);
        }
        return new TokenString(tokens.map((t) => Object.freeze(t)));
    }
    // Check only one of `allowed` is in `set`
    function allowSingle(set, allowed) {
        let included = [];
        for (const key in allowed.keys()) {
            if (set.has(key)) {
                included.push(key);
            }
        }
        if (included.length > 1) {
            throw new Error(`conflicting types: ${included.join(", ")}`);
        }
    }
    // Functions to process a Solidity Signature TokenString from left-to-right for...
    // ...the name with an optional type, returning the name
    function consumeName(type, tokens) {
        if (tokens.peekKeyword(KwTypes)) {
            const keyword = tokens.pop().text;
            if (keyword !== type) {
                throw new Error(`expected ${type}, got ${keyword}`);
            }
        }
        return tokens.popType("ID");
    }
    // ...all keywords matching allowed, returning the keywords
    function consumeKeywords(tokens, allowed) {
        const keywords = new Set();
        while (true) {
            const keyword = tokens.peekType("KEYWORD");
            if (keyword == null || (allowed && !allowed.has(keyword))) {
                break;
            }
            tokens.pop();
            if (keywords.has(keyword)) {
                throw new Error(`duplicate keywords: ${JSON.stringify(keyword)}`);
            }
            keywords.add(keyword);
        }
        return Object.freeze(keywords);
    }
    // ...all visibility keywords, returning the coalesced mutability
    function consumeMutability(tokens) {
        let modifiers = consumeKeywords(tokens, KwVisib);
        // Detect conflicting modifiers
        allowSingle(modifiers, setify("constant payable nonpayable".split(" ")));
        allowSingle(modifiers, setify("pure view payable nonpayable".split(" ")));
        // Process mutability states
        if (modifiers.has("view")) {
            return "view";
        }
        if (modifiers.has("pure")) {
            return "pure";
        }
        if (modifiers.has("payable")) {
            return "payable";
        }
        if (modifiers.has("nonpayable")) {
            return "nonpayable";
        }
        // Process legacy `constant` last
        if (modifiers.has("constant")) {
            return "view";
        }
        return "nonpayable";
    }
    // ...a parameter list, returning the ParamType list
    function consumeParams(tokens, allowIndexed) {
        return tokens.popParams().map((t) => ParamType.from(t, allowIndexed));
    }
    // ...a gas limit, returning a BigNumber or null if none
    function consumeGas(tokens) {
        if (tokens.peekType("AT")) {
            tokens.pop();
            if (tokens.peekType("NUMBER")) {
                return getBigInt(tokens.pop().text);
            }
            throw new Error("invalid gas");
        }
        return null;
    }
    function consumeEoi(tokens) {
        if (tokens.length) {
            throw new Error(`unexpected tokens: ${tokens.toString()}`);
        }
    }
    const regexArrayType = new RegExp(/^(.*)\[([0-9]*)\]$/);
    function verifyBasicType(type) {
        const match = type.match(regexType);
        assertArgument(match, "invalid type", "type", type);
        if (type === "uint") {
            return "uint256";
        }
        if (type === "int") {
            return "int256";
        }
        if (match[2]) {
            // bytesXX
            const length = parseInt(match[2]);
            assertArgument(length !== 0 && length <= 32, "invalid bytes length", "type", type);
        }
        else if (match[3]) {
            // intXX or uintXX
            const size = parseInt(match[3]);
            assertArgument(size !== 0 && size <= 256 && (size % 8) === 0, "invalid numeric width", "type", type);
        }
        return type;
    }
    // Make the Fragment constructors effectively private
    const _guard = {};
    const internal$1 = Symbol.for("_ethers_internal");
    const ParamTypeInternal = "_ParamTypeInternal";
    const ErrorFragmentInternal = "_ErrorInternal";
    const EventFragmentInternal = "_EventInternal";
    const ConstructorFragmentInternal = "_ConstructorInternal";
    const FallbackFragmentInternal = "_FallbackInternal";
    const FunctionFragmentInternal = "_FunctionInternal";
    const StructFragmentInternal = "_StructInternal";
    /**
     *  Each input and output of a [[Fragment]] is an Array of **PAramType**.
     */
    class ParamType {
        /**
         *  The local name of the parameter (or ``""`` if unbound)
         */
        name;
        /**
         *  The fully qualified type (e.g. ``"address"``, ``"tuple(address)"``,
         *  ``"uint256[3][]"``)
         */
        type;
        /**
         *  The base type (e.g. ``"address"``, ``"tuple"``, ``"array"``)
         */
        baseType;
        /**
         *  True if the parameters is indexed.
         *
         *  For non-indexable types this is ``null``.
         */
        indexed;
        /**
         *  The components for the tuple.
         *
         *  For non-tuple types this is ``null``.
         */
        components;
        /**
         *  The array length, or ``-1`` for dynamic-lengthed arrays.
         *
         *  For non-array types this is ``null``.
         */
        arrayLength;
        /**
         *  The type of each child in the array.
         *
         *  For non-array types this is ``null``.
         */
        arrayChildren;
        /**
         *  @private
         */
        constructor(guard, name, type, baseType, indexed, components, arrayLength, arrayChildren) {
            assertPrivate(guard, _guard, "ParamType");
            Object.defineProperty(this, internal$1, { value: ParamTypeInternal });
            if (components) {
                components = Object.freeze(components.slice());
            }
            if (baseType === "array") {
                if (arrayLength == null || arrayChildren == null) {
                    throw new Error("");
                }
            }
            else if (arrayLength != null || arrayChildren != null) {
                throw new Error("");
            }
            if (baseType === "tuple") {
                if (components == null) {
                    throw new Error("");
                }
            }
            else if (components != null) {
                throw new Error("");
            }
            defineProperties(this, {
                name, type, baseType, indexed, components, arrayLength, arrayChildren
            });
        }
        /**
         *  Return a string representation of this type.
         *
         *  For example,
         *
         *  ``sighash" => "(uint256,address)"``
         *
         *  ``"minimal" => "tuple(uint256,address) indexed"``
         *
         *  ``"full" => "tuple(uint256 foo, address bar) indexed baz"``
         */
        format(format) {
            if (format == null) {
                format = "sighash";
            }
            if (format === "json") {
                let result = {
                    type: ((this.baseType === "tuple") ? "tuple" : this.type),
                    name: (this.name || undefined)
                };
                if (typeof (this.indexed) === "boolean") {
                    result.indexed = this.indexed;
                }
                if (this.isTuple()) {
                    result.components = this.components.map((c) => JSON.parse(c.format(format)));
                }
                return JSON.stringify(result);
            }
            let result = "";
            // Array
            if (this.isArray()) {
                result += this.arrayChildren.format(format);
                result += `[${(this.arrayLength < 0 ? "" : String(this.arrayLength))}]`;
            }
            else {
                if (this.isTuple()) {
                    if (format !== "sighash") {
                        result += this.type;
                    }
                    result += "(" + this.components.map((comp) => comp.format(format)).join((format === "full") ? ", " : ",") + ")";
                }
                else {
                    result += this.type;
                }
            }
            if (format !== "sighash") {
                if (this.indexed === true) {
                    result += " indexed";
                }
                if (format === "full" && this.name) {
                    result += " " + this.name;
                }
            }
            return result;
        }
        /*
         *  Returns true if %%value%% is an Array type.
         *
         *  This provides a type gaurd ensuring that the
         *  [[arrayChildren]] and [[arrayLength]] are non-null.
         */
        //static isArray(value: any): value is { arrayChildren: ParamType, arrayLength: number } {
        //    return value && (value.baseType === "array")
        //}
        /**
         *  Returns true if %%this%% is an Array type.
         *
         *  This provides a type gaurd ensuring that [[arrayChildren]]
         *  and [[arrayLength]] are non-null.
         */
        isArray() {
            return (this.baseType === "array");
        }
        /**
         *  Returns true if %%this%% is a Tuple type.
         *
         *  This provides a type gaurd ensuring that [[components]]
         *  is non-null.
         */
        isTuple() {
            return (this.baseType === "tuple");
        }
        /**
         *  Returns true if %%this%% is an Indexable type.
         *
         *  This provides a type gaurd ensuring that [[indexed]]
         *  is non-null.
         */
        isIndexable() {
            return (this.indexed != null);
        }
        /**
         *  Walks the **ParamType** with %%value%%, calling %%process%%
         *  on each type, destructing the %%value%% recursively.
         */
        walk(value, process) {
            if (this.isArray()) {
                if (!Array.isArray(value)) {
                    throw new Error("invlaid array value");
                }
                if (this.arrayLength !== -1 && value.length !== this.arrayLength) {
                    throw new Error("array is wrong length");
                }
                const _this = this;
                return value.map((v) => (_this.arrayChildren.walk(v, process)));
            }
            if (this.isTuple()) {
                if (!Array.isArray(value)) {
                    throw new Error("invlaid tuple value");
                }
                if (value.length !== this.components.length) {
                    throw new Error("array is wrong length");
                }
                const _this = this;
                return value.map((v, i) => (_this.components[i].walk(v, process)));
            }
            return process(this.type, value);
        }
        #walkAsync(promises, value, process, setValue) {
            if (this.isArray()) {
                if (!Array.isArray(value)) {
                    throw new Error("invlaid array value");
                }
                if (this.arrayLength !== -1 && value.length !== this.arrayLength) {
                    throw new Error("array is wrong length");
                }
                const childType = this.arrayChildren;
                const result = value.slice();
                result.forEach((value, index) => {
                    childType.#walkAsync(promises, value, process, (value) => {
                        result[index] = value;
                    });
                });
                setValue(result);
                return;
            }
            if (this.isTuple()) {
                const components = this.components;
                // Convert the object into an array
                let result;
                if (Array.isArray(value)) {
                    result = value.slice();
                }
                else {
                    if (value == null || typeof (value) !== "object") {
                        throw new Error("invlaid tuple value");
                    }
                    result = components.map((param) => {
                        if (!param.name) {
                            throw new Error("cannot use object value with unnamed components");
                        }
                        if (!(param.name in value)) {
                            throw new Error(`missing value for component ${param.name}`);
                        }
                        return value[param.name];
                    });
                }
                if (result.length !== this.components.length) {
                    throw new Error("array is wrong length");
                }
                result.forEach((value, index) => {
                    components[index].#walkAsync(promises, value, process, (value) => {
                        result[index] = value;
                    });
                });
                setValue(result);
                return;
            }
            const result = process(this.type, value);
            if (result.then) {
                promises.push((async function () { setValue(await result); })());
            }
            else {
                setValue(result);
            }
        }
        /**
         *  Walks the **ParamType** with %%value%%, asynchronously calling
         *  %%process%% on each type, destructing the %%value%% recursively.
         *
         *  This can be used to resolve ENS naes by walking and resolving each
         *  ``"address"`` type.
         */
        async walkAsync(value, process) {
            const promises = [];
            const result = [value];
            this.#walkAsync(promises, value, process, (value) => {
                result[0] = value;
            });
            if (promises.length) {
                await Promise.all(promises);
            }
            return result[0];
        }
        /**
         *  Creates a new **ParamType** for %%obj%%.
         *
         *  If %%allowIndexed%% then the ``indexed`` keyword is permitted,
         *  otherwise the ``indexed`` keyword will throw an error.
         */
        static from(obj, allowIndexed) {
            if (ParamType.isParamType(obj)) {
                return obj;
            }
            if (typeof (obj) === "string") {
                return ParamType.from(lex(obj), allowIndexed);
            }
            else if (obj instanceof TokenString) {
                let type = "", baseType = "";
                let comps = null;
                if (consumeKeywords(obj, setify(["tuple"])).has("tuple") || obj.peekType("OPEN_PAREN")) {
                    // Tuple
                    baseType = "tuple";
                    comps = obj.popParams().map((t) => ParamType.from(t));
                    type = `tuple(${comps.map((c) => c.format()).join(",")})`;
                }
                else {
                    // Normal
                    type = verifyBasicType(obj.popType("TYPE"));
                    baseType = type;
                }
                // Check for Array
                let arrayChildren = null;
                let arrayLength = null;
                while (obj.length && obj.peekType("BRACKET")) {
                    const bracket = obj.pop(); //arrays[i];
                    arrayChildren = new ParamType(_guard, "", type, baseType, null, comps, arrayLength, arrayChildren);
                    arrayLength = bracket.value;
                    type += bracket.text;
                    baseType = "array";
                    comps = null;
                }
                let indexed = null;
                const keywords = consumeKeywords(obj, KwModifiers);
                if (keywords.has("indexed")) {
                    if (!allowIndexed) {
                        throw new Error("");
                    }
                    indexed = true;
                }
                const name = (obj.peekType("ID") ? obj.pop().text : "");
                if (obj.length) {
                    throw new Error("leftover tokens");
                }
                return new ParamType(_guard, name, type, baseType, indexed, comps, arrayLength, arrayChildren);
            }
            const name = obj.name;
            assertArgument(!name || (typeof (name) === "string" && name.match(regexId)), "invalid name", "obj.name", name);
            let indexed = obj.indexed;
            if (indexed != null) {
                assertArgument(allowIndexed, "parameter cannot be indexed", "obj.indexed", obj.indexed);
                indexed = !!indexed;
            }
            let type = obj.type;
            let arrayMatch = type.match(regexArrayType);
            if (arrayMatch) {
                const arrayLength = parseInt(arrayMatch[2] || "-1");
                const arrayChildren = ParamType.from({
                    type: arrayMatch[1],
                    components: obj.components
                });
                return new ParamType(_guard, name || "", type, "array", indexed, null, arrayLength, arrayChildren);
            }
            if (type === "tuple" || type.startsWith("tuple(" /* fix: ) */) || type.startsWith("(" /* fix: ) */)) {
                const comps = (obj.components != null) ? obj.components.map((c) => ParamType.from(c)) : null;
                const tuple = new ParamType(_guard, name || "", type, "tuple", indexed, comps, null, null);
                // @TODO: use lexer to validate and normalize type
                return tuple;
            }
            type = verifyBasicType(obj.type);
            return new ParamType(_guard, name || "", type, type, indexed, null, null, null);
        }
        /**
         *  Returns true if %%value%% is a **ParamType**.
         */
        static isParamType(value) {
            return (value && value[internal$1] === ParamTypeInternal);
        }
    }
    /**
     *  An abstract class to represent An individual fragment from a parse ABI.
     */
    class Fragment {
        /**
         *  The type of the fragment.
         */
        type;
        /**
         *  The inputs for the fragment.
         */
        inputs;
        /**
         *  @private
         */
        constructor(guard, type, inputs) {
            assertPrivate(guard, _guard, "Fragment");
            inputs = Object.freeze(inputs.slice());
            defineProperties(this, { type, inputs });
        }
        /**
         *  Creates a new **Fragment** for %%obj%%, wich can be any supported
         *  ABI frgament type.
         */
        static from(obj) {
            if (typeof (obj) === "string") {
                // Try parsing JSON...
                try {
                    Fragment.from(JSON.parse(obj));
                }
                catch (e) { }
                // ...otherwise, use the human-readable lexer
                return Fragment.from(lex(obj));
            }
            if (obj instanceof TokenString) {
                // Human-readable ABI (already lexed)
                const type = obj.peekKeyword(KwTypes);
                switch (type) {
                    case "constructor": return ConstructorFragment.from(obj);
                    case "error": return ErrorFragment.from(obj);
                    case "event": return EventFragment.from(obj);
                    case "fallback":
                    case "receive":
                        return FallbackFragment.from(obj);
                    case "function": return FunctionFragment.from(obj);
                    case "struct": return StructFragment.from(obj);
                }
            }
            else if (typeof (obj) === "object") {
                // JSON ABI
                switch (obj.type) {
                    case "constructor": return ConstructorFragment.from(obj);
                    case "error": return ErrorFragment.from(obj);
                    case "event": return EventFragment.from(obj);
                    case "fallback":
                    case "receive":
                        return FallbackFragment.from(obj);
                    case "function": return FunctionFragment.from(obj);
                    case "struct": return StructFragment.from(obj);
                }
                assert$1(false, `unsupported type: ${obj.type}`, "UNSUPPORTED_OPERATION", {
                    operation: "Fragment.from"
                });
            }
            assertArgument(false, "unsupported frgament object", "obj", obj);
        }
        /**
         *  Returns true if %%value%% is a [[ConstructorFragment]].
         */
        static isConstructor(value) {
            return ConstructorFragment.isFragment(value);
        }
        /**
         *  Returns true if %%value%% is an [[ErrorFragment]].
         */
        static isError(value) {
            return ErrorFragment.isFragment(value);
        }
        /**
         *  Returns true if %%value%% is an [[EventFragment]].
         */
        static isEvent(value) {
            return EventFragment.isFragment(value);
        }
        /**
         *  Returns true if %%value%% is a [[FunctionFragment]].
         */
        static isFunction(value) {
            return FunctionFragment.isFragment(value);
        }
        /**
         *  Returns true if %%value%% is a [[StructFragment]].
         */
        static isStruct(value) {
            return StructFragment.isFragment(value);
        }
    }
    /**
     *  An abstract class to represent An individual fragment
     *  which has a name from a parse ABI.
     */
    class NamedFragment extends Fragment {
        /**
         *  The name of the fragment.
         */
        name;
        /**
         *  @private
         */
        constructor(guard, type, name, inputs) {
            super(guard, type, inputs);
            assertArgument(typeof (name) === "string" && name.match(regexId), "invalid identifier", "name", name);
            inputs = Object.freeze(inputs.slice());
            defineProperties(this, { name });
        }
    }
    function joinParams(format, params) {
        return "(" + params.map((p) => p.format(format)).join((format === "full") ? ", " : ",") + ")";
    }
    /**
     *  A Fragment which represents a //Custom Error//.
     */
    class ErrorFragment extends NamedFragment {
        /**
         *  @private
         */
        constructor(guard, name, inputs) {
            super(guard, "error", name, inputs);
            Object.defineProperty(this, internal$1, { value: ErrorFragmentInternal });
        }
        /**
         *  The Custom Error selector.
         */
        get selector() {
            return id(this.format("sighash")).substring(0, 10);
        }
        format(format) {
            if (format == null) {
                format = "sighash";
            }
            if (format === "json") {
                return JSON.stringify({
                    type: "error",
                    name: this.name,
                    inputs: this.inputs.map((input) => JSON.parse(input.format(format))),
                });
            }
            const result = [];
            if (format !== "sighash") {
                result.push("error");
            }
            result.push(this.name + joinParams(format, this.inputs));
            return result.join(" ");
        }
        static from(obj) {
            if (ErrorFragment.isFragment(obj)) {
                return obj;
            }
            if (typeof (obj) === "string") {
                return ErrorFragment.from(lex(obj));
            }
            else if (obj instanceof TokenString) {
                const name = consumeName("error", obj);
                const inputs = consumeParams(obj);
                consumeEoi(obj);
                return new ErrorFragment(_guard, name, inputs);
            }
            return new ErrorFragment(_guard, obj.name, obj.inputs ? obj.inputs.map(ParamType.from) : []);
        }
        static isFragment(value) {
            return (value && value[internal$1] === ErrorFragmentInternal);
        }
    }
    /**
     *  A Fragment which represents an Event.
     */
    class EventFragment extends NamedFragment {
        anonymous;
        /**
         *  @private
         */
        constructor(guard, name, inputs, anonymous) {
            super(guard, "event", name, inputs);
            Object.defineProperty(this, internal$1, { value: EventFragmentInternal });
            defineProperties(this, { anonymous });
        }
        /**
         *  The Event topic hash.
         */
        get topicHash() {
            return id(this.format("sighash"));
        }
        format(format) {
            if (format == null) {
                format = "sighash";
            }
            if (format === "json") {
                return JSON.stringify({
                    type: "event",
                    anonymous: this.anonymous,
                    name: this.name,
                    inputs: this.inputs.map((i) => JSON.parse(i.format(format)))
                });
            }
            const result = [];
            if (format !== "sighash") {
                result.push("event");
            }
            result.push(this.name + joinParams(format, this.inputs));
            if (format !== "sighash" && this.anonymous) {
                result.push("anonymous");
            }
            return result.join(" ");
        }
        static getTopicHash(name, params) {
            params = (params || []).map((p) => ParamType.from(p));
            const fragment = new EventFragment(_guard, name, params, false);
            return fragment.topicHash;
        }
        static from(obj) {
            if (EventFragment.isFragment(obj)) {
                return obj;
            }
            if (typeof (obj) === "string") {
                return EventFragment.from(lex(obj));
            }
            else if (obj instanceof TokenString) {
                const name = consumeName("event", obj);
                const inputs = consumeParams(obj, true);
                const anonymous = !!consumeKeywords(obj, setify(["anonymous"])).has("anonymous");
                consumeEoi(obj);
                return new EventFragment(_guard, name, inputs, anonymous);
            }
            return new EventFragment(_guard, obj.name, obj.inputs ? obj.inputs.map((p) => ParamType.from(p, true)) : [], !!obj.anonymous);
        }
        static isFragment(value) {
            return (value && value[internal$1] === EventFragmentInternal);
        }
    }
    /**
     *  A Fragment which represents a constructor.
     */
    class ConstructorFragment extends Fragment {
        payable;
        gas;
        /**
         *  @private
         */
        constructor(guard, type, inputs, payable, gas) {
            super(guard, type, inputs);
            Object.defineProperty(this, internal$1, { value: ConstructorFragmentInternal });
            defineProperties(this, { payable, gas });
        }
        format(format) {
            assert$1(format != null && format !== "sighash", "cannot format a constructor for sighash", "UNSUPPORTED_OPERATION", { operation: "format(sighash)" });
            if (format === "json") {
                return JSON.stringify({
                    type: "constructor",
                    stateMutability: (this.payable ? "payable" : "undefined"),
                    payable: this.payable,
                    gas: ((this.gas != null) ? this.gas : undefined),
                    inputs: this.inputs.map((i) => JSON.parse(i.format(format)))
                });
            }
            const result = [`constructor${joinParams(format, this.inputs)}`];
            result.push((this.payable) ? "payable" : "nonpayable");
            if (this.gas != null) {
                result.push(`@${this.gas.toString()}`);
            }
            return result.join(" ");
        }
        static from(obj) {
            if (ConstructorFragment.isFragment(obj)) {
                return obj;
            }
            if (typeof (obj) === "string") {
                return ConstructorFragment.from(lex(obj));
            }
            else if (obj instanceof TokenString) {
                consumeKeywords(obj, setify(["constructor"]));
                const inputs = consumeParams(obj);
                const payable = !!consumeKeywords(obj, setify(["payable"])).has("payable");
                const gas = consumeGas(obj);
                consumeEoi(obj);
                return new ConstructorFragment(_guard, "constructor", inputs, payable, gas);
            }
            return new ConstructorFragment(_guard, "constructor", obj.inputs ? obj.inputs.map(ParamType.from) : [], !!obj.payable, (obj.gas != null) ? obj.gas : null);
        }
        static isFragment(value) {
            return (value && value[internal$1] === ConstructorFragmentInternal);
        }
    }
    /**
     *  A Fragment which represents a method.
     */
    class FallbackFragment extends Fragment {
        /**
         *  If the function can be sent value during invocation.
         */
        payable;
        constructor(guard, inputs, payable) {
            super(guard, "fallback", inputs);
            Object.defineProperty(this, internal$1, { value: FallbackFragmentInternal });
            defineProperties(this, { payable });
        }
        format(format) {
            const type = ((this.inputs.length === 0) ? "receive" : "fallback");
            if (format === "json") {
                const stateMutability = (this.payable ? "payable" : "nonpayable");
                return JSON.stringify({ type, stateMutability });
            }
            return `${type}()${this.payable ? " payable" : ""}`;
        }
        static from(obj) {
            if (FallbackFragment.isFragment(obj)) {
                return obj;
            }
            if (typeof (obj) === "string") {
                return FallbackFragment.from(lex(obj));
            }
            else if (obj instanceof TokenString) {
                const errorObj = obj.toString();
                const topIsValid = obj.peekKeyword(setify(["fallback", "receive"]));
                assertArgument(topIsValid, "type must be fallback or receive", "obj", errorObj);
                const type = obj.popKeyword(setify(["fallback", "receive"]));
                // receive()
                if (type === "receive") {
                    const inputs = consumeParams(obj);
                    assertArgument(inputs.length === 0, `receive cannot have arguments`, "obj.inputs", inputs);
                    consumeKeywords(obj, setify(["payable"]));
                    consumeEoi(obj);
                    return new FallbackFragment(_guard, [], true);
                }
                // fallback() [payable]
                // fallback(bytes) [payable] returns (bytes)
                let inputs = consumeParams(obj);
                if (inputs.length) {
                    assertArgument(inputs.length === 1 && inputs[0].type === "bytes", "invalid fallback inputs", "obj.inputs", inputs.map((i) => i.format("minimal")).join(", "));
                }
                else {
                    inputs = [ParamType.from("bytes")];
                }
                const mutability = consumeMutability(obj);
                assertArgument(mutability === "nonpayable" || mutability === "payable", "fallback cannot be constants", "obj.stateMutability", mutability);
                if (consumeKeywords(obj, setify(["returns"])).has("returns")) {
                    const outputs = consumeParams(obj);
                    assertArgument(outputs.length === 1 && outputs[0].type === "bytes", "invalid fallback outputs", "obj.outputs", outputs.map((i) => i.format("minimal")).join(", "));
                }
                consumeEoi(obj);
                return new FallbackFragment(_guard, inputs, mutability === "payable");
            }
            if (obj.type === "receive") {
                return new FallbackFragment(_guard, [], true);
            }
            if (obj.type === "fallback") {
                const inputs = [ParamType.from("bytes")];
                const payable = (obj.stateMutability === "payable");
                return new FallbackFragment(_guard, inputs, payable);
            }
            assertArgument(false, "invalid fallback description", "obj", obj);
        }
        static isFragment(value) {
            return (value && value[internal$1] === FallbackFragmentInternal);
        }
    }
    /**
     *  A Fragment which represents a method.
     */
    class FunctionFragment extends NamedFragment {
        /**
         *  If the function is constant (e.g. ``pure`` or ``view`` functions).
         */
        constant;
        /**
         *  The returned types for the result of calling this function.
         */
        outputs;
        /**
         *  The state mutability (e.g. ``payable``, ``nonpayable``, ``view``
         *  or ``pure``)
         */
        stateMutability;
        /**
         *  If the function can be sent value during invocation.
         */
        payable;
        /**
         *  The amount of gas to send when calling this function
         */
        gas;
        /**
         *  @private
         */
        constructor(guard, name, stateMutability, inputs, outputs, gas) {
            super(guard, "function", name, inputs);
            Object.defineProperty(this, internal$1, { value: FunctionFragmentInternal });
            outputs = Object.freeze(outputs.slice());
            const constant = (stateMutability === "view" || stateMutability === "pure");
            const payable = (stateMutability === "payable");
            defineProperties(this, { constant, gas, outputs, payable, stateMutability });
        }
        /**
         *  The Function selector.
         */
        get selector() {
            return id(this.format("sighash")).substring(0, 10);
        }
        format(format) {
            if (format == null) {
                format = "sighash";
            }
            if (format === "json") {
                return JSON.stringify({
                    type: "function",
                    name: this.name,
                    constant: this.constant,
                    stateMutability: ((this.stateMutability !== "nonpayable") ? this.stateMutability : undefined),
                    payable: this.payable,
                    gas: ((this.gas != null) ? this.gas : undefined),
                    inputs: this.inputs.map((i) => JSON.parse(i.format(format))),
                    outputs: this.outputs.map((o) => JSON.parse(o.format(format))),
                });
            }
            const result = [];
            if (format !== "sighash") {
                result.push("function");
            }
            result.push(this.name + joinParams(format, this.inputs));
            if (format !== "sighash") {
                if (this.stateMutability !== "nonpayable") {
                    result.push(this.stateMutability);
                }
                if (this.outputs && this.outputs.length) {
                    result.push("returns");
                    result.push(joinParams(format, this.outputs));
                }
                if (this.gas != null) {
                    result.push(`@${this.gas.toString()}`);
                }
            }
            return result.join(" ");
        }
        static getSelector(name, params) {
            params = (params || []).map((p) => ParamType.from(p));
            const fragment = new FunctionFragment(_guard, name, "view", params, [], null);
            return fragment.selector;
        }
        static from(obj) {
            if (FunctionFragment.isFragment(obj)) {
                return obj;
            }
            if (typeof (obj) === "string") {
                return FunctionFragment.from(lex(obj));
            }
            else if (obj instanceof TokenString) {
                const name = consumeName("function", obj);
                const inputs = consumeParams(obj);
                const mutability = consumeMutability(obj);
                let outputs = [];
                if (consumeKeywords(obj, setify(["returns"])).has("returns")) {
                    outputs = consumeParams(obj);
                }
                const gas = consumeGas(obj);
                consumeEoi(obj);
                return new FunctionFragment(_guard, name, mutability, inputs, outputs, gas);
            }
            // @TODO: verifyState for stateMutability
            return new FunctionFragment(_guard, obj.name, obj.stateMutability, obj.inputs ? obj.inputs.map(ParamType.from) : [], obj.outputs ? obj.outputs.map(ParamType.from) : [], (obj.gas != null) ? obj.gas : null);
        }
        static isFragment(value) {
            return (value && value[internal$1] === FunctionFragmentInternal);
        }
    }
    /**
     *  A Fragment which represents a structure.
     */
    class StructFragment extends NamedFragment {
        /**
         *  @private
         */
        constructor(guard, name, inputs) {
            super(guard, "struct", name, inputs);
            Object.defineProperty(this, internal$1, { value: StructFragmentInternal });
        }
        format() {
            throw new Error("@TODO");
        }
        static from(obj) {
            if (typeof (obj) === "string") {
                return StructFragment.from(lex(obj));
            }
            else if (obj instanceof TokenString) {
                const name = consumeName("struct", obj);
                const inputs = consumeParams(obj);
                consumeEoi(obj);
                return new StructFragment(_guard, name, inputs);
            }
            return new StructFragment(_guard, obj.name, obj.inputs ? obj.inputs.map(ParamType.from) : []);
        }
        static isFragment(value) {
            return (value && value[internal$1] === StructFragmentInternal);
        }
    }

    /**
     *  When sending values to or receiving values from a [[Contract]], the
     *  data is generally encoded using the [ABI standard](solc-abi-standard).
     *
     *  The AbiCoder provides a utility to encode values to ABI data and
     *  decode values from ABI data.
     *
     *  Most of the time, developers should favour the [[Contract]] class,
     *  which further abstracts a lot of the finer details of ABI data.
     *
     *  @_section api/abi/abi-coder:ABI Encoding
     */
    // https://docs.soliditylang.org/en/v0.8.17/control-structures.html
    const PanicReasons$1 = new Map();
    PanicReasons$1.set(0x00, "GENERIC_PANIC");
    PanicReasons$1.set(0x01, "ASSERT_FALSE");
    PanicReasons$1.set(0x11, "OVERFLOW");
    PanicReasons$1.set(0x12, "DIVIDE_BY_ZERO");
    PanicReasons$1.set(0x21, "ENUM_RANGE_ERROR");
    PanicReasons$1.set(0x22, "BAD_STORAGE_DATA");
    PanicReasons$1.set(0x31, "STACK_UNDERFLOW");
    PanicReasons$1.set(0x32, "ARRAY_RANGE_ERROR");
    PanicReasons$1.set(0x41, "OUT_OF_MEMORY");
    PanicReasons$1.set(0x51, "UNINITIALIZED_FUNCTION_CALL");
    const paramTypeBytes = new RegExp(/^bytes([0-9]*)$/);
    const paramTypeNumber = new RegExp(/^(u?int)([0-9]*)$/);
    let defaultCoder = null;
    function getBuiltinCallException(action, tx, data, abiCoder) {
        let message = "missing revert data";
        let reason = null;
        const invocation = null;
        let revert = null;
        if (data) {
            message = "execution reverted";
            const bytes = getBytes(data);
            data = hexlify(data);
            if (bytes.length === 0) {
                message += " (no data present; likely require(false) occurred";
                reason = "require(false)";
            }
            else if (bytes.length % 32 !== 4) {
                message += " (could not decode reason; invalid data length)";
            }
            else if (hexlify(bytes.slice(0, 4)) === "0x08c379a0") {
                // Error(string)
                try {
                    reason = abiCoder.decode(["string"], bytes.slice(4))[0];
                    revert = {
                        signature: "Error(string)",
                        name: "Error",
                        args: [reason]
                    };
                    message += `: ${JSON.stringify(reason)}`;
                }
                catch (error) {
                    message += " (could not decode reason; invalid string data)";
                }
            }
            else if (hexlify(bytes.slice(0, 4)) === "0x4e487b71") {
                // Panic(uint256)
                try {
                    const code = Number(abiCoder.decode(["uint256"], bytes.slice(4))[0]);
                    revert = {
                        signature: "Panic(uint256)",
                        name: "Panic",
                        args: [code]
                    };
                    reason = `Panic due to ${PanicReasons$1.get(code) || "UNKNOWN"}(${code})`;
                    message += `: ${reason}`;
                }
                catch (error) {
                    message += " (could not decode panic code)";
                }
            }
            else {
                message += " (unknown custom error)";
            }
        }
        const transaction = {
            to: (tx.to ? getAddress(tx.to) : null),
            data: (tx.data || "0x")
        };
        if (tx.from) {
            transaction.from = getAddress(tx.from);
        }
        return makeError(message, "CALL_EXCEPTION", {
            action, data, reason, transaction, invocation, revert
        });
    }
    /**
      * About AbiCoder
      */
    class AbiCoder {
        #getCoder(param) {
            if (param.isArray()) {
                return new ArrayCoder(this.#getCoder(param.arrayChildren), param.arrayLength, param.name);
            }
            if (param.isTuple()) {
                return new TupleCoder(param.components.map((c) => this.#getCoder(c)), param.name);
            }
            switch (param.baseType) {
                case "address":
                    return new AddressCoder(param.name);
                case "bool":
                    return new BooleanCoder(param.name);
                case "string":
                    return new StringCoder(param.name);
                case "bytes":
                    return new BytesCoder(param.name);
                case "":
                    return new NullCoder(param.name);
            }
            // u?int[0-9]*
            let match = param.type.match(paramTypeNumber);
            if (match) {
                let size = parseInt(match[2] || "256");
                assertArgument(size !== 0 && size <= 256 && (size % 8) === 0, "invalid " + match[1] + " bit length", "param", param);
                return new NumberCoder(size / 8, (match[1] === "int"), param.name);
            }
            // bytes[0-9]+
            match = param.type.match(paramTypeBytes);
            if (match) {
                let size = parseInt(match[1]);
                assertArgument(size !== 0 && size <= 32, "invalid bytes length", "param", param);
                return new FixedBytesCoder(size, param.name);
            }
            assertArgument(false, "invalid type", "type", param.type);
        }
        /**
         *  Get the default values for the given %%types%%.
         *
         *  For example, a ``uint`` is by default ``0`` and ``bool``
         *  is by default ``false``.
         */
        getDefaultValue(types) {
            const coders = types.map((type) => this.#getCoder(ParamType.from(type)));
            const coder = new TupleCoder(coders, "_");
            return coder.defaultValue();
        }
        /**
         *  Encode the %%values%% as the %%types%% into ABI data.
         *
         *  @returns DataHexstring
         */
        encode(types, values) {
            assertArgumentCount(values.length, types.length, "types/values length mismatch");
            const coders = types.map((type) => this.#getCoder(ParamType.from(type)));
            const coder = (new TupleCoder(coders, "_"));
            const writer = new Writer();
            coder.encode(writer, values);
            return writer.data;
        }
        /**
         *  Decode the ABI %%data%% as the %%types%% into values.
         *
         *  If %%loose%% decoding is enabled, then strict padding is
         *  not enforced. Some older versions of Solidity incorrectly
         *  padded event data emitted from ``external`` functions.
         */
        decode(types, data, loose) {
            const coders = types.map((type) => this.#getCoder(ParamType.from(type)));
            const coder = new TupleCoder(coders, "_");
            return coder.decode(new Reader(data, loose));
        }
        /**
         *  Returns the shared singleton instance of a default [[AbiCoder]].
         *
         *  On the first call, the instance is created internally.
         */
        static defaultAbiCoder() {
            if (defaultCoder == null) {
                defaultCoder = new AbiCoder();
            }
            return defaultCoder;
        }
        /**
         *  Returns an ethers-compatible [[CallExceptionError]] Error for the given
         *  result %%data%% for the [[CallExceptionAction]] %%action%% against
         *  the Transaction %%tx%%.
         */
        static getBuiltinCallException(action, tx, data) {
            return getBuiltinCallException(action, tx, data, AbiCoder.defaultAbiCoder());
        }
    }

    /**
     *  About Interface
     *
     *  @_subsection api/abi:Interfaces  [interfaces]
     */
    class LogDescription {
        fragment;
        name;
        signature;
        topic;
        args;
        constructor(fragment, topic, args) {
            const name = fragment.name, signature = fragment.format();
            defineProperties(this, {
                fragment, name, signature, topic, args
            });
        }
    }
    class TransactionDescription {
        fragment;
        name;
        args;
        signature;
        selector;
        value;
        constructor(fragment, selector, args, value) {
            const name = fragment.name, signature = fragment.format();
            defineProperties(this, {
                fragment, name, args, signature, selector, value
            });
        }
    }
    class ErrorDescription {
        fragment;
        name;
        args;
        signature;
        selector;
        constructor(fragment, selector, args) {
            const name = fragment.name, signature = fragment.format();
            defineProperties(this, {
                fragment, name, args, signature, selector
            });
        }
    }
    class Indexed {
        hash;
        _isIndexed;
        static isIndexed(value) {
            return !!(value && value._isIndexed);
        }
        constructor(hash) {
            defineProperties(this, { hash, _isIndexed: true });
        }
    }
    // https://docs.soliditylang.org/en/v0.8.13/control-structures.html?highlight=panic#panic-via-assert-and-error-via-require
    const PanicReasons = {
        "0": "generic panic",
        "1": "assert(false)",
        "17": "arithmetic overflow",
        "18": "division or modulo by zero",
        "33": "enum overflow",
        "34": "invalid encoded storage byte array accessed",
        "49": "out-of-bounds array access; popping on an empty array",
        "50": "out-of-bounds access of an array or bytesN",
        "65": "out of memory",
        "81": "uninitialized function",
    };
    const BuiltinErrors = {
        "0x08c379a0": {
            signature: "Error(string)",
            name: "Error",
            inputs: ["string"],
            reason: (message) => {
                return `reverted with reason string ${JSON.stringify(message)}`;
            }
        },
        "0x4e487b71": {
            signature: "Panic(uint256)",
            name: "Panic",
            inputs: ["uint256"],
            reason: (code) => {
                let reason = "unknown panic code";
                if (code >= 0 && code <= 0xff && PanicReasons[code.toString()]) {
                    reason = PanicReasons[code.toString()];
                }
                return `reverted with panic code 0x${code.toString(16)} (${reason})`;
            }
        }
    };
    /**
     *  An Interface abstracts many of the low-level details for
     *  encoding and decoding the data on the blockchain.
     *
     *  An ABI provides information on how to encode data to send to
     *  a Contract, how to decode the results and events and how to
     *  interpret revert errors.
     *
     *  The ABI can be specified by [any supported format](InterfaceAbi).
     */
    class Interface {
        /**
         *  All the Contract ABI members (i.e. methods, events, errors, etc).
         */
        fragments;
        /**
         *  The Contract constructor.
         */
        deploy;
        /**
         *  The Fallback method, if any.
         */
        fallback;
        /**
         *  If receiving ether is supported.
         */
        receive;
        #errors;
        #events;
        #functions;
        //    #structs: Map<string, StructFragment>;
        #abiCoder;
        /**
         *  Create a new Interface for the %%fragments%%.
         */
        constructor(fragments) {
            let abi = [];
            if (typeof (fragments) === "string") {
                abi = JSON.parse(fragments);
            }
            else {
                abi = fragments;
            }
            this.#functions = new Map();
            this.#errors = new Map();
            this.#events = new Map();
            //        this.#structs = new Map();
            const frags = [];
            for (const a of abi) {
                try {
                    frags.push(Fragment.from(a));
                }
                catch (error) {
                    console.log("EE", error);
                }
            }
            defineProperties(this, {
                fragments: Object.freeze(frags)
            });
            let fallback = null;
            let receive = false;
            this.#abiCoder = this.getAbiCoder();
            // Add all fragments by their signature
            this.fragments.forEach((fragment, index) => {
                let bucket;
                switch (fragment.type) {
                    case "constructor":
                        if (this.deploy) {
                            console.log("duplicate definition - constructor");
                            return;
                        }
                        //checkNames(fragment, "input", fragment.inputs);
                        defineProperties(this, { deploy: fragment });
                        return;
                    case "fallback":
                        if (fragment.inputs.length === 0) {
                            receive = true;
                        }
                        else {
                            assertArgument(!fallback || fragment.payable !== fallback.payable, "conflicting fallback fragments", `fragments[${index}]`, fragment);
                            fallback = fragment;
                            receive = fallback.payable;
                        }
                        return;
                    case "function":
                        //checkNames(fragment, "input", fragment.inputs);
                        //checkNames(fragment, "output", (<FunctionFragment>fragment).outputs);
                        bucket = this.#functions;
                        break;
                    case "event":
                        //checkNames(fragment, "input", fragment.inputs);
                        bucket = this.#events;
                        break;
                    case "error":
                        bucket = this.#errors;
                        break;
                    default:
                        return;
                }
                // Two identical entries; ignore it
                const signature = fragment.format();
                if (bucket.has(signature)) {
                    return;
                }
                bucket.set(signature, fragment);
            });
            // If we do not have a constructor add a default
            if (!this.deploy) {
                defineProperties(this, {
                    deploy: ConstructorFragment.from("constructor()")
                });
            }
            defineProperties(this, { fallback, receive });
        }
        /**
         *  Returns the entire Human-Readable ABI, as an array of
         *  signatures, optionally as %%minimal%% strings, which
         *  removes parameter names and unneceesary spaces.
         */
        format(minimal) {
            const format = (minimal ? "minimal" : "full");
            const abi = this.fragments.map((f) => f.format(format));
            return abi;
        }
        /**
         *  Return the JSON-encoded ABI. This is the format Solidiy
         *  returns.
         */
        formatJson() {
            const abi = this.fragments.map((f) => f.format("json"));
            // We need to re-bundle the JSON fragments a bit
            return JSON.stringify(abi.map((j) => JSON.parse(j)));
        }
        /**
         *  The ABI coder that will be used to encode and decode binary
         *  data.
         */
        getAbiCoder() {
            return AbiCoder.defaultAbiCoder();
        }
        // Find a function definition by any means necessary (unless it is ambiguous)
        #getFunction(key, values, forceUnique) {
            // Selector
            if (isHexString(key)) {
                const selector = key.toLowerCase();
                for (const fragment of this.#functions.values()) {
                    if (selector === fragment.selector) {
                        return fragment;
                    }
                }
                return null;
            }
            // It is a bare name, look up the function (will return null if ambiguous)
            if (key.indexOf("(") === -1) {
                const matching = [];
                for (const [name, fragment] of this.#functions) {
                    if (name.split("(" /* fix:) */)[0] === key) {
                        matching.push(fragment);
                    }
                }
                if (values) {
                    const lastValue = (values.length > 0) ? values[values.length - 1] : null;
                    let valueLength = values.length;
                    let allowOptions = true;
                    if (Typed.isTyped(lastValue) && lastValue.type === "overrides") {
                        allowOptions = false;
                        valueLength--;
                    }
                    // Remove all matches that don't have a compatible length. The args
                    // may contain an overrides, so the match may have n or n - 1 parameters
                    for (let i = matching.length - 1; i >= 0; i--) {
                        const inputs = matching[i].inputs.length;
                        if (inputs !== valueLength && (!allowOptions || inputs !== valueLength - 1)) {
                            matching.splice(i, 1);
                        }
                    }
                    // Remove all matches that don't match the Typed signature
                    for (let i = matching.length - 1; i >= 0; i--) {
                        const inputs = matching[i].inputs;
                        for (let j = 0; j < values.length; j++) {
                            // Not a typed value
                            if (!Typed.isTyped(values[j])) {
                                continue;
                            }
                            // We are past the inputs
                            if (j >= inputs.length) {
                                if (values[j].type === "overrides") {
                                    continue;
                                }
                                matching.splice(i, 1);
                                break;
                            }
                            // Make sure the value type matches the input type
                            if (values[j].type !== inputs[j].baseType) {
                                matching.splice(i, 1);
                                break;
                            }
                        }
                    }
                }
                // We found a single matching signature with an overrides, but the
                // last value is something that cannot possibly be an options
                if (matching.length === 1 && values && values.length !== matching[0].inputs.length) {
                    const lastArg = values[values.length - 1];
                    if (lastArg == null || Array.isArray(lastArg) || typeof (lastArg) !== "object") {
                        matching.splice(0, 1);
                    }
                }
                if (matching.length === 0) {
                    return null;
                }
                if (matching.length > 1 && forceUnique) {
                    const matchStr = matching.map((m) => JSON.stringify(m.format())).join(", ");
                    assertArgument(false, `ambiguous function description (i.e. matches ${matchStr})`, "key", key);
                }
                return matching[0];
            }
            // Normalize the signature and lookup the function
            const result = this.#functions.get(FunctionFragment.from(key).format());
            if (result) {
                return result;
            }
            return null;
        }
        /**
         *  Get the function name for %%key%%, which may be a function selector,
         *  function name or function signature that belongs to the ABI.
         */
        getFunctionName(key) {
            const fragment = this.#getFunction(key, null, false);
            assertArgument(fragment, "no matching function", "key", key);
            return fragment.name;
        }
        /**
         *  Get the [[FunctionFragment]] for %%key%%, which may be a function
         *  selector, function name or function signature that belongs to the ABI.
         *
         *  If %%values%% is provided, it will use the Typed API to handle
         *  ambiguous cases where multiple functions match by name.
         *
         *  If the %%key%% and %%values%% do not refine to a single function in
         *  the ABI, this will throw.
         */
        getFunction(key, values) {
            return this.#getFunction(key, values || null, true);
        }
        /**
         *  Iterate over all functions, calling %%callback%%, sorted by their name.
         */
        forEachFunction(callback) {
            const names = Array.from(this.#functions.keys());
            names.sort((a, b) => a.localeCompare(b));
            for (let i = 0; i < names.length; i++) {
                const name = names[i];
                callback((this.#functions.get(name)), i);
            }
        }
        // Find an event definition by any means necessary (unless it is ambiguous)
        #getEvent(key, values, forceUnique) {
            // EventTopic
            if (isHexString(key)) {
                const eventTopic = key.toLowerCase();
                for (const fragment of this.#events.values()) {
                    if (eventTopic === fragment.topicHash) {
                        return fragment;
                    }
                }
                return null;
            }
            // It is a bare name, look up the function (will return null if ambiguous)
            if (key.indexOf("(") === -1) {
                const matching = [];
                for (const [name, fragment] of this.#events) {
                    if (name.split("(" /* fix:) */)[0] === key) {
                        matching.push(fragment);
                    }
                }
                if (values) {
                    // Remove all matches that don't have a compatible length.
                    for (let i = matching.length - 1; i >= 0; i--) {
                        if (matching[i].inputs.length < values.length) {
                            matching.splice(i, 1);
                        }
                    }
                    // Remove all matches that don't match the Typed signature
                    for (let i = matching.length - 1; i >= 0; i--) {
                        const inputs = matching[i].inputs;
                        for (let j = 0; j < values.length; j++) {
                            // Not a typed value
                            if (!Typed.isTyped(values[j])) {
                                continue;
                            }
                            // Make sure the value type matches the input type
                            if (values[j].type !== inputs[j].baseType) {
                                matching.splice(i, 1);
                                break;
                            }
                        }
                    }
                }
                if (matching.length === 0) {
                    return null;
                }
                if (matching.length > 1 && forceUnique) {
                    const matchStr = matching.map((m) => JSON.stringify(m.format())).join(", ");
                    assertArgument(false, `ambiguous event description (i.e. matches ${matchStr})`, "key", key);
                }
                return matching[0];
            }
            // Normalize the signature and lookup the function
            const result = this.#events.get(EventFragment.from(key).format());
            if (result) {
                return result;
            }
            return null;
        }
        /**
         *  Get the event name for %%key%%, which may be a topic hash,
         *  event name or event signature that belongs to the ABI.
         */
        getEventName(key) {
            const fragment = this.#getEvent(key, null, false);
            assertArgument(fragment, "no matching event", "key", key);
            return fragment.name;
        }
        /**
         *  Get the [[EventFragment]] for %%key%%, which may be a topic hash,
         *  event name or event signature that belongs to the ABI.
         *
         *  If %%values%% is provided, it will use the Typed API to handle
         *  ambiguous cases where multiple events match by name.
         *
         *  If the %%key%% and %%values%% do not refine to a single event in
         *  the ABI, this will throw.
         */
        getEvent(key, values) {
            return this.#getEvent(key, values || null, true);
        }
        /**
         *  Iterate over all events, calling %%callback%%, sorted by their name.
         */
        forEachEvent(callback) {
            const names = Array.from(this.#events.keys());
            names.sort((a, b) => a.localeCompare(b));
            for (let i = 0; i < names.length; i++) {
                const name = names[i];
                callback((this.#events.get(name)), i);
            }
        }
        /**
         *  Get the [[ErrorFragment]] for %%key%%, which may be an error
         *  selector, error name or error signature that belongs to the ABI.
         *
         *  If %%values%% is provided, it will use the Typed API to handle
         *  ambiguous cases where multiple errors match by name.
         *
         *  If the %%key%% and %%values%% do not refine to a single error in
         *  the ABI, this will throw.
         */
        getError(key, values) {
            if (isHexString(key)) {
                const selector = key.toLowerCase();
                if (BuiltinErrors[selector]) {
                    return ErrorFragment.from(BuiltinErrors[selector].signature);
                }
                for (const fragment of this.#errors.values()) {
                    if (selector === fragment.selector) {
                        return fragment;
                    }
                }
                return null;
            }
            // It is a bare name, look up the function (will return null if ambiguous)
            if (key.indexOf("(") === -1) {
                const matching = [];
                for (const [name, fragment] of this.#errors) {
                    if (name.split("(" /* fix:) */)[0] === key) {
                        matching.push(fragment);
                    }
                }
                if (matching.length === 0) {
                    if (key === "Error") {
                        return ErrorFragment.from("error Error(string)");
                    }
                    if (key === "Panic") {
                        return ErrorFragment.from("error Panic(uint256)");
                    }
                    return null;
                }
                else if (matching.length > 1) {
                    const matchStr = matching.map((m) => JSON.stringify(m.format())).join(", ");
                    assertArgument(false, `ambiguous error description (i.e. ${matchStr})`, "name", key);
                }
                return matching[0];
            }
            // Normalize the signature and lookup the function
            key = ErrorFragment.from(key).format();
            if (key === "Error(string)") {
                return ErrorFragment.from("error Error(string)");
            }
            if (key === "Panic(uint256)") {
                return ErrorFragment.from("error Panic(uint256)");
            }
            const result = this.#errors.get(key);
            if (result) {
                return result;
            }
            return null;
        }
        /**
         *  Iterate over all errors, calling %%callback%%, sorted by their name.
         */
        forEachError(callback) {
            const names = Array.from(this.#errors.keys());
            names.sort((a, b) => a.localeCompare(b));
            for (let i = 0; i < names.length; i++) {
                const name = names[i];
                callback((this.#errors.get(name)), i);
            }
        }
        // Get the 4-byte selector used by Solidity to identify a function
        /*
    getSelector(fragment: ErrorFragment | FunctionFragment): string {
        if (typeof(fragment) === "string") {
            const matches: Array<Fragment> = [ ];

            try { matches.push(this.getFunction(fragment)); } catch (error) { }
            try { matches.push(this.getError(<string>fragment)); } catch (_) { }

            if (matches.length === 0) {
                logger.throwArgumentError("unknown fragment", "key", fragment);
            } else if (matches.length > 1) {
                logger.throwArgumentError("ambiguous fragment matches function and error", "key", fragment);
            }

            fragment = matches[0];
        }

        return dataSlice(id(fragment.format()), 0, 4);
    }
        */
        // Get the 32-byte topic hash used by Solidity to identify an event
        /*
        getEventTopic(fragment: EventFragment): string {
            //if (typeof(fragment) === "string") { fragment = this.getEvent(eventFragment); }
            return id(fragment.format());
        }
        */
        _decodeParams(params, data) {
            return this.#abiCoder.decode(params, data);
        }
        _encodeParams(params, values) {
            return this.#abiCoder.encode(params, values);
        }
        /**
         *  Encodes a ``tx.data`` object for deploying the Contract with
         *  the %%values%% as the constructor arguments.
         */
        encodeDeploy(values) {
            return this._encodeParams(this.deploy.inputs, values || []);
        }
        /**
         *  Decodes the result %%data%% (e.g. from an ``eth_call``) for the
         *  specified error (see [[getError]] for valid values for
         *  %%key%%).
         *
         *  Most developers should prefer the [[parseCallResult]] method instead,
         *  which will automatically detect a ``CALL_EXCEPTION`` and throw the
         *  corresponding error.
         */
        decodeErrorResult(fragment, data) {
            if (typeof (fragment) === "string") {
                const f = this.getError(fragment);
                assertArgument(f, "unknown error", "fragment", fragment);
                fragment = f;
            }
            assertArgument(dataSlice(data, 0, 4) === fragment.selector, `data signature does not match error ${fragment.name}.`, "data", data);
            return this._decodeParams(fragment.inputs, dataSlice(data, 4));
        }
        /**
         *  Encodes the transaction revert data for a call result that
         *  reverted from the the Contract with the sepcified %%error%%
         *  (see [[getError]] for valid values for %%fragment%%) with the %%values%%.
         *
         *  This is generally not used by most developers, unless trying to mock
         *  a result from a Contract.
         */
        encodeErrorResult(fragment, values) {
            if (typeof (fragment) === "string") {
                const f = this.getError(fragment);
                assertArgument(f, "unknown error", "fragment", fragment);
                fragment = f;
            }
            return concat([
                fragment.selector,
                this._encodeParams(fragment.inputs, values || [])
            ]);
        }
        /**
         *  Decodes the %%data%% from a transaction ``tx.data`` for
         *  the function specified (see [[getFunction]] for valid values
         *  for %%fragment%%).
         *
         *  Most developers should prefer the [[parseTransaction]] method
         *  instead, which will automatically detect the fragment.
         */
        decodeFunctionData(fragment, data) {
            if (typeof (fragment) === "string") {
                const f = this.getFunction(fragment);
                assertArgument(f, "unknown function", "fragment", fragment);
                fragment = f;
            }
            assertArgument(dataSlice(data, 0, 4) === fragment.selector, `data signature does not match function ${fragment.name}.`, "data", data);
            return this._decodeParams(fragment.inputs, dataSlice(data, 4));
        }
        /**
         *  Encodes the ``tx.data`` for a transaction that calls the function
         *  specified (see [[getFunction]] for valid values for %%fragment%%) with
         *  the %%values%%.
         */
        encodeFunctionData(fragment, values) {
            if (typeof (fragment) === "string") {
                const f = this.getFunction(fragment);
                assertArgument(f, "unknown function", "fragment", fragment);
                fragment = f;
            }
            return concat([
                fragment.selector,
                this._encodeParams(fragment.inputs, values || [])
            ]);
        }
        /**
         *  Decodes the result %%data%% (e.g. from an ``eth_call``) for the
         *  specified function (see [[getFunction]] for valid values for
         *  %%key%%).
         *
         *  Most developers should prefer the [[parseCallResult]] method instead,
         *  which will automatically detect a ``CALL_EXCEPTION`` and throw the
         *  corresponding error.
         */
        decodeFunctionResult(fragment, data) {
            if (typeof (fragment) === "string") {
                const f = this.getFunction(fragment);
                assertArgument(f, "unknown function", "fragment", fragment);
                fragment = f;
            }
            let message = "invalid length for result data";
            const bytes = getBytesCopy(data);
            if ((bytes.length % 32) === 0) {
                try {
                    return this.#abiCoder.decode(fragment.outputs, bytes);
                }
                catch (error) {
                    message = "could not decode result data";
                }
            }
            // Call returned data with no error, but the data is junk
            assert$1(false, message, "BAD_DATA", {
                value: hexlify(bytes),
                info: { method: fragment.name, signature: fragment.format() }
            });
        }
        makeError(_data, tx) {
            const data = getBytes(_data, "data");
            const error = AbiCoder.getBuiltinCallException("call", tx, data);
            // Not a built-in error; try finding a custom error
            const customPrefix = "execution reverted (unknown custom error)";
            if (error.message.startsWith(customPrefix)) {
                const selector = hexlify(data.slice(0, 4));
                const ef = this.getError(selector);
                if (ef) {
                    try {
                        const args = this.#abiCoder.decode(ef.inputs, data.slice(4));
                        error.revert = {
                            name: ef.name, signature: ef.format(), args
                        };
                        error.reason = error.revert.signature;
                        error.message = `execution reverted: ${error.reason}`;
                    }
                    catch (e) {
                        error.message = `execution reverted (coult not decode custom error)`;
                    }
                }
            }
            // Add the invocation, if available
            const parsed = this.parseTransaction(tx);
            if (parsed) {
                error.invocation = {
                    method: parsed.name,
                    signature: parsed.signature,
                    args: parsed.args
                };
            }
            return error;
        }
        /**
         *  Encodes the result data (e.g. from an ``eth_call``) for the
         *  specified function (see [[getFunction]] for valid values
         *  for %%fragment%%) with %%values%%.
         *
         *  This is generally not used by most developers, unless trying to mock
         *  a result from a Contract.
         */
        encodeFunctionResult(fragment, values) {
            if (typeof (fragment) === "string") {
                const f = this.getFunction(fragment);
                assertArgument(f, "unknown function", "fragment", fragment);
                fragment = f;
            }
            return hexlify(this.#abiCoder.encode(fragment.outputs, values || []));
        }
        /*
            spelunk(inputs: Array<ParamType>, values: ReadonlyArray<any>, processfunc: (type: string, value: any) => Promise<any>): Promise<Array<any>> {
                const promises: Array<Promise<>> = [ ];
                const process = function(type: ParamType, value: any): any {
                    if (type.baseType === "array") {
                        return descend(type.child
                    }
                    if (type. === "address") {
                    }
                };
        
                const descend = function (inputs: Array<ParamType>, values: ReadonlyArray<any>) {
                    if (inputs.length !== values.length) { throw new Error("length mismatch"); }
                    
                };
        
                const result: Array<any> = [ ];
                values.forEach((value, index) => {
                    if (value == null) {
                        topics.push(null);
                    } else if (param.baseType === "array" || param.baseType === "tuple") {
                        logger.throwArgumentError("filtering with tuples or arrays not supported", ("contract." + param.name), value);
                    } else if (Array.isArray(value)) {
                        topics.push(value.map((value) => encodeTopic(param, value)));
                    } else {
                        topics.push(encodeTopic(param, value));
                    }
                });
            }
        */
        // Create the filter for the event with search criteria (e.g. for eth_filterLog)
        encodeFilterTopics(fragment, values) {
            if (typeof (fragment) === "string") {
                const f = this.getEvent(fragment);
                assertArgument(f, "unknown event", "eventFragment", fragment);
                fragment = f;
            }
            assert$1(values.length <= fragment.inputs.length, `too many arguments for ${fragment.format()}`, "UNEXPECTED_ARGUMENT", { count: values.length, expectedCount: fragment.inputs.length });
            const topics = [];
            if (!fragment.anonymous) {
                topics.push(fragment.topicHash);
            }
            // @TODO: Use the coders for this; to properly support tuples, etc.
            const encodeTopic = (param, value) => {
                if (param.type === "string") {
                    return id(value);
                }
                else if (param.type === "bytes") {
                    return keccak256(hexlify(value));
                }
                if (param.type === "bool" && typeof (value) === "boolean") {
                    value = (value ? "0x01" : "0x00");
                }
                if (param.type.match(/^u?int/)) {
                    value = toBeHex(value);
                }
                // Check addresses are valid
                if (param.type === "address") {
                    this.#abiCoder.encode(["address"], [value]);
                }
                return zeroPadValue(hexlify(value), 32);
                //@TOOD should probably be return toHex(value, 32)
            };
            values.forEach((value, index) => {
                const param = fragment.inputs[index];
                if (!param.indexed) {
                    assertArgument(value == null, "cannot filter non-indexed parameters; must be null", ("contract." + param.name), value);
                    return;
                }
                if (value == null) {
                    topics.push(null);
                }
                else if (param.baseType === "array" || param.baseType === "tuple") {
                    assertArgument(false, "filtering with tuples or arrays not supported", ("contract." + param.name), value);
                }
                else if (Array.isArray(value)) {
                    topics.push(value.map((value) => encodeTopic(param, value)));
                }
                else {
                    topics.push(encodeTopic(param, value));
                }
            });
            // Trim off trailing nulls
            while (topics.length && topics[topics.length - 1] === null) {
                topics.pop();
            }
            return topics;
        }
        encodeEventLog(fragment, values) {
            if (typeof (fragment) === "string") {
                const f = this.getEvent(fragment);
                assertArgument(f, "unknown event", "eventFragment", fragment);
                fragment = f;
            }
            const topics = [];
            const dataTypes = [];
            const dataValues = [];
            if (!fragment.anonymous) {
                topics.push(fragment.topicHash);
            }
            assertArgument(values.length === fragment.inputs.length, "event arguments/values mismatch", "values", values);
            fragment.inputs.forEach((param, index) => {
                const value = values[index];
                if (param.indexed) {
                    if (param.type === "string") {
                        topics.push(id(value));
                    }
                    else if (param.type === "bytes") {
                        topics.push(keccak256(value));
                    }
                    else if (param.baseType === "tuple" || param.baseType === "array") {
                        // @TODO
                        throw new Error("not implemented");
                    }
                    else {
                        topics.push(this.#abiCoder.encode([param.type], [value]));
                    }
                }
                else {
                    dataTypes.push(param);
                    dataValues.push(value);
                }
            });
            return {
                data: this.#abiCoder.encode(dataTypes, dataValues),
                topics: topics
            };
        }
        // Decode a filter for the event and the search criteria
        decodeEventLog(fragment, data, topics) {
            if (typeof (fragment) === "string") {
                const f = this.getEvent(fragment);
                assertArgument(f, "unknown event", "eventFragment", fragment);
                fragment = f;
            }
            if (topics != null && !fragment.anonymous) {
                const eventTopic = fragment.topicHash;
                assertArgument(isHexString(topics[0], 32) && topics[0].toLowerCase() === eventTopic, "fragment/topic mismatch", "topics[0]", topics[0]);
                topics = topics.slice(1);
            }
            const indexed = [];
            const nonIndexed = [];
            const dynamic = [];
            fragment.inputs.forEach((param, index) => {
                if (param.indexed) {
                    if (param.type === "string" || param.type === "bytes" || param.baseType === "tuple" || param.baseType === "array") {
                        indexed.push(ParamType.from({ type: "bytes32", name: param.name }));
                        dynamic.push(true);
                    }
                    else {
                        indexed.push(param);
                        dynamic.push(false);
                    }
                }
                else {
                    nonIndexed.push(param);
                    dynamic.push(false);
                }
            });
            const resultIndexed = (topics != null) ? this.#abiCoder.decode(indexed, concat(topics)) : null;
            const resultNonIndexed = this.#abiCoder.decode(nonIndexed, data, true);
            //const result: (Array<any> & { [ key: string ]: any }) = [ ];
            const values = [];
            const keys = [];
            let nonIndexedIndex = 0, indexedIndex = 0;
            fragment.inputs.forEach((param, index) => {
                let value = null;
                if (param.indexed) {
                    if (resultIndexed == null) {
                        value = new Indexed(null);
                    }
                    else if (dynamic[index]) {
                        value = new Indexed(resultIndexed[indexedIndex++]);
                    }
                    else {
                        try {
                            value = resultIndexed[indexedIndex++];
                        }
                        catch (error) {
                            value = error;
                        }
                    }
                }
                else {
                    try {
                        value = resultNonIndexed[nonIndexedIndex++];
                    }
                    catch (error) {
                        value = error;
                    }
                }
                values.push(value);
                keys.push(param.name || null);
            });
            return Result.fromItems(values, keys);
        }
        /**
         *  Parses a transaction, finding the matching function and extracts
         *  the parameter values along with other useful function details.
         *
         *  If the matching function cannot be found, return null.
         */
        parseTransaction(tx) {
            const data = getBytes(tx.data, "tx.data");
            const value = getBigInt((tx.value != null) ? tx.value : 0, "tx.value");
            const fragment = this.getFunction(hexlify(data.slice(0, 4)));
            if (!fragment) {
                return null;
            }
            const args = this.#abiCoder.decode(fragment.inputs, data.slice(4));
            return new TransactionDescription(fragment, fragment.selector, args, value);
        }
        parseCallResult(data) {
            throw new Error("@TODO");
        }
        /**
         *  Parses a receipt log, finding the matching event and extracts
         *  the parameter values along with other useful event details.
         *
         *  If the matching event cannot be found, returns null.
         */
        parseLog(log) {
            const fragment = this.getEvent(log.topics[0]);
            if (!fragment || fragment.anonymous) {
                return null;
            }
            // @TODO: If anonymous, and the only method, and the input count matches, should we parse?
            //        Probably not, because just because it is the only event in the ABI does
            //        not mean we have the full ABI; maybe just a fragment?
            return new LogDescription(fragment, fragment.topicHash, this.decodeEventLog(fragment, log.data, log.topics));
        }
        /**
         *  Parses a revert data, finding the matching error and extracts
         *  the parameter values along with other useful error details.
         *
         *  If the matching event cannot be found, returns null.
         */
        parseError(data) {
            const hexData = hexlify(data);
            const fragment = this.getError(dataSlice(hexData, 0, 4));
            if (!fragment) {
                return null;
            }
            const args = this.#abiCoder.decode(fragment.inputs, dataSlice(hexData, 4));
            return new ErrorDescription(fragment, fragment.selector, args);
        }
        /**
         *  Creates a new [[Interface]] from the ABI %%value%%.
         *
         *  The %%value%% may be provided as an existing [[Interface]] object,
         *  a JSON-encoded ABI or any Human-Readable ABI format.
         */
        static from(value) {
            // Already an Interface, which is immutable
            if (value instanceof Interface) {
                return value;
            }
            // JSON
            if (typeof (value) === "string") {
                return new Interface(JSON.parse(value));
            }
            // Maybe an interface from an older version, or from a symlinked copy
            if (typeof (value.format) === "function") {
                return new Interface(value.format("json"));
            }
            // Array of fragments
            return new Interface(value);
        }
    }

    //import { resolveAddress } from "@ethersproject/address";
    const BN_0$2 = BigInt(0);
    // -----------------------
    function getValue(value) {
        if (value == null) {
            return null;
        }
        return value;
    }
    function toJson(value) {
        if (value == null) {
            return null;
        }
        return value.toString();
    }
    // @TODO? <T extends FeeData = { }> implements Required<T>
    /**
     *  A **FeeData** wraps all the fee-related values associated with
     *  the network.
     */
    class FeeData {
        /**
         *  The gas price for legacy networks.
         */
        gasPrice;
        /**
         *  The maximum fee to pay per gas.
         *
         *  The base fee per gas is defined by the network and based on
         *  congestion, increasing the cost during times of heavy load
         *  and lowering when less busy.
         *
         *  The actual fee per gas will be the base fee for the block
         *  and the priority fee, up to the max fee per gas.
         *
         *  This will be ``null`` on legacy networks (i.e. [pre-EIP-1559](link-eip-1559))
         */
        maxFeePerGas;
        /**
         *  The additional amout to pay per gas to encourage a validator
         *  to include the transaction.
         *
         *  The purpose of this is to compensate the validator for the
         *  adjusted risk for including a given transaction.
         *
         *  This will be ``null`` on legacy networks (i.e. [pre-EIP-1559](link-eip-1559))
         */
        maxPriorityFeePerGas;
        /**
         *  Creates a new FeeData for %%gasPrice%%, %%maxFeePerGas%% and
         *  %%maxPriorityFeePerGas%%.
         */
        constructor(gasPrice, maxFeePerGas, maxPriorityFeePerGas) {
            defineProperties(this, {
                gasPrice: getValue(gasPrice),
                maxFeePerGas: getValue(maxFeePerGas),
                maxPriorityFeePerGas: getValue(maxPriorityFeePerGas)
            });
        }
        /**
         *  Returns a JSON-friendly value.
         */
        toJSON() {
            const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = this;
            return {
                _type: "FeeData",
                gasPrice: toJson(gasPrice),
                maxFeePerGas: toJson(maxFeePerGas),
                maxPriorityFeePerGas: toJson(maxPriorityFeePerGas),
            };
        }
    }
    function copyRequest(req) {
        const result = {};
        // These could be addresses, ENS names or Addressables
        if (req.to) {
            result.to = req.to;
        }
        if (req.from) {
            result.from = req.from;
        }
        if (req.data) {
            result.data = hexlify(req.data);
        }
        const bigIntKeys = "chainId,gasLimit,gasPrice,maxFeePerGas,maxPriorityFeePerGas,value".split(/,/);
        for (const key of bigIntKeys) {
            if (!(key in req) || req[key] == null) {
                continue;
            }
            result[key] = getBigInt(req[key], `request.${key}`);
        }
        const numberKeys = "type,nonce".split(/,/);
        for (const key of numberKeys) {
            if (!(key in req) || req[key] == null) {
                continue;
            }
            result[key] = getNumber(req[key], `request.${key}`);
        }
        if (req.accessList) {
            result.accessList = accessListify(req.accessList);
        }
        if ("blockTag" in req) {
            result.blockTag = req.blockTag;
        }
        if ("enableCcipRead" in req) {
            result.enableCcipReadEnabled = !!req.enableCcipRead;
        }
        if ("customData" in req) {
            result.customData = req.customData;
        }
        return result;
    }
    /**
     *  A **Block** represents the data associated with a full block on
     *  Ethereum.
     */
    class Block {
        /**
         *  The provider connected to the block used to fetch additional details
         *  if necessary.
         */
        provider;
        /**
         *  The block number, sometimes called the block height. This is a
         *  sequential number that is one higher than the parent block.
         */
        number;
        /**
         *  The block hash.
         */
        hash;
        /**
         *  The timestamp for this block, which is the number of seconds since
         *  epoch that this block was included.
         */
        timestamp;
        /**
         *  The block hash of the parent block.
         */
        parentHash;
        /**
         *  The nonce.
         *
         *  On legacy networks, this is the random number inserted which
         *  permitted the difficulty target to be reached.
         */
        nonce;
        /**
         *  The difficulty target.
         *
         *  On legacy networks, this is the proof-of-work target required
         *  for a block to meet the protocol rules to be included.
         *
         *  On modern networks, this is a random number arrived at using
         *  randao.  @TODO: Find links?
         */
        difficulty;
        /**
         *  The total gas limit for this block.
         */
        gasLimit;
        /**
         *  The total gas used in this block.
         */
        gasUsed;
        /**
         *  The miner coinbase address, wihch receives any subsidies for
         *  including this block.
         */
        miner;
        /**
         *  Any extra data the validator wished to include.
         */
        extraData;
        /**
         *  The base fee per gas that all transactions in this block were
         *  charged.
         *
         *  This adjusts after each block, depending on how congested the network
         *  is.
         */
        baseFeePerGas;
        #transactions;
        /**
         *  Create a new **Block** object.
         *
         *  This should generally not be necessary as the unless implementing a
         *  low-level library.
         */
        constructor(block, provider) {
            this.#transactions = block.transactions.map((tx) => {
                if (typeof (tx) !== "string") {
                    return new TransactionResponse(tx, provider);
                }
                return tx;
            });
            defineProperties(this, {
                provider,
                hash: getValue(block.hash),
                number: block.number,
                timestamp: block.timestamp,
                parentHash: block.parentHash,
                nonce: block.nonce,
                difficulty: block.difficulty,
                gasLimit: block.gasLimit,
                gasUsed: block.gasUsed,
                miner: block.miner,
                extraData: block.extraData,
                baseFeePerGas: getValue(block.baseFeePerGas)
            });
        }
        /**
         *  Returns the list of transaction hashes.
         */
        get transactions() {
            return this.#transactions.map((tx) => {
                if (typeof (tx) === "string") {
                    return tx;
                }
                return tx.hash;
            });
        }
        /**
         *  Returns the complete transactions for blocks which
         *  prefetched them, by passing ``true`` to %%prefetchTxs%%
         *  into [[provider_getBlock]].
         */
        get prefetchedTransactions() {
            const txs = this.#transactions.slice();
            // Doesn't matter...
            if (txs.length === 0) {
                return [];
            }
            // Make sure we prefetched the transactions
            assert$1(typeof (txs[0]) === "object", "transactions were not prefetched with block request", "UNSUPPORTED_OPERATION", {
                operation: "transactionResponses()"
            });
            return txs;
        }
        /**
         *  Returns a JSON-friendly value.
         */
        toJSON() {
            const { baseFeePerGas, difficulty, extraData, gasLimit, gasUsed, hash, miner, nonce, number, parentHash, timestamp, transactions } = this;
            return {
                _type: "Block",
                baseFeePerGas: toJson(baseFeePerGas),
                difficulty: toJson(difficulty),
                extraData,
                gasLimit: toJson(gasLimit),
                gasUsed: toJson(gasUsed),
                hash, miner, nonce, number, parentHash, timestamp,
                transactions,
            };
        }
        [Symbol.iterator]() {
            let index = 0;
            const txs = this.transactions;
            return {
                next: () => {
                    if (index < this.length) {
                        return {
                            value: txs[index++], done: false
                        };
                    }
                    return { value: undefined, done: true };
                }
            };
        }
        /**
         *  The number of transactions in this block.
         */
        get length() { return this.#transactions.length; }
        /**
         *  The [[link-js-date]] this block was included at.
         */
        get date() {
            if (this.timestamp == null) {
                return null;
            }
            return new Date(this.timestamp * 1000);
        }
        /**
         *  Get the transaction at %%indexe%% within this block.
         */
        async getTransaction(indexOrHash) {
            // Find the internal value by its index or hash
            let tx = undefined;
            if (typeof (indexOrHash) === "number") {
                tx = this.#transactions[indexOrHash];
            }
            else {
                const hash = indexOrHash.toLowerCase();
                for (const v of this.#transactions) {
                    if (typeof (v) === "string") {
                        if (v !== hash) {
                            continue;
                        }
                        tx = v;
                        break;
                    }
                    else {
                        if (v.hash === hash) {
                            continue;
                        }
                        tx = v;
                        break;
                    }
                }
            }
            if (tx == null) {
                throw new Error("no such tx");
            }
            if (typeof (tx) === "string") {
                return (await this.provider.getTransaction(tx));
            }
            else {
                return tx;
            }
        }
        getPrefetchedTransaction(indexOrHash) {
            const txs = this.prefetchedTransactions;
            if (typeof (indexOrHash) === "number") {
                return txs[indexOrHash];
            }
            indexOrHash = indexOrHash.toLowerCase();
            for (const tx of txs) {
                if (tx.hash === indexOrHash) {
                    return tx;
                }
            }
            assertArgument(false, "no matching transaction", "indexOrHash", indexOrHash);
        }
        /**
         *  Has this block been mined.
         *
         *  If true, the block has been typed-gaurded that all mined
         *  properties are non-null.
         */
        isMined() { return !!this.hash; }
        /**
         *
         */
        isLondon() {
            return !!this.baseFeePerGas;
        }
        orphanedEvent() {
            if (!this.isMined()) {
                throw new Error("");
            }
            return createOrphanedBlockFilter(this);
        }
    }
    //////////////////////
    // Log
    class Log {
        provider;
        transactionHash;
        blockHash;
        blockNumber;
        removed;
        address;
        data;
        topics;
        index;
        transactionIndex;
        constructor(log, provider) {
            this.provider = provider;
            const topics = Object.freeze(log.topics.slice());
            defineProperties(this, {
                transactionHash: log.transactionHash,
                blockHash: log.blockHash,
                blockNumber: log.blockNumber,
                removed: log.removed,
                address: log.address,
                data: log.data,
                topics,
                index: log.index,
                transactionIndex: log.transactionIndex,
            });
        }
        toJSON() {
            const { address, blockHash, blockNumber, data, index, removed, topics, transactionHash, transactionIndex } = this;
            return {
                _type: "log",
                address, blockHash, blockNumber, data, index,
                removed, topics, transactionHash, transactionIndex
            };
        }
        async getBlock() {
            const block = await this.provider.getBlock(this.blockHash);
            assert$1(!!block, "failed to find transaction", "UNKNOWN_ERROR", {});
            return block;
        }
        async getTransaction() {
            const tx = await this.provider.getTransaction(this.transactionHash);
            assert$1(!!tx, "failed to find transaction", "UNKNOWN_ERROR", {});
            return tx;
        }
        async getTransactionReceipt() {
            const receipt = await this.provider.getTransactionReceipt(this.transactionHash);
            assert$1(!!receipt, "failed to find transaction receipt", "UNKNOWN_ERROR", {});
            return receipt;
        }
        removedEvent() {
            return createRemovedLogFilter(this);
        }
    }
    //////////////////////
    // Transaction Receipt
    /*
    export interface LegacyTransactionReceipt {
        byzantium: false;
        status: null;
        root: string;
    }

    export interface ByzantiumTransactionReceipt {
        byzantium: true;
        status: number;
        root: null;
    }
    */
    class TransactionReceipt {
        provider;
        to;
        from;
        contractAddress;
        hash;
        index;
        blockHash;
        blockNumber;
        logsBloom;
        gasUsed;
        cumulativeGasUsed;
        gasPrice;
        type;
        //readonly byzantium!: boolean;
        status;
        root;
        #logs;
        constructor(tx, provider) {
            this.#logs = Object.freeze(tx.logs.map((log) => {
                return new Log(log, provider);
            }));
            defineProperties(this, {
                provider,
                to: tx.to,
                from: tx.from,
                contractAddress: tx.contractAddress,
                hash: tx.hash,
                index: tx.index,
                blockHash: tx.blockHash,
                blockNumber: tx.blockNumber,
                logsBloom: tx.logsBloom,
                gasUsed: tx.gasUsed,
                cumulativeGasUsed: tx.cumulativeGasUsed,
                gasPrice: (tx.effectiveGasPrice || tx.gasPrice),
                type: tx.type,
                //byzantium: tx.byzantium,
                status: tx.status,
                root: tx.root
            });
        }
        get logs() { return this.#logs; }
        toJSON() {
            const { to, from, contractAddress, hash, index, blockHash, blockNumber, logsBloom, logs, //byzantium, 
            status, root } = this;
            return {
                _type: "TransactionReceipt",
                blockHash, blockNumber,
                //byzantium, 
                contractAddress,
                cumulativeGasUsed: toJson(this.cumulativeGasUsed),
                from,
                gasPrice: toJson(this.gasPrice),
                gasUsed: toJson(this.gasUsed),
                hash, index, logs, logsBloom, root, status, to
            };
        }
        get length() { return this.logs.length; }
        [Symbol.iterator]() {
            let index = 0;
            return {
                next: () => {
                    if (index < this.length) {
                        return { value: this.logs[index++], done: false };
                    }
                    return { value: undefined, done: true };
                }
            };
        }
        get fee() {
            return this.gasUsed * this.gasPrice;
        }
        async getBlock() {
            const block = await this.provider.getBlock(this.blockHash);
            if (block == null) {
                throw new Error("TODO");
            }
            return block;
        }
        async getTransaction() {
            const tx = await this.provider.getTransaction(this.hash);
            if (tx == null) {
                throw new Error("TODO");
            }
            return tx;
        }
        async getResult() {
            return (await this.provider.getTransactionResult(this.hash));
        }
        async confirmations() {
            return (await this.provider.getBlockNumber()) - this.blockNumber + 1;
        }
        removedEvent() {
            return createRemovedTransactionFilter(this);
        }
        reorderedEvent(other) {
            assert$1(!other || other.isMined(), "unmined 'other' transction cannot be orphaned", "UNSUPPORTED_OPERATION", { operation: "reorderedEvent(other)" });
            return createReorderedTransactionFilter(this, other);
        }
    }
    /*
    export type ReplacementDetectionSetup = {
        to: string;
        from: string;
        value: bigint;
        data: string;
        nonce: number;
        block: number;
    };
    */
    class TransactionResponse {
        provider;
        blockNumber;
        blockHash;
        index;
        hash;
        type;
        to;
        from;
        nonce;
        gasLimit;
        gasPrice;
        maxPriorityFeePerGas;
        maxFeePerGas;
        data;
        value;
        chainId;
        signature;
        accessList;
        #startBlock;
        constructor(tx, provider) {
            this.provider = provider;
            this.blockNumber = (tx.blockNumber != null) ? tx.blockNumber : null;
            this.blockHash = (tx.blockHash != null) ? tx.blockHash : null;
            this.hash = tx.hash;
            this.index = tx.index;
            this.type = tx.type;
            this.from = tx.from;
            this.to = tx.to || null;
            this.gasLimit = tx.gasLimit;
            this.nonce = tx.nonce;
            this.data = tx.data;
            this.value = tx.value;
            this.gasPrice = tx.gasPrice;
            this.maxPriorityFeePerGas = (tx.maxPriorityFeePerGas != null) ? tx.maxPriorityFeePerGas : null;
            this.maxFeePerGas = (tx.maxFeePerGas != null) ? tx.maxFeePerGas : null;
            this.chainId = tx.chainId;
            this.signature = tx.signature;
            this.accessList = (tx.accessList != null) ? tx.accessList : null;
            this.#startBlock = -1;
        }
        toJSON() {
            const { blockNumber, blockHash, index, hash, type, to, from, nonce, data, signature, accessList } = this;
            return {
                _type: "TransactionReceipt",
                accessList, blockNumber, blockHash,
                chainId: toJson(this.chainId),
                data, from,
                gasLimit: toJson(this.gasLimit),
                gasPrice: toJson(this.gasPrice),
                hash,
                maxFeePerGas: toJson(this.maxFeePerGas),
                maxPriorityFeePerGas: toJson(this.maxPriorityFeePerGas),
                nonce, signature, to, index, type,
                value: toJson(this.value),
            };
        }
        async getBlock() {
            let blockNumber = this.blockNumber;
            if (blockNumber == null) {
                const tx = await this.getTransaction();
                if (tx) {
                    blockNumber = tx.blockNumber;
                }
            }
            if (blockNumber == null) {
                return null;
            }
            const block = this.provider.getBlock(blockNumber);
            if (block == null) {
                throw new Error("TODO");
            }
            return block;
        }
        async getTransaction() {
            return this.provider.getTransaction(this.hash);
        }
        async wait(_confirms, _timeout) {
            const confirms = (_confirms == null) ? 1 : _confirms;
            const timeout = (_timeout == null) ? 0 : _timeout;
            let startBlock = this.#startBlock;
            let nextScan = -1;
            let stopScanning = (startBlock === -1) ? true : false;
            const checkReplacement = async () => {
                // Get the current transaction count for this sender
                if (stopScanning) {
                    return null;
                }
                const { blockNumber, nonce } = await resolveProperties({
                    blockNumber: this.provider.getBlockNumber(),
                    nonce: this.provider.getTransactionCount(this.from)
                });
                // No transaction or our nonce has not been mined yet; but we
                // can start scanning later when we do start
                if (nonce < this.nonce) {
                    startBlock = blockNumber;
                    return;
                }
                // We were mined; no replacement
                if (stopScanning) {
                    return null;
                }
                const mined = await this.getTransaction();
                if (mined && mined.blockNumber != null) {
                    return;
                }
                // We were replaced; start scanning for that transaction
                // Starting to scan; look back a few extra blocks for safety
                if (nextScan === -1) {
                    nextScan = startBlock - 3;
                    if (nextScan < this.#startBlock) {
                        nextScan = this.#startBlock;
                    }
                }
                while (nextScan <= blockNumber) {
                    // Get the next block to scan
                    if (stopScanning) {
                        return null;
                    }
                    const block = await this.provider.getBlock(nextScan, true);
                    // This should not happen; but we'll try again shortly
                    if (block == null) {
                        return;
                    }
                    // We were mined; no replacement
                    for (const hash of block) {
                        if (hash === this.hash) {
                            return;
                        }
                    }
                    // Search for the transaction that replaced us
                    for (let i = 0; i < block.length; i++) {
                        const tx = await block.getTransaction(i);
                        if (tx.from === this.from && tx.nonce === this.nonce) {
                            // Get the receipt
                            if (stopScanning) {
                                return null;
                            }
                            const receipt = await this.provider.getTransactionReceipt(tx.hash);
                            // This should not happen; but we'll try again shortly
                            if (receipt == null) {
                                return;
                            }
                            // We will retry this on the next block (this case could be optimized)
                            if ((blockNumber - receipt.blockNumber + 1) < confirms) {
                                return;
                            }
                            // The reason we were replaced
                            let reason = "replaced";
                            if (tx.data === this.data && tx.to === this.to && tx.value === this.value) {
                                reason = "repriced";
                            }
                            else if (tx.data === "0x" && tx.from === tx.to && tx.value === BN_0$2) {
                                reason = "cancelled";
                            }
                            assert$1(false, "transaction was replaced", "TRANSACTION_REPLACED", {
                                cancelled: (reason === "replaced" || reason === "cancelled"),
                                reason,
                                replacement: tx.replaceableTransaction(startBlock),
                                hash: tx.hash,
                                receipt
                            });
                        }
                    }
                    nextScan++;
                }
                return;
            };
            const receipt = await this.provider.getTransactionReceipt(this.hash);
            if (receipt) {
                if ((await receipt.confirmations()) >= confirms) {
                    return receipt;
                }
            }
            else {
                // Check for a replacement; throws if a replacement was found
                await checkReplacement();
                // Allow null only when the confirms is 0
                if (confirms === 0) {
                    return null;
                }
            }
            const waiter = new Promise((resolve, reject) => {
                // List of things to cancel when we have a result (one way or the other)
                const cancellers = [];
                const cancel = () => { cancellers.forEach((c) => c()); };
                // On cancel, stop scanning for replacements
                cancellers.push(() => { stopScanning = true; });
                // Set up any timeout requested
                if (timeout > 0) {
                    const timer = setTimeout(() => {
                        cancel();
                        reject(makeError("wait for transaction timeout", "TIMEOUT"));
                    }, timeout);
                    cancellers.push(() => { clearTimeout(timer); });
                }
                const txListener = async (receipt) => {
                    // Done; return it!
                    if ((await receipt.confirmations()) >= confirms) {
                        cancel();
                        resolve(receipt);
                    }
                };
                cancellers.push(() => { this.provider.off(this.hash, txListener); });
                this.provider.on(this.hash, txListener);
                // We support replacement detection; start checking
                if (startBlock >= 0) {
                    const replaceListener = async () => {
                        try {
                            // Check for a replacement; this throws only if one is found
                            await checkReplacement();
                        }
                        catch (error) {
                            // We were replaced (with enough confirms); re-throw the error
                            if (isError(error, "TRANSACTION_REPLACED")) {
                                cancel();
                                reject(error);
                                return;
                            }
                        }
                        // Rescheudle a check on the next block
                        if (!stopScanning) {
                            this.provider.once("block", replaceListener);
                        }
                    };
                    cancellers.push(() => { this.provider.off("block", replaceListener); });
                    this.provider.once("block", replaceListener);
                }
            });
            return await waiter;
        }
        isMined() {
            return (this.blockHash != null);
        }
        isLegacy() {
            return (this.type === 0);
        }
        isBerlin() {
            return (this.type === 1);
        }
        isLondon() {
            return (this.type === 2);
        }
        removedEvent() {
            assert$1(this.isMined(), "unmined transaction canot be orphaned", "UNSUPPORTED_OPERATION", { operation: "removeEvent()" });
            return createRemovedTransactionFilter(this);
        }
        reorderedEvent(other) {
            assert$1(this.isMined(), "unmined transaction canot be orphaned", "UNSUPPORTED_OPERATION", { operation: "removeEvent()" });
            assert$1(!other || other.isMined(), "unmined 'other' transaction canot be orphaned", "UNSUPPORTED_OPERATION", { operation: "removeEvent()" });
            return createReorderedTransactionFilter(this, other);
        }
        /**
         *  Returns a new TransactionResponse instance which has the ability to
         *  detect (and throw an error) if the transaction is replaced, which
         *  will begin scanning at %%startBlock%%.
         *
         *  This should generally not be used by developers and is intended
         *  primarily for internal use. Setting an incorrect %%startBlock%% can
         *  have devastating performance consequences if used incorrectly.
         */
        replaceableTransaction(startBlock) {
            assertArgument(Number.isInteger(startBlock) && startBlock >= 0, "invalid startBlock", "startBlock", startBlock);
            const tx = new TransactionResponse(this, this.provider);
            tx.#startBlock = startBlock;
            return tx;
        }
    }
    function createOrphanedBlockFilter(block) {
        return { orphan: "drop-block", hash: block.hash, number: block.number };
    }
    function createReorderedTransactionFilter(tx, other) {
        return { orphan: "reorder-transaction", tx, other };
    }
    function createRemovedTransactionFilter(tx) {
        return { orphan: "drop-transaction", tx };
    }
    function createRemovedLogFilter(log) {
        return { orphan: "drop-log", log: {
                transactionHash: log.transactionHash,
                blockHash: log.blockHash,
                blockNumber: log.blockNumber,
                address: log.address,
                data: log.data,
                topics: Object.freeze(log.topics.slice()),
                index: log.index
            } };
    }

    // import from provider.ts instead of index.ts to prevent circular dep
    class EventLog extends Log {
        interface;
        fragment;
        args;
        constructor(log, iface, fragment) {
            super(log, log.provider);
            const args = iface.decodeEventLog(fragment, log.data, log.topics);
            defineProperties(this, { args, fragment, interface: iface });
        }
        get eventName() { return this.fragment.name; }
        get eventSignature() { return this.fragment.format(); }
    }
    class ContractTransactionReceipt extends TransactionReceipt {
        #interface;
        constructor(iface, provider, tx) {
            super(tx, provider);
            this.#interface = iface;
        }
        get logs() {
            return super.logs.map((log) => {
                const fragment = log.topics.length ? this.#interface.getEvent(log.topics[0]) : null;
                if (fragment) {
                    return new EventLog(log, this.#interface, fragment);
                }
                else {
                    return log;
                }
            });
        }
    }
    class ContractTransactionResponse extends TransactionResponse {
        #interface;
        constructor(iface, provider, tx) {
            super(tx, provider);
            this.#interface = iface;
        }
        async wait(confirms) {
            const receipt = await super.wait();
            if (receipt == null) {
                return null;
            }
            return new ContractTransactionReceipt(this.#interface, this.provider, receipt);
        }
    }
    class ContractUnknownEventPayload extends EventPayload {
        log;
        constructor(contract, listener, filter, log) {
            super(contract, listener, filter);
            defineProperties(this, { log });
        }
        async getBlock() {
            return await this.log.getBlock();
        }
        async getTransaction() {
            return await this.log.getTransaction();
        }
        async getTransactionReceipt() {
            return await this.log.getTransactionReceipt();
        }
    }
    class ContractEventPayload extends ContractUnknownEventPayload {
        constructor(contract, listener, filter, fragment, _log) {
            super(contract, listener, filter, new EventLog(_log, contract.interface, fragment));
            const args = contract.interface.decodeEventLog(fragment, this.log.data, this.log.topics);
            defineProperties(this, { args, fragment });
        }
        get eventName() {
            return this.fragment.name;
        }
        get eventSignature() {
            return this.fragment.format();
        }
    }

    const BN_0$1 = BigInt(0);
    function canCall(value) {
        return (value && typeof (value.call) === "function");
    }
    function canEstimate(value) {
        return (value && typeof (value.estimateGas) === "function");
    }
    function canResolve(value) {
        return (value && typeof (value.resolveName) === "function");
    }
    function canSend(value) {
        return (value && typeof (value.sendTransaction) === "function");
    }
    class PreparedTopicFilter {
        #filter;
        fragment;
        constructor(contract, fragment, args) {
            defineProperties(this, { fragment });
            if (fragment.inputs.length < args.length) {
                throw new Error("too many arguments");
            }
            // Recursively descend into args and resolve any addresses
            const runner = getRunner(contract.runner, "resolveName");
            const resolver = canResolve(runner) ? runner : null;
            this.#filter = (async function () {
                const resolvedArgs = await Promise.all(fragment.inputs.map((param, index) => {
                    const arg = args[index];
                    if (arg == null) {
                        return null;
                    }
                    return param.walkAsync(args[index], (type, value) => {
                        if (type === "address") {
                            return resolveAddress(value, resolver);
                        }
                        return value;
                    });
                }));
                return contract.interface.encodeFilterTopics(fragment, resolvedArgs);
            })();
        }
        getTopicFilter() {
            return this.#filter;
        }
    }
    // A = Arguments passed in as a tuple
    // R = The result type of the call (i.e. if only one return type,
    //     the qualified type, otherwise Result)
    // D = The type the default call will return (i.e. R for view/pure,
    //     TransactionResponse otherwise)
    //export interface ContractMethod<A extends Array<any> = Array<any>, R = any, D extends R | ContractTransactionResponse = ContractTransactionResponse> {
    function _WrappedMethodBase() {
        return Function;
    }
    function getRunner(value, feature) {
        if (value == null) {
            return null;
        }
        if (typeof (value[feature]) === "function") {
            return value;
        }
        if (value.provider && typeof (value.provider[feature]) === "function") {
            return value.provider;
        }
        return null;
    }
    function getProvider(value) {
        if (value == null) {
            return null;
        }
        return value.provider || null;
    }
    /**
     *  @_ignore:
     */
    async function copyOverrides(arg, allowed) {
        // Create a shallow copy (we'll deep-ify anything needed during normalizing)
        const overrides = copyRequest(Typed.dereference(arg, "overrides"));
        assertArgument(overrides.to == null || (allowed || []).indexOf("to") >= 0, "cannot override to", "overrides.to", overrides.to);
        assertArgument(overrides.data == null || (allowed || []).indexOf("data") >= 0, "cannot override data", "overrides.data", overrides.data);
        // Resolve any from
        if (overrides.from) {
            overrides.from = await resolveAddress(overrides.from);
        }
        return overrides;
    }
    /**
     *  @_ignore:
     */
    async function resolveArgs(_runner, inputs, args) {
        // Recursively descend into args and resolve any addresses
        const runner = getRunner(_runner, "resolveName");
        const resolver = canResolve(runner) ? runner : null;
        return await Promise.all(inputs.map((param, index) => {
            return param.walkAsync(args[index], (type, value) => {
                value = Typed.dereference(value, type);
                if (type === "address") {
                    return resolveAddress(value, resolver);
                }
                return value;
            });
        }));
    }
    class WrappedFallback {
        _contract;
        constructor(contract) {
            defineProperties(this, { _contract: contract });
            const proxy = new Proxy(this, {
                // Perform send when called
                apply: async (target, thisArg, args) => {
                    return await target.send(...args);
                },
            });
            return proxy;
        }
        async populateTransaction(overrides) {
            // If an overrides was passed in, copy it and normalize the values
            const tx = (await copyOverrides(overrides, ["data"]));
            tx.to = await this._contract.getAddress();
            const iface = this._contract.interface;
            // Only allow payable contracts to set non-zero value
            const payable = iface.receive || (iface.fallback && iface.fallback.payable);
            assertArgument(payable || (tx.value || BN_0$1) === BN_0$1, "cannot send value to non-payable contract", "overrides.value", tx.value);
            // Only allow fallback contracts to set non-empty data
            assertArgument(iface.fallback || (tx.data || "0x") === "0x", "cannot send data to receive-only contract", "overrides.data", tx.data);
            return tx;
        }
        async staticCall(overrides) {
            const runner = getRunner(this._contract.runner, "call");
            assert$1(canCall(runner), "contract runner does not support calling", "UNSUPPORTED_OPERATION", { operation: "call" });
            const tx = await this.populateTransaction(overrides);
            try {
                return await runner.call(tx);
            }
            catch (error) {
                if (isCallException(error) && error.data) {
                    throw this._contract.interface.makeError(error.data, tx);
                }
                throw error;
            }
        }
        async send(overrides) {
            const runner = this._contract.runner;
            assert$1(canSend(runner), "contract runner does not support sending transactions", "UNSUPPORTED_OPERATION", { operation: "sendTransaction" });
            const tx = await runner.sendTransaction(await this.populateTransaction(overrides));
            const provider = getProvider(this._contract.runner);
            // @TODO: the provider can be null; make a custom dummy provider that will throw a
            // meaningful error
            return new ContractTransactionResponse(this._contract.interface, provider, tx);
        }
        async estimateGas(overrides) {
            const runner = getRunner(this._contract.runner, "estimateGas");
            assert$1(canEstimate(runner), "contract runner does not support gas estimation", "UNSUPPORTED_OPERATION", { operation: "estimateGas" });
            return await runner.estimateGas(await this.populateTransaction(overrides));
        }
    }
    class WrappedMethod extends _WrappedMethodBase() {
        name = ""; // Investigate!
        _contract;
        _key;
        constructor(contract, key) {
            super();
            defineProperties(this, {
                name: contract.interface.getFunctionName(key),
                _contract: contract, _key: key
            });
            const proxy = new Proxy(this, {
                // Perform the default operation for this fragment type
                apply: async (target, thisArg, args) => {
                    const fragment = target.getFragment(...args);
                    if (fragment.constant) {
                        return await target.staticCall(...args);
                    }
                    return await target.send(...args);
                },
            });
            return proxy;
        }
        // Only works on non-ambiguous keys (refined fragment is always non-ambiguous)
        get fragment() {
            const fragment = this._contract.interface.getFunction(this._key);
            assert$1(fragment, "no matching fragment", "UNSUPPORTED_OPERATION", {
                operation: "fragment"
            });
            return fragment;
        }
        getFragment(...args) {
            const fragment = this._contract.interface.getFunction(this._key, args);
            assert$1(fragment, "no matching fragment", "UNSUPPORTED_OPERATION", {
                operation: "fragment"
            });
            return fragment;
        }
        async populateTransaction(...args) {
            const fragment = this.getFragment(...args);
            // If an overrides was passed in, copy it and normalize the values
            let overrides = {};
            if (fragment.inputs.length + 1 === args.length) {
                overrides = await copyOverrides(args.pop());
            }
            if (fragment.inputs.length !== args.length) {
                throw new Error("internal error: fragment inputs doesn't match arguments; should not happen");
            }
            const resolvedArgs = await resolveArgs(this._contract.runner, fragment.inputs, args);
            return Object.assign({}, overrides, await resolveProperties({
                to: this._contract.getAddress(),
                data: this._contract.interface.encodeFunctionData(fragment, resolvedArgs)
            }));
        }
        async staticCall(...args) {
            const result = await this.staticCallResult(...args);
            if (result.length === 1) {
                return result[0];
            }
            return result;
        }
        async send(...args) {
            const runner = this._contract.runner;
            assert$1(canSend(runner), "contract runner does not support sending transactions", "UNSUPPORTED_OPERATION", { operation: "sendTransaction" });
            const tx = await runner.sendTransaction(await this.populateTransaction(...args));
            const provider = getProvider(this._contract.runner);
            // @TODO: the provider can be null; make a custom dummy provider that will throw a
            // meaningful error
            return new ContractTransactionResponse(this._contract.interface, provider, tx);
        }
        async estimateGas(...args) {
            const runner = getRunner(this._contract.runner, "estimateGas");
            assert$1(canEstimate(runner), "contract runner does not support gas estimation", "UNSUPPORTED_OPERATION", { operation: "estimateGas" });
            return await runner.estimateGas(await this.populateTransaction(...args));
        }
        async staticCallResult(...args) {
            const runner = getRunner(this._contract.runner, "call");
            assert$1(canCall(runner), "contract runner does not support calling", "UNSUPPORTED_OPERATION", { operation: "call" });
            const tx = await this.populateTransaction(...args);
            let result = "0x";
            try {
                result = await runner.call(tx);
            }
            catch (error) {
                if (isCallException(error) && error.data) {
                    throw this._contract.interface.makeError(error.data, tx);
                }
                throw error;
            }
            const fragment = this.getFragment(...args);
            return this._contract.interface.decodeFunctionResult(fragment, result);
        }
    }
    function _WrappedEventBase() {
        return Function;
    }
    class WrappedEvent extends _WrappedEventBase() {
        name = ""; // @TODO: investigate 
        _contract;
        _key;
        constructor(contract, key) {
            super();
            defineProperties(this, {
                name: contract.interface.getEventName(key),
                _contract: contract, _key: key
            });
            return new Proxy(this, {
                // Perform the default operation for this fragment type
                apply: (target, thisArg, args) => {
                    return new PreparedTopicFilter(contract, target.getFragment(...args), args);
                },
            });
        }
        // Only works on non-ambiguous keys
        get fragment() {
            const fragment = this._contract.interface.getEvent(this._key);
            assert$1(fragment, "no matching fragment", "UNSUPPORTED_OPERATION", {
                operation: "fragment"
            });
            return fragment;
        }
        getFragment(...args) {
            const fragment = this._contract.interface.getEvent(this._key, args);
            assert$1(fragment, "no matching fragment", "UNSUPPORTED_OPERATION", {
                operation: "fragment"
            });
            return fragment;
        }
    }
    // The combination of TypeScrype, Private Fields and Proxies makes
    // the world go boom; so we hide variables with some trickery keeping
    // a symbol attached to each BaseContract which its sub-class (even
    // via a Proxy) can reach and use to look up its internal values.
    const internal = Symbol.for("_ethersInternal_contract");
    const internalValues = new WeakMap();
    function setInternal(contract, values) {
        internalValues.set(contract[internal], values);
    }
    function getInternal(contract) {
        return internalValues.get(contract[internal]);
    }
    function isDeferred(value) {
        return (value && typeof (value) === "object" && ("getTopicFilter" in value) &&
            (typeof (value.getTopicFilter) === "function") && value.fragment);
    }
    async function getSubInfo(contract, event) {
        let topics;
        let fragment = null;
        // Convert named events to topicHash and get the fragment for
        // events which need deconstructing.
        if (Array.isArray(event)) {
            const topicHashify = function (name) {
                if (isHexString(name, 32)) {
                    return name;
                }
                const fragment = contract.interface.getEvent(name);
                assertArgument(fragment, "unknown fragment", "name", name);
                return fragment.topicHash;
            };
            // Array of Topics and Names; e.g. `[ "0x1234...89ab", "Transfer(address)" ]`
            topics = event.map((e) => {
                if (e == null) {
                    return null;
                }
                if (Array.isArray(e)) {
                    return e.map(topicHashify);
                }
                return topicHashify(e);
            });
        }
        else if (event === "*") {
            topics = [null];
        }
        else if (typeof (event) === "string") {
            if (isHexString(event, 32)) {
                // Topic Hash
                topics = [event];
            }
            else {
                // Name or Signature; e.g. `"Transfer", `"Transfer(address)"`
                fragment = contract.interface.getEvent(event);
                assertArgument(fragment, "unknown fragment", "event", event);
                topics = [fragment.topicHash];
            }
        }
        else if (isDeferred(event)) {
            // Deferred Topic Filter; e.g. `contract.filter.Transfer(from)`
            topics = await event.getTopicFilter();
        }
        else if ("fragment" in event) {
            // ContractEvent; e.g. `contract.filter.Transfer`
            fragment = event.fragment;
            topics = [fragment.topicHash];
        }
        else {
            assertArgument(false, "unknown event name", "event", event);
        }
        // Normalize topics and sort TopicSets
        topics = topics.map((t) => {
            if (t == null) {
                return null;
            }
            if (Array.isArray(t)) {
                const items = Array.from(new Set(t.map((t) => t.toLowerCase())).values());
                if (items.length === 1) {
                    return items[0];
                }
                items.sort();
                return items;
            }
            return t.toLowerCase();
        });
        const tag = topics.map((t) => {
            if (t == null) {
                return "null";
            }
            if (Array.isArray(t)) {
                return t.join("|");
            }
            return t;
        }).join("&");
        return { fragment, tag, topics };
    }
    async function hasSub(contract, event) {
        const { subs } = getInternal(contract);
        return subs.get((await getSubInfo(contract, event)).tag) || null;
    }
    async function getSub(contract, operation, event) {
        // Make sure our runner can actually subscribe to events
        const provider = getProvider(contract.runner);
        assert$1(provider, "contract runner does not support subscribing", "UNSUPPORTED_OPERATION", { operation });
        const { fragment, tag, topics } = await getSubInfo(contract, event);
        const { addr, subs } = getInternal(contract);
        let sub = subs.get(tag);
        if (!sub) {
            const address = (addr ? addr : contract);
            const filter = { address, topics };
            const listener = (log) => {
                let foundFragment = fragment;
                if (foundFragment == null) {
                    try {
                        foundFragment = contract.interface.getEvent(log.topics[0]);
                    }
                    catch (error) { }
                }
                // If fragment is null, we do not deconstruct the args to emit
                if (foundFragment) {
                    const _foundFragment = foundFragment;
                    const args = fragment ? contract.interface.decodeEventLog(fragment, log.data, log.topics) : [];
                    emit(contract, event, args, (listener) => {
                        return new ContractEventPayload(contract, listener, event, _foundFragment, log);
                    });
                }
                else {
                    emit(contract, event, [], (listener) => {
                        return new ContractUnknownEventPayload(contract, listener, event, log);
                    });
                }
            };
            let starting = [];
            const start = () => {
                if (starting.length) {
                    return;
                }
                starting.push(provider.on(filter, listener));
            };
            const stop = async () => {
                if (starting.length == 0) {
                    return;
                }
                let started = starting;
                starting = [];
                await Promise.all(started);
                provider.off(filter, listener);
            };
            sub = { tag, listeners: [], start, stop };
            subs.set(tag, sub);
        }
        return sub;
    }
    // We use this to ensure one emit resolves before firing the next to
    // ensure correct ordering (note this cannot throw and just adds the
    // notice to the event queu using setTimeout).
    let lastEmit = Promise.resolve();
    async function _emit(contract, event, args, payloadFunc) {
        await lastEmit;
        const sub = await hasSub(contract, event);
        if (!sub) {
            return false;
        }
        const count = sub.listeners.length;
        sub.listeners = sub.listeners.filter(({ listener, once }) => {
            const passArgs = Array.from(args);
            if (payloadFunc) {
                passArgs.push(payloadFunc(once ? null : listener));
            }
            try {
                listener.call(contract, ...passArgs);
            }
            catch (error) { }
            return !once;
        });
        return (count > 0);
    }
    async function emit(contract, event, args, payloadFunc) {
        try {
            await lastEmit;
        }
        catch (error) { }
        const resultPromise = _emit(contract, event, args, payloadFunc);
        lastEmit = resultPromise;
        return await resultPromise;
    }
    const passProperties = ["then"];
    class BaseContract {
        target;
        interface;
        runner;
        filters;
        [internal];
        fallback;
        constructor(target, abi, runner, _deployTx) {
            if (runner == null) {
                runner = null;
            }
            const iface = Interface.from(abi);
            defineProperties(this, { target, runner, interface: iface });
            Object.defineProperty(this, internal, { value: {} });
            let addrPromise;
            let addr = null;
            let deployTx = null;
            if (_deployTx) {
                const provider = getProvider(runner);
                // @TODO: the provider can be null; make a custom dummy provider that will throw a
                // meaningful error
                deployTx = new ContractTransactionResponse(this.interface, provider, _deployTx);
            }
            let subs = new Map();
            // Resolve the target as the address
            if (typeof (target) === "string") {
                if (isHexString(target)) {
                    addr = target;
                    addrPromise = Promise.resolve(target);
                }
                else {
                    const resolver = getRunner(runner, "resolveName");
                    if (!canResolve(resolver)) {
                        throw makeError("contract runner does not support name resolution", "UNSUPPORTED_OPERATION", {
                            operation: "resolveName"
                        });
                    }
                    addrPromise = resolver.resolveName(target).then((addr) => {
                        if (addr == null) {
                            throw new Error("TODO");
                        }
                        getInternal(this).addr = addr;
                        return addr;
                    });
                }
            }
            else {
                addrPromise = target.getAddress().then((addr) => {
                    if (addr == null) {
                        throw new Error("TODO");
                    }
                    getInternal(this).addr = addr;
                    return addr;
                });
            }
            // Set our private values
            setInternal(this, { addrPromise, addr, deployTx, subs });
            // Add the event filters
            const filters = new Proxy({}, {
                get: (target, _prop, receiver) => {
                    // Pass important checks (like `then` for Promise) through
                    if (passProperties.indexOf(_prop) >= 0) {
                        return Reflect.get(target, _prop, receiver);
                    }
                    const prop = String(_prop);
                    const result = this.getEvent(prop);
                    if (result) {
                        return result;
                    }
                    throw new Error(`unknown contract event: ${prop}`);
                }
            });
            defineProperties(this, { filters });
            defineProperties(this, {
                fallback: ((iface.receive || iface.fallback) ? (new WrappedFallback(this)) : null)
            });
            // Return a Proxy that will respond to functions
            return new Proxy(this, {
                get: (target, _prop, receiver) => {
                    if (_prop in target || passProperties.indexOf(_prop) >= 0) {
                        return Reflect.get(target, _prop, receiver);
                    }
                    const prop = String(_prop);
                    const result = target.getFunction(prop);
                    if (result) {
                        return result;
                    }
                    throw new Error(`unknown contract method: ${prop}`);
                }
            });
        }
        connect(runner) {
            return new BaseContract(this.target, this.interface, runner);
        }
        async getAddress() { return await getInternal(this).addrPromise; }
        async getDeployedCode() {
            const provider = getProvider(this.runner);
            assert$1(provider, "runner does not support .provider", "UNSUPPORTED_OPERATION", { operation: "getDeployedCode" });
            const code = await provider.getCode(await this.getAddress());
            if (code === "0x") {
                return null;
            }
            return code;
        }
        async waitForDeployment() {
            // We have the deployement transaction; just use that (throws if deployement fails)
            const deployTx = this.deploymentTransaction();
            if (deployTx) {
                await deployTx.wait();
                return this;
            }
            // Check for code
            const code = await this.getDeployedCode();
            if (code != null) {
                return this;
            }
            // Make sure we can subscribe to a provider event
            const provider = getProvider(this.runner);
            assert$1(provider != null, "contract runner does not support .provider", "UNSUPPORTED_OPERATION", { operation: "waitForDeployment" });
            return new Promise((resolve, reject) => {
                const checkCode = async () => {
                    try {
                        const code = await this.getDeployedCode();
                        if (code != null) {
                            return resolve(this);
                        }
                        provider.once("block", checkCode);
                    }
                    catch (error) {
                        reject(error);
                    }
                };
                checkCode();
            });
        }
        deploymentTransaction() {
            return getInternal(this).deployTx;
        }
        getFunction(key) {
            if (typeof (key) !== "string") {
                key = key.format();
            }
            return (new WrappedMethod(this, key));
        }
        getEvent(key) {
            if (typeof (key) !== "string") {
                key = key.format();
            }
            return (new WrappedEvent(this, key));
        }
        async queryTransaction(hash) {
            // Is this useful?
            throw new Error("@TODO");
        }
        async queryFilter(event, fromBlock, toBlock) {
            if (fromBlock == null) {
                fromBlock = 0;
            }
            if (toBlock == null) {
                toBlock = "latest";
            }
            const { addr, addrPromise } = getInternal(this);
            const address = (addr ? addr : (await addrPromise));
            const { fragment, topics } = await getSubInfo(this, event);
            const filter = { address, topics, fromBlock, toBlock };
            const provider = getProvider(this.runner);
            assert$1(provider, "contract runner does not have a provider", "UNSUPPORTED_OPERATION", { operation: "queryFilter" });
            return (await provider.getLogs(filter)).map((log) => {
                let foundFragment = fragment;
                if (foundFragment == null) {
                    try {
                        foundFragment = this.interface.getEvent(log.topics[0]);
                    }
                    catch (error) { }
                }
                if (foundFragment) {
                    return new EventLog(log, this.interface, foundFragment);
                }
                else {
                    return new Log(log, provider);
                }
            });
        }
        async on(event, listener) {
            const sub = await getSub(this, "on", event);
            sub.listeners.push({ listener, once: false });
            sub.start();
            return this;
        }
        async once(event, listener) {
            const sub = await getSub(this, "once", event);
            sub.listeners.push({ listener, once: true });
            sub.start();
            return this;
        }
        async emit(event, ...args) {
            return await emit(this, event, args, null);
        }
        async listenerCount(event) {
            if (event) {
                const sub = await hasSub(this, event);
                if (!sub) {
                    return 0;
                }
                return sub.listeners.length;
            }
            const { subs } = getInternal(this);
            let total = 0;
            for (const { listeners } of subs.values()) {
                total += listeners.length;
            }
            return total;
        }
        async listeners(event) {
            if (event) {
                const sub = await hasSub(this, event);
                if (!sub) {
                    return [];
                }
                return sub.listeners.map(({ listener }) => listener);
            }
            const { subs } = getInternal(this);
            let result = [];
            for (const { listeners } of subs.values()) {
                result = result.concat(listeners.map(({ listener }) => listener));
            }
            return result;
        }
        async off(event, listener) {
            const sub = await hasSub(this, event);
            if (!sub) {
                return this;
            }
            if (listener) {
                const index = sub.listeners.map(({ listener }) => listener).indexOf(listener);
                if (index >= 0) {
                    sub.listeners.splice(index, 1);
                }
            }
            if (listener == null || sub.listeners.length === 0) {
                sub.stop();
                getInternal(this).subs.delete(sub.tag);
            }
            return this;
        }
        async removeAllListeners(event) {
            if (event) {
                const sub = await hasSub(this, event);
                if (!sub) {
                    return this;
                }
                sub.stop();
                getInternal(this).subs.delete(sub.tag);
            }
            else {
                const { subs } = getInternal(this);
                for (const { tag, stop } of subs.values()) {
                    stop();
                    subs.delete(tag);
                }
            }
            return this;
        }
        // Alias for "on"
        async addListener(event, listener) {
            return await this.on(event, listener);
        }
        // Alias for "off"
        async removeListener(event, listener) {
            return await this.off(event, listener);
        }
        static buildClass(abi) {
            class CustomContract extends BaseContract {
                constructor(address, runner = null) {
                    super(address, abi, runner);
                }
            }
            return CustomContract;
        }
        ;
        static from(target, abi, runner) {
            if (runner == null) {
                runner = null;
            }
            const contract = new this(target, abi, runner);
            return contract;
        }
    }
    function _ContractBase() {
        return BaseContract;
    }
    class Contract extends _ContractBase() {
    }

    /**
     *  About ENS Resolver
     *
     *  @_section: api/providers/ens-resolver:ENS Resolver  [about-ens-rsolver]
     */
    // @TODO: This should use the fetch-data:ipfs gateway
    // Trim off the ipfs:// prefix and return the default gateway URL
    function getIpfsLink(link) {
        if (link.match(/^ipfs:\/\/ipfs\//i)) {
            link = link.substring(12);
        }
        else if (link.match(/^ipfs:\/\//i)) {
            link = link.substring(7);
        }
        else {
            assertArgument(false, "unsupported IPFS format", "link", link);
        }
        return `https:/\/gateway.ipfs.io/ipfs/${link}`;
    }
    /**
     *  A provider plugin super-class for processing multicoin address types.
     */
    class MulticoinProviderPlugin {
        name;
        constructor(name) {
            defineProperties(this, { name });
        }
        connect(proivder) {
            return this;
        }
        supportsCoinType(coinType) {
            return false;
        }
        async encodeAddress(coinType, address) {
            throw new Error("unsupported coin");
        }
        async decodeAddress(coinType, data) {
            throw new Error("unsupported coin");
        }
    }
    const matcherIpfs = new RegExp("^(ipfs):/\/(.*)$", "i");
    const matchers = [
        new RegExp("^(https):/\/(.*)$", "i"),
        new RegExp("^(data):(.*)$", "i"),
        matcherIpfs,
        new RegExp("^eip155:[0-9]+/(erc[0-9]+):(.*)$", "i"),
    ];
    /**
     *  A connected object to a resolved ENS name resolver, which can be
     *  used to query additional details.
     */
    class EnsResolver {
        /**
         *  The connected provider.
         */
        provider;
        /**
         *  The address of the resolver.
         */
        address;
        /**
         *  The name this resovler was resolved against.
         */
        name;
        // For EIP-2544 names, the ancestor that provided the resolver
        #supports2544;
        #resolver;
        constructor(provider, address, name) {
            defineProperties(this, { provider, address, name });
            this.#supports2544 = null;
            this.#resolver = new Contract(address, [
                "function supportsInterface(bytes4) view returns (bool)",
                "function resolve(bytes, bytes) view returns (bytes)",
                "function addr(bytes32) view returns (address)",
                "function addr(bytes32, uint) view returns (address)",
                "function text(bytes32, string) view returns (string)",
                "function contenthash(bytes32) view returns (bytes)",
            ], provider);
        }
        /**
         *  Resolves to true if the resolver supports wildcard resolution.
         */
        async supportsWildcard() {
            if (this.#supports2544 == null) {
                this.#supports2544 = (async () => {
                    try {
                        return await this.#resolver.supportsInterface("0x9061b923");
                    }
                    catch (error) {
                        // Wildcard resolvers must understand supportsInterface
                        // and return true.
                        if (isError(error, "CALL_EXCEPTION")) {
                            return false;
                        }
                        // Let future attempts try again...
                        this.#supports2544 = null;
                        throw error;
                    }
                })();
            }
            return await this.#supports2544;
        }
        async #fetch(funcName, params) {
            params = (params || []).slice();
            const iface = this.#resolver.interface;
            // The first parameters is always the nodehash
            params.unshift(namehash(this.name));
            let fragment = null;
            if (await this.supportsWildcard()) {
                fragment = iface.getFunction(funcName);
                assert$1(fragment, "missing fragment", "UNKNOWN_ERROR", {
                    info: { funcName }
                });
                params = [
                    dnsEncode(this.name),
                    iface.encodeFunctionData(fragment, params)
                ];
                funcName = "resolve(bytes,bytes)";
            }
            params.push({
                ccipReadEnable: true
            });
            try {
                const result = await this.#resolver[funcName](...params);
                if (fragment) {
                    return iface.decodeFunctionResult(fragment, result)[0];
                }
                return result;
            }
            catch (error) {
                if (!isError(error, "CALL_EXCEPTION")) {
                    throw error;
                }
            }
            return null;
        }
        /**
         *  Resolves to the address for %%coinType%% or null if the
         *  provided %%coinType%% has not been configured.
         */
        async getAddress(coinType) {
            if (coinType == null) {
                coinType = 60;
            }
            if (coinType === 60) {
                try {
                    const result = await this.#fetch("addr(bytes32)");
                    // No address
                    if (result == null || result === ZeroAddress) {
                        return null;
                    }
                    return result;
                }
                catch (error) {
                    if (isError(error, "CALL_EXCEPTION")) {
                        return null;
                    }
                    throw error;
                }
            }
            let coinPlugin = null;
            for (const plugin of this.provider.plugins) {
                if (!(plugin instanceof MulticoinProviderPlugin)) {
                    continue;
                }
                if (plugin.supportsCoinType(coinType)) {
                    coinPlugin = plugin;
                    break;
                }
            }
            if (coinPlugin == null) {
                return null;
            }
            // keccak256("addr(bytes32,uint256")
            const data = await this.#fetch("addr(bytes32,uint)", [coinType]);
            // No address
            if (data == null || data === "0x") {
                return null;
            }
            // Compute the address
            const address = await coinPlugin.encodeAddress(coinType, data);
            if (address != null) {
                return address;
            }
            assert$1(false, `invalid coin data`, "UNSUPPORTED_OPERATION", {
                operation: `getAddress(${coinType})`,
                info: { coinType, data }
            });
        }
        /**
         *  Resovles to the EIP-643 text record for %%key%%, or ``null``
         *  if unconfigured.
         */
        async getText(key) {
            const data = await this.#fetch("text(bytes32,string)", [key]);
            if (data == null || data === "0x") {
                return null;
            }
            return data;
        }
        /**
         *  Rsolves to the content-hash or ``null`` if unconfigured.
         */
        async getContentHash() {
            // keccak256("contenthash()")
            const data = await this.#fetch("contenthash(bytes32)");
            // No contenthash
            if (data == null || data === "0x") {
                return null;
            }
            // IPFS (CID: 1, Type: 70=DAG-PB, 72=libp2p-key)
            const ipfs = data.match(/^0x(e3010170|e5010172)(([0-9a-f][0-9a-f])([0-9a-f][0-9a-f])([0-9a-f]*))$/);
            if (ipfs) {
                const scheme = (ipfs[1] === "e3010170") ? "ipfs" : "ipns";
                const length = parseInt(ipfs[4], 16);
                if (ipfs[5].length === length * 2) {
                    return `${scheme}:/\/${encodeBase58("0x" + ipfs[2])}`;
                }
            }
            // Swarm (CID: 1, Type: swarm-manifest; hash/length hard-coded to keccak256/32)
            const swarm = data.match(/^0xe40101fa011b20([0-9a-f]*)$/);
            if (swarm && swarm[1].length === 64) {
                return `bzz:/\/${swarm[1]}`;
            }
            assert$1(false, `invalid or unsupported content hash data`, "UNSUPPORTED_OPERATION", {
                operation: "getContentHash()",
                info: { data }
            });
        }
        /**
         *  Resolves to the avatar url or ``null`` if the avatar is either
         *  unconfigured or incorrectly configured (e.g. references an NFT
         *  not owned by the address).
         *
         *  If diagnosing issues with configurations, the [[_getAvatar]]
         *  method may be useful.
         */
        async getAvatar() {
            const avatar = await this._getAvatar();
            return avatar.url;
        }
        /**
         *  When resolving an avatar, there are many steps involved, such
         *  fetching metadata and possibly validating ownership of an
         *  NFT.
         *
         *  This method can be used to examine each step and the value it
         *  was working from.
         */
        async _getAvatar() {
            const linkage = [{ type: "name", value: this.name }];
            try {
                // test data for ricmoo.eth
                //const avatar = "eip155:1/erc721:0x265385c7f4132228A0d54EB1A9e7460b91c0cC68/29233";
                const avatar = await this.getText("avatar");
                if (avatar == null) {
                    linkage.push({ type: "!avatar", value: "" });
                    return { url: null, linkage };
                }
                linkage.push({ type: "avatar", value: avatar });
                for (let i = 0; i < matchers.length; i++) {
                    const match = avatar.match(matchers[i]);
                    if (match == null) {
                        continue;
                    }
                    const scheme = match[1].toLowerCase();
                    switch (scheme) {
                        case "https":
                        case "data":
                            linkage.push({ type: "url", value: avatar });
                            return { linkage, url: avatar };
                        case "ipfs": {
                            const url = getIpfsLink(avatar);
                            linkage.push({ type: "ipfs", value: avatar });
                            linkage.push({ type: "url", value: url });
                            return { linkage, url };
                        }
                        case "erc721":
                        case "erc1155": {
                            // Depending on the ERC type, use tokenURI(uint256) or url(uint256)
                            const selector = (scheme === "erc721") ? "tokenURI(uint256)" : "uri(uint256)";
                            linkage.push({ type: scheme, value: avatar });
                            // The owner of this name
                            const owner = await this.getAddress();
                            if (owner == null) {
                                linkage.push({ type: "!owner", value: "" });
                                return { url: null, linkage };
                            }
                            const comps = (match[2] || "").split("/");
                            if (comps.length !== 2) {
                                linkage.push({ type: `!${scheme}caip`, value: (match[2] || "") });
                                return { url: null, linkage };
                            }
                            const tokenId = comps[1];
                            const contract = new Contract(comps[0], [
                                // ERC-721
                                "function tokenURI(uint) view returns (string)",
                                "function ownerOf(uint) view returns (address)",
                                // ERC-1155
                                "function uri(uint) view returns (string)",
                                "function balanceOf(address, uint256) view returns (uint)"
                            ], this.provider);
                            // Check that this account owns the token
                            if (scheme === "erc721") {
                                const tokenOwner = await contract.ownerOf(tokenId);
                                if (owner !== tokenOwner) {
                                    linkage.push({ type: "!owner", value: tokenOwner });
                                    return { url: null, linkage };
                                }
                                linkage.push({ type: "owner", value: tokenOwner });
                            }
                            else if (scheme === "erc1155") {
                                const balance = await contract.balanceOf(owner, tokenId);
                                if (!balance) {
                                    linkage.push({ type: "!balance", value: "0" });
                                    return { url: null, linkage };
                                }
                                linkage.push({ type: "balance", value: balance.toString() });
                            }
                            // Call the token contract for the metadata URL
                            let metadataUrl = await contract[selector](tokenId);
                            if (metadataUrl == null || metadataUrl === "0x") {
                                linkage.push({ type: "!metadata-url", value: "" });
                                return { url: null, linkage };
                            }
                            linkage.push({ type: "metadata-url-base", value: metadataUrl });
                            // ERC-1155 allows a generic {id} in the URL
                            if (scheme === "erc1155") {
                                metadataUrl = metadataUrl.replace("{id}", toBeHex(tokenId, 32).substring(2));
                                linkage.push({ type: "metadata-url-expanded", value: metadataUrl });
                            }
                            // Transform IPFS metadata links
                            if (metadataUrl.match(/^ipfs:/i)) {
                                metadataUrl = getIpfsLink(metadataUrl);
                            }
                            linkage.push({ type: "metadata-url", value: metadataUrl });
                            // Get the token metadata
                            let metadata = {};
                            const response = await (new FetchRequest(metadataUrl)).send();
                            response.assertOk();
                            try {
                                metadata = response.bodyJson;
                            }
                            catch (error) {
                                try {
                                    linkage.push({ type: "!metadata", value: response.bodyText });
                                }
                                catch (error) {
                                    const bytes = response.body;
                                    if (bytes) {
                                        linkage.push({ type: "!metadata", value: hexlify(bytes) });
                                    }
                                    return { url: null, linkage };
                                }
                                return { url: null, linkage };
                            }
                            if (!metadata) {
                                linkage.push({ type: "!metadata", value: "" });
                                return { url: null, linkage };
                            }
                            linkage.push({ type: "metadata", value: JSON.stringify(metadata) });
                            // Pull the image URL out
                            let imageUrl = metadata.image;
                            if (typeof (imageUrl) !== "string") {
                                linkage.push({ type: "!imageUrl", value: "" });
                                return { url: null, linkage };
                            }
                            if (imageUrl.match(/^(https:\/\/|data:)/i)) {
                                // Allow
                            }
                            else {
                                // Transform IPFS link to gateway
                                const ipfs = imageUrl.match(matcherIpfs);
                                if (ipfs == null) {
                                    linkage.push({ type: "!imageUrl-ipfs", value: imageUrl });
                                    return { url: null, linkage };
                                }
                                linkage.push({ type: "imageUrl-ipfs", value: imageUrl });
                                imageUrl = getIpfsLink(imageUrl);
                            }
                            linkage.push({ type: "url", value: imageUrl });
                            return { linkage, url: imageUrl };
                        }
                    }
                }
            }
            catch (error) { }
            return { linkage, url: null };
        }
        static async getEnsAddress(provider) {
            const network = await provider.getNetwork();
            const ensPlugin = network.getPlugin("org.ethers.plugins.network.Ens");
            // No ENS...
            assert$1(ensPlugin, "network does not support ENS", "UNSUPPORTED_OPERATION", {
                operation: "getEnsAddress", info: { network }
            });
            return ensPlugin.address;
        }
        static async #getResolver(provider, name) {
            const ensAddr = await EnsResolver.getEnsAddress(provider);
            try {
                const contract = new Contract(ensAddr, [
                    "function resolver(bytes32) view returns (address)"
                ], provider);
                const addr = await contract.resolver(namehash(name), {
                    enableCcipRead: true
                });
                if (addr === ZeroAddress) {
                    return null;
                }
                return addr;
            }
            catch (error) {
                // ENS registry cannot throw errors on resolver(bytes32),
                // so probably a link error
                throw error;
            }
            return null;
        }
        /**
         *  Resolve to the ENS resolver for %%name%% using %%provider%% or
         *  ``null`` if unconfigured.
         */
        static async fromName(provider, name) {
            let currentName = name;
            while (true) {
                if (currentName === "" || currentName === ".") {
                    return null;
                }
                // Optimization since the eth node cannot change and does
                // not have a wildcar resolver
                if (name !== "eth" && currentName === "eth") {
                    return null;
                }
                // Check the current node for a resolver
                const addr = await EnsResolver.#getResolver(provider, currentName);
                // Found a resolver!
                if (addr != null) {
                    const resolver = new EnsResolver(provider, addr, name);
                    // Legacy resolver found, using EIP-2544 so it isn't safe to use
                    if (currentName !== name && !(await resolver.supportsWildcard())) {
                        return null;
                    }
                    return resolver;
                }
                // Get the parent node
                currentName = currentName.split(".").slice(1).join(".");
            }
        }
    }

    /**
     *  @_ignore
     */
    const BN_0 = BigInt(0);
    function allowNull(format, nullValue) {
        return (function (value) {
            if (value == null) {
                return nullValue;
            }
            return format(value);
        });
    }
    function arrayOf(format) {
        return ((array) => {
            if (!Array.isArray(array)) {
                throw new Error("not an array");
            }
            return array.map((i) => format(i));
        });
    }
    // Requires an object which matches a fleet of other formatters
    // Any FormatFunc may return `undefined` to have the value omitted
    // from the result object. Calls preserve `this`.
    function object(format, altNames) {
        return ((value) => {
            const result = {};
            for (const key in format) {
                let srcKey = key;
                if (altNames && key in altNames && !(srcKey in value)) {
                    for (const altKey of altNames[key]) {
                        if (altKey in value) {
                            srcKey = altKey;
                            break;
                        }
                    }
                }
                try {
                    const nv = format[key](value[srcKey]);
                    if (nv !== undefined) {
                        result[key] = nv;
                    }
                }
                catch (error) {
                    const message = (error instanceof Error) ? error.message : "not-an-error";
                    assert$1(false, `invalid value for value.${key} (${message})`, "BAD_DATA", { value });
                }
            }
            return result;
        });
    }
    function formatBoolean(value) {
        switch (value) {
            case true:
            case "true":
                return true;
            case false:
            case "false":
                return false;
        }
        assertArgument(false, `invalid boolean; ${JSON.stringify(value)}`, "value", value);
    }
    function formatData(value) {
        assertArgument(isHexString(value, true), "invalid data", "value", value);
        return value;
    }
    function formatHash(value) {
        assertArgument(isHexString(value, 32), "invalid hash", "value", value);
        return value;
    }
    const _formatLog = object({
        address: getAddress,
        blockHash: formatHash,
        blockNumber: getNumber,
        data: formatData,
        index: getNumber,
        removed: formatBoolean,
        topics: arrayOf(formatHash),
        transactionHash: formatHash,
        transactionIndex: getNumber,
    }, {
        index: ["logIndex"]
    });
    function formatLog(value) {
        return _formatLog(value);
    }
    const _formatBlock = object({
        hash: allowNull(formatHash),
        parentHash: formatHash,
        number: getNumber,
        timestamp: getNumber,
        nonce: allowNull(formatData),
        difficulty: getBigInt,
        gasLimit: getBigInt,
        gasUsed: getBigInt,
        miner: allowNull(getAddress),
        extraData: formatData,
        baseFeePerGas: allowNull(getBigInt)
    });
    function formatBlock(value) {
        const result = _formatBlock(value);
        result.transactions = value.transactions.map((tx) => {
            if (typeof (tx) === "string") {
                return tx;
            }
            return formatTransactionResponse(tx);
        });
        return result;
    }
    const _formatReceiptLog = object({
        transactionIndex: getNumber,
        blockNumber: getNumber,
        transactionHash: formatHash,
        address: getAddress,
        topics: arrayOf(formatHash),
        data: formatData,
        index: getNumber,
        blockHash: formatHash,
    }, {
        index: ["logIndex"]
    });
    function formatReceiptLog(value) {
        return _formatReceiptLog(value);
    }
    const _formatTransactionReceipt = object({
        to: allowNull(getAddress, null),
        from: allowNull(getAddress, null),
        contractAddress: allowNull(getAddress, null),
        // should be allowNull(hash), but broken-EIP-658 support is handled in receipt
        index: getNumber,
        root: allowNull(hexlify),
        gasUsed: getBigInt,
        logsBloom: allowNull(formatData),
        blockHash: formatHash,
        hash: formatHash,
        logs: arrayOf(formatReceiptLog),
        blockNumber: getNumber,
        //confirmations: allowNull(getNumber, null),
        cumulativeGasUsed: getBigInt,
        effectiveGasPrice: allowNull(getBigInt),
        status: allowNull(getNumber),
        type: allowNull(getNumber, 0)
    }, {
        effectiveGasPrice: ["gasPrice"],
        hash: ["transactionHash"],
        index: ["transactionIndex"],
    });
    function formatTransactionReceipt(value) {
        return _formatTransactionReceipt(value);
    }
    function formatTransactionResponse(value) {
        // Some clients (TestRPC) do strange things like return 0x0 for the
        // 0 address; correct this to be a real address
        if (value.to && getBigInt(value.to) === BN_0) {
            value.to = "0x0000000000000000000000000000000000000000";
        }
        const result = object({
            hash: formatHash,
            type: (value) => {
                if (value === "0x" || value == null) {
                    return 0;
                }
                return getNumber(value);
            },
            accessList: allowNull(accessListify, null),
            blockHash: allowNull(formatHash, null),
            blockNumber: allowNull(getNumber, null),
            transactionIndex: allowNull(getNumber, null),
            //confirmations: allowNull(getNumber, null),
            from: getAddress,
            // either (gasPrice) or (maxPriorityFeePerGas + maxFeePerGas) must be set
            gasPrice: allowNull(getBigInt),
            maxPriorityFeePerGas: allowNull(getBigInt),
            maxFeePerGas: allowNull(getBigInt),
            gasLimit: getBigInt,
            to: allowNull(getAddress, null),
            value: getBigInt,
            nonce: getNumber,
            data: formatData,
            creates: allowNull(getAddress, null),
            chainId: allowNull(getBigInt, null)
        }, {
            data: ["input"],
            gasLimit: ["gas"]
        })(value);
        // If to and creates are empty, populate the creates from the value
        if (result.to == null && result.creates == null) {
            result.creates = getCreateAddress(result);
        }
        // @TODO: Check fee data
        // Add an access list to supported transaction types
        if ((value.type === 1 || value.type === 2) && value.accessList == null) {
            result.accessList = [];
        }
        // Compute the signature
        if (value.signature) {
            result.signature = Signature.from(value.signature);
        }
        else {
            result.signature = Signature.from(value);
        }
        // Some backends omit ChainId on legacy transactions, but we can compute it
        if (result.chainId == null) {
            const chainId = result.signature.legacyChainId;
            if (chainId != null) {
                result.chainId = chainId;
            }
        }
        // @TODO: check chainID
        /*
        if (value.chainId != null) {
            let chainId = value.chainId;

            if (isHexString(chainId)) {
                chainId = BigNumber.from(chainId).toNumber();
            }

            result.chainId = chainId;

        } else {
            let chainId = value.networkId;

            // geth-etc returns chainId
            if (chainId == null && result.v == null) {
                chainId = value.chainId;
            }

            if (isHexString(chainId)) {
                chainId = BigNumber.from(chainId).toNumber();
            }

            if (typeof(chainId) !== "number" && result.v != null) {
                chainId = (result.v - 35) / 2;
                if (chainId < 0) { chainId = 0; }
                chainId = parseInt(chainId);
            }

            if (typeof(chainId) !== "number") { chainId = 0; }

            result.chainId = chainId;
        }
        */
        // 0x0000... should actually be null
        if (result.blockHash && getBigInt(result.blockHash) === BN_0) {
            result.blockHash = null;
        }
        return result;
    }

    const EnsAddress = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";
    class NetworkPlugin {
        name;
        constructor(name) {
            defineProperties(this, { name });
        }
        clone() {
            return new NetworkPlugin(this.name);
        }
    }
    class GasCostPlugin extends NetworkPlugin {
        effectiveBlock;
        txBase;
        txCreate;
        txDataZero;
        txDataNonzero;
        txAccessListStorageKey;
        txAccessListAddress;
        constructor(effectiveBlock, costs) {
            if (effectiveBlock == null) {
                effectiveBlock = 0;
            }
            super(`org.ethers.network.plugins.GasCost#${(effectiveBlock || 0)}`);
            const props = { effectiveBlock };
            function set(name, nullish) {
                let value = (costs || {})[name];
                if (value == null) {
                    value = nullish;
                }
                assertArgument(typeof (value) === "number", `invalud value for ${name}`, "costs", costs);
                props[name] = value;
            }
            set("txBase", 21000);
            set("txCreate", 32000);
            set("txDataZero", 4);
            set("txDataNonzero", 16);
            set("txAccessListStorageKey", 1900);
            set("txAccessListAddress", 2400);
            defineProperties(this, props);
        }
        clone() {
            return new GasCostPlugin(this.effectiveBlock, this);
        }
    }
    // Networks shoudl use this plugin to specify the contract address
    // and network necessary to resolve ENS names.
    class EnsPlugin extends NetworkPlugin {
        // The ENS contract address
        address;
        // The network ID that the ENS contract lives on
        targetNetwork;
        constructor(address, targetNetwork) {
            super("org.ethers.plugins.network.Ens");
            defineProperties(this, {
                address: (address || EnsAddress),
                targetNetwork: ((targetNetwork == null) ? 1 : targetNetwork)
            });
        }
        clone() {
            return new EnsPlugin(this.address, this.targetNetwork);
        }
    }
    /*
    export class CustomBlockNetworkPlugin extends NetworkPlugin {
        readonly #blockFunc: (provider: Provider, block: BlockParams<string>) => Block<string>;
        readonly #blockWithTxsFunc: (provider: Provider, block: BlockParams<TransactionResponseParams>) => Block<TransactionResponse>;

        constructor(blockFunc: (provider: Provider, block: BlockParams<string>) => Block<string>, blockWithTxsFunc: (provider: Provider, block: BlockParams<TransactionResponseParams>) => Block<TransactionResponse>) {
            super("org.ethers.network-plugins.custom-block");
            this.#blockFunc = blockFunc;
            this.#blockWithTxsFunc = blockWithTxsFunc;
        }

        async getBlock(provider: Provider, block: BlockParams<string>): Promise<Block<string>> {
            return await this.#blockFunc(provider, block);
        }

        async getBlockions(provider: Provider, block: BlockParams<TransactionResponseParams>): Promise<Block<TransactionResponse>> {
            return await this.#blockWithTxsFunc(provider, block);
        }

        clone(): CustomBlockNetworkPlugin {
            return new CustomBlockNetworkPlugin(this.#blockFunc, this.#blockWithTxsFunc);
        }
    }
    */

    /**
     *  About networks
     *
     *  @_subsection: api/providers:Networks  [networks]
     */
    /* * * *
    // Networks which operation against an L2 can use this plugin to
    // specify how to access L1, for the purpose of resolving ENS,
    // for example.
    export class LayerOneConnectionPlugin extends NetworkPlugin {
        readonly provider!: Provider;
    // @TODO: Rename to ChainAccess and allow for connecting to any chain
        constructor(provider: Provider) {
            super("org.ethers.plugins.layer-one-connection");
            defineProperties<LayerOneConnectionPlugin>(this, { provider });
        }

        clone(): LayerOneConnectionPlugin {
            return new LayerOneConnectionPlugin(this.provider);
        }
    }
    */
    /* * * *
    export class PriceOraclePlugin extends NetworkPlugin {
        readonly address!: string;

        constructor(address: string) {
            super("org.ethers.plugins.price-oracle");
            defineProperties<PriceOraclePlugin>(this, { address });
        }

        clone(): PriceOraclePlugin {
            return new PriceOraclePlugin(this.address);
        }
    }
    */
    // Networks or clients with a higher need for security (such as clients
    // that may automatically make CCIP requests without user interaction)
    // can use this plugin to anonymize requests or intercept CCIP requests
    // to notify and/or receive authorization from the user
    /* * * *
    export type FetchDataFunc = (req: Frozen<FetchRequest>) => Promise<FetchRequest>;
    export class CcipPreflightPlugin extends NetworkPlugin {
        readonly fetchData!: FetchDataFunc;

        constructor(fetchData: FetchDataFunc) {
            super("org.ethers.plugins.ccip-preflight");
            defineProperties<CcipPreflightPlugin>(this, { fetchData });
        }

        clone(): CcipPreflightPlugin {
            return new CcipPreflightPlugin(this.fetchData);
        }
    }
    */
    const Networks = new Map();
    // @TODO: Add a _ethersNetworkObj variable to better detect network ovjects
    class Network {
        #name;
        #chainId;
        #plugins;
        constructor(name, chainId) {
            this.#name = name;
            this.#chainId = getBigInt(chainId);
            this.#plugins = new Map();
        }
        toJSON() {
            return { name: this.name, chainId: this.chainId };
        }
        get name() { return this.#name; }
        set name(value) { this.#name = value; }
        get chainId() { return this.#chainId; }
        set chainId(value) { this.#chainId = getBigInt(value, "chainId"); }
        get plugins() {
            return Array.from(this.#plugins.values());
        }
        attachPlugin(plugin) {
            if (this.#plugins.get(plugin.name)) {
                throw new Error(`cannot replace existing plugin: ${plugin.name} `);
            }
            this.#plugins.set(plugin.name, plugin.clone());
            return this;
        }
        getPlugin(name) {
            return (this.#plugins.get(name)) || null;
        }
        // Gets a list of Plugins which match basename, ignoring any fragment
        getPlugins(basename) {
            return (this.plugins.filter((p) => (p.name.split("#")[0] === basename)));
        }
        clone() {
            const clone = new Network(this.name, this.chainId);
            this.plugins.forEach((plugin) => {
                clone.attachPlugin(plugin.clone());
            });
            return clone;
        }
        computeIntrinsicGas(tx) {
            const costs = this.getPlugin("org.ethers.plugins.network.GasCost") || (new GasCostPlugin());
            let gas = costs.txBase;
            if (tx.to == null) {
                gas += costs.txCreate;
            }
            if (tx.data) {
                for (let i = 2; i < tx.data.length; i += 2) {
                    if (tx.data.substring(i, i + 2) === "00") {
                        gas += costs.txDataZero;
                    }
                    else {
                        gas += costs.txDataNonzero;
                    }
                }
            }
            if (tx.accessList) {
                const accessList = accessListify(tx.accessList);
                for (const addr in accessList) {
                    gas += costs.txAccessListAddress + costs.txAccessListStorageKey * accessList[addr].storageKeys.length;
                }
            }
            return gas;
        }
        /**
         *  Returns a new Network for the %%network%% name or chainId.
         */
        static from(network) {
            injectCommonNetworks();
            // Default network
            if (network == null) {
                return Network.from("mainnet");
            }
            // Canonical name or chain ID
            if (typeof (network) === "number") {
                network = BigInt(network);
            }
            if (typeof (network) === "string" || typeof (network) === "bigint") {
                const networkFunc = Networks.get(network);
                if (networkFunc) {
                    return networkFunc();
                }
                if (typeof (network) === "bigint") {
                    return new Network("unknown", network);
                }
                assertArgument(false, "unknown network", "network", network);
            }
            // Clonable with network-like abilities
            if (typeof (network.clone) === "function") {
                const clone = network.clone();
                //if (typeof(network.name) !== "string" || typeof(network.chainId) !== "number") {
                //}
                return clone;
            }
            // Networkish
            if (typeof (network) === "object") {
                assertArgument(typeof (network.name) === "string" && typeof (network.chainId) === "number", "invalid network object name or chainId", "network", network);
                const custom = new Network((network.name), (network.chainId));
                if (network.ensAddress || network.ensNetwork != null) {
                    custom.attachPlugin(new EnsPlugin(network.ensAddress, network.ensNetwork));
                }
                //if ((<any>network).layerOneConnection) {
                //    custom.attachPlugin(new LayerOneConnectionPlugin((<any>network).layerOneConnection));
                //}
                return custom;
            }
            assertArgument(false, "invalid network", "network", network);
        }
        /**
         *  Register %%nameOrChainId%% with a function which returns
         *  an instance of a Network representing that chain.
         */
        static register(nameOrChainId, networkFunc) {
            if (typeof (nameOrChainId) === "number") {
                nameOrChainId = BigInt(nameOrChainId);
            }
            const existing = Networks.get(nameOrChainId);
            if (existing) {
                assertArgument(false, `conflicting network for ${JSON.stringify(existing.name)}`, "nameOrChainId", nameOrChainId);
            }
            Networks.set(nameOrChainId, networkFunc);
        }
    }
    // See: https://chainlist.org
    let injected = false;
    function injectCommonNetworks() {
        if (injected) {
            return;
        }
        injected = true;
        /// Register popular Ethereum networks
        function registerEth(name, chainId, options) {
            const func = function () {
                const network = new Network(name, chainId);
                // We use 0 to disable ENS
                if (options.ensNetwork != null) {
                    network.attachPlugin(new EnsPlugin(null, options.ensNetwork));
                }
                if (options.priorityFee) ;
                /*
                            if (options.etherscan) {
                                const { url, apiKey } = options.etherscan;
                                network.attachPlugin(new EtherscanPlugin(url, apiKey));
                            }
                */
                network.attachPlugin(new GasCostPlugin());
                return network;
            };
            // Register the network by name and chain ID
            Network.register(name, func);
            Network.register(chainId, func);
            if (options.altNames) {
                options.altNames.forEach((name) => {
                    Network.register(name, func);
                });
            }
        }
        registerEth("mainnet", 1, { ensNetwork: 1, altNames: ["homestead"] });
        registerEth("ropsten", 3, { ensNetwork: 3 });
        registerEth("rinkeby", 4, { ensNetwork: 4 });
        registerEth("goerli", 5, { ensNetwork: 5 });
        registerEth("kovan", 42, { ensNetwork: 42 });
        registerEth("classic", 61, {});
        registerEth("classicKotti", 6, {});
        registerEth("xdai", 100, { ensNetwork: 1 });
        registerEth("optimism", 10, {
            ensNetwork: 1,
            etherscan: { url: "https:/\/api-optimistic.etherscan.io/" }
        });
        registerEth("optimism-goerli", 420, {
            etherscan: { url: "https:/\/api-goerli-optimistic.etherscan.io/" }
        });
        registerEth("arbitrum", 42161, {
            ensNetwork: 1,
            etherscan: { url: "https:/\/api.arbiscan.io/" }
        });
        registerEth("arbitrum-goerli", 421613, {
            etherscan: { url: "https:/\/api-goerli.arbiscan.io/" }
        });
        // Polygon has a 35 gwei maxPriorityFee requirement
        registerEth("matic", 137, {
            ensNetwork: 1,
            //        priorityFee: 35000000000,
            etherscan: {
                //            apiKey: "W6T8DJW654GNTQ34EFEYYP3EZD9DD27CT7",
                url: "https:/\/api.polygonscan.com/"
            }
        });
        registerEth("matic-mumbai", 80001, {
            altNames: ["maticMumbai", "maticmum"],
            //        priorityFee: 35000000000,
            etherscan: {
                //            apiKey: "W6T8DJW654GNTQ34EFEYYP3EZD9DD27CT7",
                url: "https:/\/api-testnet.polygonscan.com/"
            }
        });
        registerEth("bnb", 56, {
            ensNetwork: 1,
            etherscan: {
                //            apiKey: "EVTS3CU31AATZV72YQ55TPGXGMVIFUQ9M9",
                url: "http:/\/api.bscscan.com"
            }
        });
        registerEth("bnbt", 97, {
            etherscan: {
                //            apiKey: "EVTS3CU31AATZV72YQ55TPGXGMVIFUQ9M9",
                url: "http:/\/api-testnet.bscscan.com"
            }
        });
    }

    function copy$2(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    // @TODO: refactor this
    /**
     *  @TODO
     *
     *  @_docloc: api/providers/abstract-provider
     */
    class PollingBlockSubscriber {
        #provider;
        #poller;
        #interval;
        // The most recent block we have scanned for events. The value -2
        // indicates we still need to fetch an initial block number
        #blockNumber;
        constructor(provider) {
            this.#provider = provider;
            this.#poller = null;
            this.#interval = 4000;
            this.#blockNumber = -2;
        }
        get pollingInterval() { return this.#interval; }
        set pollingInterval(value) { this.#interval = value; }
        async #poll() {
            const blockNumber = await this.#provider.getBlockNumber();
            if (this.#blockNumber === -2) {
                this.#blockNumber = blockNumber;
                return;
            }
            // @TODO: Put a cap on the maximum number of events per loop?
            if (blockNumber !== this.#blockNumber) {
                for (let b = this.#blockNumber + 1; b <= blockNumber; b++) {
                    // We have been stopped
                    if (this.#poller == null) {
                        return;
                    }
                    await this.#provider.emit("block", b);
                }
                this.#blockNumber = blockNumber;
            }
            // We have been stopped
            if (this.#poller == null) {
                return;
            }
            this.#poller = this.#provider._setTimeout(this.#poll.bind(this), this.#interval);
        }
        start() {
            if (this.#poller) {
                return;
            }
            this.#poller = this.#provider._setTimeout(this.#poll.bind(this), this.#interval);
            this.#poll();
        }
        stop() {
            if (!this.#poller) {
                return;
            }
            this.#provider._clearTimeout(this.#poller);
            this.#poller = null;
        }
        pause(dropWhilePaused) {
            this.stop();
            if (dropWhilePaused) {
                this.#blockNumber = -2;
            }
        }
        resume() {
            this.start();
        }
    }
    /**
     *  @TODO
     *
     *  @_docloc: api/providers/abstract-provider
     */
    class OnBlockSubscriber {
        #provider;
        #poll;
        #running;
        constructor(provider) {
            this.#provider = provider;
            this.#running = false;
            this.#poll = (blockNumber) => {
                this._poll(blockNumber, this.#provider);
            };
        }
        async _poll(blockNumber, provider) {
            throw new Error("sub-classes must override this");
        }
        start() {
            if (this.#running) {
                return;
            }
            this.#running = true;
            this.#poll(-2);
            this.#provider.on("block", this.#poll);
        }
        stop() {
            if (!this.#running) {
                return;
            }
            this.#running = false;
            this.#provider.off("block", this.#poll);
        }
        pause(dropWhilePaused) { this.stop(); }
        resume() { this.start(); }
    }
    /**
     *  @TODO
     *
     *  @_docloc: api/providers/abstract-provider
     */
    class PollingOrphanSubscriber extends OnBlockSubscriber {
        #filter;
        constructor(provider, filter) {
            super(provider);
            this.#filter = copy$2(filter);
        }
        async _poll(blockNumber, provider) {
            throw new Error("@TODO");
        }
    }
    /**
     *  @TODO
     *
     *  @_docloc: api/providers/abstract-provider
     */
    class PollingTransactionSubscriber extends OnBlockSubscriber {
        #hash;
        constructor(provider, hash) {
            super(provider);
            this.#hash = hash;
        }
        async _poll(blockNumber, provider) {
            const tx = await provider.getTransactionReceipt(this.#hash);
            if (tx) {
                provider.emit(this.#hash, tx);
            }
        }
    }
    /**
     *  @TODO
     *
     *  @_docloc: api/providers/abstract-provider
     */
    class PollingEventSubscriber {
        #provider;
        #filter;
        #poller;
        #running;
        // The most recent block we have scanned for events. The value -2
        // indicates we still need to fetch an initial block number
        #blockNumber;
        constructor(provider, filter) {
            this.#provider = provider;
            this.#filter = copy$2(filter);
            this.#poller = this.#poll.bind(this);
            this.#running = false;
            this.#blockNumber = -2;
        }
        async #poll(blockNumber) {
            // The initial block hasn't been determined yet
            if (this.#blockNumber === -2) {
                return;
            }
            const filter = copy$2(this.#filter);
            filter.fromBlock = this.#blockNumber + 1;
            filter.toBlock = blockNumber;
            const logs = await this.#provider.getLogs(filter);
            // No logs could just mean the node has not indexed them yet,
            // so we keep a sliding window of 60 blocks to keep scanning
            if (logs.length === 0) {
                if (this.#blockNumber < blockNumber - 60) {
                    this.#blockNumber = blockNumber - 60;
                }
                return;
            }
            this.#blockNumber = blockNumber;
            for (const log of logs) {
                this.#provider.emit(this.#filter, log);
            }
        }
        start() {
            if (this.#running) {
                return;
            }
            this.#running = true;
            if (this.#blockNumber === -2) {
                this.#provider.getBlockNumber().then((blockNumber) => {
                    this.#blockNumber = blockNumber;
                });
            }
            this.#provider.on("block", this.#poller);
        }
        stop() {
            if (!this.#running) {
                return;
            }
            this.#running = false;
            this.#provider.off("block", this.#poller);
        }
        pause(dropWhilePaused) {
            this.stop();
            if (dropWhilePaused) {
                this.#blockNumber = -2;
            }
        }
        resume() {
            this.start();
        }
    }

    /**
     *  About Subclassing the Provider...
     *
     *  @_section: api/providers/abstract-provider: Subclassing Provider  [abstract-provider]
     */
    // Constants
    const BN_2 = BigInt(2);
    const MAX_CCIP_REDIRECTS = 10;
    function isPromise(value) {
        return (value && typeof (value.then) === "function");
    }
    function getTag(prefix, value) {
        return prefix + ":" + JSON.stringify(value, (k, v) => {
            if (v == null) {
                return "null";
            }
            if (typeof (v) === "bigint") {
                return `bigint:${v.toString()}`;
            }
            if (typeof (v) === "string") {
                return v.toLowerCase();
            }
            // Sort object keys
            if (typeof (v) === "object" && !Array.isArray(v)) {
                const keys = Object.keys(v);
                keys.sort();
                return keys.reduce((accum, key) => {
                    accum[key] = v[key];
                    return accum;
                }, {});
            }
            return v;
        });
    }
    class UnmanagedSubscriber {
        name;
        constructor(name) { defineProperties(this, { name }); }
        start() { }
        stop() { }
        pause(dropWhilePaused) { }
        resume() { }
    }
    function copy$1(value) {
        return JSON.parse(JSON.stringify(value));
    }
    function concisify(items) {
        items = Array.from((new Set(items)).values());
        items.sort();
        return items;
    }
    async function getSubscription(_event, provider) {
        if (_event == null) {
            throw new Error("invalid event");
        }
        // Normalize topic array info an EventFilter
        if (Array.isArray(_event)) {
            _event = { topics: _event };
        }
        if (typeof (_event) === "string") {
            switch (_event) {
                case "block":
                case "pending":
                case "debug":
                case "network": {
                    return { type: _event, tag: _event };
                }
            }
        }
        if (isHexString(_event, 32)) {
            const hash = _event.toLowerCase();
            return { type: "transaction", tag: getTag("tx", { hash }), hash };
        }
        if (_event.orphan) {
            const event = _event;
            // @TODO: Should lowercase and whatnot things here instead of copy...
            return { type: "orphan", tag: getTag("orphan", event), filter: copy$1(event) };
        }
        if ((_event.address || _event.topics)) {
            const event = _event;
            const filter = {
                topics: ((event.topics || []).map((t) => {
                    if (t == null) {
                        return null;
                    }
                    if (Array.isArray(t)) {
                        return concisify(t.map((t) => t.toLowerCase()));
                    }
                    return t.toLowerCase();
                }))
            };
            if (event.address) {
                const addresses = [];
                const promises = [];
                const addAddress = (addr) => {
                    if (isHexString(addr)) {
                        addresses.push(addr);
                    }
                    else {
                        promises.push((async () => {
                            addresses.push(await resolveAddress(addr, provider));
                        })());
                    }
                };
                if (Array.isArray(event.address)) {
                    event.address.forEach(addAddress);
                }
                else {
                    addAddress(event.address);
                }
                if (promises.length) {
                    await Promise.all(promises);
                }
                filter.address = concisify(addresses.map((a) => a.toLowerCase()));
            }
            return { filter, tag: getTag("event", filter), type: "event" };
        }
        assertArgument(false, "unknown ProviderEvent", "event", _event);
    }
    function getTime() { return (new Date()).getTime(); }
    class AbstractProvider {
        #subs;
        #plugins;
        // null=unpaused, true=paused+dropWhilePaused, false=paused
        #pausedState;
        #networkPromise;
        #anyNetwork;
        #performCache;
        // The most recent block number if running an event or -1 if no "block" event
        #lastBlockNumber;
        #nextTimer;
        #timers;
        #disableCcipRead;
        // @TODO: This should be a () => Promise<Network> so network can be
        // done when needed; or rely entirely on _detectNetwork?
        constructor(_network) {
            if (_network === "any") {
                this.#anyNetwork = true;
                this.#networkPromise = null;
            }
            else if (_network) {
                const network = Network.from(_network);
                this.#anyNetwork = false;
                this.#networkPromise = Promise.resolve(network);
                setTimeout(() => { this.emit("network", network, null); }, 0);
            }
            else {
                this.#anyNetwork = false;
                this.#networkPromise = null;
            }
            this.#lastBlockNumber = -1;
            this.#performCache = new Map();
            this.#subs = new Map();
            this.#plugins = new Map();
            this.#pausedState = null;
            this.#nextTimer = 1;
            this.#timers = new Map();
            this.#disableCcipRead = false;
        }
        get provider() { return this; }
        get plugins() {
            return Array.from(this.#plugins.values());
        }
        attachPlugin(plugin) {
            if (this.#plugins.get(plugin.name)) {
                throw new Error(`cannot replace existing plugin: ${plugin.name} `);
            }
            this.#plugins.set(plugin.name, plugin.connect(this));
            return this;
        }
        getPlugin(name) {
            return (this.#plugins.get(name)) || null;
        }
        get disableCcipRead() { return this.#disableCcipRead; }
        set disableCcipRead(value) { this.#disableCcipRead = !!value; }
        // Shares multiple identical requests made during the same 250ms
        async #perform(req) {
            // Create a tag
            const tag = getTag(req.method, req);
            let perform = this.#performCache.get(tag);
            if (!perform) {
                perform = this._perform(req);
                this.#performCache.set(tag, perform);
                setTimeout(() => {
                    if (this.#performCache.get(tag) === perform) {
                        this.#performCache.delete(tag);
                    }
                }, 250);
            }
            return await perform;
        }
        async ccipReadFetch(tx, calldata, urls) {
            if (this.disableCcipRead || urls.length === 0 || tx.to == null) {
                return null;
            }
            const sender = tx.to.toLowerCase();
            const data = calldata.toLowerCase();
            const errorMessages = [];
            for (let i = 0; i < urls.length; i++) {
                const url = urls[i];
                // URL expansion
                const href = url.replace("{sender}", sender).replace("{data}", data);
                // If no {data} is present, use POST; otherwise GET
                //const json: string | null = (url.indexOf("{data}") >= 0) ? null: JSON.stringify({ data, sender });
                //const result = await fetchJson({ url: href, errorPassThrough: true }, json, (value, response) => {
                //    value.status = response.statusCode;
                //    return value;
                //});
                const request = new FetchRequest(href);
                if (url.indexOf("{data}") === -1) {
                    request.body = { data, sender };
                }
                this.emit("debug", { action: "sendCcipReadFetchRequest", request, index: i, urls });
                let errorMessage = "unknown error";
                const resp = await request.send();
                try {
                    const result = resp.bodyJson;
                    if (result.data) {
                        this.emit("debug", { action: "receiveCcipReadFetchResult", request, result });
                        return result.data;
                    }
                    if (result.message) {
                        errorMessage = result.message;
                    }
                    this.emit("debug", { action: "receiveCcipReadFetchError", request, result });
                }
                catch (error) { }
                // 4xx indicates the result is not present; stop
                assert$1(resp.statusCode < 400 || resp.statusCode >= 500, `response not found during CCIP fetch: ${errorMessage}`, "OFFCHAIN_FAULT", { reason: "404_MISSING_RESOURCE", transaction: tx, info: { url, errorMessage } });
                // 5xx indicates server issue; try the next url
                errorMessages.push(errorMessage);
            }
            assert$1(false, `error encountered during CCIP fetch: ${errorMessages.map((m) => JSON.stringify(m)).join(", ")}`, "OFFCHAIN_FAULT", {
                reason: "500_SERVER_ERROR",
                transaction: tx, info: { urls, errorMessages }
            });
        }
        _wrapBlock(value, network) {
            return new Block(formatBlock(value), this);
        }
        _wrapLog(value, network) {
            return new Log(formatLog(value), this);
        }
        _wrapTransactionReceipt(value, network) {
            return new TransactionReceipt(formatTransactionReceipt(value), this);
        }
        _wrapTransactionResponse(tx, network) {
            return new TransactionResponse(tx, this);
        }
        _detectNetwork() {
            assert$1(false, "sub-classes must implement this", "UNSUPPORTED_OPERATION", {
                operation: "_detectNetwork"
            });
        }
        // Sub-classes should override this and handle PerformActionRequest requests, calling
        // the super for any unhandled actions.
        async _perform(req) {
            assert$1(false, `unsupported method: ${req.method}`, "UNSUPPORTED_OPERATION", {
                operation: req.method,
                info: req
            });
        }
        // State
        async getBlockNumber() {
            const blockNumber = getNumber(await this.#perform({ method: "getBlockNumber" }), "%response");
            if (this.#lastBlockNumber >= 0) {
                this.#lastBlockNumber = blockNumber;
            }
            return blockNumber;
        }
        _getAddress(address) {
            return resolveAddress(address, this);
        }
        _getBlockTag(blockTag) {
            if (blockTag == null) {
                return "latest";
            }
            switch (blockTag) {
                case "earliest":
                    return "0x0";
                case "latest":
                case "pending":
                case "safe":
                case "finalized":
                    return blockTag;
            }
            if (isHexString(blockTag)) {
                if (isHexString(blockTag, 32)) {
                    return blockTag;
                }
                return toQuantity(blockTag);
            }
            if (typeof (blockTag) === "number") {
                if (blockTag >= 0) {
                    return toQuantity(blockTag);
                }
                if (this.#lastBlockNumber >= 0) {
                    return toQuantity(this.#lastBlockNumber + blockTag);
                }
                return this.getBlockNumber().then((b) => toQuantity(b + blockTag));
            }
            assertArgument(false, "invalid blockTag", "blockTag", blockTag);
        }
        _getFilter(filter) {
            // Create a canonical representation of the topics
            const topics = (filter.topics || []).map((t) => {
                if (t == null) {
                    return null;
                }
                if (Array.isArray(t)) {
                    return concisify(t.map((t) => t.toLowerCase()));
                }
                return t.toLowerCase();
            });
            const blockHash = ("blockHash" in filter) ? filter.blockHash : undefined;
            const resolve = (_address, fromBlock, toBlock) => {
                let address = undefined;
                switch (_address.length) {
                    case 0: break;
                    case 1:
                        address = _address[0];
                        break;
                    default:
                        _address.sort();
                        address = _address;
                }
                if (blockHash) {
                    if (fromBlock != null || toBlock != null) {
                        throw new Error("invalid filter");
                    }
                }
                const filter = {};
                if (address) {
                    filter.address = address;
                }
                if (topics.length) {
                    filter.topics = topics;
                }
                if (fromBlock) {
                    filter.fromBlock = fromBlock;
                }
                if (toBlock) {
                    filter.toBlock = toBlock;
                }
                if (blockHash) {
                    filter.blockHash = blockHash;
                }
                return filter;
            };
            // Addresses could be async (ENS names or Addressables)
            let address = [];
            if (filter.address) {
                if (Array.isArray(filter.address)) {
                    for (const addr of filter.address) {
                        address.push(this._getAddress(addr));
                    }
                }
                else {
                    address.push(this._getAddress(filter.address));
                }
            }
            let fromBlock = undefined;
            if ("fromBlock" in filter) {
                fromBlock = this._getBlockTag(filter.fromBlock);
            }
            let toBlock = undefined;
            if ("toBlock" in filter) {
                toBlock = this._getBlockTag(filter.toBlock);
            }
            if (address.filter((a) => (typeof (a) !== "string")).length ||
                (fromBlock != null && typeof (fromBlock) !== "string") ||
                (toBlock != null && typeof (toBlock) !== "string")) {
                return Promise.all([Promise.all(address), fromBlock, toBlock]).then((result) => {
                    return resolve(result[0], result[1], result[2]);
                });
            }
            return resolve(address, fromBlock, toBlock);
        }
        _getTransactionRequest(_request) {
            const request = copyRequest(_request);
            const promises = [];
            ["to", "from"].forEach((key) => {
                if (request[key] == null) {
                    return;
                }
                const addr = resolveAddress(request[key]);
                if (isPromise(addr)) {
                    promises.push((async function () { request[key] = await addr; })());
                }
                else {
                    request[key] = addr;
                }
            });
            if (request.blockTag != null) {
                const blockTag = this._getBlockTag(request.blockTag);
                if (isPromise(blockTag)) {
                    promises.push((async function () { request.blockTag = await blockTag; })());
                }
                else {
                    request.blockTag = blockTag;
                }
            }
            if (promises.length) {
                return (async function () {
                    await Promise.all(promises);
                    return request;
                })();
            }
            return request;
        }
        async getNetwork() {
            // No explicit network was set and this is our first time
            if (this.#networkPromise == null) {
                // Detect the current network (shared with all calls)
                const detectNetwork = this._detectNetwork().then((network) => {
                    this.emit("network", network, null);
                    return network;
                }, (error) => {
                    // Reset the networkPromise on failure, so we will try again
                    if (this.#networkPromise === detectNetwork) {
                        this.#networkPromise = null;
                    }
                    throw error;
                });
                this.#networkPromise = detectNetwork;
                return (await detectNetwork).clone();
            }
            const networkPromise = this.#networkPromise;
            const [expected, actual] = await Promise.all([
                networkPromise,
                this._detectNetwork() // The actual connected network
            ]);
            if (expected.chainId !== actual.chainId) {
                if (this.#anyNetwork) {
                    // The "any" network can change, so notify listeners
                    this.emit("network", actual, expected);
                    // Update the network if something else hasn't already changed it
                    if (this.#networkPromise === networkPromise) {
                        this.#networkPromise = Promise.resolve(actual);
                    }
                }
                else {
                    // Otherwise, we do not allow changes to the underlying network
                    assert$1(false, `network changed: ${expected.chainId} => ${actual.chainId} `, "NETWORK_ERROR", {
                        event: "changed"
                    });
                }
            }
            return expected.clone();
        }
        async getFeeData() {
            const { block, gasPrice } = await resolveProperties({
                block: this.getBlock("latest"),
                gasPrice: ((async () => {
                    try {
                        const gasPrice = await this.#perform({ method: "getGasPrice" });
                        return getBigInt(gasPrice, "%response");
                    }
                    catch (error) { }
                    return null;
                })())
            });
            let maxFeePerGas = null, maxPriorityFeePerGas = null;
            if (block && block.baseFeePerGas) {
                // We may want to compute this more accurately in the future,
                // using the formula "check if the base fee is correct".
                // See: https://eips.ethereum.org/EIPS/eip-1559
                maxPriorityFeePerGas = BigInt("1000000000");
                // Allow a network to override their maximum priority fee per gas
                //const priorityFeePlugin = (await this.getNetwork()).getPlugin<MaxPriorityFeePlugin>("org.ethers.plugins.max-priority-fee");
                //if (priorityFeePlugin) {
                //    maxPriorityFeePerGas = await priorityFeePlugin.getPriorityFee(this);
                //}
                maxFeePerGas = (block.baseFeePerGas * BN_2) + maxPriorityFeePerGas;
            }
            return new FeeData(gasPrice, maxFeePerGas, maxPriorityFeePerGas);
        }
        async estimateGas(_tx) {
            let tx = this._getTransactionRequest(_tx);
            if (isPromise(tx)) {
                tx = await tx;
            }
            return getBigInt(await this.#perform({
                method: "estimateGas", transaction: tx
            }), "%response");
        }
        async #call(tx, blockTag, attempt) {
            assert$1(attempt < MAX_CCIP_REDIRECTS, "CCIP read exceeded maximum redirections", "OFFCHAIN_FAULT", {
                reason: "TOO_MANY_REDIRECTS",
                transaction: Object.assign({}, tx, { blockTag, enableCcipRead: true })
            });
            // This came in as a PerformActionTransaction, so to/from are safe; we can cast
            const transaction = copyRequest(tx);
            try {
                return hexlify(await this._perform({ method: "call", transaction, blockTag }));
            }
            catch (error) {
                // CCIP Read OffchainLookup
                if (!this.disableCcipRead && isCallException(error) && error.data && attempt >= 0 && blockTag === "latest" && transaction.to != null && dataSlice(error.data, 0, 4) === "0x556f1830") {
                    const data = error.data;
                    const txSender = await resolveAddress(transaction.to, this);
                    // Parse the CCIP Read Arguments
                    let ccipArgs;
                    try {
                        ccipArgs = parseOffchainLookup(dataSlice(error.data, 4));
                    }
                    catch (error) {
                        assert$1(false, error.message, "OFFCHAIN_FAULT", {
                            reason: "BAD_DATA", transaction, info: { data }
                        });
                    }
                    // Check the sender of the OffchainLookup matches the transaction
                    assert$1(ccipArgs.sender.toLowerCase() === txSender.toLowerCase(), "CCIP Read sender mismatch", "CALL_EXCEPTION", {
                        action: "call",
                        data,
                        reason: "OffchainLookup",
                        transaction: transaction,
                        invocation: null,
                        revert: {
                            signature: "OffchainLookup(address,string[],bytes,bytes4,bytes)",
                            name: "OffchainLookup",
                            args: ccipArgs.errorArgs
                        }
                    });
                    const ccipResult = await this.ccipReadFetch(transaction, ccipArgs.calldata, ccipArgs.urls);
                    assert$1(ccipResult != null, "CCIP Read failed to fetch data", "OFFCHAIN_FAULT", {
                        reason: "FETCH_FAILED", transaction, info: { data: error.data, errorArgs: ccipArgs.errorArgs }
                    });
                    const tx = {
                        to: txSender,
                        data: concat([ccipArgs.selector, encodeBytes([ccipResult, ccipArgs.extraData])])
                    };
                    this.emit("debug", { action: "sendCcipReadCall", transaction: tx });
                    try {
                        const result = await this.#call(tx, blockTag, attempt + 1);
                        this.emit("debug", { action: "receiveCcipReadCallResult", transaction: Object.assign({}, tx), result });
                        return result;
                    }
                    catch (error) {
                        this.emit("debug", { action: "receiveCcipReadCallError", transaction: Object.assign({}, tx), error });
                        throw error;
                    }
                }
                throw error;
            }
        }
        async #checkNetwork(promise) {
            const { value } = await resolveProperties({
                network: this.getNetwork(),
                value: promise
            });
            return value;
        }
        async call(_tx) {
            const { tx, blockTag } = await resolveProperties({
                tx: this._getTransactionRequest(_tx),
                blockTag: this._getBlockTag(_tx.blockTag)
            });
            return await this.#checkNetwork(this.#call(tx, blockTag, _tx.enableCcipRead ? 0 : -1));
        }
        // Account
        async #getAccountValue(request, _address, _blockTag) {
            let address = this._getAddress(_address);
            let blockTag = this._getBlockTag(_blockTag);
            if (typeof (address) !== "string" || typeof (blockTag) !== "string") {
                [address, blockTag] = await Promise.all([address, blockTag]);
            }
            return await this.#checkNetwork(this.#perform(Object.assign(request, { address, blockTag })));
        }
        async getBalance(address, blockTag) {
            return getBigInt(await this.#getAccountValue({ method: "getBalance" }, address, blockTag), "%response");
        }
        async getTransactionCount(address, blockTag) {
            return getNumber(await this.#getAccountValue({ method: "getTransactionCount" }, address, blockTag), "%response");
        }
        async getCode(address, blockTag) {
            return hexlify(await this.#getAccountValue({ method: "getCode" }, address, blockTag));
        }
        async getStorage(address, _position, blockTag) {
            const position = getBigInt(_position, "position");
            return hexlify(await this.#getAccountValue({ method: "getStorage", position }, address, blockTag));
        }
        // Write
        async broadcastTransaction(signedTx) {
            const { blockNumber, hash, network } = await resolveProperties({
                blockNumber: this.getBlockNumber(),
                hash: this._perform({
                    method: "broadcastTransaction",
                    signedTransaction: signedTx
                }),
                network: this.getNetwork()
            });
            const tx = Transaction.from(signedTx);
            if (tx.hash !== hash) {
                throw new Error("@TODO: the returned hash did not match");
            }
            return this._wrapTransactionResponse(tx, network).replaceableTransaction(blockNumber);
        }
        async #getBlock(block, includeTransactions) {
            // @TODO: Add CustomBlockPlugin check
            if (isHexString(block, 32)) {
                return await this.#perform({
                    method: "getBlock", blockHash: block, includeTransactions
                });
            }
            let blockTag = this._getBlockTag(block);
            if (typeof (blockTag) !== "string") {
                blockTag = await blockTag;
            }
            return await this.#perform({
                method: "getBlock", blockTag, includeTransactions
            });
        }
        // Queries
        async getBlock(block, prefetchTxs) {
            const { network, params } = await resolveProperties({
                network: this.getNetwork(),
                params: this.#getBlock(block, !!prefetchTxs)
            });
            if (params == null) {
                return null;
            }
            return this._wrapBlock(formatBlock(params), network);
        }
        async getTransaction(hash) {
            const { network, params } = await resolveProperties({
                network: this.getNetwork(),
                params: this.#perform({ method: "getTransaction", hash })
            });
            if (params == null) {
                return null;
            }
            return this._wrapTransactionResponse(formatTransactionResponse(params), network);
        }
        async getTransactionReceipt(hash) {
            const { network, params } = await resolveProperties({
                network: this.getNetwork(),
                params: this.#perform({ method: "getTransactionReceipt", hash })
            });
            if (params == null) {
                return null;
            }
            // Some backends did not backfill the effectiveGasPrice into old transactions
            // in the receipt, so we look it up manually and inject it.
            if (params.gasPrice == null && params.effectiveGasPrice == null) {
                const tx = await this.#perform({ method: "getTransaction", hash });
                if (tx == null) {
                    throw new Error("report this; could not find tx or effectiveGasPrice");
                }
                params.effectiveGasPrice = tx.gasPrice;
            }
            return this._wrapTransactionReceipt(formatTransactionReceipt(params), network);
        }
        async getTransactionResult(hash) {
            const { result } = await resolveProperties({
                network: this.getNetwork(),
                result: this.#perform({ method: "getTransactionResult", hash })
            });
            if (result == null) {
                return null;
            }
            return hexlify(result);
        }
        // Bloom-filter Queries
        async getLogs(_filter) {
            let filter = this._getFilter(_filter);
            if (isPromise(filter)) {
                filter = await filter;
            }
            const { network, params } = await resolveProperties({
                network: this.getNetwork(),
                params: this.#perform({ method: "getLogs", filter })
            });
            return params.map((p) => this._wrapLog(formatLog(p), network));
        }
        // ENS
        _getProvider(chainId) {
            assert$1(false, "provider cannot connect to target network", "UNSUPPORTED_OPERATION", {
                operation: "_getProvider()"
            });
        }
        async getResolver(name) {
            return await EnsResolver.fromName(this, name);
        }
        async getAvatar(name) {
            const resolver = await this.getResolver(name);
            if (resolver) {
                return await resolver.getAvatar();
            }
            return null;
        }
        async resolveName(name) {
            const resolver = await this.getResolver(name);
            if (resolver) {
                return await resolver.getAddress();
            }
            return null;
        }
        async lookupAddress(address) {
            address = getAddress(address);
            const node = namehash(address.substring(2).toLowerCase() + ".addr.reverse");
            try {
                const ensAddr = await EnsResolver.getEnsAddress(this);
                const ensContract = new Contract(ensAddr, [
                    "function resolver(bytes32) view returns (address)"
                ], this);
                const resolver = await ensContract.resolver(node);
                if (resolver == null || resolver === ZeroHash) {
                    return null;
                }
                const resolverContract = new Contract(resolver, [
                    "function name(bytes32) view returns (string)"
                ], this);
                const name = await resolverContract.name(node);
                // Failed forward resolution
                const check = await this.resolveName(name);
                if (check !== address) {
                    return null;
                }
                return name;
            }
            catch (error) {
                // No data was returned from the resolver
                if (isError(error, "BAD_DATA") && error.value === "0x") {
                    return null;
                }
                // Something reerted
                if (isError(error, "CALL_EXCEPTION")) {
                    return null;
                }
                throw error;
            }
            return null;
        }
        async waitForTransaction(hash, _confirms, timeout) {
            const confirms = (_confirms != null) ? _confirms : 1;
            if (confirms === 0) {
                return this.getTransactionReceipt(hash);
            }
            return new Promise(async (resolve, reject) => {
                let timer = null;
                const listener = (async (blockNumber) => {
                    try {
                        const receipt = await this.getTransactionReceipt(hash);
                        if (receipt != null) {
                            if (blockNumber - receipt.blockNumber + 1 >= confirms) {
                                resolve(receipt);
                                //this.off("block", listener);
                                if (timer) {
                                    clearTimeout(timer);
                                    timer = null;
                                }
                                return;
                            }
                        }
                    }
                    catch (error) {
                        console.log("EEE", error);
                    }
                    this.once("block", listener);
                });
                if (timeout != null) {
                    timer = setTimeout(() => {
                        if (timer == null) {
                            return;
                        }
                        timer = null;
                        this.off("block", listener);
                        reject(makeError("timeout", "TIMEOUT", { reason: "timeout" }));
                    }, timeout);
                }
                listener(await this.getBlockNumber());
            });
        }
        async waitForBlock(blockTag) {
            assert$1(false, "not implemented yet", "NOT_IMPLEMENTED", {
                operation: "waitForBlock"
            });
        }
        _clearTimeout(timerId) {
            const timer = this.#timers.get(timerId);
            if (!timer) {
                return;
            }
            if (timer.timer) {
                clearTimeout(timer.timer);
            }
            this.#timers.delete(timerId);
        }
        _setTimeout(_func, timeout) {
            if (timeout == null) {
                timeout = 0;
            }
            const timerId = this.#nextTimer++;
            const func = () => {
                this.#timers.delete(timerId);
                _func();
            };
            if (this.paused) {
                this.#timers.set(timerId, { timer: null, func, time: timeout });
            }
            else {
                const timer = setTimeout(func, timeout);
                this.#timers.set(timerId, { timer, func, time: getTime() });
            }
            return timerId;
        }
        _forEachSubscriber(func) {
            for (const sub of this.#subs.values()) {
                func(sub.subscriber);
            }
        }
        // Event API; sub-classes should override this; any supported
        // event filter will have been munged into an EventFilter
        _getSubscriber(sub) {
            switch (sub.type) {
                case "debug":
                case "network":
                    return new UnmanagedSubscriber(sub.type);
                case "block":
                    return new PollingBlockSubscriber(this);
                case "event":
                    return new PollingEventSubscriber(this, sub.filter);
                case "transaction":
                    return new PollingTransactionSubscriber(this, sub.hash);
                case "orphan":
                    return new PollingOrphanSubscriber(this, sub.filter);
            }
            throw new Error(`unsupported event: ${sub.type}`);
        }
        _recoverSubscriber(oldSub, newSub) {
            for (const sub of this.#subs.values()) {
                if (sub.subscriber === oldSub) {
                    if (sub.started) {
                        sub.subscriber.stop();
                    }
                    sub.subscriber = newSub;
                    if (sub.started) {
                        newSub.start();
                    }
                    if (this.#pausedState != null) {
                        newSub.pause(this.#pausedState);
                    }
                    break;
                }
            }
        }
        async #hasSub(event, emitArgs) {
            let sub = await getSubscription(event, this);
            // This is a log that is removing an existing log; we actually want
            // to emit an orphan event for the removed log
            if (sub.type === "event" && emitArgs && emitArgs.length > 0 && emitArgs[0].removed === true) {
                sub = await getSubscription({ orphan: "drop-log", log: emitArgs[0] }, this);
            }
            return this.#subs.get(sub.tag) || null;
        }
        async #getSub(event) {
            const subscription = await getSubscription(event, this);
            // Prevent tampering with our tag in any subclass' _getSubscriber
            const tag = subscription.tag;
            let sub = this.#subs.get(tag);
            if (!sub) {
                const subscriber = this._getSubscriber(subscription);
                const addressableMap = new WeakMap();
                const nameMap = new Map();
                sub = { subscriber, tag, addressableMap, nameMap, started: false, listeners: [] };
                this.#subs.set(tag, sub);
            }
            return sub;
        }
        async on(event, listener) {
            const sub = await this.#getSub(event);
            sub.listeners.push({ listener, once: false });
            if (!sub.started) {
                sub.subscriber.start();
                sub.started = true;
                if (this.#pausedState != null) {
                    sub.subscriber.pause(this.#pausedState);
                }
            }
            return this;
        }
        async once(event, listener) {
            const sub = await this.#getSub(event);
            sub.listeners.push({ listener, once: true });
            if (!sub.started) {
                sub.subscriber.start();
                sub.started = true;
                if (this.#pausedState != null) {
                    sub.subscriber.pause(this.#pausedState);
                }
            }
            return this;
        }
        async emit(event, ...args) {
            const sub = await this.#hasSub(event, args);
            // If there is not subscription or if a recent emit removed
            // the last of them (which also deleted the sub) do nothing
            if (!sub || sub.listeners.length === 0) {
                return false;
            }
            const count = sub.listeners.length;
            sub.listeners = sub.listeners.filter(({ listener, once }) => {
                const payload = new EventPayload(this, (once ? null : listener), event);
                try {
                    listener.call(this, ...args, payload);
                }
                catch (error) { }
                return !once;
            });
            if (sub.listeners.length === 0) {
                if (sub.started) {
                    sub.subscriber.stop();
                }
                this.#subs.delete(sub.tag);
            }
            return (count > 0);
        }
        async listenerCount(event) {
            if (event) {
                const sub = await this.#hasSub(event);
                if (!sub) {
                    return 0;
                }
                return sub.listeners.length;
            }
            let total = 0;
            for (const { listeners } of this.#subs.values()) {
                total += listeners.length;
            }
            return total;
        }
        async listeners(event) {
            if (event) {
                const sub = await this.#hasSub(event);
                if (!sub) {
                    return [];
                }
                return sub.listeners.map(({ listener }) => listener);
            }
            let result = [];
            for (const { listeners } of this.#subs.values()) {
                result = result.concat(listeners.map(({ listener }) => listener));
            }
            return result;
        }
        async off(event, listener) {
            const sub = await this.#hasSub(event);
            if (!sub) {
                return this;
            }
            if (listener) {
                const index = sub.listeners.map(({ listener }) => listener).indexOf(listener);
                if (index >= 0) {
                    sub.listeners.splice(index, 1);
                }
            }
            if (!listener || sub.listeners.length === 0) {
                if (sub.started) {
                    sub.subscriber.stop();
                }
                this.#subs.delete(sub.tag);
            }
            return this;
        }
        async removeAllListeners(event) {
            if (event) {
                const { tag, started, subscriber } = await this.#getSub(event);
                if (started) {
                    subscriber.stop();
                }
                this.#subs.delete(tag);
            }
            else {
                for (const [tag, { started, subscriber }] of this.#subs) {
                    if (started) {
                        subscriber.stop();
                    }
                    this.#subs.delete(tag);
                }
            }
            return this;
        }
        // Alias for "on"
        async addListener(event, listener) {
            return await this.on(event, listener);
        }
        // Alias for "off"
        async removeListener(event, listener) {
            return this.off(event, listener);
        }
        // Sub-classes should override this to shutdown any sockets, etc.
        // but MUST call this super.shutdown.
        destroy() {
            // Stop all listeners
            this.removeAllListeners();
            // Shut down all tiemrs
            for (const timerId of this.#timers.keys()) {
                this._clearTimeout(timerId);
            }
        }
        get paused() { return (this.#pausedState != null); }
        set paused(pause) {
            if (!!pause === this.paused) {
                return;
            }
            if (this.paused) {
                this.resume();
            }
            else {
                this.pause(false);
            }
        }
        pause(dropWhilePaused) {
            this.#lastBlockNumber = -1;
            if (this.#pausedState != null) {
                if (this.#pausedState == !!dropWhilePaused) {
                    return;
                }
                assert$1(false, "cannot change pause type; resume first", "UNSUPPORTED_OPERATION", {
                    operation: "pause"
                });
            }
            this._forEachSubscriber((s) => s.pause(dropWhilePaused));
            this.#pausedState = !!dropWhilePaused;
            for (const timer of this.#timers.values()) {
                // Clear the timer
                if (timer.timer) {
                    clearTimeout(timer.timer);
                }
                // Remaining time needed for when we become unpaused
                timer.time = getTime() - timer.time;
            }
        }
        resume() {
            if (this.#pausedState == null) {
                return;
            }
            this._forEachSubscriber((s) => s.resume());
            this.#pausedState = null;
            for (const timer of this.#timers.values()) {
                // Remaining time when we were paused
                let timeout = timer.time;
                if (timeout < 0) {
                    timeout = 0;
                }
                // Start time (in cause paused, so we con compute remaininf time)
                timer.time = getTime();
                // Start the timer
                setTimeout(timer.func, timeout);
            }
        }
    }
    function _parseString(result, start) {
        try {
            const bytes = _parseBytes(result, start);
            if (bytes) {
                return toUtf8String(bytes);
            }
        }
        catch (error) { }
        return null;
    }
    function _parseBytes(result, start) {
        if (result === "0x") {
            return null;
        }
        try {
            const offset = getNumber(dataSlice(result, start, start + 32));
            const length = getNumber(dataSlice(result, offset, offset + 32));
            return dataSlice(result, offset + 32, offset + 32 + length);
        }
        catch (error) { }
        return null;
    }
    function numPad(value) {
        const result = toBeArray(value);
        if (result.length > 32) {
            throw new Error("internal; should not happen");
        }
        const padded = new Uint8Array(32);
        padded.set(result, 32 - result.length);
        return padded;
    }
    function bytesPad(value) {
        if ((value.length % 32) === 0) {
            return value;
        }
        const result = new Uint8Array(Math.ceil(value.length / 32) * 32);
        result.set(value);
        return result;
    }
    const empty = new Uint8Array([]);
    // ABI Encodes a series of (bytes, bytes, ...)
    function encodeBytes(datas) {
        const result = [];
        let byteCount = 0;
        // Add place-holders for pointers as we add items
        for (let i = 0; i < datas.length; i++) {
            result.push(empty);
            byteCount += 32;
        }
        for (let i = 0; i < datas.length; i++) {
            const data = getBytes(datas[i]);
            // Update the bytes offset
            result[i] = numPad(byteCount);
            // The length and padded value of data
            result.push(numPad(data.length));
            result.push(bytesPad(data));
            byteCount += 32 + Math.ceil(data.length / 32) * 32;
        }
        return concat(result);
    }
    const zeros = "0x0000000000000000000000000000000000000000000000000000000000000000";
    function parseOffchainLookup(data) {
        const result = {
            sender: "", urls: [], calldata: "", selector: "", extraData: "", errorArgs: []
        };
        assert$1(dataLength(data) >= 5 * 32, "insufficient OffchainLookup data", "OFFCHAIN_FAULT", {
            reason: "insufficient OffchainLookup data"
        });
        const sender = dataSlice(data, 0, 32);
        assert$1(dataSlice(sender, 0, 12) === dataSlice(zeros, 0, 12), "corrupt OffchainLookup sender", "OFFCHAIN_FAULT", {
            reason: "corrupt OffchainLookup sender"
        });
        result.sender = dataSlice(sender, 12);
        // Read the URLs from the response
        try {
            const urls = [];
            const urlsOffset = getNumber(dataSlice(data, 32, 64));
            const urlsLength = getNumber(dataSlice(data, urlsOffset, urlsOffset + 32));
            const urlsData = dataSlice(data, urlsOffset + 32);
            for (let u = 0; u < urlsLength; u++) {
                const url = _parseString(urlsData, u * 32);
                if (url == null) {
                    throw new Error("abort");
                }
                urls.push(url);
            }
            result.urls = urls;
        }
        catch (error) {
            assert$1(false, "corrupt OffchainLookup urls", "OFFCHAIN_FAULT", {
                reason: "corrupt OffchainLookup urls"
            });
        }
        // Get the CCIP calldata to forward
        try {
            const calldata = _parseBytes(data, 64);
            if (calldata == null) {
                throw new Error("abort");
            }
            result.calldata = calldata;
        }
        catch (error) {
            assert$1(false, "corrupt OffchainLookup calldata", "OFFCHAIN_FAULT", {
                reason: "corrupt OffchainLookup calldata"
            });
        }
        // Get the callbackSelector (bytes4)
        assert$1(dataSlice(data, 100, 128) === dataSlice(zeros, 0, 28), "corrupt OffchainLookup callbaackSelector", "OFFCHAIN_FAULT", {
            reason: "corrupt OffchainLookup callbaackSelector"
        });
        result.selector = dataSlice(data, 96, 100);
        // Get the extra data to send back to the contract as context
        try {
            const extraData = _parseBytes(data, 128);
            if (extraData == null) {
                throw new Error("abort");
            }
            result.extraData = extraData;
        }
        catch (error) {
            assert$1(false, "corrupt OffchainLookup extraData", "OFFCHAIN_FAULT", {
                reason: "corrupt OffchainLookup extraData"
            });
        }
        result.errorArgs = "sender,urls,calldata,selector,extraData".split(/,/).map((k) => result[k]);
        return result;
    }

    /**
     *  About Abstract Signer and subclassing
     *
     *  @_section: api/providers/abstract-signer: Subclassing Signer [abstract-signer]
     */
    function checkProvider(signer, operation) {
        if (signer.provider) {
            return signer.provider;
        }
        assert$1(false, "missing provider", "UNSUPPORTED_OPERATION", { operation });
    }
    async function populate(signer, tx) {
        let pop = copyRequest(tx);
        if (pop.to != null) {
            pop.to = resolveAddress(pop.to, signer);
        }
        if (pop.from != null) {
            const from = pop.from;
            pop.from = Promise.all([
                signer.getAddress(),
                resolveAddress(from, signer)
            ]).then(([address, from]) => {
                assertArgument(address.toLowerCase() === from.toLowerCase(), "transaction from mismatch", "tx.from", from);
                return address;
            });
        }
        else {
            pop.from = signer.getAddress();
        }
        return await resolveProperties(pop);
    }
    class AbstractSigner {
        provider;
        constructor(provider) {
            defineProperties(this, { provider: (provider || null) });
        }
        async getNonce(blockTag) {
            return checkProvider(this, "getTransactionCount").getTransactionCount(await this.getAddress(), blockTag);
        }
        async populateCall(tx) {
            const pop = await populate(this, tx);
            return pop;
        }
        async populateTransaction(tx) {
            const provider = checkProvider(this, "populateTransaction");
            const pop = await populate(this, tx);
            if (pop.nonce == null) {
                pop.nonce = await this.getNonce("pending");
            }
            if (pop.gasLimit == null) {
                pop.gasLimit = await this.estimateGas(pop);
            }
            // Populate the chain ID
            const network = await (this.provider).getNetwork();
            if (pop.chainId != null) {
                const chainId = getBigInt(pop.chainId);
                assertArgument(chainId === network.chainId, "transaction chainId mismatch", "tx.chainId", tx.chainId);
            }
            else {
                pop.chainId = network.chainId;
            }
            // Do not allow mixing pre-eip-1559 and eip-1559 properties
            const hasEip1559 = (pop.maxFeePerGas != null || pop.maxPriorityFeePerGas != null);
            if (pop.gasPrice != null && (pop.type === 2 || hasEip1559)) {
                assertArgument(false, "eip-1559 transaction do not support gasPrice", "tx", tx);
            }
            else if ((pop.type === 0 || pop.type === 1) && hasEip1559) {
                assertArgument(false, "pre-eip-1559 transaction do not support maxFeePerGas/maxPriorityFeePerGas", "tx", tx);
            }
            if ((pop.type === 2 || pop.type == null) && (pop.maxFeePerGas != null && pop.maxPriorityFeePerGas != null)) {
                // Fully-formed EIP-1559 transaction (skip getFeeData)
                pop.type = 2;
            }
            else if (pop.type === 0 || pop.type === 1) {
                // Explicit Legacy or EIP-2930 transaction
                // We need to get fee data to determine things
                const feeData = await provider.getFeeData();
                assert$1(feeData.gasPrice != null, "network does not support gasPrice", "UNSUPPORTED_OPERATION", {
                    operation: "getGasPrice"
                });
                // Populate missing gasPrice
                if (pop.gasPrice == null) {
                    pop.gasPrice = feeData.gasPrice;
                }
            }
            else {
                // We need to get fee data to determine things
                const feeData = await provider.getFeeData();
                if (pop.type == null) {
                    // We need to auto-detect the intended type of this transaction...
                    if (feeData.maxFeePerGas != null && feeData.maxPriorityFeePerGas != null) {
                        // The network supports EIP-1559!
                        // Upgrade transaction from null to eip-1559
                        pop.type = 2;
                        if (pop.gasPrice != null) {
                            // Using legacy gasPrice property on an eip-1559 network,
                            // so use gasPrice as both fee properties
                            const gasPrice = pop.gasPrice;
                            delete pop.gasPrice;
                            pop.maxFeePerGas = gasPrice;
                            pop.maxPriorityFeePerGas = gasPrice;
                        }
                        else {
                            // Populate missing fee data
                            if (pop.maxFeePerGas == null) {
                                pop.maxFeePerGas = feeData.maxFeePerGas;
                            }
                            if (pop.maxPriorityFeePerGas == null) {
                                pop.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
                            }
                        }
                    }
                    else if (feeData.gasPrice != null) {
                        // Network doesn't support EIP-1559...
                        // ...but they are trying to use EIP-1559 properties
                        assert$1(!hasEip1559, "network does not support EIP-1559", "UNSUPPORTED_OPERATION", {
                            operation: "populateTransaction"
                        });
                        // Populate missing fee data
                        if (pop.gasPrice == null) {
                            pop.gasPrice = feeData.gasPrice;
                        }
                        // Explicitly set untyped transaction to legacy
                        // @TODO: Maybe this shold allow type 1?
                        pop.type = 0;
                    }
                    else {
                        // getFeeData has failed us.
                        assert$1(false, "failed to get consistent fee data", "UNSUPPORTED_OPERATION", {
                            operation: "signer.getFeeData"
                        });
                    }
                }
                else if (pop.type === 2) {
                    // Explicitly using EIP-1559
                    // Populate missing fee data
                    if (pop.maxFeePerGas == null) {
                        pop.maxFeePerGas = feeData.maxFeePerGas;
                    }
                    if (pop.maxPriorityFeePerGas == null) {
                        pop.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
                    }
                }
            }
            //@TOOD: Don't await all over the place; save them up for
            // the end for better batching
            return await resolveProperties(pop);
        }
        async estimateGas(tx) {
            return checkProvider(this, "estimateGas").estimateGas(await this.populateCall(tx));
        }
        async call(tx) {
            return checkProvider(this, "call").call(await this.populateCall(tx));
        }
        async resolveName(name) {
            const provider = checkProvider(this, "resolveName");
            return await provider.resolveName(name);
        }
        async sendTransaction(tx) {
            const provider = checkProvider(this, "sendTransaction");
            const pop = await this.populateTransaction(tx);
            delete pop.from;
            const txObj = Transaction.from(pop);
            return await provider.broadcastTransaction(await this.signTransaction(txObj));
        }
    }

    function copy(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    /**
     *  Some backends support subscribing to events using a Filter ID.
     *
     *  When subscribing with this technique, the node issues a unique
     *  //Filter ID//. At this point the node dedicates resources to
     *  the filter, so that periodic calls to follow up on the //Filter ID//
     *  will receive any events since the last call.
     *
     *  @_docloc: api/providers/abstract-provider
     */
    class FilterIdSubscriber {
        #provider;
        #filterIdPromise;
        #poller;
        #running;
        #network;
        #hault;
        constructor(provider) {
            this.#provider = provider;
            this.#filterIdPromise = null;
            this.#poller = this.#poll.bind(this);
            this.#running = false;
            this.#network = null;
            this.#hault = false;
        }
        _subscribe(provider) {
            throw new Error("subclasses must override this");
        }
        _emitResults(provider, result) {
            throw new Error("subclasses must override this");
        }
        _recover(provider) {
            throw new Error("subclasses must override this");
        }
        async #poll(blockNumber) {
            try {
                // Subscribe if necessary
                if (this.#filterIdPromise == null) {
                    this.#filterIdPromise = this._subscribe(this.#provider);
                }
                // Get the Filter ID
                let filterId = null;
                try {
                    filterId = await this.#filterIdPromise;
                }
                catch (error) {
                    if (!isError(error, "UNSUPPORTED_OPERATION") || error.operation !== "eth_newFilter") {
                        throw error;
                    }
                }
                // The backend does not support Filter ID; downgrade to
                // polling
                if (filterId == null) {
                    this.#filterIdPromise = null;
                    this.#provider._recoverSubscriber(this, this._recover(this.#provider));
                    return;
                }
                const network = await this.#provider.getNetwork();
                if (!this.#network) {
                    this.#network = network;
                }
                if (this.#network.chainId !== network.chainId) {
                    throw new Error("chaid changed");
                }
                if (this.#hault) {
                    return;
                }
                const result = await this.#provider.send("eth_getFilterChanges", [filterId]);
                await this._emitResults(this.#provider, result);
            }
            catch (error) {
                console.log("@TODO", error);
            }
            this.#provider.once("block", this.#poller);
        }
        #teardown() {
            const filterIdPromise = this.#filterIdPromise;
            if (filterIdPromise) {
                this.#filterIdPromise = null;
                filterIdPromise.then((filterId) => {
                    this.#provider.send("eth_uninstallFilter", [filterId]);
                });
            }
        }
        start() {
            if (this.#running) {
                return;
            }
            this.#running = true;
            this.#poll(-2);
        }
        stop() {
            if (!this.#running) {
                return;
            }
            this.#running = false;
            this.#hault = true;
            this.#teardown();
            this.#provider.off("block", this.#poller);
        }
        pause(dropWhilePaused) {
            if (dropWhilePaused) {
                this.#teardown();
            }
            this.#provider.off("block", this.#poller);
        }
        resume() { this.start(); }
    }
    /**
     *  A **FilterIdSubscriber** for receiving contract events.
     *
     *  @_docloc: api/providers/abstract-provider
     */
    class FilterIdEventSubscriber extends FilterIdSubscriber {
        #event;
        constructor(provider, filter) {
            super(provider);
            this.#event = copy(filter);
        }
        _recover(provider) {
            return new PollingEventSubscriber(provider, this.#event);
        }
        async _subscribe(provider) {
            const filterId = await provider.send("eth_newFilter", [this.#event]);
            return filterId;
        }
        async _emitResults(provider, results) {
            for (const result of results) {
                provider.emit(this.#event, provider._wrapLog(result, provider._network));
            }
        }
    }
    /**
     *  A **FilterIdSubscriber** for receiving pending transactions events.
     *
     *  @_docloc: api/providers/abstract-provider
     */
    class FilterIdPendingSubscriber extends FilterIdSubscriber {
        async _subscribe(provider) {
            return await provider.send("eth_newPendingTransactionFilter", []);
        }
        async _emitResults(provider, results) {
            for (const result of results) {
                provider.emit("pending", result);
            }
        }
    }

    /**
     *  About JSON-RPC...
     *
     * @_section: api/providers/jsonrpc:JSON-RPC Provider  [about-jsonrpcProvider]
     */
    const Primitive = "bigint,boolean,function,number,string,symbol".split(/,/g);
    //const Methods = "getAddress,then".split(/,/g);
    function deepCopy(value) {
        if (value == null || Primitive.indexOf(typeof (value)) >= 0) {
            return value;
        }
        // Keep any Addressable
        if (typeof (value.getAddress) === "function") {
            return value;
        }
        if (Array.isArray(value)) {
            return (value.map(deepCopy));
        }
        if (typeof (value) === "object") {
            return Object.keys(value).reduce((accum, key) => {
                accum[key] = value[key];
                return accum;
            }, {});
        }
        throw new Error(`should not happen: ${value} (${typeof (value)})`);
    }
    function stall(duration) {
        return new Promise((resolve) => { setTimeout(resolve, duration); });
    }
    function getLowerCase(value) {
        if (value) {
            return value.toLowerCase();
        }
        return value;
    }
    function isPollable(value) {
        return (value && typeof (value.pollingInterval) === "number");
    }
    const defaultOptions = {
        polling: false,
        staticNetwork: null,
        batchStallTime: 10,
        batchMaxSize: (1 << 20),
        batchMaxCount: 100 // 100 requests
    };
    // @TODO: Unchecked Signers
    class JsonRpcSigner extends AbstractSigner {
        address;
        constructor(provider, address) {
            super(provider);
            address = getAddress(address);
            defineProperties(this, { address });
        }
        connect(provider) {
            assert$1(false, "cannot reconnect JsonRpcSigner", "UNSUPPORTED_OPERATION", {
                operation: "signer.connect"
            });
        }
        async getAddress() {
            return this.address;
        }
        // JSON-RPC will automatially fill in nonce, etc. so we just check from
        async populateTransaction(tx) {
            return await this.populateCall(tx);
        }
        // Returns just the hash of the transaction after sent, which is what
        // the bare JSON-RPC API does;
        async sendUncheckedTransaction(_tx) {
            const tx = deepCopy(_tx);
            const promises = [];
            // Make sure the from matches the sender
            if (tx.from) {
                const _from = tx.from;
                promises.push((async () => {
                    const from = await resolveAddress(_from, this.provider);
                    assertArgument(from != null && from.toLowerCase() === this.address.toLowerCase(), "from address mismatch", "transaction", _tx);
                    tx.from = from;
                })());
            }
            else {
                tx.from = this.address;
            }
            // The JSON-RPC for eth_sendTransaction uses 90000 gas; if the user
            // wishes to use this, it is easy to specify explicitly, otherwise
            // we look it up for them.
            if (tx.gasLimit == null) {
                promises.push((async () => {
                    tx.gasLimit = await this.provider.estimateGas({ ...tx, from: this.address });
                })());
            }
            // The address may be an ENS name or Addressable
            if (tx.to != null) {
                const _to = tx.to;
                promises.push((async () => {
                    tx.to = await resolveAddress(_to, this.provider);
                })());
            }
            // Wait until all of our properties are filled in
            if (promises.length) {
                await Promise.all(promises);
            }
            const hexTx = this.provider.getRpcTransaction(tx);
            return this.provider.send("eth_sendTransaction", [hexTx]);
        }
        async sendTransaction(tx) {
            // This cannot be mined any earlier than any recent block
            const blockNumber = await this.provider.getBlockNumber();
            // Send the transaction
            const hash = await this.sendUncheckedTransaction(tx);
            // Unfortunately, JSON-RPC only provides and opaque transaction hash
            // for a response, and we need the actual transaction, so we poll
            // for it; it should show up very quickly
            return await (new Promise((resolve, reject) => {
                const timeouts = [1000, 100];
                const checkTx = async () => {
                    // Try getting the transaction
                    const tx = await this.provider.getTransaction(hash);
                    if (tx != null) {
                        resolve(tx.replaceableTransaction(blockNumber));
                        return;
                    }
                    // Wait another 4 seconds
                    this.provider._setTimeout(() => { checkTx(); }, timeouts.pop() || 4000);
                };
                checkTx();
            }));
        }
        async signTransaction(_tx) {
            const tx = deepCopy(_tx);
            // Make sure the from matches the sender
            if (tx.from) {
                const from = await resolveAddress(tx.from, this.provider);
                assertArgument(from != null && from.toLowerCase() === this.address.toLowerCase(), "from address mismatch", "transaction", _tx);
                tx.from = from;
            }
            else {
                tx.from = this.address;
            }
            const hexTx = this.provider.getRpcTransaction(tx);
            return await this.provider.send("eth_signTransaction", [hexTx]);
        }
        async signMessage(_message) {
            const message = ((typeof (_message) === "string") ? toUtf8Bytes(_message) : _message);
            return await this.provider.send("personal_sign", [
                hexlify(message), this.address.toLowerCase()
            ]);
        }
        async signTypedData(domain, types, _value) {
            const value = deepCopy(_value);
            // Populate any ENS names (in-place)
            const populated = await TypedDataEncoder.resolveNames(domain, types, value, async (value) => {
                const address = await resolveAddress(value);
                assertArgument(address != null, "TypedData does not support null address", "value", value);
                return address;
            });
            return await this.provider.send("eth_signTypedData_v4", [
                this.address.toLowerCase(),
                JSON.stringify(TypedDataEncoder.getPayload(populated.domain, types, populated.value))
            ]);
        }
        async unlock(password) {
            return this.provider.send("personal_unlockAccount", [
                this.address.toLowerCase(), password, null
            ]);
        }
        // https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_sign
        async _legacySignMessage(_message) {
            const message = ((typeof (_message) === "string") ? toUtf8Bytes(_message) : _message);
            return await this.provider.send("eth_sign", [
                this.address.toLowerCase(), hexlify(message)
            ]);
        }
    }
    /**
     *  The JsonRpcApiProvider is an abstract class and **MUST** be
     *  sub-classed.
     *
     *  It provides the base for all JSON-RPC-based Provider interaction.
     *
     *  Sub-classing Notes:
     *  - a sub-class MUST override _send
     *  - a sub-class MUST call the `_start()` method once connected
     */
    class JsonRpcApiProvider extends AbstractProvider {
        #options;
        // The next ID to use for the JSON-RPC ID field
        #nextId;
        // Payloads are queued and triggered in batches using the drainTimer
        #payloads;
        #drainTimer;
        #notReady;
        #network;
        #scheduleDrain() {
            if (this.#drainTimer) {
                return;
            }
            // If we aren't using batching, no hard in sending it immeidately
            const stallTime = (this._getOption("batchMaxCount") === 1) ? 0 : this._getOption("batchStallTime");
            this.#drainTimer = setTimeout(() => {
                this.#drainTimer = null;
                const payloads = this.#payloads;
                this.#payloads = [];
                while (payloads.length) {
                    // Create payload batches that satisfy our batch constraints
                    const batch = [(payloads.shift())];
                    while (payloads.length) {
                        if (batch.length === this.#options.batchMaxCount) {
                            break;
                        }
                        batch.push((payloads.shift()));
                        const bytes = JSON.stringify(batch.map((p) => p.payload));
                        if (bytes.length > this.#options.batchMaxSize) {
                            payloads.unshift((batch.pop()));
                            break;
                        }
                    }
                    // Process the result to each payload
                    (async () => {
                        const payload = ((batch.length === 1) ? batch[0].payload : batch.map((p) => p.payload));
                        this.emit("debug", { action: "sendRpcPayload", payload });
                        try {
                            const result = await this._send(payload);
                            this.emit("debug", { action: "receiveRpcResult", result });
                            // Process results in batch order
                            for (const { resolve, reject, payload } of batch) {
                                // Find the matching result
                                const resp = result.filter((r) => (r.id === payload.id))[0];
                                // No result; the node failed us in unexpected ways
                                if (resp == null) {
                                    return reject(new Error("@TODO: no result"));
                                }
                                // The response is an error
                                if ("error" in resp) {
                                    return reject(this.getRpcError(payload, resp));
                                }
                                // All good; send the result
                                resolve(resp.result);
                            }
                        }
                        catch (error) {
                            this.emit("debug", { action: "receiveRpcError", error });
                            for (const { reject } of batch) {
                                // @TODO: augment the error with the payload
                                reject(error);
                            }
                        }
                    })();
                }
            }, stallTime);
        }
        constructor(network, options) {
            super(network);
            this.#nextId = 1;
            this.#options = Object.assign({}, defaultOptions, options || {});
            this.#payloads = [];
            this.#drainTimer = null;
            this.#network = null;
            {
                let resolve = null;
                const promise = new Promise((_resolve) => {
                    resolve = _resolve;
                });
                this.#notReady = { promise, resolve };
            }
            // This could be relaxed in the future to just check equivalent networks
            const staticNetwork = this._getOption("staticNetwork");
            if (staticNetwork) {
                assertArgument(staticNetwork === network, "staticNetwork MUST match network object", "options", options);
                this.#network = staticNetwork;
            }
        }
        /**
         *  Returns the value associated with the option %%key%%.
         *
         *  Sub-classes can use this to inquire about configuration options.
         */
        _getOption(key) {
            return this.#options[key];
        }
        /**
         *  Gets the [[Network]] this provider has committed to. On each call, the network
         *  is detected, and if it has changed, the call will reject.
         */
        get _network() {
            assert$1(this.#network, "network is not available yet", "NETWORK_ERROR");
            return this.#network;
        }
        /*
         {
            assert(false, "sub-classes must override _send", "UNSUPPORTED_OPERATION", {
                operation: "jsonRpcApiProvider._send"
            });
        }
        */
        /**
         *  Resolves to the non-normalized value by performing %%req%%.
         *
         *  Sub-classes may override this to modify behavior of actions,
         *  and should generally call ``super._perform`` as a fallback.
         */
        async _perform(req) {
            // Legacy networks do not like the type field being passed along (which
            // is fair), so we delete type if it is 0 and a non-EIP-1559 network
            if (req.method === "call" || req.method === "estimateGas") {
                let tx = req.transaction;
                if (tx && tx.type != null && getBigInt(tx.type)) {
                    // If there are no EIP-1559 properties, it might be non-EIP-a559
                    if (tx.maxFeePerGas == null && tx.maxPriorityFeePerGas == null) {
                        const feeData = await this.getFeeData();
                        if (feeData.maxFeePerGas == null && feeData.maxPriorityFeePerGas == null) {
                            // Network doesn't know about EIP-1559 (and hence type)
                            req = Object.assign({}, req, {
                                transaction: Object.assign({}, tx, { type: undefined })
                            });
                        }
                    }
                }
            }
            const request = this.getRpcRequest(req);
            if (request != null) {
                return await this.send(request.method, request.args);
            }
            return super._perform(req);
        }
        /**
         *  Sub-classes may override this; it detects the *actual* network that
         *  we are **currently** connected to.
         *
         *  Keep in mind that [[send]] may only be used once [[ready]], otherwise the
         *  _send primitive must be used instead.
         */
        async _detectNetwork() {
            const network = this._getOption("staticNetwork");
            if (network) {
                return network;
            }
            // If we are ready, use ``send``, which enabled requests to be batched
            if (this.ready) {
                return Network.from(getBigInt(await this.send("eth_chainId", [])));
            }
            // We are not ready yet; use the primitive _send
            const payload = {
                id: this.#nextId++, method: "eth_chainId", params: [], jsonrpc: "2.0"
            };
            this.emit("debug", { action: "sendRpcPayload", payload });
            let result;
            try {
                result = (await this._send(payload))[0];
            }
            catch (error) {
                this.emit("debug", { action: "receiveRpcError", error });
                throw error;
            }
            this.emit("debug", { action: "receiveRpcResult", result });
            if ("result" in result) {
                return Network.from(getBigInt(result.result));
            }
            throw this.getRpcError(payload, result);
        }
        /**
         *  Sub-classes **MUST** call this. Until [[_start]] has been called, no calls
         *  will be passed to [[_send]] from [[send]]. If it is overridden, then
         *  ``super._start()`` **MUST** be called.
         *
         *  Calling it multiple times is safe and has no effect.
         */
        _start() {
            if (this.#notReady == null || this.#notReady.resolve == null) {
                return;
            }
            this.#notReady.resolve();
            this.#notReady = null;
            (async () => {
                // Bootstrap the network
                while (this.#network == null) {
                    try {
                        this.#network = await this._detectNetwork();
                    }
                    catch (error) {
                        console.log("JsonRpcProvider failed to startup; retry in 1s");
                        await stall(1000);
                    }
                }
                // Start dispatching requests
                this.#scheduleDrain();
            })();
        }
        /**
         *  Resolves once the [[_start]] has been called. This can be used in
         *  sub-classes to defer sending data until the connection has been
         *  established.
         */
        async _waitUntilReady() {
            if (this.#notReady == null) {
                return;
            }
            return await this.#notReady.promise;
        }
        /**
         *  Return a Subscriber that will manage the %%sub%%.
         *
         *  Sub-classes may override this to modify the behavior of
         *  subscription management.
         */
        _getSubscriber(sub) {
            // Pending Filters aren't availble via polling
            if (sub.type === "pending") {
                return new FilterIdPendingSubscriber(this);
            }
            if (sub.type === "event") {
                if (this._getOption("polling")) {
                    return new PollingEventSubscriber(this, sub.filter);
                }
                return new FilterIdEventSubscriber(this, sub.filter);
            }
            // Orphaned Logs are handled automatically, by the filter, since
            // logs with removed are emitted by it
            if (sub.type === "orphan" && sub.filter.orphan === "drop-log") {
                return new UnmanagedSubscriber("orphan");
            }
            return super._getSubscriber(sub);
        }
        /**
         *  Returns true only if the [[_start]] has been called.
         */
        get ready() { return this.#notReady == null; }
        /**
         *  Returns %%tx%% as a normalized JSON-RPC transaction request,
         *  which has all values hexlified and any numeric values converted
         *  to Quantity values.
         */
        getRpcTransaction(tx) {
            const result = {};
            // JSON-RPC now requires numeric values to be "quantity" values
            ["chainId", "gasLimit", "gasPrice", "type", "maxFeePerGas", "maxPriorityFeePerGas", "nonce", "value"].forEach((key) => {
                if (tx[key] == null) {
                    return;
                }
                let dstKey = key;
                if (key === "gasLimit") {
                    dstKey = "gas";
                }
                result[dstKey] = toQuantity(getBigInt(tx[key], `tx.${key}`));
            });
            // Make sure addresses and data are lowercase
            ["from", "to", "data"].forEach((key) => {
                if (tx[key] == null) {
                    return;
                }
                result[key] = hexlify(tx[key]);
            });
            // Normalize the access list object
            if (tx.accessList) {
                result["accessList"] = accessListify(tx.accessList);
            }
            return result;
        }
        /**
         *  Returns the request method and arguments required to perform
         *  %%req%%.
         */
        getRpcRequest(req) {
            switch (req.method) {
                case "chainId":
                    return { method: "eth_chainId", args: [] };
                case "getBlockNumber":
                    return { method: "eth_blockNumber", args: [] };
                case "getGasPrice":
                    return { method: "eth_gasPrice", args: [] };
                case "getBalance":
                    return {
                        method: "eth_getBalance",
                        args: [getLowerCase(req.address), req.blockTag]
                    };
                case "getTransactionCount":
                    return {
                        method: "eth_getTransactionCount",
                        args: [getLowerCase(req.address), req.blockTag]
                    };
                case "getCode":
                    return {
                        method: "eth_getCode",
                        args: [getLowerCase(req.address), req.blockTag]
                    };
                case "getStorage":
                    return {
                        method: "eth_getStorageAt",
                        args: [
                            getLowerCase(req.address),
                            ("0x" + req.position.toString(16)),
                            req.blockTag
                        ]
                    };
                case "broadcastTransaction":
                    return {
                        method: "eth_sendRawTransaction",
                        args: [req.signedTransaction]
                    };
                case "getBlock":
                    if ("blockTag" in req) {
                        return {
                            method: "eth_getBlockByNumber",
                            args: [req.blockTag, !!req.includeTransactions]
                        };
                    }
                    else if ("blockHash" in req) {
                        return {
                            method: "eth_getBlockByHash",
                            args: [req.blockHash, !!req.includeTransactions]
                        };
                    }
                    break;
                case "getTransaction":
                    return {
                        method: "eth_getTransactionByHash",
                        args: [req.hash]
                    };
                case "getTransactionReceipt":
                    return {
                        method: "eth_getTransactionReceipt",
                        args: [req.hash]
                    };
                case "call":
                    return {
                        method: "eth_call",
                        args: [this.getRpcTransaction(req.transaction), req.blockTag]
                    };
                case "estimateGas": {
                    return {
                        method: "eth_estimateGas",
                        args: [this.getRpcTransaction(req.transaction)]
                    };
                }
                case "getLogs":
                    if (req.filter && req.filter.address != null) {
                        if (Array.isArray(req.filter.address)) {
                            req.filter.address = req.filter.address.map(getLowerCase);
                        }
                        else {
                            req.filter.address = getLowerCase(req.filter.address);
                        }
                    }
                    return { method: "eth_getLogs", args: [req.filter] };
            }
            return null;
        }
        /**
         *  Returns an ethers-style Error for the given JSON-RPC error
         *  %%payload%%, coalescing the various strings and error shapes
         *  that different nodes return, coercing them into a machine-readable
         *  standardized error.
         */
        getRpcError(payload, _error) {
            const { method } = payload;
            const { error } = _error;
            if (method === "eth_estimateGas" && error.message) {
                const msg = error.message;
                if (!msg.match(/revert/i) && msg.match(/insufficient funds/i)) {
                    return makeError("insufficient funds", "INSUFFICIENT_FUNDS", {
                        transaction: (payload.params[0]),
                    });
                }
            }
            if (method === "eth_call" || method === "eth_estimateGas") {
                const result = spelunkData(error);
                const e = AbiCoder.getBuiltinCallException((method === "eth_call") ? "call" : "estimateGas", (payload.params[0]), (result ? result.data : null));
                e.info = { error, payload };
                return e;
            }
            // Only estimateGas and call can return arbitrary contract-defined text, so now we
            // we can process text safely.
            const message = JSON.stringify(spelunkMessage(error));
            if (typeof (error.message) === "string" && error.message.match(/user denied|ethers-user-denied/i)) {
                const actionMap = {
                    eth_sign: "signMessage",
                    personal_sign: "signMessage",
                    eth_signTypedData_v4: "signTypedData",
                    eth_signTransaction: "signTransaction",
                    eth_sendTransaction: "sendTransaction",
                    eth_requestAccounts: "requestAccess",
                    wallet_requestAccounts: "requestAccess",
                };
                return makeError(`user rejected action`, "ACTION_REJECTED", {
                    action: (actionMap[method] || "unknown"),
                    reason: "rejected",
                    info: { payload, error }
                });
            }
            if (method === "eth_sendRawTransaction" || method === "eth_sendTransaction") {
                const transaction = (payload.params[0]);
                if (message.match(/insufficient funds|base fee exceeds gas limit/i)) {
                    return makeError("insufficient funds for intrinsic transaction cost", "INSUFFICIENT_FUNDS", {
                        transaction, info: { error }
                    });
                }
                if (message.match(/nonce/i) && message.match(/too low/i)) {
                    return makeError("nonce has already been used", "NONCE_EXPIRED", { transaction });
                }
                // "replacement transaction underpriced"
                if (message.match(/replacement transaction/i) && message.match(/underpriced/i)) {
                    return makeError("replacement fee too low", "REPLACEMENT_UNDERPRICED", { transaction });
                }
                if (message.match(/only replay-protected/i)) {
                    return makeError("legacy pre-eip-155 transactions not supported", "UNSUPPORTED_OPERATION", {
                        operation: method, info: { transaction }
                    });
                }
            }
            if (message.match(/the method .* does not exist/i)) {
                return makeError("unsupported operation", "UNSUPPORTED_OPERATION", {
                    operation: payload.method, info: { error }
                });
            }
            return makeError("could not coalesce error", "UNKNOWN_ERROR", { error });
        }
        /**
         *  Requests the %%method%% with %%params%% via the JSON-RPC protocol
         *  over the underlying channel. This can be used to call methods
         *  on the backend that do not have a high-level API within the Provider
         *  API.
         *
         *  This method queues requests according to the batch constraints
         *  in the options, assigns the request a unique ID.
         *
         *  **Do NOT override** this method in sub-classes; instead
         *  override [[_send]] or force the options values in the
         *  call to the constructor to modify this method's behavior.
         */
        send(method, params) {
            // @TODO: cache chainId?? purge on switch_networks
            const id = this.#nextId++;
            const promise = new Promise((resolve, reject) => {
                this.#payloads.push({
                    resolve, reject,
                    payload: { method, params, id, jsonrpc: "2.0" }
                });
            });
            // If there is not a pending drainTimer, set one
            this.#scheduleDrain();
            return promise;
        }
        /**
         *  Resolves to the [[Signer]] account for  %%address%% managed by
         *  the client.
         *
         *  If the %%address%% is a number, it is used as an index in the
         *  the accounts from [[listAccounts]].
         *
         *  This can only be used on clients which manage accounts (such as
         *  Geth with imported account or MetaMask).
         *
         *  Throws if the account doesn't exist.
         */
        async getSigner(address) {
            if (address == null) {
                address = 0;
            }
            const accountsPromise = this.send("eth_accounts", []);
            // Account index
            if (typeof (address) === "number") {
                const accounts = (await accountsPromise);
                if (address >= accounts.length) {
                    throw new Error("no such account");
                }
                return new JsonRpcSigner(this, accounts[address]);
            }
            const { accounts } = await resolveProperties({
                network: this.getNetwork(),
                accounts: accountsPromise
            });
            // Account address
            address = getAddress(address);
            for (const account of accounts) {
                if (getAddress(account) === address) {
                    return new JsonRpcSigner(this, address);
                }
            }
            throw new Error("invalid account");
        }
    }
    class JsonRpcApiPollingProvider extends JsonRpcApiProvider {
        #pollingInterval;
        constructor(network, options) {
            super(network, options);
            this.#pollingInterval = 4000;
        }
        _getSubscriber(sub) {
            const subscriber = super._getSubscriber(sub);
            if (isPollable(subscriber)) {
                subscriber.pollingInterval = this.#pollingInterval;
            }
            return subscriber;
        }
        /**
         *  The polling interval (default: 4000 ms)
         */
        get pollingInterval() { return this.#pollingInterval; }
        set pollingInterval(value) {
            if (!Number.isInteger(value) || value < 0) {
                throw new Error("invalid interval");
            }
            this.#pollingInterval = value;
            this._forEachSubscriber((sub) => {
                if (isPollable(sub)) {
                    sub.pollingInterval = this.#pollingInterval;
                }
            });
        }
    }
    function spelunkData(value) {
        if (value == null) {
            return null;
        }
        // These *are* the droids we're looking for.
        if (typeof (value.message) === "string" && value.message.match("reverted") && isHexString(value.data)) {
            return { message: value.message, data: value.data };
        }
        // Spelunk further...
        if (typeof (value) === "object") {
            for (const key in value) {
                const result = spelunkData(value[key]);
                if (result) {
                    return result;
                }
            }
            return null;
        }
        // Might be a JSON string we can further descend...
        if (typeof (value) === "string") {
            try {
                return spelunkData(JSON.parse(value));
            }
            catch (error) { }
        }
        return null;
    }
    function _spelunkMessage(value, result) {
        if (value == null) {
            return;
        }
        // These *are* the droids we're looking for.
        if (typeof (value.message) === "string") {
            result.push(value.message);
        }
        // Spelunk further...
        if (typeof (value) === "object") {
            for (const key in value) {
                _spelunkMessage(value[key], result);
            }
        }
        // Might be a JSON string we can further descend...
        if (typeof (value) === "string") {
            try {
                return _spelunkMessage(JSON.parse(value), result);
            }
            catch (error) { }
        }
    }
    function spelunkMessage(value) {
        const result = [];
        _spelunkMessage(value, result);
        return result;
    }

    class BrowserProvider extends JsonRpcApiPollingProvider {
        #request;
        constructor(ethereum, network) {
            super(network, { batchMaxCount: 1 });
            this.#request = async (method, params) => {
                const payload = { method, params };
                this.emit("debug", { action: "sendEip1193Request", payload });
                try {
                    const result = await ethereum.request(payload);
                    this.emit("debug", { action: "receiveEip1193Result", result });
                    return result;
                }
                catch (e) {
                    const error = new Error(e.message);
                    error.code = e.code;
                    error.data = e.data;
                    error.payload = payload;
                    this.emit("debug", { action: "receiveEip1193Error", error });
                    throw error;
                }
            };
        }
        async send(method, params) {
            await this._start();
            return await super.send(method, params);
        }
        async _send(payload) {
            assertArgument(!Array.isArray(payload), "EIP-1193 does not support batch request", "payload", payload);
            try {
                const result = await this.#request(payload.method, payload.params || []);
                return [{ id: payload.id, result }];
            }
            catch (e) {
                return [{
                        id: payload.id,
                        error: { code: e.code, data: e.data, message: e.message }
                    }];
            }
        }
        getRpcError(payload, error) {
            error = JSON.parse(JSON.stringify(error));
            // EIP-1193 gives us some machine-readable error codes, so rewrite
            // them into 
            switch (error.error.code || -1) {
                case 4001:
                    error.error.message = `ethers-user-denied: ${error.error.message}`;
                    break;
                case 4200:
                    error.error.message = `ethers-unsupported: ${error.error.message}`;
                    break;
            }
            return super.getRpcError(payload, error);
        }
        async hasSigner(address) {
            if (address == null) {
                address = 0;
            }
            const accounts = await this.send("eth_accounts", []);
            if (typeof (address) === "number") {
                return (accounts.length > address);
            }
            address = address.toLowerCase();
            return accounts.filter((a) => (a.toLowerCase() === address)).length !== 0;
        }
        async getSigner(address) {
            if (address == null) {
                address = 0;
            }
            if (!(await this.hasSigner(address))) {
                try {
                    //const resp = 
                    await this.#request("eth_requestAccounts", []);
                    //console.log("RESP", resp);
                }
                catch (error) {
                    const payload = error.payload;
                    throw this.getRpcError(payload, { id: payload.id, error });
                }
            }
            return await super.getSigner(address);
        }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/components/Overlay.svelte generated by Svelte v3.55.1 */
    const file$h = "src/components/Overlay.svelte";

    function create_fragment$j(ctx) {
    	let div1;
    	let div0;
    	let div0_transition;
    	let style_width = `${/*width*/ ctx[0]}px`;
    	let style_right = `${/*offsetRight*/ ctx[3]}px`;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div0, "id", "overlay");
    			attr_dev(div0, "class", "svelte-1uq7n6l");
    			set_style(div0, "width", style_width);
    			set_style(div0, "right", style_right);
    			add_location(div0, file$h, 16, 2, 472);
    			attr_dev(div1, "id", "overlay-bg");
    			attr_dev(div1, "class", "svelte-1uq7n6l");
    			set_style(div1, "z-index", /*zIndex*/ ctx[1]);
    			add_location(div1, file$h, 15, 0, 408);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", stop_propagation(/*click_handler*/ ctx[6]), false, false, true),
    					listen_dev(
    						div1,
    						"click",
    						function () {
    							if (is_function(/*close*/ ctx[2])) /*close*/ ctx[2].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}

    			if (dirty & /*width*/ 1 && style_width !== (style_width = `${/*width*/ ctx[0]}px`)) {
    				set_style(div0, "width", style_width);
    			}

    			if (dirty & /*offsetRight*/ 8 && style_right !== (style_right = `${/*offsetRight*/ ctx[3]}px`)) {
    				set_style(div0, "right", style_right);
    			}

    			if (dirty & /*zIndex*/ 2) {
    				set_style(div1, "z-index", /*zIndex*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);

    			add_render_callback(() => {
    				if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fly, { duration: 200, y: 100 }, true);
    				div0_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			if (!div0_transition) div0_transition = create_bidirectional_transition(div0, fly, { duration: 200, y: 100 }, false);
    			div0_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching && div0_transition) div0_transition.end();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Overlay', slots, ['default']);
    	let { width = 720 } = $$props;
    	let { zIndex = 100 } = $$props;
    	let { close } = $$props;
    	let offsetRight = 0;

    	onMount(() => {
    		if (document.body.clientWidth < window.innerWidth) {
    			$$invalidate(3, offsetRight = (window.innerWidth - document.body.clientWidth) / 2);
    		}
    	});

    	$$self.$$.on_mount.push(function () {
    		if (close === undefined && !('close' in $$props || $$self.$$.bound[$$self.$$.props['close']])) {
    			console.warn("<Overlay> was created without expected prop 'close'");
    		}
    	});

    	const writable_props = ['width', 'zIndex', 'close'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Overlay> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    		if ('zIndex' in $$props) $$invalidate(1, zIndex = $$props.zIndex);
    		if ('close' in $$props) $$invalidate(2, close = $$props.close);
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fly,
    		onMount,
    		width,
    		zIndex,
    		close,
    		offsetRight
    	});

    	$$self.$inject_state = $$props => {
    		if ('width' in $$props) $$invalidate(0, width = $$props.width);
    		if ('zIndex' in $$props) $$invalidate(1, zIndex = $$props.zIndex);
    		if ('close' in $$props) $$invalidate(2, close = $$props.close);
    		if ('offsetRight' in $$props) $$invalidate(3, offsetRight = $$props.offsetRight);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [width, zIndex, close, offsetRight, $$scope, slots, click_handler];
    }

    class Overlay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { width: 0, zIndex: 1, close: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Overlay",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get width() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get zIndex() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set zIndex(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get close() {
    		throw new Error("<Overlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set close(value) {
    		throw new Error("<Overlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Time.svelte generated by Svelte v3.55.1 */

    const time = readable(Date.now(), set => {
    	setInterval(
    		() => {
    			set(Date.now());
    		},
    		500
    	);
    });

    /* src/components/Notifications.svelte generated by Svelte v3.55.1 */
    const file$g = "src/components/Notifications.svelte";

    // (30:0) {#if $notification && ($notification.persist || ($time - $notification.timestamp < notificationDuration))}
    function create_if_block_7(ctx) {
    	let previous_key = /*$notification*/ ctx[0];
    	let key_block_anchor;
    	let current;
    	let key_block = create_key_block_1(ctx);

    	const block = {
    		c: function create() {
    			key_block.c();
    			key_block_anchor = empty$1();
    		},
    		m: function mount(target, anchor) {
    			key_block.m(target, anchor);
    			insert_dev(target, key_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$notification*/ 1 && safe_not_equal(previous_key, previous_key = /*$notification*/ ctx[0])) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block_1(ctx);
    				key_block.c();
    				transition_in(key_block, 1);
    				key_block.m(key_block_anchor.parentNode, key_block_anchor);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(key_block_anchor);
    			key_block.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_7.name,
    		type: "if",
    		source: "(30:0) {#if $notification && ($notification.persist || ($time - $notification.timestamp < notificationDuration))}",
    		ctx
    	});

    	return block;
    }

    // (32:2) {#key $notification}
    function create_key_block_1(ctx) {
    	let div;
    	let raw_value = /*$notification*/ ctx[0].message + "";
    	let div_class_value;
    	let div_intro;
    	let div_outro;
    	let current;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "id", "notification");
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*$notification*/ ctx[0].type) + " svelte-hj12lk"));
    			add_location(div, file$g, 32, 4, 1117);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			div.innerHTML = raw_value;
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*$notification*/ 1) && raw_value !== (raw_value = /*$notification*/ ctx[0].message + "")) div.innerHTML = raw_value;
    			if (!current || dirty & /*$notification*/ 1 && div_class_value !== (div_class_value = "" + (null_to_empty(/*$notification*/ ctx[0].type) + " svelte-hj12lk"))) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (div_outro) div_outro.end(1);
    				div_intro = create_in_transition(div, fly, { y: 250 });
    				div_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			if (div_intro) div_intro.invalidate();
    			div_outro = create_out_transition(div, fade, { duration: 1000 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (detaching && div_outro) div_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block_1.name,
    		type: "key",
    		source: "(32:2) {#key $notification}",
    		ctx
    	});

    	return block;
    }

    // (46:0) {#if $selectedNotification}
    function create_if_block$4(ctx) {
    	let previous_key = /*$selectedNotification*/ ctx[1];
    	let key_block_anchor;
    	let current;
    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			key_block.c();
    			key_block_anchor = empty$1();
    		},
    		m: function mount(target, anchor) {
    			key_block.m(target, anchor);
    			insert_dev(target, key_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$selectedNotification*/ 2 && safe_not_equal(previous_key, previous_key = /*$selectedNotification*/ ctx[1])) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block, 1);
    				key_block.m(key_block_anchor.parentNode, key_block_anchor);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(key_block_anchor);
    			key_block.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(46:0) {#if $selectedNotification}",
    		ctx
    	});

    	return block;
    }

    // (59:61) 
    function create_if_block_6(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Success");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(59:61) ",
    		ctx
    	});

    	return block;
    }

    // (57:62) 
    function create_if_block_5(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Notification");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(57:62) ",
    		ctx
    	});

    	return block;
    }

    // (55:61) 
    function create_if_block_4(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Warning");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(55:61) ",
    		ctx
    	});

    	return block;
    }

    // (53:10) {#if $selectedNotification.type === 'error'}
    function create_if_block_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Error");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(53:10) {#if $selectedNotification.type === 'error'}",
    		ctx
    	});

    	return block;
    }

    // (50:8) {#if $selectedNotification.title}
    function create_if_block_2(ctx) {
    	let t_value = /*$selectedNotification*/ ctx[1].title + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$selectedNotification*/ 2 && t_value !== (t_value = /*$selectedNotification*/ ctx[1].title + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(50:8) {#if $selectedNotification.title}",
    		ctx
    	});

    	return block;
    }

    // (65:6) {#if !$selectedNotification.hideDismissButton}
    function create_if_block_1$1(ctx) {
    	let div;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			button.textContent = "dismiss";
    			attr_dev(button, "class", "pulse");
    			add_location(button, file$g, 66, 10, 2190);
    			add_location(div, file$g, 65, 8, 2174);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(65:6) {#if !$selectedNotification.hideDismissButton}",
    		ctx
    	});

    	return block;
    }

    // (48:4) <Overlay close={() => $selectedNotification = null} width={400}>
    function create_default_slot$1(ctx) {
    	let h3;
    	let h3_class_value;
    	let t0;
    	let p;
    	let raw_value = /*$selectedNotification*/ ctx[1].message + "";
    	let t1;
    	let if_block1_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*$selectedNotification*/ ctx[1].title) return create_if_block_2;
    		if (/*$selectedNotification*/ ctx[1].type === 'error') return create_if_block_3;
    		if (/*$selectedNotification*/ ctx[1].type === 'warning') return create_if_block_4;
    		if (/*$selectedNotification*/ ctx[1].type === 'standard') return create_if_block_5;
    		if (/*$selectedNotification*/ ctx[1].type === 'success') return create_if_block_6;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type && current_block_type(ctx);
    	let if_block1 = !/*$selectedNotification*/ ctx[1].hideDismissButton && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			p = element("p");
    			t1 = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty$1();
    			attr_dev(h3, "class", h3_class_value = "" + (null_to_empty(/*$selectedNotification*/ ctx[1].type) + " svelte-hj12lk"));
    			add_location(h3, file$g, 48, 6, 1536);
    			attr_dev(p, "class", "full-message svelte-hj12lk");
    			add_location(p, file$g, 63, 6, 2047);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			if (if_block0) if_block0.m(h3, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p, anchor);
    			p.innerHTML = raw_value;
    			insert_dev(target, t1, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if (if_block0) if_block0.d(1);
    				if_block0 = current_block_type && current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(h3, null);
    				}
    			}

    			if (dirty & /*$selectedNotification*/ 2 && h3_class_value !== (h3_class_value = "" + (null_to_empty(/*$selectedNotification*/ ctx[1].type) + " svelte-hj12lk"))) {
    				attr_dev(h3, "class", h3_class_value);
    			}

    			if (dirty & /*$selectedNotification*/ 2 && raw_value !== (raw_value = /*$selectedNotification*/ ctx[1].message + "")) p.innerHTML = raw_value;
    			if (!/*$selectedNotification*/ ctx[1].hideDismissButton) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);

    			if (if_block0) {
    				if_block0.d();
    			}

    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t1);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(48:4) <Overlay close={() => $selectedNotification = null} width={400}>",
    		ctx
    	});

    	return block;
    }

    // (47:2) {#key $selectedNotification}
    function create_key_block(ctx) {
    	let overlay;
    	let current;

    	overlay = new Overlay({
    			props: {
    				close: /*func*/ ctx[5],
    				width: 400,
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(overlay.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(overlay, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const overlay_changes = {};
    			if (dirty & /*$selectedNotification*/ 2) overlay_changes.close = /*func*/ ctx[5];

    			if (dirty & /*$$scope, $selectedNotification, $notification*/ 131) {
    				overlay_changes.$$scope = { dirty, ctx };
    			}

    			overlay.$set(overlay_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(overlay.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(overlay.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(overlay, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(47:2) {#key $selectedNotification}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$i(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*$notification*/ ctx[0] && (/*$notification*/ ctx[0].persist || /*$time*/ ctx[2] - /*$notification*/ ctx[0].timestamp < notificationDuration) && create_if_block_7(ctx);
    	let if_block1 = /*$selectedNotification*/ ctx[1] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty$1();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$notification*/ ctx[0] && (/*$notification*/ ctx[0].persist || /*$time*/ ctx[2] - /*$notification*/ ctx[0].timestamp < notificationDuration)) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*$notification, $time*/ 5) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_7(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*$selectedNotification*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*$selectedNotification*/ 2) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const notification = writable(null);
    const selectedNotification = writable(null);

    function pushNotification(_notification) {
    	_notification.timestamp = Date.now();
    	notification.set(_notification);

    	return () => {
    		if (get_store_value(notification) == _notification) notification.set(null);
    		if (get_store_value(selectedNotification) == _notification) selectedNotification.set(null);
    	};
    }

    const notificationDuration = 9000;

    function instance$i($$self, $$props, $$invalidate) {
    	let $selectedNotification,
    		$$unsubscribe_selectedNotification = noop;

    	let $notification,
    		$$unsubscribe_notification = noop;

    	let $time;
    	validate_store(selectedNotification, 'selectedNotification');
    	component_subscribe($$self, selectedNotification, $$value => $$invalidate(1, $selectedNotification = $$value));
    	validate_store(notification, 'notification');
    	component_subscribe($$self, notification, $$value => $$invalidate(0, $notification = $$value));
    	validate_store(time, 'time');
    	component_subscribe($$self, time, $$value => $$invalidate(2, $time = $$value));
    	$$self.$$.on_destroy.push(() => $$unsubscribe_selectedNotification());
    	$$self.$$.on_destroy.push(() => $$unsubscribe_notification());
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Notifications', slots, []);

    	function select(notification) {
    		set_store_value(selectedNotification, $selectedNotification = notification, $selectedNotification);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Notifications> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => set_store_value(selectedNotification, $selectedNotification = $notification, $selectedNotification);

    	const click_handler_1 = () => {
    		if ($selectedNotification == $notification) {
    			set_store_value(notification, $notification = null, $notification);
    		}
    		set_store_value(selectedNotification, $selectedNotification = null, $selectedNotification);
    	};

    	const func = () => set_store_value(selectedNotification, $selectedNotification = null, $selectedNotification);

    	$$self.$capture_state = () => ({
    		get: get_store_value,
    		writable,
    		notification,
    		selectedNotification,
    		pushNotification,
    		Overlay,
    		time,
    		fly,
    		fade,
    		notificationDuration,
    		select,
    		$selectedNotification,
    		$notification,
    		$time
    	});

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$notification*/ 1) {
    			if ($notification && $notification.popup) select($notification);
    		}
    	};

    	return [
    		$notification,
    		$selectedNotification,
    		$time,
    		click_handler,
    		click_handler_1,
    		func
    	];
    }

    class Notifications extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notifications",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    const signer = writable(null);
    // Injected Wallet:
    const connectInjected = async () => {
        if (!("ethereum" in window)) {
            throw new Error("missing ethereum interface on window");
        }
        const browserProvider = new BrowserProvider(ethereum, "any");
        await browserProvider.send("eth_requestAccounts", []);
        const newSigner = await browserProvider.getSigner();
        signer.set(newSigner);
        pushNotification({ message: `Connected: ${await newSigner.getAddress()}`, type: "success" });
    };

    /* src/components/Header.svelte generated by Svelte v3.55.1 */

    const { console: console_1$3 } = globals;
    const file$f = "src/components/Header.svelte";

    // (27:4) {:else}
    function create_else_block$1(ctx) {
    	let await_block_anchor;
    	let promise;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 2
    	};

    	handle_promise(promise = /*$signer*/ ctx[0].getAddress(), info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty$1();
    			info.block.c();
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*$signer*/ 1 && promise !== (promise = /*$signer*/ ctx[0].getAddress()) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(27:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (25:4) {#if !$signer}
    function create_if_block$3(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Connect";
    			attr_dev(button, "class", "svelte-6h9lk6");
    			add_location(button, file$f, 25, 6, 451);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*connect*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(25:4) {#if !$signer}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script type="ts">import { connectInjected, signer }
    function create_catch_block(ctx) {
    	const block = { c: noop, m: noop, p: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script type=\\\"ts\\\">import { connectInjected, signer }",
    		ctx
    	});

    	return block;
    }

    // (30:6) {:then address}
    function create_then_block(ctx) {
    	let button;
    	let t0_value = /*address*/ ctx[2].slice(0, 6) + "";
    	let t0;
    	let t1;
    	let t2_value = /*address*/ ctx[2].slice(-4) + "";
    	let t2;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text(t0_value);
    			t1 = text("...");
    			t2 = text(t2_value);
    			attr_dev(button, "class", "svelte-6h9lk6");
    			add_location(button, file$f, 30, 8, 613);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, t1);
    			append_dev(button, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$signer*/ 1 && t0_value !== (t0_value = /*address*/ ctx[2].slice(0, 6) + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$signer*/ 1 && t2_value !== (t2_value = /*address*/ ctx[2].slice(-4) + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(30:6) {:then address}",
    		ctx
    	});

    	return block;
    }

    // (28:35)          <button>Connecting...</button>       {:then address}
    function create_pending_block(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Connecting...";
    			attr_dev(button, "class", "svelte-6h9lk6");
    			add_location(button, file$f, 28, 8, 551);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(28:35)          <button>Connecting...</button>       {:then address}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let header;
    	let h1;
    	let i;
    	let t0;
    	let t1;
    	let div;
    	let select;
    	let option;
    	let t3;

    	function select_block_type(ctx, dirty) {
    		if (!/*$signer*/ ctx[0]) return create_if_block$3;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			h1 = element("h1");
    			i = element("i");
    			t0 = text("\n    chainrep");
    			t1 = space();
    			div = element("div");
    			select = element("select");
    			option = element("option");
    			option.textContent = "Optimism Goerli";
    			t3 = space();
    			if_block.c();
    			attr_dev(i, "class", "icofont-link");
    			add_location(i, file$f, 12, 4, 232);
    			attr_dev(h1, "class", "svelte-6h9lk6");
    			add_location(h1, file$f, 11, 2, 223);
    			option.__value = "eth";
    			option.value = option.__value;
    			add_location(option, file$f, 20, 6, 346);
    			attr_dev(select, "class", "svelte-6h9lk6");
    			add_location(select, file$f, 19, 4, 331);
    			attr_dev(div, "id", "connection");
    			attr_dev(div, "class", "svelte-6h9lk6");
    			add_location(div, file$f, 16, 2, 285);
    			attr_dev(header, "class", "svelte-6h9lk6");
    			add_location(header, file$f, 8, 0, 194);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, h1);
    			append_dev(h1, i);
    			append_dev(h1, t0);
    			append_dev(header, t1);
    			append_dev(header, div);
    			append_dev(div, select);
    			append_dev(select, option);
    			append_dev(div, t3);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let $signer;
    	validate_store(signer, 'signer');
    	component_subscribe($$self, signer, $$value => $$invalidate(0, $signer = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Header', slots, []);

    	const connect = () => {
    		connectInjected().catch(err => {
    			console.error(err);
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$3.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		connectInjected,
    		signer,
    		connect,
    		$signer
    	});

    	return [$signer, connect];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$h.name
    		});
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.55.1 */

    const file$e = "src/components/Footer.svelte";

    function create_fragment$g(ctx) {
    	let footer;
    	let div0;
    	let t1;
    	let div1;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t2;
    	let a1;
    	let img1;
    	let img1_src_value;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			div0 = element("div");
    			div0.textContent = "ChainRep is an open-source protocol to democratize web3 security.";
    			t1 = space();
    			div1 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t2 = space();
    			a1 = element("a");
    			img1 = element("img");
    			add_location(div0, file$e, 4, 2, 54);
    			if (!src_url_equal(img0.src, img0_src_value = "img/github.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "github");
    			attr_dev(img0, "class", "svelte-14sb4kk");
    			add_location(img0, file$e, 9, 6, 240);
    			attr_dev(a0, "href", "https://github.com/chainrep");
    			attr_dev(a0, "target", "_blank");
    			attr_dev(a0, "rel", "noreferrer");
    			attr_dev(a0, "class", "svelte-14sb4kk");
    			add_location(a0, file$e, 8, 4, 162);
    			if (!src_url_equal(img1.src, img1_src_value = "img/discord.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "discord");
    			attr_dev(img1, "class", "svelte-14sb4kk");
    			add_location(img1, file$e, 12, 6, 371);
    			attr_dev(a1, "href", "https://discord.gg/Wyv2pVTt");
    			attr_dev(a1, "target", "_blank");
    			attr_dev(a1, "rel", "noreferrer");
    			attr_dev(a1, "class", "svelte-14sb4kk");
    			add_location(a1, file$e, 11, 4, 293);
    			attr_dev(div1, "id", "links");
    			attr_dev(div1, "class", "svelte-14sb4kk");
    			add_location(div1, file$e, 7, 2, 141);
    			attr_dev(footer, "class", "svelte-14sb4kk");
    			add_location(footer, file$e, 3, 0, 43);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, div0);
    			append_dev(footer, t1);
    			append_dev(footer, div1);
    			append_dev(div1, a0);
    			append_dev(a0, img0);
    			append_dev(div1, t2);
    			append_dev(div1, a1);
    			append_dev(a1, img1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Footer', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    function parse(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.55.1 */

    const { Error: Error_1, Object: Object_1, console: console_1$2 } = globals;

    // (267:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty$1();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(267:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (260:0) {#if componentParams}
    function create_if_block$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty$1();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) mount_component(switch_instance, target, anchor);
    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = construct_svelte_component_dev(switch_value, switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(260:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty$1();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn('Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading');

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf('#/');

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: '/';

    	// Check if there's a querystring
    	const qsPosition = location.indexOf('?');

    	let querystring = '';

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener('hashchange', update, false);

    	return function stop() {
    		window.removeEventListener('hashchange', update, false);
    	};
    });

    const location$1 = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == '#' ? '' : '#') + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != '/' && location.indexOf('#/') !== 0) {
    		throw Error('Invalid parameter location');
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == '#' ? '' : '#') + location;

    	try {
    		const newState = { ...history.state };
    		delete newState['__svelte_spa_router_scrollX'];
    		delete newState['__svelte_spa_router_scrollY'];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn('Caught exception while replacing the current page. If you\'re running this in the Svelte REPL, please note that the `replace` method might not work in this environment.');
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event('hashchange'));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != 'a') {
    		throw Error('Action "link" can only be used with <a> tags');
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    function restoreScroll(state) {
    	// If this exists, then this is a back navigation: restore the scroll position
    	if (state) {
    		window.scrollTo(state.__svelte_spa_router_scrollX, state.__svelte_spa_router_scrollY);
    	} else {
    		// Otherwise this is a forward navigation: scroll to top
    		window.scrollTo(0, 0);
    	}
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute('href');

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == '/') {
    		// Add # to the href attribute
    		href = '#' + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != '#/') {
    		throw Error('Invalid value for "href" attribute: ' + href);
    	}

    	node.setAttribute('href', href);

    	node.addEventListener('click', event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute('href'));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == 'string') {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Router', slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = '' } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != 'function' && (typeof component != 'object' || component._sveltesparouter !== true)) {
    				throw Error('Invalid component object');
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == 'string' && (path.length < 1 || path.charAt(0) != '/' && path.charAt(0) != '*') || typeof path == 'object' && !(path instanceof RegExp)) {
    				throw Error('Invalid value for "path" argument - strings must start with / or *');
    			}

    			const { pattern, keys } = parse(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == 'object' && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == 'string') {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || '/';
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || '/';
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || '') || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && (event.state.__svelte_spa_router_scrollY || event.state.__svelte_spa_router_scrollX)) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener('popstate', popStateChanged);

    		afterUpdate(() => {
    			restoreScroll(previousScrollState);
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == 'object' && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick('conditionsFailed', detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoading', Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == 'object' && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick('routeLoaded', Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener('popstate', popStateChanged);
    	});

    	const writable_props = ['routes', 'prefix', 'restoreScrollState'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location: location$1,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		restoreScroll,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ('routes' in $$props) $$invalidate(3, routes = $$props.routes);
    		if ('prefix' in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ('restoreScrollState' in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ('component' in $$props) $$invalidate(0, component = $$props.component);
    		if ('componentParams' in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ('props' in $$props) $$invalidate(2, props = $$props.props);
    		if ('previousScrollState' in $$props) previousScrollState = $$props.previousScrollState;
    		if ('popStateChanged' in $$props) popStateChanged = $$props.popStateChanged;
    		if ('lastLoc' in $$props) lastLoc = $$props.lastLoc;
    		if ('componentObj' in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? 'manual' : 'auto';
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/NavLink.svelte generated by Svelte v3.55.1 */
    const file$d = "src/components/NavLink.svelte";

    function create_fragment$e(ctx) {
    	let div;
    	let a;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			attr_dev(a, "href", /*page*/ ctx[0]);
    			attr_dev(a, "class", "gradient-1-2 svelte-j2n6bu");
    			add_location(a, file$d, 7, 2, 222);
    			attr_dev(div, "class", "nav-link svelte-j2n6bu");
    			toggle_class(div, "selected", /*page*/ ctx[0] === /*loc*/ ctx[2]);
    			add_location(div, file$d, 6, 0, 167);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			a.innerHTML = /*name*/ ctx[1];

    			if (!mounted) {
    				dispose = action_destroyer(link.call(null, a));
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 2) a.innerHTML = /*name*/ ctx[1];
    			if (dirty & /*page*/ 1) {
    				attr_dev(a, "href", /*page*/ ctx[0]);
    			}

    			if (dirty & /*page, loc*/ 5) {
    				toggle_class(div, "selected", /*page*/ ctx[0] === /*loc*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let loc;
    	let $location;
    	validate_store(location$1, 'location');
    	component_subscribe($$self, location$1, $$value => $$invalidate(3, $location = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NavLink', slots, []);
    	let { page } = $$props;
    	let { name } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (page === undefined && !('page' in $$props || $$self.$$.bound[$$self.$$.props['page']])) {
    			console.warn("<NavLink> was created without expected prop 'page'");
    		}

    		if (name === undefined && !('name' in $$props || $$self.$$.bound[$$self.$$.props['name']])) {
    			console.warn("<NavLink> was created without expected prop 'name'");
    		}
    	});

    	const writable_props = ['page', 'name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NavLink> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		link,
    		location: location$1,
    		page,
    		name,
    		loc,
    		$location
    	});

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('loc' in $$props) $$invalidate(2, loc = $$props.loc);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$location*/ 8) {
    			$$invalidate(2, loc = $location === "/" ? "/about" : location$1);
    		}
    	};

    	return [page, name, loc, $location];
    }

    class NavLink extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { page: 0, name: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NavLink",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get page() {
    		throw new Error("<NavLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set page(value) {
    		throw new Error("<NavLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<NavLink>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<NavLink>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Nav.svelte generated by Svelte v3.55.1 */
    const file$c = "src/components/Nav.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (11:2) {#each links as link}
    function create_each_block$2(ctx) {
    	let navlink;
    	let current;
    	const navlink_spread_levels = [/*link*/ ctx[1]];
    	let navlink_props = {};

    	for (let i = 0; i < navlink_spread_levels.length; i += 1) {
    		navlink_props = assign(navlink_props, navlink_spread_levels[i]);
    	}

    	navlink = new NavLink({ props: navlink_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(navlink.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(navlink, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const navlink_changes = (dirty & /*links*/ 1)
    			? get_spread_update(navlink_spread_levels, [get_spread_object(/*link*/ ctx[1])])
    			: {};

    			navlink.$set(navlink_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navlink.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navlink.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navlink, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(11:2) {#each links as link}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let nav;
    	let current;
    	let each_value = /*links*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			nav = element("nav");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(nav, "class", "svelte-bu9ig8");
    			add_location(nav, file$c, 9, 0, 398);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(nav, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*links*/ 1) {
    				each_value = /*links*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(nav, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Nav', slots, []);

    	const links = [
    		{
    			page: "/search",
    			name: "<i class='icofont-search-2'></i> Search"
    		},
    		{
    			page: "/report",
    			name: "<i class='icofont-search-document'></i> Report"
    		},
    		{
    			page: "/certificate",
    			name: "<i class='icofont-badge'></i> Certificate"
    		},
    		{
    			page: "/about",
    			name: "<i class='icofont-info-circle'></i> About"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ NavLink, links });
    	return [links];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/components/Sidebar.svelte generated by Svelte v3.55.1 */
    const file$b = "src/components/Sidebar.svelte";

    function create_fragment$c(ctx) {
    	let div;
    	let nav;
    	let t;
    	let footer;
    	let current;
    	nav = new Nav({ $$inline: true });
    	footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(nav.$$.fragment);
    			t = space();
    			create_component(footer.$$.fragment);
    			attr_dev(div, "id", "container");
    			attr_dev(div, "class", "svelte-ful9mc");
    			add_location(div, file$b, 4, 0, 99);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(nav, div, null);
    			append_dev(div, t);
    			mount_component(footer, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(nav.$$.fragment, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(nav.$$.fragment, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(nav);
    			destroy_component(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sidebar', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Sidebar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Footer, Nav });
    	return [];
    }

    class Sidebar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sidebar",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/routes/About.svelte generated by Svelte v3.55.1 */

    const file$a = "src/routes/About.svelte";

    function create_fragment$b(ctx) {
    	let h1;
    	let t1;
    	let h30;
    	let strong0;
    	let t3;
    	let t4;
    	let p;
    	let t5;
    	let strong1;
    	let t7;
    	let t8;
    	let h31;
    	let t9;
    	let span;
    	let t11;
    	let t12;
    	let h2;
    	let t14;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "About";
    			t1 = space();
    			h30 = element("h3");
    			strong0 = element("strong");
    			strong0.textContent = "chainrep";
    			t3 = text(" is an open-source protocol to democratize web3 security with open, onchain data.");
    			t4 = space();
    			p = element("p");
    			t5 = text("Our goal is to improve web3 security for users by creating the most comprehensive dataset of scams and vulnerabilities. Since ");
    			strong1 = element("strong");
    			strong1.textContent = "chainrep";
    			t7 = text(" is an permissionless protocol, everyone can leverage and contribute to a shared source of information.");
    			t8 = space();
    			h31 = element("h3");
    			t9 = text("Let's make web3 ");
    			span = element("span");
    			span.textContent = "safu";
    			t11 = text(" together.");
    			t12 = space();
    			h2 = element("h2");
    			h2.textContent = "How it Works";
    			t14 = space();
    			img = element("img");
    			add_location(h1, file$a, 0, 0, 0);
    			add_location(strong0, file$a, 2, 2, 49);
    			set_style(h30, "font-weight", `normal`);
    			add_location(h30, file$a, 1, 0, 15);
    			add_location(strong1, file$a, 6, 128, 295);
    			add_location(p, file$a, 5, 0, 163);
    			attr_dev(span, "class", "svelte-19l6kgo");
    			add_location(span, file$a, 10, 18, 466);
    			attr_dev(h31, "class", "safu svelte-19l6kgo");
    			add_location(h31, file$a, 9, 0, 430);
    			add_location(h2, file$a, 13, 0, 501);
    			attr_dev(img, "class", "diagram svelte-19l6kgo");
    			if (!src_url_equal(img.src, img_src_value = "img/diagram.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "chainrep protocol diagram");
    			add_location(img, file$a, 14, 0, 523);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, h30, anchor);
    			append_dev(h30, strong0);
    			append_dev(h30, t3);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, p, anchor);
    			append_dev(p, t5);
    			append_dev(p, strong1);
    			append_dev(p, t7);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, h31, anchor);
    			append_dev(h31, t9);
    			append_dev(h31, span);
    			append_dev(h31, t11);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, h2, anchor);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(h30);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(h31);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('About', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/components/Report.svelte generated by Svelte v3.55.1 */

    const file$9 = "src/components/Report.svelte";

    function create_fragment$a(ctx) {
    	let div2;
    	let h3;
    	let span0;
    	let t0;
    	let t1;
    	let t2;
    	let span1;
    	let t3_value = /*reviewer*/ ctx[1].slice(0, 6) + "";
    	let t3;
    	let t4;
    	let t5_value = /*reviewer*/ ctx[1].slice(-4) + "";
    	let t5;
    	let t6;
    	let div0;
    	let strong;
    	let t8;
    	let a;
    	let t9;
    	let t10;
    	let div1;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h3 = element("h3");
    			span0 = element("span");
    			t0 = text("#");
    			t1 = text(/*reportId*/ ctx[0]);
    			t2 = space();
    			span1 = element("span");
    			t3 = text(t3_value);
    			t4 = text("...");
    			t5 = text(t5_value);
    			t6 = space();
    			div0 = element("div");
    			strong = element("strong");
    			strong.textContent = "Full Report:";
    			t8 = space();
    			a = element("a");
    			t9 = text(/*uri*/ ctx[2]);
    			t10 = space();
    			div1 = element("div");
    			attr_dev(span0, "class", "id svelte-devkln");
    			add_location(span0, file$9, 8, 4, 186);
    			attr_dev(span1, "class", "reviewer");
    			add_location(span1, file$9, 9, 4, 226);
    			attr_dev(h3, "class", "svelte-devkln");
    			add_location(h3, file$9, 7, 2, 177);
    			add_location(strong, file$9, 12, 4, 342);
    			attr_dev(a, "href", /*uri*/ ctx[2]);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "rel", "noreferrer");
    			add_location(a, file$9, 13, 4, 376);
    			attr_dev(div0, "class", "full-report svelte-devkln");
    			add_location(div0, file$9, 11, 2, 312);
    			add_location(div1, file$9, 15, 2, 444);
    			attr_dev(div2, "id", "report");
    			attr_dev(div2, "class", "svelte-devkln");
    			add_location(div2, file$9, 6, 0, 157);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h3);
    			append_dev(h3, span0);
    			append_dev(span0, t0);
    			append_dev(span0, t1);
    			append_dev(h3, t2);
    			append_dev(h3, span1);
    			append_dev(span1, t3);
    			append_dev(span1, t4);
    			append_dev(span1, t5);
    			append_dev(div2, t6);
    			append_dev(div2, div0);
    			append_dev(div0, strong);
    			append_dev(div0, t8);
    			append_dev(div0, a);
    			append_dev(a, t9);
    			append_dev(div2, t10);
    			append_dev(div2, div1);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*reportId*/ 1) set_data_dev(t1, /*reportId*/ ctx[0]);
    			if (dirty & /*reviewer*/ 2 && t3_value !== (t3_value = /*reviewer*/ ctx[1].slice(0, 6) + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*reviewer*/ 2 && t5_value !== (t5_value = /*reviewer*/ ctx[1].slice(-4) + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*uri*/ 4) set_data_dev(t9, /*uri*/ ctx[2]);

    			if (dirty & /*uri*/ 4) {
    				attr_dev(a, "href", /*uri*/ ctx[2]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Report', slots, []);
    	let { reportId } = $$props;
    	let { reviewer } = $$props;
    	let { uri } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (reportId === undefined && !('reportId' in $$props || $$self.$$.bound[$$self.$$.props['reportId']])) {
    			console.warn("<Report> was created without expected prop 'reportId'");
    		}

    		if (reviewer === undefined && !('reviewer' in $$props || $$self.$$.bound[$$self.$$.props['reviewer']])) {
    			console.warn("<Report> was created without expected prop 'reviewer'");
    		}

    		if (uri === undefined && !('uri' in $$props || $$self.$$.bound[$$self.$$.props['uri']])) {
    			console.warn("<Report> was created without expected prop 'uri'");
    		}
    	});

    	const writable_props = ['reportId', 'reviewer', 'uri'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Report> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('reportId' in $$props) $$invalidate(0, reportId = $$props.reportId);
    		if ('reviewer' in $$props) $$invalidate(1, reviewer = $$props.reviewer);
    		if ('uri' in $$props) $$invalidate(2, uri = $$props.uri);
    	};

    	$$self.$capture_state = () => ({ reportId, reviewer, uri });

    	$$self.$inject_state = $$props => {
    		if ('reportId' in $$props) $$invalidate(0, reportId = $$props.reportId);
    		if ('reviewer' in $$props) $$invalidate(1, reviewer = $$props.reviewer);
    		if ('uri' in $$props) $$invalidate(2, uri = $$props.uri);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [reportId, reviewer, uri];
    }

    class Report$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { reportId: 0, reviewer: 1, uri: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Report",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get reportId() {
    		throw new Error("<Report>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reportId(value) {
    		throw new Error("<Report>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get reviewer() {
    		throw new Error("<Report>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set reviewer(value) {
    		throw new Error("<Report>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get uri() {
    		throw new Error("<Report>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set uri(value) {
    		throw new Error("<Report>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Search.svelte generated by Svelte v3.55.1 */

    const { console: console_1$1 } = globals;
    const file$8 = "src/routes/Search.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (29:2) {#each reports as report}
    function create_each_block$1(ctx) {
    	let report;
    	let current;
    	const report_spread_levels = [/*report*/ ctx[4]];
    	let report_props = {};

    	for (let i = 0; i < report_spread_levels.length; i += 1) {
    		report_props = assign(report_props, report_spread_levels[i]);
    	}

    	report = new Report$1({ props: report_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(report.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(report, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const report_changes = (dirty & /*reports*/ 4)
    			? get_spread_update(report_spread_levels, [get_spread_object(/*report*/ ctx[4])])
    			: {};

    			report.$set(report_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(report.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(report.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(report, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(29:2) {#each reports as report}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let h1;
    	let t1;
    	let div0;
    	let input;
    	let t2;
    	let button;
    	let t4;
    	let i;
    	let t5;
    	let div1;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*reports*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Search Reports";
    			t1 = space();
    			div0 = element("div");
    			input = element("input");
    			t2 = space();
    			button = element("button");
    			button.textContent = "Search";
    			t4 = space();
    			i = element("i");
    			t5 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(h1, file$8, 19, 0, 410);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-53e6kj");
    			add_location(input, file$8, 21, 2, 461);
    			attr_dev(button, "class", "svelte-53e6kj");
    			add_location(button, file$8, 22, 2, 506);
    			attr_dev(i, "class", "icofont-search-2 svelte-53e6kj");
    			add_location(i, file$8, 23, 2, 550);
    			attr_dev(div0, "class", "search-bar svelte-53e6kj");
    			add_location(div0, file$8, 20, 0, 434);
    			attr_dev(div1, "id", "reports");
    			attr_dev(div1, "class", "svelte-53e6kj");
    			add_location(div1, file$8, 27, 0, 606);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, input);
    			set_input_value(input, /*searchStr*/ ctx[0]);
    			append_dev(div0, t2);
    			append_dev(div0, button);
    			append_dev(div0, t4);
    			append_dev(div0, i);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[3]),
    					listen_dev(button, "click", /*search*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*searchStr*/ 1 && input.value !== /*searchStr*/ ctx[0]) {
    				set_input_value(input, /*searchStr*/ ctx[0]);
    			}

    			if (dirty & /*reports*/ 4) {
    				each_value = /*reports*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Search', slots, []);
    	let searchStr;

    	const search = async () => {
    	};

    	const reports = [
    		{
    			reportId: 0,
    			reviewer: "0xa184aa8488908b43cCf43b5Ef13Ae528693Dfd00",
    			uri: "ipfs://bafkreieb5xpcpwatmqmm2eb6y2f72fx2yokapmrq75axqt3jdoc542dpd4"
    		}
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Search> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		searchStr = this.value;
    		$$invalidate(0, searchStr);
    	}

    	$$self.$capture_state = () => ({ Report: Report$1, searchStr, search, reports });

    	$$self.$inject_state = $$props => {
    		if ('searchStr' in $$props) $$invalidate(0, searchStr = $$props.searchStr);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [searchStr, search, reports, input_input_handler];
    }

    class Search extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/components/TextInput.svelte generated by Svelte v3.55.1 */

    const file$7 = "src/components/TextInput.svelte";

    function create_fragment$8(ctx) {
    	let label_1;
    	let span;
    	let t0;
    	let t1;
    	let t2;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			span = element("span");
    			t0 = text(/*label*/ ctx[2]);
    			t1 = text(":");
    			t2 = space();
    			input = element("input");
    			attr_dev(span, "class", "svelte-qt5wi0");
    			add_location(span, file$7, 7, 2, 209);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", /*inputName*/ ctx[1]);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[3]);
    			attr_dev(input, "class", "svelte-qt5wi0");
    			add_location(input, file$7, 8, 2, 233);
    			attr_dev(label_1, "for", /*inputName*/ ctx[1]);
    			attr_dev(label_1, "class", "svelte-qt5wi0");
    			add_location(label_1, file$7, 6, 0, 181);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, span);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(label_1, t2);
    			append_dev(label_1, input);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[4]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*label*/ 4) set_data_dev(t0, /*label*/ ctx[2]);

    			if (dirty & /*inputName*/ 2) {
    				attr_dev(input, "name", /*inputName*/ ctx[1]);
    			}

    			if (dirty & /*placeholder*/ 8) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[3]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (dirty & /*inputName*/ 2) {
    				attr_dev(label_1, "for", /*inputName*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TextInput', slots, []);
    	let { inputName = `input-${Date.now()}-${Math.floor(Math.random() * 0xffff)}` } = $$props;
    	let { label } = $$props;
    	let { value } = $$props;
    	let { placeholder = label } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (label === undefined && !('label' in $$props || $$self.$$.bound[$$self.$$.props['label']])) {
    			console.warn("<TextInput> was created without expected prop 'label'");
    		}

    		if (value === undefined && !('value' in $$props || $$self.$$.bound[$$self.$$.props['value']])) {
    			console.warn("<TextInput> was created without expected prop 'value'");
    		}
    	});

    	const writable_props = ['inputName', 'label', 'value', 'placeholder'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TextInput> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ('inputName' in $$props) $$invalidate(1, inputName = $$props.inputName);
    		if ('label' in $$props) $$invalidate(2, label = $$props.label);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('placeholder' in $$props) $$invalidate(3, placeholder = $$props.placeholder);
    	};

    	$$self.$capture_state = () => ({ inputName, label, value, placeholder });

    	$$self.$inject_state = $$props => {
    		if ('inputName' in $$props) $$invalidate(1, inputName = $$props.inputName);
    		if ('label' in $$props) $$invalidate(2, label = $$props.label);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('placeholder' in $$props) $$invalidate(3, placeholder = $$props.placeholder);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, inputName, label, placeholder, input_input_handler];
    }

    class TextInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			inputName: 1,
    			label: 2,
    			value: 0,
    			placeholder: 3
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TextInput",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get inputName() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set inputName(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<TextInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<TextInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Report.svelte generated by Svelte v3.55.1 */
    const file$6 = "src/routes/Report.svelte";

    function create_fragment$7(ctx) {
    	let h1;
    	let t1;
    	let p;
    	let t3;
    	let ol;
    	let li0;
    	let t5;
    	let li1;
    	let t7;
    	let li2;
    	let t9;
    	let textinput0;
    	let updating_value;
    	let t10;
    	let textinput1;
    	let updating_value_1;
    	let t11;
    	let textinput2;
    	let updating_value_2;
    	let t12;
    	let textinput3;
    	let updating_value_3;
    	let t13;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	function textinput0_value_binding(value) {
    		/*textinput0_value_binding*/ ctx[5](value);
    	}

    	let textinput0_props = {
    		label: "Link to Full Report",
    		placeholder: "Report URI (https://, ipfs://, etc..)"
    	};

    	if (/*uri*/ ctx[3] !== void 0) {
    		textinput0_props.value = /*uri*/ ctx[3];
    	}

    	textinput0 = new TextInput({ props: textinput0_props, $$inline: true });
    	binding_callbacks.push(() => bind(textinput0, 'value', textinput0_value_binding));

    	function textinput1_value_binding(value) {
    		/*textinput1_value_binding*/ ctx[6](value);
    	}

    	let textinput1_props = {
    		label: "Effected Contracts",
    		placeholder: "ContractAddresses (comma-separated)"
    	};

    	if (/*contractAddressesStr*/ ctx[0] !== void 0) {
    		textinput1_props.value = /*contractAddressesStr*/ ctx[0];
    	}

    	textinput1 = new TextInput({ props: textinput1_props, $$inline: true });
    	binding_callbacks.push(() => bind(textinput1, 'value', textinput1_value_binding));

    	function textinput2_value_binding(value) {
    		/*textinput2_value_binding*/ ctx[7](value);
    	}

    	let textinput2_props = {
    		label: "Effected Domains",
    		placeholder: "Domains (comma-separated)"
    	};

    	if (/*domainsStr*/ ctx[1] !== void 0) {
    		textinput2_props.value = /*domainsStr*/ ctx[1];
    	}

    	textinput2 = new TextInput({ props: textinput2_props, $$inline: true });
    	binding_callbacks.push(() => bind(textinput2, 'value', textinput2_value_binding));

    	function textinput3_value_binding(value) {
    		/*textinput3_value_binding*/ ctx[8](value);
    	}

    	let textinput3_props = {
    		label: "Relevant Tags",
    		placeholder: "Tags (comma-separated)"
    	};

    	if (/*tagsStr*/ ctx[2] !== void 0) {
    		textinput3_props.value = /*tagsStr*/ ctx[2];
    	}

    	textinput3 = new TextInput({ props: textinput3_props, $$inline: true });
    	binding_callbacks.push(() => bind(textinput3, 'value', textinput3_value_binding));

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "File a Report";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Use this form to report scams, rug-pulls, grifts, vulnerabilities, hacks, and security issues.";
    			t3 = space();
    			ol = element("ol");
    			li0 = element("li");
    			li0.textContent = "Please ensure that you only submit reports on the relevant chain(s) that they have occurred on.";
    			t5 = space();
    			li1 = element("li");
    			li1.textContent = "Please provide all addresses, domains, and tags that are relevant to the report.";
    			t7 = space();
    			li2 = element("li");
    			li2.textContent = "All reports must have a full report link with additional information and proof if necessary.";
    			t9 = space();
    			create_component(textinput0.$$.fragment);
    			t10 = space();
    			create_component(textinput1.$$.fragment);
    			t11 = space();
    			create_component(textinput2.$$.fragment);
    			t12 = space();
    			create_component(textinput3.$$.fragment);
    			t13 = space();
    			button = element("button");
    			button.textContent = "Submit";
    			add_location(h1, file$6, 15, 0, 560);
    			add_location(p, file$6, 17, 0, 584);
    			add_location(li0, file$6, 21, 2, 697);
    			add_location(li1, file$6, 24, 2, 812);
    			add_location(li2, file$6, 27, 2, 912);
    			add_location(ol, file$6, 20, 0, 690);
    			add_location(button, file$6, 37, 0, 1463);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, ol, anchor);
    			append_dev(ol, li0);
    			append_dev(ol, t5);
    			append_dev(ol, li1);
    			append_dev(ol, t7);
    			append_dev(ol, li2);
    			insert_dev(target, t9, anchor);
    			mount_component(textinput0, target, anchor);
    			insert_dev(target, t10, anchor);
    			mount_component(textinput1, target, anchor);
    			insert_dev(target, t11, anchor);
    			mount_component(textinput2, target, anchor);
    			insert_dev(target, t12, anchor);
    			mount_component(textinput3, target, anchor);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, button, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*submitReport*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const textinput0_changes = {};

    			if (!updating_value && dirty & /*uri*/ 8) {
    				updating_value = true;
    				textinput0_changes.value = /*uri*/ ctx[3];
    				add_flush_callback(() => updating_value = false);
    			}

    			textinput0.$set(textinput0_changes);
    			const textinput1_changes = {};

    			if (!updating_value_1 && dirty & /*contractAddressesStr*/ 1) {
    				updating_value_1 = true;
    				textinput1_changes.value = /*contractAddressesStr*/ ctx[0];
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			textinput1.$set(textinput1_changes);
    			const textinput2_changes = {};

    			if (!updating_value_2 && dirty & /*domainsStr*/ 2) {
    				updating_value_2 = true;
    				textinput2_changes.value = /*domainsStr*/ ctx[1];
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			textinput2.$set(textinput2_changes);
    			const textinput3_changes = {};

    			if (!updating_value_3 && dirty & /*tagsStr*/ 4) {
    				updating_value_3 = true;
    				textinput3_changes.value = /*tagsStr*/ ctx[2];
    				add_flush_callback(() => updating_value_3 = false);
    			}

    			textinput3.$set(textinput3_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textinput0.$$.fragment, local);
    			transition_in(textinput1.$$.fragment, local);
    			transition_in(textinput2.$$.fragment, local);
    			transition_in(textinput3.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textinput0.$$.fragment, local);
    			transition_out(textinput1.$$.fragment, local);
    			transition_out(textinput2.$$.fragment, local);
    			transition_out(textinput3.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(ol);
    			if (detaching) detach_dev(t9);
    			destroy_component(textinput0, detaching);
    			if (detaching) detach_dev(t10);
    			destroy_component(textinput1, detaching);
    			if (detaching) detach_dev(t11);
    			destroy_component(textinput2, detaching);
    			if (detaching) detach_dev(t12);
    			destroy_component(textinput3, detaching);
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let contractAddresses;
    	let domains;
    	let tags;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Report', slots, []);
    	let uri = "";
    	let contractAddressesStr = "";
    	let domainsStr = "";
    	let tagsStr = "";

    	const submitReport = async () => {
    		pushNotification({
    			message: "not implemented yet",
    			type: "error"
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Report> was created with unknown prop '${key}'`);
    	});

    	function textinput0_value_binding(value) {
    		uri = value;
    		$$invalidate(3, uri);
    	}

    	function textinput1_value_binding(value) {
    		contractAddressesStr = value;
    		$$invalidate(0, contractAddressesStr);
    	}

    	function textinput2_value_binding(value) {
    		domainsStr = value;
    		$$invalidate(1, domainsStr);
    	}

    	function textinput3_value_binding(value) {
    		tagsStr = value;
    		$$invalidate(2, tagsStr);
    	}

    	$$self.$capture_state = () => ({
    		pushNotification,
    		TextInput,
    		uri,
    		contractAddressesStr,
    		domainsStr,
    		tagsStr,
    		submitReport,
    		tags,
    		domains,
    		contractAddresses
    	});

    	$$self.$inject_state = $$props => {
    		if ('uri' in $$props) $$invalidate(3, uri = $$props.uri);
    		if ('contractAddressesStr' in $$props) $$invalidate(0, contractAddressesStr = $$props.contractAddressesStr);
    		if ('domainsStr' in $$props) $$invalidate(1, domainsStr = $$props.domainsStr);
    		if ('tagsStr' in $$props) $$invalidate(2, tagsStr = $$props.tagsStr);
    		if ('tags' in $$props) tags = $$props.tags;
    		if ('domains' in $$props) domains = $$props.domains;
    		if ('contractAddresses' in $$props) contractAddresses = $$props.contractAddresses;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*contractAddressesStr*/ 1) {
    			contractAddresses = contractAddressesStr.split(',').map(x => x.trim());
    		}

    		if ($$self.$$.dirty & /*domainsStr*/ 2) {
    			domains = domainsStr.split(',').map(x => x.trim());
    		}

    		if ($$self.$$.dirty & /*tagsStr*/ 4) {
    			tags = tagsStr.split(',').map(x => x.trim());
    		}
    	};

    	return [
    		contractAddressesStr,
    		domainsStr,
    		tagsStr,
    		uri,
    		submitReport,
    		textinput0_value_binding,
    		textinput1_value_binding,
    		textinput2_value_binding,
    		textinput3_value_binding
    	];
    }

    class Report extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Report",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/routes/Certificate.svelte generated by Svelte v3.55.1 */
    const file$5 = "src/routes/Certificate.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[12] = list;
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (31:0) {#if myAuthorityCerts.length > 0}
    function create_if_block$1(ctx) {
    	let h1;
    	let t1;
    	let each_1_anchor;
    	let current;
    	let each_value = /*myAuthorityCerts*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Issue a Certificate";
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty$1();
    			add_location(h1, file$5, 31, 2, 848);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*revoke, issue, issueTo, myAuthorityCerts*/ 58) {
    				each_value = /*myAuthorityCerts*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(31:0) {#if myAuthorityCerts.length > 0}",
    		ctx
    	});

    	return block;
    }

    // (33:2) {#each myAuthorityCerts as cert, i}
    function create_each_block(ctx) {
    	let div1;
    	let h3;
    	let t0_value = (/*cert*/ ctx[11].name ?? `Cert #${/*cert*/ ctx[11].id}`) + "";
    	let t0;
    	let t1;
    	let textinput;
    	let updating_value;
    	let t2;
    	let div0;
    	let button0;
    	let t4;
    	let button1;
    	let t6;
    	let current;
    	let mounted;
    	let dispose;

    	function textinput_value_binding_1(value) {
    		/*textinput_value_binding_1*/ ctx[8](value, /*i*/ ctx[13]);
    	}

    	let textinput_props = {
    		label: "Address",
    		placeholder: "0x1234..."
    	};

    	if (/*issueTo*/ ctx[1][/*i*/ ctx[13]] !== void 0) {
    		textinput_props.value = /*issueTo*/ ctx[1][/*i*/ ctx[13]];
    	}

    	textinput = new TextInput({ props: textinput_props, $$inline: true });
    	binding_callbacks.push(() => bind(textinput, 'value', textinput_value_binding_1));

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();
    			create_component(textinput.$$.fragment);
    			t2 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Issue";
    			t4 = space();
    			button1 = element("button");
    			button1.textContent = "Revoke";
    			t6 = space();
    			attr_dev(h3, "class", "svelte-1um3wya");
    			add_location(h3, file$5, 34, 6, 944);
    			add_location(button0, file$5, 37, 8, 1091);
    			add_location(button1, file$5, 38, 8, 1139);
    			add_location(div0, file$5, 36, 6, 1077);
    			attr_dev(div1, "class", "cert svelte-1um3wya");
    			add_location(div1, file$5, 33, 4, 919);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h3);
    			append_dev(h3, t0);
    			append_dev(div1, t1);
    			mount_component(textinput, div1, null);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t4);
    			append_dev(div0, button1);
    			append_dev(div1, t6);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*issue*/ ctx[4], false, false, false),
    					listen_dev(button1, "click", /*revoke*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const textinput_changes = {};

    			if (!updating_value && dirty & /*issueTo*/ 2) {
    				updating_value = true;
    				textinput_changes.value = /*issueTo*/ ctx[1][/*i*/ ctx[13]];
    				add_flush_callback(() => updating_value = false);
    			}

    			textinput.$set(textinput_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textinput.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textinput.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(textinput);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(33:2) {#each myAuthorityCerts as cert, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let h1;
    	let t1;
    	let textinput;
    	let updating_value;
    	let t2;
    	let button;
    	let t4;
    	let if_block_anchor;
    	let current;
    	let mounted;
    	let dispose;

    	function textinput_value_binding(value) {
    		/*textinput_value_binding*/ ctx[7](value);
    	}

    	let textinput_props = { label: "Certificate Name" };

    	if (/*certName*/ ctx[0] !== void 0) {
    		textinput_props.value = /*certName*/ ctx[0];
    	}

    	textinput = new TextInput({ props: textinput_props, $$inline: true });
    	binding_callbacks.push(() => bind(textinput, 'value', textinput_value_binding));
    	let if_block = /*myAuthorityCerts*/ ctx[3].length > 0 && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Create a Certificate";
    			t1 = space();
    			create_component(textinput.$$.fragment);
    			t2 = space();
    			button = element("button");
    			button.textContent = "Create";
    			t4 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty$1();
    			add_location(h1, file$5, 25, 0, 673);
    			add_location(button, file$5, 28, 0, 765);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(textinput, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, button, anchor);
    			insert_dev(target, t4, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*createCert*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const textinput_changes = {};

    			if (!updating_value && dirty & /*certName*/ 1) {
    				updating_value = true;
    				textinput_changes.value = /*certName*/ ctx[0];
    				add_flush_callback(() => updating_value = false);
    			}

    			textinput.$set(textinput_changes);
    			if (/*myAuthorityCerts*/ ctx[3].length > 0) if_block.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(textinput.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(textinput.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			destroy_component(textinput, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(button);
    			if (detaching) detach_dev(t4);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let issueTo;
    	let $signer;
    	validate_store(signer, 'signer');
    	component_subscribe($$self, signer, $$value => $$invalidate(6, $signer = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Certificate', slots, []);
    	let certName = "";
    	let signerAddress;

    	const updateCerts = async () => {
    		if ($signer) {
    			signerAddress = await $signer.getAddress();
    		} else {
    			signerAddress = undefined;
    		}
    	};

    	const createCert = async () => {
    		
    	};

    	let myAuthorityCerts = [];

    	const issue = async () => {
    		
    	};

    	const revoke = async () => {
    		pushNotification({
    			message: "not implemented",
    			type: "error"
    		});
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Certificate> was created with unknown prop '${key}'`);
    	});

    	function textinput_value_binding(value) {
    		certName = value;
    		$$invalidate(0, certName);
    	}

    	function textinput_value_binding_1(value, i) {
    		if ($$self.$$.not_equal(issueTo[i], value)) {
    			issueTo[i] = value;
    			($$invalidate(1, issueTo), $$invalidate(3, myAuthorityCerts));
    		}
    	}

    	$$self.$capture_state = () => ({
    		pushNotification,
    		TextInput,
    		signer,
    		certName,
    		signerAddress,
    		updateCerts,
    		createCert,
    		myAuthorityCerts,
    		issue,
    		revoke,
    		issueTo,
    		$signer
    	});

    	$$self.$inject_state = $$props => {
    		if ('certName' in $$props) $$invalidate(0, certName = $$props.certName);
    		if ('signerAddress' in $$props) signerAddress = $$props.signerAddress;
    		if ('myAuthorityCerts' in $$props) $$invalidate(3, myAuthorityCerts = $$props.myAuthorityCerts);
    		if ('issueTo' in $$props) $$invalidate(1, issueTo = $$props.issueTo);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$signer*/ 64) {
    			(updateCerts());
    		}
    	};

    	$$invalidate(1, issueTo = myAuthorityCerts.map(() => ""));

    	return [
    		certName,
    		issueTo,
    		createCert,
    		myAuthorityCerts,
    		issue,
    		revoke,
    		$signer,
    		textinput_value_binding,
    		textinput_value_binding_1
    	];
    }

    class Certificate extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Certificate",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/routes/NotFound.svelte generated by Svelte v3.55.1 */

    const file$4 = "src/routes/NotFound.svelte";

    function create_fragment$5(ctx) {
    	let h1;
    	let t1;
    	let p;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Whoops!";
    			t1 = space();
    			p = element("p");
    			p.textContent = "The page you are looking for doesn't seem to exist!";
    			add_location(h1, file$4, 0, 0, 0);
    			add_location(p, file$4, 1, 0, 17);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('NotFound', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<NotFound> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class NotFound extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "NotFound",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    const routes = {
        "/": About,
        "/about": About,
        "/search": Search,
        "/report": Report,
        "/certificate": Certificate,
        "*": NotFound
    };

    /* src/components/Page.svelte generated by Svelte v3.55.1 */
    const file$3 = "src/components/Page.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let router;
    	let current;
    	router = new Router({ props: { routes }, $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(router.$$.fragment);
    			attr_dev(main, "class", "gradient-1-2 svelte-8b4553");
    			add_location(main, file$3, 4, 0, 105);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(router, main, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(router);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Page', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Page> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Router, routes });
    	return [];
    }

    class Page extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Page",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/Body.svelte generated by Svelte v3.55.1 */
    const file$2 = "src/components/Body.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let sidebar;
    	let t;
    	let page;
    	let current;
    	sidebar = new Sidebar({ $$inline: true });
    	page = new Page({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(sidebar.$$.fragment);
    			t = space();
    			create_component(page.$$.fragment);
    			attr_dev(div, "id", "container");
    			attr_dev(div, "class", "svelte-exb5ou");
    			add_location(div, file$2, 4, 0, 103);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(sidebar, div, null);
    			append_dev(div, t);
    			mount_component(page, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebar.$$.fragment, local);
    			transition_in(page.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidebar.$$.fragment, local);
    			transition_out(page.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(sidebar);
    			destroy_component(page);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Body', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Body> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Sidebar, Page });
    	return [];
    }

    class Body extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Body",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/ServiceWorker.svelte generated by Svelte v3.55.1 */

    const { console: console_1 } = globals;
    const file$1 = "src/components/ServiceWorker.svelte";

    // (63:0) {#if installing && ((Date.now() - lastLoad > 1000 * 60 * 60) || justUpdated)}
    function create_if_block(ctx) {
    	let div;
    	let div_outro;
    	let current;
    	let if_block = /*pageLoaded*/ ctx[1] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "id", "container");
    			attr_dev(div, "class", "gradient-1-2 svelte-1xh00sv");
    			add_location(div, file$1, 63, 2, 2408);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*pageLoaded*/ ctx[1]) {
    				if (if_block) {
    					if (dirty & /*pageLoaded*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			if (div_outro) div_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			div_outro = create_out_transition(div, fade, { duration: 1000 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (detaching && div_outro) div_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(63:0) {#if installing && ((Date.now() - lastLoad > 1000 * 60 * 60) || justUpdated)}",
    		ctx
    	});

    	return block;
    }

    // (65:4) {#if pageLoaded}
    function create_if_block_1(ctx) {
    	let img;
    	let img_src_value;
    	let t;
    	let div;
    	let svg;
    	let defs;
    	let linearGradient0;
    	let stop0;
    	let stop1;
    	let linearGradient1;
    	let g;
    	let path;
    	let animateTransform;
    	let div_intro;

    	const block = {
    		c: function create() {
    			img = element("img");
    			t = space();
    			div = element("div");
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			linearGradient0 = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			linearGradient1 = svg_element("linearGradient");
    			g = svg_element("g");
    			path = svg_element("path");
    			animateTransform = svg_element("animateTransform");
    			attr_dev(img, "id", "icon");
    			if (!src_url_equal(img.src, img_src_value = "favicon.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1xh00sv");
    			add_location(img, file$1, 66, 6, 2527);
    			set_style(stop0, "stop-color", "currentColor");
    			set_style(stop0, "stop-opacity", "1");
    			attr_dev(stop0, "offset", "0");
    			attr_dev(stop0, "id", "stop2079");
    			add_location(stop0, file$1, 82, 14, 3055);
    			set_style(stop1, "stop-color", "currentColor");
    			set_style(stop1, "stop-opacity", "0");
    			attr_dev(stop1, "offset", "1");
    			attr_dev(stop1, "id", "stop2081");
    			add_location(stop1, file$1, 86, 14, 3199);
    			attr_dev(linearGradient0, "id", "linearGradient2083");
    			add_location(linearGradient0, file$1, 80, 12, 2986);
    			xlink_attr(linearGradient1, "xlink:href", "#linearGradient2083");
    			attr_dev(linearGradient1, "id", "linearGradient2085");
    			attr_dev(linearGradient1, "x1", "98.117805");
    			attr_dev(linearGradient1, "y1", "70.801521");
    			attr_dev(linearGradient1, "x2", "98.204498");
    			attr_dev(linearGradient1, "y2", "149.59045");
    			attr_dev(linearGradient1, "gradientUnits", "userSpaceOnUse");
    			add_location(linearGradient1, file$1, 91, 12, 3371);
    			attr_dev(defs, "id", "defs2");
    			add_location(defs, file$1, 78, 10, 2944);
    			set_style(path, "opacity", "1");
    			set_style(path, "fill", "none");
    			set_style(path, "stroke", "url(#linearGradient2085)");
    			set_style(path, "stroke-width", "6");
    			set_style(path, "stroke-linecap", "round");
    			set_style(path, "stroke-linejoin", "round");
    			set_style(path, "stroke-miterlimit", "4");
    			set_style(path, "stroke-dasharray", "none");
    			set_style(path, "stroke-opacity", "0.502336");
    			set_style(path, "paint-order", "stroke fill markers");
    			attr_dev(path, "transform", "translate(-41.780995,-67.474064)");
    			attr_dev(path, "id", "spinner-path");
    			attr_dev(path, "d", "M 63.255444,145.99962 A 40.341225,40.341225 0 0 1 54.510567,102.03615 40.341225,40.341225 0 0 1 91.780998,77.132843");
    			add_location(path, file$1, 102, 12, 3709);
    			attr_dev(animateTransform, "attributeName", "transform");
    			attr_dev(animateTransform, "attributeType", "XML");
    			attr_dev(animateTransform, "type", "rotate");
    			attr_dev(animateTransform, "values", "0 50 50;360 50 50");
    			attr_dev(animateTransform, "dur", "2s");
    			attr_dev(animateTransform, "repeatCount", "indefinite");
    			add_location(animateTransform, file$1, 107, 12, 4185);
    			attr_dev(g, "id", "spinner-arc");
    			add_location(g, file$1, 100, 10, 3664);
    			attr_dev(svg, "width", "100mm");
    			attr_dev(svg, "height", "100mm");
    			attr_dev(svg, "viewBox", "0 0 100 100");
    			attr_dev(svg, "version", "1.1");
    			attr_dev(svg, "id", "spinner-svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "class", "svelte-1xh00sv");
    			add_location(svg, file$1, 70, 8, 2698);
    			attr_dev(div, "id", "spinner");
    			attr_dev(div, "class", "svelte-1xh00sv");
    			add_location(div, file$1, 69, 6, 2598);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    			insert_dev(target, t, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, defs);
    			append_dev(defs, linearGradient0);
    			append_dev(linearGradient0, stop0);
    			append_dev(linearGradient0, stop1);
    			append_dev(defs, linearGradient1);
    			append_dev(svg, g);
    			append_dev(g, path);
    			append_dev(g, animateTransform);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		i: function intro(local) {
    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, fade, /*justUpdated*/ ctx[3]
    					? { duration: 0 }
    					: { duration: 1000, delay: 200 });

    					div_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(65:4) {#if pageLoaded}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let show_if = /*installing*/ ctx[0] && (Date.now() - /*lastLoad*/ ctx[2] > 1000 * 60 * 60 || /*justUpdated*/ ctx[3]);
    	let if_block_anchor;
    	let current;
    	let if_block = show_if && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty$1();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*installing*/ 1) show_if = /*installing*/ ctx[0] && (Date.now() - /*lastLoad*/ ctx[2] > 1000 * 60 * 60 || /*justUpdated*/ ctx[3]);

    			if (show_if) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*installing*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ServiceWorker', slots, []);
    	var _a;

    	// Variables:
    	let installing = true;

    	let pageLoaded = false;

    	// Check for last load timestamp:
    	let lastLoad = parseInt((_a = localStorage.getItem("sw:lastLoad")) !== null && _a !== void 0
    	? _a
    	: "0");

    	localStorage.setItem("sw:lastLoad", "" + Date.now());

    	// Check if we just updated the worker:
    	let justUpdated = localStorage.getItem("sw:updated") === "true";

    	localStorage.removeItem("sw:updated");

    	console.log(`[Service Worker]: ${justUpdated
	? "Reloaded page after update."
	: "Checking for updates..."}`);

    	// Install Service Worker:
    	if ("serviceWorker" in navigator) {
    		window.addEventListener("load", async () => {
    			if ((location.pathname || "/") === "/") {
    				try {
    					// Register sw:
    					const sw = await navigator.serviceWorker.register("sw.js");

    					let updateFound = false;

    					sw.addEventListener("updatefound", () => {
    						console.log("[Service Worker]: update found!");
    						updateFound = true;
    						const newWorker = sw.installing;

    						newWorker === null || newWorker === void 0
    						? void 0
    						: newWorker.addEventListener("statechange", () => {
    								console.log(`[Service Worker]: { state: ${newWorker.state} }`);

    								if (newWorker.state === "activated") {
    									localStorage.setItem("sw:updated", "true");
    									location.reload();
    								}
    							});
    					});

    					await sw.update();

    					setTimeout(
    						() => {
    							if (!updateFound) {
    								console.log("[Service Worker]: Ready!");
    								$$invalidate(0, installing = false);
    							}
    						},
    						100
    					);
    				} catch(err) {
    					console.warn("[Service Worker]: Failed to register...");
    					console.error(err);
    					$$invalidate(0, installing = false);
    				}
    			} else {
    				$$invalidate(0, installing = false);
    			}
    		});
    	} else {
    		installing = false;
    	}

    	// Trigger animations next frame:
    	onMount(() => {
    		$$invalidate(1, pageLoaded = true);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<ServiceWorker> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		_a,
    		onMount,
    		fade,
    		installing,
    		pageLoaded,
    		lastLoad,
    		justUpdated
    	});

    	$$self.$inject_state = $$props => {
    		if ('_a' in $$props) _a = $$props._a;
    		if ('installing' in $$props) $$invalidate(0, installing = $$props.installing);
    		if ('pageLoaded' in $$props) $$invalidate(1, pageLoaded = $$props.pageLoaded);
    		if ('lastLoad' in $$props) $$invalidate(2, lastLoad = $$props.lastLoad);
    		if ('justUpdated' in $$props) $$invalidate(3, justUpdated = $$props.justUpdated);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [installing, pageLoaded, lastLoad, justUpdated];
    }

    class ServiceWorker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ServiceWorker",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Wrapper.svelte generated by Svelte v3.55.1 */

    const file = "src/components/Wrapper.svelte";

    function create_fragment$1(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "id", "wrapper");
    			attr_dev(div, "class", "svelte-1t4gbub");
    			add_location(div, file, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Wrapper', slots, ['default']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Wrapper> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Wrapper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Wrapper",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.55.1 */

    // (9:0) <Wrapper>
    function create_default_slot(ctx) {
    	let header;
    	let t;
    	let body;
    	let current;
    	header = new Header({ $$inline: true });
    	body = new Body({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t = space();
    			create_component(body.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(body, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(body.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(body.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(body, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(9:0) <Wrapper>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let wrapper;
    	let t0;
    	let notifications;
    	let t1;
    	let serviceworker;
    	let current;

    	wrapper = new Wrapper({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	notifications = new Notifications({ $$inline: true });
    	serviceworker = new ServiceWorker({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(wrapper.$$.fragment);
    			t0 = space();
    			create_component(notifications.$$.fragment);
    			t1 = space();
    			create_component(serviceworker.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(wrapper, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(notifications, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(serviceworker, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const wrapper_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				wrapper_changes.$$scope = { dirty, ctx };
    			}

    			wrapper.$set(wrapper_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(wrapper.$$.fragment, local);
    			transition_in(notifications.$$.fragment, local);
    			transition_in(serviceworker.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(wrapper.$$.fragment, local);
    			transition_out(notifications.$$.fragment, local);
    			transition_out(serviceworker.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(wrapper, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(notifications, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(serviceworker, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		Body,
    		ServiceWorker,
    		Wrapper,
    		Notifications
    	});

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
