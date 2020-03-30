# Introduction
This is a simple script that I wrote to download and rename the notes, according to the subject and the date for easy navigation purposes, which are uploaded to [PSIT Portal](https://erp.psit.in/) for the lockdown due to COVID-19.

# What you need to do?
Download the repo, or clone it using the following command:
```
```
Install the dependencies using:
```
yarn install
```
or
```
npm install
```

After this head to index.js folder, and look for the following lines:
```
const username = "18164102**";
const password = "****";

const subjectCodeMap = {
    'KAS-402': 'Maths',
    'KCS-401': 'OS',
    'KCS-402': 'Automata',
    'KCS-403': 'Microprocessor',
    'KNC-401': 'Cyber Security',
    'KVE-401': 'Human Values'
};
```
Replace username with your roll number and password with your password. Add The subject code of your stream to `subjectCodeMap` object. (NOTE: Make sure the subject code are in exact format as in the current code, i.e., all in CAPS and with a hyphen- in between, also everything is case sensitive).

Run the code with:
```
node index.js
```

The files will be downloaded in `./downloads` directory.