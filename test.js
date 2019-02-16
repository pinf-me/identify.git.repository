
const ASSERT = require('assert');
const PATH = require('path');
const FS = require('fs');
const EXEC = require('child_process').execSync;
const RUNBASH = require('runbash');
const IDENTIFY = require('.');


describe('proofs', function () {

    it('same initial commit rev for identical content committed at the same time', async function () {

        await RUNBASH([
            'rm -Rf .~repo1 || true; mkdir .~repo1; pushd .~repo1',
                'git init',
                'echo "1" >> test.txt; git add .; git commit -m "initial 1"',
            'popd',
            'rm -Rf .~repo2 || true; mkdir .~repo2; pushd .~repo2',
                'git init',
                'echo "1" >> test.txt; git add .; git commit -m "initial 1"',
            'popd'
        ], {
            verbose: false,
            progress: false
        });

        const identity1 = IDENTIFY.docFromWorkingDirectory('.~repo1', {
            commitCount: 1
        });
        const identity2 = IDENTIFY.docFromWorkingDirectory('.~repo2', {
            commitCount: 1
        });

        ASSERT.deepEqual(identity1, identity2);
    });

});

describe('NodeJS', function () {

    it('docFromWorkingDirectory', async function () {

        await RUNBASH([
            'rm -Rf .~repo1 || true; mkdir .~repo1; pushd .~repo1',
                'git init',
                'echo "1a" >> test.txt; git add .; git commit -m "initial 1"',
                'echo "2b" >> test.txt; git add .; git commit -m "initial 2"',
                'echo "3c" >> test.txt; git add .; git commit -m "initial 3"',
            'popd',
            'rm -Rf .~repo2 || true; mkdir .~repo2; pushd .~repo2',
                'git init',
                'echo "1d" >> test.txt; git add .; git commit -m "initial 1"',
                'echo "2e" >> test.txt; git add .; git commit -m "initial 2"',
                'echo "3f" >> test.txt; git add .; git commit -m "initial 3"',
            'popd'
        ], {
            verbose: false,
            progress: false
        });

        const identity1 = IDENTIFY.docFromWorkingDirectory('.~repo1');
        const identity2 = IDENTIFY.docFromWorkingDirectory('.~repo2');

        ASSERT.notDeepEqual(identity1, identity2);
    });

});

describe('CLI', function () {

    it('from .git', async function () {

        await RUNBASH([
            'rm -Rf .~repo1 || true; mkdir .~repo1; pushd .~repo1',
                'git init',
                'echo "1a" >> test.txt; git add .; git commit -m "initial 1"',
                'echo "2b" >> test.txt; git add .; git commit -m "initial 2"',
                'echo "3c" >> test.txt; git add .; git commit -m "initial 3"',
            'popd'
        ], {
            verbose: false,
            progress: false
        });

        const identity1 = IDENTIFY.docFromWorkingDirectory('.~repo1');

        const result = EXEC('../index.js from .git', {
            cwd: PATH.join(__dirname, '.~repo1')
        }).toString();
        const doc = JSON.parse(result);

        ASSERT.deepEqual(identity1, doc);
    });

});
