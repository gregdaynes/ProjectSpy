Task Display
============

Task titles should be based on the first line of the file not the file name.
This introduces a bit of overhead because now we have to parse each file on load
and every render. Maybe there is a better solution?

It would be cool to also include the first paragraph with the card as a preview
of the contents.

Maybe even include a count of subtasks.

All of this sounds expensive to process on every page load, especially if a project
goes on for a long time. We should establish our desired start time, and then
benchmark the amount of files it would take to surpass the limit.

If performance is really bad (slow start with few files) we should consider other
file formats than markdown. YML would be my next perferred because it's easy to
hand write. JSON is another option, but I'd consider using editor.js at that point
and forgo the idea of being able to use my editor to update tickets if I didn't want
to start the app.
