!!! Task file structure and parsing [filetree][task-parser]
===========================================================

Revisit the existing task file parsing, organization.

Ideally a structure and parsing strategy is devised, selected, and implemented.


Requirements
------------

- [x] Definition of Task - settle on a name
- [x] Defintiion of a task file strucure
- [x] Implement reasonably performant data structure
- [x] Tested


Tasks
-----

### Define Task & File Structure

Goals for the file structure

- Easy to write in plain text
- Semi-structured header of document
- Include urgency system
- Support tags
- extendensible in the future (don't make it rigid)
- Has created and modified timestamps
- Support for common sorting

Easy to write pretty much means Markdown in my eyes. Even without following the heading syntax, you can get pretty far (list and paragraphs).

To avoid parsing each file to get data out of it, read the first few lines of a file.

Additionally, users of this application will likely be familiar with Git and commit messages. Using the format of Line 1 being the Commit Name and the message the rest of the file.

Example of file

```
(3) # This is the Title of the Task!!! [example-task]
=====================================================

This is a description of the task.

This is the body, and is not parsed initially
```


#### Titles

Task titles should be based on the first line of the file not the file name.

#### Description

The first line following the first empty line should be considered the description or introduction of the task. Making it the first line after the first empty line, allows the use of the hyphen/equal sign heading syntax in markdown.

#### Urgency

Like emails, if you prefix the subject with 0-3 exclamation marks, it can set it's priority.

When parsing the title, count the bangs. Use the count to create an information label for the UI to render, and provide ordering beyond dates.

Configuration can have an array of words to define the priorties - ['Normal', 'Priority', 'High Priority', 'Urgent']

How does it handle the going beyond 3 !!!? 4+ could add the extra marks onto the greatest title. Creating `Urgent!`, `Urget!!` etc. If the user has that many urgency levels, the want a way to manage individual task order. Maybe that can be done as another extension to the syntax.


#### Tags

[tag1][tag2][tag3] somewhere in the first line of the file contents.


#### Timestamps

The host system should have timestamps available.


#### Sorting

Specific sort order could be denoted with (0) (1) (3) in the first line.

Data to sort on
Title, Urgency, Tag, Date Created, Date Modified and Manual Order

Default sort should be:

1. Urgency
2. Manual Order
3. Date Modified


### Parsing Strategy

Read each line of the file starting with first, until reaching the first line after the first empty line.

Store the first line which is the title, and the last line which is the description.

There are definitive bounds around each of the meta annotiations in the title, regex should work.

Note: the data to be in the final rendering should not have the annotations.


### Data Structure

A class makes sense.

Initialze with the filePath, readline until conditions met, set property for title and description, filename, dates created and modified, priority, tags, manual order

Please write tests for this.
