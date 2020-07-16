# Quarkboard

<p align="center">
    <a href="https://david-dm.org/quarkboard/quarkboard"><img src="https://david-dm.org/quarkboard/quarkboard.svg" alt="Dependency Status"></a>
    <a href="https://david-dm.org/quarkboard/quarkboard?type=dev" title="devDependencies status"><img src="https://david-dm.org/quarkboard/quarkboard/dev-status.svg"></a>
    <a href="https://opencollective.com/quarkboard-collective" title="Quarkboard Collective Backer"><img src="https://opencollective.com/quarkboard-collective/tiers/backer/badge.svg"></a>
    <a href="https://opencollective.com/quarkboard-collective" title="Quarkboard Collective Sponsor"><img src="https://opencollective.com/quarkboard-collective/tiers/sponsor/badge.svg"></a>
    <a href="https://choosealicense.com/licenses/mit"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
</p>

**Quarkboard** is an open-source screen display framework that provides enterprise-level service for professionals and 
home-enthusiasts alike. **Quarkboard** provides a simple plugin interface that allows anybody to quickly and easily get 
started with customizing their smart mirror to their liking. From managing one single mirror to running a cluster of 
large screen displays, **Quarkboard** has something for everyone. 

## Documentation

### Installation

TBD. The goal here would be to have as simple an installation as possible on Windows, macOS, Linux, and RaspberryPI.
The first run of the application should not require much more than one command. Any persistent configuration should be 
encapsulated in the admin panel.

### Development

1. Clone: `git clone https://github.com/quarkboard/quarkboard`
    1. `git clone https://github.com/quarkboard/hadron`
    1. `git clone https://github.com/quarkboard/quarkboard-plugin`
    1. `git clone https://github.com/quarkboard/quarkboard-server`
    1. etc.
1. Install dependencies using `yarn install` for each project cloned
1. Run `yarn link` in each dependency cloned, and then follow the on-screen instructions provided by yarn for linking
   the dependencies in this main project.
1. Run the code using `yarn run start`
    * Pass `-h` or `--help` to get the command-line help screen

### Code Style

1. Keep it simple; in other words, be verbose while maintaining succinct code. For example, plugins have access to the 
   Quarkboard instance using a property called `app` and not `quarkboard`.
1. Omit braces for one-line code blocks.
1. Use camelCase for everything, except classes. Classes should use Pascal-case (i.e., UpperCamelCase).
1. Use classes liberally. This is a modern framework, using modern NodeJS.
1. Write code using Vanilla Javascript.
1. Never use `var` when defining variables; prefer `const` unless you know you'll need to modify the variable.
1. Document functions/methods as follows:
    ```javascript
    /**
     * Describe the function or method succinctly in one line.
     *
     * @param {any} parameter
     * ...
     * @returns {something}
     */
    ```
1. Use getters for accessing read-only data structures.
1. Use setters for modifying private data structures. But, use them sparingly.
1. Use methods when needing to accept parameters.
1. Always use `path.join()` instead of hard-coding path delimiters.
1. Use the Quarkboard log methods (`info`, `warn`, `error`, `debug`) instead of `console`.
1. Use spaces instead of tabs; tabstop is 4 spaces. Sorry. Not sorry.
1. Always use semicolons. Sorry. Not sorry.
1. Prefer using arrow functions. Use traditional functions when needing access to `arguments` and/or `this` for that context.
1. Alias `this` as `that` (e.g., `const that = this;`) when sharing parent context inside of a traditional function.

## Links

## Contributing Guidelines

### Code of Conduct
Everyone is welcome to participate in this project, regardless of age, sexual orientation, gender, race, or any other 
social construct du jour. In other words: we do not judge people here on anything other than how they interact with 
other people and the merits of their code. However, let us make it clear that no matter how good your code may be, if 
you cannot be respectful of others, then there is no place for you here. Period.

> Be excellent to each other, and party on...! - Bill & Ted

### Contributing

Open an issue to discuss the contribution. Currently there is no well-defined timeline for the project, but there is an
idea of how things are going to be built. Over time, we hope to define project milestones, but until then it is a good 
idea to talk things through with the project maintainers to avoid stepping on toes and/or wasting anybody's time –
including yours!

Once you are given the go-ahead on your issue, use the [standard Github forking workflow](https://guides.github.com/activities/forking/):

1. Fork the code
1. Create a branch for the work
1. Make the changes described in your issue
    * If you need to deviate from the described changes, please update the original issue.
1. Add yourself as a contributor to the `package.json` `contributors` section. Yay!
1. Make a PR using your fork and branch.
1. Address any comments and suggestions in your code review
1. Be prepared to maintain your code going forward

## License

This project utilizes the MIT open-source software license. You can find the full-text details in the 
[LICENSE](./LICENSE) file, and get a TL;DR summary from 
[tldrlegal.com](https://tldrlegal.com/license/mit-license#summary).
