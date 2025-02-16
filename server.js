require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const i18n = require('i18n');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const Event = require('./models/Event');

const app = express();

// Middleware
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Configure i18n
i18n.configure({
  locales: ['en', 'fr'],
  defaultLocale: 'fr',
  directory: path.join(__dirname, 'locales'),
  objectNotation: true,
  cookie: 'lang'
});

app.use(i18n.init);

// Pass current locale to all views
app.use((req, res, next) => {
  res.locals.currentLocale = req.getLocale();
  next();
});

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/eventDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Define Event Schema and Model
// const eventSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   slug: { type: String, required: true, unique: true },
//   allowGuests: { type: Boolean, default: false },
//   password: { type: String, required: true },
//   attendees: [{
//     email: String,
//     guestNumber: { type: Number, default: 0 },
//     going: Boolean
//   }]
// });

// const Event = mongoose.model('Event', eventSchema);

function generateMasterPassword(){
    return Math.random().toString(36).slice(-8);
}

function slugify(text) {
  return text.toString().toLowerCase().trim().replace(/[^\w]+/g, '-');
}

// Middleware to validate master password
const validateMasterPassword = async (req, res, next) => {
  const { password } = req.body;
  const { slug } = req.params;

  try {
    console.log('Validating password for event:', slug);
    const event = await Event.findOne({ slug: slug });

    if (!event) {
      console.log('Event not found:', slug);
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.password !== password) {
      console.log('Invalid password for event:', slug);
      return res.status(401).json({ error: 'Invalid password' });
    }

    req.event = event;
    next();
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({ error: 'Error validating password: ' + error.message });
  }
};

// Routes
// Admin Home view
app.get('/', async (req, res) => {
  try {
    res.render('home', { masterPassword: null });
  } catch (err) {
    console.error('❌ Error loading home page:', err.message);
    res.status(500).send('Error loading home page: ' + err.message);
  }
});

// Get list of events for a given password
app.post('/event/list', async (req, res) => {
  const { password } = req.body;

  try {
    if (!password) {
      return res.json([]); // Return empty list if no password
    }

    const events = await Event.find({ password: password });
    res.json(events);
  } catch (error) {
    console.error('Error listing events:', error);
    res.status(500).json({ error: 'Error listing events: ' + error.message });
  }
});

// Create new event
app.post('/event', async (req, res) => {
  try {
    const { name, allowGuests, password } = req.body;
    console.log('📝 Creating new event:', { name, allowGuests });

    // Generate a URL-friendly slug from the event name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + 
      '-' + Math.floor(Math.random() * 100);

    // Use existing password or generate a new one
    const eventPassword = password || generateMasterPassword();

    const event = new Event({
      name,
      slug,
      password: eventPassword,
      allowGuests: allowGuests || false,
      attendees: []
    });

    await event.save();
    console.log('✅ Event created successfully:', { slug });

    // Only send back the password if it was newly generated
    res.json({
      success: true,
      masterPassword: password ? undefined : eventPassword
    });
  } catch (error) {
    console.error('❌ Error creating event:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error creating event: ' + error.message 
    });
  }
});

// Delete event (only if no attendees exist)
app.post('/event/:slug/delete', async (req, res) => {
  try {
    const { password } = req.body;
    console.log(`🗑️ Attempting to delete event: ${req.params.slug}`);
    
    const event = await Event.findOne({ slug: req.params.slug, password: password });
    
    if (!event) {
      console.log('❌ Delete failed: Unauthorized or event not found');
      return res.status(403).send('Unauthorized or event not found');
    }
    
    if (event.attendees && event.attendees.length > 0) {
      console.log('❌ Delete failed: Event has attendees');
      return res.status(400).send('Cannot delete event with attendees');
    }
    
    await Event.findOneAndDelete({ slug: req.params.slug });
    console.log('✅ Event deleted successfully');
    res.status(200).send('Event deleted successfully');
  } catch(err) {
    console.error('❌ Error deleting event:', err.message);
    res.status(500).send('Error deleting event: ' + err.message);
  }
});

// Remove an attendee from an event
app.post('/event/:slug/remove-attendee', validateMasterPassword, async (req, res) => {
  const { email } = req.body;
  const event = req.event; // From middleware

  try {
    event.attendees = event.attendees.filter(a => a.email !== email);
    await event.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Error removing attendee:', error);
    res.status(500).json({ error: 'Error removing attendee' });
  }
});

// Delete an event
app.post('/event/:slug/delete', validateMasterPassword, async (req, res) => {
  const event = req.event; // From middleware
  console.log('Attempting to delete event:', {
    slug: req.params.slug,
    eventId: event._id,
    hasAttendees: event.attendees && event.attendees.length > 0
  });

  try {
    if (event.attendees && event.attendees.length > 0) {
      console.log('Cannot delete - event has attendees:', event.attendees.length);
      return res.status(400).json({ error: 'Cannot delete event with attendees' });
    }

    console.log('Deleting event with slug:', event.slug);
    const result = await Event.findOneAndDelete({ slug: event.slug });
    
    if (!result) {
      console.log('Event not found for deletion:', event.slug);
      return res.status(404).json({ error: 'Event not found' });
    }

    console.log('Event deleted successfully:', event.slug);
    res.json({ success: true });
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      eventId: event._id,
      slug: event.slug
    });
    res.status(500).json({ error: 'Error deleting event: ' + error.message });
  }
});

// Toggle allow guests
app.post('/event/:slug/toggle-allow-guests', validateMasterPassword, async (req, res) => {
  try {
    const { allowGuests } = req.body;
    const event = req.event; // From middleware

    console.log(`🔄 Toggling allowGuests for event ${event.slug} to ${allowGuests}`);
    
    event.allowGuests = allowGuests;
    await event.save();
    
    console.log('✅ Successfully updated allowGuests setting');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error toggling allow guests:', error);
    res.status(500).json({ error: 'Error updating event: ' + error.message });
  }
});

// Update event name
app.post('/event/:slug/update-name', validateMasterPassword, async (req, res) => {
  try {
    const { name } = req.body;
    const event = req.event; // From middleware

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Event name cannot be empty' });
    }

    console.log(`✏️ Updating name for event ${event.slug} to "${name}"`);
    
    event.name = name.trim();
    await event.save();
    
    console.log('✅ Successfully updated event name');
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Error updating event name:', error);
    res.status(500).json({ error: 'Error updating event: ' + error.message });
  }
});

// Show attendance form for yes and no
app.get('/event/:slug/:response(yes|no)', async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug });
    if (!event) {
      return res.status(404).send('Event not found');
    }
    if (req.params.response === 'yes') {
      res.render('event_yes', { event, submitted: false });
    } else {
      res.render('event_no', { event, submitted: false });
    }
  } catch(err) {
    console.error('❌ Error retrieving event:', err.message);
    res.status(500).send('Error retrieving event: ' + err.message);
  }
});

// Handle attendance submission
app.post('/event/:slug/:response(yes|no)', async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug });
    if (!event) {
      return res.status(404).send('Event not found');
    }
    const { email, guestNumber } = req.body;
    const going = (req.params.response === 'yes');
    
    // Check if attendee already exists
    const existing = event.attendees.find(a => a.email === email);
    if (existing) {
      existing.going = going;
      if(going && event.allowGuests && guestNumber !== undefined) {
          existing.guestNumber = Number(guestNumber);
      }
    } else {
      event.attendees.push({
         email,
         guestNumber: going && event.allowGuests ? Number(guestNumber) : 0,
         going
      });
    }
    
    await event.save();
    console.log(`✅ Attendance recorded for ${email} at ${event.name}`);
    
    // Render the appropriate template with submitted=true
    if (going) {
      res.render('event_yes', { event, submitted: true });
    } else {
      res.render('event_no', { event, submitted: true });
    }
  } catch(err) {
    console.error('❌ Error recording attendance:', err.message);
    res.status(500).send('Error recording attendance: ' + err.message);
  }
});

// Show event stats
app.get('/event/:slug/stats', async (req, res) => {
  try {
    const event = await Event.findOne({ slug: req.params.slug });
    if (!event) {
      return res.status(404).send('Event not found');
    }

    // Calculate stats
    const going = event.attendees.filter(a => a.going);
    const notGoing = event.attendees.filter(a => !a.going);
    const totalGuests = going.reduce((sum, a) => sum + (a.guestNumber || 0), 0);
    const totalResponses = event.attendees.length;
    
    const stats = {
      going: going.length,
      notGoing: notGoing.length,
      totalGuests,
      totalAttending: going.length + totalGuests,
      totalResponses,
      responseRate: totalResponses > 0 ? Math.round((going.length / totalResponses) * 100) : 0
    };

    console.log(`📊 Showing stats for event: ${event.name}`);
    console.log(`✓ Going: ${stats.going} (+${stats.totalGuests} guests)`);
    console.log(`✗ Not Going: ${stats.notGoing}`);
    console.log(`📈 Response Rate: ${stats.responseRate}%`);

    res.render('event_stats', { event, stats });
  } catch (err) {
    console.error('❌ Error showing event stats:', err.message);
    res.status(500).send('Error showing event stats: ' + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
