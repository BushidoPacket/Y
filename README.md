README

# Y social media app

This project has been created as a college credit project but contains a lot more content and functionality than expected for a credit project. Main goal of this project has been to make some deeper connections with used technologies.

Technologies used: MERN stack - MongoDB (Mongoose), Express js, React js, Node js

Requests to run this project:

Install back-end packages
```
cd .\api\
npm i
```
Install front-end packages
```
cd ..
cd .\Y-front-end\
npm i
```
Key locations:
> in Y-front-end/components is component Addressables.jsx to store API address, which is being used in every call
> 
> in api should be created .env file with custom JWT_SECRET key value
> 
> api/\_\_tests\_\_ contains unit tests for most crucial functions in server.js + rate limit testing + testing auth.js


## App functions
App is aimed to be a "cheap copy" of popular social media X (or Twitter, for people who are not Elon Musk). 
It has very basic structure - feed with posts, comments, account registration and search engine. 

Back-end and DB are being protected by JWT authorization system. Every sensitive call requests authorization token, which must be valid in order to get/post data.

Back-end on its own is also protected by rate limits to simulate a real app and prevent from request spam (but mainly aimed against automatic systems).

Auth.js is also completely custom made. It's possible there could be a better solution for some parts, who knows...

Front-end is made in Vite/React, code is sorted into components and routes, meanwhile everything is commented to maintain readibilty of the code.

Except usage of API calls, front-end is using React hooks and some custom hooks to automatically load content based on conditions, preventing from calling api endpoints for nonsense requests (reloading everything because of 1 addition and such), providing easy UI for user to write, edit and delete posts and comments, swap profile pictures, check personal informations and search through available content.

All of the API calls are being handled on both front and back end to authorize an user and keep some informational UI what user can and can't do. 

## Sources
React, Express and MongoDB documentation







