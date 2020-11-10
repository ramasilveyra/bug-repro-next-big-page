# bug-repro-next-big-page

Bug repro of next.js problem with pages with many files.

**Still in progress, problem is not reproducible yet.**

## Bug

Pages that takes more than 2-3 minutes to compile in development return 404 not found.

### Leads

webpack emit compiler hook is never executed in this case.

So PagesManifestPlugin never updates the pages manifest file that maps routes to page files.

https://github.com/vercel/next.js/blob/9cda047f0e5daec7ece4280739e646acbcb327a6/packages/next/build/webpack/plugins/pages-manifest-plugin.ts#L74-L76

### Tool to try to repro

Execute this command to add all the versions of a module to the next.js page.

```
$ node tools/add-deps.js <module name>
```
