We need some sort of image attachment system.

I was thinking we could use base64 encoded images appended to the file, but that might get a bit weird for people. Alternatively we have a file attachments folder and name them with a uuid/ulid and use that name in the ticket?.

---

Inlined base64 won't work. a 4k screenshot is 1.1mb before encoding, that makes the markdown file too big

SQLite stored blobs won't work. there will be merge conflicts anytime someone adds a file

---

/attachements/uuid (or something)

then in the markdown as a link. These can be rendered as links safely.
the server reading them will need to use mime-type checking but will mostly be unsafe.

Downsides, can't see attachments inline.

Could write a custom parser to load the link and render a thumbnail
We could render them in iframes?

```
---

attachements:

[abc](/attachements/abc-123)
[abc](/attachements/abc-123)
[abc](/attachements/abc-123)
```
