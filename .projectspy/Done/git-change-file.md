!! Git file actions can make the system out of sync
===

There seems to be a case, where moving task files and then discarding local changes in git can cause the filesystem watcher to not catch the change
