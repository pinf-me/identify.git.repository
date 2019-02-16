#!/usr/bin/env node --no-warnings

'use strict';

const FS = require("fs");
const PATH = require("path");
let VERBOSE = !!process.env.VERBOSE;


// @see https://git-scm.com/book/en/v2/Git-Internals-Git-Objects
// > The format for a commit object is simple: it specifies the top-level tree for the snapshot
// > of the project at that point; the author/committer information (which uses your user.name
// > and user.email configuration settings and a timestamp); a blank line, and then the commit message.
// So the first commit hash is likely going to be different for every git respository.
// Which means we can use it to identify the source code. If we then add two more commits we should
// have a reasonably stable unique base id.

const DEFAULT_OPTIONS = {
    // We use three commits to arrive at an ID
    commitCount: 3
};

exports.docFromWorkingDirectory = function (baseDir, options) {

    const MERGE = require('lodash/merge');
    const EXEC = require('child_process').execSync;
    const CRYPTO = require('crypto');

    options = MERGE({}, DEFAULT_OPTIONS, options || {});

    if (!FS.existsSync(`${baseDir}/.git`)) {
        throw new Error(`No '.git' dir found at '${baseDir}/.git'! You must create one first. Use 'git init'. You must also create a first commit. e.g. 'echo "Hello World" > README.md; git add README.md; git commit -m 'hello world'`);
    }

    let canonicalId = EXEC(`git rev-list --topo-order master | tail -n ${options.commitCount}`, {
        cwd: baseDir
    }).toString().replace(/\n$/, '');
    if (canonicalId.split("\n").length !== options.commitCount) {
        throw new Error(`The git repository at '${baseDir}' does not have at least ${options.commitCount} commits`);
    }
    if (canonicalId.split("\n").length > 1) {
        canonicalId = CRYPTO.createHash('sha1').update(canonicalId).digest('hex');
    }

    const config = FS.readFileSync(`${baseDir}/.git/config`, 'utf8');
    let originUrl = null;
    config.split("\n").forEach(function (line) {
        if (/\[\s*remote\s+"?origin"?\s*\]\s*/.test(line)) {
            originUrl = true;
        } else
        if (originUrl === true) {
            const m = line.match(/^[\s\t]*url\s*=\s*(.+)\s*$/);
            if (m) {
                originUrl = m[1];
            }
        }
    });

    const doc = {
        canonical: canonicalId
    }
    if (originUrl) {
        doc.aliases = [
            originUrl
        ];
    }
    return doc;
}


if (require.main === module) {

    const MINIMIST = require("minimist");

    async function main (args) {
        let cwd = process.cwd();
        if ((args.verbose || args.debug) && !process.env.VERBOSE) {
            process.env.VERBOSE = "1";
        }
        VERBOSE = !!process.env.VERBOSE;
        if (args.cwd) {
            cwd = PATH.resolve(cwd, args.cwd);
            process.chdir(cwd);
        }
        if (
            args._.length === 2 &&
            args._[0] === 'from' &&
            args._[1] === '.git'
        ) {
            const doc = exports.docFromWorkingDirectory(cwd);
            process.stdout.write(JSON.stringify(doc, null, 4));
        } else {
            throw new Error(`[identity.git.repository] ERROR: Command not supported!`);
        }
    }    
    main(MINIMIST(process.argv.slice(2), {
        boolean: [
            'verbose',
            'debug'
        ]
    })).catch(function (err) {
        console.error("[identify.git.repository] ERROR:", err.stack);
        process.exit(1);
    });
}
