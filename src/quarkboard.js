const EventEmitter = require('events');
const Plugin = require('quarkboard-plugin');

class Quarkboard extends EventEmitter {
    constructor() {
        super();

        const opts = [
            ['h',   'help',         'print this help and exit'],
            ['q',   'quiet',        'quiet output; -qq and -qqq to decrease verbosity'],
            ['v',   'verbose+',     'verbose output; -vv and -vvv to increase verbosity'],
            ['V',   'version',      'print version and exit'],
        ];

        // TODO Load plugins and pass "this" so they can hook into events

        // Fire the event so plugins can attach any options they need.
        this.emit('_getopt', opts);
        this._opts = require('node-getopt')
            .create(opts)
            .bindHelp()
            .parseSystem();
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
}

module.exports = new Quarkboard();
module.exports.Plugin = Plugin;
