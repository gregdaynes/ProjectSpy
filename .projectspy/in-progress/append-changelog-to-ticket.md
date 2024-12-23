track tickets changes with a changelog.
===

Timestamp and message format appended to the file. Separate from the actual ticket contents with a rule `---`.

```
---

2024-12-22 08:00    Created
2024-12-22 08:01    Changed
2024-12-22 08:01    Moved to in-progress
2024-12-22 08:01    Changed
2024-12-22 08:01    Moved to done
2024-12-22 08:01    Archived
```

Couples a few things with file writing though, even if the action doesn't require it. Best to abstract out reading the last line of a file, matching it to the format date\tmessage

It would be nice to have the file watcher also perform the file write but not re-triggering itself, but I think that's would be more complicated to write reliably than doing it in place with the actual operations