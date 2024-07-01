Structure
=========

Currently the system operates on markdown in specific folders. If we were to change
that, another option could be:

1) A list of files in a folder. Each file containing frontmatter with the information
about the ticket such as status or owner. This could have more structure like
dedicated title and description fields, but then what would be the point - why not
YML files instead?

2) Stick with markdown, and use very select amount of data for processing. Like only process first line, and first line after first empty line - like git, but allowing for the markdown header syntax of === / --- under the first line.


