const execa = require('execa');
const debug = require('debug')('semantic-release:get-version-head');
const {debugShell} = require('./debug');

/**
 * Get the commit sha for a given tag.
 *
 * @param {string} tagName Tag name for which to retrieve the commit sha.
 *
 * @return {string} The commit sha of the tag in parameter or `null`.
 */
async function gitTagHead(tagName) {
  try {
    const shell = await execa('git', ['rev-list', '-1', tagName]);
    debugShell('Get git tag head', shell, debug);
    return shell.stdout;
  } catch (err) {
    debug(err);
    return null;
  }
}

/**
 * Get the tag associated with a commit sha.
 *
 * @param {string} gitHead The commit sha for which to retrieve the associated tag.
 *
 * @return {string} The tag associatedwith the sha in parameter or `null`.
 */
async function gitCommitTag(gitHead) {
  try {
    const shell = await execa('git', ['describe', '--tags', '--exact-match', gitHead]);
    debugShell('Get git commit tag', shell, debug);
    return shell.stdout;
  } catch (err) {
    debug(err);
    return null;
  }
}

/**
 * Verify if the commit `sha` is in the direct history of the current branch.
 *
 * @param {string} sha The sha of the commit to look for.
 *
 * @return {boolean} `true` if the commit `sha` is in the history of the current branch, `false` otherwise.
 */
async function isCommitInHistory(sha) {
  const shell = await execa('git', ['merge-base', '--is-ancestor', sha, 'HEAD'], {reject: false});
  debugShell('Check if commit is in history', shell, debug);
  return shell.code === 0;
}

/**
 * Unshallow the git repository (retriving every commits and tags).
 */
async function unshallow() {
  await execa('git', ['fetch', '--unshallow', '--tags'], {reject: false});
}

/**
 * @return {string} the sha of the HEAD commit.
 */
async function gitHead() {
  try {
    const shell = await execa('git', ['rev-parse', 'HEAD']);
    debugShell('Get git head', shell, debug);
    return shell.stdout;
  } catch (err) {
    debug(err);
    throw new Error(err.stderr);
  }
}

module.exports = {gitTagHead, gitCommitTag, isCommitInHistory, unshallow, gitHead};
