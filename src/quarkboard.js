const EventEmitter = require('events');
const Plugin = require('quarkboard-plugin');

class Quarkboard extends EventEmitter {
    constructor() {
        super();

        this._plugins = [];
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
     * Return a copy of the getopt object.
     *
     * @returns {*}
     */
    get opts() {
        return Object.assign({}, this._opts);
    }

    /**
     * Return whether or not the {pluginType} is registered or not.
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

    run() {
        const opts = [
            ['h',   'help',         'print this help and exit'],
            ['q',   'quiet',        'quiet output; -qq and -qqq to decrease verbosity'],
            ['v',   'verbose+',     'verbose output; -vv and -vvv to increase verbosity'],
            ['V',   'version',      'print version and exit'],
        ];

        this._plugins.forEach((plugin) => {
            this.emit('plugin-loading', plugin, opts);

            this._opts = require('node-getopt')
                .create(opts)
                .parseSystem();

            plugin.enabled && plugin.load();
            this.emit('plugin-loaded', plugin);
        });

        // Fire the event so plugins can attach any options they need.
        this._opts = require('node-getopt')
            .create(opts)
            .bindHelp()
            .parseSystem();
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
}

module.exports = new Quarkboard();
module.exports.Plugin = Plugin;
