File Watching & Reload
======================

When a file is changed on disk, the application restarts. This is because of the Fastify CLI flag -w being enabled.
We should ignore the configured `.projectspy` directory from the watch list.

We must implement a solution that updates the fileTree whenever a file is changed.

