Filtering
===

A form field to quickly filter tasks that contain the word/phrase.

It would be nice to have this be full text search with fuzzy matching but that would require building an inverted index, and shipping a stemmer to the frontend, or make a bunch of requests back and forth (which could be fine).

Quick Solution
---

1) Backend takes the lanes data objects, and reduces them to a "queryable" json object" (string we'll call includes on). [[string, filename], [string, filename]] should suffice.
2). Write json object to the body of the rendered document
3). Each task should have the filename as the id, or a slugified version?
4). Typing into text field filters the object and hides all tasks whose file names aren't returned
5). clearing the filter, shows all tasks again

---

2024-12-23 22:16	Created task
2024-12-27 06:09	Updated task
2024-12-27 06:09	Moved task to in-progress
2024-12-27 06:36	Updated task
2024-12-27 06:36	Moved task to done
