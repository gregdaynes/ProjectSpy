(0) Decide on Templating and Component development process!!! [dev][components][webc]
=============================================================

Description
---

WebC is proving to be a difficult system to extend and construct the application
with. I enjoy the single file component approach, I feel that there are room for
improvements that I can't make at the moment. An alternative approach should be
devised and implemented that will function as a solid framework for building
interactive UIs for apps, while adhering to an HTML + CSS first with progressive
enhancement where necessary.

What
---

It should be simple, but have a basic set of logic operations.
It could have an api can be extended to process custom operations
It should not impact future usage of web components.
It could have support from Fastify/View to save on custom code

How
---

Nunjucks was fine, but we replaced it with WebC because it was similar but gave
us the SFC style components. We could revisit Nunjucks, but it was a bit clunky
with using macros for the components.

LiquidJS is an option. It's more simple, but is familiar with both work from
Shopify and Jekyll. It is supported through @fastify/view which is a nice bonus.

ETA is a another option. I have experience with it and it's been pretty good. I
had thought of migrating another project from eta to nunjucks, but after using
its macro system, I don't think its worth it.


## Decision Outcome

Chosen option: ETA JS, because it's simple, fast and works. The syntax is slightly different than JS, the `it` property can be removed in configuration (but it's fine), and erb/ejs style tags are acceptable.

### Positive Consequences

* Simplify development through long standing traditions of view files and assets.
* no compiler step outside of the view rendering

### Negative Consequences

* Not a single file component

## Pros and Cons of the Options

### WebC

Provides Web Components written as a single file.

* Good, because the writing single file components is great dx.
* Good, because the basic logic operations are enough to work with.
* Good, because it collects css + js with minimal processing allowing for post
        processing.
* Bad, because functions need to be done in a special script block on the first
       template in the tree.
* Bad, because it _seems_ to perform slowly.
* Bad, because the lack to template or layouts is frustrating. This may be user
       error, but I didn't see a way in the docs.
* Bad, trying to debug certain things was a challenge, the code is not easy to
       follow.

### Nunjucks

Popular templating processor that's been around a long time

* Good, because its well supported and stable
* Good, because it provides a good templating syntax
* Good, because it supports multiple directories to find files in.
* Bad, because macros are clumsy

### ETA JS

Fast templating processor with a similar syntax to ERB and other template
syntaxs.

* Good, because it's very fast
* Good, because I have a decent amount of experience with it
* Bad, because ?

### Liquid JS

Liquid markup language from Shopify, simple but complete library.

* Good, because it seems ubiqutus these days
* Good, because it's ok for performance
* Good, becuase It can be extended easily through plugins
* Good, because I've been writing it for many years
* Bad, because passing data around is clumbsy
