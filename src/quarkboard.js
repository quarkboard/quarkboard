const path = require('path');
const fs = require('fs');
const EventEmitter = require('events');
const Plugin = require('@quarkboard/quarkboard-plugin');
const Server = require('@quarkboard/quarkboard-server');
const Hadron = require('@quarkboard/hadron');

class Quarkboard extends EventEmitter {
    constructor() {
        super();

        this._config = new Hadron({
            projectName: 'Quarkboard',
            projectSuffix: '',
            defaults: {
                plugins: [],
                opts: [
                    ['h',   'help',             'print this help and exit'],
                    ['p',   'plugin=PLUGIN+',   'Enable the named plugin; non-standard plugins must include plugin,/path/to/plugin'],
                    ['q',   'quiet',            'quiet output; -qq and -qqq to decrease verbosity'],
                    ['v',   'verbose+',         'verbose output; -vv and -vvv to increase verbosity'],
                    ['V',   'version',          'print version and exit'],
                ],
            }
        });
        this._plugins = [];
        this.setConfig('pjson', require('../package.json'));

        this.on('exit', (message, code = 0) => {
            if (typeof message !== 'undefined')
                console.log(message);

            process.exit(code)
        });
    }

    /**
     * Return a copy of the getopt options.
     *
     * @returns {object}
     */
    get options() {
        return Object.assign({}, this.opts.options);
    }

    /**
     * Return whether or not output is debug (-vvv).
     *
     * @returns {boolean}
     */
    get isDebug() {
        return this.isVeryVerbose && this.opts.options.verbose.length >= 3;
    }

    /**
     * Return whether or not output is silenced (-qqq).
     *
     * @returns {*|boolean}
     */
    get isSilent() {
        return this.isVeryQuiet && this.opts.options.quiet.length >= 3;
    }

    /**
     * Return whether or not output is quiet (-q).
     *
     * @returns {boolean}
     */
    get isQuiet() {
        return Array.isArray(this.opts.options.quiet) && this.opts.options.quiet.length >= 1;
    }

    /**
     * Return whether or not output is verbose (-v).
     *
     * @returns {boolean}
     */
    get isVerbose() {
        return Array.isArray(this.opts.options.verbose) && this.opts.options.verbose.length >= 1;
    }

    /**
     * Return whether or not output is very quiet (-qq).
     *
     * @returns {boolean|boolean}
     */
    get isVeryQuiet() {
        return this.isQuiet && this.opts.options.quiet.length >= 2;
    }

    /**
     * Return whether or not output is very verbose (-vv).
     *
     * @returns {boolean}
     */
    get isVeryVerbose() {
        return this.isVerbose && this.opts.options.verbose.length >= 2;
    }

    /**
     * Return an instance of getopt.
     *
     * @returns {*}
     */
    get opts() {
        return this._opts;
    }

    /**
     * Return the value of {key} if it is defined, or {def} if it doesn't.
     *
     * @param key
     * @param def
     * @returns {*}
     */
    getConfig(key, def) {
        return this._config.get(key, def);
    }

    /**
     * Return whether or not the {pluginType} is registered.
     *
     * @param plugin
     * @returns {boolean}
     */
    has(plugin) {
        for (const _plugin of this._plugins) {
            if (plugin.name === _plugin.constructor.name) {
                return true;
            }
        }

        return false;
    }

    /**
     * Return whether or not the {key} exists in the config.
     *
     * @param key
     * @returns {boolean}
     */
    hasConfig(key) {
        return this._config.has(key);
    }

    /**
     * Run the application.
     */
    run() {
        const getopt = require('node-getopt');
        const opts = this._config.get('opts');
        const plugins = this._config.get('plugins', {});

        // Parse any plugins provided by the command line.
        for (const plugin of (getopt.create(opts).error(() => {}).parseSystem().options.plugin || [])) {
            const p = plugin.split(',');
            plugins[p[0]] = {
                path: typeof p[1] !== 'undefined' ? path.resolve(p[1]) : p[0],
                enabled: true,
                core: false,
            }
        }

        this.use(Server);
        this._addPlugins(plugins);

        this._plugins.forEach((plugin) => this.emit('plugin-loading', plugin, opts));

        const that = this;
        this._opts = getopt
            .create(opts)
            .error(function (error) {
                console.error(`Error: ${error.message}\n`)
                this.showHelp();
                that.emit('exit', undefined, 1);
            })
            .bindHelp()
            .parseSystem();

        if (this.options.version !== undefined) {
            this.emit('exit', `Quarkboard v${this.getConfig('pjson.version')}`);
            return;
        }

        this._plugins.forEach((plugin) => plugin.enabled && plugin.load());
        this._plugins.forEach((plugin) => this.emit('plugin-loaded', plugin));
    }

    /**
     * Set the value of {key} to {value} in the configuration.
     *
     * @param key
     * @param value
     * @returns {Quarkboard}
     */
    setConfig(key, value) {
        this._config.set(key, value);
        return this;
    }

    /**
     * Register a new plugin.
     *
     * @param plugin
     * @param opts
     * @returns {Quarkboard}
     */
    use(plugin, opts = undefined) {
        if (!plugin instanceof Plugin) {
            throw new TypeError(`Expected type Plugin but got ${typeof plugin} instead`);
        }

        if (!this.has(plugin)) {
            this._plugins.push(new plugin(opts, this));
        }

        return this;
    }

    /**
     * Adds given plugins from the filesystem to the plugin stack.
     *
     * @param plugins
     * @returns {Quarkboard}
     * @private
     */
    _addPlugins(plugins) {
        Object.keys(plugins).forEach((name) => {
            const plugin = plugins[name];
            const pjsonFile = path.join(plugin.path, 'package.json');

            if (!fs.existsSync(pjsonFile)) {
                throw new Error(`Could not find package.json in '${plugin.path}', or path does not exist`);
            }

            const pjson = require(pjsonFile);
            const pluginClass = require(path.join(plugin.path, pjson.main));

            this.use(pluginClass);
        });

        return this;
    }
}

module.exports = new Quarkboard();
module.exports.Plugin = Plugin;
module.exports.Server = Server;
