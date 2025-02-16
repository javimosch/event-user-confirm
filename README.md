# Event User Confirm

A modern, multilingual event attendance management system built with Node.js, Express, and MongoDB.

## 🚀 Quick Start

```bash
# Create a new directory for your event system
mkdir my-event-system && cd my-event-system

# Run the system (this will set up everything automatically)
npx -y event-user-confirm
```

Visit `http://localhost:3000` to start managing your events!

## ✨ Features

- 🌍 Multilingual Support (English/French)
- 🔐 Secure Master Password System
- 📊 Real-time Attendance Tracking
- 👥 Guest Management
- 🎨 Modern UI with Tailwind CSS
- 📱 Mobile-Responsive Design
- 🔄 Dynamic URL Generation
- 📈 Event Statistics

## 🛠️ Technical Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Template Engine**: EJS
- **Styling**: Tailwind CSS
- **Internationalization**: i18n
- **Session Management**: express-session
- **Database ODM**: Mongoose

## 💡 Usage

### Creating Events

1. Set your master password
2. Create an event with a name
3. Toggle guest allowance if needed
4. Share the generated URLs with attendees

### Managing Events

- 📝 Edit event names
- ✅ Track attendance
- 👥 Manage guest numbers
- 🗑️ Remove attendees
- 📊 View event statistics

### Security Features

- 🔑 Per-event master passwords
- 🔒 Secure attendance management
- 🛡️ Protected admin actions

## 🔧 Configuration

The system automatically configures:
- MongoDB connection (default: mongodb://localhost:27017/eventDB)
- Server port (default: 3000)
- Language settings (default: French)

## 📦 What's Included

- Complete server setup
- Database models and schemas
- Multilingual templates
- Admin interface
- Attendance tracking system
- CSS styling with Tailwind

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request to the [GitHub repository](https://github.com/javimosch/event-user-confirm).

## 📝 License

ISC License

## 🙏 Credits

Created by [Your Name] - A simple solution for event attendance management.

## 🆘 Support

For issues and feature requests, please use the [GitHub issues page](https://github.com/javimosch/event-user-confirm/issues).
