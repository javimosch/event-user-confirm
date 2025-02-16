A nodejs app (express, ejs, tailwind, mongodb, mongoose) using dotenv for configuration. The goal is to allow event owners to share links so event participants can confirm attendance yes/no.

## Views

## Home (/) (Admin view) (Auth required)

The event owner can manage events in this view

### Create event form

- Event name field
- Allow multiple users per attendance (checkbox) (allowGuests field in DB)
- Event name URL friendly path (compute on the fly) (slug field in DB)
- If no master password is set in localstorage, we send null and the server computes one for us and it send it back in the response (We store it in localstorage)

### Event list

### Master password section

- Events have a password field (required) in DB
- The server returns a master password (hash) to the client once the first event is created
- The master password is stored in local storage and used to retrieve the event list
- The master password is shown to the user (not ofuscated) with label "This is the master password to manager your events, keep it safe!"
- There is a set master password button that prompts the user for the master password and fetch events again
- Rule: Do not put the password in the URL


#### Event list item

- Event name
- Event path (slug)
- Event link to confirm attendance for "yes"
- Event link to confirm attendance for "no"
- Action: Remove button (delete event) (Validate and prevent deletion if attendees exist)

### Event attendance yes URL (dynamic) (/event/:eventPath/yes)

- Email field
- (if allowGuests) Guest number field "Other people coming with you?" (default 0)
- Submit button

Rules:
- Save to DB in the same document as the event:
Event
 - attendes array [{
    email: String,
    guestNumber: Number,
    going: Boolean
 }]

### Event attendance no URL (dynamic) (/event/:eventPath/no)

- Email field
- Submit button

Rules:
- Same as attendance yes

## Rules

- If an email is used twice to confirm yes/no for an attendance, the document should update the going field to true/false and match by attendee email