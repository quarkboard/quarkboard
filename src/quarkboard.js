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
                    ['p',   'plugin=PLUGIN+',   'enable the named plugin; non-standard plugins must include plugin,/path/to/plugin'],
                    ['q',   'quiet',            'quiet output; -qq and -qqq to decrease verbosity'],
                    ['t',   'template',         'name of the template layout', 'grid'],
                    ['v',   'verbose+',         'verbose output; -vv and -vvv to increase verbosity'],
                    ['V',   'version',          'print version and exit'],
                ],
            }
        });
        this._plugins = [];
        this._projectRoot = path.join(__dirname, '..');
        this._pjson = require(path.join(this._projectRoot, 'package.json'));
        this._assetsRoot = path.join(this._projectRoot, 'assets');

        this.on('exit', (message, code = 0) => {
            if (typeof message !== 'undefined')
                console.log(message);

            process.exit(code)
        });

        const plugins = this.getConfig('plugins', []);

        plugins.forEach(plugin => this._appendPlugin(plugin));
        this._addPlugin('@quarkboard/quarkboard-server', true, true);
    }

    /**
     * Return the path to the assets directory.
     *
     * @returns {string}
     */
    get assetsRoot() {
        return this._assetsRoot;
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
        return this.isVeryVerbose
            && this.options.verbose.length >= 3;
    }

    /**
     * Return whether or not output is silenced (-qqq).
     *
     * @returns {*|boolean}
     */
    get isSilent() {
        return this.isVeryQuiet
            && this.options.quiet.length >= 3;
    }

    /**
     * Return whether or not output is quiet (-q).
     *
     * @returns {boolean}
     */
    get isQuiet() {
        return Array.isArray(this.options.quiet)
            && this.options.quiet.length >= 1;
    }

    /**
     * Return whether or not output is verbose (-v).
     *
     * @returns {boolean}
     */
    get isVerbose() {
        return Array.isArray(this.options.verbose)
            && this.options.verbose.length >= 1;
    }

    /**
     * Return whether or not output is very quiet (-qq).
     *
     * @returns {boolean|boolean}
     */
    get isVeryQuiet() {
        return this.isQuiet
            && this.opts.options.quiet.length >= 2;
    }

    /**
     * Return whether or not output is very verbose (-vv).
     *
     * @returns {boolean}
     */
    get isVeryVerbose() {
        return this.isVerbose
            && this.opts.options.verbose.length >= 2;
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
     * Return the JSON structure of the package.json.
     *
     * @returns {object}
     */
    get packageJson() {
        return this._pjson;
    }

    /**
     * Return a copy of the plugins array.
     *
     * @returns {[]}
     */
    get plugins() {
        return Array.from(this._plugins);
    }

    /**
     * Return the path to the project root.
     *
     * @returns {string}
     */
    get projectRoot() {
        return this._projectRoot;
    }

    debug(message, ...args) {
        if (this.isDebug)
            console.debug(message, ...args);
    }

    error(message, ...args) {
        if (!this.isVeryQuiet)
            console.error(message, ...args);
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
        for (const _plugin of this._plugins)
            if (plugin.name === _plugin.constructor.name)
                return true;

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

    info(message, ...args) {
        if (!this.isQuiet)
            console.info(message, ...args);
    }

    /**
     * Run the application.
     */
    run() {
        const getopt = require('node-getopt');
        const opts = this._config.get('opts');

        // Parse any plugins provided by the command line.
        (getopt.create(opts).error(() => {}).parseSystem().options.plugin || [])
            .forEach(plugin => this._addPlugin(plugin));

        this.plugins.filter(plugin => plugin.enabled)
            .forEach((plugin) => this.emit('plugin-loading', plugin, opts));

        const that = this;
        this._opts = getopt
            .create(opts)
            .error(function (error) {
                that.error(`Error: ${error.message}\n`)
                this.showHelp();

                that.emit('exit', undefined, 1);
            })
            .bindHelp()
            .parseSystem();

        if (this.options.version !== undefined) {
            this.emit('exit', `Quarkboard v${this.packageJson.version}`);
            return;
        }

        this.plugins.filter(plugin => plugin.enabled)
            .forEach((plugin) => plugin.load());

        this.plugins.filter(plugin => plugin.enabled)
            .forEach((plugin) => this.emit('plugin-loaded', plugin));
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
     * Add the plugin {pluginName} to the plugin stack.
     *
     * @param {string} pluginName
     * @param {boolean} enabled
     * @param {boolean} core
     * @returns {Quarkboard}
     * @private
     */
    _addPlugin(pluginName, enabled = true, core = false) {
        this._parsePlugin({
            path: pluginName,
            enabled: enabled,
            core: core,
        });
        return this;
    }

    /**
     * Adds given plugins from the filesystem to the plugin stack.
     *
     * @param plugin
     * @returns {Quarkboard}
     * @private
     */
    _parsePlugin(plugin) {
        const pjsonFile = path.join(plugin.path, 'package.json');

        try {
            const pjson = require(pjsonFile);
            const pluginClass = require(path.join(plugin.path, pjson.main));

            this.use(pluginClass);
        } catch (err) {
            throw new Error(`Could not find package.json in '${plugin.path}', or path does not exist`);
        }

        return this;
    }
}

module.exports = new Quarkboard();
module.exports.Plugin = Plugin;
module.exports.Server = Server;
