# শুধু কাজের Oxly Writer

সাইট খুললেই ব্যবহারকারী সরাসরি কাজের জায়গায় যাবে। লগইন করা থাকলে Drafts, না থাকলে Login দেখাবে। বর্তমান লেখার editor, draft তৈরি, chat refinement, voice profile, settings এবং API key panel অপরিবর্তিতভাবে থাকবে।

## পরিবর্তন

1. হোম পেজের সব প্রচারণামূলক অংশ, demo copy, comparison, steps, roadmap, free-plan লেখা, FAQ এবং article teaser সরানো হবে।
2. `/` খুললে session অনুযায়ী `/app/drafts` অথবা `/auth`-এ পাঠানো হবে।
3. Blog-এর public navigation ও অপ্রয়োজনীয় public header/footer সরানো হবে; কাজের জায়গার sidebar-ই মূল navigation থাকবে।
4. Settings থেকে “Everything is free” feature-list অংশ সরানো হবে; account ও API key panel থাকবে।
5. Login page-এর অতিরিক্ত বিক্রয়ধর্মী বাক্য ছোট করে শুধু প্রয়োজনীয় sign-in/sign-up interface রাখা হবে।
6. Draft list ও editor-এর সাহায্যকারী লেখা শুধু যেখানে ব্যবহার বুঝতে দরকার সেখানেই রাখা হবে।

## যা থাকবে

- Draft তৈরি, edit, delete ও status filter
- Post, thread ও article format
- Chat দিয়ে লেখা refine এবং accept/reject
- Voice profile তৈরি ও edit
- Source যোগ করা
- Share link, copy ও বর্তমান publish behavior
- Account settings ও API key যোগ/দেখা/মোছা

## কারিগরি দিক

- `src/routes/index.tsx`-কে session-aware redirect route করা হবে।
- `src/routes/auth.tsx`, app settings এবং প্রয়োজনমতো drafts interface-এর copy সংক্ষিপ্ত করা হবে।
- সরানো public page বা link-এর সব references পরিষ্কার করা হবে, generated route file হাতে পরিবর্তন করা হবে না।
- Desktop ও mobile-এ login, drafts এবং editor flow পরীক্ষা করা হবে।
