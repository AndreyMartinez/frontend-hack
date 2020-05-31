
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
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
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
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
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
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
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
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
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
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
        flushing = false;
        seen_callbacks.clear();
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
    function wait() {
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
    }
    const null_transition = { duration: 0 };
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
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
            wait().then(() => {
                // @ts-ignore
                config = config();
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

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
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
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
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
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
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.23.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
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
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
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
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
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

    const LOCATION = {};
    const ROUTER = {};

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    function getLocation(source) {
      return {
        ...source.location,
        state: source.history.state,
        key: (source.history.state && source.history.state.key) || "initial"
      };
    }

    function createHistory(source, options) {
      const listeners = [];
      let location = getLocation(source);

      return {
        get location() {
          return location;
        },

        listen(listener) {
          listeners.push(listener);

          const popstateListener = () => {
            location = getLocation(source);
            listener({ location, action: "POP" });
          };

          source.addEventListener("popstate", popstateListener);

          return () => {
            source.removeEventListener("popstate", popstateListener);

            const index = listeners.indexOf(listener);
            listeners.splice(index, 1);
          };
        },

        navigate(to, { state, replace = false } = {}) {
          state = { ...state, key: Date.now() + "" };
          // try...catch iOS Safari limits to 100 pushState calls
          try {
            if (replace) {
              source.history.replaceState(state, null, to);
            } else {
              source.history.pushState(state, null, to);
            }
          } catch (e) {
            source.location[replace ? "replace" : "assign"](to);
          }

          location = getLocation(source);
          listeners.forEach(listener => listener({ location, action: "PUSH" }));
        }
      };
    }

    // Stores history entries in memory for testing or other platforms like Native
    function createMemorySource(initialPathname = "/") {
      let index = 0;
      const stack = [{ pathname: initialPathname, search: "" }];
      const states = [];

      return {
        get location() {
          return stack[index];
        },
        addEventListener(name, fn) {},
        removeEventListener(name, fn) {},
        history: {
          get entries() {
            return stack;
          },
          get index() {
            return index;
          },
          get state() {
            return states[index];
          },
          pushState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            index++;
            stack.push({ pathname, search });
            states.push(state);
          },
          replaceState(state, _, uri) {
            const [pathname, search = ""] = uri.split("?");
            stack[index] = { pathname, search };
            states[index] = state;
          }
        }
      };
    }

    // Global history uses window.history as the source if available,
    // otherwise a memory history
    const canUseDOM = Boolean(
      typeof window !== "undefined" &&
        window.document &&
        window.document.createElement
    );
    const globalHistory = createHistory(canUseDOM ? window : createMemorySource());
    const { navigate } = globalHistory;

    /**
     * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
     *
     * https://github.com/reach/router/blob/master/LICENSE
     * */

    const paramRe = /^:(.+)/;

    const SEGMENT_POINTS = 4;
    const STATIC_POINTS = 3;
    const DYNAMIC_POINTS = 2;
    const SPLAT_PENALTY = 1;
    const ROOT_POINTS = 1;

    /**
     * Check if `segment` is a root segment
     * @param {string} segment
     * @return {boolean}
     */
    function isRootSegment(segment) {
      return segment === "";
    }

    /**
     * Check if `segment` is a dynamic segment
     * @param {string} segment
     * @return {boolean}
     */
    function isDynamic(segment) {
      return paramRe.test(segment);
    }

    /**
     * Check if `segment` is a splat
     * @param {string} segment
     * @return {boolean}
     */
    function isSplat(segment) {
      return segment[0] === "*";
    }

    /**
     * Split up the URI into segments delimited by `/`
     * @param {string} uri
     * @return {string[]}
     */
    function segmentize(uri) {
      return (
        uri
          // Strip starting/ending `/`
          .replace(/(^\/+|\/+$)/g, "")
          .split("/")
      );
    }

    /**
     * Strip `str` of potential start and end `/`
     * @param {string} str
     * @return {string}
     */
    function stripSlashes(str) {
      return str.replace(/(^\/+|\/+$)/g, "");
    }

    /**
     * Score a route depending on how its individual segments look
     * @param {object} route
     * @param {number} index
     * @return {object}
     */
    function rankRoute(route, index) {
      const score = route.default
        ? 0
        : segmentize(route.path).reduce((score, segment) => {
            score += SEGMENT_POINTS;

            if (isRootSegment(segment)) {
              score += ROOT_POINTS;
            } else if (isDynamic(segment)) {
              score += DYNAMIC_POINTS;
            } else if (isSplat(segment)) {
              score -= SEGMENT_POINTS + SPLAT_PENALTY;
            } else {
              score += STATIC_POINTS;
            }

            return score;
          }, 0);

      return { route, score, index };
    }

    /**
     * Give a score to all routes and sort them on that
     * @param {object[]} routes
     * @return {object[]}
     */
    function rankRoutes(routes) {
      return (
        routes
          .map(rankRoute)
          // If two routes have the exact same score, we go by index instead
          .sort((a, b) =>
            a.score < b.score ? 1 : a.score > b.score ? -1 : a.index - b.index
          )
      );
    }

    /**
     * Ranks and picks the best route to match. Each segment gets the highest
     * amount of points, then the type of segment gets an additional amount of
     * points where
     *
     *  static > dynamic > splat > root
     *
     * This way we don't have to worry about the order of our routes, let the
     * computers do it.
     *
     * A route looks like this
     *
     *  { path, default, value }
     *
     * And a returned match looks like:
     *
     *  { route, params, uri }
     *
     * @param {object[]} routes
     * @param {string} uri
     * @return {?object}
     */
    function pick(routes, uri) {
      let match;
      let default_;

      const [uriPathname] = uri.split("?");
      const uriSegments = segmentize(uriPathname);
      const isRootUri = uriSegments[0] === "";
      const ranked = rankRoutes(routes);

      for (let i = 0, l = ranked.length; i < l; i++) {
        const route = ranked[i].route;
        let missed = false;

        if (route.default) {
          default_ = {
            route,
            params: {},
            uri
          };
          continue;
        }

        const routeSegments = segmentize(route.path);
        const params = {};
        const max = Math.max(uriSegments.length, routeSegments.length);
        let index = 0;

        for (; index < max; index++) {
          const routeSegment = routeSegments[index];
          const uriSegment = uriSegments[index];

          if (routeSegment !== undefined && isSplat(routeSegment)) {
            // Hit a splat, just grab the rest, and return a match
            // uri:   /files/documents/work
            // route: /files/* or /files/*splatname
            const splatName = routeSegment === "*" ? "*" : routeSegment.slice(1);

            params[splatName] = uriSegments
              .slice(index)
              .map(decodeURIComponent)
              .join("/");
            break;
          }

          if (uriSegment === undefined) {
            // URI is shorter than the route, no match
            // uri:   /users
            // route: /users/:userId
            missed = true;
            break;
          }

          let dynamicMatch = paramRe.exec(routeSegment);

          if (dynamicMatch && !isRootUri) {
            const value = decodeURIComponent(uriSegment);
            params[dynamicMatch[1]] = value;
          } else if (routeSegment !== uriSegment) {
            // Current segments don't match, not dynamic, not splat, so no match
            // uri:   /users/123/settings
            // route: /users/:id/profile
            missed = true;
            break;
          }
        }

        if (!missed) {
          match = {
            route,
            params,
            uri: "/" + uriSegments.slice(0, index).join("/")
          };
          break;
        }
      }

      return match || default_ || null;
    }

    /**
     * Check if the `path` matches the `uri`.
     * @param {string} path
     * @param {string} uri
     * @return {?object}
     */
    function match(route, uri) {
      return pick([route], uri);
    }

    /**
     * Combines the `basepath` and the `path` into one path.
     * @param {string} basepath
     * @param {string} path
     */
    function combinePaths(basepath, path) {
      return `${stripSlashes(
    path === "/" ? basepath : `${stripSlashes(basepath)}/${stripSlashes(path)}`
  )}/`;
    }

    /* node_modules/svelte-routing/src/Router.svelte generated by Svelte v3.23.0 */

    function create_fragment(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[16].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32768) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[15], dirty, null, null);
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
    			if (default_slot) default_slot.d(detaching);
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
    	let $base;
    	let $location;
    	let $routes;
    	let { basepath = "/" } = $$props;
    	let { url = null } = $$props;
    	const locationContext = getContext(LOCATION);
    	const routerContext = getContext(ROUTER);
    	const routes = writable([]);
    	validate_store(routes, "routes");
    	component_subscribe($$self, routes, value => $$invalidate(8, $routes = value));
    	const activeRoute = writable(null);
    	let hasActiveRoute = false; // Used in SSR to synchronously set that a Route is active.

    	// If locationContext is not set, this is the topmost Router in the tree.
    	// If the `url` prop is given we force the location to it.
    	const location = locationContext || writable(url ? { pathname: url } : globalHistory.location);

    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(7, $location = value));

    	// If routerContext is set, the routerBase of the parent Router
    	// will be the base for this Router's descendants.
    	// If routerContext is not set, the path and resolved uri will both
    	// have the value of the basepath prop.
    	const base = routerContext
    	? routerContext.routerBase
    	: writable({ path: basepath, uri: basepath });

    	validate_store(base, "base");
    	component_subscribe($$self, base, value => $$invalidate(6, $base = value));

    	const routerBase = derived([base, activeRoute], ([base, activeRoute]) => {
    		// If there is no activeRoute, the routerBase will be identical to the base.
    		if (activeRoute === null) {
    			return base;
    		}

    		const { path: basepath } = base;
    		const { route, uri } = activeRoute;

    		// Remove the potential /* or /*splatname from
    		// the end of the child Routes relative paths.
    		const path = route.default
    		? basepath
    		: route.path.replace(/\*.*$/, "");

    		return { path, uri };
    	});

    	function registerRoute(route) {
    		const { path: basepath } = $base;
    		let { path } = route;

    		// We store the original path in the _path property so we can reuse
    		// it when the basepath changes. The only thing that matters is that
    		// the route reference is intact, so mutation is fine.
    		route._path = path;

    		route.path = combinePaths(basepath, path);

    		if (typeof window === "undefined") {
    			// In SSR we should set the activeRoute immediately if it is a match.
    			// If there are more Routes being registered after a match is found,
    			// we just skip them.
    			if (hasActiveRoute) {
    				return;
    			}

    			const matchingRoute = match(route, $location.pathname);

    			if (matchingRoute) {
    				activeRoute.set(matchingRoute);
    				hasActiveRoute = true;
    			}
    		} else {
    			routes.update(rs => {
    				rs.push(route);
    				return rs;
    			});
    		}
    	}

    	function unregisterRoute(route) {
    		routes.update(rs => {
    			const index = rs.indexOf(route);
    			rs.splice(index, 1);
    			return rs;
    		});
    	}

    	if (!locationContext) {
    		// The topmost Router in the tree is responsible for updating
    		// the location store and supplying it through context.
    		onMount(() => {
    			const unlisten = globalHistory.listen(history => {
    				location.set(history.location);
    			});

    			return unlisten;
    		});

    		setContext(LOCATION, location);
    	}

    	setContext(ROUTER, {
    		activeRoute,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute
    	});

    	const writable_props = ["basepath", "url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Router", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("$$scope" in $$props) $$invalidate(15, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		onMount,
    		writable,
    		derived,
    		LOCATION,
    		ROUTER,
    		globalHistory,
    		pick,
    		match,
    		stripSlashes,
    		combinePaths,
    		basepath,
    		url,
    		locationContext,
    		routerContext,
    		routes,
    		activeRoute,
    		hasActiveRoute,
    		location,
    		base,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$base,
    		$location,
    		$routes
    	});

    	$$self.$inject_state = $$props => {
    		if ("basepath" in $$props) $$invalidate(3, basepath = $$props.basepath);
    		if ("url" in $$props) $$invalidate(4, url = $$props.url);
    		if ("hasActiveRoute" in $$props) hasActiveRoute = $$props.hasActiveRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$base*/ 64) {
    			// This reactive statement will update all the Routes' path when
    			// the basepath changes.
    			 {
    				const { path: basepath } = $base;

    				routes.update(rs => {
    					rs.forEach(r => r.path = combinePaths(basepath, r._path));
    					return rs;
    				});
    			}
    		}

    		if ($$self.$$.dirty & /*$routes, $location*/ 384) {
    			// This reactive statement will be run when the Router is created
    			// when there are no Routes and then again the following tick, so it
    			// will not find an active Route in SSR and in the browser it will only
    			// pick an active Route after all Routes have been registered.
    			 {
    				const bestMatch = pick($routes, $location.pathname);
    				activeRoute.set(bestMatch);
    			}
    		}
    	};

    	return [
    		routes,
    		location,
    		base,
    		basepath,
    		url,
    		hasActiveRoute,
    		$base,
    		$location,
    		$routes,
    		locationContext,
    		routerContext,
    		activeRoute,
    		routerBase,
    		registerRoute,
    		unregisterRoute,
    		$$scope,
    		$$slots
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { basepath: 3, url: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get basepath() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set basepath(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get url() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules/svelte-routing/src/Route.svelte generated by Svelte v3.23.0 */

    const get_default_slot_changes = dirty => ({
    	params: dirty & /*routeParams*/ 2,
    	location: dirty & /*$location*/ 16
    });

    const get_default_slot_context = ctx => ({
    	params: /*routeParams*/ ctx[1],
    	location: /*$location*/ ctx[4]
    });

    // (40:0) {#if $activeRoute !== null && $activeRoute.route === route}
    function create_if_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*component*/ ctx[0] !== null) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
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
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:0) {#if $activeRoute !== null && $activeRoute.route === route}",
    		ctx
    	});

    	return block;
    }

    // (43:2) {:else}
    function create_else_block(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[13].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope, routeParams, $location*/ 4114) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[12], dirty, get_default_slot_changes, get_default_slot_context);
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
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(43:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (41:2) {#if component !== null}
    function create_if_block_1(ctx) {
    	let switch_instance_anchor;
    	let current;

    	const switch_instance_spread_levels = [
    		{ location: /*$location*/ ctx[4] },
    		/*routeParams*/ ctx[1],
    		/*routeProps*/ ctx[2]
    	];

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
    		var switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*$location, routeParams, routeProps*/ 22)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*$location*/ 16 && { location: /*$location*/ ctx[4] },
    					dirty & /*routeParams*/ 2 && get_spread_object(/*routeParams*/ ctx[1]),
    					dirty & /*routeProps*/ 4 && get_spread_object(/*routeProps*/ ctx[2])
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
    					switch_instance = new switch_value(switch_props());
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
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(41:2) {#if component !== null}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
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
    			if (/*$activeRoute*/ ctx[3] !== null && /*$activeRoute*/ ctx[3].route === /*route*/ ctx[7]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$activeRoute*/ 8) {
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $activeRoute;
    	let $location;
    	let { path = "" } = $$props;
    	let { component = null } = $$props;
    	const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
    	validate_store(activeRoute, "activeRoute");
    	component_subscribe($$self, activeRoute, value => $$invalidate(3, $activeRoute = value));
    	const location = getContext(LOCATION);
    	validate_store(location, "location");
    	component_subscribe($$self, location, value => $$invalidate(4, $location = value));

    	const route = {
    		path,
    		// If no path prop is given, this Route will act as the default Route
    		// that is rendered if no other Route in the Router is a match.
    		default: path === ""
    	};

    	let routeParams = {};
    	let routeProps = {};
    	registerRoute(route);

    	// There is no need to unregister Routes in SSR since it will all be
    	// thrown away anyway.
    	if (typeof window !== "undefined") {
    		onDestroy(() => {
    			unregisterRoute(route);
    		});
    	}

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Route", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("path" in $$new_props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$new_props) $$invalidate(0, component = $$new_props.component);
    		if ("$$scope" in $$new_props) $$invalidate(12, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		onDestroy,
    		ROUTER,
    		LOCATION,
    		path,
    		component,
    		registerRoute,
    		unregisterRoute,
    		activeRoute,
    		location,
    		route,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(11, $$props = assign(assign({}, $$props), $$new_props));
    		if ("path" in $$props) $$invalidate(8, path = $$new_props.path);
    		if ("component" in $$props) $$invalidate(0, component = $$new_props.component);
    		if ("routeParams" in $$props) $$invalidate(1, routeParams = $$new_props.routeParams);
    		if ("routeProps" in $$props) $$invalidate(2, routeProps = $$new_props.routeProps);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$activeRoute*/ 8) {
    			 if ($activeRoute && $activeRoute.route === route) {
    				$$invalidate(1, routeParams = $activeRoute.params);
    			}
    		}

    		 {
    			const { path, component, ...rest } = $$props;
    			$$invalidate(2, routeProps = rest);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		component,
    		routeParams,
    		routeProps,
    		$activeRoute,
    		$location,
    		activeRoute,
    		location,
    		route,
    		path,
    		registerRoute,
    		unregisterRoute,
    		$$props,
    		$$scope,
    		$$slots
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { path: 8, component: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function toVal(mix) {
    	var k, y, str='';
    	if (mix) {
    		if (typeof mix === 'object') {
    			if (Array.isArray(mix)) {
    				for (k=0; k < mix.length; k++) {
    					if (mix[k] && (y = toVal(mix[k]))) {
    						str && (str += ' ');
    						str += y;
    					}
    				}
    			} else {
    				for (k in mix) {
    					if (mix[k] && (y = toVal(k))) {
    						str && (str += ' ');
    						str += y;
    					}
    				}
    			}
    		} else if (typeof mix !== 'boolean' && !mix.call) {
    			str && (str += ' ');
    			str += mix;
    		}
    	}
    	return str;
    }

    function clsx () {
    	var i=0, x, str='';
    	while (i < arguments.length) {
    		if (x = toVal(arguments[i++])) {
    			str && (str += ' ');
    			str += x;
    		}
    	}
    	return str;
    }

    function clean($$props) {
      const rest = {};
      for (const key of Object.keys($$props)) {
        if (key !== "children" && key !== "$$scope" && key !== "$$slots") {
          rest[key] = $$props[key];
        }
      }
      return rest;
    }

    /* node_modules/sveltestrap/src/Button.svelte generated by Svelte v3.23.0 */
    const file = "node_modules/sveltestrap/src/Button.svelte";

    // (53:0) {:else}
    function create_else_block_1(ctx) {
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*$$slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	let button_levels = [
    		/*props*/ ctx[10],
    		{ id: /*id*/ ctx[4] },
    		{ class: /*classes*/ ctx[8] },
    		{ disabled: /*disabled*/ ctx[2] },
    		{ value: /*value*/ ctx[6] },
    		{
    			"aria-label": /*ariaLabel*/ ctx[7] || /*defaultAriaLabel*/ ctx[9]
    		},
    		{ style: /*style*/ ctx[5] }
    	];

    	let button_data = {};

    	for (let i = 0; i < button_levels.length; i += 1) {
    		button_data = assign(button_data, button_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			button = element("button");
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			set_attributes(button, button_data);
    			add_location(button, file, 53, 2, 1061);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[21], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 262144) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[18], dirty, null, null);
    				}
    			} else {
    				if (default_slot_or_fallback && default_slot_or_fallback.p && dirty & /*close, children, $$scope*/ 262147) {
    					default_slot_or_fallback.p(ctx, dirty);
    				}
    			}

    			set_attributes(button, button_data = get_spread_update(button_levels, [
    				dirty & /*props*/ 1024 && /*props*/ ctx[10],
    				dirty & /*id*/ 16 && { id: /*id*/ ctx[4] },
    				dirty & /*classes*/ 256 && { class: /*classes*/ ctx[8] },
    				dirty & /*disabled*/ 4 && { disabled: /*disabled*/ ctx[2] },
    				dirty & /*value*/ 64 && { value: /*value*/ ctx[6] },
    				dirty & /*ariaLabel, defaultAriaLabel*/ 640 && {
    					"aria-label": /*ariaLabel*/ ctx[7] || /*defaultAriaLabel*/ ctx[9]
    				},
    				dirty & /*style*/ 32 && { style: /*style*/ ctx[5] }
    			]));
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(53:0) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (37:0) {#if href}
    function create_if_block$1(ctx) {
    	let a;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1$1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*children*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	let a_levels = [
    		/*props*/ ctx[10],
    		{ id: /*id*/ ctx[4] },
    		{ class: /*classes*/ ctx[8] },
    		{ disabled: /*disabled*/ ctx[2] },
    		{ href: /*href*/ ctx[3] },
    		{
    			"aria-label": /*ariaLabel*/ ctx[7] || /*defaultAriaLabel*/ ctx[9]
    		},
    		{ style: /*style*/ ctx[5] }
    	];

    	let a_data = {};

    	for (let i = 0; i < a_levels.length; i += 1) {
    		a_data = assign(a_data, a_levels[i]);
    	}

    	const block_1 = {
    		c: function create() {
    			a = element("a");
    			if_block.c();
    			set_attributes(a, a_data);
    			add_location(a, file, 37, 2, 825);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			if_blocks[current_block_type_index].m(a, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(a, "click", /*click_handler*/ ctx[20], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

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
    				}

    				transition_in(if_block, 1);
    				if_block.m(a, null);
    			}

    			set_attributes(a, a_data = get_spread_update(a_levels, [
    				dirty & /*props*/ 1024 && /*props*/ ctx[10],
    				dirty & /*id*/ 16 && { id: /*id*/ ctx[4] },
    				dirty & /*classes*/ 256 && { class: /*classes*/ ctx[8] },
    				dirty & /*disabled*/ 4 && { disabled: /*disabled*/ ctx[2] },
    				dirty & /*href*/ 8 && { href: /*href*/ ctx[3] },
    				dirty & /*ariaLabel, defaultAriaLabel*/ 640 && {
    					"aria-label": /*ariaLabel*/ ctx[7] || /*defaultAriaLabel*/ ctx[9]
    				},
    				dirty & /*style*/ 32 && { style: /*style*/ ctx[5] }
    			]));
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
    			if (detaching) detach_dev(a);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(37:0) {#if href}",
    		ctx
    	});

    	return block_1;
    }

    // (68:6) {:else}
    function create_else_block_2(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	const block_1 = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 262144) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[18], dirty, null, null);
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
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(68:6) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (66:25) 
    function create_if_block_3(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*children*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 1) set_data_dev(t, /*children*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(66:25) ",
    		ctx
    	});

    	return block_1;
    }

    // (64:6) {#if close}
    function create_if_block_2(ctx) {
    	let span;

    	const block_1 = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "×";
    			attr_dev(span, "aria-hidden", "true");
    			add_location(span, file, 64, 8, 1250);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(64:6) {#if close}",
    		ctx
    	});

    	return block_1;
    }

    // (63:10)        
    function fallback_block(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2, create_if_block_3, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*close*/ ctx[1]) return 0;
    		if (/*children*/ ctx[0]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block_1 = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

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
    		block: block_1,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(63:10)        ",
    		ctx
    	});

    	return block_1;
    }

    // (49:4) {:else}
    function create_else_block$1(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[19].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[18], null);

    	const block_1 = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 262144) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[18], dirty, null, null);
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
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(49:4) {:else}",
    		ctx
    	});

    	return block_1;
    }

    // (47:4) {#if children}
    function create_if_block_1$1(ctx) {
    	let t;

    	const block_1 = {
    		c: function create() {
    			t = text(/*children*/ ctx[0]);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*children*/ 1) set_data_dev(t, /*children*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block: block_1,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(47:4) {#if children}",
    		ctx
    	});

    	return block_1;
    }

    function create_fragment$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*href*/ ctx[3]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block_1 = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
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
    		block: block_1,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block_1;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { class: className = "" } = $$props;
    	let { active = false } = $$props;
    	let { block = false } = $$props;
    	let { children = undefined } = $$props;
    	let { close = false } = $$props;
    	let { color = "secondary" } = $$props;
    	let { disabled = false } = $$props;
    	let { href = "" } = $$props;
    	let { id = "" } = $$props;
    	let { outline = false } = $$props;
    	let { size = "" } = $$props;
    	let { style = "" } = $$props;
    	let { value = "" } = $$props;
    	const props = clean($$props);
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Button", $$slots, ['default']);

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	function click_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$set = $$new_props => {
    		$$invalidate(17, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("class" in $$new_props) $$invalidate(11, className = $$new_props.class);
    		if ("active" in $$new_props) $$invalidate(12, active = $$new_props.active);
    		if ("block" in $$new_props) $$invalidate(13, block = $$new_props.block);
    		if ("children" in $$new_props) $$invalidate(0, children = $$new_props.children);
    		if ("close" in $$new_props) $$invalidate(1, close = $$new_props.close);
    		if ("color" in $$new_props) $$invalidate(14, color = $$new_props.color);
    		if ("disabled" in $$new_props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ("href" in $$new_props) $$invalidate(3, href = $$new_props.href);
    		if ("id" in $$new_props) $$invalidate(4, id = $$new_props.id);
    		if ("outline" in $$new_props) $$invalidate(15, outline = $$new_props.outline);
    		if ("size" in $$new_props) $$invalidate(16, size = $$new_props.size);
    		if ("style" in $$new_props) $$invalidate(5, style = $$new_props.style);
    		if ("value" in $$new_props) $$invalidate(6, value = $$new_props.value);
    		if ("$$scope" in $$new_props) $$invalidate(18, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		clsx,
    		clean,
    		className,
    		active,
    		block,
    		children,
    		close,
    		color,
    		disabled,
    		href,
    		id,
    		outline,
    		size,
    		style,
    		value,
    		props,
    		ariaLabel,
    		classes,
    		defaultAriaLabel
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(17, $$props = assign(assign({}, $$props), $$new_props));
    		if ("className" in $$props) $$invalidate(11, className = $$new_props.className);
    		if ("active" in $$props) $$invalidate(12, active = $$new_props.active);
    		if ("block" in $$props) $$invalidate(13, block = $$new_props.block);
    		if ("children" in $$props) $$invalidate(0, children = $$new_props.children);
    		if ("close" in $$props) $$invalidate(1, close = $$new_props.close);
    		if ("color" in $$props) $$invalidate(14, color = $$new_props.color);
    		if ("disabled" in $$props) $$invalidate(2, disabled = $$new_props.disabled);
    		if ("href" in $$props) $$invalidate(3, href = $$new_props.href);
    		if ("id" in $$props) $$invalidate(4, id = $$new_props.id);
    		if ("outline" in $$props) $$invalidate(15, outline = $$new_props.outline);
    		if ("size" in $$props) $$invalidate(16, size = $$new_props.size);
    		if ("style" in $$props) $$invalidate(5, style = $$new_props.style);
    		if ("value" in $$props) $$invalidate(6, value = $$new_props.value);
    		if ("ariaLabel" in $$props) $$invalidate(7, ariaLabel = $$new_props.ariaLabel);
    		if ("classes" in $$props) $$invalidate(8, classes = $$new_props.classes);
    		if ("defaultAriaLabel" in $$props) $$invalidate(9, defaultAriaLabel = $$new_props.defaultAriaLabel);
    	};

    	let ariaLabel;
    	let classes;
    	let defaultAriaLabel;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(7, ariaLabel = $$props["aria-label"]);

    		if ($$self.$$.dirty & /*className, close, outline, color, size, block, active*/ 129026) {
    			 $$invalidate(8, classes = clsx(className, { close }, close || "btn", close || `btn${outline ? "-outline" : ""}-${color}`, size ? `btn-${size}` : false, block ? "btn-block" : false, { active }));
    		}

    		if ($$self.$$.dirty & /*close*/ 2) {
    			 $$invalidate(9, defaultAriaLabel = close ? "Close" : null);
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		children,
    		close,
    		disabled,
    		href,
    		id,
    		style,
    		value,
    		ariaLabel,
    		classes,
    		defaultAriaLabel,
    		props,
    		className,
    		active,
    		block,
    		color,
    		outline,
    		size,
    		$$props,
    		$$scope,
    		$$slots,
    		click_handler,
    		click_handler_1
    	];
    }

    class Button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			class: 11,
    			active: 12,
    			block: 13,
    			children: 0,
    			close: 1,
    			color: 14,
    			disabled: 2,
    			href: 3,
    			id: 4,
    			outline: 15,
    			size: 16,
    			style: 5,
    			value: 6
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Button",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get class() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set class(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get active() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get block() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set block(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get children() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set children(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get close() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set close(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get href() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set href(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get outline() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set outline(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get size() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set size(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get style() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set style(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/component/Header.svelte generated by Svelte v3.23.0 */

    const { console: console_1 } = globals;
    const file$1 = "src/component/Header.svelte";

    // (33:0) {#if typeHeader == "login"}
    function create_if_block_2$1(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let current;

    	const button0 = new Button({
    			props: {
    				class: "button",
    				color: "dark",
    				outline: true,
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button0.$on("click", /*click_handler*/ ctx[5]);

    	const button1 = new Button({
    			props: {
    				class: "button",
    				color: "dark",
    				outline: true,
    				inse: true,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	button1.$on("click", /*click_handler_1*/ ctx[6]);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(button0.$$.fragment);
    			t = space();
    			create_component(button1.$$.fragment);
    			add_location(div0, file$1, 34, 1, 886);
    			attr_dev(div1, "class", "item buttom-content svelte-1smuzz5");
    			add_location(div1, file$1, 33, 1, 851);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(button0, div0, null);
    			append_dev(div0, t);
    			mount_component(button1, div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const button0_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button0_changes.$$scope = { dirty, ctx };
    			}

    			button0.$set(button0_changes);
    			const button1_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button1_changes.$$scope = { dirty, ctx };
    			}

    			button1.$set(button1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(button0.$$.fragment, local);
    			transition_in(button1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(button0.$$.fragment, local);
    			transition_out(button1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(button0);
    			destroy_component(button1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(33:0) {#if typeHeader == \\\"login\\\"}",
    		ctx
    	});

    	return block;
    }

    // (36:1) <Button class="button" color="dark" outline on:click={() => routerRegister('login')}>
    function create_default_slot_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Iniciar sesión");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(36:1) <Button class=\\\"button\\\" color=\\\"dark\\\" outline on:click={() => routerRegister('login')}>",
    		ctx
    	});

    	return block;
    }

    // (39:0) <Button class="button" color="dark" outline inse on:click={() => routerRegister('register')}>
    function create_default_slot(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("registrarse");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(39:0) <Button class=\\\"button\\\" color=\\\"dark\\\" outline inse on:click={() => routerRegister('register')}>",
    		ctx
    	});

    	return block;
    }

    // (45:0) {#if typeHeader == "general"}
    function create_if_block$2(ctx) {
    	let div1;
    	let div0;
    	let button;
    	let t1;
    	let mounted;
    	let dispose;
    	let if_block = /*returnPage*/ ctx[1] && create_if_block_1$2(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "Cerrar sesión";
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(button, "type", "");
    			attr_dev(button, "class", "btn btn-outline-light btn-item button-minimal svelte-1smuzz5");
    			add_location(button, file$1, 47, 0, 1237);
    			attr_dev(div0, "class", "flex secondary svelte-1smuzz5");
    			add_location(div0, file$1, 46, 0, 1208);
    			attr_dev(div1, "class", "item info-user svelte-1smuzz5");
    			add_location(div1, file$1, 45, 0, 1179);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			append_dev(div0, t1);
    			if (if_block) if_block.m(div0, null);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_2*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*returnPage*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(45:0) {#if typeHeader == \\\"general\\\"}",
    		ctx
    	});

    	return block;
    }

    // (49:0) {#if returnPage}
    function create_if_block_1$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Regresar";
    			attr_dev(button, "type", "");
    			attr_dev(button, "class", "btn btn-outline-light btn-item button-minimal svelte-1smuzz5");
    			add_location(button, file$1, 49, 0, 1391);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*routerBack*/ ctx[3], false, false, false);
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
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(49:0) {#if returnPage}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let header;
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let t2;
    	let current;
    	let if_block0 = /*typeHeader*/ ctx[0] == "login" && create_if_block_2$1(ctx);
    	let if_block1 = /*typeHeader*/ ctx[0] == "general" && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			div0 = element("div");
    			t0 = space();
    			div1 = element("div");
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(div0, "class", "item svelte-1smuzz5");
    			add_location(div0, file$1, 30, 1, 761);
    			attr_dev(div1, "class", "principal-item svelte-1smuzz5");
    			add_location(div1, file$1, 31, 1, 787);
    			attr_dev(header, "class", "header svelte-1smuzz5");
    			add_location(header, file$1, 29, 0, 736);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div0);
    			append_dev(header, t0);
    			append_dev(header, div1);
    			append_dev(header, t1);
    			if (if_block0) if_block0.m(header, null);
    			append_dev(header, t2);
    			if (if_block1) if_block1.m(header, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*typeHeader*/ ctx[0] == "login") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*typeHeader*/ 1) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(header, t2);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*typeHeader*/ ctx[0] == "general") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					if_block1.m(header, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
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
    	const routerRegister = type => {
    		if (type === "register") navigate("/register", { replace: true }); else if (type === "login") navigate("/login", { replace: true }); else if (type === "recycler") navigate("/", { replace: true });
    	};

    	/**
    * @author Raphael Martinez
    * @description handler de navegación para regresar
      **/
    	const routerBack = () => {
    		navigate(`/recycler`, { replace: true });
    	};

    	let { typeHeader } = $$props;
    	let { returnPage } = $$props;
    	let img = "assets/img/user.png";
    	console.log(typeHeader);
    	const writable_props = ["typeHeader", "returnPage"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Header", $$slots, []);
    	const click_handler = () => routerRegister("login");
    	const click_handler_1 = () => routerRegister("register");
    	const click_handler_2 = () => routerRegister("recycler");

    	$$self.$set = $$props => {
    		if ("typeHeader" in $$props) $$invalidate(0, typeHeader = $$props.typeHeader);
    		if ("returnPage" in $$props) $$invalidate(1, returnPage = $$props.returnPage);
    	};

    	$$self.$capture_state = () => ({
    		navigate,
    		Button,
    		routerRegister,
    		routerBack,
    		typeHeader,
    		returnPage,
    		img
    	});

    	$$self.$inject_state = $$props => {
    		if ("typeHeader" in $$props) $$invalidate(0, typeHeader = $$props.typeHeader);
    		if ("returnPage" in $$props) $$invalidate(1, returnPage = $$props.returnPage);
    		if ("img" in $$props) img = $$props.img;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		typeHeader,
    		returnPage,
    		routerRegister,
    		routerBack,
    		img,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { typeHeader: 0, returnPage: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*typeHeader*/ ctx[0] === undefined && !("typeHeader" in props)) {
    			console_1.warn("<Header> was created without expected prop 'typeHeader'");
    		}

    		if (/*returnPage*/ ctx[1] === undefined && !("returnPage" in props)) {
    			console_1.warn("<Header> was created without expected prop 'returnPage'");
    		}
    	}

    	get typeHeader() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set typeHeader(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get returnPage() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set returnPage(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/mainPage/MainPage.svelte generated by Svelte v3.23.0 */
    const file$2 = "src/pages/mainPage/MainPage.svelte";

    function create_fragment$4(ctx) {
    	let main;
    	let video;
    	let video_src_value;
    	let t0;
    	let t1;
    	let div;
    	let p;
    	let t3;
    	let img;
    	let img_src_value;
    	let t4;
    	let h1;
    	let current;

    	const header = new Header({
    			props: { typeHeader: "login" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			video = element("video");
    			t0 = space();
    			create_component(header.$$.fragment);
    			t1 = space();
    			div = element("div");
    			p = element("p");
    			p.textContent = "Informate de nuestra iniciativa a continuación";
    			t3 = space();
    			img = element("img");
    			t4 = space();
    			h1 = element("h1");
    			h1.textContent = "Si tú cambias el mundo cambia";
    			video.autoplay = true;
    			attr_dev(video, "reload", "");
    			if (video.src !== (video_src_value = /*src*/ ctx[0])) attr_dev(video, "src", video_src_value);
    			attr_dev(video, "class", "svelte-11tbcrt");
    			add_location(video, file$2, 8, 0, 169);
    			attr_dev(p, "class", "svelte-11tbcrt");
    			add_location(p, file$2, 12, 2, 265);
    			if (img.src !== (img_src_value = /*srcIcon*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "iconImg svelte-11tbcrt");
    			attr_dev(img, "alt", "icono down");
    			add_location(img, file$2, 13, 1, 320);
    			attr_dev(h1, "class", "svelte-11tbcrt");
    			add_location(h1, file$2, 14, 1, 376);
    			attr_dev(div, "class", "flex svelte-11tbcrt");
    			add_location(div, file$2, 11, 2, 244);
    			attr_dev(main, "class", "svelte-11tbcrt");
    			add_location(main, file$2, 7, 0, 161);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, video);
    			append_dev(main, t0);
    			mount_component(header, main, null);
    			append_dev(main, t1);
    			append_dev(main, div);
    			append_dev(div, p);
    			append_dev(div, t3);
    			append_dev(div, img);
    			append_dev(div, t4);
    			append_dev(div, h1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*src*/ 1 && video.src !== (video_src_value = /*src*/ ctx[0])) {
    				attr_dev(video, "src", video_src_value);
    			}

    			if (!current || dirty & /*srcIcon*/ 2 && img.src !== (img_src_value = /*srcIcon*/ ctx[1])) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
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
    	let { src = "assets/video/main.mp4" } = $$props;
    	let { srcIcon = "assets/icon/down.svg" } = $$props;
    	const writable_props = ["src", "srcIcon"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MainPage> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("MainPage", $$slots, []);

    	$$self.$set = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("srcIcon" in $$props) $$invalidate(1, srcIcon = $$props.srcIcon);
    	};

    	$$self.$capture_state = () => ({ Header, src, srcIcon });

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("srcIcon" in $$props) $$invalidate(1, srcIcon = $$props.srcIcon);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [src, srcIcon];
    }

    class MainPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { src: 0, srcIcon: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MainPage",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get src() {
    		throw new Error("<MainPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<MainPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get srcIcon() {
    		throw new Error("<MainPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set srcIcon(value) {
    		throw new Error("<MainPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const notification = writable();

    /* Users/rmartinezvel/Desktop/codigo/glbal-hack/node_modules/@beyonk/svelte-notifications/src/Notifications.svelte generated by Svelte v3.23.0 */
    const file$3 = "Users/rmartinezvel/Desktop/codigo/glbal-hack/node_modules/@beyonk/svelte-notifications/src/Notifications.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (2:1) {#each toasts as toast (toast.id)}
    function create_each_block(key_1, ctx) {
    	let li;
    	let div0;
    	let t0_value = /*toast*/ ctx[8].msg + "";
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let li_outro;
    	let current;
    	let mounted;
    	let dispose;

    	function animationend_handler(...args) {
    		return /*animationend_handler*/ ctx[7](/*toast*/ ctx[8], ...args);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			t2 = space();
    			attr_dev(div0, "class", "content svelte-1ggskci");
    			add_location(div0, file$3, 3, 3, 135);
    			attr_dev(div1, "class", "progress svelte-1ggskci");
    			set_style(div1, "animation-duration", /*toast*/ ctx[8].timeout + "ms");
    			add_location(div1, file$3, 6, 3, 186);
    			attr_dev(li, "class", "toast svelte-1ggskci");
    			set_style(li, "background", /*toast*/ ctx[8].background);
    			add_location(li, file$3, 2, 2, 58);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, div0);
    			append_dev(div0, t0);
    			append_dev(li, t1);
    			append_dev(li, div1);
    			append_dev(li, t2);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "animationend", animationend_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*toasts*/ 1) && t0_value !== (t0_value = /*toast*/ ctx[8].msg + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*toasts*/ 1) {
    				set_style(div1, "animation-duration", /*toast*/ ctx[8].timeout + "ms");
    			}

    			if (!current || dirty & /*toasts*/ 1) {
    				set_style(li, "background", /*toast*/ ctx[8].background);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (li_outro) li_outro.end(1);
    			current = true;
    		},
    		o: function outro(local) {
    			li_outro = create_out_transition(li, animateOut, {});
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (detaching && li_outro) li_outro.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(2:1) {#each toasts as toast (toast.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*toasts*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*toast*/ ctx[8].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(ul, "class", "toasts svelte-1ggskci");
    			add_location(ul, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*toasts, removeToast*/ 3) {
    				const each_value = /*toasts*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, outro_and_destroy_block, create_each_block, null, get_each_context);
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
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
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

    function animateOut(node, { delay = 0, duration = 300 }) {

    	return {
    		delay,
    		duration,
    		css: t => `opacity: ${(t - 0.5) * 1}; transform-origin: top right; transform: scaleX(${(t - 0.5) * 1});`
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { themes = {
    		danger: "#bb2124",
    		success: "#22bb33",
    		warning: "#f0ad4e",
    		info: "#5bc0de",
    		default: "#aaaaaa"
    	} } = $$props;

    	let { timeout = 3000 } = $$props;
    	let count = 0;
    	let toasts = [];
    	let unsubscribe;

    	function createToast(msg, theme, to) {
    		const background = themes[theme] || themes["default"];

    		$$invalidate(0, toasts = [
    			{
    				id: count,
    				msg,
    				background,
    				timeout: to || timeout,
    				width: "100%"
    			},
    			...toasts
    		]);

    		count = count + 1;
    	}

    	unsubscribe = notification.subscribe(value => {
    		if (!value) {
    			return;
    		}

    		createToast(value.message, value.type, value.timeout);
    		notification.set();
    	});

    	onDestroy(unsubscribe);

    	function removeToast(id) {
    		$$invalidate(0, toasts = toasts.filter(t => t.id != id));
    	}

    	const writable_props = ["themes", "timeout"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Notifications> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Notifications", $$slots, []);
    	const animationend_handler = toast => removeToast(toast.id);

    	$$self.$set = $$props => {
    		if ("themes" in $$props) $$invalidate(2, themes = $$props.themes);
    		if ("timeout" in $$props) $$invalidate(3, timeout = $$props.timeout);
    	};

    	$$self.$capture_state = () => ({
    		notification,
    		onMount,
    		onDestroy,
    		themes,
    		timeout,
    		count,
    		toasts,
    		unsubscribe,
    		animateOut,
    		createToast,
    		removeToast
    	});

    	$$self.$inject_state = $$props => {
    		if ("themes" in $$props) $$invalidate(2, themes = $$props.themes);
    		if ("timeout" in $$props) $$invalidate(3, timeout = $$props.timeout);
    		if ("count" in $$props) count = $$props.count;
    		if ("toasts" in $$props) $$invalidate(0, toasts = $$props.toasts);
    		if ("unsubscribe" in $$props) unsubscribe = $$props.unsubscribe;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		toasts,
    		removeToast,
    		themes,
    		timeout,
    		count,
    		unsubscribe,
    		createToast,
    		animationend_handler
    	];
    }

    class Notifications extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { themes: 2, timeout: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Notifications",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get themes() {
    		throw new Error("<Notifications>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set themes(value) {
    		throw new Error("<Notifications>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get timeout() {
    		throw new Error("<Notifications>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set timeout(value) {
    		throw new Error("<Notifications>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function send (message, type = 'default', timeout) {
      notification.set({ type, message, timeout });
    }

    function danger (msg, timeout) {
      send(msg, 'danger', timeout);
    }

    function warning (msg, timeout) {
      send(msg, 'warning', timeout);
    }

    function info (msg, timeout) {
      send(msg, 'info', timeout);
    }

    function success (msg, timeout) {
      send(msg, 'success', timeout);
    }

    var notifier = /*#__PURE__*/Object.freeze({
        __proto__: null,
        send: send,
        danger: danger,
        warning: warning,
        info: info,
        success: success
    });

    /* src/pages/registerPage/RegisterPage.svelte generated by Svelte v3.23.0 */

    const { console: console_1$1 } = globals;
    const file$4 = "src/pages/registerPage/RegisterPage.svelte";

    function create_fragment$6(ctx) {
    	let main;
    	let t0;
    	let video;
    	let video_src_value;
    	let t1;
    	let div2;
    	let div1;
    	let h1;
    	let t3;
    	let form;
    	let input0;
    	let t4;
    	let input1;
    	let t5;
    	let input2;
    	let t6;
    	let div0;
    	let button0;
    	let t8;
    	let button1;
    	let current;
    	let mounted;
    	let dispose;

    	const notificationdisplay = new Notifications({
    			props: { themes: /*themes*/ ctx[6] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(notificationdisplay.$$.fragment);
    			t0 = space();
    			video = element("video");
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Si tú cambias el mundo cambia";
    			t3 = space();
    			form = element("form");
    			input0 = element("input");
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			input2 = element("input");
    			t6 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Regresar";
    			t8 = space();
    			button1 = element("button");
    			button1.textContent = "Registrar usuario";
    			video.autoplay = true;
    			attr_dev(video, "reload", "");
    			if (video.src !== (video_src_value = /*src*/ ctx[0])) attr_dev(video, "src", video_src_value);
    			attr_dev(video, "class", "svelte-1nolzo8");
    			add_location(video, file$4, 50, 0, 1093);
    			attr_dev(h1, "class", "svelte-1nolzo8");
    			add_location(h1, file$4, 54, 1, 1182);
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "class", "form-control input svelte-1nolzo8");
    			attr_dev(input0, "placeholder", "correo");
    			attr_dev(input0, "aria-label", "email");
    			attr_dev(input0, "aria-describedby", "basic-addon1");
    			input0.required = true;
    			add_location(input0, file$4, 56, 4, 1299);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "class", "form-control input svelte-1nolzo8");
    			attr_dev(input1, "placeholder", "Télefono");
    			attr_dev(input1, "aria-label", "phone");
    			attr_dev(input1, "aria-describedby", "basic-addon1");
    			input1.required = true;
    			attr_dev(input1, "minlength", "9");
    			add_location(input1, file$4, 57, 2, 1449);
    			attr_dev(input2, "type", "password");
    			attr_dev(input2, "class", "form-control input svelte-1nolzo8");
    			attr_dev(input2, "placeholder", "Contraseña");
    			attr_dev(input2, "aria-label", "password");
    			attr_dev(input2, "aria-describedby", "basic-addon1");
    			input2.required = true;
    			add_location(input2, file$4, 58, 2, 1615);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-outline-light btn-item svelte-1nolzo8");
    			add_location(button0, file$4, 61, 3, 1814);
    			attr_dev(button1, "type", "submit");
    			attr_dev(button1, "class", "btn btn-outline-light btn-item svelte-1nolzo8");
    			add_location(button1, file$4, 62, 3, 1918);
    			attr_dev(div0, "class", "content-button svelte-1nolzo8");
    			add_location(div0, file$4, 60, 3, 1782);
    			attr_dev(form, "class", "content-input svelte-1nolzo8");
    			add_location(form, file$4, 55, 4, 1226);
    			attr_dev(div1, "class", "content-item svelte-1nolzo8");
    			add_location(div1, file$4, 53, 0, 1154);
    			attr_dev(div2, "class", "flex svelte-1nolzo8");
    			add_location(div2, file$4, 52, 0, 1135);
    			attr_dev(main, "class", "svelte-1nolzo8");
    			add_location(main, file$4, 48, 0, 1053);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(notificationdisplay, main, null);
    			append_dev(main, t0);
    			append_dev(main, video);
    			append_dev(main, t1);
    			append_dev(main, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t3);
    			append_dev(div1, form);
    			append_dev(form, input0);
    			set_input_value(input0, /*email*/ ctx[1]);
    			append_dev(form, t4);
    			append_dev(form, input1);
    			set_input_value(input1, /*number*/ ctx[2]);
    			append_dev(form, t5);
    			append_dev(form, input2);
    			set_input_value(input2, /*password*/ ctx[3]);
    			append_dev(form, t6);
    			append_dev(form, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t8);
    			append_dev(div0, button1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[7]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[8]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[9]),
    					listen_dev(button0, "click", /*routerMain*/ ctx[4], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*sendRegister*/ ctx[5]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*src*/ 1 && video.src !== (video_src_value = /*src*/ ctx[0])) {
    				attr_dev(video, "src", video_src_value);
    			}

    			if (dirty & /*email*/ 2 && input0.value !== /*email*/ ctx[1]) {
    				set_input_value(input0, /*email*/ ctx[1]);
    			}

    			if (dirty & /*number*/ 4 && to_number(input1.value) !== /*number*/ ctx[2]) {
    				set_input_value(input1, /*number*/ ctx[2]);
    			}

    			if (dirty & /*password*/ 8 && input2.value !== /*password*/ ctx[3]) {
    				set_input_value(input2, /*password*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notificationdisplay.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notificationdisplay.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(notificationdisplay);
    			mounted = false;
    			run_all(dispose);
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
    	let { src = "assets/video/main.mp4" } = $$props;

    	/**
       * @author Raphael Martinez
       * @description handler de navegación para registro del usuario
      **/
    	const routerMain = () => {
    		navigate("/", { replace: true });
    	};

    	/**
     * @author Raphael Martinez 
     * @description handler encargado de guardar el registro del usuario
     **/
    	const sendRegister = async () => {
    		await fetch("http://192.168.1.3:8080/api/register", {
    			method: "POST",
    			body: JSON.stringify({
    				email,
    				"telefono": number,
    				"clave": password,
    				"rol": "disponedor"
    			})
    		}).then(response => {
    			success("Usuario registrado correctamente");

    			setTimeout(
    				() => {
    					navigate("/", { replace: true });
    				},
    				3000
    			);
    		}).catch(err => {
    			console.log(err);
    		});
    	};

    	let email = null;
    	let number = null;
    	let password = null;
    	let themes = { success: "#28a74559" };
    	const writable_props = ["src"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<RegisterPage> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("RegisterPage", $$slots, []);

    	function input0_input_handler() {
    		email = this.value;
    		$$invalidate(1, email);
    	}

    	function input1_input_handler() {
    		number = to_number(this.value);
    		$$invalidate(2, number);
    	}

    	function input2_input_handler() {
    		password = this.value;
    		$$invalidate(3, password);
    	}

    	$$self.$set = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    	};

    	$$self.$capture_state = () => ({
    		navigate,
    		NotificationDisplay: Notifications,
    		notifier,
    		src,
    		routerMain,
    		sendRegister,
    		email,
    		number,
    		password,
    		themes
    	});

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("email" in $$props) $$invalidate(1, email = $$props.email);
    		if ("number" in $$props) $$invalidate(2, number = $$props.number);
    		if ("password" in $$props) $$invalidate(3, password = $$props.password);
    		if ("themes" in $$props) $$invalidate(6, themes = $$props.themes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		src,
    		email,
    		number,
    		password,
    		routerMain,
    		sendRegister,
    		themes,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class RegisterPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { src: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RegisterPage",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get src() {
    		throw new Error("<RegisterPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<RegisterPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/loginPage/LoginPage.svelte generated by Svelte v3.23.0 */

    const { console: console_1$2 } = globals;
    const file$5 = "src/pages/loginPage/LoginPage.svelte";

    function create_fragment$7(ctx) {
    	let main;
    	let t0;
    	let video;
    	let video_src_value;
    	let t1;
    	let div2;
    	let div1;
    	let h1;
    	let t3;
    	let form;
    	let input0;
    	let t4;
    	let input1;
    	let t5;
    	let div0;
    	let button0;
    	let t7;
    	let button1;
    	let current;
    	let mounted;
    	let dispose;
    	const notificationdisplay = new Notifications({ $$inline: true });

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(notificationdisplay.$$.fragment);
    			t0 = space();
    			video = element("video");
    			t1 = space();
    			div2 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Si tú cambias el mundo cambia";
    			t3 = space();
    			form = element("form");
    			input0 = element("input");
    			t4 = space();
    			input1 = element("input");
    			t5 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Regresar";
    			t7 = space();
    			button1 = element("button");
    			button1.textContent = "Iniciar sesión";
    			video.autoplay = true;
    			attr_dev(video, "reload", "");
    			if (video.src !== (video_src_value = /*src*/ ctx[0])) attr_dev(video, "src", video_src_value);
    			attr_dev(video, "class", "svelte-ccrr3z");
    			add_location(video, file$5, 51, 0, 1294);
    			attr_dev(h1, "class", "svelte-ccrr3z");
    			add_location(h1, file$5, 55, 1, 1383);
    			attr_dev(input0, "type", "email");
    			attr_dev(input0, "class", "form-control input svelte-ccrr3z");
    			attr_dev(input0, "placeholder", "correo");
    			attr_dev(input0, "aria-label", "email");
    			attr_dev(input0, "aria-describedby", "basic-addon1");
    			add_location(input0, file$5, 57, 4, 1498);
    			attr_dev(input1, "type", "password");
    			attr_dev(input1, "class", "form-control input svelte-ccrr3z");
    			attr_dev(input1, "placeholder", "Contraseña");
    			attr_dev(input1, "aria-label", "password");
    			attr_dev(input1, "aria-describedby", "basic-addon1");
    			add_location(input1, file$5, 58, 1, 1638);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-outline-light btn-item svelte-ccrr3z");
    			add_location(button0, file$5, 61, 3, 1828);
    			attr_dev(button1, "type", "submit");
    			attr_dev(button1, "class", "btn btn-outline-light btn-item svelte-ccrr3z");
    			add_location(button1, file$5, 62, 3, 1932);
    			attr_dev(div0, "class", "content-button svelte-ccrr3z");
    			add_location(div0, file$5, 60, 3, 1796);
    			attr_dev(form, "class", "content-input svelte-ccrr3z");
    			add_location(form, file$5, 56, 4, 1427);
    			attr_dev(div1, "class", "content-item svelte-ccrr3z");
    			add_location(div1, file$5, 54, 0, 1355);
    			attr_dev(div2, "class", "flex svelte-ccrr3z");
    			add_location(div2, file$5, 53, 0, 1336);
    			attr_dev(main, "class", "svelte-ccrr3z");
    			add_location(main, file$5, 49, 0, 1262);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(notificationdisplay, main, null);
    			append_dev(main, t0);
    			append_dev(main, video);
    			append_dev(main, t1);
    			append_dev(main, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t3);
    			append_dev(div1, form);
    			append_dev(form, input0);
    			set_input_value(input0, /*email*/ ctx[1]);
    			append_dev(form, t4);
    			append_dev(form, input1);
    			set_input_value(input1, /*password*/ ctx[2]);
    			append_dev(form, t5);
    			append_dev(form, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t7);
    			append_dev(div0, button1);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[5]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[6]),
    					listen_dev(button0, "click", /*routerMain*/ ctx[3], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*sendLogin*/ ctx[4]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*src*/ 1 && video.src !== (video_src_value = /*src*/ ctx[0])) {
    				attr_dev(video, "src", video_src_value);
    			}

    			if (dirty & /*email*/ 2 && input0.value !== /*email*/ ctx[1]) {
    				set_input_value(input0, /*email*/ ctx[1]);
    			}

    			if (dirty & /*password*/ 4 && input1.value !== /*password*/ ctx[2]) {
    				set_input_value(input1, /*password*/ ctx[2]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notificationdisplay.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notificationdisplay.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(notificationdisplay);
    			mounted = false;
    			run_all(dispose);
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
    	let { src = "assets/video/main.mp4" } = $$props;

    	/**
       * @author Raphael Martinez
       * @description handler de navegación para registro del usuario
      **/
    	const routerMain = () => {
    		navigate("/", { replace: true });
    	};

    	/**
     *@author Raphael Martinez
     *@description handler para validar autenticación de lógin
     **/
    	const sendLogin = async () => {
    		localStorage.setItem("recycler", "error");
    		let response = { email, clave: password };

    		await fetch("http://192.168.1.3:8080/api/login", {
    			method: "POST",
    			body: JSON.stringify(response)
    		}).then(ifoUser => {
    			return ifoUser.json();
    		}).then(content => {
    			console.log(content);
    			localStorage.setItem("user", content.responseContent);
    			success("Bienvenido");

    			setTimeout(
    				() => {
    					console.log(content, content.responseContent);
    					if (content.responseContent.rol === "disponedor") navigate("/recycler", { replace: true }); else navigate("/admin", { replace: true });
    				},
    				3000
    			);
    		}).catch(err => {
    			console.log(err);
    		});
    	};

    	let email = null;
    	let password = null;
    	const writable_props = ["src"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<LoginPage> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("LoginPage", $$slots, []);

    	function input0_input_handler() {
    		email = this.value;
    		$$invalidate(1, email);
    	}

    	function input1_input_handler() {
    		password = this.value;
    		$$invalidate(2, password);
    	}

    	$$self.$set = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    	};

    	$$self.$capture_state = () => ({
    		navigate,
    		NotificationDisplay: Notifications,
    		notifier,
    		src,
    		routerMain,
    		sendLogin,
    		email,
    		password
    	});

    	$$self.$inject_state = $$props => {
    		if ("src" in $$props) $$invalidate(0, src = $$props.src);
    		if ("email" in $$props) $$invalidate(1, email = $$props.email);
    		if ("password" in $$props) $$invalidate(2, password = $$props.password);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		src,
    		email,
    		password,
    		routerMain,
    		sendLogin,
    		input0_input_handler,
    		input1_input_handler
    	];
    }

    class LoginPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { src: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LoginPage",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get src() {
    		throw new Error("<LoginPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set src(value) {
    		throw new Error("<LoginPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/disponserPage/DisponserPage.svelte generated by Svelte v3.23.0 */
    const file$6 = "src/pages/disponserPage/DisponserPage.svelte";

    // (22:0) {#if recycler == "error"}
    function create_if_block_1$3(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*mainImg*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "contentImg svelte-kvspvv");
    			attr_dev(img, "alt", "img");
    			add_location(img, file$6, 22, 0, 616);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(22:0) {#if recycler == \\\"error\\\"}",
    		ctx
    	});

    	return block;
    }

    // (25:0) {#if recycler == "good"}
    function create_if_block$3(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*recyclerImg*/ ctx[4])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "contentImg svelte-kvspvv");
    			attr_dev(img, "alt", "img");
    			add_location(img, file$6, 25, 0, 697);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(25:0) {#if recycler == \\\"good\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let main;
    	let t0;
    	let t1;
    	let t2;
    	let div6;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t3;
    	let div0;
    	let h10;
    	let t5;
    	let button0;
    	let t7;
    	let div3;
    	let img1;
    	let img1_src_value;
    	let t8;
    	let div2;
    	let h11;
    	let t10;
    	let button1;
    	let t12;
    	let div5;
    	let img2;
    	let img2_src_value;
    	let t13;
    	let div4;
    	let h12;
    	let t15;
    	let button2;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*recycler*/ ctx[5] == "error" && create_if_block_1$3(ctx);
    	let if_block1 = /*recycler*/ ctx[5] == "good" && create_if_block$3(ctx);

    	const header = new Header({
    			props: { typeHeader: "general" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			create_component(header.$$.fragment);
    			t2 = space();
    			div6 = element("div");
    			div1 = element("div");
    			img0 = element("img");
    			t3 = space();
    			div0 = element("div");
    			h10 = element("h1");
    			h10.textContent = "Quieres reciclar cartón o pàpel";
    			t5 = space();
    			button0 = element("button");
    			button0.textContent = "IR";
    			t7 = space();
    			div3 = element("div");
    			img1 = element("img");
    			t8 = space();
    			div2 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Quieres reciclar plastico o latas";
    			t10 = space();
    			button1 = element("button");
    			button1.textContent = "IR";
    			t12 = space();
    			div5 = element("div");
    			img2 = element("img");
    			t13 = space();
    			div4 = element("div");
    			h12 = element("h1");
    			h12.textContent = "Quieres reciclar elementos electrónicos";
    			t15 = space();
    			button2 = element("button");
    			button2.textContent = "IR";
    			if (img0.src !== (img0_src_value = /*cajas*/ ctx[0])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "class", "img-content svelte-kvspvv");
    			attr_dev(img0, "alt", "cajas");
    			add_location(img0, file$6, 31, 1, 841);
    			attr_dev(h10, "class", "svelte-kvspvv");
    			add_location(h10, file$6, 33, 1, 923);
    			attr_dev(button0, "type", "");
    			attr_dev(button0, "class", "btn btn-outline-light btn-item btn-disponser svelte-kvspvv");
    			add_location(button0, file$6, 34, 1, 965);
    			attr_dev(div0, "class", "element-content svelte-kvspvv");
    			add_location(div0, file$6, 32, 1, 892);
    			attr_dev(div1, "class", "content-img svelte-kvspvv");
    			add_location(div1, file$6, 30, 1, 814);
    			if (img1.src !== (img1_src_value = /*celulares*/ ctx[2])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "class", "img-content svelte-kvspvv");
    			attr_dev(img1, "alt", "latas");
    			add_location(img1, file$6, 38, 1, 1134);
    			attr_dev(h11, "class", "svelte-kvspvv");
    			add_location(h11, file$6, 40, 1, 1220);
    			attr_dev(button1, "type", "");
    			attr_dev(button1, "class", "btn btn-outline-light btn-item btn-disponser svelte-kvspvv");
    			add_location(button1, file$6, 41, 1, 1264);
    			attr_dev(div2, "class", "element-content svelte-kvspvv");
    			add_location(div2, file$6, 39, 1, 1189);
    			attr_dev(div3, "class", "content-img svelte-kvspvv");
    			add_location(div3, file$6, 37, 1, 1107);
    			if (img2.src !== (img2_src_value = /*latas*/ ctx[1])) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "class", "img-content svelte-kvspvv");
    			attr_dev(img2, "alt", "latas");
    			add_location(img2, file$6, 45, 1, 1433);
    			attr_dev(h12, "class", "svelte-kvspvv");
    			add_location(h12, file$6, 47, 1, 1515);
    			attr_dev(button2, "type", "");
    			attr_dev(button2, "class", "btn btn-outline-light btn-item btn-disponser svelte-kvspvv");
    			add_location(button2, file$6, 48, 1, 1565);
    			attr_dev(div4, "class", "element-content svelte-kvspvv");
    			add_location(div4, file$6, 46, 1, 1484);
    			attr_dev(div5, "class", "content-img svelte-kvspvv");
    			add_location(div5, file$6, 44, 2, 1406);
    			attr_dev(div6, "class", "content svelte-kvspvv");
    			add_location(div6, file$6, 29, 0, 791);
    			attr_dev(main, "class", "svelte-kvspvv");
    			add_location(main, file$6, 20, 0, 581);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t0);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t1);
    			mount_component(header, main, null);
    			append_dev(main, t2);
    			append_dev(main, div6);
    			append_dev(div6, div1);
    			append_dev(div1, img0);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, h10);
    			append_dev(div0, t5);
    			append_dev(div0, button0);
    			append_dev(div6, t7);
    			append_dev(div6, div3);
    			append_dev(div3, img1);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			append_dev(div2, h11);
    			append_dev(div2, t10);
    			append_dev(div2, button1);
    			append_dev(div6, t12);
    			append_dev(div6, div5);
    			append_dev(div5, img2);
    			append_dev(div5, t13);
    			append_dev(div5, div4);
    			append_dev(div4, h12);
    			append_dev(div4, t15);
    			append_dev(div4, button2);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[7], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[8], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*recycler*/ ctx[5] == "error") if_block0.p(ctx, dirty);
    			if (/*recycler*/ ctx[5] == "good") if_block1.p(ctx, dirty);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(header);
    			mounted = false;
    			run_all(dispose);
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
    	let cajas = "assets/img/caja-01.png";
    	let latas = "assets/img/cel-01.png";
    	let celulares = "assets/img/latas-01.png";
    	let mainImg = "assets/img/person.jpg";
    	let recyclerImg = "assets/img/init.jpg";
    	let recycler = localStorage.getItem("recycler");

    	/**
     * @author Raphael Martinez
     * @description handler de navegación para recycler
    **/
    	const routerIniciative = type => {
    		localStorage.setItem("type", type);
    		navigate(`/iniciative`, { replace: true });
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<DisponserPage> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("DisponserPage", $$slots, []);
    	const click_handler = () => routerIniciative("carton");
    	const click_handler_1 = () => routerIniciative("latas");
    	const click_handler_2 = () => routerIniciative("celulares");

    	$$self.$capture_state = () => ({
    		Header,
    		navigate,
    		cajas,
    		latas,
    		celulares,
    		mainImg,
    		recyclerImg,
    		recycler,
    		routerIniciative
    	});

    	$$self.$inject_state = $$props => {
    		if ("cajas" in $$props) $$invalidate(0, cajas = $$props.cajas);
    		if ("latas" in $$props) $$invalidate(1, latas = $$props.latas);
    		if ("celulares" in $$props) $$invalidate(2, celulares = $$props.celulares);
    		if ("mainImg" in $$props) $$invalidate(3, mainImg = $$props.mainImg);
    		if ("recyclerImg" in $$props) $$invalidate(4, recyclerImg = $$props.recyclerImg);
    		if ("recycler" in $$props) $$invalidate(5, recycler = $$props.recycler);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		cajas,
    		latas,
    		celulares,
    		mainImg,
    		recyclerImg,
    		recycler,
    		routerIniciative,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class DisponserPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "DisponserPage",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/pages/iniciativePage/IniciativePage.svelte generated by Svelte v3.23.0 */

    const { console: console_1$3 } = globals;
    const file$7 = "src/pages/iniciativePage/IniciativePage.svelte";

    // (79:0) {#if recycler == "error"}
    function create_if_block_4(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*mainImg*/ ctx[6])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "contentImg svelte-16zgwqg");
    			attr_dev(img, "alt", "img");
    			add_location(img, file$7, 79, 0, 2177);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(79:0) {#if recycler == \\\"error\\\"}",
    		ctx
    	});

    	return block;
    }

    // (82:0) {#if recycler=="good"}
    function create_if_block_3$1(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*recyclerImg*/ ctx[7])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "contentImg svelte-16zgwqg");
    			attr_dev(img, "alt", "img");
    			add_location(img, file$7, 82, 0, 2256);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(82:0) {#if recycler==\\\"good\\\"}",
    		ctx
    	});

    	return block;
    }

    // (88:0) {#if type == "carton"}
    function create_if_block_2$2(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*cajas*/ ctx[3])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "img-content svelte-16zgwqg");
    			attr_dev(img, "alt", "cajas");
    			add_location(img, file$7, 88, 0, 2438);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(88:0) {#if type == \\\"carton\\\"}",
    		ctx
    	});

    	return block;
    }

    // (91:0) {#if type == "latas"}
    function create_if_block_1$4(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*latas*/ ctx[4])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "img-content svelte-16zgwqg");
    			attr_dev(img, "alt", "latas");
    			add_location(img, file$7, 91, 0, 2516);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(91:0) {#if type == \\\"latas\\\"}",
    		ctx
    	});

    	return block;
    }

    // (94:0) {#if type == "celulares"}
    function create_if_block$4(ctx) {
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*celulares*/ ctx[5])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "img-content svelte-16zgwqg");
    			attr_dev(img, "alt", "celulares");
    			add_location(img, file$7, 94, 0, 2598);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(94:0) {#if type == \\\"celulares\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let main;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let div2;
    	let div0;
    	let t4;
    	let t5;
    	let t6;
    	let div1;
    	let p;
    	let t8;
    	let iframe;
    	let iframe_src_value;
    	let t9;
    	let h10;
    	let t11;
    	let div6;
    	let div3;
    	let h11;
    	let t13;
    	let div5;
    	let div4;
    	let t14;
    	let div9;
    	let div7;
    	let textarea;
    	let t15;
    	let div8;
    	let h12;
    	let t17;
    	let div12;
    	let div10;
    	let h13;
    	let t19;
    	let div11;
    	let button;
    	let current;
    	let mounted;
    	let dispose;

    	const notificationdisplay = new Notifications({
    			props: { themes: /*themes*/ ctx[9] },
    			$$inline: true
    		});

    	let if_block0 = /*recycler*/ ctx[8] == "error" && create_if_block_4(ctx);
    	let if_block1 = /*recycler*/ ctx[8] == "good" && create_if_block_3$1(ctx);

    	const header = new Header({
    			props: { typeHeader: "general", returnPage: true },
    			$$inline: true
    		});

    	let if_block2 = /*type*/ ctx[10] == "carton" && create_if_block_2$2(ctx);
    	let if_block3 = /*type*/ ctx[10] == "latas" && create_if_block_1$4(ctx);
    	let if_block4 = /*type*/ ctx[10] == "celulares" && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(notificationdisplay.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			create_component(header.$$.fragment);
    			t3 = space();
    			div2 = element("div");
    			div0 = element("div");
    			if (if_block2) if_block2.c();
    			t4 = space();
    			if (if_block3) if_block3.c();
    			t5 = space();
    			if (if_block4) if_block4.c();
    			t6 = space();
    			div1 = element("div");
    			p = element("p");
    			p.textContent = "Quieres preguntar como salvar al mundo o programa que vayan a tú casa a recoger tu reciclaje en la parte inferior";
    			t8 = space();
    			iframe = element("iframe");
    			t9 = space();
    			h10 = element("h1");
    			h10.textContent = "Registra tú punto, para recoger";
    			t11 = space();
    			div6 = element("div");
    			div3 = element("div");
    			h11 = element("h1");
    			h11.textContent = "Paso 1  Registra tú ubicación";
    			t13 = space();
    			div5 = element("div");
    			div4 = element("div");
    			t14 = space();
    			div9 = element("div");
    			div7 = element("div");
    			textarea = element("textarea");
    			t15 = space();
    			div8 = element("div");
    			h12 = element("h1");
    			h12.textContent = "Paso 2  Agrega una descripción de la ubicación";
    			t17 = space();
    			div12 = element("div");
    			div10 = element("div");
    			h13 = element("h1");
    			h13.textContent = "Paso 3  Por último envía el formulario.Fácil, simple y sencillo";
    			t19 = space();
    			div11 = element("div");
    			button = element("button");
    			button.textContent = "Enviar respuesta";
    			attr_dev(div0, "class", "content-img svelte-16zgwqg");
    			add_location(div0, file$7, 86, 0, 2389);
    			attr_dev(p, "class", "center svelte-16zgwqg");
    			add_location(p, file$7, 98, 0, 2695);
    			attr_dev(iframe, "class", "iframe svelte-16zgwqg");
    			if (iframe.src !== (iframe_src_value = "https://web-chat.global.assistant.watson.cloud.ibm.com/preview.html?region=us-south&integrationID=8dd00977-e13d-4bec-9d10-bcbef1e34444&serviceInstanceID=0a368225-b774-4ce6-b3f7-b0c83c1af98b")) attr_dev(iframe, "src", iframe_src_value);
    			attr_dev(iframe, "title", "watson");
    			add_location(iframe, file$7, 99, 0, 2832);
    			attr_dev(div1, "class", "content-img svelte-16zgwqg");
    			add_location(div1, file$7, 97, 0, 2669);
    			attr_dev(div2, "class", "content svelte-16zgwqg");
    			add_location(div2, file$7, 85, 0, 2367);
    			attr_dev(h10, "class", "svelte-16zgwqg");
    			add_location(h10, file$7, 102, 1, 3085);
    			attr_dev(h11, "class", "svelte-16zgwqg");
    			add_location(h11, file$7, 105, 0, 3199);
    			attr_dev(div3, "class", "content-img svelte-16zgwqg");
    			add_location(div3, file$7, 104, 1, 3173);
    			attr_dev(div4, "class", "full-screen svelte-16zgwqg");
    			add_location(div4, file$7, 108, 0, 3271);
    			attr_dev(div5, "class", "content-img svelte-16zgwqg");
    			add_location(div5, file$7, 107, 0, 3245);
    			attr_dev(div6, "class", "content minimal-content black svelte-16zgwqg");
    			add_location(div6, file$7, 103, 1, 3128);
    			attr_dev(textarea, "class", "form-control second-color svelte-16zgwqg");
    			attr_dev(textarea, "id", "exampleFormControlTextarea1");
    			attr_dev(textarea, "rows", "3");
    			attr_dev(textarea, "placeholder", "Por ejemplo: Mi casa queda al lado de la estación de policia");
    			add_location(textarea, file$7, 114, 2, 3414);
    			attr_dev(div7, "class", "content-img svelte-16zgwqg");
    			add_location(div7, file$7, 113, 0, 3386);
    			attr_dev(h12, "class", "svelte-16zgwqg");
    			add_location(h12, file$7, 118, 0, 3643);
    			attr_dev(div8, "class", "content-img svelte-16zgwqg");
    			add_location(div8, file$7, 117, 0, 3617);
    			attr_dev(div9, "class", "content minimal-content black svelte-16zgwqg");
    			add_location(div9, file$7, 111, 1, 3340);
    			attr_dev(h13, "class", "svelte-16zgwqg");
    			add_location(h13, file$7, 125, 0, 3787);
    			attr_dev(div10, "class", "content-img svelte-16zgwqg");
    			add_location(div10, file$7, 124, 0, 3761);
    			attr_dev(button, "type", "");
    			attr_dev(button, "class", "btn btn-outline-light btn-item button-minimal svelte-16zgwqg");
    			add_location(button, file$7, 128, 0, 3893);
    			attr_dev(div11, "class", "content-img svelte-16zgwqg");
    			add_location(div11, file$7, 127, 0, 3867);
    			attr_dev(div12, "class", "content minimal-content black svelte-16zgwqg");
    			add_location(div12, file$7, 122, 1, 3715);
    			attr_dev(main, "class", "svelte-16zgwqg");
    			add_location(main, file$7, 76, 0, 2110);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(notificationdisplay, main, null);
    			append_dev(main, t0);
    			if (if_block0) if_block0.m(main, null);
    			append_dev(main, t1);
    			if (if_block1) if_block1.m(main, null);
    			append_dev(main, t2);
    			mount_component(header, main, null);
    			append_dev(main, t3);
    			append_dev(main, div2);
    			append_dev(div2, div0);
    			if (if_block2) if_block2.m(div0, null);
    			append_dev(div0, t4);
    			if (if_block3) if_block3.m(div0, null);
    			append_dev(div0, t5);
    			if (if_block4) if_block4.m(div0, null);
    			append_dev(div2, t6);
    			append_dev(div2, div1);
    			append_dev(div1, p);
    			append_dev(div1, t8);
    			append_dev(div1, iframe);
    			append_dev(main, t9);
    			append_dev(main, h10);
    			append_dev(main, t11);
    			append_dev(main, div6);
    			append_dev(div6, div3);
    			append_dev(div3, h11);
    			append_dev(div6, t13);
    			append_dev(div6, div5);
    			append_dev(div5, div4);
    			/*div4_binding*/ ctx[15](div4);
    			append_dev(main, t14);
    			append_dev(main, div9);
    			append_dev(div9, div7);
    			append_dev(div7, textarea);
    			set_input_value(textarea, /*textArea*/ ctx[1]);
    			append_dev(div9, t15);
    			append_dev(div9, div8);
    			append_dev(div8, h12);
    			append_dev(main, t17);
    			append_dev(main, div12);
    			append_dev(div12, div10);
    			append_dev(div10, h13);
    			append_dev(div12, t19);
    			append_dev(div12, div11);
    			append_dev(div11, button);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[16]),
    					listen_dev(button, "click", /*sendInfoUser*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*recycler*/ ctx[8] == "error") if_block0.p(ctx, dirty);
    			if (/*recycler*/ ctx[8] == "good") if_block1.p(ctx, dirty);
    			if (/*type*/ ctx[10] == "carton") if_block2.p(ctx, dirty);
    			if (/*type*/ ctx[10] == "latas") if_block3.p(ctx, dirty);
    			if (/*type*/ ctx[10] == "celulares") if_block4.p(ctx, dirty);

    			if (dirty & /*textArea*/ 2) {
    				set_input_value(textarea, /*textArea*/ ctx[1]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(notificationdisplay.$$.fragment, local);
    			transition_in(header.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(notificationdisplay.$$.fragment, local);
    			transition_out(header.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(notificationdisplay);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_component(header);
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			/*div4_binding*/ ctx[15](null);
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
    	onMount(async () => {
    		map = new google.maps.Map(container, { zoom, center });

    		map.addListener("click", function (mapsMouseEvent) {
    			marker = new google.maps.Marker({
    					position: mapsMouseEvent.latLng,
    					animation: google.maps.Animation.DROP,
    					icon: "http://maps.google.com/mapfiles/ms/micons/green-dot.png"
    				});

    			marker.setMap(map);
    			center = mapsMouseEvent.latLng.toString();
    		});
    	});

    	const sendInfoUser = async () => {
    		let date = new Date().toString();
    		console.log(localStorage.getItem("user").email);

    		let Response = {
    			"email": localStorage.getItem("user").email,
    			"user_id": "",
    			"latitud": center.split(",")[0].replace("(", "").replace(" ", ""),
    			"longitud": center.split(",")[1].replace("(", "").replace(" ", ""),
    			"fecha": date,
    			"descripcion": textArea
    		};

    		await fetch("http://192.168.1.3:8080/api/recycle", {
    			method: "POST",
    			body: JSON.stringify(Response)
    		}).then(response => {
    			localStorage.setItem("recycler", "good");
    			success("Pronto, nos podremos en contacto.Cambiaste al mundo");

    			setTimeout(
    				() => {
    					navigate("/recycler", { replace: true });
    				},
    				3000
    			);
    		}).catch(err => {
    			
    		});
    	};

    	let cajas = "assets/img/caja-01.png";
    	let latas = "assets/img/latas-01.png";
    	let celulares = "assets/img/cel-01.png";
    	let mainImg = "assets/img/person.jpg";
    	let recyclerImg = "assets/img/init.jpg";
    	let recycler = localStorage.getItem("recycler");
    	let container;
    	let marker;
    	let map;
    	let zoom = 12;

    	let center = {
    		lat: 4.638305561012602,
    		lng: -74.08649498920173
    	};

    	let textArea;
    	let themes = { success: "#28a74559" };
    	let type = localStorage.getItem("type");
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<IniciativePage> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("IniciativePage", $$slots, []);

    	function div4_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, container = $$value);
    		});
    	}

    	function textarea_input_handler() {
    		textArea = this.value;
    		$$invalidate(1, textArea);
    	}

    	$$self.$capture_state = () => ({
    		Header,
    		navigate,
    		NotificationDisplay: Notifications,
    		notifier,
    		onMount,
    		sendInfoUser,
    		cajas,
    		latas,
    		celulares,
    		mainImg,
    		recyclerImg,
    		recycler,
    		container,
    		marker,
    		map,
    		zoom,
    		center,
    		textArea,
    		themes,
    		type
    	});

    	$$self.$inject_state = $$props => {
    		if ("cajas" in $$props) $$invalidate(3, cajas = $$props.cajas);
    		if ("latas" in $$props) $$invalidate(4, latas = $$props.latas);
    		if ("celulares" in $$props) $$invalidate(5, celulares = $$props.celulares);
    		if ("mainImg" in $$props) $$invalidate(6, mainImg = $$props.mainImg);
    		if ("recyclerImg" in $$props) $$invalidate(7, recyclerImg = $$props.recyclerImg);
    		if ("recycler" in $$props) $$invalidate(8, recycler = $$props.recycler);
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("marker" in $$props) marker = $$props.marker;
    		if ("map" in $$props) map = $$props.map;
    		if ("zoom" in $$props) zoom = $$props.zoom;
    		if ("center" in $$props) center = $$props.center;
    		if ("textArea" in $$props) $$invalidate(1, textArea = $$props.textArea);
    		if ("themes" in $$props) $$invalidate(9, themes = $$props.themes);
    		if ("type" in $$props) $$invalidate(10, type = $$props.type);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		container,
    		textArea,
    		sendInfoUser,
    		cajas,
    		latas,
    		celulares,
    		mainImg,
    		recyclerImg,
    		recycler,
    		themes,
    		type,
    		marker,
    		map,
    		center,
    		zoom,
    		div4_binding,
    		textarea_input_handler
    	];
    }

    class IniciativePage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "IniciativePage",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    	  path: basedir,
    	  exports: {},
    	  require: function (path, base) {
          return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
        }
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var frappeCharts_min_cjs = createCommonjsModule(function (module, exports) {
    function styleInject(t,e){void 0===e&&(e={});var n=e.insertAt;if(t&&"undefined"!=typeof document){var i=document.head||document.getElementsByTagName("head")[0],a=document.createElement("style");a.type="text/css","top"===n&&i.firstChild?i.insertBefore(a,i.firstChild):i.appendChild(a),a.styleSheet?a.styleSheet.cssText=t:a.appendChild(document.createTextNode(t));}}function $(t,e){return "string"==typeof t?(e||document).querySelector(t):t||null}function getOffset(t){var e=t.getBoundingClientRect();return {top:e.top+(document.documentElement.scrollTop||document.body.scrollTop),left:e.left+(document.documentElement.scrollLeft||document.body.scrollLeft)}}function isElementInViewport(t){var e=t.getBoundingClientRect();return e.top>=0&&e.left>=0&&e.bottom<=(window.innerHeight||document.documentElement.clientHeight)&&e.right<=(window.innerWidth||document.documentElement.clientWidth)}function getElementContentWidth(t){var e=window.getComputedStyle(t),n=parseFloat(e.paddingLeft)+parseFloat(e.paddingRight);return t.clientWidth-n}function fire(t,e,n){var i=document.createEvent("HTMLEvents");i.initEvent(e,!0,!0);for(var a in n)i[a]=n[a];return t.dispatchEvent(i)}function getTopOffset(t){return t.titleHeight+t.margins.top+t.paddings.top}function getLeftOffset(t){return t.margins.left+t.paddings.left}function getExtraHeight(t){return t.margins.top+t.margins.bottom+t.paddings.top+t.paddings.bottom+t.titleHeight+t.legendHeight}function getExtraWidth(t){return t.margins.left+t.margins.right+t.paddings.left+t.paddings.right}function _classCallCheck$4(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function floatTwo(t){return parseFloat(t.toFixed(2))}function fillArray(t,e,n){var i=arguments.length>3&&void 0!==arguments[3]&&arguments[3];n||(n=i?t[0]:t[t.length-1]);var a=new Array(Math.abs(e)).fill(n);return t=i?a.concat(t):t.concat(a)}function getStringWidth(t,e){return (t+"").length*e}function getPositionByAngle(t,e){return {x:Math.sin(t*ANGLE_RATIO)*e,y:Math.cos(t*ANGLE_RATIO)*e}}function getBarHeightAndYAttr(t,e){var n=void 0,i=void 0;return t<=e?(n=e-t,i=t):(n=t-e,i=e),[n,i]}function equilizeNoOfElements(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:e.length-t.length;return n>0?t=fillArray(t,n):e=fillArray(e,n),[t,e]}function truncateString(t,e){if(t)return t.length>e?t.slice(0,e-3)+"...":t}function shortenLargeNumber(t){var e=void 0;if("number"==typeof t)e=t;else if("string"==typeof t&&(e=Number(t),Number.isNaN(e)))return t;var n=Math.floor(Math.log10(Math.abs(e)));if(n<=2)return e;var i=Math.floor(n/3),a=Math.pow(10,n-3*i)*+(e/Math.pow(10,n)).toFixed(1);return Math.round(100*a)/100+" "+["","K","M","B","T"][i]}function getSplineCurvePointsStr(t,e){for(var n=[],i=0;i<t.length;i++)n.push([t[i],e[i]]);var a=function(t,e){var n=e[0]-t[0],i=e[1]-t[1];return {length:Math.sqrt(Math.pow(n,2)+Math.pow(i,2)),angle:Math.atan2(i,n)}},r=function(t,e,n,i){var r=a(e||t,n||t),s=r.angle+(i?Math.PI:0),o=.2*r.length;return [t[0]+Math.cos(s)*o,t[1]+Math.sin(s)*o]};return function(t,e){return t.reduce(function(t,n,i,a){return 0===i?n[0]+","+n[1]:t+" "+e(n,i,a)},"")}(n,function(t,e,n){var i=r(n[e-1],n[e-2],t),a=r(t,n[e-1],n[e+1],!0);return "C "+i[0]+","+i[1]+" "+a[0]+","+a[1]+" "+t[0]+","+t[1]})}function limitColor(t){return t>255?255:t<0?0:t}function lightenDarkenColor(t,e){var n=getColor(t),i=!1;"#"==n[0]&&(n=n.slice(1),i=!0);var a=parseInt(n,16),r=limitColor((a>>16)+e),s=limitColor((a>>8&255)+e),o=limitColor((255&a)+e);return (i?"#":"")+(o|s<<8|r<<16).toString(16)}function isValidColor(t){var e=/(^\s*)(rgb|hsl)(a?)[(]\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*,\s*([\d.]+\s*%?)\s*(?:,\s*([\d.]+)\s*)?[)]$/i;return /(^\s*)(#)((?:[A-Fa-f0-9]{3}){1,2})$/i.test(t)||e.test(t)}function $$1(t,e){return "string"==typeof t?(e||document).querySelector(t):t||null}function createSVG(t,e){var n=document.createElementNS("http://www.w3.org/2000/svg",t);for(var i in e){var a=e[i];if("inside"===i)$$1(a).appendChild(n);else if("around"===i){var r=$$1(a);r.parentNode.insertBefore(n,r),n.appendChild(r);}else "styles"===i?"object"===(void 0===a?"undefined":_typeof$1(a))&&Object.keys(a).map(function(t){n.style[t]=a[t];}):("className"===i&&(i="class"),"innerHTML"===i?n.textContent=a:n.setAttribute(i,a));}return n}function renderVerticalGradient(t,e){return createSVG("linearGradient",{inside:t,id:e,x1:0,x2:0,y1:0,y2:1})}function setGradientStop(t,e,n,i){return createSVG("stop",{inside:t,style:"stop-color: "+n,offset:e,"stop-opacity":i})}function makeSVGContainer(t,e,n,i){return createSVG("svg",{className:e,inside:t,width:n,height:i})}function makeSVGDefs(t){return createSVG("defs",{inside:t})}function makeSVGGroup(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:void 0,i={className:t,transform:e};return n&&(i.inside=n),createSVG("g",i)}function makePath(t){return createSVG("path",{className:arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",d:t,styles:{stroke:arguments.length>2&&void 0!==arguments[2]?arguments[2]:"none",fill:arguments.length>3&&void 0!==arguments[3]?arguments[3]:"none","stroke-width":arguments.length>4&&void 0!==arguments[4]?arguments[4]:2}})}function makeArcPathStr(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:1,r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,s=n.x+t.x,o=n.y+t.y,l=n.x+e.x,u=n.y+e.y;return "M"+n.x+" "+n.y+"\n\t\tL"+s+" "+o+"\n\t\tA "+i+" "+i+" 0 "+r+" "+(a?1:0)+"\n\t\t"+l+" "+u+" z"}function makeCircleStr(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:1,r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,s=n.x+t.x,o=n.y+t.y,l=n.x+e.x,u=2*n.y,c=n.y+e.y;return "M"+n.x+" "+n.y+"\n\t\tL"+s+" "+o+"\n\t\tA "+i+" "+i+" 0 "+r+" "+(a?1:0)+"\n\t\t"+l+" "+u+" z\n\t\tL"+s+" "+u+"\n\t\tA "+i+" "+i+" 0 "+r+" "+(a?1:0)+"\n\t\t"+l+" "+c+" z"}function makeArcStrokePathStr(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:1,r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,s=n.x+t.x,o=n.y+t.y,l=n.x+e.x,u=n.y+e.y;return "M"+s+" "+o+"\n\t\tA "+i+" "+i+" 0 "+r+" "+(a?1:0)+"\n\t\t"+l+" "+u}function makeStrokeCircleStr(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:1,r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,s=n.x+t.x,o=n.y+t.y,l=n.x+e.x,u=2*i+o,c=n.y+t.y;return "M"+s+" "+o+"\n\t\tA "+i+" "+i+" 0 "+r+" "+(a?1:0)+"\n\t\t"+l+" "+u+"\n\t\tM"+s+" "+u+"\n\t\tA "+i+" "+i+" 0 "+r+" "+(a?1:0)+"\n\t\t"+l+" "+c}function makeGradient(t,e){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],i="path-fill-gradient-"+e+"-"+(n?"lighter":"default"),a=renderVerticalGradient(t,i),r=[1,.6,.2];return n&&(r=[.4,.2,0]),setGradientStop(a,"0%",e,r[0]),setGradientStop(a,"50%",e,r[1]),setGradientStop(a,"100%",e,r[2]),i}function percentageBar(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:PERCENTAGE_BAR_DEFAULT_DEPTH,r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:"none";return createSVG("rect",{className:"percentage-bar",x:t,y:e,width:n,height:i,fill:r,styles:{stroke:lightenDarkenColor(r,-25),"stroke-dasharray":"0, "+(i+n)+", "+n+", "+i,"stroke-width":a}})}function heatSquare(t,e,n,i,a){var r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:"none",s=arguments.length>6&&void 0!==arguments[6]?arguments[6]:{},o={className:t,x:e,y:n,width:i,height:i,rx:a,fill:r};return Object.keys(s).map(function(t){o[t]=s[t];}),createSVG("rect",o)}function legendBar(t,e,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"none",a=arguments[4];a=arguments.length>5&&void 0!==arguments[5]&&arguments[5]?truncateString(a,LABEL_MAX_CHARS):a;var r={className:"legend-bar",x:0,y:0,width:n,height:"2px",fill:i},s=createSVG("text",{className:"legend-dataset-text",x:0,y:0,dy:2*FONT_SIZE+"px","font-size":1.2*FONT_SIZE+"px","text-anchor":"start",fill:FONT_FILL,innerHTML:a}),o=createSVG("g",{transform:"translate("+t+", "+e+")"});return o.appendChild(createSVG("rect",r)),o.appendChild(s),o}function legendDot(t,e,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"none",a=arguments[4];a=arguments.length>5&&void 0!==arguments[5]&&arguments[5]?truncateString(a,LABEL_MAX_CHARS):a;var r={className:"legend-dot",cx:0,cy:0,r:n,fill:i},s=createSVG("text",{className:"legend-dataset-text",x:0,y:0,dx:FONT_SIZE+"px",dy:FONT_SIZE/3+"px","font-size":1.2*FONT_SIZE+"px","text-anchor":"start",fill:FONT_FILL,innerHTML:a}),o=createSVG("g",{transform:"translate("+t+", "+e+")"});return o.appendChild(createSVG("circle",r)),o.appendChild(s),o}function makeText(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{},r=a.fontSize||FONT_SIZE;return createSVG("text",{className:t,x:e,y:n,dy:(void 0!==a.dy?a.dy:r/2)+"px","font-size":r+"px",fill:a.fill||FONT_FILL,"text-anchor":a.textAnchor||"start",innerHTML:i})}function makeVertLine(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{};a.stroke||(a.stroke=BASE_LINE_COLOR);var r=createSVG("line",{className:"line-vertical "+a.className,x1:0,x2:0,y1:n,y2:i,styles:{stroke:a.stroke}}),s=createSVG("text",{x:0,y:n>i?n+LABEL_MARGIN:n-LABEL_MARGIN-FONT_SIZE,dy:FONT_SIZE+"px","font-size":FONT_SIZE+"px","text-anchor":"middle",innerHTML:e+""}),o=createSVG("g",{transform:"translate("+t+", 0)"});return o.appendChild(r),o.appendChild(s),o}function makeHoriLine(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{};a.stroke||(a.stroke=BASE_LINE_COLOR),a.lineType||(a.lineType=""),a.shortenNumbers&&(e=shortenLargeNumber(e));var r=createSVG("line",{className:"line-horizontal "+a.className+("dashed"===a.lineType?"dashed":""),x1:n,x2:i,y1:0,y2:0,styles:{stroke:a.stroke}}),s=createSVG("text",{x:n<i?n-LABEL_MARGIN:n+LABEL_MARGIN,y:0,dy:FONT_SIZE/2-2+"px","font-size":FONT_SIZE+"px","text-anchor":n<i?"end":"start",innerHTML:e+""}),o=createSVG("g",{transform:"translate(0, "+t+")","stroke-opacity":1});return 0!==s&&"0"!==s||(o.style.stroke="rgba(27, 31, 35, 0.6)"),o.appendChild(r),o.appendChild(s),o}function yLine(t,e,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};i.pos||(i.pos="left"),i.offset||(i.offset=0),i.mode||(i.mode="span"),i.stroke||(i.stroke=BASE_LINE_COLOR),i.className||(i.className="");var a=-1*AXIS_TICK_LENGTH,r="span"===i.mode?n+AXIS_TICK_LENGTH:0;return "tick"===i.mode&&"right"===i.pos&&(a=n+AXIS_TICK_LENGTH,r=n),a+=i.offset,r+=i.offset,makeHoriLine(t,e,a,r,{stroke:i.stroke,className:i.className,lineType:i.lineType,shortenNumbers:i.shortenNumbers})}function xLine(t,e,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};i.pos||(i.pos="bottom"),i.offset||(i.offset=0),i.mode||(i.mode="span"),i.stroke||(i.stroke=BASE_LINE_COLOR),i.className||(i.className="");var a=n+AXIS_TICK_LENGTH,r="span"===i.mode?-1*AXIS_TICK_LENGTH:n;return "tick"===i.mode&&"top"===i.pos&&(a=-1*AXIS_TICK_LENGTH,r=0),makeVertLine(t,e,a,r,{stroke:i.stroke,className:i.className,lineType:i.lineType})}function yMarker(t,e,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};i.labelPos||(i.labelPos="right");var a=createSVG("text",{className:"chart-label",x:"left"===i.labelPos?LABEL_MARGIN:n-getStringWidth(e,5)-LABEL_MARGIN,y:0,dy:FONT_SIZE/-2+"px","font-size":FONT_SIZE+"px","text-anchor":"start",innerHTML:e+""}),r=makeHoriLine(t,"",0,n,{stroke:i.stroke||BASE_LINE_COLOR,className:i.className||"",lineType:i.lineType});return r.appendChild(a),r}function yRegion(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{},r=t-e,s=createSVG("rect",{className:"bar mini",styles:{fill:"rgba(228, 234, 239, 0.49)",stroke:BASE_LINE_COLOR,"stroke-dasharray":n+", "+r},x:0,y:0,width:n,height:r});a.labelPos||(a.labelPos="right");var o=createSVG("text",{className:"chart-label",x:"left"===a.labelPos?LABEL_MARGIN:n-getStringWidth(i+"",4.5)-LABEL_MARGIN,y:0,dy:FONT_SIZE/-2+"px","font-size":FONT_SIZE+"px","text-anchor":"start",innerHTML:i+""}),l=createSVG("g",{transform:"translate(0, "+e+")"});return l.appendChild(s),l.appendChild(o),l}function datasetBar(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:"",r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,s=arguments.length>6&&void 0!==arguments[6]?arguments[6]:0,o=arguments.length>7&&void 0!==arguments[7]?arguments[7]:{},l=getBarHeightAndYAttr(e,o.zeroLine),u=_slicedToArray(l,2),c=u[0],h=u[1];h-=s,0===c&&(c=o.minHeight,h-=o.minHeight);var d=createSVG("rect",{className:"bar mini",style:"fill: "+i,"data-point-index":r,x:t,y:h,width:n,height:c});if((a+="")||a.length){d.setAttribute("y",0),d.setAttribute("x",0);var f=createSVG("text",{className:"data-point-value",x:n/2,y:0,dy:FONT_SIZE/2*-1+"px","font-size":FONT_SIZE+"px","text-anchor":"middle",innerHTML:a}),p=createSVG("g",{"data-point-index":r,transform:"translate("+t+", "+h+")"});return p.appendChild(d),p.appendChild(f),p}return d}function datasetDot(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:"",r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:0,s=createSVG("circle",{style:"fill: "+i,"data-point-index":r,cx:t,cy:e,r:n});if((a+="")||a.length){s.setAttribute("cy",0),s.setAttribute("cx",0);var o=createSVG("text",{className:"data-point-value",x:0,y:0,dy:FONT_SIZE/2*-1-n+"px","font-size":FONT_SIZE+"px","text-anchor":"middle",innerHTML:a}),l=createSVG("g",{"data-point-index":r,transform:"translate("+t+", "+e+")"});return l.appendChild(s),l.appendChild(o),l}return s}function getPaths(t,e,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{},a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:{},r=e.map(function(e,n){return t[n]+","+e}).join("L");i.spline&&(r=getSplineCurvePointsStr(t,e));var s=makePath("M"+r,"line-graph-path",n);if(i.heatline){var o=makeGradient(a.svgDefs,n);s.style.stroke="url(#"+o+")";}var l={path:s};if(i.regionFill){var u=makeGradient(a.svgDefs,n,!0),c="M"+t[0]+","+a.zeroLine+"L"+r+"L"+t.slice(-1)[0]+","+a.zeroLine;l.region=makePath(c,"region-fill","none","url(#"+u+")");}return l}function translate(t,e,n,i){var a="string"==typeof e?e:e.join(", ");return [t,{transform:n.join(", ")},i,STD_EASING,"translate",{transform:a}]}function translateVertLine(t,e,n){return translate(t,[n,0],[e,0],MARKER_LINE_ANIM_DUR)}function translateHoriLine(t,e,n){return translate(t,[0,n],[0,e],MARKER_LINE_ANIM_DUR)}function animateRegion(t,e,n,i){var a=e-n,r=t.childNodes[0];return [[r,{height:a,"stroke-dasharray":r.getAttribute("width")+", "+a},MARKER_LINE_ANIM_DUR,STD_EASING],translate(t,[0,i],[0,n],MARKER_LINE_ANIM_DUR)]}function animateBar(t,e,n,i){var a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:0,r=getBarHeightAndYAttr(n,(arguments.length>5&&void 0!==arguments[5]?arguments[5]:{}).zeroLine),s=_slicedToArray$2(r,2),o=s[0],l=s[1];return l-=a,"rect"!==t.nodeName?[[t.childNodes[0],{width:i,height:o},UNIT_ANIM_DUR,STD_EASING],translate(t,t.getAttribute("transform").split("(")[1].slice(0,-1),[e,l],MARKER_LINE_ANIM_DUR)]:[[t,{width:i,height:o,x:e,y:l},UNIT_ANIM_DUR,STD_EASING]]}function animateDot(t,e,n){return "circle"!==t.nodeName?[translate(t,t.getAttribute("transform").split("(")[1].slice(0,-1),[e,n],MARKER_LINE_ANIM_DUR)]:[[t,{cx:e,cy:n},UNIT_ANIM_DUR,STD_EASING]]}function animatePath(t,e,n,i,a){var r=[],s=n.map(function(t,n){return e[n]+","+t}).join("L");a&&(s=getSplineCurvePointsStr(e,n));var o=[t.path,{d:"M"+s},PATH_ANIM_DUR,STD_EASING];if(r.push(o),t.region){var l=e[0]+","+i+"L",u="L"+e.slice(-1)[0]+", "+i,c=[t.region,{d:"M"+l+s+u},PATH_ANIM_DUR,STD_EASING];r.push(c);}return r}function animatePathStr(t,e){return [t,{d:e},UNIT_ANIM_DUR,STD_EASING]}function _toConsumableArray$1(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function animateSVGElement(t,e,n){var i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:"linear",a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:void 0,r=arguments.length>5&&void 0!==arguments[5]?arguments[5]:{},s=t.cloneNode(!0),o=t.cloneNode(!0);for(var l in e){var u=void 0;u="transform"===l?document.createElementNS("http://www.w3.org/2000/svg","animateTransform"):document.createElementNS("http://www.w3.org/2000/svg","animate");var c=r[l]||t.getAttribute(l),h=e[l],d={attributeName:l,from:c,to:h,begin:"0s",dur:n/1e3+"s",values:c+";"+h,keySplines:EASING[i],keyTimes:"0;1",calcMode:"spline",fill:"freeze"};a&&(d.type=a);for(var f in d)u.setAttribute(f,d[f]);s.appendChild(u),a?o.setAttribute(l,"translate("+h+")"):o.setAttribute(l,h);}return [s,o]}function transform(t,e){t.style.transform=e,t.style.webkitTransform=e,t.style.msTransform=e,t.style.mozTransform=e,t.style.oTransform=e;}function animateSVG(t,e){var n=[],i=[];e.map(function(t){var e=t[0],a=e.parentNode,r=void 0,s=void 0;t[0]=e;var o=animateSVGElement.apply(void 0,_toConsumableArray$1(t)),l=_slicedToArray$1(o,2);r=l[0],s=l[1],n.push(s),i.push([r,a]),a.replaceChild(r,e);});var a=t.cloneNode(!0);return i.map(function(t,i){t[1].replaceChild(n[i],t[0]),e[i][0]=n[i];}),a}function runSMILAnimation(t,e,n){if(0!==n.length){var i=animateSVG(e,n);e.parentNode==t&&(t.removeChild(e),t.appendChild(i)),setTimeout(function(){i.parentNode==t&&(t.removeChild(i),t.appendChild(e));},REPLACE_ALL_NEW_DUR);}}function downloadFile(t,e){var n=document.createElement("a");n.style="display: none";var i=new Blob(e,{type:"image/svg+xml; charset=utf-8"}),a=window.URL.createObjectURL(i);n.href=a,n.download=t,document.body.appendChild(n),n.click(),setTimeout(function(){document.body.removeChild(n),window.URL.revokeObjectURL(a);},300);}function prepareForExport(t){var e=t.cloneNode(!0);e.classList.add("chart-container"),e.setAttribute("xmlns","http://www.w3.org/2000/svg"),e.setAttribute("xmlns:xlink","http://www.w3.org/1999/xlink");var n=$.create("style",{innerHTML:CSSTEXT});e.insertBefore(n,e.firstChild);var i=$.create("div");return i.appendChild(e),i.innerHTML}function _classCallCheck$3(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _classCallCheck$2(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn$1(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function _inherits$1(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}function treatAsUtc(t){var e=new Date(t);return e.setMinutes(e.getMinutes()-e.getTimezoneOffset()),e}function getYyyyMmDd(t){var e=t.getDate(),n=t.getMonth()+1;return [t.getFullYear(),(n>9?"":"0")+n,(e>9?"":"0")+e].join("-")}function clone(t){return new Date(t.getTime())}function getWeeksBetween(t,e){var n=setDayToSunday(t);return Math.ceil(getDaysBetween(n,e)/NO_OF_DAYS_IN_WEEK)}function getDaysBetween(t,e){var n=SEC_IN_DAY*NO_OF_MILLIS;return (treatAsUtc(e)-treatAsUtc(t))/n}function areInSameMonth(t,e){return t.getMonth()===e.getMonth()&&t.getFullYear()===e.getFullYear()}function getMonthName(t){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],n=MONTH_NAMES[t];return e?n.slice(0,3):n}function getLastDateInMonth(t,e){return new Date(e,t+1,0)}function setDayToSunday(t){var e=clone(t),n=e.getDay();return 0!==n&&addDays(e,-1*n),e}function addDays(t,e){t.setDate(t.getDate()+e);}function _classCallCheck$5(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function getComponent(t,e,n){var i=Object.keys(componentConfigs).filter(function(e){return t.includes(e)}),a=componentConfigs[i[0]];return Object.assign(a,{constants:e,getData:n}),new ChartComponent(a)}function _toConsumableArray(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function _classCallCheck$1(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function _inherits(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}function _toConsumableArray$2(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function _classCallCheck$6(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn$2(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function _inherits$2(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}function _toConsumableArray$4(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function normalize(t){if(0===t)return [0,0];if(isNaN(t))return {mantissa:-6755399441055744,exponent:972};var e=t>0?1:-1;if(!isFinite(t))return {mantissa:4503599627370496*e,exponent:972};t=Math.abs(t);var n=Math.floor(Math.log10(t));return [e*(t/Math.pow(10,n)),n]}function getChartRangeIntervals(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=Math.ceil(t),i=Math.floor(e),a=n-i,r=a,s=1;a>5&&(a%2!=0&&(a=++n-i),r=a/2,s=2),a<=2&&(s=a/(r=4)),0===a&&(r=5,s=1);for(var o=[],l=0;l<=r;l++)o.push(i+s*l);return o}function getChartIntervals(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=normalize(t),i=_slicedToArray$4(n,2),a=i[0],r=i[1],s=e?e/Math.pow(10,r):0,o=getChartRangeIntervals(a=a.toFixed(6),s);return o=o.map(function(t){return t*Math.pow(10,r)})}function calcChartIntervals(t){function e(t,e){for(var n=getChartIntervals(t),i=n[1]-n[0],a=0,r=1;a<e;r++)a+=i,n.unshift(-1*a);return n}var n=arguments.length>1&&void 0!==arguments[1]&&arguments[1],i=Math.max.apply(Math,_toConsumableArray$4(t)),a=Math.min.apply(Math,_toConsumableArray$4(t)),r=[];if(i>=0&&a>=0)normalize(i)[1],r=n?getChartIntervals(i,a):getChartIntervals(i);else if(i>0&&a<0){var s=Math.abs(a);i>=s?(normalize(i)[1],r=e(i,s)):(normalize(s)[1],r=e(s,i).map(function(t){return -1*t}));}else if(i<=0&&a<=0){var o=Math.abs(a),l=Math.abs(i);normalize(o)[1],r=(r=n?getChartIntervals(o,l):getChartIntervals(o)).reverse().map(function(t){return -1*t});}return r}function getZeroIndex(t){var e=getIntervalSize(t);return t.indexOf(0)>=0?t.indexOf(0):t[0]>0?-1*t[0]/e:-1*t[t.length-1]/e+(t.length-1)}function getIntervalSize(t){return t[1]-t[0]}function getValueRange(t){return t[t.length-1]-t[0]}function scale(t,e){return floatTwo(e.zeroLine-t*e.scaleMultiplier)}function getClosestInArray(t,e){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],i=e.reduce(function(e,n){return Math.abs(n-t)<Math.abs(e-t)?n:e},[]);return n?e.indexOf(i):i}function calcDistribution(t,e){for(var n=Math.max.apply(Math,_toConsumableArray$4(t)),i=1/(e-1),a=[],r=0;r<e;r++){var s=n*(i*r);a.push(s);}return a}function getMaxCheckpoint(t,e){return e.filter(function(e){return e<t}).length}function _toConsumableArray$3(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function _classCallCheck$7(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn$3(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function _inherits$3(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}function _toConsumableArray$6(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function dataPrep(t,e){t.labels=t.labels||[];var n=t.labels.length,i=t.datasets,a=new Array(n).fill(0);return i||(i=[{values:a}]),i.map(function(t){if(t.values){var i=t.values;i=(i=i.map(function(t){return isNaN(t)?0:t})).length>n?i.slice(0,n):fillArray(i,n-i.length,0);}else t.values=a;t.chartType||(t.chartType=e);}),t.yRegions&&t.yRegions.map(function(t){if(t.end<t.start){var e=[t.end,t.start];t.start=e[0],t.end=e[1];}}),t}function zeroDataPrep(t){var e=t.labels.length,n=new Array(e).fill(0),i={labels:t.labels.slice(0,-1),datasets:t.datasets.map(function(t){return {name:"",values:n.slice(0,-1),chartType:t.chartType}})};return t.yMarkers&&(i.yMarkers=[{value:0,label:""}]),t.yRegions&&(i.yRegions=[{start:0,end:0,label:""}]),i}function getShortenedLabels(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:[],n=!(arguments.length>2&&void 0!==arguments[2])||arguments[2],i=t/e.length;i<=0&&(i=1);var a=i/DEFAULT_CHAR_WIDTH,r=void 0;if(n){var s=Math.max.apply(Math,_toConsumableArray$6(e.map(function(t){return t.length})));r=Math.ceil(s/a);}return e.map(function(t,e){return (t+="").length>a&&(n?e%r!=0&&(t=""):t=a-3>0?t.slice(0,a-3)+" ...":t.slice(0,a)+".."),t})}function _toConsumableArray$5(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function _classCallCheck$8(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn$4(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function _inherits$4(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}function _toConsumableArray$7(t){if(Array.isArray(t)){for(var e=0,n=Array(t.length);e<t.length;e++)n[e]=t[e];return n}return Array.from(t)}function _classCallCheck$9(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn$5(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return !e||"object"!=typeof e&&"function"!=typeof e?t:e}function _inherits$5(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e);}function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function getChartByType(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"line",e=arguments[1],n=arguments[2];return "axis-mixed"===t?(n.type="line",new AxisChart(e,n)):chartTypes[t]?new chartTypes[t](e,n):void console.error("Undefined chart type: "+t)}Object.defineProperty(exports,"__esModule",{value:!0});var css_248z='.chart-container{position:relative;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif}.chart-container .axis,.chart-container .chart-label{fill:#555b51}.chart-container .axis line,.chart-container .chart-label line{stroke:#dadada}.chart-container .dataset-units circle{stroke:#fff;stroke-width:2}.chart-container .dataset-units path{fill:none;stroke-opacity:1;stroke-width:2px}.chart-container .dataset-path{stroke-width:2px}.chart-container .path-group path{fill:none;stroke-opacity:1;stroke-width:2px}.chart-container line.dashed{stroke-dasharray:5,3}.chart-container .axis-line .specific-value{text-anchor:start}.chart-container .axis-line .y-line{text-anchor:end}.chart-container .axis-line .x-line{text-anchor:middle}.chart-container .legend-dataset-text{fill:#6c7680;font-weight:600}.graph-svg-tip{position:absolute;z-index:99999;padding:10px;font-size:12px;color:#959da5;text-align:center;background:rgba(0,0,0,.8);border-radius:3px}.graph-svg-tip ol,.graph-svg-tip ul{padding-left:0;display:-webkit-box;display:-ms-flexbox;display:flex}.graph-svg-tip ul.data-point-list li{min-width:90px;-webkit-box-flex:1;-ms-flex:1;flex:1;font-weight:600}.graph-svg-tip strong{color:#dfe2e5;font-weight:600}.graph-svg-tip .svg-pointer{position:absolute;height:5px;margin:0 0 0 -5px;content:" ";border:5px solid transparent;border-top-color:rgba(0,0,0,.8)}.graph-svg-tip.comparison{padding:0;text-align:left;pointer-events:none}.graph-svg-tip.comparison .title{display:block;padding:10px;margin:0;font-weight:600;line-height:1;pointer-events:none}.graph-svg-tip.comparison ul{margin:0;white-space:nowrap;list-style:none}.graph-svg-tip.comparison li{display:inline-block;padding:5px 10px}';styleInject(css_248z);var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};$.create=function(t,e){var n=document.createElement(t);for(var i in e){var a=e[i];if("inside"===i)$(a).appendChild(n);else if("around"===i){var r=$(a);r.parentNode.insertBefore(n,r),n.appendChild(r);}else "styles"===i?"object"===(void 0===a?"undefined":_typeof(a))&&Object.keys(a).map(function(t){n.style[t]=a[t];}):i in n?n[i]=a:n.setAttribute(i,a);}return n};var BASE_MEASURES={margins:{top:10,bottom:10,left:20,right:20},paddings:{top:20,bottom:40,left:30,right:10},baseHeight:240,titleHeight:20,legendHeight:30,titleFontSize:12},INIT_CHART_UPDATE_TIMEOUT=700,CHART_POST_ANIMATE_TIMEOUT=400,AXIS_LEGEND_BAR_SIZE=100,BAR_CHART_SPACE_RATIO=.5,MIN_BAR_PERCENT_HEIGHT=0,LINE_CHART_DOT_SIZE=4,DOT_OVERLAY_SIZE_INCR=4,PERCENTAGE_BAR_DEFAULT_HEIGHT=20,PERCENTAGE_BAR_DEFAULT_DEPTH=2,HEATMAP_DISTRIBUTION_SIZE=5,HEATMAP_SQUARE_SIZE=10,HEATMAP_GUTTER_SIZE=2,DEFAULT_CHAR_WIDTH=7,TOOLTIP_POINTER_TRIANGLE_HEIGHT=5,DEFAULT_CHART_COLORS=["light-blue","blue","violet","red","orange","yellow","green","light-green","purple","magenta","light-grey","dark-grey"],HEATMAP_COLORS_GREEN=["#ebedf0","#c6e48b","#7bc96f","#239a3b","#196127"],DEFAULT_COLORS={bar:DEFAULT_CHART_COLORS,line:DEFAULT_CHART_COLORS,pie:DEFAULT_CHART_COLORS,percentage:DEFAULT_CHART_COLORS,heatmap:HEATMAP_COLORS_GREEN,donut:DEFAULT_CHART_COLORS},ANGLE_RATIO=Math.PI/180,FULL_ANGLE=360,_createClass$3=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i);}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),SvgTip=function(){function t(e){var n=e.parent,i=void 0===n?null:n,a=e.colors,r=void 0===a?[]:a;_classCallCheck$4(this,t),this.parent=i,this.colors=r,this.titleName="",this.titleValue="",this.listValues=[],this.titleValueFirst=0,this.x=0,this.y=0,this.top=0,this.left=0,this.setup();}return _createClass$3(t,[{key:"setup",value:function(){this.makeTooltip();}},{key:"refresh",value:function(){this.fill(),this.calcPosition();}},{key:"makeTooltip",value:function(){var t=this;this.container=$.create("div",{inside:this.parent,className:"graph-svg-tip comparison",innerHTML:'<span class="title"></span>\n\t\t\t\t<ul class="data-point-list"></ul>\n\t\t\t\t<div class="svg-pointer"></div>'}),this.hideTip(),this.title=this.container.querySelector(".title"),this.dataPointList=this.container.querySelector(".data-point-list"),this.parent.addEventListener("mouseleave",function(){t.hideTip();});}},{key:"fill",value:function(){var t=this,e=void 0;this.index&&this.container.setAttribute("data-point-index",this.index),e=this.titleValueFirst?"<strong>"+this.titleValue+"</strong>"+this.titleName:this.titleName+"<strong>"+this.titleValue+"</strong>",this.title.innerHTML=e,this.dataPointList.innerHTML="",this.listValues.map(function(e,n){var i=t.colors[n]||"black",a=0===e.formatted||e.formatted?e.formatted:e.value,r=$.create("li",{styles:{"border-top":"3px solid "+i},innerHTML:'<strong style="display: block;">'+(0===a||a?a:"")+"</strong>\n\t\t\t\t\t"+(e.title?e.title:"")});t.dataPointList.appendChild(r);});}},{key:"calcPosition",value:function(){var t=this.container.offsetWidth;this.top=this.y-this.container.offsetHeight-TOOLTIP_POINTER_TRIANGLE_HEIGHT,this.left=this.x-t/2;var e=this.parent.offsetWidth-t,n=this.container.querySelector(".svg-pointer");if(this.left<0)n.style.left="calc(50% - "+-1*this.left+"px)",this.left=0;else if(this.left>e){var i="calc(50% + "+(this.left-e)+"px)";n.style.left=i,this.left=e;}else n.style.left="50%";}},{key:"setValues",value:function(t,e){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},i=arguments.length>3&&void 0!==arguments[3]?arguments[3]:[],a=arguments.length>4&&void 0!==arguments[4]?arguments[4]:-1;this.titleName=n.name,this.titleValue=n.value,this.listValues=i,this.x=t,this.y=e,this.titleValueFirst=n.valueFirst||0,this.index=a,this.refresh();}},{key:"hideTip",value:function(){this.container.style.top="0px",this.container.style.left="0px",this.container.style.opacity="0";}},{key:"showTip",value:function(){this.container.style.top=this.top+"px",this.container.style.left=this.left+"px",this.container.style.opacity="1";}}]),t}(),PRESET_COLOR_MAP={"light-blue":"#7cd6fd",blue:"#5e64ff",violet:"#743ee2",red:"#ff5858",orange:"#ffa00a",yellow:"#feef72",green:"#28a745","light-green":"#98d85b",purple:"#b554ff",magenta:"#ffa3ef",black:"#36114C",grey:"#bdd3e6","light-grey":"#f0f4f7","dark-grey":"#b8c2cc"},getColor=function(t){return PRESET_COLOR_MAP[t]||t},_slicedToArray=function(){function t(t,e){var n=[],i=!0,a=!1,r=void 0;try{for(var s,o=t[Symbol.iterator]();!(i=(s=o.next()).done)&&(n.push(s.value),!e||n.length!==e);i=!0);}catch(t){a=!0,r=t;}finally{try{!i&&o.return&&o.return();}finally{if(a)throw r}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),_typeof$1="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t},AXIS_TICK_LENGTH=6,LABEL_MARGIN=4,LABEL_MAX_CHARS=15,FONT_SIZE=10,BASE_LINE_COLOR="#dadada",FONT_FILL="#555b51",makeOverlay={bar:function(t){var e=void 0;"rect"!==t.nodeName&&(e=t.getAttribute("transform"),t=t.childNodes[0]);var n=t.cloneNode();return n.style.fill="#000000",n.style.opacity="0.4",e&&n.setAttribute("transform",e),n},dot:function(t){var e=void 0;"circle"!==t.nodeName&&(e=t.getAttribute("transform"),t=t.childNodes[0]);var n=t.cloneNode(),i=t.getAttribute("r"),a=t.getAttribute("fill");return n.setAttribute("r",parseInt(i)+DOT_OVERLAY_SIZE_INCR),n.setAttribute("fill",a),n.style.opacity="0.6",e&&n.setAttribute("transform",e),n},heat_square:function(t){var e=void 0;"circle"!==t.nodeName&&(e=t.getAttribute("transform"),t=t.childNodes[0]);var n=t.cloneNode(),i=t.getAttribute("r"),a=t.getAttribute("fill");return n.setAttribute("r",parseInt(i)+DOT_OVERLAY_SIZE_INCR),n.setAttribute("fill",a),n.style.opacity="0.6",e&&n.setAttribute("transform",e),n}},updateOverlay={bar:function(t,e){var n=void 0;"rect"!==t.nodeName&&(n=t.getAttribute("transform"),t=t.childNodes[0]);var i=["x","y","width","height"];Object.values(t.attributes).filter(function(t){return i.includes(t.name)&&t.specified}).map(function(t){e.setAttribute(t.name,t.nodeValue);}),n&&e.setAttribute("transform",n);},dot:function(t,e){var n=void 0;"circle"!==t.nodeName&&(n=t.getAttribute("transform"),t=t.childNodes[0]);var i=["cx","cy"];Object.values(t.attributes).filter(function(t){return i.includes(t.name)&&t.specified}).map(function(t){e.setAttribute(t.name,t.nodeValue);}),n&&e.setAttribute("transform",n);},heat_square:function(t,e){var n=void 0;"circle"!==t.nodeName&&(n=t.getAttribute("transform"),t=t.childNodes[0]);var i=["cx","cy"];Object.values(t.attributes).filter(function(t){return i.includes(t.name)&&t.specified}).map(function(t){e.setAttribute(t.name,t.nodeValue);}),n&&e.setAttribute("transform",n);}},_slicedToArray$2=function(){function t(t,e){var n=[],i=!0,a=!1,r=void 0;try{for(var s,o=t[Symbol.iterator]();!(i=(s=o.next()).done)&&(n.push(s.value),!e||n.length!==e);i=!0);}catch(t){a=!0,r=t;}finally{try{!i&&o.return&&o.return();}finally{if(a)throw r}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),UNIT_ANIM_DUR=350,PATH_ANIM_DUR=350,MARKER_LINE_ANIM_DUR=UNIT_ANIM_DUR,REPLACE_ALL_NEW_DUR=250,STD_EASING="easein",_slicedToArray$1=function(){function t(t,e){var n=[],i=!0,a=!1,r=void 0;try{for(var s,o=t[Symbol.iterator]();!(i=(s=o.next()).done)&&(n.push(s.value),!e||n.length!==e);i=!0);}catch(t){a=!0,r=t;}finally{try{!i&&o.return&&o.return();}finally{if(a)throw r}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),EASING={ease:"0.25 0.1 0.25 1",linear:"0 0 1 1",easein:"0.1 0.8 0.2 1",easeout:"0 0 0.58 1",easeinout:"0.42 0 0.58 1"},CSSTEXT=".chart-container{position:relative;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Oxygen','Ubuntu','Cantarell','Fira Sans','Droid Sans','Helvetica Neue',sans-serif}.chart-container .axis,.chart-container .chart-label{fill:#555b51}.chart-container .axis line,.chart-container .chart-label line{stroke:#dadada}.chart-container .dataset-units circle{stroke:#fff;stroke-width:2}.chart-container .dataset-units path{fill:none;stroke-opacity:1;stroke-width:2px}.chart-container .dataset-path{stroke-width:2px}.chart-container .path-group path{fill:none;stroke-opacity:1;stroke-width:2px}.chart-container line.dashed{stroke-dasharray:5,3}.chart-container .axis-line .specific-value{text-anchor:start}.chart-container .axis-line .y-line{text-anchor:end}.chart-container .axis-line .x-line{text-anchor:middle}.chart-container .legend-dataset-text{fill:#6c7680;font-weight:600}.graph-svg-tip{position:absolute;z-index:99999;padding:10px;font-size:12px;color:#959da5;text-align:center;background:rgba(0,0,0,.8);border-radius:3px}.graph-svg-tip ul{padding-left:0;display:flex}.graph-svg-tip ol{padding-left:0;display:flex}.graph-svg-tip ul.data-point-list li{min-width:90px;flex:1;font-weight:600}.graph-svg-tip strong{color:#dfe2e5;font-weight:600}.graph-svg-tip .svg-pointer{position:absolute;height:5px;margin:0 0 0 -5px;content:' ';border:5px solid transparent;border-top-color:rgba(0,0,0,.8)}.graph-svg-tip.comparison{padding:0;text-align:left;pointer-events:none}.graph-svg-tip.comparison .title{display:block;padding:10px;margin:0;font-weight:600;line-height:1;pointer-events:none}.graph-svg-tip.comparison ul{margin:0;white-space:nowrap;list-style:none}.graph-svg-tip.comparison li{display:inline-block;padding:5px 10px}",_createClass$2=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i);}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),BaseChart=function(){function t(e,n){if(_classCallCheck$3(this,t),this.parent="string"==typeof e?document.querySelector(e):e,!(this.parent instanceof HTMLElement))throw new Error("No `parent` element to render on was provided.");this.rawChartArgs=n,this.title=n.title||"",this.type=n.type||"",this.realData=this.prepareData(n.data),this.data=this.prepareFirstData(this.realData),this.colors=this.validateColors(n.colors,this.type),this.config={showTooltip:1,showLegend:1,isNavigable:n.isNavigable||0,animate:void 0!==n.animate?n.animate:1,truncateLegends:n.truncateLegends||0},this.measures=JSON.parse(JSON.stringify(BASE_MEASURES));var i=this.measures;this.setMeasures(n),this.title.length||(i.titleHeight=0),this.config.showLegend||(i.legendHeight=0),this.argHeight=n.height||i.baseHeight,this.state={},this.options={},this.initTimeout=INIT_CHART_UPDATE_TIMEOUT,this.config.isNavigable&&(this.overlays=[]),this.configure(n);}return _createClass$2(t,[{key:"prepareData",value:function(t){return t}},{key:"prepareFirstData",value:function(t){return t}},{key:"validateColors",value:function(t,e){var n=[];return (t=(t||[]).concat(DEFAULT_COLORS[e])).forEach(function(t){var e=getColor(t);isValidColor(e)?n.push(e):console.warn('"'+t+'" is not a valid color.');}),n}},{key:"setMeasures",value:function(){}},{key:"configure",value:function(){var t=this,e=this.argHeight;this.baseHeight=e,this.height=e-getExtraHeight(this.measures),this.boundDrawFn=function(){return t.draw(!0)},window.addEventListener("resize",this.boundDrawFn),window.addEventListener("orientationchange",this.boundDrawFn);}},{key:"destroy",value:function(){window.removeEventListener("resize",this.boundDrawFn),window.removeEventListener("orientationchange",this.boundDrawFn);}},{key:"setup",value:function(){this.makeContainer(),this.updateWidth(),this.makeTooltip(),this.draw(!1,!0);}},{key:"makeContainer",value:function(){this.parent.innerHTML="";var t={inside:this.parent,className:"chart-container"};this.independentWidth&&(t.styles={width:this.independentWidth+"px"}),this.container=$.create("div",t);}},{key:"makeTooltip",value:function(){this.tip=new SvgTip({parent:this.container,colors:this.colors}),this.bindTooltip();}},{key:"bindTooltip",value:function(){}},{key:"draw",value:function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]&&arguments[0],n=arguments.length>1&&void 0!==arguments[1]&&arguments[1];this.updateWidth(),this.calc(e),this.makeChartArea(),this.setupComponents(),this.components.forEach(function(e){return e.setup(t.drawArea)}),this.render(this.components,!1),n&&(this.data=this.realData,setTimeout(function(){t.update(t.data);},this.initTimeout)),this.renderLegend(),this.setupNavigation(n);}},{key:"calc",value:function(){}},{key:"updateWidth",value:function(){this.baseWidth=getElementContentWidth(this.parent),this.width=this.baseWidth-getExtraWidth(this.measures);}},{key:"makeChartArea",value:function(){this.svg&&this.container.removeChild(this.svg);var t=this.measures;this.svg=makeSVGContainer(this.container,"frappe-chart chart",this.baseWidth,this.baseHeight),this.svgDefs=makeSVGDefs(this.svg),this.title.length&&(this.titleEL=makeText("title",t.margins.left,t.margins.top,this.title,{fontSize:t.titleFontSize,fill:"#666666",dy:t.titleFontSize}));var e=getTopOffset(t);this.drawArea=makeSVGGroup(this.type+"-chart chart-draw-area","translate("+getLeftOffset(t)+", "+e+")"),this.config.showLegend&&(e+=this.height+t.paddings.bottom,this.legendArea=makeSVGGroup("chart-legend","translate("+getLeftOffset(t)+", "+e+")")),this.title.length&&this.svg.appendChild(this.titleEL),this.svg.appendChild(this.drawArea),this.config.showLegend&&this.svg.appendChild(this.legendArea),this.updateTipOffset(getLeftOffset(t),getTopOffset(t));}},{key:"updateTipOffset",value:function(t,e){this.tip.offset={x:t,y:e};}},{key:"setupComponents",value:function(){this.components=new Map;}},{key:"update",value:function(t){t||console.error("No data to update."),this.data=this.prepareData(t),this.calc(),this.render(this.components,this.config.animate);}},{key:"render",value:function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.components,n=!(arguments.length>1&&void 0!==arguments[1])||arguments[1];this.config.isNavigable&&this.overlays.map(function(t){return t.parentNode.removeChild(t)});var i=[];e.forEach(function(t){i=i.concat(t.update(n));}),i.length>0?(runSMILAnimation(this.container,this.svg,i),setTimeout(function(){e.forEach(function(t){return t.make()}),t.updateNav();},CHART_POST_ANIMATE_TIMEOUT)):(e.forEach(function(t){return t.make()}),this.updateNav());}},{key:"updateNav",value:function(){this.config.isNavigable&&(this.makeOverlay(),this.bindUnits());}},{key:"renderLegend",value:function(){}},{key:"setupNavigation",value:function(){var t=this,e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];this.config.isNavigable&&e&&(this.bindOverlay(),this.keyActions={13:this.onEnterKey.bind(this),37:this.onLeftArrow.bind(this),38:this.onUpArrow.bind(this),39:this.onRightArrow.bind(this),40:this.onDownArrow.bind(this)},document.addEventListener("keydown",function(e){isElementInViewport(t.container)&&(e=e||window.event,t.keyActions[e.keyCode]&&t.keyActions[e.keyCode]());}));}},{key:"makeOverlay",value:function(){}},{key:"updateOverlay",value:function(){}},{key:"bindOverlay",value:function(){}},{key:"bindUnits",value:function(){}},{key:"onLeftArrow",value:function(){}},{key:"onRightArrow",value:function(){}},{key:"onUpArrow",value:function(){}},{key:"onDownArrow",value:function(){}},{key:"onEnterKey",value:function(){}},{key:"addDataPoint",value:function(){}},{key:"removeDataPoint",value:function(){}},{key:"getDataPoint",value:function(){}},{key:"setCurrentDataPoint",value:function(){}},{key:"updateDataset",value:function(){}},{key:"export",value:function(){var t=prepareForExport(this.svg);downloadFile(this.title||"Chart",[t]);}}]),t}(),_createClass$1=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i);}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),_get$1=function t(e,n,i){null===e&&(e=Function.prototype);var a=Object.getOwnPropertyDescriptor(e,n);if(void 0===a){var r=Object.getPrototypeOf(e);return null===r?void 0:t(r,n,i)}if("value"in a)return a.value;var s=a.get;if(void 0!==s)return s.call(i)},AggregationChart=function(t){function e(t,n){return _classCallCheck$2(this,e),_possibleConstructorReturn$1(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n))}return _inherits$1(e,t),_createClass$1(e,[{key:"configure",value:function(t){_get$1(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"configure",this).call(this,t),this.config.maxSlices=t.maxSlices||20,this.config.maxLegendPoints=t.maxLegendPoints||20;}},{key:"calc",value:function(){var t=this,e=this.state,n=this.config.maxSlices;e.sliceTotals=[];var i=this.data.labels.map(function(e,n){var i=0;return t.data.datasets.map(function(t){i+=t.values[n];}),[i,e]}).filter(function(t){return t[0]>=0}),a=i;if(i.length>n){i.sort(function(t,e){return e[0]-t[0]}),a=i.slice(0,n-1);var r=0;i.slice(n-1).map(function(t){r+=t[0];}),a.push([r,"Rest"]),this.colors[n-1]="grey";}e.labels=[],a.map(function(t){e.sliceTotals.push(t[0]),e.labels.push(t[1]);}),e.grandTotal=e.sliceTotals.reduce(function(t,e){return t+e},0),this.center={x:this.width/2,y:this.height/2};}},{key:"renderLegend",value:function(){var t=this,e=this.state;this.legendArea.textContent="",this.legendTotals=e.sliceTotals.slice(0,this.config.maxLegendPoints);var n=0,i=0;this.legendTotals.map(function(a,r){var s=110,o=Math.floor((t.width-getExtraWidth(t.measures))/s);t.legendTotals.length<o&&(s=t.width/t.legendTotals.length),n>o&&(n=0,i+=20);var l=legendDot(s*n+5,i,5,t.colors[r],e.labels[r]+": "+a,t.config.truncateLegends);t.legendArea.appendChild(l),n++;});}}]),e}(BaseChart),NO_OF_YEAR_MONTHS=12,NO_OF_DAYS_IN_WEEK=7,NO_OF_MILLIS=1e3,SEC_IN_DAY=86400,MONTH_NAMES=["January","February","March","April","May","June","July","August","September","October","November","December"],DAY_NAMES_SHORT=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],_slicedToArray$3=function(){function t(t,e){var n=[],i=!0,a=!1,r=void 0;try{for(var s,o=t[Symbol.iterator]();!(i=(s=o.next()).done)&&(n.push(s.value),!e||n.length!==e);i=!0);}catch(t){a=!0,r=t;}finally{try{!i&&o.return&&o.return();}finally{if(a)throw r}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),_createClass$4=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i);}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),ChartComponent=function(){function t(e){var n=e.layerClass,i=void 0===n?"":n,a=e.layerTransform,r=void 0===a?"":a,s=e.constants,o=e.getData,l=e.makeElements,u=e.animateElements;_classCallCheck$5(this,t),this.layerTransform=r,this.constants=s,this.makeElements=l,this.getData=o,this.animateElements=u,this.store=[],this.labels=[],this.layerClass=i,this.layerClass="function"==typeof this.layerClass?this.layerClass():this.layerClass,this.refresh();}return _createClass$4(t,[{key:"refresh",value:function(t){this.data=t||this.getData();}},{key:"setup",value:function(t){this.layer=makeSVGGroup(this.layerClass,this.layerTransform,t);}},{key:"make",value:function(){this.render(this.data),this.oldData=this.data;}},{key:"render",value:function(t){var e=this;this.store=this.makeElements(t),this.layer.textContent="",this.store.forEach(function(t){e.layer.appendChild(t);}),this.labels.forEach(function(t){e.layer.appendChild(t);});}},{key:"update",value:function(){var t=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];this.refresh();var e=[];return t&&(e=this.animateElements(this.data)||[]),e}}]),t}(),componentConfigs={donutSlices:{layerClass:"donut-slices",makeElements:function(t){return t.sliceStrings.map(function(e,n){var i=makePath(e,"donut-path",t.colors[n],"none",t.strokeWidth);return i.style.transition="transform .3s;",i})},animateElements:function(t){return this.store.map(function(e,n){return animatePathStr(e,t.sliceStrings[n])})}},pieSlices:{layerClass:"pie-slices",makeElements:function(t){return t.sliceStrings.map(function(e,n){var i=makePath(e,"pie-path","none",t.colors[n]);return i.style.transition="transform .3s;",i})},animateElements:function(t){return this.store.map(function(e,n){return animatePathStr(e,t.sliceStrings[n])})}},percentageBars:{layerClass:"percentage-bars",makeElements:function(t){var e=this;return t.xPositions.map(function(n,i){return percentageBar(n,0,t.widths[i],e.constants.barHeight,e.constants.barDepth,t.colors[i])})},animateElements:function(t){if(t)return []}},yAxis:{layerClass:"y axis",makeElements:function(t){var e=this;return t.positions.map(function(n,i){return yLine(n,t.labels[i],e.constants.width,{mode:e.constants.mode,pos:e.constants.pos,shortenNumbers:e.constants.shortenNumbers})})},animateElements:function(t){var e=t.positions,n=t.labels,i=this.oldData.positions,a=this.oldData.labels,r=equilizeNoOfElements(i,e),s=_slicedToArray$3(r,2);i=s[0],e=s[1];var o=equilizeNoOfElements(a,n),l=_slicedToArray$3(o,2);return a=l[0],n=l[1],this.render({positions:i,labels:n}),this.store.map(function(t,n){return translateHoriLine(t,e[n],i[n])})}},xAxis:{layerClass:"x axis",makeElements:function(t){var e=this;return t.positions.map(function(n,i){return xLine(n,t.calcLabels[i],e.constants.height,{mode:e.constants.mode,pos:e.constants.pos})})},animateElements:function(t){var e=t.positions,n=t.calcLabels,i=this.oldData.positions,a=this.oldData.calcLabels,r=equilizeNoOfElements(i,e),s=_slicedToArray$3(r,2);i=s[0],e=s[1];var o=equilizeNoOfElements(a,n),l=_slicedToArray$3(o,2);return a=l[0],n=l[1],this.render({positions:i,calcLabels:n}),this.store.map(function(t,n){return translateVertLine(t,e[n],i[n])})}},yMarkers:{layerClass:"y-markers",makeElements:function(t){var e=this;return t.map(function(t){return yMarker(t.position,t.label,e.constants.width,{labelPos:t.options.labelPos,mode:"span",lineType:"dashed"})})},animateElements:function(t){var e=equilizeNoOfElements(this.oldData,t),n=_slicedToArray$3(e,2);this.oldData=n[0];var i=(t=n[1]).map(function(t){return t.position}),a=t.map(function(t){return t.label}),r=t.map(function(t){return t.options}),s=this.oldData.map(function(t){return t.position});return this.render(s.map(function(t,e){return {position:s[e],label:a[e],options:r[e]}})),this.store.map(function(t,e){return translateHoriLine(t,i[e],s[e])})}},yRegions:{layerClass:"y-regions",makeElements:function(t){var e=this;return t.map(function(t){return yRegion(t.startPos,t.endPos,e.constants.width,t.label,{labelPos:t.options.labelPos})})},animateElements:function(t){var e=equilizeNoOfElements(this.oldData,t),n=_slicedToArray$3(e,2);this.oldData=n[0];var i=(t=n[1]).map(function(t){return t.endPos}),a=t.map(function(t){return t.label}),r=t.map(function(t){return t.startPos}),s=t.map(function(t){return t.options}),o=this.oldData.map(function(t){return t.endPos}),l=this.oldData.map(function(t){return t.startPos});this.render(o.map(function(t,e){return {startPos:l[e],endPos:o[e],label:a[e],options:s[e]}}));var u=[];return this.store.map(function(t,e){u=u.concat(animateRegion(t,r[e],i[e],o[e]));}),u}},heatDomain:{layerClass:function(){return "heat-domain domain-"+this.constants.index},makeElements:function(t){var e=this,n=this.constants,i=n.index,a=n.colWidth,r=n.rowHeight,s=n.squareSize,o=n.radius,l=n.xTranslate,u=0;return this.serializedSubDomains=[],t.cols.map(function(t,n){1===n&&e.labels.push(makeText("domain-name",l,-12,getMonthName(i,!0).toUpperCase(),{fontSize:9})),t.map(function(t,n){if(t.fill){var i={"data-date":t.yyyyMmDd,"data-value":t.dataValue,"data-day":n},a=heatSquare("day",l,u,s,o,t.fill,i);e.serializedSubDomains.push(a);}u+=r;}),u=0,l+=a;}),this.serializedSubDomains},animateElements:function(t){if(t)return []}},barGraph:{layerClass:function(){return "dataset-units dataset-bars dataset-"+this.constants.index},makeElements:function(t){var e=this.constants;return this.unitType="bar",this.units=t.yPositions.map(function(n,i){return datasetBar(t.xPositions[i],n,t.barWidth,e.color,t.labels[i],i,t.offsets[i],{zeroLine:t.zeroLine,barsWidth:t.barsWidth,minHeight:e.minHeight})}),this.units},animateElements:function(t){var e=t.xPositions,n=t.yPositions,i=t.offsets,a=t.labels,r=this.oldData.xPositions,s=this.oldData.yPositions,o=this.oldData.offsets,l=this.oldData.labels,u=equilizeNoOfElements(r,e),c=_slicedToArray$3(u,2);r=c[0],e=c[1];var h=equilizeNoOfElements(s,n),d=_slicedToArray$3(h,2);s=d[0],n=d[1];var f=equilizeNoOfElements(o,i),p=_slicedToArray$3(f,2);o=p[0],i=p[1];var v=equilizeNoOfElements(l,a),g=_slicedToArray$3(v,2);l=g[0],a=g[1],this.render({xPositions:r,yPositions:s,offsets:o,labels:a,zeroLine:this.oldData.zeroLine,barsWidth:this.oldData.barsWidth,barWidth:this.oldData.barWidth});var y=[];return this.store.map(function(a,r){y=y.concat(animateBar(a,e[r],n[r],t.barWidth,i[r],{zeroLine:t.zeroLine}));}),y}},lineGraph:{layerClass:function(){return "dataset-units dataset-line dataset-"+this.constants.index},makeElements:function(t){var e=this.constants;return this.unitType="dot",this.paths={},e.hideLine||(this.paths=getPaths(t.xPositions,t.yPositions,e.color,{heatline:e.heatline,regionFill:e.regionFill,spline:e.spline},{svgDefs:e.svgDefs,zeroLine:t.zeroLine})),this.units=[],e.hideDots||(this.units=t.yPositions.map(function(n,i){return datasetDot(t.xPositions[i],n,t.radius,e.color,e.valuesOverPoints?t.values[i]:"",i)})),Object.values(this.paths).concat(this.units)},animateElements:function(t){var e=t.xPositions,n=t.yPositions,i=t.values,a=this.oldData.xPositions,r=this.oldData.yPositions,s=this.oldData.values,o=equilizeNoOfElements(a,e),l=_slicedToArray$3(o,2);a=l[0],e=l[1];var u=equilizeNoOfElements(r,n),c=_slicedToArray$3(u,2);r=c[0],n=c[1];var h=equilizeNoOfElements(s,i),d=_slicedToArray$3(h,2);s=d[0],i=d[1],this.render({xPositions:a,yPositions:r,values:i,zeroLine:this.oldData.zeroLine,radius:this.oldData.radius});var f=[];return Object.keys(this.paths).length&&(f=f.concat(animatePath(this.paths,e,n,t.zeroLine,this.constants.spline))),this.units.length&&this.units.map(function(t,i){f=f.concat(animateDot(t,e[i],n[i]));}),f}}},_createClass=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i);}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),_get=function t(e,n,i){null===e&&(e=Function.prototype);var a=Object.getOwnPropertyDescriptor(e,n);if(void 0===a){var r=Object.getPrototypeOf(e);return null===r?void 0:t(r,n,i)}if("value"in a)return a.value;var s=a.get;if(void 0!==s)return s.call(i)},PercentageChart=function(t){function e(t,n){_classCallCheck$1(this,e);var i=_possibleConstructorReturn(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return i.type="percentage",i.setup(),i}return _inherits(e,t),_createClass(e,[{key:"setMeasures",value:function(t){var e=this.measures;this.barOptions=t.barOptions||{};var n=this.barOptions;n.height=n.height||PERCENTAGE_BAR_DEFAULT_HEIGHT,n.depth=n.depth||PERCENTAGE_BAR_DEFAULT_DEPTH,e.paddings.right=30,e.legendHeight=60,e.baseHeight=8*(n.height+.5*n.depth);}},{key:"setupComponents",value:function(){var t=this.state,e=[["percentageBars",{barHeight:this.barOptions.height,barDepth:this.barOptions.depth},function(){return {xPositions:t.xPositions,widths:t.widths,colors:this.colors}}.bind(this)]];this.components=new Map(e.map(function(t){var e=getComponent.apply(void 0,_toConsumableArray(t));return [t[0],e]}));}},{key:"calc",value:function(){var t=this;_get(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"calc",this).call(this);var n=this.state;n.xPositions=[],n.widths=[];var i=0;n.sliceTotals.map(function(e){var a=t.width*e/n.grandTotal;n.widths.push(a),n.xPositions.push(i),i+=a;});}},{key:"makeDataByIndex",value:function(){}},{key:"bindTooltip",value:function(){var t=this,e=this.state;this.container.addEventListener("mousemove",function(n){var i=t.components.get("percentageBars").store,a=n.target;if(i.includes(a)){var r=i.indexOf(a),s=getOffset(t.container),o=getOffset(a),l=o.left-s.left+parseInt(a.getAttribute("width"))/2,u=o.top-s.top,c=(t.formattedLabels&&t.formattedLabels.length>0?t.formattedLabels[r]:t.state.labels[r])+": ",h=e.sliceTotals[r]/e.grandTotal;t.tip.setValues(l,u,{name:c,value:(100*h).toFixed(1)+"%"}),t.tip.showTip();}});}}]),e}(AggregationChart),_createClass$5=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i);}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),_get$2=function t(e,n,i){null===e&&(e=Function.prototype);var a=Object.getOwnPropertyDescriptor(e,n);if(void 0===a){var r=Object.getPrototypeOf(e);return null===r?void 0:t(r,n,i)}if("value"in a)return a.value;var s=a.get;if(void 0!==s)return s.call(i)},PieChart=function(t){function e(t,n){_classCallCheck$6(this,e);var i=_possibleConstructorReturn$2(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return i.type="pie",i.initTimeout=0,i.init=1,i.setup(),i}return _inherits$2(e,t),_createClass$5(e,[{key:"configure",value:function(t){_get$2(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"configure",this).call(this,t),this.mouseMove=this.mouseMove.bind(this),this.mouseLeave=this.mouseLeave.bind(this),this.hoverRadio=t.hoverRadio||.1,this.config.startAngle=t.startAngle||0,this.clockWise=t.clockWise||!1;}},{key:"calc",value:function(){var t=this;_get$2(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"calc",this).call(this);var n=this.state;this.radius=this.height>this.width?this.center.x:this.center.y;var i=this.radius,a=this.clockWise,r=n.slicesProperties||[];n.sliceStrings=[],n.slicesProperties=[];var s=180-this.config.startAngle;n.sliceTotals.map(function(e,o){var l=s,u=e/n.grandTotal*FULL_ANGLE,c=u>180?1:0,h=a?-u:u,d=s+=h,f=getPositionByAngle(l,i),p=getPositionByAngle(d,i),v=t.init&&r[o],g=void 0,y=void 0;t.init?(g=v?v.startPosition:f,y=v?v.endPosition:f):(g=f,y=p);var m=360===u?makeCircleStr(g,y,t.center,t.radius,a,c):makeArcPathStr(g,y,t.center,t.radius,a,c);n.sliceStrings.push(m),n.slicesProperties.push({startPosition:f,endPosition:p,value:e,total:n.grandTotal,startAngle:l,endAngle:d,angle:h});}),this.init=0;}},{key:"setupComponents",value:function(){var t=this.state,e=[["pieSlices",{},function(){return {sliceStrings:t.sliceStrings,colors:this.colors}}.bind(this)]];this.components=new Map(e.map(function(t){var e=getComponent.apply(void 0,_toConsumableArray$2(t));return [t[0],e]}));}},{key:"calTranslateByAngle",value:function(t){var e=this.radius,n=this.hoverRadio,i=getPositionByAngle(t.startAngle+t.angle/2,e);return "translate3d("+i.x*n+"px,"+i.y*n+"px,0)"}},{key:"hoverSlice",value:function(t,e,n,i){if(t){var a=this.colors[e];if(n){transform(t,this.calTranslateByAngle(this.state.slicesProperties[e])),t.style.fill=lightenDarkenColor(a,50);var r=getOffset(this.svg),s=i.pageX-r.left+10,o=i.pageY-r.top-10,l=(this.formatted_labels&&this.formatted_labels.length>0?this.formatted_labels[e]:this.state.labels[e])+": ",u=(100*this.state.sliceTotals[e]/this.state.grandTotal).toFixed(1);this.tip.setValues(s,o,{name:l,value:u+"%"}),this.tip.showTip();}else transform(t,"translate3d(0,0,0)"),this.tip.hideTip(),t.style.fill=a;}}},{key:"bindTooltip",value:function(){this.container.addEventListener("mousemove",this.mouseMove),this.container.addEventListener("mouseleave",this.mouseLeave);}},{key:"mouseMove",value:function(t){var e=t.target,n=this.components.get("pieSlices").store,i=this.curActiveSliceIndex,a=this.curActiveSlice;if(n.includes(e)){var r=n.indexOf(e);this.hoverSlice(a,i,!1),this.curActiveSlice=e,this.curActiveSliceIndex=r,this.hoverSlice(e,r,!0,t);}else this.mouseLeave();}},{key:"mouseLeave",value:function(){this.hoverSlice(this.curActiveSlice,this.curActiveSliceIndex,!1);}}]),e}(AggregationChart),_slicedToArray$4=function(){function t(t,e){var n=[],i=!0,a=!1,r=void 0;try{for(var s,o=t[Symbol.iterator]();!(i=(s=o.next()).done)&&(n.push(s.value),!e||n.length!==e);i=!0);}catch(t){a=!0,r=t;}finally{try{!i&&o.return&&o.return();}finally{if(a)throw r}}return n}return function(e,n){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return t(e,n);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),_createClass$6=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i);}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),COL_WIDTH=HEATMAP_SQUARE_SIZE+HEATMAP_GUTTER_SIZE,ROW_HEIGHT=COL_WIDTH,Heatmap=function(t){function e(t,n){_classCallCheck$7(this,e);var i=_possibleConstructorReturn$3(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));i.type="heatmap",i.countLabel=n.countLabel||"";var a=["Sunday","Monday"],r=a.includes(n.startSubDomain)?n.startSubDomain:"Sunday";return i.startSubDomainIndex=a.indexOf(r),i.setup(),i}return _inherits$3(e,t),_createClass$6(e,[{key:"setMeasures",value:function(t){var e=this.measures;this.discreteDomains=0===t.discreteDomains?0:1,e.paddings.top=3*ROW_HEIGHT,e.paddings.bottom=0,e.legendHeight=2*ROW_HEIGHT,e.baseHeight=ROW_HEIGHT*NO_OF_DAYS_IN_WEEK+getExtraHeight(e);var n=this.data,i=this.discreteDomains?NO_OF_YEAR_MONTHS:0;this.independentWidth=(getWeeksBetween(n.start,n.end)+i)*COL_WIDTH+getExtraWidth(e);}},{key:"updateWidth",value:function(){var t=this.discreteDomains?NO_OF_YEAR_MONTHS:0,e=this.state.noOfWeeks?this.state.noOfWeeks:52;this.baseWidth=(e+t)*COL_WIDTH+getExtraWidth(this.measures);}},{key:"prepareData",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.data;if(t.start&&t.end&&t.start>t.end)throw new Error("Start date cannot be greater than end date.");if(t.start||(t.start=new Date,t.start.setFullYear(t.start.getFullYear()-1)),t.end||(t.end=new Date),t.dataPoints=t.dataPoints||{},parseInt(Object.keys(t.dataPoints)[0])>1e5){var e={};Object.keys(t.dataPoints).forEach(function(n){var i=new Date(n*NO_OF_MILLIS);e[getYyyyMmDd(i)]=t.dataPoints[n];}),t.dataPoints=e;}return t}},{key:"calc",value:function(){var t=this.state;t.start=clone(this.data.start),t.end=clone(this.data.end),t.firstWeekStart=clone(t.start),t.noOfWeeks=getWeeksBetween(t.start,t.end),t.distribution=calcDistribution(Object.values(this.data.dataPoints),HEATMAP_DISTRIBUTION_SIZE),t.domainConfigs=this.getDomains();}},{key:"setupComponents",value:function(){var t=this,e=this.state,n=this.discreteDomains?0:1,i=e.domainConfigs.map(function(i,a){return ["heatDomain",{index:i.index,colWidth:COL_WIDTH,rowHeight:ROW_HEIGHT,squareSize:HEATMAP_SQUARE_SIZE,radius:t.rawChartArgs.radius||0,xTranslate:e.domainConfigs.filter(function(t,e){return e<a}).map(function(t){return t.cols.length-n}).reduce(function(t,e){return t+e},0)*COL_WIDTH},function(){return e.domainConfigs[a]}.bind(t)]});this.components=new Map(i.map(function(t,e){var n=getComponent.apply(void 0,_toConsumableArray$3(t));return [t[0]+"-"+e,n]}));var a=0;DAY_NAMES_SHORT.forEach(function(e,n){if([1,3,5].includes(n)){var i=makeText("subdomain-name",-COL_WIDTH/2,a,e,{fontSize:HEATMAP_SQUARE_SIZE,dy:8,textAnchor:"end"});t.drawArea.appendChild(i);}a+=ROW_HEIGHT;});}},{key:"update",value:function(t){t||console.error("No data to update."),this.data=this.prepareData(t),this.draw(),this.bindTooltip();}},{key:"bindTooltip",value:function(){var t=this;this.container.addEventListener("mousemove",function(e){t.components.forEach(function(n){var i=n.store,a=e.target;if(i.includes(a)){var r=a.getAttribute("data-value"),s=a.getAttribute("data-date").split("-"),o=getMonthName(parseInt(s[1])-1,!0),l=t.container.getBoundingClientRect(),u=a.getBoundingClientRect(),c=parseInt(e.target.getAttribute("width")),h=u.left-l.left+c/2,d=u.top-l.top,f=r+" "+t.countLabel,p=" on "+o+" "+s[0]+", "+s[2];t.tip.setValues(h,d,{name:p,value:f,valueFirst:1},[]),t.tip.showTip();}});});}},{key:"renderLegend",value:function(){var t=this;this.legendArea.textContent="";var e=0,n=ROW_HEIGHT,i=this.rawChartArgs.radius||0,a=makeText("subdomain-name",e,n,"Less",{fontSize:HEATMAP_SQUARE_SIZE+1,dy:9});e=2*COL_WIDTH+COL_WIDTH/2,this.legendArea.appendChild(a),this.colors.slice(0,HEATMAP_DISTRIBUTION_SIZE).map(function(a,r){var s=heatSquare("heatmap-legend-unit",e+(COL_WIDTH+3)*r,n,HEATMAP_SQUARE_SIZE,i,a);t.legendArea.appendChild(s);});var r=makeText("subdomain-name",e+HEATMAP_DISTRIBUTION_SIZE*(COL_WIDTH+3)+COL_WIDTH/4,n,"More",{fontSize:HEATMAP_SQUARE_SIZE+1,dy:9});this.legendArea.appendChild(r);}},{key:"getDomains",value:function(){for(var t=this.state,e=[t.start.getMonth(),t.start.getFullYear()],n=e[0],i=e[1],a=[t.end.getMonth(),t.end.getFullYear()],r=a[0]-n+1+12*(a[1]-i),s=[],o=clone(t.start),l=0;l<r;l++){var u=t.end;if(!areInSameMonth(o,t.end)){var c=[o.getMonth(),o.getFullYear()];u=getLastDateInMonth(c[0],c[1]);}s.push(this.getDomainConfig(o,u)),addDays(u,1),o=u;}return s}},{key:"getDomainConfig",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"",n=[t.getMonth(),t.getFullYear()],i=n[0],a=n[1],r=setDayToSunday(t),s={index:i,cols:[]};addDays(e=clone(e)||getLastDateInMonth(i,a),1);for(var o=getWeeksBetween(r,e),l=[],u=void 0,c=0;c<o;c++)u=this.getCol(r,i),l.push(u),addDays(r=new Date(u[NO_OF_DAYS_IN_WEEK-1].yyyyMmDd),1);return void 0!==u[NO_OF_DAYS_IN_WEEK-1].dataValue&&(addDays(r,1),l.push(this.getCol(r,i,!0))),s.cols=l,s}},{key:"getCol",value:function(t,e){for(var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2],i=this.state,a=clone(t),r=[],s=0;s<NO_OF_DAYS_IN_WEEK;s++,addDays(a,1)){var o={},l=a>=i.start&&a<=i.end;n||a.getMonth()!==e||!l?o.yyyyMmDd=getYyyyMmDd(a):o=this.getSubDomainConfig(a),r.push(o);}return r}},{key:"getSubDomainConfig",value:function(t){var e=getYyyyMmDd(t),n=this.data.dataPoints[e];return {yyyyMmDd:e,dataValue:n||0,fill:this.colors[getMaxCheckpoint(n,this.state.distribution)]}}}]),e}(BaseChart),_createClass$7=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i);}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),_get$3=function t(e,n,i){null===e&&(e=Function.prototype);var a=Object.getOwnPropertyDescriptor(e,n);if(void 0===a){var r=Object.getPrototypeOf(e);return null===r?void 0:t(r,n,i)}if("value"in a)return a.value;var s=a.get;if(void 0!==s)return s.call(i)},AxisChart=function(t){function e(t,n){_classCallCheck$8(this,e);var i=_possibleConstructorReturn$4(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return i.barOptions=n.barOptions||{},i.lineOptions=n.lineOptions||{},i.type=n.type||"line",i.init=1,i.setup(),i}return _inherits$4(e,t),_createClass$7(e,[{key:"setMeasures",value:function(){this.data.datasets.length<=1&&(this.config.showLegend=0,this.measures.paddings.bottom=30);}},{key:"configure",value:function(t){_get$3(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"configure",this).call(this,t),t.axisOptions=t.axisOptions||{},t.tooltipOptions=t.tooltipOptions||{},this.config.xAxisMode=t.axisOptions.xAxisMode||"span",this.config.yAxisMode=t.axisOptions.yAxisMode||"span",this.config.xIsSeries=t.axisOptions.xIsSeries||0,this.config.shortenYAxisNumbers=t.axisOptions.shortenYAxisNumbers||0,this.config.formatTooltipX=t.tooltipOptions.formatTooltipX,this.config.formatTooltipY=t.tooltipOptions.formatTooltipY,this.config.valuesOverPoints=t.valuesOverPoints;}},{key:"prepareData",value:function(){return dataPrep(arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.data,this.type)}},{key:"prepareFirstData",value:function(){return zeroDataPrep(arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.data)}},{key:"calc",value:function(){var t=arguments.length>0&&void 0!==arguments[0]&&arguments[0];this.calcXPositions(),t||this.calcYAxisParameters(this.getAllYValues(),"line"===this.type),this.makeDataByIndex();}},{key:"calcXPositions",value:function(){var t=this.state,e=this.data.labels;t.datasetLength=e.length,t.unitWidth=this.width/t.datasetLength,t.xOffset=t.unitWidth/2,t.xAxis={labels:e,positions:e.map(function(e,n){return floatTwo(t.xOffset+n*t.unitWidth)})};}},{key:"calcYAxisParameters",value:function(t){var e=calcChartIntervals(t,arguments.length>1&&void 0!==arguments[1]?arguments[1]:"false"),n=this.height/getValueRange(e),i=getIntervalSize(e)*n,a=this.height-getZeroIndex(e)*i;this.state.yAxis={labels:e,positions:e.map(function(t){return a-t*n}),scaleMultiplier:n,zeroLine:a},this.calcDatasetPoints(),this.calcYExtremes(),this.calcYRegions();}},{key:"calcDatasetPoints",value:function(){var t=this.state,e=function(e){return e.map(function(e){return scale(e,t.yAxis)})};t.datasets=this.data.datasets.map(function(t,n){var i=t.values,a=t.cumulativeYs||[];return {name:t.name,index:n,chartType:t.chartType,values:i,yPositions:e(i),cumulativeYs:a,cumulativeYPos:e(a)}});}},{key:"calcYExtremes",value:function(){var t=this.state;if(this.barOptions.stacked)return void(t.yExtremes=t.datasets[t.datasets.length-1].cumulativeYPos);t.yExtremes=new Array(t.datasetLength).fill(9999),t.datasets.map(function(e){e.yPositions.map(function(e,n){e<t.yExtremes[n]&&(t.yExtremes[n]=e);});});}},{key:"calcYRegions",value:function(){var t=this.state;this.data.yMarkers&&(this.state.yMarkers=this.data.yMarkers.map(function(e){return e.position=scale(e.value,t.yAxis),e.options||(e.options={}),e})),this.data.yRegions&&(this.state.yRegions=this.data.yRegions.map(function(e){return e.startPos=scale(e.start,t.yAxis),e.endPos=scale(e.end,t.yAxis),e.options||(e.options={}),e}));}},{key:"getAllYValues",value:function(){var t,e=this,n="values";if(this.barOptions.stacked){n="cumulativeYs";var i=new Array(this.state.datasetLength).fill(0);this.data.datasets.map(function(t,a){var r=e.data.datasets[a].values;t[n]=i=i.map(function(t,e){return t+r[e]});});}var a=this.data.datasets.map(function(t){return t[n]});return this.data.yMarkers&&a.push(this.data.yMarkers.map(function(t){return t.value})),this.data.yRegions&&this.data.yRegions.map(function(t){a.push([t.end,t.start]);}),(t=[]).concat.apply(t,_toConsumableArray$5(a))}},{key:"setupComponents",value:function(){var t=this,e=[["yAxis",{mode:this.config.yAxisMode,width:this.width,shortenNumbers:this.config.shortenYAxisNumbers},function(){return this.state.yAxis}.bind(this)],["xAxis",{mode:this.config.xAxisMode,height:this.height},function(){var t=this.state;return t.xAxis.calcLabels=getShortenedLabels(this.width,t.xAxis.labels,this.config.xIsSeries),t.xAxis}.bind(this)],["yRegions",{width:this.width,pos:"right"},function(){return this.state.yRegions}.bind(this)]],n=this.state.datasets.filter(function(t){return "bar"===t.chartType}),i=this.state.datasets.filter(function(t){return "line"===t.chartType}),a=n.map(function(e){var i=e.index;return ["barGraph-"+e.index,{index:i,color:t.colors[i],stacked:t.barOptions.stacked,valuesOverPoints:t.config.valuesOverPoints,minHeight:t.height*MIN_BAR_PERCENT_HEIGHT},function(){var t=this.state,e=t.datasets[i],a=this.barOptions.stacked,r=this.barOptions.spaceRatio||BAR_CHART_SPACE_RATIO,s=t.unitWidth*(1-r),o=s/(a?1:n.length),l=t.xAxis.positions.map(function(t){return t-s/2});a||(l=l.map(function(t){return t+o*i}));var u=new Array(t.datasetLength).fill("");this.config.valuesOverPoints&&(u=a&&e.index===t.datasets.length-1?e.cumulativeYs:e.values);var c=new Array(t.datasetLength).fill(0);return a&&(c=e.yPositions.map(function(t,n){return t-e.cumulativeYPos[n]})),{xPositions:l,yPositions:e.yPositions,offsets:c,labels:u,zeroLine:t.yAxis.zeroLine,barsWidth:s,barWidth:o}}.bind(t)]}),r=i.map(function(e){var n=e.index;return ["lineGraph-"+e.index,{index:n,color:t.colors[n],svgDefs:t.svgDefs,heatline:t.lineOptions.heatline,regionFill:t.lineOptions.regionFill,spline:t.lineOptions.spline,hideDots:t.lineOptions.hideDots,hideLine:t.lineOptions.hideLine,valuesOverPoints:t.config.valuesOverPoints},function(){var t=this.state,e=t.datasets[n],i=t.yAxis.positions[0]<t.yAxis.zeroLine?t.yAxis.positions[0]:t.yAxis.zeroLine;return {xPositions:t.xAxis.positions,yPositions:e.yPositions,values:e.values,zeroLine:i,radius:this.lineOptions.dotSize||LINE_CHART_DOT_SIZE}}.bind(t)]}),s=[["yMarkers",{width:this.width,pos:"right"},function(){return this.state.yMarkers}.bind(this)]];e=e.concat(a,r,s);var o=["yMarkers","yRegions"];this.dataUnitComponents=[],this.components=new Map(e.filter(function(e){return !o.includes(e[0])||t.state[e[0]]}).map(function(e){var n=getComponent.apply(void 0,_toConsumableArray$5(e));return (e[0].includes("lineGraph")||e[0].includes("barGraph"))&&t.dataUnitComponents.push(n),[e[0],n]}));}},{key:"makeDataByIndex",value:function(){var t=this;this.dataByIndex={};var e=this.state,n=this.config.formatTooltipX,i=this.config.formatTooltipY;e.xAxis.labels.map(function(a,r){var s=t.state.datasets.map(function(e,n){var a=e.values[r];return {title:e.name,value:a,yPos:e.yPositions[r],color:t.colors[n],formatted:i?i(a):a}});t.dataByIndex[r]={label:a,formattedLabel:n?n(a):a,xPos:e.xAxis.positions[r],values:s,yExtreme:e.yExtremes[r]};});}},{key:"bindTooltip",value:function(){var t=this;this.container.addEventListener("mousemove",function(e){var n=t.measures,i=getOffset(t.container),a=e.pageX-i.left-getLeftOffset(n),r=e.pageY-i.top;r<t.height+getTopOffset(n)&&r>getTopOffset(n)?t.mapTooltipXPosition(a):t.tip.hideTip();});}},{key:"mapTooltipXPosition",value:function(t){var e=this.state;if(e.yExtremes){var n=getClosestInArray(t,e.xAxis.positions,!0);if(n>=0){var i=this.dataByIndex[n];this.tip.setValues(i.xPos+this.tip.offset.x,i.yExtreme+this.tip.offset.y,{name:i.formattedLabel,value:""},i.values,n),this.tip.showTip();}}}},{key:"renderLegend",value:function(){var t=this,e=this.data;e.datasets.length>1&&(this.legendArea.textContent="",e.datasets.map(function(e,n){var i=AXIS_LEGEND_BAR_SIZE,a=legendBar(i*n,"0",i,t.colors[n],e.name,t.config.truncateLegends);t.legendArea.appendChild(a);}));}},{key:"makeOverlay",value:function(){var t=this;if(this.init)return void(this.init=0);this.overlayGuides&&this.overlayGuides.forEach(function(t){var e=t.overlay;e.parentNode.removeChild(e);}),this.overlayGuides=this.dataUnitComponents.map(function(t){return {type:t.unitType,overlay:void 0,units:t.units}}),void 0===this.state.currentIndex&&(this.state.currentIndex=this.state.datasetLength-1),this.overlayGuides.map(function(e){var n=e.units[t.state.currentIndex];e.overlay=makeOverlay[e.type](n),t.drawArea.appendChild(e.overlay);});}},{key:"updateOverlayGuides",value:function(){this.overlayGuides&&this.overlayGuides.forEach(function(t){var e=t.overlay;e.parentNode.removeChild(e);});}},{key:"bindOverlay",value:function(){var t=this;this.parent.addEventListener("data-select",function(){t.updateOverlay();});}},{key:"bindUnits",value:function(){var t=this;this.dataUnitComponents.map(function(e){e.units.map(function(e){e.addEventListener("click",function(){var n=e.getAttribute("data-point-index");t.setCurrentDataPoint(n);});});}),this.tip.container.addEventListener("click",function(){var e=t.tip.container.getAttribute("data-point-index");t.setCurrentDataPoint(e);});}},{key:"updateOverlay",value:function(){var t=this;this.overlayGuides.map(function(e){var n=e.units[t.state.currentIndex];updateOverlay[e.type](n,e.overlay);});}},{key:"onLeftArrow",value:function(){this.setCurrentDataPoint(this.state.currentIndex-1);}},{key:"onRightArrow",value:function(){this.setCurrentDataPoint(this.state.currentIndex+1);}},{key:"getDataPoint",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.state.currentIndex,e=this.state;return {index:t,label:e.xAxis.labels[t],values:e.datasets.map(function(e){return e.values[t]})}}},{key:"setCurrentDataPoint",value:function(t){var e=this.state;(t=parseInt(t))<0&&(t=0),t>=e.xAxis.labels.length&&(t=e.xAxis.labels.length-1),t!==e.currentIndex&&(e.currentIndex=t,fire(this.parent,"data-select",this.getDataPoint()));}},{key:"addDataPoint",value:function(t,n){var i=arguments.length>2&&void 0!==arguments[2]?arguments[2]:this.state.datasetLength;_get$3(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"addDataPoint",this).call(this,t,n,i),this.data.labels.splice(i,0,t),this.data.datasets.map(function(t,e){t.values.splice(i,0,n[e]);}),this.update(this.data);}},{key:"removeDataPoint",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:this.state.datasetLength-1;this.data.labels.length<=1||(_get$3(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"removeDataPoint",this).call(this,t),this.data.labels.splice(t,1),this.data.datasets.map(function(e){e.values.splice(t,1);}),this.update(this.data));}},{key:"updateDataset",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;this.data.datasets[e].values=t,this.update(this.data);}},{key:"updateDatasets",value:function(t){this.data.datasets.map(function(e,n){t[n]&&(e.values=t[n]);}),this.update(this.data);}}]),e}(BaseChart),_createClass$8=function(){function t(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i);}}return function(e,n,i){return n&&t(e.prototype,n),i&&t(e,i),e}}(),_get$4=function t(e,n,i){null===e&&(e=Function.prototype);var a=Object.getOwnPropertyDescriptor(e,n);if(void 0===a){var r=Object.getPrototypeOf(e);return null===r?void 0:t(r,n,i)}if("value"in a)return a.value;var s=a.get;if(void 0!==s)return s.call(i)},DonutChart=function(t){function e(t,n){_classCallCheck$9(this,e);var i=_possibleConstructorReturn$5(this,(e.__proto__||Object.getPrototypeOf(e)).call(this,t,n));return i.type="donut",i.initTimeout=0,i.init=1,i.setup(),i}return _inherits$5(e,t),_createClass$8(e,[{key:"configure",value:function(t){_get$4(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"configure",this).call(this,t),this.mouseMove=this.mouseMove.bind(this),this.mouseLeave=this.mouseLeave.bind(this),this.hoverRadio=t.hoverRadio||.1,this.config.startAngle=t.startAngle||0,this.clockWise=t.clockWise||!1,this.strokeWidth=t.strokeWidth||30;}},{key:"calc",value:function(){var t=this;_get$4(e.prototype.__proto__||Object.getPrototypeOf(e.prototype),"calc",this).call(this);var n=this.state;this.radius=this.height>this.width?this.center.x-this.strokeWidth/2:this.center.y-this.strokeWidth/2;var i=this.radius,a=this.clockWise,r=n.slicesProperties||[];n.sliceStrings=[],n.slicesProperties=[];var s=180-this.config.startAngle;n.sliceTotals.map(function(e,o){var l=s,u=e/n.grandTotal*FULL_ANGLE,c=u>180?1:0,h=a?-u:u,d=s+=h,f=getPositionByAngle(l,i),p=getPositionByAngle(d,i),v=t.init&&r[o],g=void 0,y=void 0;t.init?(g=v?v.startPosition:f,y=v?v.endPosition:f):(g=f,y=p);var m=360===u?makeStrokeCircleStr(g,y,t.center,t.radius,t.clockWise,c):makeArcStrokePathStr(g,y,t.center,t.radius,t.clockWise,c);n.sliceStrings.push(m),n.slicesProperties.push({startPosition:f,endPosition:p,value:e,total:n.grandTotal,startAngle:l,endAngle:d,angle:h});}),this.init=0;}},{key:"setupComponents",value:function(){var t=this.state,e=[["donutSlices",{},function(){return {sliceStrings:t.sliceStrings,colors:this.colors,strokeWidth:this.strokeWidth}}.bind(this)]];this.components=new Map(e.map(function(t){var e=getComponent.apply(void 0,_toConsumableArray$7(t));return [t[0],e]}));}},{key:"calTranslateByAngle",value:function(t){var e=this.radius,n=this.hoverRadio,i=getPositionByAngle(t.startAngle+t.angle/2,e);return "translate3d("+i.x*n+"px,"+i.y*n+"px,0)"}},{key:"hoverSlice",value:function(t,e,n,i){if(t){var a=this.colors[e];if(n){transform(t,this.calTranslateByAngle(this.state.slicesProperties[e])),t.style.stroke=lightenDarkenColor(a,50);var r=getOffset(this.svg),s=i.pageX-r.left+10,o=i.pageY-r.top-10,l=(this.formatted_labels&&this.formatted_labels.length>0?this.formatted_labels[e]:this.state.labels[e])+": ",u=(100*this.state.sliceTotals[e]/this.state.grandTotal).toFixed(1);this.tip.setValues(s,o,{name:l,value:u+"%"}),this.tip.showTip();}else transform(t,"translate3d(0,0,0)"),this.tip.hideTip(),t.style.stroke=a;}}},{key:"bindTooltip",value:function(){this.container.addEventListener("mousemove",this.mouseMove),this.container.addEventListener("mouseleave",this.mouseLeave);}},{key:"mouseMove",value:function(t){var e=t.target,n=this.components.get("donutSlices").store,i=this.curActiveSliceIndex,a=this.curActiveSlice;if(n.includes(e)){var r=n.indexOf(e);this.hoverSlice(a,i,!1),this.curActiveSlice=e,this.curActiveSliceIndex=r,this.hoverSlice(e,r,!0,t);}else this.mouseLeave();}},{key:"mouseLeave",value:function(){this.hoverSlice(this.curActiveSlice,this.curActiveSliceIndex,!1);}}]),e}(AggregationChart),chartTypes={bar:AxisChart,line:AxisChart,percentage:PercentageChart,heatmap:Heatmap,pie:PieChart,donut:DonutChart},Chart=function t(e,n){return _classCallCheck(this,t),getChartByType(n.type,e,n)};exports.Chart=Chart,exports.PercentageChart=PercentageChart,exports.PieChart=PieChart,exports.Heatmap=Heatmap,exports.AxisChart=AxisChart;

    });

    unwrapExports(frappeCharts_min_cjs);
    var frappeCharts_min_cjs_1 = frappeCharts_min_cjs.Chart;
    var frappeCharts_min_cjs_2 = frappeCharts_min_cjs.PercentageChart;
    var frappeCharts_min_cjs_3 = frappeCharts_min_cjs.PieChart;
    var frappeCharts_min_cjs_4 = frappeCharts_min_cjs.Heatmap;
    var frappeCharts_min_cjs_5 = frappeCharts_min_cjs.AxisChart;

    /* Users/rmartinezvel/Desktop/codigo/glbal-hack/node_modules/svelte-frappe-charts/src/components/base.svelte generated by Svelte v3.23.0 */
    const file$8 = "Users/rmartinezvel/Desktop/codigo/glbal-hack/node_modules/svelte-frappe-charts/src/components/base.svelte";

    function create_fragment$a(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			add_location(div, file$8, 67, 0, 1353);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			/*div_binding*/ ctx[14](div);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[14](null);
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
    	let { data = {
    		labels: [],
    		datasets: [{ values: [] }],
    		yMarkers: {},
    		yRegions: []
    	} } = $$props;

    	let { type = "line" } = $$props;
    	let { height = 300 } = $$props;
    	let { axisOptions = {} } = $$props;
    	let { barOptions = {} } = $$props;
    	let { lineOptions = {} } = $$props;
    	let { tooltipOptions = {} } = $$props;
    	let { colors = [] } = $$props;
    	let { valuesOverPoints = 0 } = $$props;
    	let { isNavigable = false } = $$props;
    	let { maxSlices = 3 } = $$props;

    	function exportChart() {
    		if (chart) {
    			chart.export();
    		}
    	}

    	/**
     *  COMPONENT
     */
    	//  The Chart returned from frappe
    	let chart = null;

    	//  DOM node for frappe to latch onto
    	let chartRef;

    	onMount(() => {
    		chart = new frappeCharts_min_cjs_1(chartRef,
    		{
    				data,
    				type,
    				height,
    				colors,
    				axisOptions,
    				barOptions,
    				lineOptions,
    				tooltipOptions,
    				valuesOverPoints,
    				isNavigable,
    				maxSlices
    			});
    	});

    	//  Update the chart when incoming data changes
    	afterUpdate(() => chart.update(data));

    	//  Mark Chart references for garbage collection when component is unmounted
    	onDestroy(() => {
    		chart = null;
    	});

    	const writable_props = [
    		"data",
    		"type",
    		"height",
    		"axisOptions",
    		"barOptions",
    		"lineOptions",
    		"tooltipOptions",
    		"colors",
    		"valuesOverPoints",
    		"isNavigable",
    		"maxSlices"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Base> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Base", $$slots, []);

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, chartRef = $$value);
    		});
    	}

    	$$self.$set = $$props => {
    		if ("data" in $$props) $$invalidate(1, data = $$props.data);
    		if ("type" in $$props) $$invalidate(2, type = $$props.type);
    		if ("height" in $$props) $$invalidate(3, height = $$props.height);
    		if ("axisOptions" in $$props) $$invalidate(4, axisOptions = $$props.axisOptions);
    		if ("barOptions" in $$props) $$invalidate(5, barOptions = $$props.barOptions);
    		if ("lineOptions" in $$props) $$invalidate(6, lineOptions = $$props.lineOptions);
    		if ("tooltipOptions" in $$props) $$invalidate(7, tooltipOptions = $$props.tooltipOptions);
    		if ("colors" in $$props) $$invalidate(8, colors = $$props.colors);
    		if ("valuesOverPoints" in $$props) $$invalidate(9, valuesOverPoints = $$props.valuesOverPoints);
    		if ("isNavigable" in $$props) $$invalidate(10, isNavigable = $$props.isNavigable);
    		if ("maxSlices" in $$props) $$invalidate(11, maxSlices = $$props.maxSlices);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		afterUpdate,
    		onDestroy,
    		Chart: frappeCharts_min_cjs_1,
    		data,
    		type,
    		height,
    		axisOptions,
    		barOptions,
    		lineOptions,
    		tooltipOptions,
    		colors,
    		valuesOverPoints,
    		isNavigable,
    		maxSlices,
    		exportChart,
    		chart,
    		chartRef
    	});

    	$$self.$inject_state = $$props => {
    		if ("data" in $$props) $$invalidate(1, data = $$props.data);
    		if ("type" in $$props) $$invalidate(2, type = $$props.type);
    		if ("height" in $$props) $$invalidate(3, height = $$props.height);
    		if ("axisOptions" in $$props) $$invalidate(4, axisOptions = $$props.axisOptions);
    		if ("barOptions" in $$props) $$invalidate(5, barOptions = $$props.barOptions);
    		if ("lineOptions" in $$props) $$invalidate(6, lineOptions = $$props.lineOptions);
    		if ("tooltipOptions" in $$props) $$invalidate(7, tooltipOptions = $$props.tooltipOptions);
    		if ("colors" in $$props) $$invalidate(8, colors = $$props.colors);
    		if ("valuesOverPoints" in $$props) $$invalidate(9, valuesOverPoints = $$props.valuesOverPoints);
    		if ("isNavigable" in $$props) $$invalidate(10, isNavigable = $$props.isNavigable);
    		if ("maxSlices" in $$props) $$invalidate(11, maxSlices = $$props.maxSlices);
    		if ("chart" in $$props) chart = $$props.chart;
    		if ("chartRef" in $$props) $$invalidate(0, chartRef = $$props.chartRef);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		chartRef,
    		data,
    		type,
    		height,
    		axisOptions,
    		barOptions,
    		lineOptions,
    		tooltipOptions,
    		colors,
    		valuesOverPoints,
    		isNavigable,
    		maxSlices,
    		exportChart,
    		chart,
    		div_binding
    	];
    }

    class Base extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {
    			data: 1,
    			type: 2,
    			height: 3,
    			axisOptions: 4,
    			barOptions: 5,
    			lineOptions: 6,
    			tooltipOptions: 7,
    			colors: 8,
    			valuesOverPoints: 9,
    			isNavigable: 10,
    			maxSlices: 11,
    			exportChart: 12
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Base",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get data() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get type() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get height() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set height(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get axisOptions() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set axisOptions(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get barOptions() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set barOptions(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lineOptions() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lineOptions(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tooltipOptions() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tooltipOptions(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get colors() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set colors(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get valuesOverPoints() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set valuesOverPoints(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isNavigable() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isNavigable(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxSlices() {
    		throw new Error("<Base>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxSlices(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get exportChart() {
    		return this.$$.ctx[12];
    	}

    	set exportChart(value) {
    		throw new Error("<Base>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/adminPage/AdminPage.svelte generated by Svelte v3.23.0 */
    const file$9 = "src/pages/adminPage/AdminPage.svelte";

    function create_fragment$b(ctx) {
    	let main;
    	let img;
    	let img_src_value;
    	let t0;
    	let t1;
    	let div1;
    	let div0;
    	let current;

    	const header = new Header({
    			props: { typeHeader: "general" },
    			$$inline: true
    		});

    	const chart = new Base({
    			props: {
    				data: /*data*/ ctx[1],
    				height: "300",
    				type: "bar",
    				colors: ["#04e84d", "#6992fc", "#fdf569"]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			img = element("img");
    			t0 = space();
    			create_component(header.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			if (img.src !== (img_src_value = /*recyclerImg*/ ctx[1])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "contentImg svelte-kvspvv");
    			attr_dev(img, "alt", "img");
    			add_location(img, file$8, 37, 0, 960);
    			attr_dev(div0, "class", "full-screen");
    			add_location(div0, file$8, 41, 0, 1070);
    			attr_dev(div1, "class", "content svelte-kvspvv");
    			add_location(div1, file$8, 40, 0, 1048);
    			attr_dev(main, "class", "svelte-kvspvv");
    			add_location(main, file$8, 36, 0, 951);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, img);
    			append_dev(main, t0);
    			mount_component(header, main, null);
    			append_dev(main, t1);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			/*div0_binding*/ ctx[6](div0);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const chart_changes = {};
    			if (dirty & /*data*/ 2) chart_changes.data = /*data*/ ctx[1];
    			chart.$set(chart_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(chart.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(chart.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(header);
    			/*div0_binding*/ ctx[6](null);
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

    function instance$a($$self, $$props, $$invalidate) {
    	let recyclerImg = "assets/img/init.jpg";

    	/** 
     * @author Raphael Martinez 
     * @description handler para agregar configuración del mapa 
     **/
    	onMount(async () => {
    		map = new google.maps.Map(container, { zoom, center });

    		map.addListener("click", function (mapsMouseEvent) {
    			marker = new google.maps.Marker({
    					position: mapsMouseEvent.latLng,
    					animation: google.maps.Animation.DROP,
    					icon: "http://maps.google.com/mapfiles/ms/micons/green-dot.png"
    				});

    			marker.setMap(map);
    			center = mapsMouseEvent.latLng.toString();
    		});
    	});

    	let container;
    	let marker;
    	let map;

    	let data = {
    		labels: ["reciclaje"],
    		datasets: [
    			{ name: "Cartón", values: [0] },
    			{ name: "Latas", values: [0] },
    			{ name: "Electrónico", values: [0] }
    		]
    	};

    	let zoom = 12;

    	let center = {
    		lat: 4.638305561012602,
    		lng: -74.08649498920173
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<AdminPage> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("AdminPage", $$slots, []);

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			$$invalidate(0, container = $$value);
    		});
    	}

    	$$self.$capture_state = () => ({
    		Header,
    		navigate,
    		onMount,
    		recyclerImg,
    		container,
    		marker,
    		map,
    		data,
    		zoom,
    		center
    	});

    	$$self.$inject_state = $$props => {
    		if ("recyclerImg" in $$props) $$invalidate(1, recyclerImg = $$props.recyclerImg);
    		if ("container" in $$props) $$invalidate(0, container = $$props.container);
    		if ("marker" in $$props) marker = $$props.marker;
    		if ("map" in $$props) map = $$props.map;
    		if ("data" in $$props) $$invalidate(1, data = $$props.data);
    		if ("zoom" in $$props) zoom = $$props.zoom;
    		if ("center" in $$props) center = $$props.center;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [container, recyclerImg, marker, map, center, zoom, div0_binding];
    }

    class AdminPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "AdminPage",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.23.0 */

    // (18:4) <Route path="/">
    function create_default_slot_1$1(ctx) {
    	let current;
    	const adminpage = new AdminPage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(adminpage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(adminpage, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(adminpage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(adminpage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(adminpage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(18:4) <Route path=\\\"/\\\">",
    		ctx
    	});

    	return block;
    }

    // (12:0) <Router url="{url}">
    function create_default_slot$1(ctx) {
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let current;

    	const route0 = new Route({
    			props: {
    				path: "register",
    				component: RegisterPage
    			},
    			$$inline: true
    		});

    	const route1 = new Route({
    			props: { path: "login", component: LoginPage },
    			$$inline: true
    		});

    	const route2 = new Route({
    			props: {
    				path: "iniciative",
    				component: IniciativePage
    			},
    			$$inline: true
    		});

    	const route3 = new Route({
    			props: { path: "admin", component: AdminPage },
    			$$inline: true
    		});

    	const route4 = new Route({
    			props: {
    				path: "recycler",
    				component: DisponserPage
    			},
    			$$inline: true
    		});

    	const route5 = new Route({
    			props: {
    				path: "/",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route0.$$.fragment);
    			t0 = space();
    			create_component(route1.$$.fragment);
    			t1 = space();
    			create_component(route2.$$.fragment);
    			t2 = space();
    			create_component(route3.$$.fragment);
    			t3 = space();
    			create_component(route4.$$.fragment);
    			t4 = space();
    			create_component(route5.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(route1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(route2, target, anchor);
    			insert_dev(target, t2, anchor);
    			mount_component(route3, target, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(route4, target, anchor);
    			insert_dev(target, t4, anchor);
    			mount_component(route5, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route5_changes = {};

    			if (dirty & /*$$scope*/ 2) {
    				route5_changes.$$scope = { dirty, ctx };
    			}

    			route5.$set(route5_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route0.$$.fragment, local);
    			transition_in(route1.$$.fragment, local);
    			transition_in(route2.$$.fragment, local);
    			transition_in(route3.$$.fragment, local);
    			transition_in(route4.$$.fragment, local);
    			transition_in(route5.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route0.$$.fragment, local);
    			transition_out(route1.$$.fragment, local);
    			transition_out(route2.$$.fragment, local);
    			transition_out(route3.$$.fragment, local);
    			transition_out(route4.$$.fragment, local);
    			transition_out(route5.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route0, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(route1, detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(route2, detaching);
    			if (detaching) detach_dev(t2);
    			destroy_component(route3, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_component(route4, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_component(route5, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(12:0) <Router url=\\\"{url}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let current;

    	const router = new Router({
    			props: {
    				url: /*url*/ ctx[0],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const router_changes = {};
    			if (dirty & /*url*/ 1) router_changes.url = /*url*/ ctx[0];

    			if (dirty & /*$$scope*/ 2) {
    				router_changes.$$scope = { dirty, ctx };
    			}

    			router.$set(router_changes);
    		},
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
    			destroy_component(router, detaching);
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
    	let { url = "" } = $$props;
    	const writable_props = ["url"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);

    	$$self.$set = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		Route,
    		MainPage,
    		RegisterPage,
    		LoginPage,
    		DisponserPage,
    		IniciativePage,
    		AdminPage,
    		url
    	});

    	$$self.$inject_state = $$props => {
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { url: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get url() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set url(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	hydrated:true,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
