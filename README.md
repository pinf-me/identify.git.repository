identify.git.repository
=======================

Uniquely identify a [git](https://git-scm.com/) repository by hashing the commit hashes of the first 3 commits.


Usage
-----

### Install

    npm install -g identify.git.repository

### CLI

    cd <GitRepository>

    identify.git.repository from .git > identity.json

    cat identity.json

### Example **identity.json**

```
{
    "id": {
        "canonical": "a70b21d6146f9a555699e9257a5a2b0a99207f63",
        "aliases": [
            "git@github.com:pinf-me/identify.git.repository.git"
        ]
    }
}
```


License
-------

[Open Software License v3.0](https://opensource.org/licenses/OSL-3.0)
