## TODO:

```md
    1. CRUD
    2. Support for adding number of views on a blog.
    3. Support for Soft delete.
    4. Add support for comments in blog.
    5. Remove abusive words.
    6. Store IP address of user when creating blog and comments.
    7. For views, users can see views based on ip address.
    8. A particular IP can't view a particular blog more than 10 times.
    9. Implement Rate Limiting on creating and commenting blogs.
```

## IDEA:

```TS
  1. A user sign-up/ sign-in.

  2. Users can see the list of all the blogs. "/blogs",

  // Rate LIMITING.
  3. User can click any blog.
    3.1. server needs to check whether the user has viewed that blog for 10 times.
    3.2. Check If the blog_user_id is present. Else Create.
    3.3. If `<= 10` then allow. Else Block.
    3.4. Update the views of the current blog.
    3.5. Update the views for the Viewer in the Views collection.
    3.6. If the blog is his own blog. Then no need for restricting the views.

  4. User can reply to blogs.
    4.1. Each user can reply up to 10 times to a blog.
    4.2. If exceed, block.

  5. User can Post, Edit, Delete blogs. "POST /blogs", "PATCH /blogs:slug", " DELETE /blogs:slug".

  6. While Posting a blog,
    6.1. Abusive words need to be removed.
    6.2. Slug needs to be implemented.
    6.3. If there is a slug present. Add a id at the end for unique.
```
