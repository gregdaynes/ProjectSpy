Configuration
===

Sometimes we need more than states of Backlog, In Progress and Done. This warrants a way to configure the application to allow for extra columns (maybe Inbox and Blocked). 

This could also lead to things like theming, and customizing buttons / names of things (replacing ProjectSpy in the header with the Project's actual name).


What should be used for the configuration?
---

ES Module? JSON? CSON? KDL? TOML?
To keep dependencies minimal (which, they aren't currently, so this is kinda moot). Why not keep it JSON?
with import assertions eg `import pkg from '../package.json' with { type: 'json' }`

---

2024-12-30 04:30	Created task
2024-12-30 05:41	Updated task
2024-12-30 06:03	Moved task to done
