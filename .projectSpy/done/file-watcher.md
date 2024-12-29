File Watching &amp; Reload
==========================

When a file is changed on disk, the application restarts. This is because of the Fastify CLI flag -w being enabled.

We should ignore the configured <code>.projectspy</code> directory from the watch list.
We must implement a solution that updates the fileTree whenever a file is changed.
